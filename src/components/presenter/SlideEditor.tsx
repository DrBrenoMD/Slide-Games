import React, { useState, useEffect } from 'react';
import { Slide, SlideType, Team, TeamMode, SavedPresentation, GarticConfig } from '../../types';
import { PRESET_WORD_CATEGORIES, getWordsForCategory, getRandomWordForCategory, PRESET_TEAMS } from '../../data/presetWords';
import { GARTIC_CATEGORIES } from '../../data/garticPresets';
import { storageService, SavedRoom } from '../../services/storage';
import { createDefaultSlide, convertSlideType } from '../../utils/slidePresets';
import { useAuth } from '../../context/AuthContext';
import { UserAuthBar } from '../common/UserAuthBar';
import { NewSlideModal } from './NewSlideModal';
import { SlideCanvasEditor } from './SlideCanvasEditor';
import { ThemeSidePanel } from './ThemeSidePanel';
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
  AlertCircle,
  Cloud,
  Layers,
  Calendar,
  LogIn,
  RotateCcw
} from 'lucide-react';

interface SlideEditorProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlides: (slides: Slide[]) => void;
  onStartPresentation: () => void;
  onResetPresentation?: () => void;
  // Propriedades da Sala para Configuração Prévia
  roomCode?: string;
  roomTitle?: string;
  presenterPassword?: string;
  roomPassword?: string;
  teamMode?: TeamMode;
  teams?: Team[];
  onUpdateRoomSettings?: (settings: {
    roomTitle?: string;
    presenterPassword?: string;
    roomPassword?: string;
    teamMode?: TeamMode;
    teams?: Team[];
  }) => void;
  onLoadSavedRoom?: (room: SavedRoom) => void;
  onCreateNewRoom?: (title: string, pin: string, password: string, roomPassword?: string) => void;
  onLoadPresentation?: (pres: SavedPresentation) => void;
}


export const SlideEditor: React.FC<SlideEditorProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onUpdateSlides,
  onStartPresentation,
  onResetPresentation,
  roomCode = '749201',
  roomTitle = 'Gincana & Slides Interativos',
  presenterPassword = '1234',
  roomPassword = '',
  teamMode = 'random',
  teams = PRESET_TEAMS,
  onUpdateRoomSettings,
  onLoadSavedRoom,
  onCreateNewRoom,
  onLoadPresentation
}) => {
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const { user, savedPresentations, savePresentationToCloud, removePresentationFromCloud, loginWithGoogle } = useAuth();

  // Abas principais da tela de configurações
  const [mainView, setMainView] = useState<'slides' | 'presenter_functions' | 'saved_rooms'>('slides');
  const [savedSourceTab, setSavedSourceTab] = useState<'cloud' | 'local'>('cloud');
  const [activeSlideTab, setActiveSlideTab] = useState<'content' | 'theme' | 'timing'>('content');
  const [newWordInput, setNewWordInput] = useState('');
  const [isNewSlideModalOpen, setIsNewSlideModalOpen] = useState(false);
  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showParticipantPassword, setShowParticipantPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  // Identificador da apresentação ativa na nuvem para evitar duplicações
  const [activePresentationId, setActivePresentationId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('saved');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(null);

  // Estados locais para salas salvas
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomPin, setNewRoomPin] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [newRoomRequireParticipantPass, setNewRoomRequireParticipantPass] = useState(false);
  const [newRoomParticipantPass, setNewRoomParticipantPass] = useState('');
  const [newRoomError, setNewRoomError] = useState('');
  const [isCreatingRoomModal, setIsCreatingRoomModal] = useState(false);

  // Estados locais para edição das configurações do apresentador
  const [tempRoomTitle, setTempRoomTitle] = useState(roomTitle);
  const [tempPassword, setTempPassword] = useState(presenterPassword);
  const [tempRequireRoomPassword, setTempRequireRoomPassword] = useState(Boolean(roomPassword && roomPassword.trim()));
  const [tempRoomPassword, setTempRoomPassword] = useState(roomPassword || '');
  const [tempTeamMode, setTempTeamMode] = useState<TeamMode>(teamMode);
  const [tempTeams, setTempTeams] = useState<Team[]>(teams);

  // Sincroniza estados locais caso as props mudem
  useEffect(() => {
    setTempRoomTitle(roomTitle);
    setTempPassword(presenterPassword);
    setTempRequireRoomPassword(Boolean(roomPassword && roomPassword.trim()));
    setTempRoomPassword(roomPassword || '');
    setTempTeamMode(teamMode);
    setTempTeams(teams);
  }, [roomTitle, presenterPassword, roomPassword, teamMode, teams]);

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

  // Resolve ID existente para evitar duplicar arquivos com o mesmo título ou apresentação aberta
  const resolveTargetPresentationId = (): string | undefined => {
    if (activePresentationId) {
      return activePresentationId;
    }
    // Procura na lista de apresentações do usuário se já existe uma com o mesmo título exato
    const currentTitle = (tempRoomTitle || 'Minha Apresentação').trim().toLowerCase();
    const existing = savedPresentations.find(
      (p) => p.title.trim().toLowerCase() === currentTitle
    );
    return existing ? existing.id : undefined;
  };

  // Motor de Salvamento Automático na Nuvem (Debounced)
  useEffect(() => {
    if (!user || !autoSaveEnabled || slides.length === 0) return;

    setAutoSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        const targetId = resolveTargetPresentationId();
        const primaryTheme = currentSlide.theme?.id || 'modern-dark';
        const saved = await savePresentationToCloud(
          tempRoomTitle || 'Minha Apresentação',
          slides,
          primaryTheme,
          targetId
        );
        if (saved && saved.id) {
          setActivePresentationId(saved.id);
        }
        setAutoSaveStatus('saved');
        setLastSavedTimestamp(new Date());
      } catch (err) {
        console.warn('Falha no salvamento automático na nuvem:', err);
        setAutoSaveStatus('unsaved');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [slides, tempRoomTitle, user, autoSaveEnabled]);

  // Salvar apresentação diretamente na Nuvem (Google Firestore) com proteção contra duplicatas
  const handleSaveToCloud = async () => {
    if (!user) {
      const confirmLogin = window.confirm('Você precisa estar conectado com sua conta Google para salvar na nuvem. Deseja fazer login agora?');
      if (confirmLogin) {
        await loginWithGoogle();
      }
      return;
    }

    try {
      setIsSavingCloud(true);
      setAutoSaveStatus('saving');
      const targetId = resolveTargetPresentationId();
      const primaryTheme = currentSlide.theme?.id || 'modern-dark';
      const saved = await savePresentationToCloud(
        tempRoomTitle || 'Minha Apresentação',
        slides,
        primaryTheme,
        targetId
      );
      if (saved && saved.id) {
        setActivePresentationId(saved.id);
      }
      setAutoSaveStatus('saved');
      setLastSavedTimestamp(new Date());
      showToast('✓ Apresentação salva na sua nuvem Google com sucesso (sem duplicatas)!');
    } catch (err: any) {
      showToast('⚠️ Erro ao salvar na nuvem: ' + (err.message || 'Falha na conexão'));
      setAutoSaveStatus('unsaved');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Salvar a sala atual no storage local
  const handleSaveCurrentRoom = () => {
    const cleanTitle = tempRoomTitle.trim();
    if (!cleanTitle) {
      showToast('⚠️ O título da sala não pode ficar vazio.');
      return;
    }

    // Validação de unicidade do título
    if (storageService.isRoomTitleTaken(cleanTitle, roomCode)) {
      showToast(`⚠️ Já existe outra sala cadastrada com o nome "${cleanTitle}". Escolha um nome exclusivo.`);
      return;
    }

    // Validação de senha dos participantes
    let finalRoomPassword: string | undefined = undefined;
    if (tempRequireRoomPassword) {
      if (!tempRoomPassword.trim()) {
        showToast('⚠️ Defina a senha para os participantes ou desative a proteção.');
        return;
      }
      if (tempRoomPassword.trim() === tempPassword.trim()) {
        showToast('⚠️ A senha de participantes deve ser diferente da senha do apresentador/admin.');
        return;
      }
      finalRoomPassword = tempRoomPassword.trim();
    }

    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle: cleanTitle,
      presenterPassword: tempPassword,
      roomPassword: finalRoomPassword,
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
        roomTitle: cleanTitle,
        presenterPassword: tempPassword,
        roomPassword: finalRoomPassword,
        teamMode: tempTeamMode,
        teams: tempTeams
      });
    }
    showToast(`✓ Sala "${cleanTitle}" salva com sucesso!`);
  };

  // Criar nova sala
  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewRoomError('');
    const cleanTitle = newRoomTitle.trim();
    if (!cleanTitle) {
      setNewRoomError('Por favor, informe o título da sala.');
      return;
    }

    // Validação de unicidade do título da sala
    if (storageService.isRoomTitleTaken(cleanTitle)) {
      setNewRoomError(`Já existe uma sala cadastrada com o nome "${cleanTitle}". Escolha um nome exclusivo.`);
      return;
    }

    const pin = newRoomPin.trim() || storageService.generateUniqueRoomCode();
    if (storageService.isRoomCodeTaken(pin)) {
      setNewRoomError(`O PIN "${pin}" já está em uso por outra sala. Digite outro ou deixe em branco para gerar automaticamente.`);
      return;
    }

    const pass = newRoomPass.trim() || '1234';

    let participantPass: string | undefined = undefined;
    if (newRoomRequireParticipantPass) {
      if (!newRoomParticipantPass.trim()) {
        setNewRoomError('Por favor, defina a senha para os participantes.');
        return;
      }
      if (newRoomParticipantPass.trim() === pass.trim()) {
        setNewRoomError('A senha de participantes deve ser diferente da senha de Admin/Apresentador.');
        return;
      }
      participantPass = newRoomParticipantPass.trim();
    }

    if (onCreateNewRoom) {
      onCreateNewRoom(cleanTitle, pin, pass, participantPass);
    } else {
      const defaultSlide = createDefaultSlide('content_cover', 0);
      const newRoom: SavedRoom = {
        id: `room-${pin}`,
        roomCode: pin,
        roomTitle: cleanTitle,
        presenterPassword: pass,
        roomPassword: participantPass,
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
    setNewRoomRequireParticipantPass(false);
    setNewRoomParticipantPass('');
    setNewRoomError('');
    showToast(`✓ Nova sala "${cleanTitle}" criada!`);
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
            <span>Salas & Nuvem ({user ? savedPresentations.length : savedRooms.length})</span>
          </button>
        </div>

        {/* Ações de Salvar e Iniciar */}
        <div className="flex items-center gap-2">
          {/* Indicador e Controle de Salvamento Automático na Nuvem */}
          {user ? (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${
                autoSaveStatus === 'saving'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                  : autoSaveStatus === 'saved'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title={`Salvamento automático na nuvem ${autoSaveEnabled ? 'ativado' : 'desativado'}. Clique para alternar.`}
            >
              <button
                type="button"
                onClick={() => setAutoSaveEnabled((prev) => !prev)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Cloud className={`w-3.5 h-3.5 ${autoSaveStatus === 'saving' ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
                <span>
                  {autoSaveStatus === 'saving'
                    ? 'Salvando na Nuvem...'
                    : autoSaveEnabled
                    ? 'Auto-Save Nuvem: Ativo'
                    : 'Auto-Save: Pausado'}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (e) {
                  // Handled
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold cursor-pointer transition-all"
              title="Faça login com Google para ativar o salvamento automático na nuvem"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Ativar Auto-Save Nuvem</span>
            </button>
          )}

          {/* Botão Salvar na Nuvem */}
          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSavingCloud}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title="Salvar esta apresentação na sua conta Google para acessar de qualquer aparelho"
          >
            <Cloud className={`w-3.5 h-3.5 text-sky-200 ${isSavingCloud ? 'animate-bounce' : ''}`} />
            <span>{isSavingCloud ? 'Salvando...' : 'Salvar na Nuvem'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCurrentRoom}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Salvar alterações no armazenamento local do navegador"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Salvar Local</span>
          </button>

          {/* Botão Resetar Apresentação */}
          {onResetPresentation && (
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs font-bold border border-rose-800/80 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Resetar participantes, pontuações, sorteios e estatísticas da apresentação"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Resetar Apresentação</span>
              <span className="md:hidden">Resetar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartPresentation}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apresentar Telão</span>
          </button>

          <div className="hidden lg:block pl-2 border-l border-slate-800">
            <UserAuthBar />
          </div>
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

          {/* Center Canvas: Interactive Slide & Media Studio */}
          <div className="flex-1 p-4 md:p-6 flex flex-col bg-slate-950 overflow-y-auto">
            <SlideCanvasEditor
              slide={currentSlide}
              onUpdateSlide={(updated) => {
                const updatedSlides = [...slides];
                updatedSlides[currentSlideIndex] = updated;
                onUpdateSlides(updatedSlides);
              }}
              onApplyThemeToAllSlides={(themeUpdates) => {
                const updatedSlides = slides.map((s) => ({
                  ...s,
                  theme: {
                    ...s.theme,
                    ...themeUpdates
                  }
                }));
                onUpdateSlides(updatedSlides);
                showToast('✓ Tema aplicado a todos os slides da apresentação!');
              }}
            />
          </div>

          {/* Right Sidebar: Slide Properties Editor ou Painel Lateral de Temas */}
          <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
            {isThemeGalleryOpen ? (
              <ThemeSidePanel
                currentSlide={currentSlide}
                onApplyThemeToCurrentSlide={(themeUpdates) => {
                  updateCurrentSlide({
                    theme: {
                      ...currentSlide.theme,
                      ...themeUpdates
                    }
                  });
                  showToast('✓ Tema aplicado ao slide atual!');
                }}
                onApplyThemeToAllSlides={(themeUpdates) => {
                  const updatedSlides = slides.map((s) => ({
                    ...s,
                    theme: {
                      ...s.theme,
                      ...themeUpdates
                    }
                  }));
                  onUpdateSlides(updatedSlides);
                  showToast('✓ Tema aplicado a todos os slides da apresentação!');
                }}
                onClose={() => setIsThemeGalleryOpen(false)}
              />
            ) : (
              <>
                {/* Abas internas de propriedades */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                    Propriedades do Slide
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsThemeGalleryOpen(true)}
                      className="px-2 py-1 rounded-lg text-xs font-bold cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center gap-1 shadow"
                      title="Galeria de Temas (+30 Estilos)"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[11px]">Temas</span>
                    </button>
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

                {/* Banner de Acesso Rápido a Temas Visuais */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/50 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-300 block">
                      Design do Slide
                    </span>
                    <span className="text-xs font-bold text-white">
                      {currentSlide.theme?.id ? currentSlide.theme.id.replace('theme_', '').replace(/_/g, ' ') : 'Padrão'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsThemeGalleryOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                  >
                    <Palette className="w-3 h-3 text-amber-300" />
                    <span>Trocar Tema</span>
                  </button>
                </div>
              </>
            )}

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
                  <option value="game_drawing_gartic">🎨 Jogo de Desenho (Gartic & Imagem e Ação)</option>
                  <option value="game_impostor_investigator">O Infiltrado (Modo Investigador)</option>
                  <option value="game_impostor_classic">O Infiltrado (Modo Clássico)</option>
                </optgroup>
                <optgroup label="Conteúdo & Apresentação (Canva/PPT)">
                  <option value="content_blank">✨ Slide em Branco (Canvas Livre)</option>
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

                {/* Jogar sem Apresentador (Modo Autônomo) */}
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 cursor-pointer text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-indigo-300 block">
                      Permitir Jogar Sem Apresentador (Modo Autônomo)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Exibe botões no telão e nos celulares para iniciar partida, sortear palavra/infiltrado e gerenciar votação autonomamente.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSlide.impostorConfig?.standaloneMode ?? true}
                    onChange={(e) => {
                      updateCurrentSlide({
                        impostorConfig: currentSlide.impostorConfig
                          ? { ...currentSlide.impostorConfig, standaloneMode: e.target.checked }
                          : undefined
                      });
                    }}
                    className="w-4 h-4 rounded accent-indigo-500 cursor-pointer shrink-0 ml-2"
                  />
                </label>

                {/* Categoria e Palavra Secreta */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={currentSlide.impostorConfig?.category || 'Personagens Bíblicos'}
                    onChange={(e) => {
                      const catName = e.target.value;
                      const words = getWordsForCategory(catName);
                      updateCurrentSlide({
                        impostorConfig: currentSlide.impostorConfig
                          ? {
                              ...currentSlide.impostorConfig,
                              category: catName,
                              customWordList: words,
                              secretWord: ''
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

            {/* SE FOR O JOGO DE DESENHO (GARTIC & IMAGEM E AÇÃO): CONFIGURAÇÕES DO SLIDE */}
            {currentSlide.type === 'game_drawing_gartic' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <span>🎨</span>
                  <span>Jogo de Desenho: Configurações Deste Slide</span>
                </div>

                {/* Modo de Jogo */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Modo de Jogo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              category: 'Geral & Variados',
                              secretWord: '',
                              selectionMethod: 'random',
                              targetScore: 120,
                              roundTimeSeconds: 80,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            mode: 'digital'
                          }
                        });
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.garticConfig?.mode !== 'in_person'
                          ? 'bg-amber-600 border-amber-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      💬 Gartic Digital
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              category: 'Geral & Variados',
                              secretWord: '',
                              selectionMethod: 'random',
                              targetScore: 120,
                              roundTimeSeconds: 80,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            mode: 'in_person'
                          }
                        });
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.garticConfig?.mode === 'in_person'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🗣️ Imagem & Ação
                    </button>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Categoria de Palavras</label>
                  <select
                    value={currentSlide.garticConfig?.category || 'Geral & Variados'}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const catObj = GARTIC_CATEGORIES.find((c) => c.name === newCat);
                      updateCurrentSlide({
                        garticConfig: {
                          ...(currentSlide.garticConfig || {
                            gameStarted: false,
                            mode: 'digital',
                            selectionMethod: 'random',
                            targetScore: 120,
                            roundTimeSeconds: 80,
                            currentRound: 1,
                            roundState: 'lobby',
                            strokes: [],
                            guessedParticipantIds: [],
                            chatGuesses: [],
                            scores: {}
                          }),
                          category: newCat,
                          customWordList: catObj?.words || [],
                          secretWord: catObj?.words[0] || 'Elefante'
                        }
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    {GARTIC_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name} ({cat.words.length} palavras)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meta de Vitória e Tempo */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Meta de Pontos</label>
                    <select
                      value={currentSlide.garticConfig?.targetScore || 120}
                      onChange={(e) => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              mode: 'digital',
                              category: 'Geral & Variados',
                              secretWord: '',
                              selectionMethod: 'random',
                              roundTimeSeconds: 80,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            targetScore: Number(e.target.value)
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value={60}>60 pontos</option>
                      <option value={120}>120 pontos</option>
                      <option value={180}>180 pontos</option>
                      <option value={240}>240 pontos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Tempo por Desenho</label>
                    <select
                      value={currentSlide.garticConfig?.roundTimeSeconds || 80}
                      onChange={(e) => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              mode: 'digital',
                              category: 'Geral & Variados',
                              secretWord: '',
                              selectionMethod: 'random',
                              targetScore: 120,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            roundTimeSeconds: Number(e.target.value)
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value={45}>45s</option>
                      <option value={60}>60s</option>
                      <option value={80}>80s</option>
                      <option value={100}>100s</option>
                      <option value={120}>120s</option>
                    </select>
                  </div>
                </div>

                {/* Sorteio vs Escolha do Desenhista */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Escolha do Artista</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              mode: 'digital',
                              category: 'Geral & Variados',
                              secretWord: '',
                              targetScore: 120,
                              roundTimeSeconds: 80,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            selectionMethod: 'random'
                          }
                        });
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.garticConfig?.selectionMethod !== 'manual'
                          ? 'bg-amber-600 border-amber-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🎲 Randômico
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSlide({
                          garticConfig: {
                            ...(currentSlide.garticConfig || {
                              gameStarted: false,
                              mode: 'digital',
                              category: 'Geral & Variados',
                              secretWord: '',
                              targetScore: 120,
                              roundTimeSeconds: 80,
                              currentRound: 1,
                              roundState: 'lobby',
                              strokes: [],
                              guessedParticipantIds: [],
                              chatGuesses: [],
                              scores: {}
                            }),
                            selectionMethod: 'manual'
                          }
                        });
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                        currentSlide.garticConfig?.selectionMethod === 'manual'
                          ? 'bg-amber-600 border-amber-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 Escolha Manual
                    </button>
                  </div>
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

              {/* Senha dos Participantes (Opcional) */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Senha de Acesso para Participantes</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempRequireRoomPassword}
                      onChange={(e) => {
                        setTempRequireRoomPassword(e.target.checked);
                        if (!e.target.checked) setTempRoomPassword('');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {tempRequireRoomPassword ? (
                  <div className="space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type={showParticipantPassword ? 'text' : 'password'}
                        value={tempRoomPassword}
                        onChange={(e) => setTempRoomPassword(e.target.value)}
                        placeholder="Ex: festa2026"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-indigo-500/50 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParticipantPassword(!showParticipantPassword)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        {showParticipantPassword ? 'Ocultar' : 'Exibir'}
                      </button>
                    </div>
                    <span className="text-[10px] text-amber-400/90 block font-medium">
                      ⚠️ A senha de participantes deve ser diferente da senha do Admin/Apresentador.
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 block">
                    Desativada: Qualquer usuário que digitar o PIN pode entrar diretamente na sala.
                  </span>
                )}
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

            {/* Bloco: Reiniciar / Resetar Apresentação */}
            {onResetPresentation && (
              <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-800/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Resetar Apresentação & Zerar Sessão Atual</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Zera todos os participantes conectados, placares dos times e participantes, rodadas e sorteios do Infiltrado, estatísticas de respostas acumuladas, permitindo iniciar uma nova sessão ou gincana limpa do zero.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resetar Apresentação Completa</span>
                  </button>
                </div>
              </div>
            )}

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
                Gerenciador de Apresentações
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Salas & Apresentações Salvas
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Acesse suas apresentações sincronizadas na nuvem Google ou guardadas na memória local.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={isSavingCloud}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>Salvar Atual na Nuvem</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreatingRoomModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Nova Sala</span>
              </button>
            </div>
          </div>

          {/* Abas de Origem: Nuvem vs Local */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <button
              type="button"
              onClick={() => setSavedSourceTab('cloud')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                savedSourceTab === 'cloud'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Nuvem Google ({savedPresentations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSavedSourceTab('local')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                savedSourceTab === 'local'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Memória Local ({savedRooms.length})</span>
            </button>
          </div>

          {/* TAB NUVEM GOOGLE */}
          {savedSourceTab === 'cloud' && (
            <div className="space-y-4">
              {!user ? (
                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                    <Cloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Faça login para ver sua Biblioteca na Nuvem</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Conecte sua conta Google para salvar apresentações de forma segura e acessá-las em qualquer computador, celular ou projetor.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-xl flex items-center gap-2 mx-auto cursor-pointer transition-all active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar com Google</span>
                  </button>
                </div>
              ) : savedPresentations.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-300">Você ainda não tem apresentações salvas na Nuvem.</p>
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isSavingCloud}
                    className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Salvar Apresentação Atual na Nuvem</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPresentations.map((pres) => (
                    <div
                      key={pres.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-wider border border-sky-500/30 flex items-center gap-1">
                            <Cloud className="w-3 h-3" /> Nuvem
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-white">{pres.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>📑 {pres.slides?.length || 0} slides</span>
                          <span>•</span>
                          <span>📅 {new Date(pres.updatedAt || pres.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePresentationId(pres.id);
                            setTempRoomTitle(pres.title);
                            if (onLoadPresentation) {
                              onLoadPresentation(pres);
                            } else {
                              onUpdateSlides(pres.slides);
                              onSelectSlide(0);
                            }
                            showToast(`✓ Apresentação "${pres.title}" carregada no Editor!`);
                          }}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Carregar no Editor</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Excluir a apresentação "${pres.title}" da nuvem?`)) {
                              await removePresentationFromCloud(pres.id);
                              showToast('Apresentação excluída da nuvem.');
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                          title="Excluir da Nuvem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB MEMÓRIA LOCAL */}
          {savedSourceTab === 'local' && (
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
          )}
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
              {newRoomError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{newRoomError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Título da Sala:
                </label>
                <input
                  type="text"
                  required
                  value={newRoomTitle}
                  onChange={(e) => {
                    setNewRoomTitle(e.target.value);
                    if (newRoomError) setNewRoomError('');
                  }}
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
                    onChange={(e) => {
                      setNewRoomPin(e.target.value);
                      if (newRoomError) setNewRoomError('');
                    }}
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
                    onChange={(e) => {
                      setNewRoomPass(e.target.value);
                      if (newRoomError) setNewRoomError('');
                    }}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Senha dos participantes para a nova sala */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={newRoomRequireParticipantPass}
                    onChange={(e) => {
                      setNewRoomRequireParticipantPass(e.target.checked);
                      if (newRoomError) setNewRoomError('');
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
                  />
                  <span className="text-xs font-bold text-indigo-300">
                    Proteger entrada de participantes com senha
                  </span>
                </label>

                {newRoomRequireParticipantPass && (
                  <div className="space-y-1 animate-in fade-in">
                    <input
                      type="text"
                      value={newRoomParticipantPass}
                      onChange={(e) => {
                        setNewRoomParticipantPass(e.target.value);
                        if (newRoomError) setNewRoomError('');
                      }}
                      placeholder="Senha dos participantes (ex: jogo123)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-indigo-500/50 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-[10px] text-amber-400/90 block">
                      Deve ser diferente da senha do Admin ({newRoomPass || '1234'}).
                    </span>
                  </div>
                )}
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

      {/* MODAL: CONFIRMAR RESET DA APRESENTAÇÃO */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 bg-rose-950/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Resetar Apresentação?
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  Esta ação limpará a sessão atual
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Ao confirmar o reset, todos os seguintes dados serão reiniciados:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 pl-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Desconectar e remover participantes ativos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Zerar o placar de todos os times e jogadores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Resetar sorteios, rodadas e votos do Infiltrado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Apagar respostas e estatísticas acumuladas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Retornar a apresentação para o primeiro slide</span>
                </li>
              </ul>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetConfirmOpen(false);
                    onResetPresentation?.();
                    showToast('✓ Apresentação resetada com sucesso!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-950/50 cursor-pointer transition-all active:scale-95"
                >
                  Sim, Resetar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
