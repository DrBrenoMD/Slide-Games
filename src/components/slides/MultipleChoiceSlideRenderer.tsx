import React from 'react';
import { Slide, Participant } from '../../types';
import { CountdownTimer } from '../motion/CountdownTimer';
import { Check, X, Award, BarChart3, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { getComputedThemeStyles } from '../../utils/themeStyles';

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
  const themeStyles = getComputedThemeStyles(slide.theme);

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
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-10 lg:p-12 relative z-10 overflow-hidden">
      {/* Top Bar: Title + Timer + Mode Badge */}
      <div className="flex items-start justify-between gap-4 sm:gap-8 pb-2 shrink-0">
        <div className="flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isCompetitive ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-xs sm:text-sm font-black uppercase tracking-wider backdrop-blur-md shadow-sm"
                style={themeStyles.badgeStyle}
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: themeStyles.accentColor }} />
                Quiz Competitivo {slide.speedBonus && '• Velocidade'}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-xs sm:text-sm font-black uppercase tracking-wider backdrop-blur-md shadow-sm"
                style={themeStyles.badgeStyle}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: themeStyles.accentColor }} />
                Enquete Interativa
              </span>
            )}
            <span
              className="text-xs sm:text-sm flex items-center gap-1.5 font-bold px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 backdrop-blur-md"
              style={{ color: slide.theme?.textColor || '#E2E8F0' }}
            >
              <Users className="w-3.5 h-3.5" style={{ color: themeStyles.accentColor }} />
              {totalSubmissions} / {participants.length} respostas
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight line-clamp-2"
            style={themeStyles.titleStyle}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="text-sm sm:text-base md:text-xl font-bold line-clamp-1"
              style={themeStyles.subtitleStyle}
            >
              {slide.subtitle}
            </p>
          )}
        </div>

        {slide.timeLimitSeconds && slide.timeLimitSeconds > 0 && timerRemaining !== null && (
          <div className="shrink-0 scale-90 sm:scale-100 md:scale-110 origin-top-right">
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
      <div className={`grid ${options.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-3 sm:gap-4 md:gap-6 my-auto py-2 sm:py-4 flex-1 items-stretch`}>
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
              cardBorder = 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.6)]';
            } else {
              opacity = 'opacity-35 grayscale-20';
            }
          }

          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 border-2 transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[70px] sm:min-h-[100px] md:min-h-[120px] backdrop-blur-xl ${cardBorder} ${opacity}`}
              style={{
                backgroundColor: `${color}20`,
                borderColor: showAnswers && isCorrect ? '#34D399' : `${color}66`,
                borderRadius: slide.theme?.accentBorderRadius || '24px'
              }}
            >
              {/* Animated Progress Bar behind the card */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: `${color}35`
                }}
              />

              {/* Top Row: Icon + Answer Text + Status */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <span
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base md:text-xl font-black shrink-0 text-white shadow-md"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </span>
                  <span
                    className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black leading-snug truncate"
                    style={{
                      fontFamily: themeStyles.fontFamily,
                      color: slide.theme?.textColor || '#FFFFFF'
                    }}
                  >
                    {opt.text}
                  </span>
                </div>

                {showAnswers && isCompetitive && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500/80 text-white flex items-center justify-center">
                        <X className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row: Percentage & Submissions counter */}
              <div className="relative z-10 flex items-end justify-between pt-2 sm:pt-4 mt-auto">
                <span
                  className="text-xs sm:text-sm md:text-base font-bold"
                  style={{
                    color: slide.theme?.textColor || '#E2E8F0',
                    opacity: 0.85
                  }}
                >
                  {count} {count === 1 ? 'voto' : 'votos'}
                </span>
                <span
                  className="font-mono text-lg sm:text-2xl md:text-4xl font-black"
                  style={{
                    color: slide.theme?.textColor || '#FFFFFF',
                    fontFamily: themeStyles.headingFontFamily
                  }}
                >
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
          className="p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm mt-1 flex items-center gap-2 backdrop-blur-md shadow shrink-0"
          style={{
            ...themeStyles.cardStyle,
            color: slide.theme?.textColor || '#E2E8F0'
          }}
        >
          <span className="text-base sm:text-lg">💡</span>
          <span className="leading-relaxed font-medium line-clamp-1">{slide.content}</span>
        </motion.div>
      )}
    </div>
  );
};
