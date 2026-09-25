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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 md:p-14 lg:p-20 text-center max-w-6xl mx-auto relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 sm:space-y-6 md:space-y-8 my-auto"
        >
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-2xl border backdrop-blur-md"
            style={themeStyles.badgeStyle}
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ color: themeStyles.accentColor }} />
          </div>

          <h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight"
            style={themeStyles.titleStyle}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg sm:text-2xl md:text-3xl font-bold max-w-3xl mx-auto leading-relaxed"
              style={themeStyles.subtitleStyle}
            >
              {subtitle}
            </p>
          )}

          {content && (
            <div
              className="max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl md:rounded-3xl border text-sm sm:text-base md:text-xl leading-relaxed backdrop-blur-md shadow-xl"
              style={{
                ...themeStyles.cardStyle,
                color: slide.theme?.textColor || '#FFFFFF',
                opacity: 0.95
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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 text-center max-w-5xl mx-auto relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-xl my-auto w-full"
          style={themeStyles.cardStyle}
        >
          <Quote
            className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-6 opacity-40"
            style={{ color: themeStyles.accentColor }}
          />
          <blockquote
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-snug italic"
            style={themeStyles.titleStyle}
          >
            "{title || content}"
          </blockquote>
          {quoteAuthor && (
            <div
              className="mt-4 sm:mt-8 font-black text-sm sm:text-lg md:text-2xl tracking-widest uppercase"
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
      <div className="w-full h-full flex flex-col justify-center p-6 sm:p-10 md:p-14 max-w-7xl mx-auto relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-12 items-center my-auto">
          <div className="space-y-3 sm:space-y-5">
            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
              style={themeStyles.titleStyle}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="font-bold text-sm sm:text-lg md:text-2xl leading-relaxed"
                style={themeStyles.subtitleStyle}
              >
                {subtitle}
              </p>
            )}
            {content && (
              <div
                className="p-4 sm:p-6 rounded-2xl md:rounded-3xl border text-sm sm:text-base md:text-lg leading-relaxed backdrop-blur-md shadow-lg"
                style={themeStyles.cardStyle}
              >
                {content}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 max-h-[220px] sm:max-h-[320px] md:max-h-[440px] flex items-center justify-center"
            style={{
              borderColor: themeStyles.accentColor,
              backgroundColor: slide.theme?.cardBackgroundColor || 'rgba(15,23,42,0.8)'
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover max-h-[220px] sm:max-h-[320px] md:max-h-[440px]" />
            ) : (
              <div className="w-full h-48 sm:h-64 flex items-center justify-center text-slate-500 font-black text-sm sm:text-base">
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
    <div className="w-full h-full flex flex-col justify-center p-6 sm:p-10 md:p-14 max-w-6xl mx-auto relative z-10 overflow-hidden">
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-8">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs sm:text-sm font-black uppercase tracking-wider backdrop-blur-md shadow-sm"
          style={themeStyles.badgeStyle}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: themeStyles.accentColor }} />
          <span>Slide de Conteúdo</span>
        </div>
        <h2
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
          style={themeStyles.titleStyle}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm sm:text-lg md:text-2xl font-bold leading-relaxed"
            style={themeStyles.subtitleStyle}
          >
            {subtitle}
          </p>
        )}
      </div>

      {bullets && bullets.length > 0 && (
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {bullets.map((bullet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl border shadow-xl backdrop-blur-md transition-all hover:scale-[1.01]"
              style={themeStyles.cardStyle}
            >
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-base md:text-lg shrink-0 border shadow-md"
                style={{
                  backgroundColor: themeStyles.accentColor,
                  color: '#FFFFFF',
                  borderColor: themeStyles.accentColor
                }}
              >
                {idx + 1}
              </div>
              <span
                className="text-sm sm:text-lg md:text-2xl font-bold leading-relaxed"
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
