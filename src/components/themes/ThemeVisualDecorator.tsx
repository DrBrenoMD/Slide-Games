import React from 'react';
import { Slide } from '../../types';

interface ThemeVisualDecoratorProps {
  theme?: Slide['theme'];
  className?: string;
}

export const ThemeVisualDecorator: React.FC<ThemeVisualDecoratorProps> = ({
  theme,
  className = ''
}) => {
  if (!theme) return null;

  const category = theme.category || 'coloridos';
  const overlayGraphic = theme.overlayGraphic;
  const accent = theme.accentColor || '#6366F1';
  const secondary = theme.secondaryColor || '#EC4899';
  const themeId = theme.id || '';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. EFEITO DE LUZ AMBIENTE / GLOW RADIAL ESPECÍFICO DE CADA TEMA */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] opacity-25"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[110px] opacity-20"
        style={{ backgroundColor: secondary }}
      />

      {/* 2. OVERLAYS GRÁFICOS PERSONALIZADOS POR CATEGORIA E TEMA */}

      {/* A) CYBERPUNK / TECH / NEON */}
      {(overlayGraphic === 'cyber-grid' ||
        overlayGraphic === 'neon-glow' ||
        category === 'neon' ||
        category === 'tecnologico' ||
        themeId.includes('cyber') ||
        themeId.includes('matrix')) && (
        <>
          {/* Grade Tecnológica no Fundo */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `linear-gradient(to right, ${accent} 1px, transparent 1px), linear-gradient(to bottom, ${accent} 1px, transparent 1px)`,
              backgroundSize: '48px 48px'
            }}
          />

          {/* Cantoneiras Futuristas Neon nos 4 Cantos */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: accent }} />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: accent }} />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: secondary }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: secondary }} />

          {/* Mira / Crosshair Decorativo */}
          <div className="absolute top-6 right-16 flex items-center gap-1.5 opacity-40 font-mono text-[9px]" style={{ color: accent }}>
            <span>[ SYS_LIVE // SECURE ]</span>
          </div>

          {/* Linha de Feixe Horizontal */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, ${secondary}, transparent)`
            }}
          />
        </>
      )}

      {/* B) FLORESTA / NATUREZA */}
      {(overlayGraphic === 'leaves-organic' ||
        category === 'floresta' ||
        themeId.includes('forest') ||
        themeId.includes('amazon') ||
        themeId.includes('botanical') ||
        themeId.includes('bamboo')) && (
        <>
          {/* Folhas e Silhuetas Orgânicas nos Cantos */}
          <svg
            className="absolute -top-6 -right-6 w-44 h-44 opacity-20"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M180 20C120 40 80 100 70 180C100 150 150 120 180 20Z"
              fill={accent}
            />
            <path
              d="M190 60C140 80 110 130 100 190C130 160 170 140 190 60Z"
              fill={secondary}
            />
            <circle cx="140" cy="80" r="4" fill={accent} />
            <circle cx="160" cy="110" r="6" fill={secondary} />
          </svg>

          <svg
            className="absolute -bottom-6 -left-6 w-44 h-44 opacity-20 transform rotate-180"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M180 20C120 40 80 100 70 180C100 150 150 120 180 20Z"
              fill={accent}
            />
          </svg>

          {/* Partículas de Orvalho / Luz Natural */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(${accent} 1.5px, transparent 1.5px)`,
              backgroundSize: '36px 36px'
            }}
          />
        </>
      )}

      {/* C) PATY / BARBIECORE / GLAM / ESTÉTICA */}
      {(overlayGraphic === 'stars-sparkle' ||
        category === 'paty' ||
        themeId.includes('barbie') ||
        themeId.includes('princess') ||
        themeId.includes('rose_gold') ||
        themeId.includes('cotton_candy') ||
        themeId.includes('lavender')) && (
        <>
          {/* Estrelas Brilhantes e Sparkles ✨ */}
          <div className="absolute top-8 left-12 text-2xl animate-pulse opacity-40">✨</div>
          <div className="absolute top-14 right-20 text-lg animate-bounce opacity-50">✦</div>
          <div className="absolute bottom-12 left-20 text-xl animate-pulse opacity-40">💖</div>
          <div className="absolute bottom-16 right-16 text-3xl animate-pulse opacity-30">✨</div>
          <div className="absolute top-1/2 left-8 text-sm opacity-30">✦</div>
          <div className="absolute top-1/3 right-10 text-base opacity-40">★</div>

          {/* Moldura Suave Glossy */}
          <div
            className="absolute inset-3 rounded-3xl border opacity-30 pointer-events-none"
            style={{
              borderColor: accent,
              boxShadow: `inset 0 0 40px ${accent}22`
            }}
          />
        </>
      )}

      {/* D) SÓBRIOS / EMPRESARIAL / CORPORATIVO */}
      {(overlayGraphic === 'corporate-lines' ||
        category === 'empresarial' ||
        category === 'sobrios' ||
        themeId.includes('corporate') ||
        themeId.includes('navy') ||
        themeId.includes('slate') ||
        themeId.includes('executive')) && (
        <>
          {/* Linhas Estruturais Elegantes */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(45deg, #FFFFFF 25%, transparent 25%, transparent 75%, #FFFFFF 75%, #FFFFFF), linear-gradient(45deg, #FFFFFF 25%, transparent 25%, transparent 75%, #FFFFFF 75%, #FFFFFF)`,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 30px'
            }}
          />

          {/* Linha Divisória de Alta Precisão no Topo */}
          <div
            className="absolute top-0 left-8 right-8 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`
            }}
          />

          {/* Ângulos Geométricos Discretos */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l opacity-30" style={{ borderColor: accent }} />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r opacity-30" style={{ borderColor: accent }} />
        </>
      )}

      {/* E) HISTÓRICO / VINTAGE / MEDIEVAL */}
      {(overlayGraphic === 'vintage-frame' ||
        category === 'historico' ||
        themeId.includes('pergaminho') ||
        themeId.includes('romano') ||
        themeId.includes('medieval') ||
        themeId.includes('victorian')) && (
        <>
          {/* Moldura Antiga e Ornamentos */}
          <div
            className="absolute inset-4 rounded-2xl border-2 opacity-35"
            style={{ borderColor: accent }}
          />
          <div
            className="absolute inset-6 rounded-xl border opacity-25"
            style={{ borderColor: secondary }}
          />

          {/* Ornamentos nos 4 Cantos */}
          <div className="absolute top-3 left-3 text-sm opacity-50" style={{ color: accent }}>⚜</div>
          <div className="absolute top-3 right-3 text-sm opacity-50" style={{ color: accent }}>⚜</div>
          <div className="absolute bottom-3 left-3 text-sm opacity-50" style={{ color: accent }}>⚜</div>
          <div className="absolute bottom-3 right-3 text-sm opacity-50" style={{ color: accent }}>⚜</div>
        </>
      )}

      {/* F) ANIMES / MANGÁ / SHONEN */}
      {(overlayGraphic === 'manga-speedlines' ||
        category === 'animes' ||
        themeId.includes('manga') ||
        themeId.includes('shonen') ||
        themeId.includes('anime')) && (
        <>
          {/* Linhas de Ação e Velocidade Mangá */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="300" y2="300" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" />
            <line x1="100%" y1="0" x2="70%" y2="40%" stroke={accent} strokeWidth="2" />
            <line x1="0" y1="100%" x2="35%" y2="65%" stroke={secondary} strokeWidth="2" />
            <line x1="100%" y1="100%" x2="60%" y2="60%" stroke={accent} strokeWidth="1.5" strokeDasharray="8 6" />
          </svg>

          {/* Vinheta de Ação */}
          <div className="absolute top-4 left-6 font-black tracking-widest text-[10px] uppercase opacity-40" style={{ color: accent }}>
            ⚡ ACTION // CLIMAX
          </div>
        </>
      )}

      {/* G) CARTOON / POP ART / RETRÔ 8-BIT */}
      {(overlayGraphic === 'dots' ||
        overlayGraphic === 'synthwave-sun' ||
        overlayGraphic === 'pixel-matrix' ||
        category === 'cartoon' ||
        themeId.includes('cartoon') ||
        themeId.includes('arcade') ||
        themeId.includes('comic') ||
        themeId.includes('synthwave')) && (
        <>
          {/* Pontos Pop Art Halftone */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(${accent} 2px, transparent 2px)`,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Formas Geométricas Divertidas Flutuantes */}
          <div
            className="absolute top-10 right-14 w-8 h-8 rounded-full border-2 opacity-30 transform rotate-12"
            style={{ borderColor: secondary }}
          />
          <div
            className="absolute bottom-12 left-14 w-6 h-6 border-2 opacity-30 transform rotate-45"
            style={{ borderColor: accent }}
          />
          <div className="absolute top-1/4 left-10 text-xl opacity-30">💥</div>
        </>
      )}

      {/* H) FILMES / CINEMA NOIR / SCI-FI */}
      {(category === 'filmes' ||
        themeId.includes('cinema') ||
        themeId.includes('hollywood') ||
        themeId.includes('scifi')) && (
        <>
          {/* Letterbox / Barra Cinematográfica Sutil */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-3 right-6 font-mono text-[9px] opacity-35 tracking-widest text-white">
            ● REC 4K 60FPS
          </div>
        </>
      )}

      {/* I) EDUCACIONAL / LOUSA / PAPEL */}
      {(category === 'educacional' ||
        themeId.includes('chalkboard') ||
        themeId.includes('notebook') ||
        themeId.includes('blueprint')) && (
        <>
          {/* Grade de Caderno / Blueprint */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `linear-gradient(to right, ${accent}66 1px, transparent 1px), linear-gradient(to bottom, ${accent}66 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }}
          />
          <div className="absolute top-3 left-6 font-mono text-[10px] opacity-40 font-bold" style={{ color: accent }}>
            ✏️ MATÉRIA // CADERNO DE NOTAS
          </div>
        </>
      )}
    </div>
  );
};
