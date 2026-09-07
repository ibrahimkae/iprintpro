import Tesseract from 'tesseract.js';
import { logger } from './logger';

export const performOCR = async (imageSrc: string, language: string = 'tur+eng'): Promise<string> => {
  logger.info(`Starting local OCR with language: ${language}`);
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageSrc,
      language,
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            // Optional: can emit progress here
          }
        }
      }
    );
    logger.info('OCR completed successfully');
    return text;
  } catch (error) {
    logger.error('OCR failed', error);
    throw error;
  }
};
