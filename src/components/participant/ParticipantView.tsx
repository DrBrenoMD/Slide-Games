import React, { useState, useRef, useEffect } from 'react';
import { Participant, Slide, Team } from '../../types';
import { ImpostorParticipantCard } from '../motion/ImpostorAlert';
import { ContentSlideRenderer } from '../slides/ContentSlideRenderer';
import { PodiumPod } from '../motion/PodiumPod';
import { getComputedThemeStyles } from '../../utils/themeStyles';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Users,
  Target,
  Sparkles,
  Zap,
  Flame,
  ThumbsUp,
  Tv,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface ParticipantViewProps {
  participant: Participant;
  currentSlide: Slide;
  currentSlideIndex: number;
  totalSlides: number;
  teams: Team[];
  onSubmitAnswer: (answer: any) => void;
  onSubmitPin: (xPercent: number, yPercent: number) => void;
  onSubmitTerm: (term: string) => void;
  onSendReaction: (emoji: string) => void;
  onImpostorVote: (suspectId: string) => void;
  allParticipants: Participant[];
  onLeaveRoom?: () => void;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  participant,
  currentSlide,
  currentSlideIndex,
  totalSlides,
  teams,
  onSubmitAnswer,
  onSubmitPin,
  onSubmitTerm,
  onSendReaction,
  onImpostorVote,
  allParticipants,
  onLeaveRoom
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [termInput, setTermInput] = useState('');
  const [mySubmittedTerms, setMySubmittedTerms] = useState<string[]>([]);
  const [termFeedback, setTermFeedback] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [votedSuspectId, setVotedSuspectId] = useState<string | null>(null);
  const [showFullTelao, setShowFullTelao] = useState(false);

  // Limpa estados de resposta quando avança de slide
  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setTermInput('');
    setMySubmittedTerms([]);
    setTermFeedback(null);
    setPendingPin(null);
    setPinConfirmed(false);
    setVotedSuspectId(null);
  }, [currentSlideIndex]);

  // Sincroniza e reseta votedSuspectId sempre que os votos forem resetados ou a rodada mudar
  useEffect(() => {
    const currentVotes = currentSlide.impostorConfig?.votes || {};
    if (!currentVotes[participant.id]) {
      setVotedSuspectId(null);
    } else {
      setVotedSuspectId(currentVotes[participant.id]);
    }
  }, [
    currentSlide.impostorConfig?.votes,
    currentSlide.impostorConfig?.currentRound,
    currentSlide.impostorConfig?.votingActive,
    currentSlide.impostorConfig?.revealState,
    participant.id
  ]);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const participantTeam = teams.find((t) => t.id === participant.teamId);
  const themeStyles = getComputedThemeStyles(currentSlide.theme);

  // Múltipla escolha clique
  const handleOptionClick = (optId: string) => {
    if (selectedOption) return; // já respondeu
    setSelectedOption(optId);
    onSubmitAnswer({ selectedOption: optId, timestamp: Date.now() });
  };

  // Envio de resposta curta ou nuvem de palavras
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSubmitAnswer({ text: textInput.trim(), timestamp: Date.now() });
    setTextInput('');
  };

  // Envio de termo no Sprint
  const handleTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = termInput.trim().toLowerCase();
    if (!cleaned || cleaned.length < 2) return;

    // Prevenção de duplicatas locais
    if (mySubmittedTerms.includes(cleaned)) {
      setTermFeedback('Você já enviou esta palavra!');
      setTimeout(() => setTermFeedback(null), 1500);
      return;
    }

    // Prevenção de spam óbvio (ex: 'aaaaa', 'asdfghjk')
    if (/^(.)\1+$/.test(cleaned) || cleaned.length > 25) {
      setTermFeedback('Termo inválido');
      setTimeout(() => setTermFeedback(null), 1500);
      return;
    }

    onSubmitTerm(cleaned);
    setMySubmittedTerms((prev) => [...prev, cleaned]);
    setTermInput('');
    setTermFeedback('✓ Palavra enviada (+100 pts)');
    setTimeout(() => setTermFeedback(null), 1500);
  };

  // Clique na imagem para definir pin
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pinConfirmed || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setPendingPin({ x: Math.round(xPercent), y: Math.round(yPercent) });
  };

  const handleConfirmPin = () => {
    if (!pendingPin || pinConfirmed) return;
    onSubmitPin(pendingPin.x, pendingPin.y);
    setPinConfirmed(true);
  };

  // Voto no Infiltrado
  const handleVoteSuspect = (suspectId: string) => {
    if (votedSuspectId) return;
    setVotedSuspectId(suspectId);
    onImpostorVote(suspectId);
  };

  // Ícones padrão geométricos estilo Kahoot
  const geometricIcons = ['▲', '◆', '●', '■'];
  const defaultColors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

  const isContentSlide = currentSlide.type.startsWith('content_') && currentSlide.type !== 'content_qrcode_lobby';
  const isLeaderboardSlide = currentSlide.type === 'leaderboard';

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 select-none">
      {/* Top Participant Status Bar */}
      <header className="h-16 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">
            {participant.avatar}
          </div>
          <div className="truncate">
            <div className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
              {participant.name}
            </div>
            {participantTeam && (
              <div
                className="text-[10px] font-semibold flex items-center gap-1"
                style={{ color: participantTeam.color }}
              >
                <span>{participantTeam.badge}</span>
                <span>{participantTeam.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Toggle (Telão vs Controles) + Score & Tracker */}
        <div className="flex items-center gap-2">
          {!isContentSlide && !isLeaderboardSlide && currentSlide.type !== 'content_qrcode_lobby' && (
            <button
              onClick={() => setShowFullTelao(!showFullTelao)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                showFullTelao
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={showFullTelao ? 'Voltar para controles de jogo' : 'Exibir slide completo'}
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xs:inline">{showFullTelao ? 'Meus Controles' : 'Ver Telão'}</span>
            </button>
          )}

          <div className="px-2.5 py-1 bg-indigo-950/80 rounded-xl border border-indigo-500/40 font-mono text-xs font-black text-indigo-300">
            {participant.score.toLocaleString()} pts
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-500">
            {currentSlideIndex + 1}/{totalSlides}
          </span>

          {onLeaveRoom && (
            <button
              onClick={() => {
                if (window.confirm('Deseja realmente sair da sala e da apresentação?')) {
                  onLeaveRoom();
                }
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Sair da sala"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Dynamic Body */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col justify-start max-w-xl mx-auto w-full space-y-4">
        {/* SLIDE DE CONTEÚDO (APRESENTAÇÃO COMPLETA RENDERIZADA NA TELA DO PARTICIPANTE EM 16:9) */}
        {isContentSlide && (
          <div className="w-full aspect-video max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative">
            <ContentSlideRenderer slide={currentSlide} />
          </div>
        )}

        {/* SLIDE DE LEADERBOARD (CLASSIFICAÇÃO COMPLETA) */}
        {isLeaderboardSlide && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-center">
            <h2 className="text-2xl font-black text-white mb-2">{currentSlide.title || '🏆 Classificação'}</h2>
            {currentSlide.subtitle && <p className="text-xs text-slate-400 mb-4">{currentSlide.subtitle}</p>}
            <PodiumPod
              participants={allParticipants}
              teams={teams}
              teamMode={participant.teamId ? 'teams' : 'individual'}
              isFinal={currentSlideIndex === totalSlides - 1}
            />
          </div>
        )}

        {/* MODO TELÃO COMPLETO QUANDO ATIVADO PELO PARTICIPANTE (EM CONTAINER RESPONSIVO 16:9) */}
        {showFullTelao && !isContentSlide && !isLeaderboardSlide && (
          <div className="w-full aspect-video max-w-xl mx-auto bg-slate-900 border border-indigo-500/40 rounded-3xl p-3 sm:p-4 shadow-2xl overflow-y-auto space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
                  Tela da Apresentação
                </span>
              </div>
              <button
                onClick={() => setShowFullTelao(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
              >
                Voltar aos Controles
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-xs text-slate-300 font-medium">{currentSlide.subtitle}</p>
              )}
              {currentSlide.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-28">
                  <img src={currentSlide.imageUrl} alt={currentSlide.title} className="w-full h-auto object-cover max-h-28" />
                </div>
              )}
              {currentSlide.options && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {currentSlide.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-2 rounded-xl flex items-center gap-1.5 text-white font-bold text-[11px] shadow-sm"
                      style={{ backgroundColor: opt.color || defaultColors[idx % defaultColors.length] }}
                    >
                      <span className="text-xs">{opt.icon || geometricIcons[idx % geometricIcons.length]}</span>
                      <span className="truncate">{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TELA DE APRESENTAÇÃO COMPACTA SINCRONIZADA NO TOPO (EXIBE SLIDE, IMAGEM E PERGUNTA) EM 16:9 */}
        {!showFullTelao && !isContentSlide && !isLeaderboardSlide && currentSlide.type !== 'content_qrcode_lobby' && (
          <div className="w-full aspect-video max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col justify-between overflow-hidden relative">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
              <span className="flex items-center gap-1 text-indigo-400">
                <Tv className="w-3 h-3" />
                <span>Telão Sincronizado</span>
              </span>
              <span className="font-mono text-slate-400">
                {currentSlide.type.startsWith('game_impostor') ? 'Jogo O Infiltrado' : 'Quiz ao Vivo'}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center my-1 overflow-hidden">
              <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                {currentSlide.title}
              </h3>

              {currentSlide.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 mt-2 max-h-24 sm:max-h-28 shrink-0">
                  <img src={currentSlide.imageUrl} alt={currentSlide.title} className="w-full h-full object-cover max-h-24 sm:max-h-28" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOBBY STATE */}
        {currentSlide.type === 'content_qrcode_lobby' && (
          <div className="text-center space-y-4 py-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-4xl animate-bounce">
              🎮
            </div>
            <h2 className="text-2xl font-black text-white">Você está conectado!</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Aguarde o apresentador iniciar o primeiro slide na tela principal.
            </p>
            {participantTeam && (
              <div
                className="p-4 rounded-2xl border mx-auto max-w-xs text-center"
                style={{
                  backgroundColor: `${participantTeam.color}15`,
                  borderColor: participantTeam.color
                }}
              >
                <span className="text-3xl block mb-1">{participantTeam.badge}</span>
                <span className="text-sm font-bold" style={{ color: participantTeam.color }}>
                  Você joga pela equipe {participantTeam.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MULTIPLE CHOICE / POLL / TRUE FALSE */}
        {!showFullTelao &&
          (currentSlide.type === 'quiz_multiple_choice' ||
            currentSlide.type === 'poll_single' ||
            currentSlide.type === 'quiz_true_false') && (
            <div className="space-y-4 w-full">
              <div className="text-center mb-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  {selectedOption ? 'Resposta Registrada!' : 'Escolha sua Alternativa'}
                </span>
              </div>

              <div
                className={`grid gap-3 ${
                  (currentSlide.options || []).length <= 2 ? 'grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {(currentSlide.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === opt.id;
                  const icon = opt.icon || geometricIcons[idx % geometricIcons.length];
                  const color = opt.color || defaultColors[idx % defaultColors.length];

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.id)}
                      disabled={selectedOption !== null}
                      className={`h-24 sm:h-28 rounded-3xl p-3.5 flex flex-col justify-between items-center text-center transition-all cursor-pointer font-bold relative overflow-hidden shadow-lg ${
                        isSelected
                          ? 'ring-4 ring-white scale-102 opacity-100'
                          : selectedOption !== null
                          ? 'opacity-35 grayscale-30'
                          : 'active:scale-95 hover:opacity-95'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-2xl sm:text-3xl text-white">{icon}</span>
                      <span className="text-sm sm:text-base font-extrabold text-white line-clamp-2">
                        {opt.text}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white text-slate-900 rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-xs font-bold text-emerald-300">
                  ✓ Resposta enviada! Olhe para o telão.
                </div>
              )}
            </div>
          )}

        {/* TERM SPRINT (Quem digita mais termos) */}
        {!showFullTelao && currentSlide.type === 'quiz_term_sprint' && (
          <div className="space-y-4 w-full">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Sprint de Palavras</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Categoria: {currentSlide.categoryName || 'Geral'}
              </h3>
              <p className="text-xs text-slate-400">
                Envie o máximo de palavras válidas antes do tempo acabar!
              </p>
            </div>

            <form onSubmit={handleTermSubmit} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Digite uma palavra..."
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold cursor-pointer transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {termFeedback && (
              <div className="text-xs font-bold text-emerald-400 text-center animate-pulse">
                {termFeedback}
              </div>
            )}

            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>Suas palavras aceitas:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {mySubmittedTerms.length} termos
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {mySubmittedTerms.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 capitalize"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE PIN QUIZ */}
        {!showFullTelao && currentSlide.type === 'quiz_image_pin' && (
          <div className="space-y-4 w-full">
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Toque no local da imagem onde está o alvo
              </p>
            </div>

            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 cursor-crosshair shadow-xl"
            >
              {currentSlide.imageUrl ? (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-auto block select-none pointer-events-none max-h-64 object-cover"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                  Sem imagem
                </div>
              )}

              {/* Placed Target Pin */}
              {pendingPin && (
                <div
                  style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center animate-bounce"
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>

            {!pinConfirmed ? (
              <button
                onClick={handleConfirmPin}
                disabled={!pendingPin}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm shadow cursor-pointer transition-all"
              >
                Confirmar Minha Marcação
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-xs font-bold text-emerald-300">
                ✓ Ponto registrado com sucesso!
              </div>
            )}
          </div>
        )}

        {/* WORD CLOUD / SHORT ANSWER */}
        {!showFullTelao &&
          (currentSlide.type === 'interaction_word_cloud' ||
            currentSlide.type === 'quiz_short_answer') && (
            <div className="space-y-4 w-full">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">
                  Digite sua resposta ou palavra-chave para enviar à tela
                </p>
              </div>

              <form onSubmit={handleTextSubmit} className="space-y-3">
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Sua resposta aqui..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enviar Resposta</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        {/* JOGO O INFILTRADO (MODO CLÁSSICO E INVESTIGADOR) */}
        {!showFullTelao &&
          currentSlide.type.startsWith('game_impostor') &&
          (() => {
            const impostorConfig = currentSlide.impostorConfig;
            
            // Se a partida ainda não foi iniciada pelo apresentador, aguardar na tela de espera
            if (!impostorConfig?.gameStarted) {
              return (
                <div className="space-y-4 w-full text-center">
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-lg">
                      🕵️
                    </div>
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider inline-block">
                        Aguardando Início da Partida
                      </span>
                      <h3 className="text-xl font-black text-white">
                        O Infiltrado
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        O apresentador está preparando a partida, selecionando a palavra e definindo os agentes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-0.5">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Tema da Rodada</span>
                      <span className="text-indigo-300 font-mono font-black text-sm">{impostorConfig?.category || 'Geral'}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Conectado como {participant.name}</span>
                    </div>
                  </div>
                </div>
              );
            }

            const myNameLower = (participant.name || '').trim().toLowerCase();
            const myId = participant.id;
            const impostorIds = impostorConfig?.impostorParticipantIds || [];
            const agentIds = impostorConfig?.agentParticipantIds || [];
            const eliminatedIds = impostorConfig?.eliminatedIds || [];

            // Identificação unívoca por ID (com fallback por nome se reconexão)
            let isImpostor = impostorIds.includes(myId);
            if (!isImpostor && impostorIds.length > 0) {
              const matchedByName = allParticipants.find(p => p.name.trim().toLowerCase() === myNameLower && impostorIds.includes(p.id));
              if (matchedByName) isImpostor = true;
            }

            let isAgent = agentIds.includes(myId);
            if (!isAgent && agentIds.length > 0) {
              const matchedByName = allParticipants.find(p => p.name.trim().toLowerCase() === myNameLower && agentIds.includes(p.id));
              if (matchedByName) isAgent = true;
            }

            const hasBeenAssigned = impostorIds.length > 0 || agentIds.length > 0;
            const isInvestigator =
              impostorConfig?.mode === 'investigator' && !isAgent && !isImpostor;
            const revealWordToInvestigators = impostorConfig?.revealWordToInvestigators ?? false;
            const isEliminated =
              eliminatedIds.includes(myId) ||
              allParticipants.some(
                (p) => p.name.trim().toLowerCase() === myNameLower && eliminatedIds.includes(p.id)
              );

            // Candidatos a suspeitos para votação (excluindo os já eliminados)
            const candidateIds = new Set([
              ...agentIds,
              ...impostorIds
            ]);

            const suspects = allParticipants.filter((p) => {
              if (eliminatedIds.includes(p.id)) return false;
              if (impostorConfig?.mode === 'investigator' && candidateIds.size > 0) {
                if (candidateIds.size > 1 && p.id === participant.id) return false;
                return candidateIds.has(p.id);
              }
              if (allParticipants.length > 1 && p.id === participant.id) return false;
              return true;
            });

            return (
              <div className="space-y-4 w-full">
                {/* Card confidencial com a identidade/palavra ou aviso de eliminado */}
                <ImpostorParticipantCard
                  isImpostor={isImpostor}
                  secretWord={impostorConfig?.secretWord || 'Palavra Secreta'}
                  category={impostorConfig?.category || 'Geral'}
                  isAgent={isAgent}
                  isInvestigator={isInvestigator}
                  revealWordToInvestigators={revealWordToInvestigators}
                  hasBeenAssigned={hasBeenAssigned}
                  isEliminated={isEliminated}
                />

                {/* Se a revelação de eliminação da rodada estiver ativa */}
                {impostorConfig?.revealState === 'round_elimination' && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-2xl">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30 inline-block">
                      Resultado da Rodada {impostorConfig.currentRound || 1}
                    </span>

                    {/* Jogador Eliminado: Avatar e Nome com Destaque */}
                    <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="relative">
                        <span className="text-4xl sm:text-5xl block animate-bounce">
                          {impostorConfig.lastEliminatedAvatar || '👤'}
                        </span>
                        <span className="absolute -bottom-1 -right-1 text-xl">💀</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                          Jogador Eliminado na Rodada:
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          {impostorConfig.lastEliminatedName || 'Jogador'}
                        </h3>
                        {typeof impostorConfig.lastEliminatedVotes === 'number' && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Recebeu {impostorConfig.lastEliminatedVotes} {impostorConfig.lastEliminatedVotes === 1 ? 'voto' : 'votos'}
                          </span>
                        )}
                      </div>

                      {/* Revelação do Papel Secreto */}
                      <div className="w-full pt-2 border-t border-slate-800">
                        {impostorConfig.lastEliminatedWasImpostor ? (
                          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-black flex items-center justify-center gap-1.5 shadow">
                            <span>🚨 ERA UM AGENTE INFILTRADO!</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/50 text-sky-300 text-xs font-black flex items-center justify-center gap-1.5 shadow">
                            <span>🛡️ ERA UM AGENTE INOCENTE!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alerta Especial se o usuário atual foi o eliminado */}
                    {impostorConfig.lastEliminatedId === participant.id && (
                      <div className="p-3 rounded-2xl bg-rose-600/25 border border-rose-500 text-rose-200 text-xs font-bold">
                        ⚠️ Você foi o mais votado da rodada e foi eliminado! Mas continue na sala para acompanhar as próximas rodadas e o resultado final.
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Acompanhe o telão principal para ver o placar geral e o início da próxima rodada.
                    </p>
                  </div>
                )}

                {/* Se a votação do Infiltrado estiver ativa */}
                {impostorConfig?.votingActive && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
                    <div className="text-center">
                      <span className="text-xs uppercase tracking-wider font-bold text-rose-400">
                        Votação da Rodada {impostorConfig.currentRound || 1}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {isEliminated
                          ? 'Você foi eliminado e não pode votar nesta rodada.'
                          : 'Quem você acha que é o Infiltrado para ser eliminado?'}
                      </h4>
                    </div>

                    {!isEliminated && (
                      <>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {suspects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleVoteSuspect(p.id)}
                              disabled={votedSuspectId !== null}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                                votedSuspectId === p.id
                                  ? 'bg-rose-600/30 border-rose-500 text-rose-300 ring-2 ring-rose-500/40'
                                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="text-lg">{p.avatar}</span>
                              <span className="truncate">{p.name}</span>
                            </button>
                          ))}
                          {suspects.length === 0 && (
                            <div className="col-span-2 text-center py-4 text-xs text-slate-400">
                              Nenhum suspeito disponível para votação nesta rodada.
                            </div>
                          )}
                        </div>

                        {votedSuspectId && (
                          <div className="text-center text-xs font-bold text-rose-400 pt-1">
                            ✓ Seu voto de eliminação foi registrado!
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
      </main>

      {/* Bottom Floating Reactions Bar */}
      <footer className="h-16 px-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-around shrink-0 sticky bottom-0 z-30 backdrop-blur-md">
        {['❤️', '🔥', '👏', '💡', '😂', '🚀'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-125 transition-transform flex items-center justify-center text-xl cursor-pointer shadow-md"
            title={`Enviar reação ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </footer>
    </div>
  );
};
