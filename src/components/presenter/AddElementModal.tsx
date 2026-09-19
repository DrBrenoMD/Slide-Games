import React, { useState, useRef } from 'react';
import { SlideElement, SlideElementType } from '../../types';
import { PRESET_IMAGES, PRESET_AUDIOS, PRESET_VIDEOS, PRESET_STICKERS, PRESET_SHAPES } from '../../data/mediaPresets';
import {
  X,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Shapes,
  Smile,
  Upload,
  Link,
  Sparkles,
  Check,
  Play,
  Volume2,
  Layers,
  FileCode,
  HelpCircle,
  Vote,
  Timer,
  Cloud,
  Plus,
  Trash2
} from 'lucide-react';

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (element: SlideElement) => void;
  currentElementsCount: number;
}

export const AddElementModal: React.FC<AddElementModalProps> = ({
  isOpen,
  onClose,
  onAddElement,
  currentElementsCount
}) => {
  const [activeTab, setActiveTab] = useState<
    'text' | 'image' | 'video' | 'audio' | 'shape' | 'sticker' | 'interactive'
  >('text');
  
  // Estados para Imagem
  const [imageSource, setImageSource] = useState<'upload' | 'url' | 'presets'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedImagePreset, setSelectedImagePreset] = useState<string | null>(null);
  
  // Estados para Vídeo
  const [videoSource, setVideoSource] = useState<'url' | 'presets' | 'upload'>('url');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoAutoplay, setVideoAutoplay] = useState(true);
  const [videoLoop, setVideoLoop] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  // Estados para Áudio
  const [audioSource, setAudioSource] = useState<'presets' | 'upload' | 'url'>('presets');
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [audioTitleInput, setAudioTitleInput] = useState('');
  const [audioAutoplay, setAudioAutoplay] = useState(false);
  const [audioLoop, setAudioLoop] = useState(false);
  const [selectedAudioPreset, setSelectedAudioPreset] = useState<string | null>(PRESET_AUDIOS[0].url);

  // Estados para Quiz Interativo Customizável
  const [quizQuestion, setQuizQuestion] = useState('Qual é a resposta correta para esta pergunta?');
  const [quizOptionCount, setQuizOptionCount] = useState(4);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizTimeSeconds, setQuizTimeSeconds] = useState(30);
  const [quizPoints, setQuizPoints] = useState(100);

  // Input file refs
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Gerador de ID único
  const generateId = () => `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Handler de Upload de Arquivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      if (type === 'image') {
        const newEl: SlideElement = {
          id: generateId(),
          type: 'image',
          name: `Imagem (${file.name.slice(0, 15)})`,
          x: 25,
          y: 20,
          width: 50,
          height: 45,
          zIndex: currentElementsCount + 1,
          mediaUrl: dataUrl,
          mediaType: 'upload',
          alt: file.name,
          style: {
            borderRadius: 16,
            shadow: 'xl',
            objectFit: 'cover'
          },
          filter: {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            opacity: 100
          },
          animation: {
            type: 'fade-in',
            duration: 0.6,
            delay: 0
          }
        };
        onAddElement(newEl);
        onClose();
      } else if (type === 'video') {
        const newEl: SlideElement = {
          id: generateId(),
          type: 'video',
          name: `Vídeo (${file.name.slice(0, 15)})`,
          x: 20,
          y: 15,
          width: 60,
          height: 55,
          zIndex: currentElementsCount + 1,
          mediaUrl: dataUrl,
          mediaType: 'upload',
          autoplay: videoAutoplay,
          loop: videoLoop,
          muted: videoMuted,
          controls: true,
          style: {
            borderRadius: 16,
            shadow: '2xl'
          },
          animation: {
            type: 'zoom-in',
            duration: 0.6,
            delay: 0
          }
        };
        onAddElement(newEl);
        onClose();
      } else if (type === 'audio') {
        const newEl: SlideElement = {
          id: generateId(),
          type: 'audio',
          name: file.name.slice(0, 20),
          x: 65,
          y: 80,
          width: 30,
          height: 12,
          zIndex: currentElementsCount + 1,
          mediaUrl: dataUrl,
          mediaType: 'upload',
          audioTitle: file.name.replace(/\.[^/.]+$/, ''),
          autoplay: audioAutoplay,
          loop: audioLoop,
          volume: 1,
          style: {
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropBlur: 8,
            borderRadius: 16,
            borderColor: 'rgba(99, 102, 241, 0.4)',
            borderWidth: 1,
            padding: 10,
            shadow: 'lg'
          },
          animation: {
            type: 'slide-up',
            duration: 0.5,
            delay: 0.2
          }
        };
        onAddElement(newEl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset Text Box Creators
  const handleAddPresetText = (presetType: 'title' | 'subtitle' | 'paragraph' | 'badge' | 'neon' | 'postit') => {
    let newEl: SlideElement;
    const baseId = generateId();

    switch (presetType) {
      case 'title':
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Título Principal',
          text: 'Seu Grande Título Aqui',
          x: 15,
          y: 20,
          width: 70,
          height: 18,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 38,
            fontWeight: 'black',
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: -0.5
          },
          animation: {
            type: 'fade-in',
            duration: 0.7,
            delay: 0.1
          }
        };
        break;

      case 'subtitle':
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Subtítulo',
          text: 'Subtítulo explicativo com detalhes para o público',
          x: 20,
          y: 40,
          width: 60,
          height: 14,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 22,
            fontWeight: 'medium',
            color: '#CBD5E1',
            textAlign: 'center'
          },
          animation: {
            type: 'slide-up',
            duration: 0.6,
            delay: 0.2
          }
        };
        break;

      case 'neon':
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Texto Neon Glow',
          text: '⚡ IMPACTO VISUAL',
          x: 25,
          y: 35,
          width: 50,
          height: 16,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 28,
            fontWeight: 'black',
            color: '#38BDF8',
            textAlign: 'center',
            shadow: 'glow-sky',
            backgroundColor: 'rgba(14, 165, 233, 0.15)',
            borderColor: '#38BDF8',
            borderWidth: 2,
            borderRadius: 14,
            padding: 12
          },
          animation: {
            type: 'pulse-loop',
            duration: 2.2,
            delay: 0
          }
        };
        break;

      case 'badge':
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Tag de Destaque',
          text: '★ NOVIDADE EXCLUSIVA',
          x: 35,
          y: 15,
          width: 30,
          height: 10,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#F59E0B',
            textAlign: 'center',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 0.6)',
            borderWidth: 1,
            borderRadius: 999,
            padding: 8
          },
          animation: {
            type: 'bounce',
            duration: 0.8,
            delay: 0.1
          }
        };
        break;

      case 'postit':
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Nota Adesiva Amarela',
          text: '📌 Lembrete importante:\nParticipe da votação pelo celular!',
          x: 65,
          y: 20,
          width: 28,
          height: 28,
          rotation: -3,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#78350F',
            backgroundColor: '#FEF08A',
            borderRadius: 8,
            padding: 14,
            shadow: 'xl'
          },
          animation: {
            type: 'zoom-in',
            duration: 0.5,
            delay: 0.3
          }
        };
        break;

      case 'paragraph':
      default:
        newEl = {
          id: baseId,
          type: 'text',
          name: 'Caixa de Texto',
          text: 'Insira aqui seu texto explicativo ou informações complementares para os participantes.',
          x: 20,
          y: 35,
          width: 60,
          height: 25,
          zIndex: currentElementsCount + 1,
          style: {
            fontSize: 18,
            fontWeight: 'normal',
            color: '#E2E8F0',
            textAlign: 'left',
            padding: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.2)'
          },
          animation: {
            type: 'fade-in',
            duration: 0.5,
            delay: 0
          }
        };
        break;
    }

    onAddElement(newEl);
    onClose();
  };

  // Adicionar Imagem por URL ou Preset
  const handleAddImage = (url: string, name = 'Imagem') => {
    if (!url) return;
    const newEl: SlideElement = {
      id: generateId(),
      type: 'image',
      name,
      x: 25,
      y: 20,
      width: 50,
      height: 45,
      zIndex: currentElementsCount + 1,
      mediaUrl: url,
      mediaType: url.startsWith('http') ? 'url' : 'preset',
      alt: name,
      style: {
        borderRadius: 16,
        shadow: 'xl',
        objectFit: 'cover'
      },
      filter: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        opacity: 100
      },
      animation: {
        type: 'fade-in',
        duration: 0.6,
        delay: 0
      }
    };
    onAddElement(newEl);
    onClose();
  };

  // Adicionar Vídeo
  const handleAddVideo = (url: string) => {
    if (!url) return;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const newEl: SlideElement = {
      id: generateId(),
      type: 'video',
      name: isYouTube ? 'Vídeo YouTube' : 'Vídeo Player',
      x: 20,
      y: 15,
      width: 60,
      height: 55,
      zIndex: currentElementsCount + 1,
      mediaUrl: url,
      mediaType: isYouTube ? 'youtube' : 'url',
      autoplay: videoAutoplay,
      loop: videoLoop,
      muted: videoMuted,
      controls: true,
      style: {
        borderRadius: 16,
        shadow: '2xl'
      },
      animation: {
        type: 'zoom-in',
        duration: 0.6,
        delay: 0
      }
    };
    onAddElement(newEl);
    onClose();
  };

  // Adicionar Áudio
  const handleAddAudio = (url: string, title: string) => {
    if (!url) return;
    const newEl: SlideElement = {
      id: generateId(),
      type: 'audio',
      name: `Áudio: ${title}`,
      x: 35,
      y: 80,
      width: 30,
      height: 12,
      zIndex: currentElementsCount + 1,
      mediaUrl: url,
      mediaType: 'url',
      audioTitle: title,
      autoplay: audioAutoplay,
      loop: audioLoop,
      volume: 1,
      style: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropBlur: 8,
        borderRadius: 16,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        borderWidth: 1,
        padding: 10,
        shadow: 'lg'
      },
      animation: {
        type: 'slide-up',
        duration: 0.5,
        delay: 0.2
      }
    };
    onAddElement(newEl);
    onClose();
  };

  // Adicionar Forma
  const handleAddShape = (shapeType: SlideElement['shapeType'], label: string) => {
    const newEl: SlideElement = {
      id: generateId(),
      type: 'shape',
      shapeType,
      name: `Forma: ${label}`,
      text: label,
      x: 35,
      y: 35,
      width: 30,
      height: 20,
      zIndex: currentElementsCount + 1,
      style: {
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366F1',
        borderWidth: 2,
        color: '#FFFFFF',
        fontSize: 18,
        shadow: 'lg'
      },
      animation: {
        type: 'zoom-in',
        duration: 0.5,
        delay: 0
      }
    };
    onAddElement(newEl);
    onClose();
  };

  // Adicionar Widget de Quiz com Alternativas Adaptáveis
  const handleAddQuizWidget = (numAlternatives: number = 4) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const colors = [
      '#EF4444', // Vermelho
      '#3B82F6', // Azul
      '#F59E0B', // Amarelo/Laranja
      '#10B981', // Verde
      '#8B5CF6', // Roxo
      '#EC4899', // Rosa
      '#06B6D4', // Ciano
      '#F97316'  // Laranja escuro
    ];

    const options = Array.from({ length: numAlternatives }).map((_, i) => ({
      id: `opt-${i + 1}-${Date.now()}`,
      text: `Alternativa ${letters[i]} - Digite a resposta aqui`,
      isCorrect: i === quizCorrectIndex,
      color: colors[i % colors.length],
      icon: letters[i],
      votesCount: 0
    }));

    const newEl: SlideElement = {
      id: generateId(),
      type: 'quiz_widget',
      name: `Quiz (${numAlternatives} Alternativas)`,
      x: 10,
      y: 20,
      width: 80,
      height: 65,
      zIndex: currentElementsCount + 1,
      interactiveConfig: {
        widgetType: 'quiz',
        question: quizQuestion,
        options,
        timerSeconds: quizTimeSeconds,
        points: quizPoints,
        layout: numAlternatives > 4 ? 'two_columns' : 'single_column',
        showLiveVotes: true,
        revealAnswer: false
      },
      style: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropBlur: 12,
        borderRadius: 20,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        borderWidth: 1.5,
        padding: 16,
        shadow: '2xl'
      },
      animation: {
        type: 'zoom-in',
        duration: 0.6,
        delay: 0.1
      }
    };

    onAddElement(newEl);
    onClose();
  };

  // Adicionar Widget de Enquete / Votação
  const handleAddPollWidget = () => {
    const options = [
      { id: `opt-1-${Date.now()}`, text: 'Concordo Totalmente', color: '#10B981', icon: '👍', votesCount: 12 },
      { id: `opt-2-${Date.now()}`, text: 'Neutro / Indiferente', color: '#F59E0B', icon: '✋', votesCount: 5 },
      { id: `opt-3-${Date.now()}`, text: 'Discordo', color: '#EF4444', icon: '👎', votesCount: 2 }
    ];

    const newEl: SlideElement = {
      id: generateId(),
      type: 'poll_widget',
      name: 'Enquete de Opinião',
      x: 15,
      y: 25,
      width: 70,
      height: 55,
      zIndex: currentElementsCount + 1,
      interactiveConfig: {
        widgetType: 'poll',
        question: 'Qual é a sua opinião sobre este tópico?',
        options,
        layout: 'single_column',
        showLiveVotes: true
      },
      style: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropBlur: 12,
        borderRadius: 20,
        borderColor: 'rgba(56, 189, 248, 0.4)',
        borderWidth: 1.5,
        padding: 16,
        shadow: '2xl'
      },
      animation: {
        type: 'slide-up',
        duration: 0.6,
        delay: 0.1
      }
    };

    onAddElement(newEl);
    onClose();
  };

  // Adicionar Temporizador / Timer Regressivo
  const handleAddTimerWidget = (seconds: number = 30) => {
    const newEl: SlideElement = {
      id: generateId(),
      type: 'timer_widget',
      name: `Cronômetro (${seconds}s)`,
      x: 35,
      y: 20,
      width: 30,
      height: 25,
      zIndex: currentElementsCount + 1,
      interactiveConfig: {
        widgetType: 'timer',
        timerSeconds: seconds
      },
      style: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropBlur: 12,
        borderRadius: 24,
        borderColor: 'rgba(244, 63, 94, 0.5)',
        borderWidth: 2,
        padding: 12,
        shadow: 'glow-rose'
      },
      animation: {
        type: 'bounce',
        duration: 0.7,
        delay: 0.1
      }
    };

    onAddElement(newEl);
    onClose();
  };

  // Adicionar Sticker / Emoji
  const handleAddSticker = (emoji: string) => {
    const newEl: SlideElement = {
      id: generateId(),
      type: 'sticker',
      name: `Sticker ${emoji}`,
      text: emoji,
      x: 45,
      y: 35,
      width: 15,
      height: 15,
      zIndex: currentElementsCount + 1,
      style: {
        fontSize: 64
      },
      animation: {
        type: 'bounce',
        duration: 0.8,
        delay: 0
      }
    };
    onAddElement(newEl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Inserir Elemento de Mídia</h3>
              <p className="text-xs text-slate-400">Personalize o slide com textos, imagens, vídeos, áudios e formas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Imagem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Áudio & Efeitos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shape')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'shape'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shapes className="w-4 h-4" />
            <span>Formas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sticker')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sticker'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Stickers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-600/25'
                : 'text-rose-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>🎮 Interativo (Quiz/Enquete)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB TEXTO */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Selecione um modelo de estilo ou caixa de texto:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddPresetText('title')}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Título Principal</span>
                  <p className="text-lg font-black text-white mt-1 group-hover:text-indigo-300">Grande Destaque</p>
                  <span className="text-[11px] text-slate-400">Fonte 38px, negrito e alinhamento central</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPresetText('subtitle')}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtítulo</span>
                  <p className="text-base font-semibold text-slate-200 mt-1 group-hover:text-indigo-300">Linha de Apoio</p>
                  <span className="text-[11px] text-slate-400">Fonte 22px, tom suave</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPresetText('neon')}
                  className="p-4 rounded-2xl bg-sky-950/40 hover:bg-sky-950/60 border border-sky-500/40 hover:border-sky-400 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Glow Neon</span>
                  <p className="text-base font-black text-sky-300 mt-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">⚡ EFEITO CYBER</p>
                  <span className="text-[11px] text-sky-200/70">Com animação de pulso contínuo e brilho</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPresetText('badge')}
                  className="p-4 rounded-2xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/40 hover:border-amber-400 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Badge de Novidade</span>
                  <p className="text-sm font-bold text-amber-300 mt-1">★ TAG ARREDONDADA</p>
                  <span className="text-[11px] text-amber-200/70">Pílula colorida para selos e avisos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPresetText('postit')}
                  className="p-4 rounded-2xl bg-yellow-300/20 hover:bg-yellow-300/30 border border-yellow-400/40 hover:border-yellow-300 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Nota Adesiva</span>
                  <p className="text-sm font-bold text-yellow-200 mt-1">📌 Post-it Inclinado</p>
                  <span className="text-[11px] text-yellow-100/70">Fundo amarelo com leve rotação estilosa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPresetText('paragraph')}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parágrafo / Bloco</span>
                  <p className="text-sm text-slate-300 mt-1">Texto explicativo com moldura</p>
                  <span className="text-[11px] text-slate-400">Perfeito para instruções e detalhes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB IMAGEM */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    imageSource === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar do Computador</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageSource('presets')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    imageSource === 'presets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fotos Prontas (Unsplash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    imageSource === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link da Web</span>
                </button>
              </div>

              {imageSource === 'upload' && (
                <div
                  onClick={() => imageFileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl bg-slate-950/40 text-center cursor-pointer transition-all hover:bg-indigo-950/10 group"
                >
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Clique para selecionar uma imagem</h4>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, WebP ou SVG suportados</p>
                </div>
              )}

              {imageSource === 'presets' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                  {PRESET_IMAGES.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => handleAddImage(img.url, img.name)}
                      className="group relative rounded-2xl overflow-hidden aspect-video border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-md transition-all hover:scale-105"
                    >
                      <img src={img.thumbnail || img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] font-bold text-white truncate">{img.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imageSource === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">URL Direta da Imagem</label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(imageUrlInput, 'Imagem Web')}
                    disabled={!imageUrlInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all"
                  >
                    Inserir Imagem do Link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB VÍDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setVideoSource('url')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    videoSource === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link / YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSource('presets')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    videoSource === 'presets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Loops Prontos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSource('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    videoSource === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar do Computador</span>
                </button>
              </div>

              {/* Opções de Reprodução */}
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoAutoplay}
                    onChange={(e) => setVideoAutoplay(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Reproduzir Automático (Autoplay)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoLoop}
                    onChange={(e) => setVideoLoop(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Repetir em Loop</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoMuted}
                    onChange={(e) => setVideoMuted(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Mudo por padrão</span>
                </label>
              </div>

              {videoSource === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Link do YouTube ou URL de Vídeo (MP4/WebM)</label>
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ou https://.../video.mp4"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVideo(videoUrlInput)}
                    disabled={!videoUrlInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all"
                  >
                    Inserir Vídeo no Slide
                  </button>
                </div>
              )}

              {videoSource === 'presets' && (
                <div className="space-y-2">
                  {PRESET_VIDEOS.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => handleAddVideo(vid.url)}
                      className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{vid.name}</p>
                          <span className="text-[10px] text-indigo-400 uppercase font-semibold">{vid.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-400">+ Inserir</span>
                    </div>
                  ))}
                </div>
              )}

              {videoSource === 'upload' && (
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl bg-slate-950/40 text-center cursor-pointer transition-all hover:bg-indigo-950/10 group"
                >
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Clique para selecionar um vídeo</h4>
                  <p className="text-xs text-slate-400 mt-1">MP4 ou WebM</p>
                </div>
              )}
            </div>
          )}

          {/* TAB ÁUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setAudioSource('presets')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    audioSource === 'presets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Efeitos Sonoros Prontos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudioSource('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    audioSource === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar Arquivo MP3/WAV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudioSource('url')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    audioSource === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link de Áudio</span>
                </button>
              </div>

              {/* Opções de Reprodução de Áudio */}
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioAutoplay}
                    onChange={(e) => setAudioAutoplay(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Tocar automaticamente ao exibir o slide</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioLoop}
                    onChange={(e) => setAudioLoop(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Tocar em Loop contínuo</span>
                </label>
              </div>

              {audioSource === 'presets' && (
                <div className="space-y-2">
                  {PRESET_AUDIOS.map((aud) => (
                    <div
                      key={aud.id}
                      className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{aud.name}</p>
                          <span className="text-[10px] text-indigo-400 uppercase font-semibold">{aud.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <audio src={aud.url} controls className="h-7 w-28 opacity-80" />
                        <button
                          type="button"
                          onClick={() => handleAddAudio(aud.url, aud.name)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                        >
                          + Inserir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {audioSource === 'upload' && (
                <div
                  onClick={() => audioFileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl bg-slate-950/40 text-center cursor-pointer transition-all hover:bg-indigo-950/10 group"
                >
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, 'audio')}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                    <Music className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Clique para selecionar um áudio</h4>
                  <p className="text-xs text-slate-400 mt-1">MP3, WAV, OGG ou M4A</p>
                </div>
              )}

              {audioSource === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Título do Áudio</label>
                    <input
                      type="text"
                      value={audioTitleInput}
                      onChange={(e) => setAudioTitleInput(e.target.value)}
                      placeholder="Ex: Trilha Sonora de Abertura"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">URL Direta do Áudio (MP3/WAV)</label>
                    <input
                      type="url"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/musica.mp3"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddAudio(audioUrlInput, audioTitleInput || 'Faixa de Áudio')}
                    disabled={!audioUrlInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all"
                  >
                    Inserir Áudio no Slide
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB FORMAS */}
          {activeTab === 'shape' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Escolha uma forma geométrica ou balão:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_SHAPES.map((shape) => (
                  <button
                    key={shape.type}
                    type="button"
                    onClick={() => handleAddShape(shape.type as any, shape.label)}
                    className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <Shapes className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB STICKERS */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Clique para adicionar um sticker decorativo no slide:</p>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                {PRESET_STICKERS.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSticker(emoji)}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-3xl flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB INTERATIVO (QUIZ & WIDGETS) */}
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              {/* QUIZ INTERATIVO COM ALTERNATIVAS ADAPTÁVEIS */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Quiz Interativo Adaptável</h4>
                      <p className="text-[11px] text-slate-400">
                        Insira uma questão interativa com quantidade flexível de alternativas
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    2 a 8 Opções
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pergunta / Enunciado
                  </label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    placeholder="Ex: Qual é a capital da França?"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Quantidade de Alternativas
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuizOptionCount(count)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quizOptionCount === count
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {count} opções
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tempo Limite (Segundos)
                    </label>
                    <input
                      type="number"
                      value={quizTimeSeconds}
                      onChange={(e) => setQuizTimeSeconds(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pontos da Rodada
                    </label>
                    <input
                      type="number"
                      value={quizPoints}
                      onChange={(e) => setQuizPoints(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddQuizWidget(quizOptionCount)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Inserir Quiz ({quizOptionCount} Alternativas) no Slide</span>
                </button>
              </div>

              {/* OUTROS WIDGETS RÁPIDOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Enquete de Opinião</h4>
                      <p className="text-[11px] text-slate-400">Votação rápida com barras de porcentagem</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPollWidget}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-all"
                  >
                    + Inserir Enquete
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Cronômetro / Timer (30s)</h4>
                      <p className="text-[11px] text-slate-400">Contagem regressiva animada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddTimerWidget(15)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-bold border border-slate-700 cursor-pointer"
                    >
                      15s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTimerWidget(30)}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      30s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTimerWidget(60)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-bold border border-slate-700 cursor-pointer"
                    >
                      60s
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
