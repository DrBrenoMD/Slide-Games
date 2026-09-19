import React from 'react';
import { Slide, Participant, ImagePinSubmission } from '../../types';
import { CountdownTimer } from '../motion/CountdownTimer';
import { Target, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ImagePinSlideRendererProps {
  slide: Slide;
  showAnswers: boolean;
  timerRemaining: number | null;
  timerActive: boolean;
  imagePins: ImagePinSubmission[];
  participants: Participant[];
}

export const ImagePinSlideRenderer: React.FC<ImagePinSlideRendererProps> = ({
  slide,
  showAnswers,
  timerRemaining,
  timerActive,
  imagePins,
  participants
}) => {
  const hotspot = slide.hotspot;
  const totalPins = imagePins.length;

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 md:p-7 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 sm:gap-6 pb-1 shrink-0">
        <div className="space-y-0.5 sm:space-y-1 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Quiz de Mira • Apontar na Imagem</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight font-display line-clamp-1">
            {slide.title}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm line-clamp-1">
            {slide.subtitle || 'Toque na tela do seu celular para marcar a posição'}
          </p>
        </div>

        {slide.timeLimitSeconds && slide.timeLimitSeconds > 0 && timerRemaining !== null && (
          <div className="shrink-0 scale-75 sm:scale-90 md:scale-100 origin-top-right">
            <CountdownTimer
              totalSeconds={slide.timeLimitSeconds}
              remainingSeconds={timerRemaining}
              isActive={timerActive}
              size="lg"
            />
          </div>
        )}
      </div>

      {/* Main Interactive Stage with Target Hotspot */}
      <div className="relative my-auto flex items-center justify-center py-1 flex-1 overflow-hidden">
        <div className="relative max-w-3xl w-full h-full max-h-[220px] sm:max-h-[300px] md:max-h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-contain block select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-36 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
              Nenhuma imagem selecionada
            </div>
          )}

          {/* Participant Pins dropped in real time */}
          {imagePins.map((pin, i) => (
            <motion.div
              key={`${pin.participantId}-${i}`}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{
                left: `${pin.xPercent}%`,
                top: `${pin.yPercent}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-950/80 text-white border border-white/20 whitespace-nowrap shadow">
                  {pin.participantName}
                </span>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 filter drop-shadow-md -mt-0.5 animate-bounce" />
              </div>
            </motion.div>
          ))}

          {/* Correct Hotspot Target revealed by presenter */}
          {showAnswers && hotspot && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
                width: `${hotspot.radiusPercent * 2}%`,
                height: `${hotspot.radiusPercent * 2.5}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:border-4 border-emerald-400 bg-emerald-500/25 z-10 pointer-events-none shadow-[0_0_30px_rgba(16,185,129,0.8)] flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              {hotspot.label && (
                <div className="absolute -bottom-6 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-bold text-[10px] sm:text-xs whitespace-nowrap shadow">
                  ✓ {hotspot.label}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-400 pt-1 shrink-0">
        <span>{totalPins} de {participants.length} marcações</span>
        {showAnswers && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Alvo Revelado
          </span>
        )}
      </div>
    </div>
  );
};
