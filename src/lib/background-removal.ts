import { removeBackground as imglyRemoveBackground, Config } from '@imgly/background-removal';
import { logger } from './logger';

/**
 * Background Removal Utility - Local AI Powered
 */
export async function removeBackground(dataUrl: string): Promise<string> {
  logger.info('Starting local AI background removal');
  try {
    const config: Config = {
      output: {
        format: 'image/png',
        quality: 0.8
      },
      debug: false
    };

    const blob = await imglyRemoveBackground(dataUrl, config);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    logger.error('AI Background removal failed, falling back to simple method', error);
    return simpleRemoveBackground(dataUrl);
  }
}

async function simpleRemoveBackground(dataUrl: string, threshold: number = 30): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const rTotal = data[0] + data[(canvas.width-1)*4] + data[(canvas.height-1)*canvas.width*4];
      const targetR = rTotal / 3;
      // ... simplified logic for fallback
      for (let i = 0; i < data.length; i += 4) {
        const distance = Math.abs(data[i] - targetR);
        if (distance < threshold) data[i + 3] = 0;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}
