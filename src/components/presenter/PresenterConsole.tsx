import React, { useState } from 'react';
import {
  Slide,
  Participant,
  Team,
  ImpostorConfig,
  ImagePinSubmission,
  TermSubmission
} from '../../types';
import { PRESET_WORD_CATEGORIES, getRandomWordForCategory } from '../../data/presetWords';
import { AgentSelectorModal } from '../slides/AgentSelectorModal';
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
  UserPlus,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  Clock,
  Tv,
  ExternalLink,
  Cloud
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
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartImpostorVoting: () => void;
  onRevealImpostor: () => void;
  onResetImpostorGame: () => void;
  onOpenPresentationScreen: () => void;
  onOpenSettingsScreen: () => void;
  onOpenProjectorWindow?: () => void;
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
  onUpdateImpostorConfig,
  onStartImpostorVoting,
  onRevealImpostor,
  onResetImpostorGame,
  onOpenPresentationScreen,
  onOpenSettingsScreen,
  onOpenProjectorWindow
}) => {
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const { user, savePresentationToCloud, loginWithGoogle } = useAuth();
  const [hideSecrets, setHideSecrets] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [cloudFeedback, setCloudFeedback] = useState<string | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

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
    secretWord: 'Moisés',
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

  // Identificar agentes e infiltrados
  const agentParticipants = participants.filter((p) =>
    (impostorConfig.agentParticipantIds || []).includes(p.id)
  );

  const impostorParticipants = participants.filter((p) =>
    (impostorConfig.impostorParticipantIds || []).includes(p.id)
  );

  const investigatorParticipants = participants.filter(
    (p) => !(impostorConfig.agentParticipantIds || []).includes(p.id)
  );

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
      onUpdateImpostorConfig({ currentRound: nextRound });
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
  };

  // Sortear agentes e infiltrados automaticamente de forma rápida
  const handleAutoRaffleAgentsAndImpostor = () => {
    if (participants.length === 0) {
      onAddSimulatedParticipants();
      return;
    }
    const targetAgents = impostorConfig.numAgents || 4;
    const targetImpostors = impostorConfig.numImpostors || 1;

    if (isInvestigatorMode) {
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const agents = shuffled.slice(0, Math.min(targetAgents, shuffled.length)).map((p) => p.id);
      const shuffledAgents = [...agents].sort(() => 0.5 - Math.random());
      const impostors = shuffledAgents.slice(0, Math.min(targetImpostors, agents.length));
      onUpdateImpostorConfig({
        agentParticipantIds: agents,
        impostorParticipantIds: impostors
      });
    } else {
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const impostors = shuffled.slice(0, Math.min(targetImpostors, shuffled.length)).map((p) => p.id);
      onUpdateImpostorConfig({
        agentParticipantIds: [],
        impostorParticipantIds: impostors
      });
    }
  };

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
            </div>
            <p className="text-xs text-slate-400">
              Painel de controle confidencial • Somente você tem acesso a estas informações
            </p>
          </div>
        </div>

        {/* Quick actions: Salvar na Nuvem, Telão, Configurações, Bots */}
        <div className="flex items-center gap-2">
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
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
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

        {/* JOGO DO INFILTRADO: PAINEL DE CONTROLE EXCLUSIVO DO APRESENTADOR */}
        {isImpostorSlide && (
          <div className="space-y-6">
            {/* Bloco 1: Informações Sigilosas (Apenas para o Apresentador) */}
            <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-600/30 border-b border-l border-rose-500/40 rounded-bl-2xl text-[10px] uppercase tracking-wider font-extrabold text-rose-300 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Painel Sigiloso • Não Exibir no Telão</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dados Confidenciais da Rodada</span>
                  </div>
                  <h4 className="text-xl font-black text-white mt-1">
                    Tema: {impostorConfig.category}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHideSecrets(!hideSecrets)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    {hideSecrets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{hideSecrets ? 'Mostrar Segredos' : 'Ocultar da Tela'}</span>
                  </button>
                </div>
              </div>

              {/* Cards de Segredo: Palavra Secreta + Infiltrado Sorteado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Palavra Secreta */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">
                      Palavra Secreta (Agentes e Civis):
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-wide">
                      {hideSecrets ? '••••••••' : impostorConfig.secretWord}
                    </span>
                  </div>
                  <button
                    onClick={handleRandomizeWord}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Sortear outra palavra para esta rodada"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span className="hidden sm:inline">Sortear</span>
                  </button>
                </div>

                  {/* Infiltrado Sorteado */}
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-300 block">
                        🚨 Infiltrado Sorteado (Não sabe a palavra):
                      </span>
                      <div className="flex items-center gap-2">
                        {impostorParticipants.length > 0 ? (
                          impostorParticipants.map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                              <span className="text-2xl">{p.avatar}</span>
                              <span className="text-lg font-black text-rose-200">
                                {hideSecrets ? '••••••••' : p.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-amber-300 font-bold">
                            Nenhum infiltrado definido ainda nesta rodada.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {impostorParticipants.length === 0 && (
                        <button
                          type="button"
                          onClick={handleAutoRaffleAgentsAndImpostor}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow animate-bounce"
                          title="Sortear automaticamente os agentes e infiltrados entre os participantes"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          <span>Sortear Agora</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsAgentModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>{impostorParticipants.length > 0 ? 'Mudar / Ajustar' : 'Selecionar'}</span>
                      </button>
                    </div>
                  </div>
              </div>

              {/* RECURSO SOLICITADO: BOTÃO DE REVELAR PALAVRA PARA OS INVESTIGADORES */}
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

              {/* Status dos Agentes no Palco */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Agentes no Palco ({agentParticipants.length} selecionados)
                  </span>

                  <button
                    onClick={() => setIsAgentModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                  >
                    Abrir Seletor / Sorteio de Agentes
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {agentParticipants.map((p, idx) => {
                    const isImp = (impostorConfig.impostorParticipantIds || []).includes(p.id);
                    const votes = voteCounts[p.id] || 0;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                          isImp
                            ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40'
                            : 'bg-slate-800/80 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-indigo-400">Agente #{idx + 1}</span>
                          {isImp && (
                            <span className="text-rose-400 font-extrabold flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              Infiltrado
                            </span>
                          )}
                        </div>

                        <div className="text-center my-2">
                          <span className="text-3xl block">{p.avatar}</span>
                          <span className="text-sm font-bold text-white block truncate mt-1">
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

            {/* Bloco 2: Controles da Rodada & Votação */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Controle de Jogo ao Vivo
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    {impostorConfig.votingActive
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

              {/* Botões de Ação Dinâmica */}
              <div className="flex flex-wrap items-center gap-3">
                {!impostorConfig.votingActive ? (
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
                      <span>Encerrar Votação e Revelar Infiltrado no Telão!</span>
                    </button>
                  </>
                )}

                <button
                  onClick={onResetImpostorGame}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nova Partida / Resetar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE NORMAL DE QUIZ OU CONTEÚDO */}
        {!isImpostorSlide && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Controles do Slide de Quiz / Conteúdo
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {currentSlide.title}
                </h4>
              </div>

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

            {/* Alternativas com indicação da resposta correta */}
            {currentSlide.options && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">
                  Alternativas (O apresentador vê a resposta correta):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSlide.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900">
                          {opt.icon || '●'}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {opt.isCorrect && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Correta ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Seleção de Agentes */}
      {isAgentModalOpen && (
        <AgentSelectorModal
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
          participants={participants}
          currentConfig={impostorConfig}
          onSave={(agents, impostors, numAgents, numImpostors, selectionMethod) => {
            onUpdateImpostorConfig({
              agentParticipantIds: agents,
              impostorParticipantIds: impostors,
              numAgents: numAgents || impostorConfig.numAgents,
              numImpostors: numImpostors || impostorConfig.numImpostors,
              selectionMethod: selectionMethod || impostorConfig.selectionMethod
            });
          }}
          onAddSimulatedParticipants={onAddSimulatedParticipants}
        />
      )}
    </div>
  );
};
