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
    backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #311042 50%, #0F172A 100%)',
    textColor: '#FFFFFF',
    accentColor: '#F43F5E',
    secondaryColor: '#F59E0B',
    cardBackgroundColor: 'rgba(244, 63, 94, 0.12)',
    cardBorderColor: 'rgba(244, 63, 94, 0.35)',
    fontFamily: 'Outfit',
    previewColors: ['#F43F5E', '#F59E0B', '#10B981', '#6366F1']
  },
  {
    id: 'theme_rainbow_pop',
    name: 'Rainbow Pop',
    category: 'coloridos',
    categoryLabel: 'Coloridos & Alegres',
    badge: '🌈',
    backgroundColor: '#18181B',
    backgroundGradient: 'linear-gradient(135deg, #18181B 0%, #2E1065 100%)',
    textColor: '#FFFFFF',
    accentColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    cardBackgroundColor: 'rgba(236, 72, 153, 0.15)',
    cardBorderColor: 'rgba(236, 72, 153, 0.4)',
    fontFamily: 'Poppins',
    previewColors: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981']
  },
  {
    id: 'theme_citrus_solar',
    name: 'Citrus Solar',
    category: 'coloridos',
    categoryLabel: 'Coloridos & Alegres',
    badge: '🍊',
    backgroundColor: '#1C1917',
    backgroundGradient: 'linear-gradient(135deg, #1C1917 0%, #451A03 100%)',
    textColor: '#FFF7ED',
    accentColor: '#F97316',
    secondaryColor: '#FBBF24',
    cardBackgroundColor: 'rgba(249, 115, 22, 0.14)',
    cardBorderColor: 'rgba(249, 115, 22, 0.4)',
    fontFamily: 'Outfit',
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
    backgroundGradient: 'linear-gradient(135deg, #0A1128 0%, #001F54 100%)',
    textColor: '#F8FAFC',
    accentColor: '#38BDF8',
    secondaryColor: '#818CF8',
    cardBackgroundColor: 'rgba(15, 23, 42, 0.85)',
    cardBorderColor: 'rgba(56, 189, 248, 0.25)',
    fontFamily: 'Plus Jakarta Sans',
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
    cardBackgroundColor: 'rgba(30, 41, 59, 0.7)',
    cardBorderColor: 'rgba(148, 163, 184, 0.2)',
    fontFamily: 'Inter',
    previewColors: ['#0F172A', '#475569', '#94A3B8', '#F1F5F9']
  },
  {
    id: 'theme_platinum_executive',
    name: 'Executivo Grafite & Ouro',
    category: 'empresarial',
    categoryLabel: 'Sóbrios & Empresariais',
    badge: '👑',
    backgroundColor: '#111827',
    backgroundGradient: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
    textColor: '#F9FAFB',
    accentColor: '#EAB308',
    secondaryColor: '#CA8A04',
    cardBackgroundColor: 'rgba(31, 41, 55, 0.8)',
    cardBorderColor: 'rgba(234, 179, 8, 0.35)',
    fontFamily: 'Cinzel',
    headingFontFamily: 'Cinzel',
    previewColors: ['#111827', '#EAB308', '#CA8A04', '#F9FAFB']
  },

  // 3. CYBERPUNK & NEON
  {
    id: 'theme_cyber_neon',
    name: 'Cyber Neon 2077',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '⚡',
    backgroundColor: '#09090B',
    backgroundGradient: 'linear-gradient(135deg, #09090B 0%, #1E082A 100%)',
    textColor: '#00FFFF',
    accentColor: '#FF0055',
    secondaryColor: '#00FFFF',
    cardBackgroundColor: 'rgba(255, 0, 85, 0.12)',
    cardBorderColor: '#FF0055',
    fontFamily: 'Outfit',
    previewColors: ['#FF0055', '#00FFFF', '#FFE600', '#09090B']
  },
  {
    id: 'theme_synthwave_80s',
    name: 'Synthwave 80s Retrô',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '🕹️',
    backgroundColor: '#120422',
    backgroundGradient: 'linear-gradient(180deg, #120422 0%, #2A0845 50%, #120422 100%)',
    textColor: '#FFF',
    accentColor: '#FF71CE',
    secondaryColor: '#01CDFE',
    cardBackgroundColor: 'rgba(255, 113, 206, 0.15)',
    cardBorderColor: 'rgba(1, 205, 254, 0.4)',
    fontFamily: 'Syne',
    previewColors: ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF']
  },
  {
    id: 'theme_matrix_terminal',
    name: 'Matrix Terminal',
    category: 'neon',
    categoryLabel: 'Cyberpunk & Neon',
    badge: '📟',
    backgroundColor: '#020B05',
    backgroundGradient: 'linear-gradient(180deg, #020B05 0%, #051A0C 100%)',
    textColor: '#22C55E',
    accentColor: '#4ADE80',
    secondaryColor: '#86EFAC',
    cardBackgroundColor: 'rgba(34, 197, 94, 0.1)',
    cardBorderColor: 'rgba(74, 222, 128, 0.4)',
    fontFamily: 'Roboto Mono',
    previewColors: ['#020B05', '#22C55E', '#4ADE80', '#15803D']
  },

  // 4. NATUREZA & FLORESTA
  {
    id: 'theme_amazon_forest',
    name: 'Floresta Amazônica',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🌿',
    backgroundColor: '#062817',
    backgroundGradient: 'linear-gradient(135deg, #062817 0%, #0F3D24 100%)',
    textColor: '#ECFDF5',
    accentColor: '#10B981',
    secondaryColor: '#34D399',
    cardBackgroundColor: 'rgba(16, 185, 129, 0.14)',
    cardBorderColor: 'rgba(52, 211, 153, 0.35)',
    fontFamily: 'Outfit',
    previewColors: ['#062817', '#10B981', '#34D399', '#D1FAE5']
  },
  {
    id: 'theme_bamboo_zen',
    name: 'Bambu Zen & Terra',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🎍',
    backgroundColor: '#1C1917',
    backgroundGradient: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
    textColor: '#F5F5F4',
    accentColor: '#84CC16',
    secondaryColor: '#A8A29E',
    cardBackgroundColor: 'rgba(132, 204, 22, 0.12)',
    cardBorderColor: 'rgba(132, 204, 22, 0.3)',
    fontFamily: 'Plus Jakarta Sans',
    previewColors: ['#1C1917', '#84CC16', '#65A30D', '#F5F5F4']
  },
  {
    id: 'theme_emerald_botanical',
    name: 'Esmeralda Botânica',
    category: 'floresta',
    categoryLabel: 'Natureza & Floresta',
    badge: '🍃',
    backgroundColor: '#064E3B',
    backgroundGradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    textColor: '#FFFFFF',
    accentColor: '#6EE7B7',
    secondaryColor: '#A7F3D0',
    cardBackgroundColor: 'rgba(110, 231, 183, 0.15)',
    cardBorderColor: 'rgba(110, 231, 183, 0.4)',
    fontFamily: 'Outfit',
    previewColors: ['#064E3B', '#6EE7B7', '#047857', '#FFFFFF']
  },

  // 5. PATY & PASTEL / AESTHETIC
  {
    id: 'theme_barbie_pink',
    name: 'Paty Chic / Barbie Glam',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '💅',
    backgroundColor: '#4A044E',
    backgroundGradient: 'linear-gradient(135deg, #4A044E 0%, #701A75 100%)',
    textColor: '#FDF2F8',
    accentColor: '#F472B6',
    secondaryColor: '#FB7185',
    cardBackgroundColor: 'rgba(244, 114, 182, 0.18)',
    cardBorderColor: 'rgba(244, 114, 182, 0.45)',
    fontFamily: 'Poppins',
    previewColors: ['#4A044E', '#F472B6', '#FB7185', '#FDF2F8']
  },
  {
    id: 'theme_lavender_aesthetic',
    name: 'Lavanda Dreams',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '🌸',
    backgroundColor: '#2E1065',
    backgroundGradient: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 100%)',
    textColor: '#FAF5FF',
    accentColor: '#C084FC',
    secondaryColor: '#E879F9',
    cardBackgroundColor: 'rgba(192, 132, 252, 0.15)',
    cardBorderColor: 'rgba(192, 132, 252, 0.4)',
    fontFamily: 'Outfit',
    previewColors: ['#2E1065', '#C084FC', '#E879F9', '#FAF5FF']
  },
  {
    id: 'theme_vanilla_latte',
    name: 'Vanilla Latte Soft',
    category: 'paty',
    categoryLabel: 'Paty & Aesthetic',
    badge: '☕',
    backgroundColor: '#292524',
    backgroundGradient: 'linear-gradient(135deg, #292524 0%, #44403C 100%)',
    textColor: '#FAFAF9',
    accentColor: '#FBBF24',
    secondaryColor: '#D6D3D1',
    cardBackgroundColor: 'rgba(251, 191, 36, 0.12)',
    cardBorderColor: 'rgba(251, 191, 36, 0.35)',
    fontFamily: 'Caveat',
    previewColors: ['#292524', '#FBBF24', '#D6D3D1', '#FAFAF9']
  },

  // 6. TECNOLÓGICO & FUTURISTA
  {
    id: 'theme_quantum_ai',
    name: 'Quantum AI & Neural',
    category: 'tecnologico',
    categoryLabel: 'Tecnológico & Futurista',
    badge: '🤖',
    backgroundColor: '#030712',
    backgroundGradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #0F172A 100%)',
    textColor: '#F8FAFC',
    accentColor: '#6366F1',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(99, 102, 241, 0.14)',
    cardBorderColor: 'rgba(99, 102, 241, 0.4)',
    fontFamily: 'Outfit',
    previewColors: ['#030712', '#6366F1', '#38BDF8', '#A855F7']
  },
  {
    id: 'theme_deep_space',
    name: 'Deep Space Galáxia',
    category: 'tecnologico',
    categoryLabel: 'Tecnológico & Futurista',
    badge: '🌌',
    backgroundColor: '#020617',
    backgroundGradient: 'linear-gradient(135deg, #020617 0%, #0B0F2A 50%, #1A0B2E 100%)',
    textColor: '#F1F5F9',
    accentColor: '#A855F7',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(168, 85, 247, 0.15)',
    cardBorderColor: 'rgba(168, 85, 247, 0.35)',
    fontFamily: 'Outfit',
    previewColors: ['#020617', '#A855F7', '#38BDF8', '#F1F5F9']
  },
  {
    id: 'theme_holo_blue',
    name: 'Holo Blue Futuristic',
    category: 'tecnologico',
    categoryLabel: 'Tecnológico & Futurista',
    badge: '💠',
    backgroundColor: '#051329',
    backgroundGradient: 'linear-gradient(135deg, #051329 0%, #0C2340 100%)',
    textColor: '#E0F2FE',
    accentColor: '#0284C7',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(2, 132, 199, 0.18)',
    cardBorderColor: 'rgba(56, 189, 248, 0.5)',
    fontFamily: 'Roboto Mono',
    previewColors: ['#051329', '#0284C7', '#38BDF8', '#E0F2FE']
  },

  // 7. EDUCACIONAIS & LOUSA
  {
    id: 'theme_school_chalkboard',
    name: 'Lousa Verde Escolar',
    category: 'educacional',
    categoryLabel: 'Educacionais & Lousa',
    badge: '🏫',
    backgroundColor: '#064E3B',
    backgroundGradient: 'linear-gradient(135deg, #064E3B 0%, #04382A 100%)',
    textColor: '#FEF08A',
    accentColor: '#FEF08A',
    secondaryColor: '#FFFFFF',
    cardBackgroundColor: 'rgba(254, 240, 138, 0.12)',
    cardBorderColor: 'rgba(254, 240, 138, 0.4)',
    fontFamily: 'Caveat',
    previewColors: ['#064E3B', '#FEF08A', '#FFFFFF', '#A7F3D0']
  },
  {
    id: 'theme_university_slate',
    name: 'Caderno Universitário',
    category: 'educacional',
    categoryLabel: 'Educacionais & Lousa',
    badge: '📚',
    backgroundColor: '#1E293B',
    backgroundGradient: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    textColor: '#F8FAFC',
    accentColor: '#F59E0B',
    secondaryColor: '#60A5FA',
    cardBackgroundColor: 'rgba(245, 158, 11, 0.12)',
    cardBorderColor: 'rgba(245, 158, 11, 0.35)',
    fontFamily: 'Plus Jakarta Sans',
    previewColors: ['#1E293B', '#F59E0B', '#60A5FA', '#F8FAFC']
  },
  {
    id: 'theme_blueprint_science',
    name: 'Blueprint Científico',
    category: 'educacional',
    categoryLabel: 'Educacionais & Lousa',
    badge: '🔬',
    backgroundColor: '#0F2548',
    backgroundGradient: 'linear-gradient(135deg, #0F2548 0%, #173B72 100%)',
    textColor: '#FFFFFF',
    accentColor: '#67E8F9',
    secondaryColor: '#BAE6FD',
    cardBackgroundColor: 'rgba(103, 232, 249, 0.12)',
    cardBorderColor: 'rgba(103, 232, 249, 0.4)',
    fontFamily: 'Roboto Mono',
    previewColors: ['#0F2548', '#67E8F9', '#BAE6FD', '#FFFFFF']
  },

  // 8. HISTÓRICO & PERGAMINHO
  {
    id: 'theme_ancient_papyrus',
    name: 'Papiro Ancestral',
    category: 'historico',
    categoryLabel: 'Histórico & Épico',
    badge: '📜',
    backgroundColor: '#291807',
    backgroundGradient: 'linear-gradient(135deg, #291807 0%, #45260A 100%)',
    textColor: '#FEF3C7',
    accentColor: '#D97706',
    secondaryColor: '#FDE68A',
    cardBackgroundColor: 'rgba(217, 119, 6, 0.15)',
    cardBorderColor: 'rgba(217, 119, 6, 0.45)',
    fontFamily: 'Cinzel',
    previewColors: ['#291807', '#D97706', '#FDE68A', '#FEF3C7']
  },
  {
    id: 'theme_medieval_knight',
    name: 'Era Medieval Nobre',
    category: 'historico',
    categoryLabel: 'Histórico & Épico',
    badge: '🛡️',
    backgroundColor: '#1E1B18',
    backgroundGradient: 'linear-gradient(135deg, #1E1B18 0%, #3B2F2F 100%)',
    textColor: '#FAF5FF',
    accentColor: '#E11D48',
    secondaryColor: '#EAB308',
    cardBackgroundColor: 'rgba(225, 29, 72, 0.14)',
    cardBorderColor: 'rgba(234, 179, 8, 0.4)',
    fontFamily: 'Cinzel',
    previewColors: ['#1E1B18', '#E11D48', '#EAB308', '#FAF5FF']
  },
  {
    id: 'theme_renaissance_gold',
    name: 'Renascença Dourada',
    category: 'historico',
    categoryLabel: 'Histórico & Épico',
    badge: '🏛️',
    backgroundColor: '#1B1424',
    backgroundGradient: 'linear-gradient(135deg, #1B1424 0%, #2D1B36 100%)',
    textColor: '#FFFBEB',
    accentColor: '#F59E0B',
    secondaryColor: '#C084FC',
    cardBackgroundColor: 'rgba(245, 158, 11, 0.15)',
    cardBorderColor: 'rgba(245, 158, 11, 0.4)',
    fontFamily: 'Playfair Display',
    previewColors: ['#1B1424', '#F59E0B', '#C084FC', '#FFFBEB']
  },

  // 9. FILMES & HOLLYWOOD
  {
    id: 'theme_red_carpet_cinema',
    name: 'Red Carpet Hollywood',
    category: 'filmes',
    categoryLabel: 'Filmes & Cinema',
    badge: '🎬',
    backgroundColor: '#1C0606',
    backgroundGradient: 'linear-gradient(135deg, #1C0606 0%, #450A0A 100%)',
    textColor: '#FFFFFF',
    accentColor: '#DC2626',
    secondaryColor: '#FBBF24',
    cardBackgroundColor: 'rgba(220, 38, 38, 0.16)',
    cardBorderColor: 'rgba(251, 191, 36, 0.4)',
    fontFamily: 'Bebas Neue',
    previewColors: ['#1C0606', '#DC2626', '#FBBF24', '#FFFFFF']
  },
  {
    id: 'theme_noir_classic',
    name: 'Noir Clássico P&B',
    category: 'filmes',
    categoryLabel: 'Filmes & Cinema',
    badge: '🕵️‍♂️',
    backgroundColor: '#09090B',
    backgroundGradient: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
    textColor: '#FFFFFF',
    accentColor: '#E4E4E7',
    secondaryColor: '#A1A1AA',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.08)',
    cardBorderColor: 'rgba(255, 255, 255, 0.25)',
    fontFamily: 'Playfair Display',
    previewColors: ['#09090B', '#71717A', '#E4E4E7', '#FFFFFF']
  },
  {
    id: 'theme_scifi_interstellar',
    name: 'Interestelar Sci-Fi',
    category: 'filmes',
    categoryLabel: 'Filmes & Cinema',
    badge: '🚀',
    backgroundColor: '#030712',
    backgroundGradient: 'linear-gradient(135deg, #030712 0%, #082F49 100%)',
    textColor: '#F0F9FF',
    accentColor: '#0EA5E9',
    secondaryColor: '#67E8F9',
    cardBackgroundColor: 'rgba(14, 165, 233, 0.14)',
    cardBorderColor: 'rgba(103, 232, 249, 0.4)',
    fontFamily: 'Outfit',
    previewColors: ['#030712', '#0EA5E9', '#67E8F9', '#F0F9FF']
  },

  // 10. ANIMES & MANGÁ
  {
    id: 'theme_shonen_flame',
    name: 'Shonen Flame & Energia',
    category: 'animes',
    categoryLabel: 'Animes & Mangá',
    badge: '🔥',
    backgroundColor: '#1E0B0B',
    backgroundGradient: 'linear-gradient(135deg, #1E0B0B 0%, #450A0A 50%, #7C2D12 100%)',
    textColor: '#FFF7ED',
    accentColor: '#EA580C',
    secondaryColor: '#FACC15',
    cardBackgroundColor: 'rgba(234, 88, 12, 0.18)',
    cardBorderColor: 'rgba(250, 204, 21, 0.45)',
    fontFamily: 'Bebas Neue',
    previewColors: ['#1E0B0B', '#EA580C', '#FACC15', '#FFF7ED']
  },
  {
    id: 'theme_sakura_blossom',
    name: 'Sakura Blossom Japão',
    category: 'animes',
    categoryLabel: 'Animes & Mangá',
    badge: '🌸',
    backgroundColor: '#2A0E1E',
    backgroundGradient: 'linear-gradient(135deg, #2A0E1E 0%, #4A152E 100%)',
    textColor: '#FFF1F2',
    accentColor: '#FB7185',
    secondaryColor: '#FDA4AF',
    cardBackgroundColor: 'rgba(251, 113, 133, 0.15)',
    cardBorderColor: 'rgba(251, 113, 133, 0.4)',
    fontFamily: 'Poppins',
    previewColors: ['#2A0E1E', '#FB7185', '#FDA4AF', '#FFF1F2']
  },
  {
    id: 'theme_manga_comic',
    name: 'Mangá High-Contrast',
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
    backgroundGradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
    textColor: '#FEF08A',
    accentColor: '#F43F5E',
    secondaryColor: '#38BDF8',
    cardBackgroundColor: 'rgba(244, 63, 94, 0.18)',
    cardBorderColor: '#FEF08A',
    fontFamily: 'Poppins',
    previewColors: ['#1E1B4B', '#FEF08A', '#F43F5E', '#38BDF8']
  },
  {
    id: 'theme_arcade_8bit',
    name: 'Pixel Arcade 8-Bit',
    category: 'cartoon',
    categoryLabel: 'Cartoon & Retrô Pop',
    badge: '👾',
    backgroundColor: '#0F172A',
    backgroundGradient: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)',
    textColor: '#22C55E',
    accentColor: '#F59E0B',
    secondaryColor: '#EC4899',
    cardBackgroundColor: 'rgba(245, 158, 11, 0.15)',
    cardBorderColor: 'rgba(34, 197, 94, 0.5)',
    fontFamily: 'Roboto Mono',
    previewColors: ['#0F172A', '#22C55E', '#F59E0B', '#EC4899']
  },
  {
    id: 'theme_comic_book',
    name: 'HQ Comic Book Amarelo',
    category: 'cartoon',
    categoryLabel: 'Cartoon & Retrô Pop',
    badge: '🗯️',
    backgroundColor: '#78350F',
    backgroundGradient: 'linear-gradient(135deg, #78350F 0%, #B45309 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FDE047',
    secondaryColor: '#EF4444',
    cardBackgroundColor: 'rgba(253, 224, 71, 0.15)',
    cardBorderColor: '#FDE047',
    fontFamily: 'Bebas Neue',
    previewColors: ['#78350F', '#FDE047', '#EF4444', '#FFFFFF']
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
