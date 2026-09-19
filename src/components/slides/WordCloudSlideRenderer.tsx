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
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="space-y-2 text-center pb-2">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={themeStyles.badgeStyle}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: themeStyles.accentColor }} />
          <span>Nuvem de Palavras Interativa</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto"
          style={themeStyles.titleStyle}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className="text-base sm:text-lg font-bold"
            style={themeStyles.subtitleStyle}
          >
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Main Word Cloud Area */}
      <div
        className="my-auto min-h-[350px] p-8 rounded-3xl border backdrop-blur-xl flex flex-wrap items-center justify-center gap-4 sm:gap-8 shadow-2xl overflow-hidden"
        style={themeStyles.cardStyle}
      >
        {wordEntries.length === 0 ? (
          <div className="text-center space-y-3 py-12">
            <MessageSquare
              className="w-12 h-12 mx-auto opacity-30 animate-pulse"
              style={{ color: themeStyles.accentColor }}
            />
            <p
              className="text-lg font-bold"
              style={{ color: slide.theme?.textColor || '#94A3B8' }}
            >
              Aguardando palavras dos participantes pelo celular...
            </p>
            <p className="text-xs opacity-60">
              Digite palavras na sua tela de participante para vê-las surgirem aqui em tempo real!
            </p>
          </div>
        ) : (
          wordEntries.map(([word, count], idx) => {
            const ratio = count / maxCount;
            // Escala dinâmica de tamanho de fonte: 20px até 72px
            const fontSize = Math.round(20 + ratio * 48);
            const color = palette[idx % palette.length];

            return (
              <motion.div
                key={word}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="px-4 py-1.5 rounded-2xl font-black tracking-tight inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-110 cursor-default"
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
                    className="text-xs px-2 py-0.5 rounded-full font-bold text-white shadow"
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
        className="flex items-center justify-between text-xs pt-4 border-t"
        style={{
          borderColor: `${themeStyles.accentColor}33`,
          color: slide.theme?.textColor || '#94A3B8'
        }}
      >
        <span>
          Total de termos enviados: <strong className="text-white">{wordEntries.reduce((acc, curr) => acc + curr[1], 0)}</strong>
        </span>
        <span>
          Palavras distintas: <strong className="text-white">{wordEntries.length}</strong>
        </span>
      </div>
    </div>
  );
};
