import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class OcrService {
  async extractText(filePath: string, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      // Verifica se o arquivo é um PDF
      if (filePath.endsWith('.pdf')) {
        const outputImagePath = './uploads/output.png';

        console.log('Convertendo PDF para imagem usando ImageMagick...');
        // Usa ImageMagick para converter PDF em imagem
        const command = `magick convert -density 300 "${filePath}" -quality 75 "${outputImagePath}"`;
        await execPromise(command);

        // Verifica se o arquivo de saída foi criado
        if (!fs.existsSync(outputImagePath)) {
          throw new Error(`Falha ao converter PDF. O arquivo de saída não foi gerado: ${outputImagePath}`);
        }

        console.log('PDF convertido com sucesso para:', outputImagePath);
        filePath = outputImagePath; // Atualiza o filePath para o caminho da imagem gerada
      }

      // Processa OCR com Tesseract.js
      console.log('Iniciando OCR no arquivo:', filePath);
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text' && progressCallback) {
            progressCallback(info.progress);
          }
        },
      });

      return data.text;
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      throw new Error('Erro ao extrair texto do documento');
    }
  }
}
