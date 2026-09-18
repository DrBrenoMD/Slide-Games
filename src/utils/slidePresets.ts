import { Slide, SlideType, ImpostorConfig } from '../types';
import { PRESET_WORD_CATEGORIES } from '../data/presetWords';

export function createDefaultSlide(type: SlideType, index: number = 0): Slide {
  const baseSlide: Slide = {
    id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title: getDefaultTitleForType(type, index),
    subtitle: getDefaultSubtitleForType(type),
    theme: {
      backgroundColor: '#0F172A',
      textColor: '#FFFFFF',
      accentColor: '#6366F1',
      fontFamily: 'Outfit'
    },
    animation: {
      transition: 'spring',
      duration: 0.6,
      backgroundEffect: 'particles'
    }
  };

  return populateTypeSpecificFields(baseSlide, type);
}

export function convertSlideType(currentSlide: Slide, newType: SlideType): Slide {
  const updated: Slide = {
    ...currentSlide,
    type: newType
  };

  return populateTypeSpecificFields(updated, newType);
}

function getDefaultTitleForType(type: SlideType, index: number): string {
  switch (type) {
    case 'quiz_multiple_choice':
      return `Pergunta ${index + 1}: Qual é a resposta correta?`;
    case 'quiz_true_false':
      return `Afirmação ${index + 1}: Verdadeiro ou Falso?`;
    case 'quiz_term_sprint':
      return 'Sprint de Termos: Digite o máximo de palavras!';
    case 'quiz_image_pin':
      return 'Toque na Imagem: Onde está o elemento?';
    case 'quiz_short_answer':
      return 'Pergunta Aberta: Digite sua resposta';
    case 'poll_single':
      return 'Enquete de Opinião: O que você prefere?';
    case 'interaction_word_cloud':
      return 'Nuvem de Palavras: O que vem à sua mente?';
    case 'game_impostor_investigator':
      return 'O Infiltrado: Modo Investigador (Agentes no Palco)';
    case 'game_impostor_classic':
      return 'O Infiltrado: Modo Clássico (Todos no Celular)';
    case 'content_cover':
      return 'Título da Apresentação';
    case 'content_bullets':
      return 'Pontos Principais & Discussão';
    case 'content_media':
      return 'Exploração Visual & Mídia';
    case 'content_quote':
      return '“Uma frase inspiradora para marcar o momento”';
    case 'content_qrcode_lobby':
      return 'Conecte-se para Participar!';
    case 'leaderboard':
      return 'Classificação Geral & Pódio';
    default:
      return 'Novo Slide';
  }
}

function getDefaultSubtitleForType(type: SlideType): string {
  switch (type) {
    case 'quiz_multiple_choice':
      return 'Selecione a alternativa correta o mais rápido possível!';
    case 'quiz_true_false':
      return 'Pense rápido e vote na afirmativa';
    case 'game_impostor_investigator':
      return 'Agentes no palco dão dicas. A plateia investiga quem é o impostor!';
    case 'game_impostor_classic':
      return 'Descubra quem não recebeu a palavra secreta!';
    case 'interaction_word_cloud':
      return 'Envie palavras pelo seu celular para compor a nuvem ao vivo';
    case 'content_qrcode_lobby':
      return 'Aponte a câmera do celular para o QR Code ou use o código PIN';
    default:
      return 'Instrução ou subtítulo explicativo';
  }
}

function populateTypeSpecificFields(slide: Slide, type: SlideType): Slide {
  const result: Slide = { ...slide, type };

  // Quizes
  if (type === 'quiz_multiple_choice') {
    result.isCompetitive = true;
    result.timeLimitSeconds = result.timeLimitSeconds || 20;
    result.speedBonus = result.speedBonus ?? true;
    result.pointsBase = result.pointsBase || 1000;
    if (!result.options || result.options.length < 2) {
      result.options = [
        { id: 'opt-1', text: 'Opção 1', isCorrect: true, color: '#EF4444', icon: '▲' },
        { id: 'opt-2', text: 'Opção 2', isCorrect: false, color: '#3B82F6', icon: '◆' },
        { id: 'opt-3', text: 'Opção 3', isCorrect: false, color: '#F59E0B', icon: '●' },
        { id: 'opt-4', text: 'Opção 4', isCorrect: false, color: '#10B981', icon: '■' }
      ];
    }
  } else if (type === 'quiz_true_false') {
    result.isCompetitive = true;
    result.timeLimitSeconds = result.timeLimitSeconds || 15;
    result.speedBonus = result.speedBonus ?? true;
    result.pointsBase = result.pointsBase || 1000;
    result.options = [
      { id: 'tf-true', text: 'Verdadeiro', isCorrect: true, color: '#10B981', icon: '✓' },
      { id: 'tf-false', text: 'Falso', isCorrect: false, color: '#EF4444', icon: '✕' }
    ];
  } else if (type === 'quiz_term_sprint') {
    result.isCompetitive = true;
    result.timeLimitSeconds = result.timeLimitSeconds || 45;
    result.categoryName = result.categoryName || 'Personagens Bíblicos';
  } else if (type === 'quiz_image_pin') {
    result.isCompetitive = true;
    result.timeLimitSeconds = result.timeLimitSeconds || 25;
    result.imageUrl = result.imageUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80';
    result.hotspot = result.hotspot || { xPercent: 50, yPercent: 50, radiusPercent: 15, label: 'Alvo Correto' };
  } else if (type === 'quiz_short_answer') {
    result.isCompetitive = true;
    result.timeLimitSeconds = result.timeLimitSeconds || 30;
    result.correctAnswerText = result.correctAnswerText || 'Resposta Esperada';
  }

  // Interações e Enquetes
  if (type === 'poll_single') {
    result.isCompetitive = false;
    result.timeLimitSeconds = result.timeLimitSeconds || 0;
    if (!result.options || result.options.length < 2) {
      result.options = [
        { id: 'poll-1', text: 'Opção A', color: '#6366F1' },
        { id: 'poll-2', text: 'Opção B', color: '#EC4899' },
        { id: 'poll-3', text: 'Opção C', color: '#14B8A6' }
      ];
    }
  } else if (type === 'interaction_word_cloud') {
    result.isCompetitive = false;
    result.timeLimitSeconds = result.timeLimitSeconds || 0;
  }

  // O Infiltrado (Investigador e Clássico)
  if (type.startsWith('game_impostor')) {
    const isInvestigator = type === 'game_impostor_investigator';
    const cat = PRESET_WORD_CATEGORIES[0];
    const secretWord = cat.words[Math.floor(Math.random() * cat.words.length)] || 'Moisés';

    const existingConfig = result.impostorConfig;
    const impostorConfig: ImpostorConfig = {
      mode: isInvestigator ? 'investigator' : 'classic',
      category: existingConfig?.category || cat.name,
      secretWord: existingConfig?.secretWord || secretWord,
      customWordList: existingConfig?.customWordList || cat.words,
      numAgents: existingConfig?.numAgents || 4,
      numImpostors: existingConfig?.numImpostors || 1,
      selectionMethod: existingConfig?.selectionMethod || 'random',
      revealWordToInvestigators: existingConfig?.revealWordToInvestigators ?? false,
      impostorParticipantIds: existingConfig?.impostorParticipantIds || [],
      agentParticipantIds: existingConfig?.agentParticipantIds || [],
      roundsTotal: existingConfig?.roundsTotal || 3,
      currentRound: existingConfig?.currentRound || 1,
      eliminatedIds: existingConfig?.eliminatedIds || [],
      votingActive: false,
      votes: {},
      revealState: 'hidden',
      votingAudience: 'all'
    };

    result.impostorConfig = impostorConfig;
  }

  // Conteúdos
  if (type === 'content_bullets') {
    if (!result.bullets || result.bullets.length === 0) {
      result.bullets = [
        'Primeiro ponto fundamental a ser apresentado',
        'Segundo conceito complementar em discussão',
        'Conclusão prática e aplicação para o grupo'
      ];
    }
  } else if (type === 'content_media') {
    result.imageUrl = result.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80';
    result.content = result.content || 'Texto explicativo sobre a imagem ou conteúdo exibido.';
  } else if (type === 'content_quote') {
    result.content = result.content || '“A sabedoria é a coisa principal; adquire pois a sabedoria.”';
    result.quoteAuthor = result.quoteAuthor || 'Provérbios 4:7';
  } else if (type === 'content_cover') {
    result.content = result.content || 'Bem-vindos a esta experiência ao vivo';
  }

  return result;
}
