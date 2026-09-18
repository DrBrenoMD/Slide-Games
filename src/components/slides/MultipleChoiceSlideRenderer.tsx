import React from 'react';
import { Slide, Participant } from '../../types';
import { CountdownTimer } from '../motion/CountdownTimer';
import { Check, X, Award, BarChart3, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface MultipleChoiceSlideRendererProps {
  slide: Slide;
  showAnswers: boolean;
  timerRemaining: number | null;
  timerActive: boolean;
  answersSubmitted: Record<string, any>;
  participants: Participant[];
}

export const MultipleChoiceSlideRenderer: React.FC<MultipleChoiceSlideRendererProps> = ({
  slide,
  showAnswers,
  timerRemaining,
  timerActive,
  answersSubmitted,
  participants
}) => {
  const options = slide.options || [];
  const totalSubmissions = Object.keys(answersSubmitted).length;
  const isCompetitive = slide.isCompetitive ?? true;

  // Calcula estatísticas por opção
  const counts: Record<string, number> = {};
  options.forEach((opt) => {
    counts[opt.id] = 0;
  });

  Object.values(answersSubmitted).forEach((sub) => {
    const optId = typeof sub === 'object' && sub !== null ? sub.selectedOption : sub;
    if (counts[optId] !== undefined) {
      counts[optId]++;
    }
  });

  // Ícones padrão geométricos para opções estilo Kahoot
  const defaultGeometricIcons = ['▲', '◆', '●', '■'];
  const defaultColors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Top Bar: Title + Timer + Mode Badge */}
      <div className="flex items-start justify-between gap-6 pb-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            {isCompetitive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                Quiz Competitivo {slide.speedBonus && '• Pontos por Velocidade'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                Enquete Interativa • Sem Ranking
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <Users className="w-3.5 h-3.5" />
              {totalSubmissions} / {participants.length} respostas
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-tight">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-slate-300 text-sm sm:text-base">{slide.subtitle}</p>
          )}
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

      {/* Middle Grid: Answer Cards / Live Bar Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-auto py-4">
        {options.map((opt, index) => {
          const count = counts[opt.id] || 0;
          const percentage = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;
          const isCorrect = opt.isCorrect;
          const icon = opt.icon || defaultGeometricIcons[index % defaultGeometricIcons.length];
          const color = opt.color || defaultColors[index % defaultColors.length];

          // Estado visual de revelação de respostas
          let cardBorder = 'border-slate-800';
          let opacity = 'opacity-100';

          if (showAnswers && isCompetitive) {
            if (isCorrect) {
              cardBorder = 'border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.4)]';
            } else {
              opacity = 'opacity-35 grayscale-20';
            }
          }

          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[140px] sm:min-h-[160px] ${cardBorder} ${opacity}`}
              style={{
                backgroundColor: `${color}15`,
                borderColor: showAnswers && isCorrect ? '#34D399' : `${color}40`
              }}
            >
              {/* Animated Progress Bar behind the card */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: `${color}25`
                }}
              />

              {/* Top Row: Icon + Answer Text + Status */}
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 text-white shadow-md"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {opt.text}
                  </span>
                </div>

                {showAnswers && isCompetitive && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-500/80 text-white flex items-center justify-center">
                        <X className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row: Percentage & Submissions counter */}
              <div className="relative z-10 flex items-end justify-between pt-4 mt-auto">
                <span className="text-xs font-semibold text-slate-300">
                  {count} {count === 1 ? 'voto' : 'votos'}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-white">
                  {percentage}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Information or Explanation */}
      {showAnswers && slide.content && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-slate-200 mt-2 flex items-center gap-3"
        >
          <span className="text-xl">💡</span>
          <span>{slide.content}</span>
        </motion.div>
      )}
    </div>
  );
};
