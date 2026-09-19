import React from 'react';
import { Slide, Participant } from '../../types';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getComputedThemeStyles } from '../../utils/themeStyles';

interface WordCloudSlideRendererProps {
  slide: Slide;
  answersSubmitted: Record<string, any>;
  participants: Participant[];
}

export const WordCloudSlideRenderer: React.FC<WordCloudSlideRendererProps> = ({
  slide,
  answersSubmitted,
  participants
}) => {
  const themeStyles = getComputedThemeStyles(slide.theme);

  // Coletar palavras e contar frequências
  const wordCounts: Record<string, number> = {};

  Object.values(answersSubmitted).forEach((sub) => {
    const raw = typeof sub === 'object' && sub !== null ? sub.text || sub.selectedOption : sub;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const cleaned = raw.trim().toLowerCase();
      wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1;
    }
  });

  const wordEntries = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = wordEntries.length > 0 ? wordEntries[0][1] : 1;

  // Cores dinâmicas baseadas no tema ativo
  const themeAccent = themeStyles.accentColor;
  const themeSecondary = themeStyles.secondaryColor;
  const palette = [
    themeAccent,
    themeSecondary,
    '#38BDF8',
    '#F59E0B',
    '#10B981',
    '#EC4899',
    '#A855F7',
    '#F43F5E'
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-6 md:p-8 max-w-7xl mx-auto relative z-10 overflow-hidden">
      {/* Header */}
      <div className="space-y-1 text-center pb-1 shrink-0">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={themeStyles.badgeStyle}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: themeStyles.accentColor }} />
          <span>Nuvem de Palavras Interativa</span>
        </div>
        <h2
          className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight max-w-3xl mx-auto line-clamp-1"
          style={themeStyles.titleStyle}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className="text-xs sm:text-sm font-bold line-clamp-1"
            style={themeStyles.subtitleStyle}
          >
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Main Word Cloud Area */}
      <div
        className="my-auto p-3 sm:p-6 rounded-2xl sm:rounded-3xl border backdrop-blur-xl flex flex-wrap items-center justify-center gap-2 sm:gap-4 shadow-xl overflow-y-auto flex-1 max-h-[60%]"
        style={themeStyles.cardStyle}
      >
        {wordEntries.length === 0 ? (
          <div className="text-center space-y-2 py-4">
            <MessageSquare
              className="w-8 h-8 sm:w-10 sm:h-10 mx-auto opacity-30 animate-pulse"
              style={{ color: themeStyles.accentColor }}
            />
            <p
              className="text-xs sm:text-sm md:text-base font-bold"
              style={{ color: slide.theme?.textColor || '#94A3B8' }}
            >
              Aguardando palavras dos participantes pelo celular...
            </p>
            <p className="text-[10px] sm:text-xs opacity-60">
              Digite palavras no seu celular para vê-las surgirem aqui em tempo real!
            </p>
          </div>
        ) : (
          wordEntries.map(([word, count], idx) => {
            const ratio = count / maxCount;
            // Escala dinâmica de tamanho de fonte: 14px até 42px
            const fontSize = Math.round(14 + ratio * 24);
            const color = palette[idx % palette.length];

            return (
              <motion.div
                key={word}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-black tracking-tight inline-flex items-center gap-1.5 shadow transition-transform hover:scale-105 cursor-default"
                style={{
                  fontSize: `${fontSize}px`,
                  color,
                  backgroundColor: `${color}18`,
                  border: `1.5px solid ${color}44`,
                  fontFamily: themeStyles.headingFontFamily
                }}
              >
                <span>{word}</span>
                {count > 1 && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white shadow"
                    style={{ backgroundColor: color }}
                  >
                    ×{count}
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div
        className="flex items-center justify-between text-[10px] sm:text-xs pt-2 border-t shrink-0"
        style={{
          borderColor: `${themeStyles.accentColor}33`,
          color: slide.theme?.textColor || '#94A3B8'
        }}
      >
        <span>
          Total de termos: <strong className="text-white">{wordEntries.reduce((acc, curr) => acc + curr[1], 0)}</strong>
        </span>
        <span>
          Palavras distintas: <strong className="text-white">{wordEntries.length}</strong>
        </span>
      </div>
    </div>
  );
};
