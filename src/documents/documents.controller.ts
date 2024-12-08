import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Query,
  Param,
  Res,
  Sse,
  MessageEvent,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { OcrService } from '../ocr/ocr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import OpenAI from 'openai';
import { Subject, Observable } from 'rxjs';

@Controller('documents')
export class DocumentsController {
  private progressSubject = new Subject<MessageEvent>();
  private openai: OpenAI;

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ocrService: OcrService,
  ) {
    // Configuração do cliente OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      throw new BadRequestException('Invalid userId. Must be a valid number.');
    }

    const user = await this.documentsService.findUserById(userIdNumber);
    if (!user) {
      throw new BadRequestException(
        `User with ID ${userIdNumber} does not exist.`,
      );
    }

    const document = await this.documentsService.saveDocumentMetadata({
      filename: file.filename,
      filepath: file.path,
      userId: userIdNumber,
      extractedText: '',
    });

    this.progressSubject.next({ data: 'Starting OCR process...' });

    const extractedText = await this.ocrService.extractText(file.path, (progress) => {
      this.progressSubject.next({
        data: `OCR Progress: ${Math.round(progress * 100)}%`,
      });
    });

    this.progressSubject.next({ data: 'OCR completed' });

    await this.documentsService.updateDocumentText(document.id, extractedText);

    // Chamar o LLM para processar o texto extraído
    const gptResponse = await this.openai.completions.create({
      model: 'gpt-4',
      prompt: `Analyze the following extracted text and provide insights: "${extractedText}"`,
      max_tokens: 200,
    });

    const insights = gptResponse.choices[0]?.text?.trim() || '';

    return { ...document, extractedText, insights };
  }
}
