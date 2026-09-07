import { toPng, toCanvas } from 'html-to-image';

export interface CaptureOptions {
  scale?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

/**
 * Modern DOM-to-Image capture utility that natively supports OKLCH colors,
 * CSS variables, SVG barcodes, QR codes, and custom thermal paper styling.
 */
export async function captureElementToDataUrl(
  element: HTMLElement,
  options?: CaptureOptions
): Promise<string> {
  const pixelRatio = options?.scale ?? 1;
  const backgroundColor = options?.backgroundColor ?? '#ffffff';

  // Small delay to allow any dynamic SVG barcodes / QR canvas renders to settle
  await new Promise((resolve) => setTimeout(resolve, 40));

  // Determine explicit dimensions from target or its main thermal-container child
  const thermalChild = element.querySelector('.thermal-container') as HTMLElement | null;
  const captureTarget = thermalChild || element;
  
  const width = options?.width || captureTarget.offsetWidth || (captureTarget.style.width ? parseInt(captureTarget.style.width, 10) : undefined);
  const height = options?.height || captureTarget.offsetHeight || (captureTarget.style.height ? parseInt(captureTarget.style.height, 10) : undefined);

  try {
    const dataUrl = await toPng(captureTarget, {
      pixelRatio,
      backgroundColor,
      cacheBust: true,
      skipAutoScale: false,
      width,
      height,
      canvasWidth: width ? width * pixelRatio : undefined,
      canvasHeight: height ? height * pixelRatio : undefined,
      filter: (domNode) => {
        // Exclude unwanted UI elements if any marked with data-capture-ignore
        if (domNode instanceof HTMLElement && domNode.dataset.captureIgnore) {
          return false;
        }
        return true;
      }
    });

    if (dataUrl && dataUrl.length > 200 && dataUrl !== 'data:,') {
      return dataUrl;
    }
    throw new Error('toPng returned empty or invalid data');
  } catch (err) {
    console.warn('html-to-image toPng failed or empty, attempting toCanvas fallback:', err);
    const canvas = await toCanvas(captureTarget, {
      pixelRatio,
      backgroundColor,
      cacheBust: true,
      width,
      height
    });
    return canvas.toDataURL('image/png');
  }
}

