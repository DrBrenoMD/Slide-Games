import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Slide, SlideElement } from '../../types';
import { AnimatedSlideElementsOverlay } from '../slides/AnimatedSlideElementsOverlay';
import { ContentSlideRenderer } from '../slides/ContentSlideRenderer';
import { MultipleChoiceSlideRenderer } from '../slides/MultipleChoiceSlideRenderer';
import { TermSprintSlideRenderer } from '../slides/TermSprintSlideRenderer';
import { WordCloudSlideRenderer } from '../slides/WordCloudSlideRenderer';
import { ImpostorSlideRenderer } from '../slides/ImpostorSlideRenderer';
import { AddElementModal } from './AddElementModal';
import { ElementPropertyInspector } from './ElementPropertyInspector';
import { ThemeSidePanel } from './ThemeSidePanel';
import { ThemeVisualDecorator } from '../themes/ThemeVisualDecorator';
import { getComputedThemeStyles } from '../../utils/themeStyles';
import { convertPresetSlideToCanvasElements } from '../../utils/slidePresets';
import {
  Plus,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Shapes,
  Palette,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Move,
  Maximize2,
  Wand2,
  Check,
  Edit3
} from 'lucide-react';

interface SlideCanvasEditorProps {
  slide: Slide;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onApplyThemeToAllSlides?: (theme: Partial<Slide['theme']>) => void;
}

interface MagneticGuide {
  orientation: 'vertical' | 'horizontal';
  position: number; // in percent (0 to 100)
  label: string;
}

type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const SlideCanvasEditor: React.FC<SlideCanvasEditorProps> = ({
  slide,
  onUpdateSlide,
  onApplyThemeToAllSlides
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [showLayersDrawer, setShowLayersDrawer] = useState(false);
  const [isPreviewingAnimations, setIsPreviewingAnimations] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeGuides, setActiveGuides] = useState<MagneticGuide[]>([]);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [pasteToast, setPasteToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const inlineInputRef = useRef<HTMLTextAreaElement | null>(null);

  const dragActionRef = useRef<{
    elementId: string;
    action: 'move' | 'resize' | 'rotate';
    handle?: ResizeHandleType;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origRotation: number;
    centerScreenX: number;
    centerScreenY: number;
  } | null>(null);

  const elements = slide.elements || [];
  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;
  const canvasThemeStyles = getComputedThemeStyles(slide.theme);

  // Escuta global da Área de Transferência (Clipboard Paste de Imagens)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignorar se o usuário estiver digitando em um campo de texto/textarea
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) return;

            const newEl: SlideElement = {
              id: `el-img-paste-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              type: 'image',
              name: `Imagem Colada (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
              x: 25,
              y: 20,
              width: 50,
              height: 45,
              zIndex: (slide.elements?.length || 0) + 1,
              mediaUrl: dataUrl,
              mediaType: 'upload',
              alt: 'Imagem colada da área de transferência',
              style: {
                borderRadius: 16,
                shadow: 'xl',
                objectFit: 'cover'
              },
              filter: {
                brightness: 100,
                contrast: 100,
                saturate: 100,
                opacity: 100
              },
              animation: {
                type: 'fade-in',
                duration: 0.6,
                delay: 0
              }
            };

            onUpdateSlide({
              ...slide,
              elements: [...(slide.elements || []), newEl]
            });
            setSelectedElementId(newEl.id);
            setPasteToast('📸 Imagem colada da área de transferência com sucesso!');
            setTimeout(() => setPasteToast(null), 3500);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [slide, onUpdateSlide]);

  const hasPresetContent =
    slide.type !== 'content_blank' &&
    (Boolean(slide.title) ||
      Boolean(slide.subtitle) ||
      (slide.bullets && slide.bullets.length > 0) ||
      (slide.options && slide.options.length > 0) ||
      Boolean(slide.imageUrl) ||
      Boolean(slide.content));

  // Adicionar novo elemento
  const handleAddElement = (newElement: SlideElement) => {
    const updatedElements = [...elements, newElement];
    onUpdateSlide({
      ...slide,
      elements: updatedElements
    });
    setSelectedElementId(newElement.id);
  };

  // Atualizar elemento existente
  const handleUpdateElement = (updatedElement: SlideElement) => {
    const updatedElements = elements.map((el) => (el.id === updatedElement.id ? updatedElement : el));
    onUpdateSlide({
      ...slide,
      elements: updatedElements
    });
  };

  // Duplicar elemento
  const handleDuplicateElement = (elementToDup: SlideElement) => {
    const duplicated: SlideElement = {
      ...elementToDup,
      id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${elementToDup.name} (Cópia)`,
      x: Math.min(80, elementToDup.x + 4),
      y: Math.min(80, elementToDup.y + 4),
      zIndex: elements.length + 1
    };
    onUpdateSlide({
      ...slide,
      elements: [...elements, duplicated]
    });
    setSelectedElementId(duplicated.id);
  };

  // Excluir elemento
  const handleDeleteElement = (id: string) => {
    const updatedElements = elements.filter((el) => el.id !== id);
    onUpdateSlide({
      ...slide,
      elements: updatedElements
    });
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Trazer para frente (aumentar zIndex)
  const handleBringForward = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const updatedElements = elements.map((e) => (e.id === id ? { ...e, zIndex: e.zIndex + 1 } : e));
    onUpdateSlide({ ...slide, elements: updatedElements });
  };

  // Enviar para trás (diminuir zIndex)
  const handleSendBackward = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const updatedElements = elements.map((e) => (e.id === id ? { ...e, zIndex: Math.max(1, e.zIndex - 1) } : e));
    onUpdateSlide({ ...slide, elements: updatedElements });
  };

  // Converter presets em elementos editáveis
  const handleConvertPresetToCanvas = () => {
    const converted = convertPresetSlideToCanvasElements(slide);
    onUpdateSlide(converted);
    if (converted.elements && converted.elements.length > 0) {
      setSelectedElementId(converted.elements[0].id);
    }
  };

  // Alinhamentos rápidos no Canvas
  const handleAlign = (type: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
    if (!selectedElement) return;
    let newX = selectedElement.x;
    let newY = selectedElement.y;

    switch (type) {
      case 'left':
        newX = 5;
        break;
      case 'center-x':
        newX = Math.round((50 - selectedElement.width / 2) * 10) / 10;
        break;
      case 'right':
        newX = Math.round((95 - selectedElement.width) * 10) / 10;
        break;
      case 'top':
        newY = 5;
        break;
      case 'center-y':
        newY = Math.round((50 - selectedElement.height / 2) * 10) / 10;
        break;
      case 'bottom':
        newY = Math.round((95 - selectedElement.height) * 10) / 10;
        break;
    }

    handleUpdateElement({
      ...selectedElement,
      x: Math.max(0, Math.min(100 - selectedElement.width, newX)),
      y: Math.max(0, Math.min(100 - selectedElement.height, newY))
    });
  };

  // Iniciar Arrastar (Mover), Redimensionar ou Rotacionar
  const handleStartInteraction = (
    e: React.MouseEvent,
    element: SlideElement,
    action: 'move' | 'resize' | 'rotate',
    handle?: ResizeHandleType
  ) => {
    if (isPreviewingAnimations || element.locked) return;
    e.stopPropagation();
    setSelectedElementId(element.id);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();

    // Calcular centro do elemento na tela para cálculo de rotação
    const elemLeftScreen = canvasRect.left + (element.x / 100) * canvasRect.width;
    const elemTopScreen = canvasRect.top + (element.y / 100) * canvasRect.height;
    const elemWidthScreen = (element.width / 100) * canvasRect.width;
    const elemHeightScreen = (element.height / 100) * canvasRect.height;

    dragActionRef.current = {
      elementId: element.id,
      action,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origW: element.width,
      origH: element.height,
      origRotation: element.rotation || 0,
      centerScreenX: elemLeftScreen + elemWidthScreen / 2,
      centerScreenY: elemTopScreen + elemHeightScreen / 2
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragActionRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const current = dragActionRef.current;

      if (current.action === 'move') {
        const deltaXPercent = ((moveEvent.clientX - current.startX) / rect.width) * 100;
        const deltaYPercent = ((moveEvent.clientY - current.startY) / rect.height) * 100;

        let targetX = current.origX + deltaXPercent;
        let targetY = current.origY + deltaYPercent;
        const targetW = current.origW;
        const targetH = current.origH;

        const newGuides: MagneticGuide[] = [];
        const SNAP_DIST = 1.2; // limite de aproximação magnética em %

        if (snapEnabled) {
          // Snap horizontal: Centro do Canvas (50%)
          const centerX = targetX + targetW / 2;
          if (Math.abs(centerX - 50) < SNAP_DIST) {
            targetX = 50 - targetW / 2;
            newGuides.push({ orientation: 'vertical', position: 50, label: 'Centro da Tela' });
          }
          // Snap borda esquerda (5%)
          if (Math.abs(targetX - 5) < SNAP_DIST) {
            targetX = 5;
            newGuides.push({ orientation: 'vertical', position: 5, label: 'Margem Esquerda' });
          }
          // Snap borda direita (95%)
          if (Math.abs(targetX + targetW - 95) < SNAP_DIST) {
            targetX = 95 - targetW;
            newGuides.push({ orientation: 'vertical', position: 95, label: 'Margem Direita' });
          }

          // Snap vertical: Centro do Canvas (50%)
          const centerY = targetY + targetH / 2;
          if (Math.abs(centerY - 50) < SNAP_DIST) {
            targetY = 50 - targetH / 2;
            newGuides.push({ orientation: 'horizontal', position: 50, label: 'Centro da Tela' });
          }
          // Snap margem superior (5%)
          if (Math.abs(targetY - 5) < SNAP_DIST) {
            targetY = 5;
            newGuides.push({ orientation: 'horizontal', position: 5, label: 'Margem Superior' });
          }
          // Snap margem inferior (95%)
          if (Math.abs(targetY + targetH - 95) < SNAP_DIST) {
            targetY = 95 - targetH;
            newGuides.push({ orientation: 'horizontal', position: 95, label: 'Margem Inferior' });
          }

          // Snapping Magnético com outros elementos da tela
          elements.forEach((other) => {
            if (other.id === current.elementId || other.hidden) return;
            const otherCenterX = other.x + other.width / 2;
            const otherCenterY = other.y + other.height / 2;

            // Alinhamento horizontal centro-com-centro
            if (Math.abs(centerX - otherCenterX) < SNAP_DIST) {
              targetX = otherCenterX - targetW / 2;
              newGuides.push({
                orientation: 'vertical',
                position: otherCenterX,
                label: `Alinhado ao centro com "${other.name}"`
              });
            }
            // Alinhamento esquerda-com-esquerda
            if (Math.abs(targetX - other.x) < SNAP_DIST) {
              targetX = other.x;
              newGuides.push({
                orientation: 'vertical',
                position: other.x,
                label: `Alinhado à esquerda com "${other.name}"`
              });
            }
            // Alinhamento direita-com-direita
            if (Math.abs(targetX + targetW - (other.x + other.width)) < SNAP_DIST) {
              targetX = other.x + other.width - targetW;
              newGuides.push({
                orientation: 'vertical',
                position: other.x + other.width,
                label: `Alinhado à direita com "${other.name}"`
              });
            }

            // Alinhamento vertical centro-com-centro
            if (Math.abs(centerY - otherCenterY) < SNAP_DIST) {
              targetY = otherCenterY - targetH / 2;
              newGuides.push({
                orientation: 'horizontal',
                position: otherCenterY,
                label: `Alinhado ao meio com "${other.name}"`
              });
            }
            // Alinhamento topo-com-topo
            if (Math.abs(targetY - other.y) < SNAP_DIST) {
              targetY = other.y;
              newGuides.push({
                orientation: 'horizontal',
                position: other.y,
                label: `Alinhado ao topo com "${other.name}"`
              });
            }
          });
        }

        setActiveGuides(newGuides);

        const clampedX = Math.max(0, Math.min(100 - targetW, targetX));
        const clampedY = Math.max(0, Math.min(100 - targetH, targetY));

        onUpdateSlide({
          ...slide,
          elements: elements.map((el) =>
            el.id === current.elementId
              ? {
                  ...el,
                  x: Math.round(clampedX * 10) / 10,
                  y: Math.round(clampedY * 10) / 10
                }
              : el
          )
        });
      } else if (current.action === 'resize') {
        const deltaXPercent = ((moveEvent.clientX - current.startX) / rect.width) * 100;
        const deltaYPercent = ((moveEvent.clientY - current.startY) / rect.height) * 100;

        let newX = current.origX;
        let newY = current.origY;
        let newW = current.origW;
        let newH = current.origH;

        const handle = current.handle;

        if (handle?.includes('e')) {
          newW = Math.max(4, current.origW + deltaXPercent);
        }
        if (handle?.includes('s')) {
          newH = Math.max(4, current.origH + deltaYPercent);
        }
        if (handle?.includes('w')) {
          const maxDeltaW = current.origW - 4;
          const clampedDeltaX = Math.min(deltaXPercent, maxDeltaW);
          newX = current.origX + clampedDeltaX;
          newW = current.origW - clampedDeltaX;
        }
        if (handle?.includes('n')) {
          const maxDeltaH = current.origH - 4;
          const clampedDeltaY = Math.min(deltaYPercent, maxDeltaH);
          newY = current.origY + clampedDeltaY;
          newH = current.origH - clampedDeltaY;
        }

        onUpdateSlide({
          ...slide,
          elements: elements.map((el) =>
            el.id === current.elementId
              ? {
                  ...el,
                  x: Math.round(newX * 10) / 10,
                  y: Math.round(newY * 10) / 10,
                  width: Math.round(newW * 10) / 10,
                  height: Math.round(newH * 10) / 10
                }
              : el
          )
        });
      } else if (current.action === 'rotate') {
        const rad = Math.atan2(
          moveEvent.clientY - current.centerScreenY,
          moveEvent.clientX - current.centerScreenX
        );
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;

        // Snap de rotação para múltiplos de 15 graus ou 45 graus
        if (Math.abs(deg % 45) < 3 || Math.abs((deg % 45) - 45) < 3) {
          deg = Math.round(deg / 45) * 45;
        }

        onUpdateSlide({
          ...slide,
          elements: elements.map((el) =>
            el.id === current.elementId
              ? {
                  ...el,
                  rotation: deg % 360
                }
              : el
          )
        });
      }
    };

    const handleMouseUp = () => {
      dragActionRef.current = null;
      setActiveGuides([]);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Atalhos de teclado (Delete, Duplicar, Nudge com setas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input ou textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        inlineEditingId
      ) {
        return;
      }

      if (!selectedElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteElement(selectedElement.id);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateElement(selectedElement);
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 2.5 : 0.5;
        let newX = selectedElement.x;
        let newY = selectedElement.y;

        if (e.key === 'ArrowLeft') newX = Math.max(0, newX - step);
        if (e.key === 'ArrowRight') newX = Math.min(100 - selectedElement.width, newX + step);
        if (e.key === 'ArrowUp') newY = Math.max(0, newY - step);
        if (e.key === 'ArrowDown') newY = Math.min(100 - selectedElement.height, newY + step);

        handleUpdateElement({
          ...selectedElement,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, inlineEditingId]);

  const handleTogglePreviewAnimations = () => {
    setIsPreviewingAnimations((prev) => !prev);
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Banner de Conversão de Preset para Canvas Livre */}
      {hasPresetContent && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-sky-950/80 border border-indigo-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Edição Livre Tipo Canva</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Total Liberdade
                </span>
              </p>
              <p className="text-[11px] text-slate-300 truncate max-w-xl">
                Converta títulos, perguntas, cartões e botões deste slide em elementos móveis para reposicionar e formatar livremente!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConvertPresetToCanvas}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Converter em Elementos Livres</span>
          </button>
        </div>
      )}

      {/* Barra de Ferramentas Superior do Studio Canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Inserção de Elementos */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Inserir Elemento</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleAddElement({
                id: `el-${Date.now()}`,
                type: 'text',
                name: 'Caixa de Texto',
                text: 'Novo texto editável',
                x: 30,
                y: 40,
                width: 40,
                height: 15,
                zIndex: elements.length + 1,
                style: {
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontFamily: 'Outfit'
                },
                animation: {
                  type: 'fade-in',
                  duration: 0.6
                }
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            title="Adicionar caixa de texto"
          >
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            title="Inserir imagem"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Imagem</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            title="Inserir vídeo"
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            title="Inserir áudio / trilha"
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Áudio</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
            title="Inserir formas geométricas e adesivos"
          >
            <Shapes className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Formas & Emojis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedElementId(null);
              setIsThemeModalOpen((prev) => !prev);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
              isThemeModalOpen
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
            }`}
            title="Abrir ou fechar Galeria de Temas lateralmente ao Canva"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span>{isThemeModalOpen ? '✕ Fechar Temas' : '🎨 Galeria de Temas'}</span>
          </button>
        </div>

        {/* Alinhamentos Rápidos (quando há elemento selecionado) */}
        {selectedElement && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-black text-slate-400 mr-1">Alinhar:</span>
            <button
              type="button"
              onClick={() => handleAlign('left')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Alinhar à Esquerda"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('center-x')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Centralizar Horizontalmente"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('right')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Alinhar à Direita"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => handleAlign('top')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Alinhar ao Topo"
            >
              <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('center-y')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Centralizar Verticalmente"
            >
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign('bottom')}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Alinhar à Base"
            >
              <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Visualização de Animações & Camadas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSnapEnabled((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
              snapEnabled
                ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={snapEnabled ? 'Guias magnéticas ativas (clique para desativar)' : 'Guias magnéticas desativadas (clique para ativar)'}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Ímã / Guias</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePreviewAnimations}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isPreviewingAnimations
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Testar como as animações serão exibidas no telão ao vivo"
          >
            {isPreviewingAnimations ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPreviewingAnimations ? 'Voltar ao Editor' : 'Testar Animações'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLayersDrawer((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all ${
              showLayersDrawer ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Camadas ({elements.length})</span>
          </button>
        </div>
      </div>

      {/* Área Principal: Canvas 16:9 + Inspetor Lateral ou Painel de Temas Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Visual Interativo do Slide */}
        <div className={isThemeModalOpen ? 'lg:col-span-7' : (selectedElement ? 'lg:col-span-8' : 'lg:col-span-12')}>
          <div
            ref={canvasRef}
            onClick={() => {
              setSelectedElementId(null);
              setInlineEditingId(null);
            }}
            key={previewKey}
            className="w-full aspect-video rounded-3xl overflow-hidden relative shadow-2xl border-2 border-slate-800 select-none cursor-default"
            style={canvasThemeStyles.containerStyle}
          >
                {/* Visual Decorator Overlay (Cyber-grid, Stars, Organic leaves, etc.) */}
                <ThemeVisualDecorator theme={slide.theme} />

                {/* Fundo Padrão / Grade Sutil de Alinhamento */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Conteúdo Base do Slide de Fundo (Se houver) */}
                <div className="w-full h-full pointer-events-none relative z-10">
                  <SlideBasePreview slide={slide} />
                </div>

                {/* Overlay com Todos os Elementos Personalizados e Mídias */}
                <AnimatedSlideElementsOverlay
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  isInteractive={!isPreviewingAnimations}
                />

            {/* Guias Magnéticas de Alinhamento Ativas (Linhas e Badges) */}
            {activeGuides.map((guide, idx) => (
              <React.Fragment key={`guide-${idx}`}>
                {guide.orientation === 'vertical' ? (
                  <div
                    className="absolute top-0 bottom-0 w-[1.5px] bg-sky-400 z-50 pointer-events-none shadow-[0_0_8px_#38bdf8]"
                    style={{ left: `${guide.position}%` }}
                  >
                    <div className="absolute top-2 -left-12 px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold shadow whitespace-nowrap">
                      {guide.label}
                    </div>
                  </div>
                ) : (
                  <div
                    className="absolute left-0 right-0 h-[1.5px] bg-sky-400 z-50 pointer-events-none shadow-[0_0_8px_#38bdf8]"
                    style={{ top: `${guide.position}%` }}
                  >
                    <div className="absolute left-2 -top-4 px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold shadow whitespace-nowrap">
                      {guide.label}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Controles de Bounding Box, 8 Alças de Redimensionamento e Rotação */}
            {!isPreviewingAnimations &&
              elements.map((el) => {
                if (el.hidden) return null;
                const isSelected = selectedElementId === el.id;
                const isEditing = inlineEditingId === el.id;

                return (
                  <div
                    key={`element-bounding-${el.id}`}
                    style={{
                      position: 'absolute',
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      transformOrigin: 'center center',
                      zIndex: isSelected ? 99 : el.zIndex
                    }}
                    onMouseDown={(e) => handleStartInteraction(e, el, 'move')}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                      if (el.type === 'text' || el.type === 'shape') {
                        setInlineEditingId(el.id);
                      }
                    }}
                    className={`transition-shadow ${
                      el.locked ? 'cursor-not-allowed' : 'cursor-move'
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950/80'
                        : 'hover:ring-1 hover:ring-indigo-400/50'
                    }`}
                  >
                    {/* Badge de Informações de Tamanho e Posição */}
                    {isSelected && (
                      <div className="absolute -top-7 left-0 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-indigo-500/50 text-[10px] font-mono text-indigo-300 pointer-events-none shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50">
                        <span>{el.name}</span>
                        <span className="text-slate-500">•</span>
                        <span>{el.width}% × {el.height}%</span>
                        {el.rotation ? (
                          <>
                            <span className="text-slate-500">•</span>
                            <span>{el.rotation}°</span>
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Alça de Rotação (Haste e Botão Giratório Superior) */}
                    {isSelected && !el.locked && (
                      <div
                        className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-50 group"
                        onMouseDown={(e) => handleStartInteraction(e, el, 'rotate')}
                        title="Arrastar para girar elemento"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white hover:scale-125 transition-transform">
                          <RotateCw className="w-2.5 h-2.5" />
                        </div>
                        <div className="w-0.5 h-2 bg-indigo-500" />
                      </div>
                    )}

                    {/* 8 Pontos de Redimensionamento Precisos */}
                    {isSelected && !el.locked && (
                      <>
                        {/* Canto Superior Esquerdo */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'nw')}
                          className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Topo Centro */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'n')}
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-ns-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Canto Superior Direito */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'ne')}
                          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Direita Centro */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'e')}
                          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-ew-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Canto Inferior Direito */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'se')}
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow cursor-nwse-resize z-50 hover:scale-125 transition-transform flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        {/* Base Centro */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 's')}
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-ns-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Canto Inferior Esquerdo */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'sw')}
                          className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                        />
                        {/* Esquerda Centro */}
                        <div
                          onMouseDown={(e) => handleStartInteraction(e, el, 'resize', 'w')}
                          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow cursor-ew-resize z-50 hover:scale-125 transition-transform"
                        />
                      </>
                    )}

                    {/* Caixa de Edição de Texto Inline ao Clicar Duas Vezes */}
                    {isEditing && (el.type === 'text' || el.type === 'shape') && (
                      <div
                        className="absolute inset-0 z-50 bg-slate-950/90 rounded-xl p-2 border-2 border-indigo-400 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea
                          ref={inlineInputRef}
                          autoFocus
                          value={el.text || ''}
                          onChange={(e) => handleUpdateElement({ ...el, text: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setInlineEditingId(null);
                          }}
                          className="w-full h-full bg-transparent text-white text-sm font-bold resize-none focus:outline-none"
                          placeholder="Digite o texto do elemento..."
                        />
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                          <span>Pressione ESC para concluir</span>
                          <button
                            type="button"
                            onClick={() => setInlineEditingId(null)}
                            className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Toast de Confirmação de Imagem Colada da Área de Transferência */}
            {pasteToast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600/90 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 border border-emerald-400/50 animate-bounce">
                <span>{pasteToast}</span>
              </div>
            )}

            {/* Dica no rodapé do canvas */}
            <div className="absolute bottom-2 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-slate-300 pointer-events-none flex items-center gap-2 border border-slate-800/80 shadow">
              <span>💡 Pressione <strong className="text-white">Ctrl+V</strong> para colar imagens do clipboard</span>
              <span className="text-slate-500">•</span>
              <span>Arraste para mover • Alças para redimensionar • Duplo clique para texto</span>
            </div>
          </div>

          {/* Gerenciador de Camadas (Layers Drawer) */}
          {showLayersDrawer && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ordem das Camadas do Slide ({elements.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLayersDrawer(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {elements.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Nenhum elemento adicionado ainda.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {[...elements].reverse().map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/60 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-500 font-mono text-[10px]">z:{el.zIndex}</span>
                          <span className="truncate">{el.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleUpdateElement({ ...el, hidden: !el.hidden })}
                            className="p-1 text-slate-400 hover:text-white"
                            title={el.hidden ? 'Mostrar' : 'Ocultar'}
                          >
                            {el.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateElement(el)}
                            className="p-1 text-slate-400 hover:text-indigo-400"
                            title="Duplicar"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteElement(el.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Painel Lateral: Edição de Temas ou Inspetor de Elemento Lateralmente ao Canva */}
        {isThemeModalOpen ? (
          <div className="lg:col-span-5 space-y-3">
            {selectedElement && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400 font-bold truncate mr-2">Elemento selecionado: <strong className="text-white">{selectedElement.name || selectedElement.text || selectedElement.type}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsThemeModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer shrink-0"
                >
                  Ver Propriedades
                </button>
              </div>
            )}
            <ThemeSidePanel
              currentSlide={slide}
              onApplyThemeToCurrentSlide={(themeUpdates) => {
                onUpdateSlide({
                  ...slide,
                  theme: {
                    ...slide.theme,
                    ...themeUpdates
                  }
                });
              }}
              onApplyThemeToAllSlides={(themeUpdates) => {
                if (onApplyThemeToAllSlides) {
                  onApplyThemeToAllSlides(themeUpdates);
                } else {
                  onUpdateSlide({
                    ...slide,
                    theme: {
                      ...slide.theme,
                      ...themeUpdates
                    }
                  });
                }
              }}
              onClose={() => setIsThemeModalOpen(false)}
            />
          </div>
        ) : (
          selectedElement && (
            <div className="lg:col-span-4">
              <ElementPropertyInspector
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDuplicateElement={handleDuplicateElement}
                onDeleteElement={handleDeleteElement}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                onClose={() => setSelectedElementId(null)}
              />
            </div>
          )
        )}
      </div>

      {/* Modal de Inserção de Elementos de Mídia */}
      <AddElementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddElement={handleAddElement}
        currentElementsCount={elements.length}
      />
    </div>
  );
};

// Componente para renderizar a base do slide no fundo do Canvas
const SlideBasePreview: React.FC<{ slide: Slide }> = ({ slide }) => {
  switch (slide.type) {
    case 'quiz_multiple_choice':
    case 'quiz_true_false':
    case 'poll_single':
      return (
        <MultipleChoiceSlideRenderer
          slide={slide}
          showAnswers={false}
          timerRemaining={null}
          timerActive={false}
          answersSubmitted={{}}
          participants={[]}
        />
      );
    case 'quiz_term_sprint':
      return (
        <TermSprintSlideRenderer
          slide={slide}
          termSubmissions={[]}
          timerRemaining={null}
          timerActive={false}
          participants={[]}
        />
      );
    case 'interaction_word_cloud':
    case 'quiz_short_answer':
      return (
        <WordCloudSlideRenderer
          slide={slide}
          answersSubmitted={{}}
          participants={[]}
        />
      );
    case 'content_cover':
    case 'content_bullets':
    case 'content_media':
    case 'content_quote':
    case 'content_instruction':
    case 'content_blank':
    default:
      return <ContentSlideRenderer slide={slide} />;
  }
};
