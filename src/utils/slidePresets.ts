import { Slide, SlideType, SlideElement, ImpostorConfig } from '../types';
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
    },
    elements: []
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

/**
 * Converte qualquer slide pré-configurado (com títulos, tópicos, opções de quiz, imagens ou citações)
 * em elementos totalmente livres e editáveis do Canvas (Canva Studio).
 */
export function convertPresetSlideToCanvasElements(slide: Slide): Slide {
  const newElements: SlideElement[] = [...(slide.elements || [])];
  let zIndexCounter = newElements.length + 1;

  // 1. Converter Título do Slide
  if (slide.title && slide.title.trim() && slide.type !== 'content_blank') {
    newElements.push({
      id: `el-title-${Date.now()}`,
      type: 'text',
      name: 'Título Principal',
      text: slide.title,
      x: 8,
      y: slide.type === 'content_cover' ? 26 : 8,
      width: 84,
      height: slide.type === 'content_cover' ? 24 : 15,
      zIndex: zIndexCounter++,
      style: {
        fontSize: slide.type === 'content_cover' ? 44 : 32,
        fontWeight: 'black',
        color: '#FFFFFF',
        fontFamily: slide.theme?.fontFamily || 'Outfit',
        textAlign: slide.type === 'content_cover' ? 'center' : 'left',
        shadow: 'lg'
      },
      animation: {
        type: 'fade-in',
        duration: 0.6
      }
    });
  }

  // 2. Converter Subtítulo
  if (slide.subtitle && slide.subtitle.trim() && slide.type !== 'content_blank') {
    newElements.push({
      id: `el-sub-${Date.now()}`,
      type: 'text',
      name: 'Subtítulo',
      text: slide.subtitle,
      x: 8,
      y: slide.type === 'content_cover' ? 52 : 24,
      width: 84,
      height: 12,
      zIndex: zIndexCounter++,
      style: {
        fontSize: 18,
        fontWeight: 'medium',
        color: '#94A3B8',
        fontFamily: slide.theme?.fontFamily || 'Outfit',
        textAlign: slide.type === 'content_cover' ? 'center' : 'left'
      },
      animation: {
        type: 'slide-up',
        duration: 0.5,
        delay: 0.1
      }
    });
  }

  // 3. Converter Opções de Quiz / Enquete
  if (slide.options && slide.options.length > 0) {
    const isGrid = slide.options.length > 2;
    slide.options.forEach((opt, idx) => {
      let optX = 8;
      let optY = 40;
      let optW = 84;
      let optH = 14;

      if (isGrid) {
        optW = 40;
        optH = 22;
        optX = idx % 2 === 0 ? 8 : 52;
        optY = idx < 2 ? 40 : 66;
      } else {
        optW = 40;
        optH = 28;
        optX = idx === 0 ? 8 : 52;
        optY = 46;
      }

      newElements.push({
        id: `el-opt-${opt.id || idx}-${Date.now()}`,
        type: 'shape',
        name: `Alternativa ${idx + 1}: ${opt.text}`,
        text: `${opt.icon || '●'} ${opt.text}${opt.isCorrect ? ' ✓' : ''}`,
        shapeType: 'rounded',
        x: optX,
        y: optY,
        width: optW,
        height: optH,
        zIndex: zIndexCounter++,
        style: {
          backgroundColor: opt.color ? `${opt.color}25` : 'rgba(99, 102, 241, 0.2)',
          borderColor: opt.color || '#6366F1',
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 16,
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          shadow: 'md'
        },
        animation: {
          type: 'bounce',
          duration: 0.5,
          delay: 0.1 * (idx + 1)
        }
      });
    });
  }

  // 4. Converter Tópicos / Bullets
  if (slide.bullets && slide.bullets.length > 0) {
    slide.bullets.forEach((bullet, idx) => {
      newElements.push({
        id: `el-bullet-${idx}-${Date.now()}`,
        type: 'shape',
        name: `Tópico ${idx + 1}`,
        text: `${idx + 1}. ${bullet}`,
        shapeType: 'rounded',
        x: 8,
        y: 38 + idx * 17,
        width: 84,
        height: 14,
        zIndex: zIndexCounter++,
        style: {
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(51, 65, 85, 0.9)',
          borderWidth: 1.5,
          borderRadius: 16,
          color: '#F8FAFC',
          fontSize: 16,
          fontWeight: 'medium',
          textAlign: 'left',
          padding: 12,
          shadow: 'sm'
        },
        animation: {
          type: 'slide-left',
          duration: 0.4,
          delay: 0.15 * (idx + 1)
        }
      });
    });
  }

  // 5. Converter Imagem Principal
  if (slide.imageUrl && slide.type !== 'content_blank') {
    newElements.push({
      id: `el-img-${Date.now()}`,
      type: 'image',
      name: 'Imagem em Destaque',
      mediaUrl: slide.imageUrl,
      x: slide.type === 'content_media' ? 52 : 25,
      y: slide.type === 'content_media' ? 20 : 35,
      width: slide.type === 'content_media' ? 42 : 50,
      height: slide.type === 'content_media' ? 65 : 45,
      zIndex: zIndexCounter++,
      style: {
        borderRadius: 20,
        borderColor: '#334155',
        borderWidth: 2,
        shadow: 'xl',
        objectFit: 'cover'
      },
      filter: {
        brightness: 100,
        contrast: 100,
        opacity: 100
      },
      animation: {
        type: 'zoom-in',
        duration: 0.6
      }
    });
  }

  // 6. Converter Citação / Autor
  if (slide.type === 'content_quote' && slide.content) {
    newElements.push({
      id: `el-quote-${Date.now()}`,
      type: 'text',
      name: 'Citação / Versículo',
      text: `“${slide.content}”`,
      x: 10,
      y: 30,
      width: 80,
      height: 38,
      zIndex: zIndexCounter++,
      style: {
        fontSize: 28,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.5,
        shadow: 'lg'
      },
      animation: {
        type: 'zoom-in',
        duration: 0.7
      }
    });

    if (slide.quoteAuthor) {
      newElements.push({
        id: `el-author-${Date.now()}`,
        type: 'text',
        name: 'Autor da Citação',
        text: `— ${slide.quoteAuthor}`,
        x: 20,
        y: 72,
        width: 60,
        height: 12,
        zIndex: zIndexCounter++,
        style: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#818CF8',
          textAlign: 'center',
          letterSpacing: 1
        }
      });
    }
  }

  // Retornar o slide convertido com tipo 'content_blank' para liberar o canvas totalmente
  return {
    ...slide,
    type: 'content_blank',
    title: slide.title || 'Slide Personalizado',
    subtitle: '',
    bullets: [],
    options: [],
    imageUrl: '',
    content: '',
    elements: newElements
  };
}

function getDefaultTitleForType(type: SlideType, index: number): string {
  switch (type) {
    case 'content_blank':
      return 'Slide em Branco';
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
    case 'content_blank':
      return '';
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

  // Slide em Branco (Canvas Livre Total)
  if (type === 'content_blank') {
    result.title = slide.title || 'Slide em Branco';
    result.subtitle = '';
    result.content = '';
    result.bullets = [];
    result.options = [];
    result.imageUrl = '';
    result.elements = result.elements || [];
    return result;
  }

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
