import React, { useState, useEffect } from 'react';
import { Slide, SlideType, Team, TeamMode } from '../../types';
import { PRESET_WORD_CATEGORIES, getWordsForCategory, getRandomWordForCategory, PRESET_TEAMS } from '../../data/presetWords';
import { storageService, SavedRoom } from '../../services/storage';
import { createDefaultSlide, convertSlideType } from '../../utils/slidePresets';
import { NewSlideModal } from './NewSlideModal';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Play,
  Settings,
  Download,
  Upload,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Palette,
  Eye,
  Shuffle,
  BookOpen,
  Tag,
  X,
  RefreshCw,
  ShieldAlert,
  Save,
  FolderOpen,
  Key,
  Users,
  Check,
  Edit3,
  Lock,
  Radio,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface SlideEditorProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlides: (slides: Slide[]) => void;
  onStartPresentation: () => void;
  // Propriedades da Sala para Configuração Prévia
  roomCode?: string;
  roomTitle?: string;
  presenterPassword?: string;
  teamMode?: TeamMode;
  teams?: Team[];
  onUpdateRoomSettings?: (settings: {
    roomTitle?: string;
    presenterPassword?: string;
    teamMode?: TeamMode;
    teams?: Team[];
  }) => void;
  onLoadSavedRoom?: (room: SavedRoom) => void;
  onCreateNewRoom?: (title: string, pin: string, password: string) => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onUpdateSlides,
  onStartPresentation,
  roomCode = '749201',
  roomTitle = 'Gincana & Slides Interativos',
  presenterPassword = '1234',
  teamMode = 'random',
  teams = PRESET_TEAMS,
  onUpdateRoomSettings,
  onLoadSavedRoom,
  onCreateNewRoom
}) => {
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Abas principais da tela de configurações
  const [mainView, setMainView] = useState<'slides' | 'presenter_functions' | 'saved_rooms'>('slides');
  const [activeSlideTab, setActiveSlideTab] = useState<'content' | 'theme' | 'timing'>('content');
  const [newWordInput, setNewWordInput] = useState('');
  const [isNewSlideModalOpen, setIsNewSlideModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados locais para salas salvas
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomPin, setNewRoomPin] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [isCreatingRoomModal, setIsCreatingRoomModal] = useState(false);

  // Estados locais para edição das configurações do apresentador
  const [tempRoomTitle, setTempRoomTitle] = useState(roomTitle);
  const [tempPassword, setTempPassword] = useState(presenterPassword);
  const [tempTeamMode, setTempTeamMode] = useState<TeamMode>(teamMode);
  const [tempTeams, setTempTeams] = useState<Team[]>(teams);

  // Sincroniza estados locais caso as props mudem
  useEffect(() => {
    setTempRoomTitle(roomTitle);
    setTempPassword(presenterPassword);
    setTempTeamMode(teamMode);
    setTempTeams(teams);
  }, [roomTitle, presenterPassword, teamMode, teams]);

  // Carrega salas salvas no carregamento
  useEffect(() => {
    refreshSavedRooms();
  }, []);

  const refreshSavedRooms = () => {
    const list = storageService.getSavedRooms();
    setSavedRooms(list);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Salvar a sala atual no storage
  const handleSaveCurrentRoom = () => {
    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle: tempRoomTitle,
      presenterPassword: tempPassword,
      slides,
      teamMode: tempTeamMode,
      teams: tempTeams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    storageService.saveRoom(currentData);
    storageService.setActiveRoomCode(roomCode);
    refreshSavedRooms();
    if (onUpdateRoomSettings) {
      onUpdateRoomSettings({
        roomTitle: tempRoomTitle,
        presenterPassword: tempPassword,
        teamMode: tempTeamMode,
        teams: tempTeams
      });
    }
    showToast(`✓ Sala "${tempRoomTitle}" salva com sucesso!`);
  };

  // Criar nova sala
  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    const pin = newRoomPin.trim() || String(Math.floor(100000 + Math.random() * 900000));
    const pass = newRoomPass.trim() || '1234';

    if (onCreateNewRoom) {
      onCreateNewRoom(newRoomTitle.trim(), pin, pass);
    } else {
      const defaultSlide = createDefaultSlide('content_cover', 0);
      const newRoom: SavedRoom = {
        id: `room-${pin}`,
        roomCode: pin,
        roomTitle: newRoomTitle.trim(),
        presenterPassword: pass,
        slides: [defaultSlide],
        teamMode: 'random',
        teams: PRESET_TEAMS,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      storageService.saveRoom(newRoom);
      storageService.setActiveRoomCode(pin);
      refreshSavedRooms();
      if (onLoadSavedRoom) onLoadSavedRoom(newRoom);
    }

    setIsCreatingRoomModal(false);
    setNewRoomTitle('');
    setNewRoomPin('');
    setNewRoomPass('');
    showToast(`✓ Nova sala "${newRoomTitle}" criada!`);
  };

  // Carregar sala salva selecionada
  const handleLoadRoom = (room: SavedRoom) => {
    if (onLoadSavedRoom) {
      onLoadSavedRoom(room);
    } else {
      onUpdateSlides(room.slides);
      if (onUpdateRoomSettings) {
        onUpdateRoomSettings({
          roomTitle: room.roomTitle,
          presenterPassword: room.presenterPassword,
          teamMode: room.teamMode,
          teams: room.teams
        });
      }
    }
    storageService.setActiveRoomCode(room.roomCode);
    onSelectSlide(0);
    showToast(`✓ Sala "${room.roomTitle}" carregada!`);
  };

  // Excluir sala salva
  const handleDeleteRoom = (code: string, title: string) => {
    if (savedRooms.length <= 1) {
      alert('Você deve manter pelo menos uma sala salva.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a sala "${title}" (PIN: ${code})?`)) {
      storageService.deleteRoom(code);
      refreshSavedRooms();
      showToast(`Sala "${title}" excluída.`);
    }
  };

  // Atualiza um campo do slide atual
  const updateCurrentSlide = (patch: Partial<Slide>) => {
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      ...patch
    };
    onUpdateSlides(updated);
  };

  // Troca de tipo de slide com preset e conversão inteligente
  const handleSlideTypeChange = (newType: SlideType) => {
    const converted = convertSlideType(currentSlide, newType);
    const updated = [...slides];
    updated[currentSlideIndex] = converted;
    onUpdateSlides(updated);
    showToast(`Tipo alterado para: ${newType}`);
  };

  // Adicionar novo slide a partir do modal de seleção de tipo
  const handleSelectNewSlideType = (type: SlideType) => {
    const newSlide = createDefaultSlide(type, slides.length);
    onUpdateSlides([...slides, newSlide]);
    onSelectSlide(slides.length);
    setIsNewSlideModalOpen(false);
    showToast(`Slide adicionado com sucesso!`);
  };

  // Duplicar slide
  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    const clone: Slide = {
      ...target,
      id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${target.title} (Cópia)`
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, clone);
    onUpdateSlides(updated);
    onSelectSlide(index + 1);
    showToast('Slide duplicado!');
  };

  // Deletar slide
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    onUpdateSlides(updated);
    onSelectSlide(Math.max(0, index - 1));
    showToast('Slide removido.');
  };

  // Mover slide para cima
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...slides];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onUpdateSlides(updated);
    onSelectSlide(index - 1);
  };

  // Mover slide para baixo
  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const updated = [...slides];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onUpdateSlides(updated);
    onSelectSlide(index + 1);
  };

  // Exportar apresentação como JSON
  const handleExportJSON = () => {
    const fullRoom: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle: tempRoomTitle,
      presenterPassword: tempPassword,
      slides,
      teamMode: tempTeamMode,
      teams: tempTeams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullRoom, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sala_${roomCode}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Arquivo JSON exportado!');
  };

  // Importar JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          // É uma SavedRoom completa
          if (onLoadSavedRoom) {
            onLoadSavedRoom(parsed);
          } else {
            onUpdateSlides(parsed.slides);
            if (onUpdateRoomSettings && parsed.roomTitle) {
              onUpdateRoomSettings({
                roomTitle: parsed.roomTitle,
                presenterPassword: parsed.presenterPassword || '1234',
                teamMode: parsed.teamMode || 'random',
                teams: parsed.teams || PRESET_TEAMS
              });
            }
          }
          storageService.saveRoom(parsed);
          refreshSavedRooms();
          showToast('Sala completa importada com sucesso!');
        } else if (Array.isArray(parsed)) {
          // É uma lista de slides
          onUpdateSlides(parsed);
          onSelectSlide(0);
          showToast('Slides importados com sucesso!');
        } else {
          alert('Arquivo JSON com formato não reconhecido.');
        }
      } catch (err) {
        alert('Erro ao importar JSON. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Adicionar time
  const handleAddTeam = () => {
    const teamColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
    const icons = ['🦁', '🦅', '🐺', '⚡', '🔥', '🛡️', '🌟'];
    const nextIdx = tempTeams.length;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `Time ${String.fromCharCode(65 + nextIdx)}`,
      color: teamColors[nextIdx % teamColors.length],
      badge: icons[nextIdx % icons.length],
      score: 0
    };
    const updated = [...tempTeams, newTeam];
    setTempTeams(updated);
    if (onUpdateRoomSettings) {
      onUpdateRoomSettings({ teams: updated });
    }
  };

  // Remover time
  const handleRemoveTeam = (teamId: string) => {
    if (tempTeams.length <= 2) {
      alert('É necessário manter no mínimo 2 times.');
      return;
    }
    const updated = tempTeams.filter((t) => t.id !== teamId);
    setTempTeams(updated);
    if (onUpdateRoomSettings) {
      onUpdateRoomSettings({ teams: updated });
    }
  };

  // Salvar configurações do apresentador
  const handleSavePresenterSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateRoomSettings) {
      onUpdateRoomSettings({
        roomTitle: tempRoomTitle,
        presenterPassword: tempPassword,
        teamMode: tempTeamMode,
        teams: tempTeams
      });
    }
    handleSaveCurrentRoom();
    showToast('✓ Configurações do Apresentador salvas com sucesso!');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Toast flutuante */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Navegação Superior da Tela de Configurações */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>Tela de Configurações & Editor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                PIN: {roomCode}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {roomTitle}
            </p>
          </div>
        </div>

        {/* Abas de Navegação das Configurações */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMainView('slides')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mainView === 'slides'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor de Slides ({slides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainView('presenter_functions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mainView === 'presenter_functions'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Funções do Apresentador & Regras</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMainView('saved_rooms');
              refreshSavedRooms();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mainView === 'saved_rooms'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salas Salvas ({savedRooms.length})</span>
          </button>
        </div>

        {/* Botão de Iniciar Apresentação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveCurrentRoom}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Salvar alterações no armazenamento local"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Salvar Sala</span>
          </button>

          <button
            type="button"
            onClick={onStartPresentation}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apresentar Telão</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: EDITOR DE SLIDES (INTERFACE DE EDIÇÃO E VISUALIZAÇÃO)
         ========================================================================= */}
      {mainView === 'slides' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Slides Thumbnails */}
          <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                Ordem dos Slides ({slides.length})
              </span>
              <button
                type="button"
                onClick={() => setIsNewSlideModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                title="Escolher tipo de slide para adicionar"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Slide</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSlide(idx)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    idx === currentSlideIndex
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">
                        {s.title}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize truncate block">
                        {s.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(idx);
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(idx);
                      }}
                      disabled={idx === slides.length - 1}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded cursor-pointer"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      disabled={slides.length <= 1}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded disabled:opacity-20 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações rápidas de backup no rodapé da barra */}
            <div className="p-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Exportar apresentação JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
              <label
                className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Importar apresentação JSON"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Center Canvas: Live Preview */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950/90 overflow-y-auto">
            <div className="w-full max-w-4xl aspect-[16/9] bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl p-8 flex flex-col justify-between relative overflow-hidden">
              {/* Badge de Pré-Visualização */}
              <div className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700">
                Prévia: {currentSlide.type}
              </div>

              {/* Título e Subtítulo */}
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">{currentSlide.title}</h2>
                {currentSlide.subtitle && (
                  <p className="text-slate-400 text-sm">{currentSlide.subtitle}</p>
                )}
              </div>

              {/* Opções de quiz/enquete */}
              {currentSlide.options && (
                <div className="grid grid-cols-2 gap-3 my-4">
                  {currentSlide.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-2xl border flex items-center justify-between text-sm font-bold text-white"
                      style={{ backgroundColor: `${opt.color || '#3B82F6'}20`, borderColor: opt.color || '#3B82F6' }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.icon || '●'}</span>
                        <span>{opt.text}</span>
                      </div>
                      {opt.isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Bullets */}
              {currentSlide.bullets && (
                <div className="space-y-2 my-3">
                  {currentSlide.bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Imagem */}
              {currentSlide.imageUrl && (
                <div className="my-2 rounded-2xl overflow-hidden max-h-48 border border-slate-700">
                  <img src={currentSlide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Previa do Infiltrado */}
              {currentSlide.type.startsWith('game_impostor') && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 my-3 text-center space-y-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-rose-400 block">
                    Jogo O Infiltrado ({currentSlide.impostorConfig?.mode === 'investigator' ? 'Modo Investigador' : 'Modo Clássico'})
                  </span>
                  <div className="text-xl font-black text-white">
                    Categoria: <span className="text-rose-300">{currentSlide.impostorConfig?.category || 'Geral'}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Palavra Secreta pré-definida: <span className="font-mono text-indigo-300 font-bold">{currentSlide.impostorConfig?.secretWord}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Agentes: {currentSlide.impostorConfig?.numAgents || 4} | Infiltrados: {currentSlide.impostorConfig?.numImpostors || 1} | Escolha: {currentSlide.impostorConfig?.selectionMethod === 'manual' ? 'Manual no Palco' : 'Sorteio Aleatório'}
                  </div>
                </div>
              )}

              {/* Rodapé do Slide */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                <span>Slide #{currentSlideIndex + 1} de {slides.length}</span>
                <span>{currentSlide.isCompetitive ? `⏱️ ${currentSlide.timeLimitSeconds || 20}s (Quiz)` : 'Interação Livre'}</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Slide Properties Editor */}
          <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
            {/* Abas internas de propriedades */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                Propriedades do Slide
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSlideTab('content')}
                  className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    activeSlideTab === 'content' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Conteúdo"
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlideTab('timing')}
                  className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    activeSlideTab === 'timing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tempo e Regras"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SELEÇÃO DO TIPO DE SLIDE COM CONVERSÃO INTELIGENTE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-indigo-400 block">
                  Tipo de Slide
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewSlideModalOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Ver Todos os Tipos
                </button>
              </div>
              <select
                value={currentSlide.type}
                onChange={(e) => handleSlideTypeChange(e.target.value as SlideType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <optgroup label="Quizes Competitivos / Casuais">
                  <option value="quiz_multiple_choice">Múltipla Escolha</option>
                  <option value="quiz_true_false">Verdadeiro ou Falso</option>
                  <option value="quiz_term_sprint">Sprint de Vocabulário (Termos)</option>
                  <option value="quiz_image_pin">Apontar na Imagem (Hotspot)</option>
                  <option value="quiz_short_answer">Resposta Curta</option>
                </optgroup>
                <optgroup label="Pesquisas & Interações">
                  <option value="poll_single">Enquete de Opinião</option>
                  <option value="interaction_word_cloud">Nuvem de Palavras</option>
                </optgroup>
                <optgroup label="Jogos Sociais">
                  <option value="game_impostor_investigator">O Infiltrado (Modo Investigador)</option>
                  <option value="game_impostor_classic">O Infiltrado (Modo Clássico)</option>
                </optgroup>
                <optgroup label="Conteúdo & Apresentação (Canva/PPT)">
                  <option value="content_cover">Capa / Título Principal</option>
                  <option value="content_bullets">Lista de Tópicos (Bullets)</option>
                  <option value="content_media">Mídia / Imagem com Texto</option>
                  <option value="content_quote">Citação / Frase de Impacto</option>
                  <option value="content_qrcode_lobby">Lobby de Entrada (QR Code)</option>
                  <option value="leaderboard">Pódio & Ranking</option>
                </optgroup>
              </select>
            </div>

            {/* Título e Subtítulo */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Título do Slide</label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Subtítulo / Instrução</label>
                <input
                  type="text"
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Se for Imagem ou Mídia */}
            {(currentSlide.type === 'content_media' || currentSlide.type === 'quiz_image_pin') && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={currentSlide.imageUrl || ''}
                  onChange={(e) => updateCurrentSlide({ imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* SE FOR O JOGO DO INFILTRADO: CONFIGURAÇÕES COMPLETAS NESTE SLIDE */}
            {currentSlide.type.startsWith('game_impostor') && (
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>O Infiltrado: Regras Deste Slide</span>
                </div>

                {/* Modo */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Modo de Jogo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSlideTypeChange('game_impostor_investigator');
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.type === 'game_impostor_investigator'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🕵️ Investigador
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSlideTypeChange('game_impostor_classic');
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.type === 'game_impostor_classic'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🎭 Clássico
                    </button>
                  </div>
                </div>

                {/* Qtd Agentes, Qtd Infiltrados e Forma de Escolha */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Agentes
                    </label>
                    <select
                      value={currentSlide.impostorConfig?.numAgents || 4}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        updateCurrentSlide({
                          impostorConfig: currentSlide.impostorConfig
                            ? { ...currentSlide.impostorConfig, numAgents: num }
                            : undefined
                        });
                      }}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-rose-400 block mb-1">
                      Infiltrados
                    </label>
                    <select
                      value={currentSlide.impostorConfig?.numImpostors || 1}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        updateCurrentSlide({
                          impostorConfig: currentSlide.impostorConfig
                            ? { ...currentSlide.impostorConfig, numImpostors: num }
                            : undefined
                        });
                      }}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Escolha
                    </label>
                    <select
                      value={currentSlide.impostorConfig?.selectionMethod || 'random'}
                      onChange={(e) => {
                        const method = e.target.value as 'random' | 'manual';
                        updateCurrentSlide({
                          impostorConfig: currentSlide.impostorConfig
                            ? { ...currentSlide.impostorConfig, selectionMethod: method }
                            : undefined
                        });
                      }}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value="random">Sorteio</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                {/* Revelar palavra aos investigadores */}
                {currentSlide.impostorConfig?.mode === 'investigator' && (
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer text-xs">
                    <span className="font-semibold text-slate-300">
                      Revelar Palavra aos Investigadores (Plateia)
                    </span>
                    <input
                      type="checkbox"
                      checked={currentSlide.impostorConfig.revealWordToInvestigators ?? false}
                      onChange={(e) => {
                        updateCurrentSlide({
                          impostorConfig: currentSlide.impostorConfig
                            ? { ...currentSlide.impostorConfig, revealWordToInvestigators: e.target.checked }
                            : undefined
                        });
                      }}
                      className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </label>
                )}

                {/* Categoria e Palavra Secreta */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={currentSlide.impostorConfig?.category || 'Personagens Bíblicos'}
                    onChange={(e) => {
                      const catName = e.target.value;
                      const words = getWordsForCategory(catName);
                      const secretWord = getRandomWordForCategory(catName);
                      updateCurrentSlide({
                        impostorConfig: currentSlide.impostorConfig
                          ? {
                              ...currentSlide.impostorConfig,
                              category: catName,
                              customWordList: words,
                              secretWord
                            }
                          : undefined
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    {PRESET_WORD_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name} ({cat.words.length} palavras)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-400">Palavra Secreta</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cat = currentSlide.impostorConfig?.category || 'Personagens Bíblicos';
                        const newWord = getRandomWordForCategory(cat);
                        updateCurrentSlide({
                          impostorConfig: currentSlide.impostorConfig
                            ? { ...currentSlide.impostorConfig, secretWord: newWord }
                            : undefined
                        });
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sortear Outra</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentSlide.impostorConfig?.secretWord || ''}
                    onChange={(e) => {
                      updateCurrentSlide({
                        impostorConfig: currentSlide.impostorConfig
                          ? { ...currentSlide.impostorConfig, secretWord: e.target.value }
                          : undefined
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold font-mono"
                  />
                </div>
              </div>
            )}

            {/* Alternativas de quiz se aplicável */}
            {currentSlide.options && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400">
                    Alternativas ({currentSlide.options.length})
                  </label>
                </div>

                <div className="space-y-2">
                  {currentSlide.options.map((opt, idx) => (
                    <div key={opt.id} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={opt.isCorrect}
                          onChange={() => {
                            const updatedOpts = currentSlide.options!.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx
                            }));
                            updateCurrentSlide({ options: updatedOpts });
                          }}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          title="Marcar como correta"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updatedOpts = [...currentSlide.options!];
                            updatedOpts[idx] = { ...opt, text: e.target.value };
                            updateCurrentSlide({ options: updatedOpts });
                          }}
                          className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullets se aplicável */}
            {currentSlide.bullets && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Pontos em Tópicos</label>
                {currentSlide.bullets.map((b, i) => (
                  <input
                    key={i}
                    type="text"
                    value={b}
                    onChange={(e) => {
                      const updatedBullets = [...currentSlide.bullets!];
                      updatedBullets[i] = e.target.value;
                      updateCurrentSlide({ bullets: updatedBullets });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                ))}
              </div>
            )}

            {/* Tempo e Pontuação */}
            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tempo & Pontuação
              </span>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tempo Limite (Segundos)</label>
                <select
                  value={currentSlide.timeLimitSeconds || 0}
                  onChange={(e) => updateCurrentSlide({ timeLimitSeconds: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value={0}>Sem Limite (Manual)</option>
                  <option value={10}>10 Segundos</option>
                  <option value={15}>15 Segundos</option>
                  <option value={20}>20 Segundos</option>
                  <option value={30}>30 Segundos</option>
                  <option value={45}>45 Segundos</option>
                  <option value={60}>60 Segundos</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Bônus por Velocidade</span>
                <input
                  type="checkbox"
                  checked={currentSlide.speedBonus ?? true}
                  onChange={(e) => updateCurrentSlide({ speedBonus: e.target.checked })}
                  className="rounded accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: FUNÇÕES DO APRESENTADOR & REGRAS DA SALA (EDIÇÃO PRÉVIA)
         ========================================================================= */}
      {mainView === 'presenter_functions' && (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
              Edição Prévia & Segurança
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              Funções & Parâmetros do Apresentador
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure com antecedência as credenciais, times da gincana, regras de pontuação e parâmetros do jogo "O Infiltrado".
            </p>
          </div>

          <form onSubmit={handleSavePresenterSettings} className="space-y-6">
            {/* Bloco 1: Acesso & Segurança */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                <Lock className="w-4 h-4" />
                <span>Credenciais da Sala & Segurança</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Código PIN da Sala:
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-base font-black text-indigo-400 tracking-wider">
                    {roomCode}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Utilizado pelos participantes para entrar.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Título da Apresentação / Evento:
                  </label>
                  <input
                    type="text"
                    value={tempRoomTitle}
                    onChange={(e) => setTempRoomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Gincana Bíblica de Jovens"
                  />
                </div>
              </div>

              {/* Senha do Apresentador */}
              <div className="pt-2">
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Senha do Apresentador / Admin:
                </label>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    {showPassword ? 'Ocultar' : 'Exibir'}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Exigida para acessar o Console do Apresentador e a Tela de Configurações.
                </span>
              </div>
            </div>

            {/* Bloco 2: Modo de Times & Gerenciamento de Equipes */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Users className="w-4 h-4" />
                  <span>Dinâmica de Times & Gincana</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddTeam}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Time</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Forma de Divisão dos Jogadores:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => setTempTeamMode('none')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      tempTeamMode === 'none'
                        ? 'bg-indigo-950/60 border-indigo-500 shadow'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-white text-xs mb-1">Sem Times (Individual)</div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      Cada participante compete individualmente pelo pódio.
                    </div>
                  </label>

                  <label
                    onClick={() => setTempTeamMode('random')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      tempTeamMode === 'random'
                        ? 'bg-indigo-950/60 border-indigo-500 shadow'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-white text-xs mb-1">Sorteio Equilibrado</div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      O sistema distribui os jogadores nos times automaticamente.
                    </div>
                  </label>

                  <label
                    onClick={() => setTempTeamMode('choose')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      tempTeamMode === 'choose'
                        ? 'bg-indigo-950/60 border-indigo-500 shadow'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-white text-xs mb-1">Escolha Livre</div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      O participante escolhe a qual time quer pertencer no celular.
                    </div>
                  </label>
                </div>
              </div>

              {/* Lista e Edição de Times */}
              {tempTeamMode !== 'none' && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 block">
                    Times Cadastrados:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tempTeams.map((team, idx) => (
                      <div
                        key={team.id}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={team.badge || '⚡'}
                            onChange={(e) => {
                              const updated = [...tempTeams];
                              updated[idx] = { ...team, badge: e.target.value };
                              setTempTeams(updated);
                            }}
                            className="w-10 text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-lg"
                            title="Emoji ou Ícone"
                          />
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => {
                              const updated = [...tempTeams];
                              updated[idx] = { ...team, name: e.target.value };
                              setTempTeams(updated);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          />
                          <input
                            type="color"
                            value={team.color}
                            onChange={(e) => {
                              const updated = [...tempTeams];
                              updated[idx] = { ...team, color: e.target.value };
                              setTempTeams(updated);
                            }}
                            className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                            title="Cor do Time"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team.id)}
                          disabled={tempTeams.length <= 2}
                          className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                          title="Remover time"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 3: Regras Globais de "O Infiltrado" */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Configurações Globais do Jogo "O Infiltrado"</span>
              </div>

              <p className="text-xs text-slate-400">
                Estes parâmetros se aplicam a todos os slides do Infiltrado quando novos slides forem gerados ou resetados.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Número Padrão de Agentes:
                  </label>
                  <select
                    defaultValue={4}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = slides.map((s) => {
                        if (s.impostorConfig) {
                          return { ...s, impostorConfig: { ...s.impostorConfig, numAgents: val } };
                        }
                        return s;
                      });
                      onUpdateSlides(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value={3}>3 Agentes</option>
                    <option value={4}>4 Agentes</option>
                    <option value={5}>5 Agentes</option>
                    <option value={6}>6 Agentes</option>
                    <option value={8}>8 Agentes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-400 block mb-1">
                    Número Padrão de Infiltrados:
                  </label>
                  <select
                    defaultValue={1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = slides.map((s) => {
                        if (s.impostorConfig) {
                          return { ...s, impostorConfig: { ...s.impostorConfig, numImpostors: val } };
                        }
                        return s;
                      });
                      onUpdateSlides(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value={1}>1 Infiltrado</option>
                    <option value={2}>2 Infiltrados</option>
                    <option value={3}>3 Infiltrados</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Forma de Escolha dos Agentes:
                  </label>
                  <select
                    defaultValue="random"
                    onChange={(e) => {
                      const val = e.target.value as 'random' | 'manual';
                      const updated = slides.map((s) => {
                        if (s.impostorConfig) {
                          return { ...s, impostorConfig: { ...s.impostorConfig, selectionMethod: val } };
                        }
                        return s;
                      });
                      onUpdateSlides(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="random">Sorteio Aleatório</option>
                    <option value="manual">Manual pelo Apresentador</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botão de Salvar Alterações */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Todas as Configurações</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SALAS & APRESENTAÇÕES SALVAS (GERENCIADOR DE PERSISTÊNCIA)
         ========================================================================= */}
      {mainView === 'saved_rooms' && (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
                Armazenamento Local Persistente
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Salas & Apresentações Salvas
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Suas salas criadas e apresentações ficam salvas no seu navegador para uso contínuo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingRoomModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Nova Sala</span>
              </button>
            </div>
          </div>

          {/* Lista de Salas Salvas */}
          <div className="space-y-3">
            {savedRooms.map((room) => {
              const isCurrent = room.roomCode === roomCode;
              return (
                <div
                  key={room.id || room.roomCode}
                  className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                        PIN: {room.roomCode}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                          Sala Ativa Agora
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-black text-white">
                      {room.roomTitle}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>📑 {room.slides?.length || 0} slides</span>
                      <span>•</span>
                      <span>🛡️ {room.teams?.length || 0} times</span>
                      <span>•</span>
                      <span>🔑 Senha: {room.presenterPassword}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isCurrent ? (
                      <button
                        type="button"
                        onClick={() => handleLoadRoom(room)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Carregar Sala</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveCurrentRoom}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Novamente</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const clone: SavedRoom = {
                          ...room,
                          id: `room-${Date.now()}`,
                          roomCode: String(Math.floor(100000 + Math.random() * 900000)),
                          roomTitle: `${room.roomTitle} (Cópia)`,
                          createdAt: Date.now(),
                          updatedAt: Date.now()
                        };
                        storageService.saveRoom(clone);
                        refreshSavedRooms();
                        showToast(`Cópia da sala criada com PIN ${clone.roomCode}`);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                      title="Duplicar esta sala"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.roomCode, room.roomTitle)}
                      disabled={savedRooms.length <= 1}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-xs font-bold disabled:opacity-20 cursor-pointer"
                      title="Excluir sala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVA SALA */}
      {isCreatingRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">Criar Nova Sala</h3>
              <button
                type="button"
                onClick={() => setIsCreatingRoomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Título da Sala:
                </label>
                <input
                  type="text"
                  required
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="Ex: Treinamento / Gincana"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    PIN (opcional):
                  </label>
                  <input
                    type="text"
                    value={newRoomPin}
                    onChange={(e) => setNewRoomPin(e.target.value)}
                    placeholder="Auto gerado"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Senha do Admin:
                  </label>
                  <input
                    type="text"
                    value={newRoomPass}
                    onChange={(e) => setNewRoomPass(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Criar e Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ESCOLHA DO TIPO DE NOVO SLIDE */}
      <NewSlideModal
        isOpen={isNewSlideModalOpen}
        onClose={() => setIsNewSlideModalOpen(false)}
        onSelectType={handleSelectNewSlideType}
      />
    </div>
  );
};
