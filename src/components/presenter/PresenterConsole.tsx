import React, { useState, useEffect } from 'react';
import {
  Slide,
  Participant,
  Team,
  ImpostorConfig,
  GarticConfig,
  GarticStroke,
  ImagePinSubmission,
  TermSubmission
} from '../../types';
import { PRESET_WORD_CATEGORIES } from '../../data/presetWords';
import { GARTIC_CATEGORIES } from '../../data/garticPresets';
import { AgentSelectorModal } from '../slides/AgentSelectorModal';
import { PresentationPlayer } from './PresentationPlayer';
import { DrawingViewer } from '../common/DrawingViewer';
import { useAuth } from '../../context/AuthContext';
import { UserAuthBar } from '../common/UserAuthBar';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Users,
  Vote,
  Sparkles,
  Shuffle,
  RefreshCw,
  Search,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Tv,
  ExternalLink,
  Cloud,
  Gamepad2,
  Crown,
  Check,
  AlertCircle,
  Paintbrush,
  CheckCircle2,
  Flame,
  ArrowRight
} from 'lucide-react';

interface PresenterConsoleProps {
  slides: Slide[];
  currentSlideIndex: number;
  roomCode: string;
  participants: Participant[];
  teams: Team[];
  teamMode: string;
  showAnswers: boolean;
  timerActive: boolean;
  timerRemaining: number | null;
  answersSubmitted: Record<string, any>;
  imagePins: ImagePinSubmission[];
  termSubmissions: TermSubmission[];
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onToggleShowAnswers: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddSimulatedParticipants: () => void;
  onStartImpostorGame?: () => void;
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartImpostorVoting: () => void;
  onRevealImpostor: () => void;
  onResetImpostorGame: () => void;
  onAdvanceToNextRound?: (changeWord?: boolean) => void;
  onStartNewMatch?: () => void;
  onClearImpostorSelection?: () => void;
  onOpenPresentationScreen: () => void;
  onOpenSettingsScreen: () => void;
  onOpenProjectorWindow?: () => void;
  onPresenterSubmitAnswer?: (answer: any) => void;
  onPresenterImpostorVote?: (suspectId: string) => void;
  onKickParticipant?: (participantId: string) => void;
  onBanParticipant?: (participantId: string) => void;
  isPresenterPlaying?: boolean;
  onTogglePresenterPlaying?: (playing: boolean) => void;
  presenterPlayerName?: string;
  onChangePresenterPlayerName?: (name: string) => void;
  presenterPlayerAvatar?: string;
  onChangePresenterPlayerAvatar?: (avatar: string) => void;
  coPresentersCount?: number;
  onStartGarticGame?: () => void;
  onUpdateGarticConfig?: (config: Partial<GarticConfig>) => void;
  onAdvanceGarticNextRound?: () => void;
  onResetGarticGame?: () => void;
  onGarticInPersonCorrect?: (participantId?: string) => void;
  onGarticInPersonSkip?: () => void;
}

export const PresenterConsole: React.FC<PresenterConsoleProps> = ({
  slides,
  currentSlideIndex,
  roomCode,
  participants,
  teams,
  teamMode,
  showAnswers,
  timerActive,
  timerRemaining,
  answersSubmitted,
  imagePins,
  termSubmissions,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onToggleShowAnswers,
  onToggleTimer,
  onResetTimer,
  onAddSimulatedParticipants,
  onStartImpostorGame,
  onUpdateImpostorConfig,
  onStartImpostorVoting,
  onRevealImpostor,
  onResetImpostorGame,
  onAdvanceToNextRound,
  onStartNewMatch,
  onClearImpostorSelection,
  onOpenPresentationScreen,
  onOpenSettingsScreen,
  onOpenProjectorWindow,
  onPresenterSubmitAnswer,
  onPresenterImpostorVote,
  onKickParticipant,
  onBanParticipant,
  isPresenterPlaying: isPresenterPlayingProp,
  onTogglePresenterPlaying,
  presenterPlayerName = 'Apresentador',
  onChangePresenterPlayerName,
  presenterPlayerAvatar = '👑',
  onChangePresenterPlayerAvatar,
  coPresentersCount = 1,
  onStartGarticGame,
  onUpdateGarticConfig,
  onAdvanceGarticNextRound,
  onResetGarticGame,
  onGarticInPersonCorrect,
  onGarticInPersonSkip
}) => {
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const { user, savePresentationToCloud, loginWithGoogle } = useAuth();
  const [hideSecrets, setHideSecrets] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [cloudFeedback, setCloudFeedback] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [changeWordOnNextRound, setChangeWordOnNextRound] = useState(true);
  const [showLiveScreen, setShowLiveScreen] = useState(true);
  const [isPresentationPreviewExpanded, setIsPresentationPreviewExpanded] = useState(false);
  const [manualWordInput, setManualWordInput] = useState('');
  const [showManualWordField, setShowManualWordField] = useState(false);
  const [startGameNotice, setStartGameNotice] = useState<string | null>(null);

  // Modo Apresentador Também Joga (Local & Persistido)
  const [isPresenterPlayingLocal, setIsPresenterPlayingLocal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('apresentalive_presenter_playing') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const isPresenterPlaying = isPresenterPlayingProp !== undefined ? isPresenterPlayingProp : isPresenterPlayingLocal;

  const handleTogglePresenterPlayingMode = () => {
    const next = !isPresenterPlaying;
    setIsPresenterPlayingLocal(next);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_presenter_playing', String(next));
      } catch {
        // ignore
      }
    }
    if (onTogglePresenterPlaying) {
      onTogglePresenterPlaying(next);
    }
  };

  // Estado para o apresentador espiar como admin temporariamente caso precise
  const [adminOverridePeek, setAdminOverridePeek] = useState(false);

  // Revelação do papel confidencial individual do apresentador (sem ver os outros)
  const [isPresenterRoleRevealed, setIsPresenterRoleRevealed] = useState(false);

  // Resposta local do apresentador no quiz/pergunta
  const [localQuizSelectedOption, setLocalQuizSelectedOption] = useState<string | null>(null);
  const [localTextAnswer, setLocalTextAnswer] = useState('');

  // Identificador do apresentador como participante
  const presenterParticipantId = `presenter-player-${roomCode}`;
  const presenterParticipant = participants.find(
    (p) => p.id === presenterParticipantId || p.name.trim().toLowerCase() === presenterPlayerName.trim().toLowerCase()
  );

  // Reset local ao trocar de slide
  useEffect(() => {
    setLocalQuizSelectedOption(null);
    setLocalTextAnswer('');
    setIsPresenterRoleRevealed(false);
    setAdminOverridePeek(false);
  }, [currentSlideIndex]);

  const handleSaveToCloud = async () => {
    if (!user) {
      const confirmLogin = window.confirm('Faça login com sua conta Google para salvar sua apresentação na nuvem. Continuar?');
      if (confirmLogin) {
        await loginWithGoogle();
      }
      return;
    }

    try {
      setIsSavingCloud(true);
      await savePresentationToCloud(`Apresentação - Sala ${roomCode}`, slides);
      setCloudFeedback('✓ Salvo na Nuvem!');
      setTimeout(() => setCloudFeedback(null), 3500);
    } catch (err: any) {
      setCloudFeedback('⚠️ Erro ao salvar');
      setTimeout(() => setCloudFeedback(null), 3500);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const impostorConfig = currentSlide.impostorConfig || {
    mode: 'classic',
    category: currentSlide.categoryName || 'Personagens Bíblicos',
    secretWord: '',
    numAgents: 4,
    numImpostors: 1,
    selectionMethod: 'random',
    revealWordToInvestigators: false,
    impostorParticipantIds: [],
    agentParticipantIds: [],
    roundsTotal: 3,
    currentRound: 1,
    eliminatedIds: [],
    votingActive: false,
    votes: {},
    revealState: 'hidden',
    votingAudience: 'all'
  };

  const isImpostorSlide = currentSlide.type.startsWith('game_impostor');
  const isInvestigatorMode = impostorConfig.mode === 'investigator';

  // Jogo de Desenho (Gartic & Imagem e Ação)
  const isGarticSlide = currentSlide.type === 'game_drawing_gartic';
  const garticConfig: GarticConfig = currentSlide.garticConfig || {
    gameStarted: false,
    mode: 'digital',
    category: 'Geral & Variados',
    secretWord: '',
    wordChoices: [],
    selectionMethod: 'random',
    targetScore: 120,
    roundTimeSeconds: 80,
    currentRound: 1,
    roundState: 'lobby',
    strokes: [],
    guessedParticipantIds: [],
    chatGuesses: [],
    scores: {}
  };

  const garticDrawer = participants.find((p) => p.id === garticConfig.currentDrawerId);
  const garticDrawerName = garticDrawer?.name || garticConfig.currentDrawerName || 'Artista';

  // Sorteio de palavras para escolha do desenhista
  const getGarticWordOptions = (categoryName: string, count: number = 3): string[] => {
    const cat = GARTIC_CATEGORIES.find((c) => c.name === categoryName) || GARTIC_CATEGORIES[0];
    const customList = garticConfig.customWordList;
    const pool = customList && customList.length > 0 ? customList : cat.words;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const handleStartGartic = () => {
    if (onStartGarticGame) {
      onStartGarticGame();
      return;
    }

    let currentParts = [...participants];
    if (currentParts.length === 0 && onAddSimulatedParticipants) {
      onAddSimulatedParticipants();
      return;
    }

    const drawerId = garticConfig.currentDrawerId || (currentParts.length > 0 ? currentParts[Math.floor(Math.random() * currentParts.length)].id : undefined);
    const wordOptions = getGarticWordOptions(garticConfig.category || 'Geral & Variados', 3);
    const chosenWord = wordOptions[0] || 'Elefante';

    if (onUpdateGarticConfig) {
      onUpdateGarticConfig({
        gameStarted: true,
        currentDrawerId: drawerId,
        wordChoices: wordOptions,
        secretWord: chosenWord,
        roundState: 'drawing',
        strokes: [],
        guessedParticipantIds: [],
        chatGuesses: [],
        timerRemaining: garticConfig.roundTimeSeconds || 80,
        timerActive: true,
        currentRound: 1
      });
    }
  };

  // Identificar agentes e infiltrados
  const agentParticipants = participants.filter((p) =>
    (impostorConfig.agentParticipantIds || []).includes(p.id)
  );

  const impostorParticipants = participants.filter((p) =>
    (impostorConfig.impostorParticipantIds || []).includes(p.id)
  );

  // Papel do Apresentador nesta rodada de Infiltrado
  const isPresenterImpostor =
    (impostorConfig.impostorParticipantIds || []).includes(presenterParticipantId) ||
    presenterParticipant?.isImpostor === true ||
    (presenterParticipant && (impostorConfig.impostorParticipantIds || []).includes(presenterParticipant.id));

  const isPresenterAgent =
    (impostorConfig.agentParticipantIds || []).includes(presenterParticipantId) ||
    presenterParticipant?.isAgent === true ||
    (presenterParticipant && (impostorConfig.agentParticipantIds || []).includes(presenterParticipant.id));

  const isPresenterInvestigator =
    isInvestigatorMode && !isPresenterAgent && !isPresenterImpostor;

  const hasRolesAssigned =
    (impostorConfig.impostorParticipantIds?.length || 0) > 0 ||
    (impostorConfig.agentParticipantIds?.length || 0) > 0;

  // Voto registrado do apresentador
  const presenterVote = impostorConfig.votes?.[presenterParticipantId] ||
    (presenterParticipant ? impostorConfig.votes?.[presenterParticipant.id] : undefined);

  // Contagem de votos recebidos
  const voteCounts: Record<string, number> = {};
  const totalVotesCast = Object.keys(impostorConfig.votes || {}).length;
  Object.values(impostorConfig.votes || {}).forEach((suspectId) => {
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
  });

  // Toggle revelação da palavra aos investigadores
  const handleToggleRevealWordToInvestigators = () => {
    onUpdateImpostorConfig({
      revealWordToInvestigators: !impostorConfig.revealWordToInvestigators
    });
  };

  // Avançar rodada
  const handleAdvanceRound = () => {
    const nextRound = (impostorConfig.currentRound || 1) + 1;
    if (nextRound > (impostorConfig.roundsTotal || 3)) {
      onStartImpostorVoting();
    } else {
      if (onAdvanceToNextRound) {
        onAdvanceToNextRound(changeWordOnNextRound);
      } else {
        onUpdateImpostorConfig({
          currentRound: nextRound,
          votes: {},
          votingActive: false,
          revealState: 'words_shown'
        });
      }
    }
  };

  // Sortear nova palavra da categoria
  const handleRandomizeWord = () => {
    const cat = PRESET_WORD_CATEGORIES.find((c) => c.name === impostorConfig.category);
    const wordsPool = impostorConfig.customWordList && impostorConfig.customWordList.length > 0
      ? impostorConfig.customWordList
      : (cat ? cat.words : ['Moisés', 'Davi', 'Salomão']);
    const newWord = wordsPool[Math.floor(Math.random() * wordsPool.length)];
    onUpdateImpostorConfig({ secretWord: newWord });
    setStartGameNotice(null);
  };

  const currentCategoryObj = PRESET_WORD_CATEGORIES.find((c) => c.name === impostorConfig.category) || PRESET_WORD_CATEGORIES[0];
  const categoryWordsList = impostorConfig.customWordList && impostorConfig.customWordList.length > 0
    ? impostorConfig.customWordList
    : (currentCategoryObj?.words || []);

  const handleSelectWordFromList = (word: string) => {
    if (!word) return;
    onUpdateImpostorConfig({ secretWord: word });
    setStartGameNotice(null);
  };

  const handleApplyManualWord = () => {
    if (!manualWordInput.trim()) return;
    onUpdateImpostorConfig({ secretWord: manualWordInput.trim() });
    setManualWordInput('');
    setShowManualWordField(false);
    setStartGameNotice(null);
  };

  const handleStartGame = () => {
    const wordToUse = impostorConfig.secretWord?.trim();
    if (!wordToUse) {
      setStartGameNotice('Por favor, defina a palavra secreta antes de iniciar! Selecione uma da lista, sorteie ou digite manualmente.');
      return;
    }

    // Se ainda não houver papéis definidos, sortear automaticamente entre os participantes
    const hasRoles = (impostorConfig.impostorParticipantIds && impostorConfig.impostorParticipantIds.length > 0);
    if (!hasRoles && participants.length > 0) {
      handleAutoRaffleAgentsAndImpostor();
    }

    setStartGameNotice(null);

    if (onStartImpostorGame) {
      onStartImpostorGame();
    } else {
      onUpdateImpostorConfig({
        gameStarted: true,
        secretWord: wordToUse,
        revealState: 'words_shown',
        votingActive: false,
        votes: {},
        currentRound: 1,
        eliminatedIds: [],
        winner: undefined
      });
    }
  };

  // Sortear agentes e infiltrados automaticamente de forma rápida baseando-se na proporção
  const calculateImpostorsFromProportion = (total: number, preset?: string): number => {
    if (total <= 1) return 1;
    let ratio = 0.25;
    if (preset === '1_per_2') ratio = 0.50;
    else if (preset === '1_per_3') ratio = 0.333;
    else if (preset === '1_per_4') ratio = 0.25;
    else if (preset === '1_per_5') ratio = 0.20;
    else if (preset === '1_per_6') ratio = 0.166;
    const calculated = Math.round(total * ratio);
    return Math.max(1, Math.min(calculated, Math.max(1, total - 1)));
  };

  const handleAutoRaffleAgentsAndImpostor = () => {
    if (participants.length === 0) {
      if (onAddSimulatedParticipants) {
        onAddSimulatedParticipants();
      }
      return;
    }

    if (isInvestigatorMode) {
      const targetAgents = impostorConfig.numAgents || Math.min(4, Math.max(1, participants.length));
      const targetImpostors = impostorConfig.numImpostors || calculateImpostorsFromProportion(
        targetAgents,
        impostorConfig.impostorRatioPreset || '1_per_4'
      );
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const agents = shuffled.slice(0, Math.min(targetAgents, shuffled.length)).map((p) => p.id);
      const shuffledAgents = [...agents].sort(() => 0.5 - Math.random());
      const impostors = shuffledAgents.slice(0, Math.min(targetImpostors, Math.max(1, agents.length - 1)));
      onUpdateImpostorConfig({
        mode: 'investigator',
        numAgents: targetAgents,
        numImpostors: impostors.length,
        agentParticipantIds: agents,
        impostorParticipantIds: impostors
      });
    } else {
      // Modo Clássico: todos os participantes são jogadores (Agentes ou Infiltrados)
      const targetImpostors = calculateImpostorsFromProportion(
        participants.length,
        impostorConfig.impostorRatioPreset || '1_per_4'
      );
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const impostors = shuffled.slice(0, Math.min(targetImpostors, Math.max(1, participants.length - 1))).map((p) => p.id);
      const agents = participants.map((p) => p.id).filter((id) => !impostors.includes(id));
      onUpdateImpostorConfig({
        mode: 'classic',
        numAgents: participants.length,
        numImpostors: impostors.length,
        agentParticipantIds: agents,
        impostorParticipantIds: impostors
      });
    }
  };

  const handleClearSelection = () => {
    if (onClearImpostorSelection) {
      onClearImpostorSelection();
    } else {
      onUpdateImpostorConfig({
        impostorParticipantIds: [],
        agentParticipantIds: [],
        secretWord: '',
        votes: {},
        eliminatedIds: [],
        lastEliminatedId: undefined,
        lastEliminatedWasImpostor: undefined,
        revealState: 'hidden',
        winner: undefined,
        votingActive: false
      });
    }
  };

  // Votar como apresentador jogador
  const handlePresenterVote = (suspectId: string) => {
    if (onPresenterImpostorVote) {
      onPresenterImpostorVote(suspectId);
    } else {
      const currentVotes = { ...(impostorConfig.votes || {}) };
      currentVotes[presenterParticipantId] = suspectId;
      onUpdateImpostorConfig({ votes: currentVotes });
    }
  };

  // Responder quiz como apresentador jogador
  const handleSelectQuizOption = (optId: string) => {
    if (localQuizSelectedOption) return;
    setLocalQuizSelectedOption(optId);
    if (onPresenterSubmitAnswer) {
      onPresenterSubmitAnswer({ selectedOption: optId, timestamp: Date.now() });
    }
  };

  // Suspeitos disponíveis para votação no Infiltrado
  const eliminatedIds = impostorConfig.eliminatedIds || [];
  const candidateIds = new Set([
    ...(impostorConfig.agentParticipantIds || []),
    ...(impostorConfig.impostorParticipantIds || [])
  ]);

  const votingSuspects = participants.filter((p) => {
    if (eliminatedIds.includes(p.id)) return false;
    if (impostorConfig.mode === 'investigator' && candidateIds.size > 0) {
      if (candidateIds.size > 1 && (p.id === presenterParticipantId || (presenterParticipant && p.id === presenterParticipant.id))) return false;
      return candidateIds.has(p.id);
    }
    if (participants.length > 1 && (p.id === presenterParticipantId || (presenterParticipant && p.id === presenterParticipant.id))) return false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header / Status bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white leading-tight">
                Console do Apresentador
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Ao Vivo
              </span>
              {coPresentersCount > 1 && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm" title="Múltiplos apresentadores conectados e sincronizados em tempo real">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>{coPresentersCount} Apresentadores</span>
                </span>
              )}
              {isPresenterPlaying && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Gamepad2 className="w-3 h-3 text-purple-400" />
                  <span>Modo Jogador Ativo</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isPresenterPlaying
                ? 'Modo Sem Spoilers: Os segredos estão ocultos para você jogar junto!'
                : 'Painel de controle confidencial • Somente você tem acesso a estas informações'}
            </p>
          </div>
        </div>

        {/* Quick actions: Modo Jogador, Salvar na Nuvem, Telão, Configurações, Bots */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BOTÃO PRINCIPAL: MODO APRESENTADOR TAMBÉM JOGA */}
          <button
            id="btn-toggle-presenter-playing"
            type="button"
            onClick={handleTogglePresenterPlayingMode}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
              isPresenterPlaying
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 ring-2 ring-purple-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/40 hover:text-white'
            }`}
            title="Ative para ocultar dados sigilosos e jogar junto com a plateia sem spoilers!"
          >
            <Gamepad2 className={`w-4 h-4 ${isPresenterPlaying ? 'text-white animate-pulse' : 'text-purple-400'}`} />
            <span>{isPresenterPlaying ? '🎮 Apresentador Joga (Ativo)' : '🎮 Apresentador Também Joga'}</span>
          </button>

          {/* Botão Salvar na Nuvem */}
          <button
            onClick={handleSaveToCloud}
            disabled={isSavingCloud}
            className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95 disabled:opacity-50"
            title="Salvar apresentação atual na sua conta Google"
          >
            <Cloud className={`w-3.5 h-3.5 text-sky-400 ${isSavingCloud ? 'animate-bounce' : ''}`} />
            <span>{isSavingCloud ? 'Salvando...' : cloudFeedback || 'Salvar na Nuvem'}</span>
          </button>

          {participants.length < 4 && (
            <button
              onClick={onAddSimulatedParticipants}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
              title="Adicionar participantes virtuais para testar dinâmicas sozinho"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+4 Jogadores Teste</span>
            </button>
          )}

          <button
            onClick={onOpenPresentationScreen}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Visualizar Telão de Apresentação nesta mesma aba"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ver Telão</span>
          </button>

          {onOpenProjectorWindow && (
            <button
              onClick={onOpenProjectorWindow}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
              title="Abrir Telão da Apresentação em uma nova janela para projetar na 2ª Tela (Projetor/TV)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Projetar (2ª Tela)</span>
            </button>
          )}

          {/* Botão Gerenciar Participantes */}
          <button
            onClick={() => setIsParticipantsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Ver lista de participantes, remover ou banir da sala"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{participants.length} Participantes</span>
          </button>

          <button
            onClick={onOpenSettingsScreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Abrir Editor de Slides & Configurações da Sala"
          >
            <span>Configurações</span>
          </button>

          <div className="hidden lg:block pl-2 border-l border-slate-800">
            <UserAuthBar />
          </div>
        </div>
      </div>

      {/* BANNER INFORMATIVO QUANDO O MODO APRESENTADOR TAMBÉM JOGA ESTÁ ATIVO */}
      {isPresenterPlaying && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-600/30 text-purple-300">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <span className="text-xs text-purple-200 font-semibold">
              <strong className="text-white font-extrabold">Modo Apresentador Também Joga Ativo:</strong> As identidades do Infiltrado e as respostas corretas foram ocultadas para você se divertir jogando!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminOverridePeek(!adminOverridePeek)}
              className="text-[11px] font-bold text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Espiar como administrador se precisar resolver algum detalhe"
            >
              {adminOverridePeek ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
              <span>{adminOverridePeek ? 'Voltar ao Modo Jogador' : 'Espiar como Admin (Spoiler)'}</span>
            </button>
            <button
              onClick={handleTogglePresenterPlayingMode}
              className="text-[11px] font-bold text-rose-300 hover:text-white px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 cursor-pointer"
            >
              Desativar
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation & Slide Carousel Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold cursor-pointer transition-colors"
              title="Slide Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Slide {currentSlideIndex + 1} de {slides.length}
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {currentSlide.title}
              </h3>
            </div>

            <button
              onClick={onNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold cursor-pointer transition-colors"
              title="Próximo Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide selector selector */}
          <div className="flex items-center gap-2">
            <select
              value={currentSlideIndex}
              onChange={(e) => onGoToSlide(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {slides.map((s, idx) => (
                <option key={s.id} value={idx}>
                  #{idx + 1}: {s.title}
                </option>
              ))}
            </select>

            {/* Timer controls */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-xs font-bold text-slate-300">
                {timerRemaining !== null ? `${timerRemaining}s` : '--'}
              </span>
              <button
                onClick={onToggleTimer}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                title={timerActive ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onResetTimer}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Reiniciar Cronômetro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* TELA DE APRESENTAÇÃO AO VIVO (TELÃO SINCRONIZADO NA TELA DO APRESENTADOR) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tela de Apresentação (Telão ao Vivo)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                    Ao Vivo
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visão exata do que os participantes e o telão estão visualizando
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLiveScreen(!showLiveScreen)}
                className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
              >
                {showLiveScreen ? 'Ocultar Telão' : 'Mostrar Telão'}
              </button>
              {showLiveScreen && (
                <button
                  onClick={() => setIsPresentationPreviewExpanded(!isPresentationPreviewExpanded)}
                  className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
                >
                  {isPresentationPreviewExpanded ? 'Modo Padrão' : 'Expandir Telão'}
                </button>
              )}
              {onOpenProjectorWindow && (
                <button
                  onClick={onOpenProjectorWindow}
                  className="text-xs text-sky-300 hover:text-white px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 cursor-pointer flex items-center gap-1.5 transition-colors font-bold"
                  title="Abrir Telão em uma nova janela para segundo monitor/projetor"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Janela do Telão</span>
                </button>
              )}
            </div>
          </div>

          {showLiveScreen && (
            <div className="w-full flex items-center justify-center">
              <div
                className={`w-full ${
                  isPresentationPreviewExpanded ? 'max-w-6xl' : 'max-w-4xl'
                } aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl relative transition-all duration-300`}
              >
                <PresentationPlayer
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  roomCode={roomCode}
                  appUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : ''}
                  participants={participants}
                  teams={teams}
                  teamMode={teamMode}
                  showAnswers={showAnswers}
                  timerActive={timerActive}
                  timerRemaining={timerRemaining}
                  answersSubmitted={answersSubmitted}
                  imagePins={imagePins}
                  termSubmissions={termSubmissions}
                  reactions={[]}
                  isProjectorOnly={true}
                  isEmbedded={true}
                  onPrevSlide={onPrevSlide}
                  onNextSlide={onNextSlide}
                  onGoToSlide={onGoToSlide}
                  onToggleShowAnswers={onToggleShowAnswers}
                  onToggleTimer={onToggleTimer}
                  onResetTimer={onResetTimer}
                  onOpenTeamManager={() => {}}
                  onAddSimulatedParticipants={onAddSimulatedParticipants}
                  onSwitchToEditor={onOpenSettingsScreen}
                  onStartImpostorGame={onStartImpostorGame}
                  onUpdateImpostorConfig={onUpdateImpostorConfig}
                  onStartImpostorVoting={onStartImpostorVoting}
                  onRevealImpostor={onRevealImpostor}
                  onResetImpostorGame={onResetImpostorGame}
                  onAdvanceToNextRound={onAdvanceToNextRound}
                  onStartNewMatch={onStartNewMatch}
                  onStartGarticGame={onStartGarticGame}
                  onUpdateGarticConfig={onUpdateGarticConfig}
                  onAdvanceGarticNextRound={onAdvanceGarticNextRound}
                  onResetGarticGame={onResetGarticGame}
                  onGarticInPersonCorrect={onGarticInPersonCorrect}
                  onGarticInPersonSkip={onGarticInPersonSkip}
                />
              </div>
            </div>
          )}
        </div>

        {/* JOGO DO INFILTRADO: PAINEL DE CONTROLE (COM SUPORTE A APRESENTADOR JOGA) */}
        {isImpostorSlide && (
          <div className="space-y-6">
            {/* Bloco 1: Informações da Rodada / Card Confidencial do Apresentador */}
            <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-600/30 border-b border-l border-rose-500/40 rounded-bl-2xl text-[10px] uppercase tracking-wider font-extrabold text-rose-300 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>{isPresenterPlaying && !adminOverridePeek ? 'Modo Apresentador Joga (Sem Spoiler)' : 'Painel Sigiloso • Apresentador'}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dados da Partida • O Infiltrado</span>
                  </div>
                  <h4 className="text-xl font-black text-white mt-1">
                    Tema: {impostorConfig.category}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {!isPresenterPlaying && (
                    <button
                      onClick={() => setHideSecrets(!hideSecrets)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      {hideSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{hideSecrets ? 'Mostrar Segredos' : 'Ocultar da Tela'}</span>
                    </button>
                  )}
                  {isPresenterPlaying && !adminOverridePeek && (
                    <button
                      onClick={() => setAdminOverridePeek(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      title="Espiar como Administrador caso precise intervir manualmente no sorteio"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Espiar Segredos</span>
                    </button>
                  )}
                  {isPresenterPlaying && adminOverridePeek && (
                    <button
                      onClick={() => setAdminOverridePeek(false)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Voltar ao Modo Jogador</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SELETOR DE MODO NO CONSOLE DO APRESENTADOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const targetImpostors = calculateImpostorsFromProportion(
                      participants.length,
                      impostorConfig.impostorRatioPreset || '1_per_4'
                    );
                    onUpdateImpostorConfig({
                      mode: 'classic',
                      numAgents: participants.length,
                      numImpostors: targetImpostors
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    !isInvestigatorMode
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow ring-1 ring-rose-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Modo Clássico (Todos Jogam)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Todos os {participants.length} participantes jogam como Agentes ou Infiltrados. Sem investigadores.
                    </p>
                  </div>
                  {!isInvestigatorMode && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold shrink-0 ml-2">
                      Ativo
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetAgents = impostorConfig.numAgents || Math.min(4, Math.max(1, participants.length));
                    const targetImpostors = calculateImpostorsFromProportion(
                      targetAgents,
                      impostorConfig.impostorRatioPreset || '1_per_4'
                    );
                    onUpdateImpostorConfig({
                      mode: 'investigator',
                      numAgents: targetAgents,
                      numImpostors: targetImpostors
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isInvestigatorMode
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Search className="w-3.5 h-3.5" />
                      <span>Modo Investigador (Palco + Plateia)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {impostorConfig.numAgents || 4} Agentes no Palco. Demais participantes são Investigadores na plateia.
                    </p>
                  </div>
                  {isInvestigatorMode && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold shrink-0 ml-2">
                      Ativo
                    </span>
                  )}
                </button>
              </div>

              {/* SE O APRESENTADOR ESTÁ JOGANDO (SEM ADMIN OVERRIDE) -> MOSTRA SEU CARD INDIVIDUAL CONFIDENCIAL */}
              {isPresenterPlaying && !adminOverridePeek ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-950 to-indigo-950/60 border-2 border-purple-500/50 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{presenterPlayerAvatar}</span>
                      <div>
                        <h5 className="text-sm font-black text-white flex items-center gap-1.5">
                          <span>Seu Papel Secreto ({presenterPlayerName})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Apresentador Jogador
                          </span>
                        </h5>
                        <p className="text-[11px] text-purple-300">
                          Clique abaixo para conferir sua identidade sem ver a dos outros participantes.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPresenterRoleRevealed(!isPresenterRoleRevealed)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95 ${
                        isPresenterRoleRevealed
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                      }`}
                    >
                      {isPresenterRoleRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{isPresenterRoleRevealed ? 'Ocultar Meu Papel' : 'Revelar Meu Papel'}</span>
                    </button>
                  </div>

                  {/* Exibição do papel revelado ou oculto */}
                  {!hasRolesAssigned ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="text-3xl animate-bounce">🎲</div>
                      <p className="text-xs text-slate-300 font-medium">
                        Os agentes e infiltrados desta rodada ainda não foram sorteados.
                      </p>
                      <button
                        type="button"
                        onClick={handleAutoRaffleAgentsAndImpostor}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg cursor-pointer inline-flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Sortear Papéis (Incluindo Você)</span>
                      </button>
                    </div>
                  ) : !isPresenterRoleRevealed ? (
                    <div
                      onClick={() => setIsPresenterRoleRevealed(true)}
                      className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-center cursor-pointer hover:border-purple-400 transition-all group"
                    >
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-2 group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h6 className="text-sm font-bold text-white">Toque para ver se você é Infiltrado ou Agente</h6>
                      <p className="text-xs text-purple-300/80 mt-0.5">
                        Mantenha em segredo dos outros jogadores na sala!
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      {isPresenterImpostor ? (
                        <div className="p-5 rounded-2xl bg-rose-950/70 border-2 border-rose-500 text-center space-y-2 shadow-2xl">
                          <span className="text-4xl block animate-bounce">🚨</span>
                          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider inline-block">
                            VOCÊ É O INFILTRADO!
                          </span>
                          <p className="text-xs text-rose-200 font-medium max-w-md mx-auto">
                            Você <strong>NÃO sabe a palavra secreta</strong>! O tema é <strong>{impostorConfig.category}</strong>. Dê pistas vagas e deduza a palavra dos outros sem ser desmascarado!
                          </p>
                        </div>
                      ) : isPresenterAgent ? (
                        <div className="p-5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500 text-center space-y-2 shadow-2xl">
                          <span className="text-4xl block">🛡️</span>
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider inline-block">
                            VOCÊ É UM AGENTE!
                          </span>
                          <div className="text-xs text-emerald-200 font-bold">
                            Tema: <span className="text-white">{impostorConfig.category}</span>
                          </div>
                          <div className="py-2">
                            <span className="text-[11px] font-extrabold uppercase text-slate-300 block">Sua Palavra Secreta:</span>
                            <span className="text-3xl font-black text-emerald-300 font-mono tracking-wider">
                              {impostorConfig.secretWord}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-200/90 font-medium max-w-md mx-auto">
                            Dê pistas inteligentes sobre a palavra sem entregar de bandeja para o infiltrado!
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-sky-950/70 border-2 border-sky-500 text-center space-y-2 shadow-2xl">
                          <span className="text-4xl block">🔍</span>
                          <span className="px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-black uppercase tracking-wider inline-block">
                            VOCÊ É UM INVESTIGADOR!
                          </span>
                          <p className="text-xs text-sky-200 font-medium max-w-md mx-auto">
                            Você está na plateia investigando os agentes no palco para descobrir quem está blefando!
                          </p>
                          {impostorConfig.revealWordToInvestigators && (
                            <div className="pt-2">
                              <span className="text-[11px] font-bold text-slate-300 block">Palavra Revelada aos Investigadores:</span>
                              <span className="text-2xl font-black text-sky-300 font-mono">
                                {impostorConfig.secretWord}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* MODO PADRÃO DE ADMIN OU OVERRIDE (COM VISIBILIDADE DE TODOS OS SEGREDOS) */
                <div className="space-y-4">
                  {/* Aviso de validação se tentar iniciar sem selecionar a palavra */}
                  {startGameNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/70 text-amber-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>{startGameNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStartGameNotice(null)}
                        className="px-2 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-100 text-[10px] uppercase font-black cursor-pointer"
                      >
                        Entendi
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PASSO 1: Palavra Secreta - Seleção da Lista, Sorteio ou Digitação Manual */}
                    <div className={`p-4 rounded-2xl bg-slate-950/80 border space-y-3 transition-all ${
                      !impostorConfig.secretWord
                        ? 'border-amber-500/60 shadow-lg shadow-amber-950/20'
                        : 'border-emerald-500/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
                          <span>Palavra Secreta (Agentes e Civis):</span>
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          impostorConfig.secretWord
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          {impostorConfig.secretWord ? '✓ Palavra Definida' : 'Aguardando Escolha'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className={`text-xl sm:text-2xl font-black font-mono tracking-wide truncate ${
                          impostorConfig.secretWord ? 'text-emerald-400' : 'text-slate-500 italic'
                        }`}>
                          {hideSecrets ? '••••••••' : impostorConfig.secretWord || '(Selecione ou sorteie abaixo)'}
                        </span>
                        <button
                          type="button"
                          onClick={handleRandomizeWord}
                          className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer border border-amber-500/40 transition-colors shrink-0"
                          title="Sortear uma palavra aleatória da lista do tema"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sortear</span>
                        </button>
                      </div>

                      {/* Controles de Escolha da Palavra: Da Lista ou Manual */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {/* Selecionar da Lista */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">
                            Selecionar da Lista ({categoryWordsList.length}):
                          </label>
                          <select
                            value={impostorConfig.secretWord || ''}
                            onChange={(e) => handleSelectWordFromList(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="">-- Escolher palavra --</option>
                            {categoryWordsList.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Digitar Manualmente */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">
                            Ou Digitar Manualmente:
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Ex: Moisés..."
                              value={manualWordInput}
                              onChange={(e) => setManualWordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyManualWord();
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyManualWord}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              Ok
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PASSO 2: Agentes & Infiltrados */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
                            <span>🚨 Infiltrado Sorteado (Não sabe a palavra):</span>
                          </span>
                          <span className="text-xs text-rose-400 font-bold">
                            {impostorParticipants.length} definido{impostorParticipants.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 min-h-[44px]">
                          {impostorParticipants.length > 0 ? (
                            impostorParticipants.map((p) => (
                              <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-900/40 border border-rose-500/40">
                                <span className="text-xl">{p.avatar}</span>
                                <span className="text-sm font-black text-rose-200">
                                  {hideSecrets ? '••••••••' : p.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-amber-300 font-bold">
                              Nenhum papel sorteado ainda nesta rodada.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20">
                        <button
                          type="button"
                          onClick={handleAutoRaffleAgentsAndImpostor}
                          className="flex-1 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                          title="Sortear automaticamente os agentes e infiltrados entre os participantes"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          <span>Sortear Papéis</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAgentModalOpen(true)}
                          className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Definir Agentes</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PASSO 3: Banner / Card de Início do Jogo */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-4 transition-all ${
                    !impostorConfig.gameStarted
                      ? impostorConfig.secretWord
                        ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-emerald-500 shadow-xl shadow-emerald-950/40'
                        : 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">3</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${!impostorConfig.gameStarted ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                        <span className={`text-xs font-black uppercase tracking-wider ${!impostorConfig.gameStarted ? 'text-amber-300' : 'text-emerald-300'}`}>
                          {!impostorConfig.gameStarted ? 'Fase de Preparação (Aguardando Início)' : 'Partida em Andamento'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {!impostorConfig.gameStarted
                          ? impostorConfig.secretWord
                            ? '✓ Palavra pronta! Clique abaixo para iniciar o jogo e liberar as informações nos celulares dos participantes!'
                            : 'Aguardando definição da palavra secreta no Passo 1 para liberar o início da partida.'
                          : 'A palavra e os papéis já foram transmitidos aos participantes. Controle as pistas e a votação abaixo.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!impostorConfig.gameStarted ? (
                        <button
                          type="button"
                          onClick={handleStartGame}
                          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
                            impostorConfig.secretWord
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/60 active:scale-95 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <span>▶ Iniciar Jogo do Infiltrado</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onStartNewMatch) {
                              onStartNewMatch();
                            } else {
                              onResetImpostorGame();
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reiniciar Partida</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Controles de Proporção de Infiltrados & Limite de Rodadas */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Proporção de Infiltrados */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1">
                      Proporção de Infiltrados:
                    </label>
                    <select
                      value={impostorConfig.impostorRatioPreset || '1_per_4'}
                      onChange={(e) => {
                        const preset = e.target.value as any;
                        const numImp = calculateImpostorsFromProportion(
                          isInvestigatorMode ? (impostorConfig.numAgents || 4) : participants.length,
                          preset
                        );
                        let ratio = 0.25;
                        if (preset === '1_per_2') ratio = 0.5;
                        else if (preset === '1_per_3') ratio = 0.333;
                        else if (preset === '1_per_4') ratio = 0.25;
                        else if (preset === '1_per_5') ratio = 0.20;
                        else if (preset === '1_per_6') ratio = 0.166;

                        onUpdateImpostorConfig({
                          impostorRatioPreset: preset,
                          impostorRatio: ratio,
                          numImpostors: numImp
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="1_per_4">1 a cada 4 jogadores (25%)</option>
                      <option value="1_per_5">1 a cada 5 jogadores (20%)</option>
                      <option value="1_per_3">1 a cada 3 jogadores (33%)</option>
                      <option value="1_per_2">1 a cada 2 jogadores (50%)</option>
                      <option value="1_per_6">1 a cada 6 jogadores (16%)</option>
                    </select>
                  </div>

                  {/* Limite de Rodadas para Encontrar Infiltrados */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                      Limite de Rodadas:
                    </label>
                    <select
                      value={impostorConfig.roundsTotal || 3}
                      onChange={(e) => onUpdateImpostorConfig({ roundsTotal: Number(e.target.value) })}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value={1}>1 Rodada</option>
                      <option value={2}>2 Rodadas</option>
                      <option value={3}>3 Rodadas (Padrão)</option>
                      <option value={4}>4 Rodadas</option>
                      <option value={5}>5 Rodadas</option>
                      <option value={6}>6 Rodadas</option>
                    </select>
                  </div>

                  {/* Resumo da Proporção */}
                  <div className="text-xs text-slate-300 pt-3 sm:pt-0">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Distribuição:</span>
                    {isInvestigatorMode ? (
                      <div>
                        <strong className="text-rose-400">{impostorParticipants.length || impostorConfig.numImpostors || 1} Infiltrado(s)</strong> em <strong className="text-indigo-300">{impostorConfig.numAgents || 4} no Palco</strong> • <strong className="text-slate-400">{Math.max(0, participants.length - (impostorConfig.numAgents || 4))} Investigadores</strong>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-rose-400">{impostorParticipants.length || impostorConfig.numImpostors || 1} Infiltrado(s)</strong> / <strong className="text-emerald-300">{participants.length} Jogadores Ativos (Sem investigadores)</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Remover Seleção dos Infiltrados e da Palavra */}
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Remover a palavra e a seleção de quem é infiltrado ou agente"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Limpar Seleção (Infiltrados & Palavra)</span>
                </button>
              </div>

              {/* RECURSO EXCLUSIVO DO MODO INVESTIGADOR: BOTÃO DE REVELAR PALAVRA PARA OS INVESTIGADORES */}
              {isInvestigatorMode && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                        Transmissão para a Plateia
                      </span>
                      {impostorConfig.revealWordToInvestigators && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-pulse">
                          ● Palavra Visível na Plateia
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-white">
                      Revelar Palavra Secreta para os Investigadores (Celular)
                    </h5>
                    <p className="text-xs text-slate-300">
                      Ao ativar, todos os participantes na plateia (que não são agentes no palco) recebem a palavra secreta no seu celular para poderem analisar quem está blefando no palco!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleRevealWordToInvestigators}
                    className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                      impostorConfig.revealWordToInvestigators
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {impostorConfig.revealWordToInvestigators ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-200" />
                        <span>✓ Palavra Revelada aos Investigadores (Clique para Ocultar)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Revelar Palavra para os Investigadores</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Status dos Jogadores (Modo Clássico vs Modo Investigador) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {isInvestigatorMode
                      ? `Agentes no Palco (${agentParticipants.length} selecionados)`
                      : `Jogadores na Partida (${participants.length} conectados • Sem Investigadores)`}
                  </span>

                  <button
                    onClick={() => setIsAgentModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                  >
                    Abrir Seletor / Configuração Avançada
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {(isInvestigatorMode ? agentParticipants : participants).map((p, idx) => {
                    const isImp = (impostorConfig.impostorParticipantIds || []).includes(p.id);
                    const isEliminated = (impostorConfig.eliminatedIds || []).includes(p.id);
                    const votes = voteCounts[p.id] || 0;
                    const showImpostorBadge = (!isPresenterPlaying || adminOverridePeek) && isImp;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                          isEliminated
                            ? 'bg-slate-950/80 border-rose-900/50 opacity-60'
                            : showImpostorBadge
                            ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40'
                            : 'bg-slate-800/80 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-indigo-400">
                            {isInvestigatorMode ? `Agente #${idx + 1}` : `Jogador #${idx + 1}`}
                          </span>
                          {showImpostorBadge && (
                            <span className="text-rose-400 font-extrabold flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              Infiltrado
                            </span>
                          )}
                          {isEliminated && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/60 text-rose-300 font-black text-[9px] uppercase tracking-wider shadow-sm">
                              💀 Eliminado
                            </span>
                          )}
                        </div>

                        <div className="text-center my-2">
                          <span className="text-3xl block">{p.avatar}</span>
                          <span className={`text-sm font-bold block truncate mt-1 ${isEliminated ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {p.name}
                          </span>
                        </div>

                        {impostorConfig.votingActive && (
                          <div className="mt-1 pt-1 border-t border-slate-700 text-center text-xs font-mono font-bold text-amber-400">
                            {votes} voto{votes === 1 ? '' : 's'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SE A VOTAÇÃO ESTÁ ATIVA E O APRESENTADOR ESTÁ JOGANDO: CÉDULA DE VOTO DO APRESENTADOR */}
            {isPresenterPlaying && impostorConfig.votingActive && (
              <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        Sua Cédula de Voto ({presenterPlayerName})
                      </h4>
                      <p className="text-xs text-purple-300">
                        Quem você acha que é o Infiltrado? Escolha seu suspeito para eliminar:
                      </p>
                    </div>
                  </div>
                  {presenterVote && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                      ✓ Voto Registrado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {votingSuspects.map((suspect) => {
                    const isSelected = presenterVote === suspect.id;
                    return (
                      <button
                        key={suspect.id}
                        type="button"
                        onClick={() => handlePresenterVote(suspect.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/50 scale-[1.02]'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">{suspect.avatar}</span>
                        <div className="truncate text-left">
                          <span className="block truncate">{suspect.name}</span>
                          {isSelected && <span className="text-[10px] text-purple-200">Seu voto</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloco 2: Controles da Rodada & Votação */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Controle de Jogo ao Vivo
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    {impostorConfig.revealState === 'round_elimination'
                      ? 'Resultado da Eliminação da Rodada'
                      : impostorConfig.votingActive
                      ? 'Votação em Andamento nos Celulares'
                      : `Fase de Pistas: Rodada ${impostorConfig.currentRound || 1} de ${impostorConfig.roundsTotal || 3}`}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    Total de votos: <span className="font-mono text-amber-400">{totalVotesCast}</span>
                  </span>
                </div>
              </div>

              {/* Se estamos em round_elimination, exibir controles de avanço de rodada ou nova partida */}
              {impostorConfig.revealState === 'round_elimination' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{impostorConfig.lastEliminatedAvatar || participants.find(p => p.id === impostorConfig.lastEliminatedId)?.avatar || '👤'}</span>
                      <span className="text-xs font-bold text-slate-300">
                        Eliminado na Rodada: <strong className="text-rose-400 font-extrabold">{impostorConfig.lastEliminatedName || participants.find(p => p.id === impostorConfig.lastEliminatedId)?.name || 'Participante'}</strong> ({impostorConfig.lastEliminatedWasImpostor ? '🚨 Era Infiltrado' : '🛡️ Era Agente Inocente'})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      Rodada {impostorConfig.currentRound || 1} de {impostorConfig.roundsTotal || 3}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {!impostorConfig.winner ? (
                      <>
                        <button
                          onClick={() => {
                            if (onAdvanceToNextRound) {
                              onAdvanceToNextRound(false);
                            }
                          }}
                          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Play className="w-4 h-4 text-indigo-200" />
                          <span>Iniciar nova rodada com a mesma palavra</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onAdvanceToNextRound) {
                              onAdvanceToNextRound(true);
                            }
                          }}
                          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Shuffle className="w-4 h-4 text-purple-200" />
                          <span>Iniciar nova rodada com outra palavra</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-amber-400/60 text-xs text-center w-full space-y-1">
                        <span className="font-extrabold uppercase tracking-wider text-amber-300 block">
                          🏁 Partida Encerrada • Palavra Secreta Revelada
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300 font-display block">
                          {impostorConfig.secretWord}
                        </span>
                        <span className="text-slate-300 text-[11px] block">
                          Categoria: <strong className="text-white">{impostorConfig.category || 'Geral'}</strong>
                        </span>
                        <span className="font-bold text-xs inline-block mt-1">
                          {impostorConfig.winner === 'impostors' ? '🚨 Vitória dos Infiltrados! As rodadas acabaram ou os agentes foram eliminados.' : '🛡️ Vitória dos Agentes! Todos os infiltrados foram eliminados.'}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (onStartNewMatch) {
                          onStartNewMatch();
                        } else {
                          onResetImpostorGame();
                        }
                      }}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      <span>Iniciar nova partida</span>
                    </button>

                    {impostorConfig.mode === 'investigator' && (
                      <button
                        onClick={handleToggleRevealWordToInvestigators}
                        className={`px-5 py-3 rounded-2xl border font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95 ${
                          impostorConfig.revealWordToInvestigators
                            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900/80'
                            : 'bg-amber-950/80 border-amber-500/80 text-amber-300 hover:bg-amber-900/80'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>
                          {impostorConfig.revealWordToInvestigators
                            ? 'Ocultar Palavra dos Investigadores'
                            : 'Revelar Palavra aos Investigadores'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação Dinâmica quando NÃO em round_elimination */}
              {impostorConfig.revealState !== 'round_elimination' && (
                <div className="flex flex-wrap items-center gap-3">
                  {!impostorConfig.gameStarted ? (
                    <button
                      onClick={handleStartGame}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/50 cursor-pointer flex items-center gap-2 transition-transform active:scale-95 animate-pulse"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>▶ Iniciar Jogo do Infiltrado</span>
                    </button>
                  ) : !impostorConfig.votingActive ? (
                    <>
                      <button
                        onClick={handleAdvanceRound}
                        className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {(impostorConfig.currentRound || 1) < (impostorConfig.roundsTotal || 3)
                            ? `Avançar para Rodada ${(impostorConfig.currentRound || 1) + 1} de Pistas`
                            : 'Iniciar Votação nos Celulares'}
                        </span>
                      </button>

                      <button
                        onClick={onStartImpostorVoting}
                        className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Abrir Votação Imediata</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onRevealImpostor}
                        className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-all active:scale-95 animate-pulse"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Encerrar Votação e Revelar Eliminado no Telão!</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (onStartNewMatch) {
                        onStartNewMatch();
                      } else {
                        onResetImpostorGame();
                      }
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Nova Partida / Resetar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOGO DE DESENHO (GARTIC & IMAGEM E AÇÃO): PAINEL DO APRESENTADOR */}
        {isGarticSlide && (
          <div className="space-y-6">
            {/* Header com Badges e Informações */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                    🎨
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                        Jogo de Desenho
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Rodada {garticConfig.currentRound || 1} • Meta: {garticConfig.targetScore || 120} pts
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white font-display mt-0.5">
                      {garticConfig.mode === 'digital' ? 'Modo Digital (Gartic)' : 'Modo Presencial (Imagem & Ação)'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    garticConfig.roundState === 'drawing'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : garticConfig.roundState === 'choosing_word'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : garticConfig.roundState === 'round_end'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {garticConfig.roundState === 'drawing'
                      ? '✏️ Desenhando ao Vivo'
                      : garticConfig.roundState === 'choosing_word'
                      ? '⏳ Escolhendo Palavra'
                      : garticConfig.roundState === 'round_end'
                      ? '🏁 Fim de Rodada'
                      : garticConfig.roundState === 'game_over'
                      ? '🏆 Fim de Jogo'
                      : 'Aguardando Início'}
                  </span>
                </div>
              </div>

              {/* Seletor de Modo (Digital vs Presencial) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateGarticConfig?.({ mode: 'digital' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    garticConfig.mode === 'digital'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Modo Digital (Estilo Gartic)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Participantes digitam os palpites nos celulares. Pontuação rápida com dicas progressivas de letras.
                    </p>
                  </div>
                  {garticConfig.mode === 'digital' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold shrink-0 ml-2">
                      Ativo
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateGarticConfig?.({ mode: 'in_person' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    garticConfig.mode === 'in_person'
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Tv className="w-3.5 h-3.5" />
                      <span>Modo Presencial (Imagem & Ação)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      O artista desenha no celular, o telão projeta e as pessoas na sala gritam o nome. Você valida os acertos.
                    </p>
                  </div>
                  {garticConfig.mode === 'in_person' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold shrink-0 ml-2">
                      Ativo
                    </span>
                  )}
                </button>
              </div>

              {/* Controles de Configuração da Partida */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Categoria / Tema */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tema de Palavras
                  </span>
                  <select
                    value={garticConfig.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const words = getGarticWordOptions(newCat, 3);
                      onUpdateGarticConfig?.({
                        category: newCat,
                        wordChoices: words,
                        secretWord: words[0] || 'Elefante'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {GARTIC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Meta de Pontos */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Meta de Vitória
                  </span>
                  <select
                    value={garticConfig.targetScore || 120}
                    onChange={(e) => onUpdateGarticConfig?.({ targetScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={60}>60 pontos (Rápido)</option>
                    <option value={120}>120 pontos (Padrão Gartic)</option>
                    <option value={180}>180 pontos (Longo)</option>
                    <option value={240}>240 pontos (Maratona)</option>
                  </select>
                </div>

                {/* 3. Tempo da Rodada */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tempo por Desenho
                  </span>
                  <select
                    value={garticConfig.roundTimeSeconds || 80}
                    onChange={(e) => onUpdateGarticConfig?.({ roundTimeSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={45}>45 segundos</option>
                    <option value={60}>60 segundos</option>
                    <option value={80}>80 segundos (Padrão)</option>
                    <option value={100}>100 segundos</option>
                    <option value={120}>120 segundos</option>
                  </select>
                </div>
              </div>

              {/* Seleção do Desenhista (Sorteio vs Manual) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black">
                      ✏️
                    </span>
                    <span className="text-xs font-black text-slate-200">
                      Desenhista da Rodada:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateGarticConfig?.({
                          selectionMethod: garticConfig.selectionMethod === 'random' ? 'manual' : 'random'
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    >
                      {garticConfig.selectionMethod === 'random' ? 'Modo: Sorteio Randômico' : 'Modo: Escolha Manual'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{garticDrawer?.avatar || '🎨'}</span>
                    <div>
                      <div className="text-sm font-black text-white">{garticDrawerName}</div>
                      <span className="text-[10px] text-slate-400">
                        {garticDrawer ? 'Participante Selecionado' : 'Nenhum selecionado (Sorteio automático)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sorteio Aleatório */}
                    <button
                      type="button"
                      onClick={() => {
                        if (participants.length === 0) {
                          onAddSimulatedParticipants?.();
                          return;
                        }
                        const randomP = participants[Math.floor(Math.random() * participants.length)];
                        onUpdateGarticConfig?.({
                          currentDrawerId: randomP.id,
                          currentDrawerName: randomP.name,
                          currentDrawerAvatar: randomP.avatar
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Sortear Outro</span>
                    </button>

                    {/* Dropdown de Escolha Manual */}
                    <select
                      value={garticConfig.currentDrawerId || ''}
                      onChange={(e) => {
                        const chosenId = e.target.value;
                        const p = participants.find((part) => part.id === chosenId);
                        onUpdateGarticConfig?.({
                          currentDrawerId: chosenId,
                          currentDrawerName: p?.name,
                          currentDrawerAvatar: p?.avatar,
                          selectionMethod: 'manual'
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 max-w-[160px]"
                    >
                      <option value="">Selecione na lista...</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.avatar} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Informações da Palavra Secreta */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300">
                    Palavra Secreta Atual:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const words = getGarticWordOptions(garticConfig.category || 'Geral & Variados', 3);
                      onUpdateGarticConfig?.({
                        wordChoices: words,
                        secretWord: words[0] || 'Elefante'
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 border border-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Trocar Palavra</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xl font-mono font-black text-amber-300">
                    {garticConfig.secretWord ? garticConfig.secretWord.toUpperCase() : '(Será sorteada ao iniciar)'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Tema: {garticConfig.category}
                  </span>
                </div>
              </div>

              {/* Ações em Tempo Real do Apresentador */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!garticConfig.gameStarted || garticConfig.roundState === 'lobby' ? (
                  <button
                    type="button"
                    onClick={handleStartGartic}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-amber-950/50 cursor-pointer flex items-center gap-2 transition-transform active:scale-95 animate-pulse"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>▶ Iniciar Jogo de Desenho</span>
                  </button>
                ) : (
                  <>
                    {onAdvanceGarticNextRound && (
                      <button
                        type="button"
                        onClick={onAdvanceGarticNextRound}
                        className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Play className="w-4 h-4" />
                        <span>Avançar para Próxima Rodada</span>
                      </button>
                    )}

                    {/* Botões Presenciais de Validação Rápida */}
                    {garticConfig.mode === 'in_person' && garticConfig.roundState === 'drawing' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onGarticInPersonCorrect?.()}
                          className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-transform active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acertaram! (+10 pts)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onGarticInPersonSkip?.()}
                          className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
                        >
                          <span>Pular Palavra</span>
                        </button>
                      </>
                    )}

                    {onResetGarticGame && (
                      <button
                        type="button"
                        onClick={onResetGarticGame}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Resetar Partida</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE NORMAL DE QUIZ OU CONTEÚDO */}
        {!isImpostorSlide && !isGarticSlide && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Controles do Slide de Quiz / Conteúdo
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {currentSlide.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleShowAnswers}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    showAnswers
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showAnswers ? 'Ocultar Resposta no Telão' : 'Revelar Resposta no Telão'}</span>
                </button>
              </div>
            </div>

            {/* Alternativas de Quiz (COM SUPORTE A APRESENTADOR JOGAR E RESPONDER) */}
            {currentSlide.options && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {isPresenterPlaying && !adminOverridePeek && !showAnswers
                      ? '🎮 Escolha sua resposta para pontuar junto com a plateia:'
                      : 'Alternativas:'}
                  </span>
                  {isPresenterPlaying && localQuizSelectedOption && (
                    <span className="text-xs font-bold text-purple-400">
                      ✓ Sua resposta foi registrada!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSlide.options.map((opt) => {
                    const isCorrect = opt.isCorrect;
                    const showCorrectTag = (!isPresenterPlaying || adminOverridePeek || showAnswers) && isCorrect;
                    const isSelectedByPresenter = localQuizSelectedOption === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (isPresenterPlaying) {
                            handleSelectQuizOption(opt.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          isPresenterPlaying ? 'cursor-pointer hover:border-purple-400' : ''
                        } ${
                          isSelectedByPresenter
                            ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/40 text-white font-bold'
                            : showCorrectTag
                            ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300 font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900">
                            {opt.icon || '●'}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelectedByPresenter && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40">
                              Sua Escolha ✓
                            </span>
                          )}
                          {showCorrectTag && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Correta ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Gerenciamento de Participantes (Visualizar, Remover e Banir) */}
      {isParticipantsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  Gerenciamento da Sala
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Participantes Conectados ({participants.length})</span>
                </h3>
              </div>
              <button
                onClick={() => setIsParticipantsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar participante por nome..."
                  value={participantSearchTerm}
                  onChange={(e) => setParticipantSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants
                .filter((p) =>
                  p.name.toLowerCase().includes(participantSearchTerm.toLowerCase())
                )
                .map((p) => {
                  const isAgent = (impostorConfig.agentParticipantIds || []).includes(p.id) || p.isAgent;
                  const isImpostor = (impostorConfig.impostorParticipantIds || []).includes(p.id) || p.isImpostor;
                  const isEliminated = (impostorConfig.eliminatedIds || []).includes(p.id) || p.isEliminated;

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.avatar || '👤'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{p.name}</span>
                            {isEliminated ? (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                💀 Eliminado
                              </span>
                            ) : isAgent ? (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🕵️ Agente
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                🔍 Participante
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Pontuação: <strong className="text-amber-400">{p.score || 0} pts</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (confirm(`Remover "${p.name}" da sala temporariamente?`)) {
                              if (onKickParticipant) onKickParticipant(p.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-semibold cursor-pointer transition-all"
                          title="Expulsar da sala"
                        >
                          Remover
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Banir permanentemente "${p.name}" desta sala? Ele não poderá reconectar.`)) {
                              if (onBanParticipant) onBanParticipant(p.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 text-xs font-semibold cursor-pointer transition-all"
                          title="Banir da sala permanentemente"
                        >
                          Banir
                        </button>
                      </div>
                    </div>
                  );
                })}

              {participants.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhum participante conectado no momento.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Participantes removidos ou banidos perdem a conexão em tempo real instantaneamente.
              </span>
              <button
                onClick={() => setIsParticipantsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Agentes */}
      {isAgentModalOpen && (
        <AgentSelectorModal
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
          participants={participants}
          currentConfig={impostorConfig}
          onSave={(agents, impostors, numAgents, numImpostors, selectionMethod, ratio, preset, mode) => {
            onUpdateImpostorConfig({
              mode: mode || impostorConfig.mode || 'classic',
              agentParticipantIds: agents,
              impostorParticipantIds: impostors,
              numAgents: numAgents || impostorConfig.numAgents,
              numImpostors: numImpostors || impostorConfig.numImpostors,
              selectionMethod: selectionMethod || impostorConfig.selectionMethod,
              impostorRatio: ratio,
              impostorRatioPreset: preset
            });
          }}
          onAddSimulatedParticipants={onAddSimulatedParticipants}
        />
      )}
    </div>
  );
};
