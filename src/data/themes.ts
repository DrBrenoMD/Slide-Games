export interface PresentationTheme {
  id: string;
  name: string;
  category:
    | 'coloridos'
    | 'sobrios'
    | 'neon'
    | 'floresta'
    | 'paty'
    | 'tecnologico'
    | 'empresarial'
    | 'educacional'
    | 'historico'
    | 'filmes'
    | 'animes'
    | 'cartoon'
    | 'personalizado';
  categoryLabel: string;
  badge: string;
  backgroundColor: string;
  backgroundGradient?: string;
  textColor: string;
  accentColor: string;
  secondaryColor?: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  overlayGraphic?:
    | 'cyber-grid'
    | 'dots'
    | 'geometric-shapes'
    | 'leaves-organic'
    | 'stars-sparkle'
    | 'film-grain'
    | 'manga-speedlines'
    | 'corporate-lines'
    | 'neon-glow'
    | 'vintage-frame'
    | 'synthwave-sun'
    | 'pixel-matrix'
    | 'none';
  cardStyle?: 'glass' | 'solid' | 'neon' | 'paper' | 'brutalist' | 'minimal' | 'cyber';
  accentBorderRadius?: string;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  previewColors: string[];
}

export const PRESENTATION_THEMES: PresentationTheme[] = [
  // 1. COLORIDOS & ALEGRES
  {
    id: 'theme_fiesta_tropical',
    name: 'Fiesta Tropical',
    category: 'coloridos',
    categoryLabel: 'Coloridos & Alegres',
    badge: '🎉',
    backgroundColor: '#0F172A',
    backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #3B0764 45%, #831843 100%)',
    textColor: '#FFFFFF',
    accentColor: '#F43F5E',
    secondaryColor: '#F59E0B',
    cardBackgroundColor: 'rgba(244, 63, 94, 0.16)',
    cardBorderColor: 'rgba(244, 63, 94, 0.45)',
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    overlayGraphic: 'dots',
    cardStyle: 'glass',
    accentBorderRadius: '28px',
    glowIntensity: 'medium',
    previewColors: ['#F43F5E', '#F59E0B', '#10B981', '#6366F1']
  },
  {
    id: 'theme_rainbow_pop',
    name: 'Rainbow Pop',
    category: 'coloridos',
    categoryLabel: 'Coloridos & Alegres',
    badge: '🌈',
    backgroundColor: '#18181B',
    backgroundGradient: 'linear-gradient(135deg, #18181B 0%, #311042 50%, #4C0519 100%)',
    textColor: '#FFFFFF',
    accentColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    cardBackgroundColor: 'rgba(236, 72, 153, 0.18)',
    cardBorderColor: 'rgba(236, 72, 153, 0.5)',
    fontFamily: 'Poppins',
    headingFontFamily: 'Poppins',
    overlayGraphic: 'geometric-shapes',
    cardStyle: 'glass',
    accentBorderRadius: '24px',
    glowIntensity: 'high',
    previewColors: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981']
  },
  {
    id: 'theme_citrus_solar',
    name: 'Citrus Solar',
    category: 'coloridos',
    categoryLabel: 'Coloridos & Alegres',
    badge: '🍊',
    backgroundColor: '#1C1917',
    backgroundGradient: 'linear-gradient(135deg, #1C1917 0%, #451A03 50%, #7C2D12 100%)',
    textColor: '#FFF7ED',
    accentColor: '#F97316',
    secondaryColor: '#FBBF24',
    cardBackgroundColor: 'rgba(249, 115, 22, 0.16)',
    cardBorderColor: 'rgba(249, 115, 22, 0.45)',
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    overlayGraphic: 'dots',
    cardStyle: 'glass',
    accentBorderRadius: '24px',
    glowIntensity: 'medium',
    previewColors: ['#F97316', '#FBBF24', '#EF4444', '#84CC16']
  },

  // 2. SÓBRIOS & EMPRESARIAIS
  {
    id: 'theme_corporate_navy',
    name: 'Corporativo Navy',
    category: 'empresarial',
    categoryLabel: 'Sóbrios & Empresariais',
    badge: '💼',
    backgroundColor: '#0A1128',
    backgroundGradient: 'linear-gradient(135deg, #0A1128 0%, #001F54 50%, #034078 100%)',
    textColor: '#F8FAFC',
    accentColor: '#38BDF8',
    secondaryColor: '#818CF8',
    cardBackgroundColor: 'rgba(15, 23, 42, 0.85)',
    cardBorderColor: 'rgba(56, 189, 248, 0.3)',
    fontFamily: 'Plus Jakarta Sans',
    headingFontFamily: 'Plus Jakarta Sans',
    overlayGraphic: 'corporate-lines',
    cardStyle: 'glass',
    accentBorderRadius: '16px',
    glowIntensity: 'low',
    previewColors: ['#0A1128', '#38BDF8', '#818CF8', '#FFFFFF']
  },
  {
    id: 'theme_slate_minimal',
    name: 'Slate Minimal',
    category: 'sobrios',
    categoryLabel: 'Sóbrios & Empresariais',
    badge: '📐',
    backgroundColor: '#0F172A',
    backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    textColor: '#E2E8F0',
    accentColor: '#94A3B8',
    secondaryColor: '#CBD5E1',
    cardBackgroundColor: 'rgba(30, 41, 59, 0.75)',
    cardBorderColor: 'rgba(148, 163, 184, 0.25)',
    fontFamily: 'Inter',
    headingFontFamily: 'Inter',
    overlayGraphic: 'corporate-lines',
    cardStyle: 'minimal',
    accentBorderRadius: '16px',
    glowIntensity: 'none',
    previewColors: ['#0F172A', '#475569', '#94A3B8', '#F1F5F9']
  },
  {
    id: 'theme_platinum_executive',
    name: 'Executivo Grafite & Ouro',
    category: 'empresarial',
    categoryLabel: 'Sóbrios & Empresariais',
    badge: '👑',
    backgroundColor: '#090D16',
    backgroundGradient: 'linear-gradient(135deg, #090D16 0%, #1E1B18 50%, #2A2416 100%)',
    textColor: '#FEF08A',
    accentColor: '#EAB308',
    secondaryColor: '#FACC15',
    cardBackgroundColor: 'rgba(30, 27, 24, 0.85)',
    cardBorderColor: 'rgba(234, 179, 8, 0.4)',
    fontFamily: 'Cinzel',
    headingFontFamily: 'Cinzel',
    overlayGraphic: 'corporate-lines',
    cardStyle: 'glass',
    accentBorderRadius: '14px',
    glowIntensity: 'medium',
    previewColors: ['#090D16', '#EAB308', '#CA8A04', '#FEF08A']
  },

  // 3. CYBERPUNK & NEON
  {
    id: 'theme_cyber_neon',
    name: 'Cyber Neon 2077',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '⚡',
    backgroundColor: '#05050A',
    backgroundGradient: 'linear-gradient(135deg, #05050A 0%, #1A0525 50%, #001220 100%)',
    textColor: '#00FFFF',
    accentColor: '#FF0055',
    secondaryColor: '#00FFFF',
    cardBackgroundColor: 'rgba(255, 0, 85, 0.12)',
    cardBorderColor: '#FF0055',
    fontFamily: 'Orbitron',
    headingFontFamily: 'Orbitron',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'neon',
    accentBorderRadius: '12px',
    glowIntensity: 'high',
    previewColors: ['#FF0055', '#00FFFF', '#FFE600', '#05050A']
  },
  {
    id: 'theme_synthwave_80s',
    name: 'Synthwave 80s Retrô',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '🕹️',
    backgroundColor: '#0F031E',
    backgroundGradient: 'linear-gradient(180deg, #0F031E 0%, #2D0B4E 40%, #17042B 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FF71CE',
    secondaryColor: '#01CDFE',
    cardBackgroundColor: 'rgba(255, 113, 206, 0.16)',
    cardBorderColor: 'rgba(1, 205, 254, 0.5)',
    fontFamily: 'Syne',
    headingFontFamily: 'Syne',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'neon',
    accentBorderRadius: '20px',
    glowIntensity: 'high',
    previewColors: ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF']
  },
  {
    id: 'theme_matrix_terminal',
    name: 'Matrix Terminal Hacker',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '📟',
    backgroundColor: '#020B05',
    backgroundGradient: 'linear-gradient(180deg, #020B05 0%, #051A0C 50%, #020B05 100%)',
    textColor: '#22C55E',
    accentColor: '#4ADE80',
    secondaryColor: '#86EFAC',
    cardBackgroundColor: 'rgba(6, 78, 59, 0.3)',
    cardBorderColor: '#22C55E',
    fontFamily: 'JetBrains Mono',
    headingFontFamily: 'JetBrains Mono',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'cyber',
    accentBorderRadius: '8px',
    glowIntensity: 'high',
    previewColors: ['#020B05', '#22C55E', '#4ADE80', '#15803D']
  },

  // 4. NATUREZA & FLORESTA
  {
    id: 'theme_amazon_forest',
    name: 'Floresta Amazônica',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🌿',
    backgroundColor: '#041F12',
    backgroundGradient: 'linear-gradient(135deg, #041F12 0%, #0D3E24 50%, #064E3B 100%)',
    textColor: '#ECFDF5',
    accentColor: '#10B981',
    secondaryColor: '#34D399',
    cardBackgroundColor: 'rgba(16, 185, 129, 0.15)',
    cardBorderColor: 'rgba(52, 211, 153, 0.4)',
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    overlayGraphic: 'leaves-organic',
    cardStyle: 'glass',
    accentBorderRadius: '28px',
    glowIntensity: 'medium',
    previewColors: ['#041F12', '#10B981', '#34D399', '#D1FAE5']
  },
  {
    id: 'theme_bamboo_zen',
    name: 'Bambu Zen & Terra',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🎍',
    backgroundColor: '#1C1917',
    backgroundGradient: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #1E291B 100%)',
    textColor: '#F5F5F4',
    accentColor: '#84CC16',
    secondaryColor: '#A8A29E',
    cardBackgroundColor: 'rgba(132, 204, 22, 0.14)',
    cardBorderColor: 'rgba(132, 204, 22, 0.35)',
    fontFamily: 'Plus Jakarta Sans',
    headingFontFamily: 'Plus Jakarta Sans',
    overlayGraphic: 'leaves-organic',
    cardStyle: 'glass',
    accentBorderRadius: '20px',
    glowIntensity: 'low',
    previewColors: ['#1C1917', '#84CC16', '#65A30D', '#F5F5F4']
  },
  {
    id: 'theme_emerald_botanical',
    name: 'Esmeralda Botânica',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🍃',
    backgroundColor: '#032D23',
    backgroundGradient: 'linear-gradient(135deg, #032D23 0%, #064E3B 50%, #047857 100%)',
    textColor: '#FFFFFF',
    accentColor: '#6EE7B7',
    secondaryColor: '#A7F3D0',
    cardBackgroundColor: 'rgba(110, 231, 183, 0.16)',
    cardBorderColor: 'rgba(110, 231, 183, 0.45)',
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    overlayGraphic: 'leaves-organic',
    cardStyle: 'glass',
    accentBorderRadius: '24px',
    glowIntensity: 'medium',
    previewColors: ['#032D23', '#6EE7B7', '#047857', '#FFFFFF']
  },

  // 5. PATY & PASTEL / AESTHETIC
  {
    id: 'theme_barbie_pink',
    name: 'Paty Chic / Barbie Glam',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '💅',
    backgroundColor: '#3B0740',
    backgroundGradient: 'linear-gradient(135deg, #3B0740 0%, #701A75 50%, #9D174D 100%)',
    textColor: '#FDF2F8',
    accentColor: '#F472B6',
    secondaryColor: '#FB7185',
    cardBackgroundColor: 'rgba(244, 114, 182, 0.2)',
    cardBorderColor: 'rgba(244, 114, 182, 0.55)',
    fontFamily: 'Poppins',
    headingFontFamily: 'Poppins',
    overlayGraphic: 'stars-sparkle',
    cardStyle: 'glass',
    accentBorderRadius: '32px',
    glowIntensity: 'high',
    previewColors: ['#3B0740', '#F472B6', '#FB7185', '#FDF2F8']
  },
  {
    id: 'theme_lavender_aesthetic',
    name: 'Lavanda Dreams',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '🌸',
    backgroundColor: '#1E0A3C',
    backgroundGradient: 'linear-gradient(135deg, #1E0A3C 0%, #3B166A 50%, #581C87 100%)',
    textColor: '#FAF5FF',
    accentColor: '#C084FC',
    secondaryColor: '#E879F9',
    cardBackgroundColor: 'rgba(192, 132, 252, 0.18)',
    cardBorderColor: 'rgba(192, 132, 252, 0.45)',
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    overlayGraphic: 'stars-sparkle',
    cardStyle: 'glass',
    accentBorderRadius: '28px',
    glowIntensity: 'high',
    previewColors: ['#1E0A3C', '#C084FC', '#E879F9', '#FAF5FF']
  },
  {
    id: 'theme_rose_gold_luxury',
    name: 'Rosé Gold Imperial',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '✨',
    backgroundColor: '#2A0E1A',
    backgroundGradient: 'linear-gradient(135deg, #2A0E1A 0%, #4C1D30 50%, #3A1024 100%)',
    textColor: '#FFF1F2',
    accentColor: '#FDA4AF',
    secondaryColor: '#F43F5E',
    cardBackgroundColor: 'rgba(253, 164, 175, 0.15)',
    cardBorderColor: 'rgba(253, 164, 175, 0.4)',
    fontFamily: 'Playfair Display',
    headingFontFamily: 'Playfair Display',
    overlayGraphic: 'stars-sparkle',
    cardStyle: 'glass',
    accentBorderRadius: '20px',
    glowIntensity: 'medium',
    previewColors: ['#2A0E1A', '#FDA4AF', '#F43F5E', '#FFF1F2']
  },

  // 6. TECNOLÓGICO & IA
  {
    id: 'theme_ai_future',
    name: 'Inteligência Artificial 3.0',
    category: 'tecnologico',
    categoryLabel: 'Tecnológico & IA',
    badge: '🤖',
    backgroundColor: '#030712',
    backgroundGradient: 'linear-gradient(135deg, #030712 0%, #0F172A 50%, #1E1B4B 100%)',
    textColor: '#E0F2FE',
    accentColor: '#38BDF8',
    secondaryColor: '#818CF8',
    cardBackgroundColor: 'rgba(14, 165, 233, 0.12)',
    cardBorderColor: 'rgba(56, 189, 248, 0.4)',
    fontFamily: 'Space Grotesk',
    headingFontFamily: 'Space Grotesk',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'glass',
    accentBorderRadius: '18px',
    glowIntensity: 'high',
    previewColors: ['#030712', '#38BDF8', '#818CF8', '#E0F2FE']
  },
  {
    id: 'theme_hologram_glow',
    name: 'Holograma Quântico',
    category: 'tecnologico',
    categoryLabel: 'Tecnológico & IA',
    badge: '🌌',
    backgroundColor: '#020617',
    backgroundGradient: 'linear-gradient(135deg, #020617 0%, #082F49 50%, #0C4A6E 100%)',
    textColor: '#F0F9FF',
    accentColor: '#00FFFF',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(0, 255, 255, 0.12)',
    cardBorderColor: 'rgba(0, 255, 255, 0.45)',
    fontFamily: 'Orbitron',
    headingFontFamily: 'Orbitron',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'neon',
    accentBorderRadius: '16px',
    glowIntensity: 'high',
    previewColors: ['#020617', '#00FFFF', '#38BDF8', '#F0F9FF']
  },

  // 7. EDUCACIONAIS & LOUSA
  {
    id: 'theme_chalkboard_green',
    name: 'Lousa Verde Escolar',
    category: 'educacional',
    categoryLabel: 'Educacionais & Lousa',
    badge: '🏫',
    backgroundColor: '#0B291B',
    backgroundGradient: 'linear-gradient(135deg, #0B291B 0%, #133D29 50%, #0E3321 100%)',
    textColor: '#FEF08A',
    accentColor: '#FDE047',
    secondaryColor: '#86EFAC',
    cardBackgroundColor: 'rgba(254, 240, 138, 0.12)',
    cardBorderColor: 'rgba(254, 240, 138, 0.35)',
    fontFamily: 'Caveat',
    headingFontFamily: 'Caveat',
    overlayGraphic: 'dots',
    cardStyle: 'glass',
    accentBorderRadius: '16px',
    glowIntensity: 'low',
    previewColors: ['#0B291B', '#FEF08A', '#FDE047', '#86EFAC']
  },
  {
    id: 'theme_blueprint_math',
    name: 'Blueprint Engenharia',
    category: 'educacional',
    categoryLabel: 'Educacionais & Lousa',
    badge: '📐',
    backgroundColor: '#002B5B',
    backgroundGradient: 'linear-gradient(135deg, #002B5B 0%, #1A5F7A 100%)',
    textColor: '#FFFFFF',
    accentColor: '#57C5B6',
    secondaryColor: '#159895',
    cardBackgroundColor: 'rgba(87, 197, 182, 0.15)',
    cardBorderColor: 'rgba(87, 197, 182, 0.5)',
    fontFamily: 'Roboto Mono',
    headingFontFamily: 'Space Grotesk',
    overlayGraphic: 'corporate-lines',
    cardStyle: 'glass',
    accentBorderRadius: '12px',
    glowIntensity: 'medium',
    previewColors: ['#002B5B', '#57C5B6', '#159895', '#FFFFFF']
  },

  // 8. HISTÓRICO & ÉPICO
  {
    id: 'theme_pergaminho_medieval',
    name: 'Pergaminho Antigo',
    category: 'historico',
    categoryLabel: 'Histórico & Épico',
    badge: '📜',
    backgroundColor: '#1E140A',
    backgroundGradient: 'linear-gradient(135deg, #1E140A 0%, #36220F 50%, #2A190B 100%)',
    textColor: '#FEF3C7',
    accentColor: '#F59E0B',
    secondaryColor: '#D97706',
    cardBackgroundColor: 'rgba(245, 158, 11, 0.15)',
    cardBorderColor: 'rgba(245, 158, 11, 0.45)',
    fontFamily: 'Cinzel',
    headingFontFamily: 'Cinzel',
    overlayGraphic: 'vintage-frame',
    cardStyle: 'glass',
    accentBorderRadius: '16px',
    glowIntensity: 'low',
    previewColors: ['#1E140A', '#F59E0B', '#D97706', '#FEF3C7']
  },
  {
    id: 'theme_imperio_romano',
    name: 'Império Romano Púrpura & Ouro',
    category: 'historico',
    categoryLabel: 'Histórico & Épico',
    badge: '🏛️',
    backgroundColor: '#2E021A',
    backgroundGradient: 'linear-gradient(135deg, #2E021A 0%, #4A0429 50%, #260215 100%)',
    textColor: '#FEF9C3',
    accentColor: '#EAB308',
    secondaryColor: '#FACC15',
    cardBackgroundColor: 'rgba(234, 179, 8, 0.16)',
    cardBorderColor: '#EAB308',
    fontFamily: 'Cinzel',
    headingFontFamily: 'Cinzel',
    overlayGraphic: 'vintage-frame',
    cardStyle: 'glass',
    accentBorderRadius: '14px',
    glowIntensity: 'medium',
    previewColors: ['#2E021A', '#EAB308', '#FACC15', '#FEF9C3']
  },

  // 9. FILMES & CINEMA
  {
    id: 'theme_cinema_noir',
    name: 'Cinema Noir Preto & Branco',
    category: 'filmes',
    categoryLabel: 'Filmes & Cinema',
    badge: '🎬',
    backgroundColor: '#050505',
    backgroundGradient: 'linear-gradient(180deg, #050505 0%, #171717 50%, #0A0A0A 100%)',
    textColor: '#FFFFFF',
    accentColor: '#E5E5E5',
    secondaryColor: '#A3A3A3',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.08)',
    cardBorderColor: 'rgba(255, 255, 255, 0.25)',
    fontFamily: 'Montserrat',
    headingFontFamily: 'Montserrat',
    overlayGraphic: 'corporate-lines',
    cardStyle: 'minimal',
    accentBorderRadius: '12px',
    glowIntensity: 'none',
    previewColors: ['#050505', '#FFFFFF', '#A3A3A3', '#525252']
  },
  {
    id: 'theme_scifi_blockbuster',
    name: 'Sci-Fi Interestelar',
    category: 'filmes',
    categoryLabel: 'Filmes & Cinema',
    badge: '🚀',
    backgroundColor: '#02020A',
    backgroundGradient: 'linear-gradient(135deg, #02020A 0%, #0B0E28 50%, #150E36 100%)',
    textColor: '#FFFFFF',
    accentColor: '#38BDF8',
    secondaryColor: '#A855F7',
    cardBackgroundColor: 'rgba(56, 189, 248, 0.14)',
    cardBorderColor: 'rgba(168, 85, 247, 0.45)',
    fontFamily: 'Space Grotesk',
    headingFontFamily: 'Space Grotesk',
    overlayGraphic: 'cyber-grid',
    cardStyle: 'glass',
    accentBorderRadius: '20px',
    glowIntensity: 'high',
    previewColors: ['#02020A', '#38BDF8', '#A855F7', '#FFFFFF']
  },

  // 10. ANIMES & MANGÁ
  {
    id: 'theme_shonen_fire',
    name: 'Shonen Fire Action',
    category: 'animes',
    categoryLabel: 'Animes & Mangá',
    badge: '🔥',
    backgroundColor: '#1C0606',
    backgroundGradient: 'linear-gradient(135deg, #1C0606 0%, #450A0A 50%, #7F1D1D 100%)',
    textColor: '#FEF08A',
    accentColor: '#EF4444',
    secondaryColor: '#F59E0B',
    cardBackgroundColor: 'rgba(239, 68, 68, 0.18)',
    cardBorderColor: '#EF4444',
    fontFamily: 'Bebas Neue',
    headingFontFamily: 'Bebas Neue',
    overlayGraphic: 'manga-speedlines',
    cardStyle: 'neon',
    accentBorderRadius: '16px',
    glowIntensity: 'high',
    previewColors: ['#1C0606', '#EF4444', '#F59E0B', '#FEF08A']
  },
  {
    id: 'theme_manga_comic',
    name: 'Mangá High-Contrast P&B',
    category: 'animes',
    categoryLabel: 'Animes & Mangá',
    badge: '💥',
    backgroundColor: '#000000',
    backgroundGradient: 'linear-gradient(135deg, #000000 0%, #18181B 100%)',
    textColor: '#FFFFFF',
    accentColor: '#EF4444',
    secondaryColor: '#F59E0B',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.12)',
    cardBorderColor: '#FFFFFF',
    fontFamily: 'Bebas Neue',
    headingFontFamily: 'Bebas Neue',
    overlayGraphic: 'manga-speedlines',
    cardStyle: 'brutalist',
    accentBorderRadius: '8px',
    glowIntensity: 'medium',
    previewColors: ['#000000', '#FFFFFF', '#EF4444', '#F59E0B']
  },

  // 11. CARTOON & RETRÔ POP
  {
    id: 'theme_cartoon_pop',
    name: 'Cartoon Pop Art',
    category: 'cartoon',
    categoryLabel: 'Cartoon & Retrô Pop',
    badge: '🎨',
    backgroundColor: '#1E1B4B',
    backgroundGradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
    textColor: '#FEF08A',
    accentColor: '#F43F5E',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(244, 63, 94, 0.2)',
    cardBorderColor: '#FEF08A',
    fontFamily: 'Righteous',
    headingFontFamily: 'Righteous',
    overlayGraphic: 'dots',
    cardStyle: 'glass',
    accentBorderRadius: '28px',
    glowIntensity: 'high',
    previewColors: ['#1E1B4B', '#FEF08A', '#F43F5E', '#38BDF8']
  },
  {
    id: 'theme_arcade_8bit',
    name: 'Pixel Arcade 8-Bit',
    category: 'cartoon',
    categoryLabel: 'Cartoon & Retrô Pop',
    badge: '👾',
    backgroundColor: '#080814',
    backgroundGradient: 'linear-gradient(180deg, #080814 0%, #161638 50%, #0F0F24 100%)',
    textColor: '#22C55E',
    accentColor: '#F59E0B',
    secondaryColor: '#EC4899',
    cardBackgroundColor: 'rgba(245, 158, 11, 0.16)',
    cardBorderColor: '#22C55E',
    fontFamily: 'Press Start 2P',
    headingFontFamily: 'Press Start 2P',
    overlayGraphic: 'dots',
    cardStyle: 'neon',
    accentBorderRadius: '4px',
    glowIntensity: 'high',
    previewColors: ['#080814', '#22C55E', '#F59E0B', '#EC4899']
  },
  {
    id: 'theme_comic_book',
    name: 'HQ Comic Book Amarelo',
    category: 'cartoon',
    categoryLabel: 'Cartoon & Retrô Pop',
    badge: '🗯️',
    backgroundColor: '#451A03',
    backgroundGradient: 'linear-gradient(135deg, #451A03 0%, #78350F 50%, #92400E 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FDE047',
    secondaryColor: '#EF4444',
    cardBackgroundColor: 'rgba(253, 224, 71, 0.18)',
    cardBorderColor: '#FDE047',
    fontFamily: 'Bebas Neue',
    headingFontFamily: 'Bebas Neue',
    overlayGraphic: 'dots',
    cardStyle: 'brutalist',
    accentBorderRadius: '12px',
    glowIntensity: 'medium',
    previewColors: ['#451A03', '#FDE047', '#EF4444', '#FFFFFF']
  }
];

export const THEME_CATEGORIES = [
  { id: 'all', label: 'Todos os Temas (30+)', icon: '✨' },
  { id: 'coloridos', label: 'Coloridos & Alegres', icon: '🎉' },
  { id: 'sobrios', label: 'Sóbrios & Corporativos', icon: '📐' },
  { id: 'neon', label: 'Cyberpunk & Neon', icon: '⚡' },
  { id: 'floresta', label: 'Natureza & Floresta', icon: '🌿' },
  { id: 'paty', label: 'Paty & Aesthetic', icon: '💅' },
  { id: 'tecnologico', label: 'Tecnológico & IA', icon: '🤖' },
  { id: 'educacional', label: 'Educacionais & Lousa', icon: '📚' },
  { id: 'historico', label: 'Histórico & Épico', icon: '📜' },
  { id: 'filmes', label: 'Filmes & Cinema', icon: '🎬' },
  { id: 'animes', label: 'Animes & Mangá', icon: '🔥' },
  { id: 'cartoon', label: 'Cartoon & Pop Art', icon: '🎨' },
  { id: 'personalizado', label: 'Tema Personalizado', icon: '🛠️' }
];

export const getThemeById = (id?: string): PresentationTheme => {
  if (!id) return PRESENTATION_THEMES[0];
  const found = PRESENTATION_THEMES.find((t) => t.id === id);
  return found || PRESENTATION_THEMES[0];
};
