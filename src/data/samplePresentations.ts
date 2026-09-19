import { Slide } from '../types';

export const SAMPLE_PRESENTATION_SLIDES: Slide[] = [
  // 1. Lobby QR Code
  {
    id: 'slide-lobby-1',
    type: 'content_qrcode_lobby',
    title: 'Apresentação Interativa',
    subtitle: 'Aponte a câmera do seu celular para o QR Code ou acesse com o PIN',
    content: 'Participe ativamente pelo seu celular: vote, responda quizes, ganhe pontos e jogue com todo mundo!',
    theme: {
      backgroundColor: '#0F172A',
      accentColor: '#6366F1',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'fade',
      duration: 0.6,
      backgroundEffect: 'particles'
    }
  },

  // 2. Slide de Conteúdo Canva / PPT
  {
    id: 'slide-content-intro',
    type: 'content_bullets',
    title: 'Como Vai Funcionar Nossa Sessão',
    subtitle: 'Prepare seu celular para uma experiência dinâmica e envolvente',
    bullets: [
      '⚡ Quizes Competitivos: responder rápido acumula mais pontos!',
      '📊 Enquetes e Votações de Opinião em tempo real',
      '🎯 Apontar na Imagem & Sprint de Vocabulário',
      '🕵️ O Infiltrado: jogo de blefe e dedução social ao vivo'
    ],
    theme: {
      backgroundColor: '#0B132B',
      accentColor: '#38BDF8',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'kinetic',
      duration: 0.7,
      backgroundEffect: 'grid'
    }
  },

  // 3. Quiz Competitivo: Múltipla Escolha com Speed Bonus
  {
    id: 'slide-quiz-multi-1',
    type: 'quiz_multiple_choice',
    title: 'Qual foi o primeiro satélite artificial lançado ao espaço?',
    subtitle: 'Quiz Competitivo • Quem responder mais rápido ganha mais pontos!',
    isCompetitive: true,
    pointsBase: 1000,
    speedBonus: true,
    timeLimitSeconds: 20,
    showRankingAfter: true,
    options: [
      { id: 'opt-1', text: 'Apollo 11', isCorrect: false, color: '#EF4444', icon: '🔺' },
      { id: 'opt-2', text: 'Sputnik 1', isCorrect: true, color: '#3B82F6', icon: '🔷' },
      { id: 'opt-3', text: 'Voyager 1', isCorrect: false, color: '#F59E0B', icon: '🟡' },
      { id: 'opt-4', text: 'Hubble', isCorrect: false, color: '#10B981', icon: '🟩' },
    ],
    theme: {
      backgroundColor: '#1E1B4B',
      accentColor: '#818CF8',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'spring',
      duration: 0.5,
      backgroundEffect: 'pulse'
    }
  },

  // 4. Quiz Não-Competitivo: Votação / Opinião
  {
    id: 'slide-poll-opinion',
    type: 'poll_single',
    title: 'Qual área da inteligência artificial você acha mais promissora?',
    subtitle: 'Enquete de Opinião • Sem ranking ou pontuação, apenas debate',
    isCompetitive: false,
    options: [
      { id: 'p-1', text: 'Criação de Vídeo e Motion Graphics', color: '#EC4899', icon: '🎬' },
      { id: 'p-2', text: 'Medicina e Diagnóstico Clínico', color: '#14B8A6', icon: '🧬' },
      { id: 'p-3', text: 'Automação de Tarefas e Código', color: '#6366F1', icon: '💻' },
      { id: 'p-4', text: 'Robótica e Carros Autônomos', color: '#F97316', icon: '🤖' },
    ],
    theme: {
      backgroundColor: '#18181B',
      accentColor: '#A855F7',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'slide',
      duration: 0.6,
      backgroundEffect: 'gradient-mesh'
    }
  },

  // 5. Quiz Competitivo: Verdadeiro ou Falso
  {
    id: 'slide-quiz-tf-1',
    type: 'quiz_true_false',
    title: 'A Grande Muralha da China é visível da Lua a olho nu.',
    subtitle: 'Verdadeiro ou Falso? Seja rápido!',
    isCompetitive: true,
    pointsBase: 1000,
    speedBonus: true,
    timeLimitSeconds: 15,
    showRankingAfter: true,
    options: [
      { id: 'opt-true', text: 'Verdadeiro', isCorrect: false, color: '#3B82F6', icon: '👍' },
      { id: 'opt-false', text: 'Falso (Mito popular)', isCorrect: true, color: '#EF4444', icon: '👎' },
    ],
    content: 'Mesmo da órbita baixa da Terra é extremamente difícil de vê-la sem instrumentos. Da Lua é fisicamente impossível a olho nu.',
    theme: {
      backgroundColor: '#111827',
      accentColor: '#38BDF8',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'kinetic',
      duration: 0.5,
      backgroundEffect: 'grid'
    }
  },

  // 6. Quem digita mais termos de uma categoria (Sprint de Termos)
  {
    id: 'slide-term-sprint',
    type: 'quiz_term_sprint',
    title: 'Sprint de Vocabulário: Países do Mundo',
    subtitle: 'Digite o máximo de países válidos antes do tempo acabar! Cada acerto soma +100 pontos.',
    categoryName: 'Países',
    isCompetitive: true,
    pointsBase: 100,
    timeLimitSeconds: 45,
    showRankingAfter: true,
    theme: {
      backgroundColor: '#064E3B',
      accentColor: '#34D399',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'zoom',
      duration: 0.6,
      backgroundEffect: 'particles'
    }
  },

  // 7. Apontar na Imagem (Hotspot Quiz)
  {
    id: 'slide-image-pin',
    type: 'quiz_image_pin',
    title: 'Onde está o Telescópio Espacial James Webb?',
    subtitle: 'Toque na imagem no seu celular para marcar o ponto correto!',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    isCompetitive: true,
    pointsBase: 1000,
    speedBonus: true,
    timeLimitSeconds: 25,
    hotspot: {
      xPercent: 68,
      yPercent: 38,
      radiusPercent: 12,
      label: 'Ponto de Lagrange L2'
    },
    theme: {
      backgroundColor: '#020617',
      accentColor: '#0EA5E9',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'spring',
      duration: 0.7,
      backgroundEffect: 'particles'
    }
  },

  // 8. Nuvem de Palavras Interativa
  {
    id: 'slide-word-cloud',
    type: 'interaction_word_cloud',
    title: 'Em uma palavra: Qual sentimento define uma grande apresentação?',
    subtitle: 'Digite palavras pelo celular e veja a nuvem crescer em tempo real',
    isCompetitive: false,
    theme: {
      backgroundColor: '#1E1B4B',
      accentColor: '#C084FC',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'kinetic',
      duration: 0.6,
      backgroundEffect: 'pulse'
    }
  },

  // 9. Jogo Social: O Infiltrado (Modo Clássico)
  {
    id: 'slide-impostor-classic',
    type: 'game_impostor_classic',
    title: 'Jogo: O Infiltrado (Modo Clássico)',
    subtitle: 'Descubra quem não sabe a palavra secreta!',
    categoryName: 'Personagens Bíblicos',
    impostorConfig: {
      gameStarted: false,
      mode: 'classic',
      category: 'Personagens Bíblicos',
      secretWord: '',
      impostorParticipantIds: [],
      agentParticipantIds: [],
      roundsTotal: 1,
      currentRound: 1,
      eliminatedIds: [],
      votingActive: false,
      votes: {},
      revealState: 'hidden',
      votingAudience: 'all'
    },
    theme: {
      backgroundColor: '#31102B',
      accentColor: '#F43F5E',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'kinetic',
      duration: 0.8,
      backgroundEffect: 'particles'
    }
  },

  // 10. Jogo Social: O Infiltrado (Modo Investigador)
  {
    id: 'slide-impostor-investigator',
    type: 'game_impostor_investigator',
    title: 'Jogo: O Infiltrado (Modo Investigador)',
    subtitle: 'Agentes dão as pistas. A platéia investiga e vota a cada rodada!',
    categoryName: 'Lugares e Monumentos',
    impostorConfig: {
      gameStarted: false,
      mode: 'investigator',
      category: 'Lugares e Monumentos',
      secretWord: '',
      impostorParticipantIds: [],
      agentParticipantIds: [],
      roundsTotal: 3,
      currentRound: 1,
      eliminatedIds: [],
      votingActive: false,
      votes: {},
      revealState: 'hidden',
      votingAudience: 'all'
    },
    theme: {
      backgroundColor: '#172554',
      accentColor: '#38BDF8',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'zoom',
      duration: 0.8,
      backgroundEffect: 'grid'
    }
  },

  // 11. Pódio & Leaderboard Final
  {
    id: 'slide-leaderboard-final',
    type: 'leaderboard',
    title: '🏆 Grande Pódio & Classificação Final',
    subtitle: 'Parabéns a todos os participantes e equipes pelo show de agilidade!',
    theme: {
      backgroundColor: '#1E1B4B',
      accentColor: '#FBBF24',
      textColor: '#FFFFFF',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'spring',
      duration: 1.0,
      backgroundEffect: 'particles'
    }
  }
];
