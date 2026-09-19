import React, { useRef, useState, useEffect } from 'react';
import { SlideElement } from '../../types';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Play, Pause, ExternalLink, CheckCircle2, HelpCircle, Vote, Timer, BarChart3 } from 'lucide-react';

interface AnimatedSlideElementsOverlayProps {
  elements?: SlideElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  isInteractive?: boolean;
}

export const AnimatedSlideElementsOverlay: React.FC<AnimatedSlideElementsOverlayProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  isInteractive = false
}) => {
  if (!elements || elements.length === 0) {
    return null;
  }

  // Ordenar por zIndex para correta sobreposição
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-20">
      {sortedElements.map((element) => {
        if (element.hidden) return null;

        const isSelected = selectedElementId === element.id;

        return (
          <SingleElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            isInteractive={isInteractive}
            onSelect={onSelectElement ? () => onSelectElement(element.id) : undefined}
          />
        );
      })}
    </div>
  );
};

interface SingleElementRendererProps {
  element: SlideElement;
  isSelected?: boolean;
  isInteractive?: boolean;
  onSelect?: () => void;
}

const SingleElementRenderer: React.FC<SingleElementRendererProps> = ({
  element,
  isSelected,
  isInteractive,
  onSelect
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    type,
    x,
    y,
    width,
    height,
    rotation = 0,
    text,
    mediaUrl,
    alt,
    audioTitle,
    autoplay,
    loop,
    muted,
    controls = true,
    shapeType,
    iconName,
    style = {},
    filter = {},
    animation
  } = element;

  // Montar string de filtros CSS
  const filterParts: string[] = [];
  if (filter.brightness !== undefined && filter.brightness !== 100) filterParts.push(`brightness(${filter.brightness}%)`);
  if (filter.contrast !== undefined && filter.contrast !== 100) filterParts.push(`contrast(${filter.contrast}%)`);
  if (filter.saturate !== undefined && filter.saturate !== 100) filterParts.push(`saturate(${filter.saturate}%)`);
  if (filter.blur !== undefined && filter.blur > 0) filterParts.push(`blur(${filter.blur}px)`);
  if (filter.grayscale !== undefined && filter.grayscale > 0) filterParts.push(`grayscale(${filter.grayscale}%)`);
  if (filter.sepia !== undefined && filter.sepia > 0) filterParts.push(`sepia(${filter.sepia}%)`);
  if (filter.invert !== undefined && filter.invert > 0) filterParts.push(`invert(${filter.invert}%)`);
  if (filter.hueRotate !== undefined && filter.hueRotate > 0) filterParts.push(`hue-rotate(${filter.hueRotate}deg)`);
  if (filter.opacity !== undefined && filter.opacity < 100) filterParts.push(`opacity(${filter.opacity}%)`);

  const cssFilter = filterParts.length > 0 ? filterParts.join(' ') : undefined;

  // Montar estilos de container
  const shadowClass = getShadowClass(style.shadow);

  // Configuração de animação com Framer Motion
  const animConfig = getAnimationConfig(animation, rotation);

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  // Renderizar o conteúdo interno baseado no tipo
  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div
            className={`w-full h-full flex items-center leading-relaxed ${style.fontStyle === 'italic' ? 'italic' : ''}`}
            style={{
              color: style.color || '#FFFFFF',
              fontSize: style.fontSize ? `${style.fontSize}px` : '18px',
              fontWeight: getFontWeightValue(style.fontWeight),
              fontFamily: style.fontFamily || 'inherit',
              textAlign: style.textAlign || 'left',
              letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal',
              lineHeight: style.lineHeight || 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {text || 'Clique duas vezes para editar o texto...'}
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full overflow-hidden flex items-center justify-center">
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt={alt || 'Imagem do slide'}
                referrerPolicy="no-referrer"
                className="w-full h-full select-none"
                style={{
                  objectFit: style.objectFit || 'cover',
                  filter: cssFilter
                }}
              />
            ) : (
              <div className="w-full h-full bg-slate-800/80 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-xs text-slate-400 p-2 text-center">
                🖼️ Imagem não configurada
              </div>
            )}
          </div>
        );

      case 'video':
        const isYouTube = mediaUrl && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'));
        if (isYouTube) {
          const videoId = getYouTubeId(mediaUrl);
          return (
            <div className="w-full h-full overflow-hidden rounded-inherit bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
                title="Vídeo YouTube"
                className="w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        return (
          <div className="w-full h-full overflow-hidden bg-black flex items-center justify-center">
            {mediaUrl ? (
              <video
                src={mediaUrl}
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                controls={controls}
                className="w-full h-full object-cover pointer-events-auto"
                style={{ filter: cssFilter }}
              />
            ) : (
              <div className="w-full h-full bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400 p-2 text-center">
                🎥 Vídeo não configurado
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full flex items-center gap-3 pointer-events-auto">
            {mediaUrl && (
              <audio
                ref={audioRef}
                src={mediaUrl}
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                onPlay={() => setIsPlayingAudio(true)}
                onPause={() => setIsPlayingAudio(false)}
                onEnded={() => setIsPlayingAudio(false)}
              />
            )}
            <button
              type="button"
              onClick={handleToggleAudio}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {audioTitle || 'Faixa de Áudio'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{isPlayingAudio ? 'Tocando...' : 'Pausado'}</span>
              </div>
            </div>
          </div>
        );

      case 'shape':
        return (
          <div
            className={`w-full h-full flex items-center justify-center text-center font-bold p-2 ${getShapeClasses(shapeType)}`}
            style={{
              backgroundColor: style.backgroundColor || 'rgba(99, 102, 241, 0.2)',
              backgroundImage: style.backgroundGradient,
              borderColor: style.borderColor || 'rgba(99, 102, 241, 0.5)',
              borderWidth: style.borderWidth !== undefined ? `${style.borderWidth}px` : '1px',
              borderStyle: style.borderStyle || 'solid',
              color: style.color || '#FFFFFF',
              fontSize: style.fontSize ? `${style.fontSize}px` : '16px'
            }}
          >
            {text && <span>{text}</span>}
          </div>
        );

      case 'sticker':
        return (
          <div className="w-full h-full flex items-center justify-center text-center select-none">
            <span
              style={{
                fontSize: style.fontSize ? `${style.fontSize}px` : '48px',
                filter: cssFilter
              }}
            >
              {text || '✨'}
            </span>
          </div>
        );

      case 'quiz_widget': {
        const config = element.interactiveConfig || {
          widgetType: 'quiz',
          question: 'Pergunta do Quiz',
          options: [
            { id: '1', text: 'Opção A', isCorrect: true, color: '#EF4444', icon: 'A' },
            { id: '2', text: 'Opção B', isCorrect: false, color: '#3B82F6', icon: 'B' }
          ]
        };

        const opts = config.options || [];
        const isTwoCols = config.layout === 'two_columns' || opts.length > 4;

        return (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden pointer-events-auto select-none p-1">
            {/* Header da Questão */}
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-indigo-500/30">
                  <HelpCircle className="w-3 h-3" />
                  <span>Quiz Interativo</span>
                </span>
                {config.timerSeconds && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                    ⏱️ {config.timerSeconds}s
                  </span>
                )}
              </div>
              <h3
                className="font-black text-white text-sm md:text-base leading-tight line-clamp-2"
                style={{
                  fontFamily: style.fontFamily || 'inherit'
                }}
              >
                {config.question || text || 'Pergunta sem enunciado'}
              </h3>
            </div>

            {/* Lista Adaptável de Alternativas */}
            <div
              className={`grid gap-1.5 flex-1 ${
                isTwoCols ? 'grid-cols-2' : 'grid-cols-1'
              } content-center`}
            >
              {opts.map((opt, idx) => {
                const isCorrect = opt.isCorrect;
                return (
                  <div
                    key={opt.id || idx}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isCorrect && config.revealAnswer
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm"
                        style={{ backgroundColor: opt.color || '#6366F1' }}
                      >
                        {opt.icon || String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {opt.text}
                      </span>
                    </div>

                    {isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'poll_widget': {
        const config = element.interactiveConfig || {
          widgetType: 'poll',
          question: 'Enquete ao Vivo',
          options: [
            { id: '1', text: 'Sim', color: '#10B981', votesCount: 15 },
            { id: '2', text: 'Não', color: '#EF4444', votesCount: 5 }
          ]
        };
        const opts = config.options || [];
        const totalVotes = opts.reduce((acc, curr) => acc + (curr.votesCount || 0), 0);

        return (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden pointer-events-auto select-none p-1">
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-sky-500/30">
                  <Vote className="w-3 h-3" />
                  <span>Enquete ao Vivo</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {totalVotes} votos computados
                </span>
              </div>
              <h3 className="font-bold text-white text-sm leading-tight">
                {config.question || 'Enquete interativa'}
              </h3>
            </div>

            <div className="space-y-1.5 flex-1 content-center">
              {opts.map((opt, idx) => {
                const pct = totalVotes > 0 ? Math.round(((opt.votesCount || 0) / totalVotes) * 100) : 0;
                return (
                  <div
                    key={opt.id || idx}
                    className="p-1.5 px-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 left-0 opacity-25 rounded-l-xl transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: opt.color || '#0284C7'
                      }}
                    />
                    <div className="relative flex items-center justify-between text-xs font-semibold text-white">
                      <span className="truncate">{opt.text}</span>
                      <span className="text-[11px] font-mono text-slate-300 ml-2 font-bold shrink-0">
                        {pct}% ({opt.votesCount || 0})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'timer_widget': {
        const config = element.interactiveConfig || {
          widgetType: 'timer',
          timerSeconds: 30
        };

        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none pointer-events-auto">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-rose-500/80 bg-rose-500/10 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-1 animate-pulse">
              <Timer className="w-6 h-6 text-rose-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-rose-300 font-mono tracking-tight">
              {config.timerSeconds || 30}s
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Contagem Regressiva
            </span>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <motion.div
      onClick={(e) => {
        if (isInteractive && onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
      initial={animConfig.initial as any}
      animate={animConfig.animate as any}
      transition={animConfig.transition as any}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: width > 0 ? `${width}%` : 'auto',
        height: height > 0 ? `${height}%` : 'auto',
        transform: `rotate(${rotation}deg)`,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundGradient,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,
        padding: style.padding ? `${style.padding}px` : undefined,
        backdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
        zIndex: element.zIndex,
        pointerEvents: isInteractive ? 'auto' : type === 'audio' || type === 'video' ? 'auto' : 'none'
      }}
      className={`relative ${shadowClass} ${
        isInteractive && isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 shadow-2xl cursor-move'
          : isInteractive
          ? 'hover:ring-1 hover:ring-indigo-400/60 cursor-pointer'
          : ''
      }`}
    >
      {renderContent()}

      {/* Indicador de Seleção no Editor */}
      {isInteractive && isSelected && (
        <div className="absolute -top-3 -right-3 px-1.5 py-0.5 rounded bg-indigo-600 text-[10px] font-black text-white shadow uppercase tracking-wider select-none z-30">
          {element.name || element.type}
        </div>
      )}
    </motion.div>
  );
};

// Helper para classes de sombras pré-definidas
function getShadowClass(shadow?: string): string {
  switch (shadow) {
    case 'sm': return 'shadow-sm';
    case 'md': return 'shadow-md';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case '2xl': return 'shadow-2xl';
    case 'glow-indigo': return 'shadow-[0_0_25px_rgba(99,102,241,0.6)]';
    case 'glow-rose': return 'shadow-[0_0_25px_rgba(244,63,94,0.6)]';
    case 'glow-emerald': return 'shadow-[0_0_25px_rgba(16,185,129,0.6)]';
    case 'glow-amber': return 'shadow-[0_0_25px_rgba(245,158,11,0.6)]';
    case 'glow-sky': return 'shadow-[0_0_25px_rgba(14,165,233,0.6)]';
    default: return '';
  }
}

// Helper para classes de formas geométricas
function getShapeClasses(shapeType?: string): string {
  switch (shapeType) {
    case 'circle': return 'rounded-full aspect-square';
    case 'pill': return 'rounded-full';
    case 'rounded': return 'rounded-2xl';
    case 'speech_bubble': return 'rounded-2xl rounded-bl-none';
    case 'star': return 'rounded-xl rotate-3';
    case 'arrow_right': return 'rounded-r-full';
    default: return 'rounded-lg';
  }
}

// Helper para valores de font-weight
function getFontWeightValue(weight?: string): number {
  switch (weight) {
    case 'medium': return 500;
    case 'semibold': return 600;
    case 'bold': return 700;
    case 'black': return 900;
    default: return 400;
  }
}

// Helper para extrair ID do YouTube
function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

// Helper para gerar as propriedades de animação do Framer Motion
function getAnimationConfig(animation?: SlideElement['animation'], baseRotation = 0) {
  if (!animation || animation.type === 'none') {
    return {
      initial: { opacity: 1, rotate: baseRotation },
      animate: { opacity: 1, rotate: baseRotation },
      transition: { duration: 0.2 }
    };
  }

  const duration = animation.duration || 0.6;
  const delay = animation.delay || 0;

  switch (animation.type) {
    case 'fade-in':
      return {
        initial: { opacity: 0, rotate: baseRotation },
        animate: { opacity: 1, rotate: baseRotation },
        transition: { duration, delay }
      };

    case 'slide-up':
      return {
        initial: { opacity: 0, y: 50, rotate: baseRotation },
        animate: { opacity: 1, y: 0, rotate: baseRotation },
        transition: { duration, delay, ease: 'easeOut' }
      };

    case 'slide-down':
      return {
        initial: { opacity: 0, y: -50, rotate: baseRotation },
        animate: { opacity: 1, y: 0, rotate: baseRotation },
        transition: { duration, delay, ease: 'easeOut' }
      };

    case 'slide-left':
      return {
        initial: { opacity: 0, x: 60, rotate: baseRotation },
        animate: { opacity: 1, x: 0, rotate: baseRotation },
        transition: { duration, delay, ease: 'easeOut' }
      };

    case 'slide-right':
      return {
        initial: { opacity: 0, x: -60, rotate: baseRotation },
        animate: { opacity: 1, x: 0, rotate: baseRotation },
        transition: { duration, delay, ease: 'easeOut' }
      };

    case 'zoom-in':
      return {
        initial: { opacity: 0, scale: 0.4, rotate: baseRotation },
        animate: { opacity: 1, scale: 1, rotate: baseRotation },
        transition: { duration, delay, type: 'spring', damping: 14 }
      };

    case 'zoom-out':
      return {
        initial: { opacity: 0, scale: 1.6, rotate: baseRotation },
        animate: { opacity: 1, scale: 1, rotate: baseRotation },
        transition: { duration, delay }
      };

    case 'bounce':
      return {
        initial: { opacity: 0, scale: 0.2, y: -40, rotate: baseRotation },
        animate: { opacity: 1, scale: 1, y: 0, rotate: baseRotation },
        transition: { duration: duration || 0.8, delay, type: 'spring', bounce: 0.55 }
      };

    case 'flip':
      return {
        initial: { opacity: 0, rotateY: 90, rotate: baseRotation },
        animate: { opacity: 1, rotateY: 0, rotate: baseRotation },
        transition: { duration, delay }
      };

    case 'rotate-in':
      return {
        initial: { opacity: 0, rotate: baseRotation - 90, scale: 0.6 },
        animate: { opacity: 1, rotate: baseRotation, scale: 1 },
        transition: { duration, delay, ease: 'easeOut' }
      };

    // Continuous Loop Animations
    case 'pulse-loop':
      return {
        initial: { scale: 1, rotate: baseRotation },
        animate: { scale: [1, 1.08, 1], rotate: baseRotation },
        transition: { repeat: Infinity, duration: duration || 2, ease: 'easeInOut', delay }
      };

    case 'float-loop':
      return {
        initial: { y: 0, rotate: baseRotation },
        animate: { y: [0, -14, 0], rotate: baseRotation },
        transition: { repeat: Infinity, duration: duration || 2.8, ease: 'easeInOut', delay }
      };

    case 'spin-loop':
      return {
        initial: { rotate: 0 },
        animate: { rotate: 360 },
        transition: { repeat: Infinity, duration: duration || 8, ease: 'linear', delay }
      };

    case 'glow-loop':
      return {
        initial: { opacity: 0.8, rotate: baseRotation },
        animate: { opacity: [0.7, 1, 0.7], rotate: baseRotation },
        transition: { repeat: Infinity, duration: duration || 2, ease: 'easeInOut', delay }
      };

    case 'shake-loop':
      return {
        initial: { x: 0, rotate: baseRotation },
        animate: { x: [0, -5, 5, -4, 4, 0], rotate: baseRotation },
        transition: { repeat: Infinity, duration: duration || 1.6, repeatDelay: 1.2, delay }
      };

    case 'heartbeat':
      return {
        initial: { scale: 1, rotate: baseRotation },
        animate: { scale: [1, 1.15, 1, 1.15, 1], rotate: baseRotation },
        transition: { repeat: Infinity, duration: duration || 1.8, delay }
      };

    default:
      return {
        initial: { opacity: 1, rotate: baseRotation },
        animate: { opacity: 1, rotate: baseRotation },
        transition: { duration: 0.2 }
      };
  }
}
