import React from 'react';
import { Slide } from '../../types';
import { motion } from 'motion/react';
import { Check, Quote, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { getComputedThemeStyles } from '../../utils/themeStyles';

interface ContentSlideRendererProps {
  slide: Slide;
}

export const ContentSlideRenderer: React.FC<ContentSlideRendererProps> = ({ slide }) => {
  const { type, title, subtitle, content, bullets, imageUrl, quoteAuthor } = slide;
  const themeStyles = getComputedThemeStyles(slide.theme);

  // Renderizador para Slide em Branco (Canvas Livre Total)
  if (type === 'content_blank') {
    return (
      <div className="w-full h-full relative">
        {/* Espaço limpo e transparente para os elementos animados e customizados */}
      </div>
    );
  }

  // Renderizador para Slide de Capa / Título
  if (type === 'content_cover') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div
            className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-2xl border backdrop-blur-md"
            style={themeStyles.badgeStyle}
          >
            <Sparkles className="w-8 h-8" style={{ color: themeStyles.accentColor }} />
          </div>

          <h1
            className="text-4xl sm:text-7xl font-black tracking-tight leading-tight"
            style={themeStyles.titleStyle}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-xl sm:text-3xl font-bold max-w-2xl mx-auto"
              style={themeStyles.subtitleStyle}
            >
              {subtitle}
            </p>
          )}

          {content && (
            <div
              className="max-w-xl mx-auto p-5 rounded-2xl border text-base leading-relaxed backdrop-blur-md shadow-lg"
              style={{
                ...themeStyles.cardStyle,
                color: slide.theme?.textColor || '#FFFFFF',
                opacity: 0.9
              }}
            >
              {content}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Renderizador para Citação / Frase de Impacto
  if (type === 'content_quote') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative p-8 sm:p-12 rounded-3xl border shadow-2xl backdrop-blur-xl"
          style={themeStyles.cardStyle}
        >
          <Quote
            className="w-16 h-16 mx-auto mb-4 opacity-40"
            style={{ color: themeStyles.accentColor }}
          />
          <blockquote
            className="text-2xl sm:text-5xl font-black leading-snug italic"
            style={themeStyles.titleStyle}
          >
            "{title || content}"
          </blockquote>
          {quoteAuthor && (
            <div
              className="mt-6 font-bold text-lg sm:text-xl tracking-widest uppercase"
              style={themeStyles.subtitleStyle}
            >
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
      <div className="w-full h-full flex flex-col justify-center p-6 sm:p-12 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2
              className="text-3xl sm:text-5xl font-black tracking-tight"
              style={themeStyles.titleStyle}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="font-bold text-base sm:text-lg"
                style={themeStyles.subtitleStyle}
              >
                {subtitle}
              </p>
            )}
            {content && (
              <div
                className="p-5 rounded-2xl border text-sm sm:text-base leading-relaxed backdrop-blur-md"
                style={themeStyles.cardStyle}
              >
                {content}
              </div>
            )}
          </div>

          <div
            className="rounded-3xl overflow-hidden shadow-2xl border-2 max-h-[420px]"
            style={{
              borderColor: themeStyles.accentColor,
              backgroundColor: slide.theme?.cardBackgroundColor || 'rgba(15,23,42,0.8)'
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-slate-500 font-bold">
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
    <div className="w-full h-full flex flex-col justify-center p-6 sm:p-12 max-w-5xl mx-auto relative z-10">
      <div className="space-y-3 mb-8">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={themeStyles.badgeStyle}
        >
          <Layers className="w-3.5 h-3.5" style={{ color: themeStyles.accentColor }} />
          <span>Slide de Conteúdo</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-black tracking-tight"
          style={themeStyles.titleStyle}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-base sm:text-xl font-bold"
            style={themeStyles.subtitleStyle}
          >
            {subtitle}
          </p>
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
              className="flex items-start gap-4 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all hover:scale-[1.01]"
              style={themeStyles.cardStyle}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border shadow"
                style={{
                  backgroundColor: themeStyles.accentColor,
                  color: '#FFFFFF',
                  borderColor: themeStyles.accentColor
                }}
              >
                {idx + 1}
              </div>
              <span
                className="text-base sm:text-lg font-medium leading-relaxed"
                style={{
                  color: slide.theme?.textColor || '#FFFFFF',
                  fontFamily: themeStyles.fontFamily
                }}
              >
                {bullet}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {content && !bullets && (
        <div
          className="p-6 rounded-3xl border text-base sm:text-lg leading-relaxed shadow-xl backdrop-blur-md"
          style={{
            ...themeStyles.cardStyle,
            color: slide.theme?.textColor || '#FFFFFF',
            fontFamily: themeStyles.fontFamily
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
