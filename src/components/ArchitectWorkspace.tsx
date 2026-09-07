import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const ArchitectWorkspace = React.memo(({ image, crops, onSync, parentFabricRef }: { image: string, crops: any[], onSync: (updated: any[]) => void, parentFabricRef: React.MutableRefObject<fabric.Canvas | null> }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localFabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!image || !parentRef.current) return;
    
    // Cleanup previous if it exists manually to be safe
    parentRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    parentRef.current.appendChild(canvasEl);
    
    // Precision dimension detection
    const w = parentRef.current.clientWidth || 350;
    const h = parentRef.current.clientHeight || 420;

    const fc = new fabric.Canvas(canvasEl, {
      width: w,
      height: h,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
    });
    
    localFabricRef.current = fc;
    if (parentFabricRef) parentFabricRef.current = fc;

    let isDisposed = false;

    // Load image with absolute reliability
    const imgObj = new Image();
    imgObj.onload = () => {
      if (isDisposed || !fc) return;
      
      const fabricImg = new fabric.Image(imgObj);
      const scale = Math.min(fc.width! / imgObj.width, fc.height! / imgObj.height) * 0.95;
      
      fabricImg.scale(scale);
      fabricImg.set({
        left: (fc.width! - (imgObj.width * scale)) / 2,
        top: (fc.height! - (imgObj.height * scale)) / 2,
        selectable: false,
        hoverCursor: 'default',
        evented: false
      });
      
      fc.add(fabricImg);
      fc.sendToBack(fabricImg);

      // Re-add crops if any exist already
      crops.forEach((zone) => {
        if (!zone.percent) return;
        const rect = new fabric.Rect({
          left: fabricImg.left! + (zone.percent.x * fabricImg.getScaledWidth()) / 100,
          top: fabricImg.top! + (zone.percent.y * fabricImg.getScaledHeight()) / 100,
          width: (zone.percent.width * fabricImg.getScaledWidth()) / 100,
          height: (zone.percent.height * fabricImg.getScaledHeight()) / 100,
          angle: zone.rotation || 0,
          fill: 'rgba(16,185,129,0.2)',
          stroke: '#10b981',
          strokeWidth: 2,
          cornerColor: '#10b981',
          cornerSize: 8,
          transparentCorners: false,
          data: { id: zone.id }
        });
        fc.add(rect);
      });
      fc.renderAll();
    };
    imgObj.src = image;

    const syncHandler = () => {
      const bgImg = fc.getObjects('image')[0] as fabric.Image;
      if (!bgImg) return;
      const updated = fc.getObjects('rect').map(r => {
        const rect = r as fabric.Rect;
        return {
          id: (rect as any).data?.id,
          rotation: rect.angle,
          percent: {
            x: ((rect.left! - bgImg.left!) / bgImg.getScaledWidth()) * 100,
            y: ((rect.top! - bgImg.top!) / bgImg.getScaledHeight()) * 100,
            width: (rect.getScaledWidth() / bgImg.getScaledWidth()) * 100,
            height: (rect.getScaledHeight() / bgImg.getScaledHeight()) * 100
          },
          width: rect.getScaledWidth(), height: rect.getScaledHeight(),
          x: rect.left! - bgImg.left!, y: rect.top! - bgImg.top!
        };
      });
      onSync(updated);
    };

    fc.on('object:modified', syncHandler);
    fc.on('object:added', syncHandler);
    fc.on('object:removed', syncHandler);

    return () => {
      isDisposed = true;
      fc.dispose();
      localFabricRef.current = null;
      if (parentFabricRef && parentFabricRef.current === fc) parentFabricRef.current = null;
      if (parentRef.current) parentRef.current.innerHTML = '';
    };
  }, [image]);

  useEffect(() => {
    const fc = localFabricRef.current;
    if (!fc) return;
    const bgImg = fc.getObjects('image')[0] as fabric.Image;
    if (!bgImg) return;

    const existingIds = fc.getObjects('rect').map(r => (r as any).data?.id);
    const incomingIds = crops.map(c => c.id);
    const needsRedraw = existingIds.length !== incomingIds.length || incomingIds.some(id => !existingIds.includes(id));

    if (needsRedraw) {
      fc.getObjects('rect').forEach(r => fc.remove(r));
      crops.forEach((zone) => {
        if (!zone.percent) return;
        const rect = new fabric.Rect({
          left: bgImg.left! + (zone.percent.x * bgImg.getScaledWidth()) / 100,
          top: bgImg.top! + (zone.percent.y * bgImg.getScaledHeight()) / 100,
          width: (zone.percent.width * bgImg.getScaledWidth()) / 100,
          height: (zone.percent.height * bgImg.getScaledHeight()) / 100,
          angle: zone.rotation || 0,
          fill: 'rgba(16,185,129,0.2)',
          stroke: '#10b981',
          strokeWidth: 2,
          cornerColor: '#10b981',
          cornerSize: 8,
          transparentCorners: false,
          data: { id: zone.id }
        });
        fc.add(rect);
      });
      fc.renderAll();
    }
  }, [crops]);

  return <div ref={parentRef} className="w-full h-full" />;
});

export default ArchitectWorkspace;
