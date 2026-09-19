import React, { useState, useRef } from 'react';
import { SlideElement, ElementAnimationType, InteractiveWidgetOption } from '../../types';
import {
  X,
  Sliders,
  Type,
  Palette,
  Move,
  Film,
  Sparkles,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Upload,
  RefreshCw,
  Sun,
  Layers,
  HelpCircle,
  Plus,
  CheckCircle2,
  Vote,
  Timer,
  Clock,
  Settings2,
  Check
} from 'lucide-react';

interface ElementPropertyInspectorProps {
  element: SlideElement;
  onUpdateElement: (updated: SlideElement) => void;
  onDuplicateElement: (element: SlideElement) => void;
  onDeleteElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#FFFFFF', '#0F172A', '#6366F1', '#38BDF8', '#10B981', 
  '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#F43F5E',
  '#14B8A6', '#84CC16', '#EAB308', '#64748B', '#000000'
];

const PRESET_GRADIENTS = [
  { label: 'Nenhum', value: '' },
  { label: 'Índigo -> Céu', value: 'linear-gradient(135deg, #6366F1 0%, #38BDF8 100%)' },
  { label: 'Cyber Roxo', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
  { label: 'Pôr do Sol', value: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' },
  { label: 'Esmeralda', value: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' },
  { label: 'Dark Metal', value: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }
];

export const ElementPropertyInspector: React.FC<ElementPropertyInspectorProps> = ({
  element,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
  onClose
}) => {
  const isWidget =
    element.type === 'quiz_widget' ||
    element.type === 'poll_widget' ||
    element.type === 'timer_widget';

  const [activeTab, setActiveTab] = useState<'basic' | 'style' | 'interactive' | 'advanced'>(
    isWidget ? 'interactive' : 'basic'
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper para atualizar propriedades aninhadas
  const updateStyle = (styleUpdates: Partial<SlideElement['style']>) => {
    onUpdateElement({
      ...element,
      style: {
        ...element.style,
        ...styleUpdates
      }
    });
  };

  const updateFilter = (filterUpdates: Partial<NonNullable<SlideElement['filter']>>) => {
    onUpdateElement({
      ...element,
      filter: {
        ...element.filter,
        ...filterUpdates
      }
    });
  };

  const updateAnimation = (animUpdates: Partial<NonNullable<SlideElement['animation']>>) => {
    onUpdateElement({
      ...element,
      animation: {
        type: element.animation?.type || 'none',
        duration: element.animation?.duration || 0.6,
        delay: element.animation?.delay || 0,
        ...element.animation,
        ...animUpdates
      }
    });
  };

  // Atualizar configuração interativa do widget
  const updateInteractive = (configUpdates: Partial<NonNullable<SlideElement['interactiveConfig']>>) => {
    onUpdateElement({
      ...element,
      interactiveConfig: {
        widgetType: element.interactiveConfig?.widgetType || 'quiz',
        ...element.interactiveConfig,
        ...configUpdates
      }
    });
  };

  // Adicionar alternativa ao Quiz
  const handleAddAlternative = () => {
    const currentOptions = element.interactiveConfig?.options || [];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    const nextIdx = currentOptions.length;
    const nextLetter = letters[nextIdx % letters.length];
    const nextColor = colors[nextIdx % colors.length];

    const newOption: InteractiveWidgetOption = {
      id: `opt-${Date.now()}-${nextIdx + 1}`,
      text: `Alternativa ${nextLetter}`,
      isCorrect: currentOptions.length === 0,
      color: nextColor,
      icon: nextLetter,
      votesCount: 0
    };

    updateInteractive({
      options: [...currentOptions, newOption]
    });
  };

  // Remover alternativa do Quiz
  const handleRemoveAlternative = (id: string) => {
    const currentOptions = element.interactiveConfig?.options || [];
    if (currentOptions.length <= 2) {
      alert('O quiz precisa ter no mínimo 2 alternativas.');
      return;
    }
    updateInteractive({
      options: currentOptions.filter((opt) => opt.id !== id)
    });
  };

  // Trocar imagem por arquivo local
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateElement({
        ...element,
        mediaUrl: event.target?.result as string,
        mediaType: 'upload',
        name: `Imagem (${file.name.slice(0, 15)})`
      });
    };
    reader.readAsDataURL(file);
  };

  const resetFilters = () => {
    onUpdateElement({
      ...element,
      filter: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        opacity: 100
      }
    });
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
          <input
            type="text"
            value={element.name}
            onChange={(e) => onUpdateElement({ ...element, name: e.target.value })}
            className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none truncate w-full"
            placeholder="Nome do elemento"
          />
        </div>

        {/* Ações Rápidas (Camadas, Duplicar, Excluir, Fechar) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onBringForward(element.id)}
            title="Trazer para Frente"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSendBackward(element.id)}
            title="Enviar para Trás"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicateElement(element)}
            title="Duplicar Elemento"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteElement(element.id)}
            title="Excluir Elemento"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Fechar Inspetor"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Simplificadas e User Friendly */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'basic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Básico</span>
        </button>

        {isWidget && (
          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'interactive'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow'
                : 'text-rose-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>⚡ Interativo</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'style' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilo & Visual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'advanced' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>🚀 Avançado</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1">
        {/* TAB 1: BÁSICO */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Texto ou Forma com Texto */}
            {(element.type === 'text' || element.type === 'shape' || element.type === 'sticker') && (
              <div className="space-y-3">
                <label className="block font-bold text-white">Conteúdo do Texto</label>
                <textarea
                  rows={4}
                  value={element.text || ''}
                  onChange={(e) => onUpdateElement({ ...element, text: e.target.value })}
                  placeholder="Escreva seu texto aqui..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-sans"
                />

                {/* Tamanho e Alinhamento Rápidos */}
                {element.type === 'text' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">
                        Tamanho ({element.style.fontSize || 18}px)
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="80"
                        value={element.style.fontSize || 18}
                        onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Alinhamento</label>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateStyle({ textAlign: align })}
                            className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${
                              element.style.textAlign === align || (!element.style.textAlign && align === 'left')
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                            {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Imagem */}
            {element.type === 'image' && (
              <div className="space-y-4">
                {element.mediaUrl && (
                  <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-700 relative bg-black/40">
                    <img
                      src={element.mediaUrl}
                      alt={element.alt || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-white mb-1.5">Link da Imagem</label>
                  <input
                    type="url"
                    value={element.mediaUrl?.startsWith('data:') ? 'Arquivo colado / carregado' : element.mediaUrl || ''}
                    onChange={(e) => onUpdateElement({ ...element, mediaUrl: e.target.value, mediaType: 'url' })}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Substituir por Arquivo Local</span>
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Enquadramento (Object-Fit)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cover', 'contain', 'fill'] as const).map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => updateStyle({ objectFit: fit })}
                        className={`py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                          element.style.objectFit === fit || (!element.style.objectFit && fit === 'cover')
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fit === 'cover' ? 'Cobrir' : fit === 'contain' ? 'Conter' : 'Preencher'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vídeo */}
            {element.type === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-white mb-1.5">Link do Vídeo ou YouTube</label>
                  <input
                    type="url"
                    value={element.mediaUrl || ''}
                    onChange={(e) => onUpdateElement({ ...element, mediaUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... ou https://.../video.mp4"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="flex items-center gap-2 text-white font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={element.autoplay || false}
                      onChange={(e) => onUpdateElement({ ...element, autoplay: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Autoplay (Reproduzir automaticamente)</span>
                  </label>

                  <label className="flex items-center gap-2 text-white font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={element.loop || false}
                      onChange={(e) => onUpdateElement({ ...element, loop: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Loop (Repetir ao terminar)</span>
                  </label>

                  <label className="flex items-center gap-2 text-white font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={element.muted || false}
                      onChange={(e) => onUpdateElement({ ...element, muted: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Sem Som (Mudo)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Áudio */}
            {element.type === 'audio' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-white mb-1">Título da Faixa</label>
                  <input
                    type="text"
                    value={element.audioTitle || ''}
                    onChange={(e) => onUpdateElement({ ...element, audioTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">URL do Áudio</label>
                  <input
                    type="url"
                    value={element.mediaUrl || ''}
                    onChange={(e) => onUpdateElement({ ...element, mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERATIVO (QUANDO FOR WIDGET) */}
        {activeTab === 'interactive' && isWidget && (
          <div className="space-y-5">
            {/* Quiz Config */}
            {element.type === 'quiz_widget' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-white mb-1">
                    Pergunta / Enunciado
                  </label>
                  <input
                    type="text"
                    value={element.interactiveConfig?.question || ''}
                    onChange={(e) => updateInteractive({ question: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Alternativas Adaptáveis */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white flex items-center gap-1.5">
                      <span>Alternativas de Resposta</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                        {element.interactiveConfig?.options?.length || 0} opções
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddAlternative}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Opção</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(element.interactiveConfig?.options || []).map((opt, idx) => (
                      <div
                        key={opt.id || idx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/60'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        {/* Botão de Marcar como Correta */}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions = (element.interactiveConfig?.options || []).map(
                              (o) => ({
                                ...o,
                                isCorrect: o.id === opt.id
                              })
                            );
                            updateInteractive({ options: updatedOptions });
                          }}
                          title={opt.isCorrect ? 'Resposta Correta' : 'Marcar como Correta'}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all ${
                            opt.isCorrect
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.icon || String.fromCharCode(65 + idx)}
                        </button>

                        {/* Texto da Alternativa */}
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updatedOptions = (element.interactiveConfig?.options || []).map(
                              (o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)
                            );
                            updateInteractive({ options: updatedOptions });
                          }}
                          className="flex-1 bg-transparent text-white text-xs font-semibold focus:outline-none border-b border-transparent focus:border-indigo-500"
                        />

                        {/* Seletor de Cor da Alternativa */}
                        <input
                          type="color"
                          value={opt.color || '#6366F1'}
                          onChange={(e) => {
                            const updatedOptions = (element.interactiveConfig?.options || []).map(
                              (o) => (o.id === opt.id ? { ...o, color: e.target.value } : o)
                            );
                            updateInteractive({ options: updatedOptions });
                          }}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                          title="Cor da alternativa"
                        />

                        {/* Botão Remover Alternativa */}
                        <button
                          type="button"
                          onClick={() => handleRemoveAlternative(opt.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                          title="Remover alternativa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ajustes de Pontuação e Tempo */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">
                      Tempo Limite (Segundos)
                    </label>
                    <input
                      type="number"
                      value={element.interactiveConfig?.timerSeconds || 30}
                      onChange={(e) => updateInteractive({ timerSeconds: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">
                      Pontos da Questão
                    </label>
                    <input
                      type="number"
                      value={element.interactiveConfig?.points || 100}
                      onChange={(e) => updateInteractive({ points: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Revelar Resposta Correta ao vivo */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">
                    Revelar Resposta Correta
                  </span>
                  <input
                    type="checkbox"
                    checked={element.interactiveConfig?.revealAnswer || false}
                    onChange={(e) => updateInteractive({ revealAnswer: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                </div>
              </div>
            )}

            {/* Timer Config */}
            {element.type === 'timer_widget' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-white mb-1">
                    Duração da Contagem (Segundos)
                  </label>
                  <input
                    type="number"
                    value={element.interactiveConfig?.timerSeconds || 30}
                    onChange={(e) => updateInteractive({ timerSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ESTILO & VISUAL */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Cor do Texto */}
            {(element.type === 'text' || element.type === 'shape') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white">Cor do Texto</label>
                  <span className="font-mono text-[10px] text-slate-400">{element.style.color || '#FFFFFF'}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateStyle({ color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-lg border border-slate-700 cursor-pointer transition-transform hover:scale-110 ${
                        element.style.color === c ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tipografia */}
            {(element.type === 'text' || element.type === 'shape') && (
              <div className="space-y-2">
                <label className="font-bold text-white">Família da Fonte</label>
                <select
                  value={element.style.fontFamily || 'Outfit'}
                  onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Outfit">Outfit (Moderno & Geek)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Limpo)</option>
                  <option value="Inter">Inter (Padrão)</option>
                  <option value="Playfair Display">Playfair Display (Elegante)</option>
                  <option value="Cinzel">Cinzel (Clássico / Histórico)</option>
                  <option value="Bebas Neue">Bebas Neue (Display & Cinema)</option>
                  <option value="Caveat">Caveat (Manuscrito / Lousa)</option>
                  <option value="Poppins">Poppins (Geométrico Suave)</option>
                  <option value="Roboto Mono">Roboto Mono (Terminal & Tech)</option>
                </select>
              </div>
            )}

            {/* Cor de Fundo */}
            <div className="space-y-2">
              <label className="font-bold text-white">Cor de Fundo / Preenchimento</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateStyle({ backgroundColor: 'transparent' })}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white"
                >
                  Transparente
                </button>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStyle({ backgroundColor: c })}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-lg border border-slate-700 cursor-pointer transition-transform hover:scale-110 ${
                      element.style.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bordas e Cantos Arredondados */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Arredondamento ({element.style.borderRadius || 0}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={element.style.borderRadius || 0}
                  onChange={(e) => updateStyle({ borderRadius: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Espessura da Borda ({element.style.borderWidth || 0}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={element.style.borderWidth || 0}
                  onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Sombras & Efeito Neon */}
            <div>
              <label className="block font-bold text-white mb-1.5">Sombra & Efeito Glow</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Nenhum', val: 'none' },
                  { label: 'Suave', val: 'md' },
                  { label: 'Forte 2XL', val: '2xl' },
                  { label: 'Glow Ciano', val: 'glow-sky' },
                  { label: 'Glow Rosa', val: 'glow-rose' },
                  { label: 'Glow Ouro', val: 'glow-amber' }
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => updateStyle({ shadow: s.val as any })}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      element.style.shadow === s.val || (!element.style.shadow && s.val === 'none')
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AVANÇADO (FILTROS, ROTAÇÃO, ANIMAÇÃO & POSIÇÃO MILIMÉTRICA) */}
        {activeTab === 'advanced' && (
          <div className="space-y-5">
            {/* Rotação e Posição */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-white flex items-center justify-between">
                <span>Transformação & Rotação</span>
                <span className="font-mono text-indigo-400">{element.rotation || 0}°</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateElement({ ...element, rotation: (element.rotation || 0) - 15 })}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={element.rotation || 0}
                  onChange={(e) => onUpdateElement({ ...element, rotation: Number(e.target.value) })}
                  className="flex-1 accent-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => onUpdateElement({ ...element, rotation: (element.rotation || 0) + 15 })}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                  <span className="text-slate-400">X / Y (%):</span>
                  <span className="font-mono text-white font-bold">{Math.round(element.x)}% / {Math.round(element.y)}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                  <span className="text-slate-400">Tam (%):</span>
                  <span className="font-mono text-white font-bold">{Math.round(element.width)}% × {Math.round(element.height)}%</span>
                </div>
              </div>
            </div>

            {/* Filtros Fotográficos Avançados */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Filtros Fotográficos & Opacidade</span>
                </h4>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Resetar
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>Opacidade</span>
                    <span>{element.filter?.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={element.filter?.opacity ?? 100}
                    onChange={(e) => updateFilter({ opacity: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>Brilho</span>
                    <span>{element.filter?.brightness ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={element.filter?.brightness ?? 100}
                    onChange={(e) => updateFilter({ brightness: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>Contraste</span>
                    <span>{element.filter?.contrast ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={element.filter?.contrast ?? 100}
                    onChange={(e) => updateFilter({ contrast: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>Desfoque / Blur</span>
                    <span>{element.filter?.blur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={element.filter?.blur ?? 0}
                    onChange={(e) => updateFilter({ blur: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Animação Motion */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Animação de Entrada & Loop</span>
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tipo de Animação
                </label>
                <select
                  value={element.animation?.type || 'none'}
                  onChange={(e) => updateAnimation({ type: e.target.value as ElementAnimationType })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                >
                  <option value="none">Nenhuma Animação</option>
                  <option value="fade-in">Fade In (Suave)</option>
                  <option value="slide-up">Slide para Cima</option>
                  <option value="slide-down">Slide para Baixo</option>
                  <option value="zoom-in">Zoom In (Crescer)</option>
                  <option value="bounce">Bounce (Quicar)</option>
                  <option value="pulse-loop">Pulse Loop (Pulsação Contínua)</option>
                  <option value="float-loop">Float Loop (Flutuando)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Duração ({element.animation?.duration || 0.6}s)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={element.animation?.duration || 0.6}
                    onChange={(e) => updateAnimation({ duration: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Atraso ({element.animation?.delay || 0}s)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={element.animation?.delay || 0}
                    onChange={(e) => updateAnimation({ delay: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Bloqueio de Edição */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-white text-xs">Bloquear Elemento</h5>
                <p className="text-[10px] text-slate-400">Impede movimentação acidental no canvas</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateElement({ ...element, locked: !element.locked })}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  element.locked ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
