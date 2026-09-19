import React, { useState } from 'react';
import { PresentationTheme, PRESENTATION_THEMES, THEME_CATEGORIES } from '../../data/themes';
import { Slide } from '../../types';
import {
  Sparkles,
  Check,
  Palette,
  X,
  Layers,
  Wand2,
  Sliders,
  Copy,
  ChevronRight,
  Search
} from 'lucide-react';

interface ThemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlide: Slide;
  onApplyThemeToCurrentSlide: (theme: Partial<Slide['theme']>) => void;
  onApplyThemeToAllSlides: (theme: Partial<Slide['theme']>) => void;
}

export const ThemeGalleryModal: React.FC<ThemeGalleryModalProps> = ({
  isOpen,
  onClose,
  currentSlide,
  onApplyThemeToCurrentSlide,
  onApplyThemeToAllSlides
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    currentSlide.theme?.id || 'theme_fiesta_tropical'
  );
  const [activeTab, setActiveTab] = useState<'gallery' | 'custom'>('gallery');

  // Estado do Criador de Tema Personalizado
  const [customTheme, setCustomTheme] = useState<{
    name: string;
    backgroundColor: string;
    backgroundGradient: string;
    textColor: string;
    accentColor: string;
    secondaryColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    fontFamily: string;
  }>({
    name: 'Meu Tema Custom',
    backgroundColor: currentSlide.theme?.backgroundColor || '#0F172A',
    backgroundGradient:
      currentSlide.theme?.backgroundGradient ||
      'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
    textColor: currentSlide.theme?.textColor || '#FFFFFF',
    accentColor: currentSlide.theme?.accentColor || '#6366F1',
    secondaryColor: currentSlide.theme?.secondaryColor || '#38BDF8',
    cardBackgroundColor: currentSlide.theme?.cardBackgroundColor || 'rgba(99, 102, 241, 0.15)',
    cardBorderColor: currentSlide.theme?.cardBorderColor || 'rgba(99, 102, 241, 0.4)',
    fontFamily: currentSlide.theme?.fontFamily || 'Outfit'
  });

  const [showAppliedToast, setShowAppliedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredThemes = PRESENTATION_THEMES.filter((theme) => {
    const matchesCategory =
      selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTheme =
    PRESENTATION_THEMES.find((t) => t.id === selectedThemeId) || PRESENTATION_THEMES[0];

  const handleApply = (toAll: boolean) => {
    if (activeTab === 'gallery') {
      const themePayload: Partial<Slide['theme']> = {
        id: selectedTheme.id,
        name: selectedTheme.name,
        backgroundColor: selectedTheme.backgroundColor,
        backgroundGradient: selectedTheme.backgroundGradient,
        textColor: selectedTheme.textColor,
        accentColor: selectedTheme.accentColor,
        secondaryColor: selectedTheme.secondaryColor,
        cardBackgroundColor: selectedTheme.cardBackgroundColor,
        cardBorderColor: selectedTheme.cardBorderColor,
        fontFamily: selectedTheme.fontFamily,
        category: selectedTheme.category
      };

      if (toAll) {
        onApplyThemeToAllSlides(themePayload);
        setShowAppliedToast(`Tema "${selectedTheme.name}" aplicado a TODOS os slides!`);
      } else {
        onApplyThemeToCurrentSlide(themePayload);
        setShowAppliedToast(`Tema "${selectedTheme.name}" aplicado ao slide atual!`);
      }
    } else {
      const customPayload: Partial<Slide['theme']> = {
        id: `custom_${Date.now()}`,
        name: customTheme.name,
        backgroundColor: customTheme.backgroundColor,
        backgroundGradient: customTheme.backgroundGradient,
        textColor: customTheme.textColor,
        accentColor: customTheme.accentColor,
        secondaryColor: customTheme.secondaryColor,
        cardBackgroundColor: customTheme.cardBackgroundColor,
        cardBorderColor: customTheme.cardBorderColor,
        fontFamily: customTheme.fontFamily,
        category: 'personalizado'
      };

      if (toAll) {
        onApplyThemeToAllSlides(customPayload);
        setShowAppliedToast(`Tema personalizado aplicado a TODOS os slides!`);
      } else {
        onApplyThemeToCurrentSlide(customPayload);
        setShowAppliedToast(`Tema personalizado aplicado ao slide atual!`);
      }
    }

    setTimeout(() => {
      setShowAppliedToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Modal */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Galeria de Temas & Estilos Visuais</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  30+ Estilos
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalize as cores, gradientes e tipografia dos seus slides instantaneamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Catálogo (30+)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'custom'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tema Personalizado
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificação Toast */}
        {showAppliedToast && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <Check className="w-4 h-4" />
            <span>{showAppliedToast}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        {activeTab === 'gallery' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Barra Lateral de Categorias */}
            <div className="w-full md:w-56 bg-slate-950/60 border-r border-slate-800 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <div className="relative mb-2 hidden md:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {THEME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.id === 'personalizado') setActiveTab('custom');
                  }}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Grid de Temas */}
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredThemes.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                      }`}
                      style={{
                        background:
                          theme.backgroundGradient || theme.backgroundColor || '#0F172A'
                      }}
                    >
                      {/* Badge de Selecionado */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Header do Card com Nome e Categoria */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{theme.badge}</span>
                        <div>
                          <h4
                            className="text-xs font-bold truncate max-w-[170px]"
                            style={{ color: theme.textColor, fontFamily: theme.fontFamily }}
                          >
                            {theme.name}
                          </h4>
                          <span
                            className="text-[10px] opacity-75 block uppercase tracking-wider font-semibold"
                            style={{ color: theme.textColor }}
                          >
                            {theme.categoryLabel}
                          </span>
                        </div>
                      </div>

                      {/* Preview em Miniatura dos Elementos com as Cores */}
                      <div
                        className="p-2.5 rounded-xl border mb-3 space-y-1.5"
                        style={{
                          backgroundColor: theme.cardBackgroundColor,
                          borderColor: theme.cardBorderColor
                        }}
                      >
                        <div
                          className="h-2 w-3/4 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <div
                          className="h-1.5 w-1/2 rounded-full opacity-60"
                          style={{ backgroundColor: theme.textColor }}
                        />
                      </div>

                      {/* Paleta de Cores (Swatches) */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          {theme.previewColors.map((color, i) => (
                            <div
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[10px] font-mono opacity-80"
                          style={{ color: theme.textColor }}
                        >
                          {theme.fontFamily}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Aba: Tema Personalizado */
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Controles de Cores */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes Finos de Cores & Gradientes</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Tema
                  </label>
                  <input
                    type="text"
                    value={customTheme.name}
                    onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fundo Principal
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTheme.backgroundColor}
                        onChange={(e) =>
                          setCustomTheme({
                            ...customTheme,
                            backgroundColor: e.target.value,
                            backgroundGradient: `linear-gradient(135deg, ${e.target.value} 0%, #111827 100%)`
                          })
                        }
                        className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customTheme.backgroundColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, backgroundColor: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cor do Texto
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTheme.textColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, textColor: e.target.value })
                        }
                        className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customTheme.textColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, textColor: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Destaque Primário (Accent)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTheme.accentColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, accentColor: e.target.value })
                        }
                        className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customTheme.accentColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, accentColor: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Destaque Secundário
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTheme.secondaryColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, secondaryColor: e.target.value })
                        }
                        className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customTheme.secondaryColor}
                        onChange={(e) =>
                          setCustomTheme({ ...customTheme, secondaryColor: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Família da Fonte
                  </label>
                  <select
                    value={customTheme.fontFamily}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, fontFamily: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
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
              </div>

              {/* Preview em Tempo Real do Tema Personalizado */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Pré-visualização do Slide
                </h4>

                <div
                  className="w-full aspect-video rounded-2xl p-6 border shadow-2xl flex flex-col justify-between"
                  style={{
                    background:
                      customTheme.backgroundGradient || customTheme.backgroundColor,
                    color: customTheme.textColor,
                    fontFamily: customTheme.fontFamily
                  }}
                >
                  <div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: customTheme.cardBackgroundColor,
                        borderColor: customTheme.cardBorderColor,
                        color: customTheme.accentColor
                      }}
                    >
                      ApresentaLive • Tema Personalizado
                    </span>
                    <h2
                      className="text-2xl font-black mt-3"
                      style={{ color: customTheme.textColor }}
                    >
                      Título do Slide Demonstrativo
                    </h2>
                    <p className="text-xs opacity-80 mt-1">
                      Este é um subtítulo com a tipografia e harmonia de cores escolhidas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="p-3 rounded-xl border flex items-center gap-2"
                      style={{
                        backgroundColor: customTheme.cardBackgroundColor,
                        borderColor: customTheme.cardBorderColor
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: customTheme.accentColor }}
                      >
                        A
                      </div>
                      <span className="text-xs font-semibold">Alternativa 1</span>
                    </div>

                    <div
                      className="p-3 rounded-xl border flex items-center gap-2"
                      style={{
                        backgroundColor: customTheme.cardBackgroundColor,
                        borderColor: customTheme.cardBorderColor
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: customTheme.secondaryColor }}
                      >
                        B
                      </div>
                      <span className="text-xs font-semibold">Alternativa 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé com Ações de Aplicação */}
        <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Tema selecionado:{' '}
              <strong className="text-white">
                {activeTab === 'gallery' ? selectedTheme.name : customTheme.name}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApply(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Aplicar no Slide Atual</span>
            </button>

            <button
              type="button"
              onClick={() => handleApply(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Aplicar em TODOS os Slides</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
