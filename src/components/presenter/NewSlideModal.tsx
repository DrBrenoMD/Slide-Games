import React, { useState } from 'react';
import { Slide, SlideType } from '../../types';
import {
  X,
  HelpCircle,
  CheckSquare,
  Zap,
  Image as ImageIcon,
  MessageSquare,
  BarChart2,
  Cloud,
  ShieldAlert,
  Search,
  Type,
  ListOrdered,
  Quote,
  QrCode,
  Trophy
} from 'lucide-react';

interface NewSlideOption {
  type: SlideType;
  title: string;
  description: string;
  category: 'quiz' | 'game' | 'interaction' | 'content';
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

const SLIDE_TYPE_OPTIONS: NewSlideOption[] = [
  {
    type: 'quiz_multiple_choice',
    title: 'Quiz de Múltipla Escolha',
    description: '4 alternativas coloridas com timer, contagem regressiva e pontuação por agilidade.',
    category: 'quiz',
    icon: <HelpCircle className="w-6 h-6 text-indigo-400" />,
    badge: 'Popular',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  },
  {
    type: 'game_impostor_investigator',
    title: 'O Infiltrado: Modo Investigador',
    description: 'Agentes sobem ao palco virtual. 1 é o infiltrado sem a palavra secreta. A plateia investiga e vota!',
    category: 'game',
    icon: <Search className="w-6 h-6 text-amber-400" />,
    badge: 'Destaque',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    type: 'game_impostor_classic',
    title: 'O Infiltrado: Modo Clássico',
    description: 'Todos jogam em seus celulares. Infiltrados tentam blefar e os inocentes tentam descobri-los.',
    category: 'game',
    icon: <ShieldAlert className="w-6 h-6 text-rose-400" />
  },
  {
    type: 'interaction_word_cloud',
    title: 'Nuvem de Palavras',
    description: 'Os participantes enviam palavras ou ideias que crescem proporcionalmente ao vivo.',
    category: 'interaction',
    icon: <Cloud className="w-6 h-6 text-cyan-400" />
  },
  {
    type: 'quiz_true_false',
    title: 'Verdadeiro ou Falso',
    description: 'Rodada dinâmica de afirmações rápidas com duas alternativas de alto contraste.',
    category: 'quiz',
    icon: <CheckSquare className="w-6 h-6 text-emerald-400" />
  },
  {
    type: 'quiz_image_pin',
    title: 'Apontar na Imagem (Hotspot)',
    description: 'Os participantes tocam na foto pelo celular para indicar o detalhe ou resposta correta.',
    category: 'quiz',
    icon: <ImageIcon className="w-6 h-6 text-fuchsia-400" />
  },
  {
    type: 'quiz_term_sprint',
    title: 'Sprint de Vocabulário / Termos',
    description: 'Corrida rápida de digitação de nomes, termos bíblicos ou palavras da categoria.',
    category: 'quiz',
    icon: <Zap className="w-6 h-6 text-amber-400" />
  },
  {
    type: 'poll_single',
    title: 'Enquete de Opinião',
    description: 'Votação de opiniões ou preferências sem resposta certa, com gráficos em tempo real.',
    category: 'interaction',
    icon: <BarChart2 className="w-6 h-6 text-sky-400" />
  },
  {
    type: 'quiz_short_answer',
    title: 'Resposta Curta',
    description: 'Os participantes digitam uma resposta em texto livre pelo celular.',
    category: 'quiz',
    icon: <MessageSquare className="w-6 h-6 text-teal-400" />
  },
  {
    type: 'content_cover',
    title: 'Capa / Título Principal',
    description: 'Slide de abertura de impacto visual para apresentações e recepção de público.',
    category: 'content',
    icon: <Type className="w-6 h-6 text-violet-400" />
  },
  {
    type: 'content_bullets',
    title: 'Lista de Tópicos (Bullets)',
    description: 'Pontos-chave numerados ou marcadores com destaque para leitura coletiva.',
    category: 'content',
    icon: <ListOrdered className="w-6 h-6 text-blue-400" />
  },
  {
    type: 'content_quote',
    title: 'Citação ou Versículo',
    description: 'Frase inspiradora ou versículo em destaque com autor e formatação nobre.',
    category: 'content',
    icon: <Quote className="w-6 h-6 text-rose-400" />
  },
  {
    type: 'content_qrcode_lobby',
    title: 'Lobby de Conexão (QR Code)',
    description: 'Exibe o QR Code grande e o PIN numérico da sala para todos entrarem.',
    category: 'content',
    icon: <QrCode className="w-6 h-6 text-indigo-400" />
  },
  {
    type: 'leaderboard',
    title: 'Pódio & Ranking Geral',
    description: 'Classificação geral dos melhores jogadores e equipes com efeitos de pódio.',
    category: 'content',
    icon: <Trophy className="w-6 h-6 text-yellow-400" />
  }
];

interface NewSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: SlideType) => void;
}

export const NewSlideModal: React.FC<NewSlideModalProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'quiz' | 'game' | 'interaction' | 'content'>('all');

  if (!isOpen) return null;

  const filteredOptions = selectedFilter === 'all'
    ? SLIDE_TYPE_OPTIONS
    : SLIDE_TYPE_OPTIONS.filter((opt) => opt.category === selectedFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>✨ Escolha o Tipo de Novo Slide</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecione o modelo interativo ou de conteúdo para adicionar à sua apresentação
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'Todos os Modelos' },
            { id: 'game', label: '🕵️ O Infiltrado & Jogos' },
            { id: 'quiz', label: '🎯 Quizes & Perguntas' },
            { id: 'interaction', label: '☁️ Enquetes & Interação' },
            { id: 'content', label: '📑 Slides de Conteúdo' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Options Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                onSelectType(opt.type);
                onClose();
              }}
              className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/70 text-left flex flex-col justify-between group transition-all cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-indigo-950/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                    {opt.icon}
                  </div>
                  {opt.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'}`}>
                      {opt.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {opt.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-indigo-400">
                <span>Clique para adicionar</span>
                <span>+</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
