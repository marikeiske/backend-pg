import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DocumentMetadata {
  filename: string;
  filepath: string;
  userId: number;
  extractedText: string;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveDocumentMetadata(data: DocumentMetadata) {
    return this.prisma.document.create({
      data: {
        filename: data.filename,
        filepath: data.filepath,
        userId: data.userId,
        extractedText: data.extractedText,
      },
    });
  }

  // Adicione este método para atualizar o texto extraído no banco de dados
  async updateDocumentText(documentId: number, text: string) {
    return this.prisma.document.update({
      where: { id: documentId },
      data: { extractedText: text },
    });
  }

  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getDocumentsByUser(userId: number) {
    return this.prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        filepath: true,
        extractedText: true,
        createdAt: true,
      },
    });
  }  

  async getDocumentById(documentId: number) {
    return this.prisma.document.findUnique({
      where: { id: documentId },
    });
  }  
  
}
