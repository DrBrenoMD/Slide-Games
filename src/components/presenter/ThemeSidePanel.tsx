import React, { useState } from 'react';
import { PresentationTheme, PRESENTATION_THEMES, THEME_CATEGORIES } from '../../data/themes';
import { Slide } from '../../types';
import {
  Sparkles,
  Check,
  Palette,
  X,
  Search,
  CheckCircle2,
  Sliders,
  Type,
  Maximize2
} from 'lucide-react';

interface ThemeSidePanelProps {
  currentSlide: Slide;
  onApplyThemeToCurrentSlide: (theme: Partial<Slide['theme']>) => void;
  onApplyThemeToAllSlides: (theme: Partial<Slide['theme']>) => void;
  onClose: () => void;
}

export const ThemeSidePanel: React.FC<ThemeSidePanelProps> = ({
  currentSlide,
  onApplyThemeToCurrentSlide,
  onApplyThemeToAllSlides,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    currentSlide.theme?.id || 'theme_fiesta_tropical'
  );
  const [activeTab, setActiveTab] = useState<'gallery' | 'custom'>('gallery');
  const [showAppliedToast, setShowAppliedToast] = useState<string | null>(null);

  // Estado para Personalização de Cores Customizadas
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

  const filteredThemes = PRESENTATION_THEMES.filter((theme) => {
    const matchesCategory =
      selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTheme = (theme: PresentationTheme) => {
    setSelectedThemeId(theme.id);
    const themePayload: Partial<Slide['theme']> = {
      id: theme.id,
      name: theme.name,
      backgroundColor: theme.backgroundColor,
      backgroundGradient: theme.backgroundGradient,
      textColor: theme.textColor,
      accentColor: theme.accentColor,
      secondaryColor: theme.secondaryColor,
      cardBackgroundColor: theme.cardBackgroundColor,
      cardBorderColor: theme.cardBorderColor,
      fontFamily: theme.fontFamily,
      headingFontFamily: theme.headingFontFamily || theme.fontFamily,
      overlayGraphic: theme.overlayGraphic,
      cardStyle: theme.cardStyle,
      accentBorderRadius: theme.accentBorderRadius,
      glowIntensity: theme.glowIntensity,
      category: theme.category
    };

    // Aplica imediatamente ao slide atual para ver o Canva mudar em tempo real!
    onApplyThemeToCurrentSlide(themePayload);
  };

  const handleApplyToAll = () => {
    if (activeTab === 'gallery') {
      const theme = PRESENTATION_THEMES.find((t) => t.id === selectedThemeId) || PRESENTATION_THEMES[0];
      const themePayload: Partial<Slide['theme']> = {
        id: theme.id,
        name: theme.name,
        backgroundColor: theme.backgroundColor,
        backgroundGradient: theme.backgroundGradient,
        textColor: theme.textColor,
        accentColor: theme.accentColor,
        secondaryColor: theme.secondaryColor,
        cardBackgroundColor: theme.cardBackgroundColor,
        cardBorderColor: theme.cardBorderColor,
        fontFamily: theme.fontFamily,
        headingFontFamily: theme.headingFontFamily || theme.fontFamily,
        overlayGraphic: theme.overlayGraphic,
        cardStyle: theme.cardStyle,
        accentBorderRadius: theme.accentBorderRadius,
        glowIntensity: theme.glowIntensity,
        category: theme.category
      };
      onApplyThemeToAllSlides(themePayload);
      setShowAppliedToast(`Tema "${theme.name}" aplicado a TODOS os slides!`);
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
        headingFontFamily: customTheme.fontFamily,
        overlayGraphic: 'dots',
        cardStyle: 'glass',
        accentBorderRadius: '24px',
        glowIntensity: 'medium',
        category: 'personalizado'
      };
      onApplyThemeToAllSlides(customPayload);
      setShowAppliedToast(`Tema customizado aplicado a TODOS os slides!`);
    }

    setTimeout(() => setShowAppliedToast(null), 2500);
  };

  const handleUpdateCustomColor = (key: keyof typeof customTheme, val: string) => {
    const updated = { ...customTheme, [key]: val };
    setCustomTheme(updated);
    // Aplicação ao vivo no slide
    onApplyThemeToCurrentSlide({
      [key]: val,
      name: updated.name
    });
  };

  return (
    <aside
      aria-label="Painel Lateral de Temas"
      className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl space-y-4 max-h-[85vh] overflow-hidden"
    >
      {/* Cabeçalho do Painel Lateral */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Edição de Temas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                Ao Vivo
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Escolha e veja o Canva mudar ao lado
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fechar painel de temas"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alternância de Abas: Catálogo vs Customizado */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Catálogo (+30 Temas)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cores & Fontes
        </button>
      </div>

      {/* Toast de Notificação */}
      {showAppliedToast && (
        <div className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-lg animate-in fade-in shrink-0">
          <Check className="w-3.5 h-3.5" />
          <span>{showAppliedToast}</span>
        </div>
      )}

      {/* Conteúdo: Catálogo de Temas */}
      {activeTab === 'gallery' ? (
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Busca & Categorias */}
          <div className="space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar tema pelo nome ou categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Categorias em Pílulas Roláveis */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {THEME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Temas com Scroll Vertical */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {filteredThemes.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  role="button"
                  tabIndex={0}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                  style={{
                    background:
                      theme.backgroundGradient || theme.backgroundColor || '#0F172A'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{theme.badge}</span>
                    <div>
                      <div
                        className="text-xs font-black"
                        style={{ color: theme.textColor, fontFamily: theme.fontFamily }}
                      >
                        {theme.name}
                      </div>
                      <div
                        className="text-[10px] font-semibold opacity-75"
                        style={{ color: theme.textColor }}
                      >
                        {theme.categoryLabel} • {theme.fontFamily}
                      </div>
                    </div>
                  </div>

                  {/* Cores de visualização rápida */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center -space-x-1">
                      {theme.previewColors.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Aba de Cores Customizadas */
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 block">
              Paleta do Slide
            </span>

            {/* Fundo Sólido */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Cor de Fundo:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customTheme.backgroundColor}
                  onChange={(e) => handleUpdateCustomColor('backgroundColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400 uppercase">
                  {customTheme.backgroundColor}
                </span>
              </div>
            </div>

            {/* Cor do Texto Principal */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Cor do Texto:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customTheme.textColor}
                  onChange={(e) => handleUpdateCustomColor('textColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400 uppercase">
                  {customTheme.textColor}
                </span>
              </div>
            </div>

            {/* Cor de Destaque / Acento */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Cor de Destaque:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customTheme.accentColor}
                  onChange={(e) => handleUpdateCustomColor('accentColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400 uppercase">
                  {customTheme.accentColor}
                </span>
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Cor Secundária:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customTheme.secondaryColor}
                  onChange={(e) => handleUpdateCustomColor('secondaryColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400 uppercase">
                  {customTheme.secondaryColor}
                </span>
              </div>
            </div>

            {/* Tipografia */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-xs text-slate-300 font-medium block">Fonte Principal:</span>
              <select
                value={customTheme.fontFamily}
                onChange={(e) => handleUpdateCustomColor('fontFamily', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="Outfit">Outfit (Moderna e Limpa)</option>
                <option value="Poppins">Poppins (Geométrica)</option>
                <option value="Montserrat">Montserrat (Impactante)</option>
                <option value="Playfair Display">Playfair Display (Elegante Clássica)</option>
                <option value="Cinzel">Cinzel (Solene / Bíblica)</option>
                <option value="Orbitron">Orbitron (Cyberpunk / Futurista)</option>
                <option value="Bebas Neue">Bebas Neue (Display Condensada)</option>
                <option value="Fredoka">Fredoka (Descontraída / Dinâmica)</option>
                <option value="Press Start 2P">Press Start 2P (Pixel Art Retro)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé com Botão de Aplicar a Todos os Slides */}
      <div className="pt-2 border-t border-slate-800 shrink-0 space-y-2">
        <button
          type="button"
          onClick={handleApplyToAll}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-950/60 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Aplicar Este Tema a Todos os Slides</span>
        </button>
      </div>
    </aside>
  );
};
