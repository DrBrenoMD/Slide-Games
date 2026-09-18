import React from 'react';
import { Slide, Participant } from '../../types';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

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

  // Paleta de cores vibrantes para a nuvem
  const cloudColors = [
    'text-indigo-400',
    'text-pink-400',
    'text-cyan-400',
    'text-amber-400',
    'text-emerald-400',
    'text-purple-400',
    'text-rose-400',
    'text-sky-300'
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2 text-center pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuvem de Palavras Interativa</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display max-w-3xl mx-auto">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-slate-300 text-sm sm:text-base">{slide.subtitle}</p>
        )}
      </div>

      {/* Main Word Cloud Area */}
      <div className="my-auto min-h-[350px] p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-center gap-4 sm:gap-8 shadow-inner overflow-hidden">
        {wordEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 text-sm">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
            <span>Envie suas palavras pelo celular para preencher a nuvem...</span>
          </div>
        ) : (
          wordEntries.map(([word, count], i) => {
            // Escala matemática proporcional da fonte baseada na frequência
            const weightRatio = count / maxCount;
            const fontSizeClass =
              weightRatio > 0.8
                ? 'text-4xl sm:text-6xl font-black'
                : weightRatio > 0.5
                ? 'text-2xl sm:text-4xl font-extrabold'
                : weightRatio > 0.25
                ? 'text-xl sm:text-2xl font-bold'
                : 'text-base sm:text-lg font-medium';

            const colorClass = cloudColors[i % cloudColors.length];

            return (
              <motion.div
                key={word}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`cursor-default select-none capitalize transition-transform hover:scale-110 duration-200 px-3 py-1 rounded-2xl bg-white/5 border border-white/10 ${fontSizeClass} ${colorClass}`}
              >
                {word}
                {count > 1 && (
                  <span className="ml-1.5 text-xs font-mono opacity-60 bg-black/40 px-1.5 py-0.5 rounded-full">
                    x{count}
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4">
        <span>{Object.keys(answersSubmitted).length} de {participants.length} participações</span>
        <span>{wordEntries.length} palavras únicas enviadas</span>
      </div>
    </div>
  );
};
