import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from '../ocr/ocr.service'; // Importe o serviço OCR


@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, OcrService], // Inclua o OcrService
})
export class DocumentsModule {}
