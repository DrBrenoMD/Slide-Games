import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GarticStroke, GarticPoint } from '../../types';
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  Trash2,
  Circle,
  Sparkles
} from 'lucide-react';

interface DrawingCanvasProps {
  onStrokeComplete?: (stroke: GarticStroke) => void;
  onClearCanvas?: () => void;
  onUndoStroke?: () => void;
  strokes?: GarticStroke[];
  disabled?: boolean;
  className?: string;
}

const PALETTE_COLORS = [
  '#000000', // Preto
  '#FFFFFF', // Branco
  '#64748B', // Cinza
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#FBBF24', // Amarelo
  '#10B981', // Verde
  '#06B6D4', // Ciano
  '#3B82F6', // Azul
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#854D0E', // Marrom
];

const STROKE_WIDTHS = [
  { size: 3, label: 'Fino' },
  { size: 7, label: 'Médio' },
  { size: 14, label: 'Grosso' },
  { size: 24, label: 'Pincel' }
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onStrokeComplete,
  onClearCanvas,
  onUndoStroke,
  strokes = [],
  disabled = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<GarticPoint[]>([]);
  
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedWidth, setSelectedWidth] = useState<number>(7);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Redesenha todos os traços no canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fundo branco limpo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Renderiza cada stroke
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;
      // Escala a espessura relativa ao tamanho do canvas
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

  // Redimensiona o canvas para bater com o tamanho visual e DPI da tela
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(200, Math.floor(rect.width));
    const targetH = Math.max(200, Math.floor(rect.height));

    if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
      canvas.width = targetW * dpr;
      canvas.height = targetH * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  // Conversão de coordenadas para porcentagem (0 a 100%)
  const getCanvasPercentCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): GarticPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    } else {
      return null;
    }

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();

    const pt = getCanvasPercentCoords(e);
    if (!pt) return;

    isDrawingRef.current = true;
    currentStrokeRef.current = [pt];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const scaleFactor = Math.min(width, height) / 400;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = Math.max(1, selectedWidth * scaleFactor);

    const px = (pt.x / 100) * width;
    const py = (pt.y / 100) * height;
    ctx.moveTo(px, py);
    ctx.lineTo(px, py);
    ctx.stroke();
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || disabled) return;
    e.preventDefault();

    const pt = getCanvasPercentCoords(e);
    if (!pt) return;

    const prevPoints = currentStrokeRef.current;
    const lastPt = prevPoints[prevPoints.length - 1];

    // Evita registrar pontos excessivamente próximos para otimizar payload
    if (lastPt) {
      const dx = pt.x - lastPt.x;
      const dy = pt.y - lastPt.y;
      if (Math.hypot(dx, dy) < 0.35) return;
    }

    currentStrokeRef.current.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const scaleFactor = Math.min(width, height) / 400;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = Math.max(1, selectedWidth * scaleFactor);

    if (lastPt) {
      ctx.moveTo((lastPt.x / 100) * width, (lastPt.y / 100) * height);
      ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current.length > 0 && onStrokeComplete) {
      const newStroke: GarticStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        color: selectedColor,
        width: selectedWidth,
        points: [...currentStrokeRef.current],
        isEraser
      };
      onStrokeComplete(newStroke);
    }
    currentStrokeRef.current = [];
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 select-none shadow-2xl ${className}`}>
      {/* Canvas Area */}
      <div className="relative flex-1 w-full bg-white touch-none cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={drawMove}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawMove}
          onTouchEnd={endDrawing}
          onTouchCancel={endDrawing}
        />

        {disabled && (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-slate-300 text-xs font-bold border border-slate-700">
              Modo visualização
            </span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {!disabled && (
        <div className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Colors Palette */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedColor(c);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform shrink-0 border ${
                  selectedColor === c && !isEraser
                    ? 'ring-2 ring-indigo-400 scale-110 border-white'
                    : 'border-slate-600 hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Tools & Stroke Width */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Eraser */}
            <button
              type="button"
              onClick={() => setIsEraser((prev) => !prev)}
              className={`p-2 rounded-xl transition-colors ${
                isEraser
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Borracha"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Brush sizes */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              {STROKE_WIDTHS.map((sw) => (
                <button
                  key={sw.size}
                  type="button"
                  onClick={() => setSelectedWidth(sw.size)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedWidth === sw.size
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={sw.label}
                >
                  <Circle
                    className="w-4 h-4 fill-current"
                    style={{ transform: `scale(${0.3 + (sw.size / 24) * 0.7})` }}
                  />
                </button>
              ))}
            </div>

            {/* Undo */}
            {onUndoStroke && (
              <button
                type="button"
                onClick={onUndoStroke}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Desfazer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Clear Canvas */}
            {onClearCanvas && (
              <button
                type="button"
                onClick={onClearCanvas}
                className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-colors"
                title="Limpar Desenho"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
