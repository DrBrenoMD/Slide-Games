import React, { useEffect, useRef } from 'react';
import { Slide, Participant, GarticConfig } from '../../types';
import { DrawingViewer } from '../common/DrawingViewer';
import { generateWordHint } from '../../data/garticPresets';
import confetti from 'canvas-confetti';
import {
  Paintbrush,
  Sparkles,
  Trophy,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  Flame,
  Volume2,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GarticSlideRendererProps {
  slide: Slide;
  participants: Participant[];
  onStartGarticGame?: () => void;
  onUpdateGarticConfig: (config: Partial<GarticConfig>) => void;
  onAdvanceToNextRound?: () => void;
  onResetGame?: () => void;
  onInPersonCorrect?: (participantId?: string) => void;
  onInPersonSkip?: () => void;
  isPresenter?: boolean;
}

export const GarticSlideRenderer: React.FC<GarticSlideRendererProps> = ({
  slide,
  participants,
  onStartGarticGame,
  onUpdateGarticConfig,
  onAdvanceToNextRound,
  onResetGame,
  onInPersonCorrect,
  onInPersonSkip,
  isPresenter = false
}) => {
  const config = slide.garticConfig || {
    gameStarted: false,
    mode: 'digital',
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
  };

  const isDigital = config.mode === 'digital';
  const guessedIds = config.guessedParticipantIds || [];
  const drawer = participants.find((p) => p.id === config.currentDrawerId);
  const drawerName = drawer?.name || config.currentDrawerName || 'Artista';
  const drawerAvatar = drawer?.avatar || config.currentDrawerAvatar || '🎨';

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll no chat de palpites
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [config.chatGuesses]);

  // Confetti quando alguém vence a partida
  useEffect(() => {
    if (config.roundState === 'game_over') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [config.roundState]);

  // Ranking ordenado de jogadores pelo score acumulado no Gartic
  const leaderboard = [...participants].map((p) => ({
    ...p,
    garticScore: config.scores[p.id] !== undefined ? config.scores[p.id] : p.score
  })).sort((a, b) => b.garticScore - a.garticScore);

  // Dica visual da palavra secreta com suporte a letras reveladas pelo artista
  const timeLimit = config.roundTimeSeconds || 80;
  const timerRem = config.timerRemaining !== undefined ? config.timerRemaining : timeLimit;
  const timeRatioPassed = Math.max(0, Math.min(1, 1 - timerRem / timeLimit));
  const revealedIndices = config.revealedLetterIndices || [];
  const hintsCount = config.hintsRevealedCount || 0;
  const drawerPointsPerGuess = Math.max(1, 5 - hintsCount);

  const wordHintDisplay = config.secretWord
    ? generateWordHint(
        config.secretWord,
        revealedIndices.length > 0 ? revealedIndices : isDigital ? timeRatioPassed : 0
      )
    : '_ _ _ _ _';

  // 1. Lobby / Preparação
  if (!config.gameStarted || config.roundState === 'lobby') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-5xl mx-auto text-center select-none overflow-hidden">
        {/* Top Header */}
        <div className="space-y-1 sm:space-y-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Paintbrush className="w-4 h-4 text-amber-400" />
            <span>Jogo de Desenho • {isDigital ? 'Modo Digital (Gartic)' : 'Modo Presencial (Imagem & Ação)'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">
            {slide.title || 'Hora do Desenho!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isDigital
              ? 'Um participante desenha no celular, o desenho aparece no telão e os outros digitam para adivinhar!'
              : 'Um participante desenha no celular e a galera na sala física grita o palpite! Quem acertar ganha pontos.'}
          </p>
        </div>

        {/* Central Card */}
        <div className="my-auto py-4 max-w-md mx-auto w-full">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-900/30 animate-pulse">
              🎨
            </div>

            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold">
                Tema / Categoria
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {config.category || 'Geral & Variados'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Meta de Vitória</span>
                <span className="text-base font-black text-emerald-400">{config.targetScore} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tempo da Rodada</span>
                <span className="text-base font-black text-cyan-400">{config.roundTimeSeconds}s</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{participants.length} participante{participants.length === 1 ? '' : 's'} na sala</span>
            </div>

            {onStartGarticGame && (
              <button
                type="button"
                onClick={onStartGarticGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-90 text-white font-black text-sm shadow-xl cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Começar Jogo de Desenho</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Fique de olho na tela do seu celular quando a partida iniciar!</span>
        </div>
      </div>
    );
  }

  // 2. Game Over / Pódio Final
  if (config.roundState === 'game_over') {
    const winner = leaderboard[0];
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Fim de Jogo • Campeão do Desenho!</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
            🎉 {winner?.name || config.winnerName || 'Grande Vencedor'} Venceu!
          </h1>
          <p className="text-slate-300 text-sm">
            Alcançou a meta de {config.targetScore} pontos com muita criatividade e agilidade!
          </p>
        </div>

        {/* Top 3 Podia */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-lg pt-8">
          {/* 2º Lugar */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-3xl mb-1">{leaderboard[1].avatar || '🥈'}</div>
              <div className="text-xs font-bold text-white truncate max-w-[80px]">{leaderboard[1].name}</div>
              <div className="text-[11px] text-slate-400 font-bold">{leaderboard[1].garticScore} pts</div>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-700 to-slate-500 flex items-center justify-center font-black text-xl text-white shadow-lg mt-2">
                2º
              </div>
            </div>
          )}

          {/* 1º Lugar */}
          {winner && (
            <div className="flex flex-col items-center flex-1 -mt-6">
              <div className="text-5xl mb-1 animate-pulse">{winner.avatar || '👑'}</div>
              <div className="text-sm font-black text-amber-300 truncate max-w-[100px]">{winner.name}</div>
              <div className="text-xs text-amber-400 font-black">{winner.garticScore} pts</div>
              <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-600 to-amber-400 flex items-center justify-center font-black text-3xl text-white shadow-2xl mt-2 border-t-2 border-amber-200">
                1º
              </div>
            </div>
          )}

          {/* 3º Lugar */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-3xl mb-1">{leaderboard[2].avatar || '🥉'}</div>
              <div className="text-xs font-bold text-white truncate max-w-[80px]">{leaderboard[2].name}</div>
              <div className="text-[11px] text-slate-400 font-bold">{leaderboard[2].garticScore} pts</div>
              <div className="w-full h-16 sm:h-20 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-700 flex items-center justify-center font-black text-lg text-white shadow-lg mt-2">
                3º
              </div>
            </div>
          )}
        </div>

        {onResetGame && (
          <button
            type="button"
            onClick={onResetGame}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Choosing Word or Active Drawing
  return (
    <div className="w-full h-full flex flex-col justify-between p-2 sm:p-4 md:p-6 max-w-7xl mx-auto select-none overflow-hidden space-y-3">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl shrink-0">
        {/* Left: Drawer Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-xl shrink-0 shadow-md">
            {drawerAvatar}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider block">
              Desenhando Agora
            </span>
            <div className="text-sm sm:text-base font-black text-white truncate font-display">
              {drawerName}
            </div>
          </div>
        </div>

        {/* Center: Word Hint & Category */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>Tema:</span>
            <span className="text-indigo-300 font-black">{config.category}</span>
          </div>

          {config.roundState === 'choosing_word' ? (
            <div className="text-sm sm:text-base font-black text-amber-300 animate-pulse">
              ⏳ Escolhendo o que desenhar...
            </div>
          ) : config.roundState === 'round_end' ? (
            <div className="text-base sm:text-xl font-black text-emerald-400">
              A palavra era: {config.secretWord.toUpperCase()} 🎉
            </div>
          ) : (
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-widest font-mono drop-shadow-md">
              {wordHintDisplay}
            </div>
          )}
        </div>

        {/* Right: Round & Timer */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Rodada {config.currentRound}</span>
            <span className="text-xs font-black text-slate-200">Meta: {config.targetScore} pts</span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-lg border shadow-lg ${
              timerRem <= 15
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}
          >
            {timerRem}
          </div>
        </div>
      </div>

      {/* Main Area: Canvas + Sidebar (Placar & Chat) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Drawing Canvas Viewer (Cols 8 on LG) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[300px] relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <DrawingViewer
            strokes={config.strokes || []}
            drawerName={drawerName}
            drawerAvatar={drawerAvatar}
            isDrawing={config.roundState === 'drawing'}
            className="w-full h-full"
          />

          {/* Overlay when round ends */}
          <AnimatePresence>
            {config.roundState === 'round_end' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-4"
              >
                <div className="text-4xl animate-bounce">🎉</div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Fim da Rodada! A palavra era:
                  </span>
                  <div className="text-2xl sm:text-4xl font-black text-amber-300 font-display">
                    {config.secretWord.toUpperCase()}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-sm w-full text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>Acertos nesta rodada:</span>
                    <span>{guessedIds.length} jogador{guessedIds.length === 1 ? '' : 'es'}</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-300">
                    <span>Pontos para o desenhista ({drawerName}):</span>
                    <span className="font-bold">
                      +{guessedIds.length * drawerPointsPerGuess} pts ({drawerPointsPerGuess} pts/acerto)
                    </span>
                  </div>
                  {hintsCount > 0 && (
                    <div className="flex justify-between items-center text-amber-300 text-[11px]">
                      <span>Dicas reveladas pelo desenhista:</span>
                      <span className="font-bold">{hintsCount} {hintsCount === 1 ? 'dica' : 'dicas'} (-{Math.min(4, hintsCount)} pts/acerto)</span>
                    </div>
                  )}
                </div>

                {onAdvanceToNextRound && (
                  <button
                    type="button"
                    onClick={onAdvanceToNextRound}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:opacity-90 text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Próxima Rodada</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Presencial Quick Controls on Telão (if presenter interacts directly) */}
          {!isDigital && config.roundState === 'drawing' && isPresenter && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">
              {onInPersonCorrect && (
                <button
                  type="button"
                  onClick={() => onInPersonCorrect()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acertaram! (+10 pts)</span>
                </button>
              )}
              {onInPersonSkip && (
                <button
                  type="button"
                  onClick={onInPersonSkip}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pular Palavra</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Ranking & Chat (Cols 4 on LG) */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full min-h-[250px] overflow-hidden">
          {/* Top of Sidebar: Mini Leaderboard */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col max-h-[45%] shrink-0 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-2 text-xs font-black text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Placar ao Vivo</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{participants.length} jog.</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {leaderboard.map((p, idx) => {
                const hasGuessed = guessedIds.includes(p.id);
                const isCurrentDrawer = p.id === config.currentDrawerId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-1.5 px-2 rounded-xl text-xs transition-colors ${
                      hasGuessed
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                        : isCurrentDrawer
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-slate-500 w-3">{idx + 1}</span>
                      <span className="text-base">{p.avatar || '👤'}</span>
                      <span className="font-bold truncate max-w-[100px]">{p.name}</span>
                      {isCurrentDrawer && <span className="text-[10px]" title="Desenhista">✏️</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasGuessed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      <span className="font-mono font-black text-white">{p.garticScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom of Sidebar: Real-time Guess Chat (Digital Mode) or Presencial Tips */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-2 text-xs font-black text-slate-300 uppercase tracking-wider">
              <span>{isDigital ? 'Palpites ao Vivo' : 'Dicas de Imagem & Ação'}</span>
              {isDigital && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>

            {isDigital ? (
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs custom-scrollbar"
              >
                {(!config.chatGuesses || config.chatGuesses.length === 0) && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-center text-[11px] p-2">
                    Os palpites dos participantes aparecerão aqui em tempo real! 💬
                  </div>
                )}

                {(config.chatGuesses || []).map((g) => {
                  if (g.isCorrect) {
                    return (
                      <div
                        key={g.id}
                        className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 animate-fadeIn"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{g.participantName} acertou a palavra! (+{g.pointsEarned || 10} pts)</span>
                      </div>
                    );
                  }

                  if (g.isClose) {
                    return (
                      <div
                        key={g.id}
                        className="p-1.5 px-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{g.participantName} está muito perto! 🔥</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={g.id}
                      className="p-1.5 px-2 rounded-xl bg-slate-950/70 border border-slate-800/60 text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="text-slate-400 font-bold">{g.participantName}:</span>
                      <span className="text-white break-all">{g.text}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-3 text-slate-300 space-y-2 text-xs">
                <div className="text-2xl animate-pulse">🗣️</div>
                <p className="font-bold text-white">Grite o palpite na sala!</p>
                <p className="text-[11px] text-slate-400">
                  O apresentador valida os acertos ou revela dicas conforme o tempo passa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
