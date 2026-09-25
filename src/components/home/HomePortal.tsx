import React, { useState, useEffect } from 'react';
import { ROOM_TEMPLATES } from '../../data/templates';
import { Slide, SavedPresentation } from '../../types';
import { storageService, SavedRoom } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { UserAuthBar } from '../common/UserAuthBar';
import { CloudLibraryModal } from '../common/CloudLibraryModal';
import { ResumePresentationModal } from '../common/ResumePresentationModal';
import { SavedPresentationSession } from '../../services/storage';
import {
  Gamepad2,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Tv,
  Smartphone,
  Check,
  Copy,
  Trash2,
  Layers,
  Calendar,
  ExternalLink,
  Sliders,
  FolderHeart,
  Cloud,
  Play,
  Edit3,
  Plus,
  Zap,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomePortalProps {
  currentRoomCode: string;
  onJoinAsParticipant: (pin: string) => void;
  onCreateRoom: (data: {
    roomCode: string;
    roomTitle: string;
    adminPassword: string;
    roomPassword?: string;
    slides: Slide[];
  }) => void;
  onOpenAdminLogin: (roomCode?: string) => void;
  onProjectRoom: (roomCode: string) => void;
  onLoadPresentation?: (pres: SavedPresentation) => void;
  onCreateBlankPresentation?: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  currentRoomCode,
  onJoinAsParticipant,
  onCreateRoom,
  onOpenAdminLogin,
  onProjectRoom,
  onLoadPresentation,
  onCreateBlankPresentation
}) => {
  const { user, savedPresentations, savedCloudRooms, loginWithGoogle, removePresentationFromCloud, savePresentationToCloud } = useAuth();
  const [activeTab, setActiveTab] = useState<'options' | 'create'>('options');
  const [librarySectionTab, setLibrarySectionTab] = useState<'cloud_pres' | 'saved_rooms'>('cloud_pres');
  const [pinInput, setPinInput] = useState(currentRoomCode || '');
  const [pinError, setPinError] = useState('');
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [deleteConfirmPin, setDeleteConfirmPin] = useState<string | null>(null);
  const [deleteConfirmPresId, setDeleteConfirmPresId] = useState<string | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [pendingResume, setPendingResume] = useState<{
    pres: SavedPresentation;
    pin: string;
    existingRoom?: SavedRoom;
    session: SavedPresentationSession;
  } | null>(null);

  // Formulário de Criação de Sala
  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [newRoomCode, setNewRoomCode] = useState(() => storageService.generateUniqueRoomCode ? storageService.generateUniqueRoomCode() : generateRandomPin());
  const [roomTitle, setRoomTitle] = useState('Gincana & Slides Interativos');
  const [adminPassword, setAdminPassword] = useState('1234');
  const [confirmPassword, setConfirmPassword] = useState('1234');
  const [roomPassword, setRoomPassword] = useState('');
  const [requireRoomPassword, setRequireRoomPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('full_show');
  const [createError, setCreateError] = useState('');

  // Carrega lista de salas salvas locais
  const refreshSavedRooms = () => {
    try {
      const rooms = storageService.getSavedRooms();
      setSavedRooms(rooms);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshSavedRooms();
  }, []);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setPinError('Digite o código PIN da sala.');
      return;
    }
    setPinError('');
    onJoinAsParticipant(cleanPin);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const cleanPin = newRoomCode.trim().toUpperCase();
    const cleanTitle = roomTitle.trim();

    if (!cleanPin || cleanPin.length < 4) {
      setCreateError('O PIN da sala deve ter pelo menos 4 caracteres.');
      return;
    }

    if (!cleanTitle) {
      setCreateError('Por favor, informe um nome para a sala.');
      return;
    }

    if (storageService.isRoomCodeTaken && storageService.isRoomCodeTaken(cleanPin)) {
      setCreateError(`O código PIN "${cleanPin}" já está em uso por outra sala. Clique em "Gerar Novo PIN".`);
      return;
    }

    if (storageService.isRoomTitleTaken && storageService.isRoomTitleTaken(cleanTitle)) {
      setCreateError(`Já existe uma sala com o nome "${cleanTitle}". Escolha um nome exclusivo para sua sala.`);
      return;
    }

    if (!adminPassword || adminPassword.length < 3) {
      setCreateError('A senha de administrador deve ter pelo menos 3 caracteres.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setCreateError('As senhas de administrador não coincidem.');
      return;
    }

    if (requireRoomPassword) {
      if (!roomPassword.trim()) {
        setCreateError('Por favor, informe a senha da sala para os participantes ou desative a proteção por senha.');
        return;
      }
      if (roomPassword.trim() === adminPassword.trim()) {
        setCreateError('A senha da sala para participantes deve ser DIFERENTE da senha de administrador por segurança.');
        return;
      }
    }

    const template = ROOM_TEMPLATES.find((t) => t.id === selectedTemplateId) || ROOM_TEMPLATES[0];

    onCreateRoom({
      roomCode: cleanPin,
      roomTitle: cleanTitle,
      adminPassword,
      roomPassword: requireRoomPassword && roomPassword.trim() ? roomPassword.trim() : undefined,
      slides: template.slides
    });
  };

  const handleCopyPin = (pin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const handleDeleteRoom = (pin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteRoom(pin);
    setDeleteConfirmPin(null);
    refreshSavedRooms();
  };

  const handleDeleteCloudPres = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removePresentationFromCloud(id);
    setDeleteConfirmPresId(null);
  };

  const handleDuplicateRoom = (pin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.duplicateRoom(pin);
    refreshSavedRooms();
  };

  const handleDuplicateCloudPres = async (pres: SavedPresentation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await savePresentationToCloud(
        `${pres.title} (Cópia)`,
        pres.slides || [],
        pres.theme || 'modern-dark'
      );
    } catch (err) {
      console.error('Erro ao duplicar:', err);
    }
  };

  const formatDate = (dateVal: number | string) => {
    if (!dateVal) return '';
    try {
      const d = typeof dateVal === 'number' ? new Date(dateVal) : new Date(dateVal);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const startRoomWithPresentation = (pres: SavedPresentation, pin: string, existingRoom?: SavedRoom) => {
    onCreateRoom({
      roomCode: pin,
      roomTitle: pres.title,
      adminPassword: existingRoom?.presenterPassword || '1234',
      slides: pres.slides || []
    });
  };

  const handleHostCloudPres = (pres: SavedPresentation) => {
    const existingRoom = savedRooms.find((r) => r.roomTitle === pres.title);
    const pin = existingRoom ? existingRoom.roomCode : generateRandomPin();

    if (storageService.hasPreviousSession(pin)) {
      const session = storageService.getSavedSession(pin);
      if (session && session.hasSessionData) {
        setPendingResume({
          pres,
          pin,
          existingRoom,
          session
        });
        return;
      }
    }

    startRoomWithPresentation(pres, pin, existingRoom);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shadow-lg">
            ✨
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white font-display block">
              ApresentaLive
            </span>
            <span className="text-[11px] text-slate-400 block -mt-1 font-medium">
              Slides Interativos, Quizes & O Infiltrado ao Vivo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User Auth Bar (Google Login / Cloud Sync / Profile) */}
          <UserAuthBar
            onOpenLibrary={() => setIsLibraryModalOpen(true)}
          />

          <button
            onClick={() => onOpenAdminLogin()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow"
            title="Fazer login como administrador de uma sala já criada"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Login do Apresentador</span>
            <span className="sm:hidden">Login Sala</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 z-10 space-y-10">
        {activeTab === 'options' ? (
          <div className="space-y-10">
            {/* Hero Heading */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Plataforma em Tempo Real com Sincronização na Nuvem</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                O que você deseja fazer?
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Entre como jogador pelo celular para interagir ao vivo ou crie sua sala protegida para comandar a apresentação e projetar no telão.
              </p>
            </div>

            {/* Login Prompt Banner if not logged in */}
            {!user && (
              <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Salve suas Apresentações e Salas na Nuvem
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Conecte sua conta Google para salvar seus slides, jogos e salas personalizadas e acessá-los de qualquer dispositivo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => loginWithGoogle()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Google</span>
                </button>
              </div>
            )}

            {/* Two Primary Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Option 1: Jogar / Entrar em uma Sala */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border-2 border-indigo-500/30 hover:border-indigo-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-3xl text-indigo-400 shadow-lg">
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      Convidado / Jogador
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Jogar / Entrar em uma Sala
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      Conecte-se com seu celular. Participe dos quizes com bônus de velocidade, vote nas enquetes e jogue O Infiltrado!
                    </p>
                  </div>

                  {/* Form de PIN rápido */}
                  <form onSubmit={handleQuickJoin} className="pt-2 space-y-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                        Código PIN da Sala
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 749201"
                        maxLength={10}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError('');
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-xl tracking-widest uppercase focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 shadow-inner"
                      />
                      {pinError && (
                        <p className="text-xs text-rose-400 mt-1 font-semibold">{pinError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Entrar na Sala & Jogar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Option 2: Criar uma Nova Sala (Apresentador) */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border-2 border-rose-500/30 hover:border-rose-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-3xl text-rose-400 shadow-lg">
                    <Tv className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-rose-400">
                      Apresentador / Mestre do Jogo
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Criar Sala (Apresentador)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      Defina sua senha de administrador, crie e edite seus slides interativos, defina listas de palavras e comande o telão com total segurança.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <Shield className="w-4 h-4" />
                      <span>Protegido por Senha & Nuvem</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Nenhum participante poderá ver as respostas, palavras secretas ou telão de controle sem a senha que você definir.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-sm shadow-xl hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Criar Sala & Definir Senha</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SEÇÃO DE APRESENTAÇÕES & SALAS SALVAS */}
            <div className="max-w-5xl mx-auto space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <FolderHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Suas Apresentações & Salas</span>
                      {user && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                          Nuvem Google Conectada
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Abra no editor, inicie uma sala ao vivo ou projete em 2ª tela
                    </p>
                  </div>
                </div>

                {/* Tabs Selector: Apresentações na Nuvem vs Salas Salvas */}
                <div className="flex items-center gap-2">
                  {user && (
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setLibrarySectionTab('cloud_pres')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          librarySectionTab === 'cloud_pres'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Apresentações ({savedPresentations.length})</span>
                      </button>

                      <button
                        onClick={() => setLibrarySectionTab('saved_rooms')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          librarySectionTab === 'saved_rooms'
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Salas ({savedRooms.length})</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Nova Sala</span>
                  </button>
                </div>
              </div>

              {/* LISTAGEM DE APRESENTAÇÕES NA NUVEM OU SALAS */}
              {user && librarySectionTab === 'cloud_pres' ? (
                /* Apresentações na Nuvem */
                savedPresentations.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <FolderHeart className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      Você ainda não tem apresentações salvas na nuvem.
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Crie uma nova sala para montar seus slides ou salve o modelo padrão na sua conta.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar Nova Apresentação</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPresentations.map((pres) => {
                      const isDeleting = deleteConfirmPresId === pres.id;
                      return (
                        <div
                          key={pres.id}
                          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4 group relative"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {pres.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-semibold shrink-0">
                                Nuvem
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-sky-400" />
                                {pres.slides?.length || 0} slides
                              </span>
                              {pres.updatedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  {formatDate(pres.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Abrir no Editor */}
                              {onLoadPresentation && (
                                <button
                                  onClick={() => onLoadPresentation(pres)}
                                  className="py-2 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                  title="Abrir no editor de slides"
                                >
                                  <Edit3 className="w-3 h-3 text-indigo-400" />
                                  <span>Editar</span>
                                </button>
                              )}

                              {/* Iniciar Sala com esta Apresentação */}
                              <button
                                onClick={() => handleHostCloudPres(pres)}
                                className="py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                title="Criar sala ao vivo com esta apresentação"
                              >
                                <Play className="w-3 h-3 text-emerald-400" />
                                <span>Apresentar</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                              <button
                                onClick={(e) => handleDuplicateCloudPres(pres, e)}
                                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Duplicar</span>
                              </button>

                              {isDeleting ? (
                                <div className="flex items-center gap-1 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-700">
                                  <span className="text-[10px] text-rose-300">Excluir?</span>
                                  <button
                                    onClick={(e) => handleDeleteCloudPres(pres.id, e)}
                                    className="text-rose-400 font-bold hover:text-rose-200 cursor-pointer px-1"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmPresId(null);
                                    }}
                                    className="text-slate-400 hover:text-white cursor-pointer px-1"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmPresId(pres.id);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 cursor-pointer p-1 rounded hover:bg-slate-800 transition-colors"
                                  title="Excluir da Nuvem"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Salas Salvas (Locais / Dispositivo) */
                savedRooms.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <FolderHeart className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-400">Nenhuma sala personalizada salva ainda.</p>
                    <button
                      onClick={() => {
                        storageService.initDefaultRooms();
                        refreshSavedRooms();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold border border-indigo-500/40 cursor-pointer"
                    >
                      Restaurar Sala Padrão de Exemplo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedRooms.map((room) => {
                      const isDeleting = deleteConfirmPin === room.roomCode;
                      return (
                        <div
                          key={room.id || room.roomCode}
                          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4 group relative"
                        >
                          {/* Header do Card da Sala */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {room.roomTitle || 'Apresentação'}
                              </h3>
                              <button
                                onClick={(e) => handleCopyPin(room.roomCode, e)}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-indigo-500 font-mono text-xs text-indigo-400 font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                                title="Copiar Código PIN"
                              >
                                <span>PIN: {room.roomCode}</span>
                                {copiedPin === room.roomCode ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                            </div>

                            {/* Metadados: Slides e Data */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-sky-400" />
                                {room.slides?.length || 0} slides
                              </span>
                              {room.updatedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  {formatDate(room.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Ações Rápidas: Apresentar, Projetar em 2ª Tela, Jogar */}
                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Botão: Abrir como Apresentador */}
                              <button
                                onClick={() => onOpenAdminLogin(room.roomCode)}
                                className="py-2 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                title="Acessar console de apresentador com senha"
                              >
                                <Lock className="w-3 h-3 text-indigo-400" />
                                <span>Apresentar</span>
                              </button>

                              {/* Botão: Projetar em 2ª Tela */}
                              <button
                                onClick={() => onProjectRoom(room.roomCode)}
                                className="py-2 px-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                title="Abrir o Telão da Apresentação em uma janela separada para projetar"
                              >
                                <Tv className="w-3 h-3 text-sky-400" />
                                <span>Projetar (2ª Tela)</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                              {/* Jogar como Convidado */}
                              <button
                                onClick={() => onJoinAsParticipant(room.roomCode)}
                                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                <Gamepad2 className="w-3 h-3 text-indigo-400" />
                                <span>Jogar no Celular</span>
                              </button>

                              <div className="flex items-center gap-2">
                                {/* Duplicar */}
                                <button
                                  onClick={(e) => handleDuplicateRoom(room.roomCode, e)}
                                  className="text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800"
                                  title="Duplicar Sala"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Excluir com confirmação */}
                                {isDeleting ? (
                                  <div className="flex items-center gap-1 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-700">
                                    <span className="text-[10px] text-rose-300">Excluir?</span>
                                    <button
                                      onClick={(e) => handleDeleteRoom(room.roomCode, e)}
                                      className="text-rose-400 font-bold hover:text-rose-200 cursor-pointer px-1"
                                    >
                                      Sim
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmPin(null);
                                      }}
                                      className="text-slate-400 hover:text-white cursor-pointer px-1"
                                    >
                                      Não
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmPin(room.roomCode);
                                    }}
                                    className="text-slate-500 hover:text-rose-400 cursor-pointer p-1 rounded hover:bg-slate-800 transition-colors"
                                    title="Excluir Sala"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Create Room Form Screen */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold text-rose-400">
                  Nova Apresentação
                </span>
                <h2 className="text-2xl font-black text-white">Criar Sala de Apresentador</h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('options')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Nome da Sala / Evento */}
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-1.5">
                  Nome da Sala / Evento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gincana de Sexta, Quiz Bíblico..."
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PIN da Sala */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    Código PIN da Sala (Para os Jogadores Conectarem)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewRoomCode(generateRandomPin())}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gerar Novo PIN</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newRoomCode}
                  onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Senha do Administrador */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Definir Senha de Administrador (Obrigatória)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Esta senha será necessária para acessar o telão, abrir o editor de slides e gerenciar os jogos. Guarde-a com você!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sua Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Mínimo 3 caracteres"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 pr-9 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Senha dos Participantes (Opcional - Proteção contra intrusos) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha de Acesso para Participantes (Opcional)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireRoomPassword}
                      onChange={(e) => setRequireRoomPassword(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-400">
                  {requireRoomPassword
                    ? 'Exige uma senha simples para os participantes entrarem no celular (evita invasores ou participantes indesejados).'
                    : 'Desativado: Qualquer participante com o código PIN poderá entrar livremente.'}
                </p>

                {requireRoomPassword && (
                  <div className="pt-1">
                    <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                      Definir Senha da Sala para os Jogadores (Diferente da Senha de ADM)
                    </label>
                    <input
                      type="text"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="Ex: festa2026 ou 7788"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-2">
                  Escolha o Modelo Inicial de Slides
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROOM_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedTemplateId === tmpl.id
                          ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{tmpl.badge}</span>
                        {selectedTemplateId === tmpl.id && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-white">{tmpl.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
                  {createError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Sala & Abrir Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      {/* Cloud Library Modal */}
      <CloudLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        onLoadPresentation={(pres) => {
          if (onLoadPresentation) onLoadPresentation(pres);
        }}
        onHostPresentation={(pres) => {
          handleHostCloudPres(pres);
        }}
        onOpenRoomConsole={(code) => {
          onOpenAdminLogin(code);
        }}
        onProjectRoom={(code) => {
          onProjectRoom(code);
        }}
        onCreateNewPresentation={() => {
          if (onCreateBlankPresentation) onCreateBlankPresentation();
        }}
      />

      <ResumePresentationModal
        isOpen={Boolean(pendingResume)}
        roomCode={pendingResume?.pin || ''}
        presentationTitle={pendingResume?.pres.title || ''}
        session={pendingResume?.session || null}
        onResume={() => {
          if (pendingResume) {
            startRoomWithPresentation(pendingResume.pres, pendingResume.pin, pendingResume.existingRoom);
            setPendingResume(null);
          }
        }}
        onStartNew={() => {
          if (pendingResume) {
            storageService.clearSavedSession(pendingResume.pin);
            startRoomWithPresentation(pendingResume.pres, pendingResume.pin, pendingResume.existingRoom);
            setPendingResume(null);
          }
        }}
        onCancel={() => setPendingResume(null)}
      />

      {/* Bottom Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 z-10">
        <div>ApresentaLive • Plataforma Interativa em Tempo Real</div>
        <div>Sincronização em Nuvem (Google Firestore) & Telões</div>
      </footer>
    </div>
  );
};
