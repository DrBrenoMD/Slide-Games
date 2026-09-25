import React, { useState, useEffect, useRef } from 'react';
import { Participant, Slide, GarticConfig, GarticStroke } from '../../types';
import { DrawingCanvas } from '../common/DrawingCanvas';
import { DrawingViewer } from '../common/DrawingViewer';
import { generateWordHint, evaluateGuess, getNextHintIndex } from '../../data/garticPresets';
import {
  Paintbrush,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  Check,
  Lightbulb,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GarticParticipantCardProps {
  slide: Slide;
  participant: Participant;
  allParticipants: Participant[];
  onDrawStroke: (stroke: GarticStroke) => void;
  onClearCanvas: () => void;
  onUndoCanvas: () => void;
  onSubmitGuess: (guessText: string) => void;
  onChooseWord: (word: string) => void;
  onRevealHint?: () => void;
  onStartGarticGame?: () => void;
}

export const GarticParticipantCard: React.FC<GarticParticipantCardProps> = ({
  slide,
  participant,
  allParticipants,
  onDrawStroke,
  onClearCanvas,
  onUndoCanvas,
  onSubmitGuess,
  onChooseWord,
  onRevealHint,
  onStartGarticGame
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
    scores: {},
    revealedLetterIndices: [],
    hintsRevealedCount: 0
  };

  const isDigital = config.mode === 'digital';

  // Identificação robusta do desenhista (por ID, por Nome ou fallback de participante)
  const myId = participant.id;
  const myNameLower = (participant.name || '').trim().toLowerCase();
  const drawerId = config.currentDrawerId;
  const drawerNameLower = (config.currentDrawerName || '').trim().toLowerCase();

  let isDrawer = false;
  if (drawerId && drawerId === myId) {
    isDrawer = true;
  } else if (drawerNameLower && myNameLower && drawerNameLower === myNameLower) {
    isDrawer = true;
  } else if (drawerId) {
    const matchedDrawer = allParticipants.find((p) => p.id === drawerId);
    if (matchedDrawer && matchedDrawer.name.trim().toLowerCase() === myNameLower) {
      isDrawer = true;
    }
  }

  const hasGuessed = (config.guessedParticipantIds || []).includes(participant.id);
  const [guessInput, setGuessInput] = useState('');
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [hintNotification, setHintNotification] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const prevHintsCountRef = useRef<number>(config.hintsRevealedCount || 0);

  // Drawer info
  const drawer = allParticipants.find((p) => p.id === config.currentDrawerId);
  const drawerName = drawer?.name || config.currentDrawerName || 'Artista';
  const drawerAvatar = drawer?.avatar || config.currentDrawerAvatar || '🎨';

  // Dica com underscores e letras reveladas pelo desenhista
  const timeLimit = config.roundTimeSeconds || 80;
  const timerRem = config.timerRemaining !== undefined ? config.timerRemaining : timeLimit;
  const timeRatioPassed = Math.max(0, Math.min(1, 1 - timerRem / timeLimit));
  const revealedIndices = config.revealedLetterIndices || [];

  const wordHint = config.secretWord
    ? generateWordHint(
        config.secretWord,
        revealedIndices.length > 0 ? revealedIndices : isDigital ? timeRatioPassed : 0
      )
    : '_ _ _ _ _';

  // Notificação visual para os adivinhadores quando o desenhista revela uma letra
  useEffect(() => {
    const currentCount = config.hintsRevealedCount || 0;
    if (currentCount > prevHintsCountRef.current && !isDrawer) {
      setHintNotification('💡 O artista liberou uma nova letra na dica!');
      const timer = setTimeout(() => setHintNotification(null), 3000);
      prevHintsCountRef.current = currentCount;
      return () => clearTimeout(timer);
    }
    prevHintsCountRef.current = currentCount;
  }, [config.hintsRevealedCount, isDrawer]);

  // Cálculo de pontuação do desenhista com penalidade de dicas reveladas
  // Base = 5 pontos por acerto. Cada dica revelada diminui 1 ponto (Mínimo: 1 ponto).
  const hintsCount = config.hintsRevealedCount || 0;
  const drawerPointsPerGuess = Math.max(1, 5 - hintsCount);
  const nextDrawerPoints = Math.max(1, drawerPointsPerGuess - 1);

  // Verifica se ainda há letras disponíveis para o desenhista revelar
  const nextHintIdx = config.secretWord ? getNextHintIndex(config.secretWord, revealedIndices) : null;
  const canRevealMoreHints = nextHintIdx !== null && config.roundState === 'drawing';

  // Auto scroll do chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [config.chatGuesses]);

  // Envio de palpite
  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guessInput.trim();
    if (!text || isDrawer || hasGuessed) return;

    // Avalia localmente se está perto ou acertou
    const evalResult = evaluateGuess(text, config.secretWord);
    if (evalResult.isClose) {
      setLocalFeedback('Muito perto! Quase lá... 🔥');
      setTimeout(() => setLocalFeedback(null), 2000);
    }

    onSubmitGuess(text);
    setGuessInput('');
  };

  // 1. Lobby / Aguardando início
  if (!config.gameStarted || config.roundState === 'lobby') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl animate-pulse">
          🎨
        </div>
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
            {isDigital ? 'Gartic Digital' : 'Imagem & Ação Presencial'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {slide.title || 'Jogo de Desenho'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xs">
            {isDigital
              ? 'Fique atento! Quando começar, alguém desenhará e você tentará adivinhar digitando o mais rápido possível.'
              : 'Alguém será sorteado para desenhar e a sala gritará a resposta!'}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 w-full max-w-xs space-y-1">
          <div className="text-amber-300 font-bold">Tema: {config.category}</div>
          <div className="text-slate-400 text-[11px]">Meta de Vitória: {config.targetScore} pontos</div>
        </div>

        {onStartGarticGame && (
          <button
            type="button"
            onClick={onStartGarticGame}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Jogo de Desenho</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Fim de Jogo
  if (config.roundState === 'game_over') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="text-5xl animate-bounce">🏆</div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase text-amber-400">Partida Finalizada</span>
          <h2 className="text-2xl font-black text-white">
            {config.winnerName ? `${config.winnerName} Venceu!` : 'Temos um Campeão!'}
          </h2>
          <p className="text-xs text-slate-300">
            Atingiu a pontuação máxima de {config.targetScore} pontos!
          </p>
        </div>
      </div>
    );
  }

  // 3. Escolha de palavra (Se for o desenhista)
  if (config.roundState === 'choosing_word') {
    if (isDrawer) {
      const choices = config.wordChoices || ['Elefante', 'Bicicleta', 'Pizza'];
      return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Sua vez de ser o artista!
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Escolha uma palavra para desenhar:
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5 w-full max-w-xs">
            {choices.map((w, idx) => (
              <button
                key={w + idx}
                type="button"
                onClick={() => onChooseWord(w)}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-indigo-900/50 hover:to-indigo-800/50 border border-slate-700 hover:border-indigo-500 text-white font-black text-base shadow-xl flex items-center justify-between cursor-pointer transition-transform active:scale-95"
              >
                <span>{w}</span>
                <Paintbrush className="w-4 h-4 text-amber-400" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-3xl animate-pulse">
          {drawerAvatar}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">{drawerName} está escolhendo...</h3>
          <p className="text-xs text-slate-400">Aguarde o tema ser escolhido para começar a desenhar!</p>
        </div>
      </div>
    );
  }

  // 4. Rodada Ativa: Desenhista
  if (isDrawer) {
    return (
      <div className="w-full h-full flex flex-col justify-between p-2 space-y-2 select-none overflow-hidden">
        {/* Secret Word Header Banner com Controles de Dica e Pontuação */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-2.5 sm:p-3 rounded-2xl text-white shadow-xl flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
                Você é o Artista! Desenhe:
              </span>
              <div className="text-lg sm:text-2xl font-black truncate uppercase font-display tracking-tight text-white drop-shadow">
                {config.secretWord || 'PALAVRA SECRETA'}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-2.5 py-1 rounded-xl bg-black/30 backdrop-blur-sm text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{config.guessedParticipantIds?.length || 0} acertaram</span>
              </div>

              <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center font-mono font-black text-sm">
                {timerRem}
              </div>
            </div>
          </div>

          {/* Dica da Palavra & Painel de Revelação com Penalidade de Pontos */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                Telão vê:
              </span>
              <span className="font-mono font-black text-sm tracking-widest text-amber-300">
                {wordHint}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                <span>Ganho:</span>
                <span className="text-amber-300 font-black font-mono">+{drawerPointsPerGuess} pts/acerto</span>
              </div>

              {onRevealHint && (
                <button
                  type="button"
                  onClick={onRevealHint}
                  disabled={!canRevealMoreHints}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                    canRevealMoreHints
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95 ring-2 ring-amber-300/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Revelar 1 letra no telão (diminui 1 ponto ganho por acerto)"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-slate-950" />
                  <span>
                    {canRevealMoreHints
                      ? `Revelar Letra (${drawerPointsPerGuess} → ${nextDrawerPoints} pts)`
                      : 'Dicas Esgotadas'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Full Drawing Canvas */}
        <div className="flex-1 w-full min-h-[300px] overflow-hidden rounded-2xl shadow-xl">
          <DrawingCanvas
            strokes={config.strokes || []}
            onStrokeComplete={onDrawStroke}
            onClearCanvas={onClearCanvas}
            onUndoStroke={onUndoCanvas}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // 5. Rodada Ativa: Adivinhador
  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-2 select-none overflow-hidden">
      {/* Top Status Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between gap-2 shrink-0 shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-base shrink-0 shadow-md">
            {drawerAvatar}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{drawerName} desenhando</span>
            <div className="text-sm font-black text-white truncate">{config.category}</div>
          </div>
        </div>

        {/* Word Hint */}
        <div className="text-center px-1">
          <div className="text-xs sm:text-base font-black text-amber-300 font-mono tracking-widest">
            {wordHint}
          </div>
        </div>

        {/* Timer */}
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0">
          {timerRem}
        </div>
      </div>

      {/* Alerta de Dica Revelada pelo Desenhista */}
      {hintNotification && (
        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black text-center flex items-center justify-center gap-1.5 animate-bounce">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>{hintNotification}</span>
        </div>
      )}

      {/* Mirrored Drawing Viewer */}
      <div className="flex-1 w-full min-h-[200px] max-h-[45vh] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <DrawingViewer
          strokes={config.strokes || []}
          drawerName={drawerName}
          drawerAvatar={drawerAvatar}
          isDrawing={config.roundState === 'drawing'}
        />
      </div>

      {/* Interaction Area (Digital Guesses or In-Person instructions) */}
      <div className="shrink-0 space-y-2">
        {hasGuessed ? (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Você acertou a palavra! Aguarde o fim da rodada.</span>
          </div>
        ) : isDigital ? (
          <form onSubmit={handleSendGuess} className="flex gap-2">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Digite o que é o desenho..."
              className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!guessInput.trim()}
              className="px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center gap-1 shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-300">
            <span>Grite sua resposta na sala física! 🗣️</span>
          </div>
        )}

        {localFeedback && (
          <div className="text-[11px] text-amber-300 font-bold text-center animate-pulse">
            {localFeedback}
          </div>
        )}

        {/* Mini Chat History */}
        {isDigital && (
          <div
            ref={chatRef}
            className="h-20 overflow-y-auto bg-slate-950/80 rounded-xl p-2 text-[11px] space-y-1 border border-slate-800/80 custom-scrollbar"
          >
            {(!config.chatGuesses || config.chatGuesses.length === 0) && (
              <span className="text-slate-600 block text-center">Nenhum palpite enviado ainda...</span>
            )}
            {(config.chatGuesses || []).slice(-8).map((g) => (
              <div key={g.id} className="flex items-center gap-1 text-slate-300 truncate">
                {g.isCorrect ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {g.participantName} acertou!
                  </span>
                ) : g.isClose ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {g.participantName} está muito perto!
                  </span>
                ) : (
                  <>
                    <span className="text-slate-500 font-bold">{g.participantName}:</span>
                    <span className="text-white">{g.text}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

