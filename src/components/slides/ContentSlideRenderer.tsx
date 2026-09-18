import React from 'react';
import { Slide } from '../../types';
import { motion } from 'motion/react';
import { Check, Quote, HelpCircle, Layers } from 'lucide-react';

interface ContentSlideRendererProps {
  slide: Slide;
}

export const ContentSlideRenderer: React.FC<ContentSlideRendererProps> = ({ slide }) => {
  const { type, title, subtitle, content, bullets, imageUrl, quoteAuthor } = slide;

  // Renderizador para Slide de Capa / Título
  if (type === 'content_cover') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-xl">
            ✨
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight font-display leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {content && (
            <p className="text-slate-400 text-base max-w-xl mx-auto pt-2 leading-relaxed">
              {content}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Renderizador para Citação / Frase de Impacto
  if (type === 'content_quote') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <Quote className="w-16 h-16 text-indigo-500/30 mx-auto mb-4" />
          <blockquote className="text-2xl sm:text-5xl font-black text-white leading-snug font-display italic">
            "{title || content}"
          </blockquote>
          {quoteAuthor && (
            <div className="mt-6 text-indigo-400 font-semibold text-lg tracking-wide uppercase">
              — {quoteAuthor}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Renderizador para Mídia / Imagem com Texto
  if (type === 'content_media') {
    return (
      <div className="w-full h-full flex flex-col justify-center p-6 sm:p-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              {title}
            </h2>
            {subtitle && (
              <p className="text-indigo-300 font-semibold text-base sm:text-lg">
                {subtitle}
              </p>
            )}
            {content && (
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {content}
              </p>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-900 max-h-[400px]">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-slate-500">
                Sem imagem
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Padrão: Tópicos / Bullets / Instruções com entrada escalonada
  return (
    <div className="w-full h-full flex flex-col justify-center p-6 sm:p-12 max-w-5xl mx-auto">
      <div className="space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Slide de Conteúdo</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-300 text-base sm:text-lg">{subtitle}</p>
        )}
      </div>

      {bullets && bullets.length > 0 && (
        <div className="space-y-3.5">
          {bullets.map((bullet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md hover:border-indigo-500/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <span className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                {bullet}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {content && !bullets && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 text-slate-200 text-base sm:text-lg leading-relaxed shadow-xl">
          {content}
        </div>
      )}
    </div>
  );
};
