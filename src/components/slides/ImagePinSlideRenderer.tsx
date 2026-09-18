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
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 pb-2">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Quiz de Mira • Apontar na Imagem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            {slide.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            {slide.subtitle || 'Toque na tela do seu celular para marcar a posição'}
          </p>
        </div>

        {slide.timeLimitSeconds && slide.timeLimitSeconds > 0 && timerRemaining !== null && (
          <div className="shrink-0">
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
      <div className="relative my-auto flex items-center justify-center py-2 max-h-[460px]">
        <div className="relative max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full max-h-[420px] object-cover block select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-slate-500">
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
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-white border border-white/20 whitespace-nowrap shadow">
                  {pin.participantName}
                </span>
                <MapPin className="w-6 h-6 text-rose-500 fill-rose-500 filter drop-shadow-md -mt-1 animate-bounce" />
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
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-400 bg-emerald-500/25 z-10 pointer-events-none shadow-[0_0_50px_rgba(16,185,129,0.8)] flex items-center justify-center"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
              {hotspot.label && (
                <div className="absolute -bottom-8 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-bold text-xs whitespace-nowrap shadow-lg">
                  ✓ {hotspot.label}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-2">
        <span>{totalPins} de {participants.length} marcações registradas</span>
        {showAnswers && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Alvo Correto Revelado
          </span>
        )}
      </div>
    </div>
  );
};
