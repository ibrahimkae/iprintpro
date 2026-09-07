import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeRendererProps {
  value: string;
  size?: number;
  errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  size = 72,
  errorCorrectionLevel = 'M',
  margin = 1,
  className = '',
  darkColor = '#000000',
  lightColor = '#ffffff'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const safeText = value || 'https://termal-sablon.com';

    QRCode.toCanvas(
      canvasRef.current,
      safeText,
      {
        width: size,
        margin: margin,
        errorCorrectionLevel: errorCorrectionLevel as QRCode.QRCodeErrorCorrectionLevel,
        color: {
          dark: darkColor,
          light: lightColor
        }
      },
      (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        }
      }
    );
  }, [value, size, errorCorrectionLevel, margin, darkColor, lightColor]);

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} style={{ width: `${size}px`, height: `${size}px` }} className="image-rendering-pixelated" />
    </div>
  );
};

