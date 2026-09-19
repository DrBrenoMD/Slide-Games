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
      <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 text-center max-w-5xl mx-auto relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="space-y-3 sm:space-y-5 my-auto"
        >
          <div
            className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-2xl shadow-xl border backdrop-blur-md"
            style={themeStyles.badgeStyle}
          >
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: themeStyles.accentColor }} />
          </div>

          <h1
            className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight"
            style={themeStyles.titleStyle}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-sm sm:text-lg md:text-2xl font-bold max-w-2xl mx-auto"
              style={themeStyles.subtitleStyle}
            >
              {subtitle}
            </p>
          )}

          {content && (
            <div
              className="max-w-xl mx-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm md:text-base leading-relaxed backdrop-blur-md shadow-lg"
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
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center max-w-4xl mx-auto relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-xl my-auto w-full"
          style={themeStyles.cardStyle}
        >
          <Quote
            className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-40"
            style={{ color: themeStyles.accentColor }}
          />
          <blockquote
            className="text-lg sm:text-2xl md:text-4xl font-black leading-snug italic"
            style={themeStyles.titleStyle}
          >
            "{title || content}"
          </blockquote>
          {quoteAuthor && (
            <div
              className="mt-3 sm:mt-5 font-bold text-xs sm:text-sm md:text-base tracking-widest uppercase"
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
      <div className="w-full h-full flex flex-col justify-center p-4 sm:p-8 max-w-6xl mx-auto relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center my-auto">
          <div className="space-y-2 sm:space-y-3">
            <h2
              className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={themeStyles.titleStyle}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="font-bold text-xs sm:text-sm md:text-base"
                style={themeStyles.subtitleStyle}
              >
                {subtitle}
              </p>
            )}
            {content && (
              <div
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm leading-relaxed backdrop-blur-md"
                style={themeStyles.cardStyle}
              >
                {content}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 max-h-[160px] sm:max-h-[260px] md:max-h-[340px]"
            style={{
              borderColor: themeStyles.accentColor,
              backgroundColor: slide.theme?.cardBackgroundColor || 'rgba(15,23,42,0.8)'
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover max-h-[160px] sm:max-h-[260px] md:max-h-[340px]" />
            ) : (
              <div className="w-full h-36 sm:h-48 flex items-center justify-center text-slate-500 font-bold text-xs sm:text-sm">
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
    <div className="w-full h-full flex flex-col justify-center p-4 sm:p-8 max-w-5xl mx-auto relative z-10 overflow-hidden">
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-5">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={themeStyles.badgeStyle}
        >
          <Layers className="w-3 h-3" style={{ color: themeStyles.accentColor }} />
          <span>Slide de Conteúdo</span>
        </div>
        <h2
          className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight"
          style={themeStyles.titleStyle}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-xs sm:text-sm md:text-base font-bold"
            style={themeStyles.subtitleStyle}
          >
            {subtitle}
          </p>
        )}
      </div>

      {bullets && bullets.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {bullets.map((bullet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-lg backdrop-blur-md transition-all hover:scale-[1.01]"
              style={themeStyles.cardStyle}
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 mt-0.5 border shadow"
                style={{
                  backgroundColor: themeStyles.accentColor,
                  color: '#FFFFFF',
                  borderColor: themeStyles.accentColor
                }}
              >
                {idx + 1}
              </div>
              <span
                className="text-xs sm:text-sm md:text-base font-medium leading-relaxed"
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
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border text-xs sm:text-sm md:text-base leading-relaxed shadow-xl backdrop-blur-md"
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
