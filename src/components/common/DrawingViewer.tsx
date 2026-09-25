import React, { useRef, useEffect, useCallback } from 'react';
import { GarticStroke } from '../../types';

interface DrawingViewerProps {
  strokes: GarticStroke[];
  className?: string;
  drawerName?: string;
  drawerAvatar?: string;
  isDrawing?: boolean;
}

export const DrawingViewer: React.FC<DrawingViewerProps> = ({
  strokes = [],
  className = '',
  drawerName,
  drawerAvatar,
  isDrawing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Fundo branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Renderiza cada stroke
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;

      const scaleFactor = Math.min(width, height) / 400;
      ctx.lineWidth = Math.max(1, stroke.width * scaleFactor);

      const firstPt = stroke.points[0];
      const startX = (firstPt.x / 100) * width;
      const startY = (firstPt.y / 100) * height;

      if (stroke.points.length === 1) {
        ctx.arc(startX, startY, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        return;
      }

      ctx.moveTo(startX, startY);

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        const nextX = (pt.x / 100) * width;
        const nextY = (pt.y / 100) * height;
        ctx.lineTo(nextX, nextY);
      }

      ctx.stroke();
    });
  }, [strokes]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(100, Math.floor(rect.width));
    const targetH = Math.max(100, Math.floor(rect.height));

    if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
      canvas.width = targetW * dpr;
      canvas.height = targetH * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
    redraw();
  }, [redraw]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  return (
    <div className={`relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 select-none ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Watermark do desenhista */}
      {drawerName && (
        <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/60 text-xs font-bold flex items-center gap-1.5 shadow-lg pointer-events-none">
          <span>{drawerAvatar || '✏️'}</span>
          <span>{drawerName} desenhando</span>
          {isDrawing && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </div>
      )}

      {strokes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none space-y-2">
          <div className="text-3xl animate-bounce">🎨</div>
          <span className="text-xs font-medium">Aguardando o artista começar a desenhar...</span>
        </div>
      )}
    </div>
  );
};
