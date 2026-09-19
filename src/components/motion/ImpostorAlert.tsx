import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Eye, ShieldAlert, Sparkles, Skull, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImpostorParticipantCardProps {
  isImpostor: boolean;
  secretWord: string;
  category: string;
  isAgent?: boolean;
  isInvestigator?: boolean;
  revealWordToInvestigators?: boolean;
  hasBeenAssigned?: boolean;
  isEliminated?: boolean;
}

export const ImpostorParticipantCard: React.FC<ImpostorParticipantCardProps> = ({
  isImpostor,
  secretWord,
  category,
  isAgent = false,
  isInvestigator = false,
  revealWordToInvestigators = false,
  hasBeenAssigned = true,
  isEliminated = false
}) => {
  // Por padrão visível para que o participante nunca fique sem saber
  const [showSecret, setShowSecret] = useState<boolean>(true);

  // Se foi eliminado da partida pela votação
  if (isEliminated) {
    return (
      <div className="w-full max-w-sm mx-auto p-2 flex flex-col items-center">
        <div className="w-full rounded-3xl p-6 bg-slate-900/95 border-2 border-rose-600/80 text-center shadow-2xl space-y-3 relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
            💀
          </div>
          <span className="px-3 py-1 bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-full font-black text-xs uppercase tracking-widest inline-block">
            VOCÊ FOI ELIMINADO!
          </span>
          <h3 className="text-xl font-black text-white">
            {isImpostor ? 'Você era o Infiltrado!' : 'Você era um Inocente!'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A maioria dos jogadores votou em você nesta rodada. Você agora está no modo espectador e pode acompanhar os próximos desdobramentos na tela!
          </p>
          <div className="p-3 rounded-2xl bg-black/50 border border-slate-800 text-xs text-slate-400">
            Palavra Secreta da Partida: <span className="font-bold text-amber-300 font-mono">{secretWord}</span>
          </div>
        </div>
      </div>
    );
  }

  // Se os papéis ainda não foram definidos nesta rodada
  if (!hasBeenAssigned) {
    return (
      <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center">
        <div className="w-full rounded-3xl p-6 bg-slate-900/90 border border-slate-700 text-center shadow-xl space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl">
            🕵️
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-400 block">
            Aguardando Início da Partida
          </span>
          <h3 className="text-lg font-black text-white">
            Tema: {category}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            O apresentador irá iniciar a rodada. Sua identidade secreta e instruções serão exibidas automaticamente aqui na sua tela.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto p-2 flex flex-col items-center">
      {/* Category header */}
      <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
        Tema: <span className="text-indigo-400 font-bold">{category}</span>
      </div>

      <div
        className={`w-full rounded-3xl p-6 border-2 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isImpostor
            ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 border-rose-500/80 shadow-rose-950/60'
            : isInvestigator
              ? revealWordToInvestigators
                ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/80 shadow-emerald-950/60'
                : 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-900 border-purple-500/70 shadow-purple-950/60'
              : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-indigo-500/80 shadow-indigo-950/60'
        }`}
      >
        {/* Glow ambient */}
        <div
          className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none ${
            isImpostor ? 'bg-rose-500' : isInvestigator && revealWordToInvestigators ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
        />

        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          {/* Role badge icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 shadow-inner">
            {isImpostor ? (
              <ShieldAlert className="w-9 h-9 text-rose-400 animate-pulse" />
            ) : isInvestigator ? (
              <Eye className={`w-9 h-9 ${revealWordToInvestigators ? 'text-emerald-400' : 'text-purple-400'}`} />
            ) : (
              <Eye className="w-9 h-9 text-indigo-400" />
            )}
          </div>

          {/* RÓTULO DA FUNÇÃO - EM DESTAQUE ABSOLUTO */}
          {isImpostor && (
            <div className="space-y-2 w-full">
              <div className="inline-block px-3 py-1 bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">
                🚨 AGENTE INFILTRADO 🚨
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                VOCÊ NÃO SABE A PALAVRA!
              </h3>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/30 text-left text-xs text-rose-200/90 leading-relaxed space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <span>🎯 Sua Missão de Agente Infiltrado:</span>
                </div>
                <p>
                  Você joga ativamente dizendo 1 termo para associação na sua vez. Preste muita atenção nas dicas dos Agentes Aliados, invente pistas ambíguas e não seja descoberto!
                </p>
              </div>
            </div>
          )}

          {!isImpostor && isAgent && (
            <div className="space-y-2 w-full">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🛡️ SUA FUNÇÃO: AGENTE ALIADO
              </div>
              <p className="text-xs text-slate-300">
                Você recebeu o código secreto! Diga 1 termo para associação na sua vez:
              </p>

              {/* Box da Palavra Secreta */}
              <div className="my-2 p-3.5 rounded-2xl bg-black/50 border-2 border-emerald-400/50 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Código / Palavra Secreta:</span>
                {showSecret ? (
                  <span className="text-3xl font-black text-emerald-300 font-mono tracking-wider break-all">
                    {secretWord}
                  </span>
                ) : (
                  <span className="text-3xl font-black text-slate-500 font-mono tracking-widest">
                    ••••••••
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="mt-2 text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {showSecret ? '👁️ Ocultar palavra' : '👁️ Mostrar palavra'}
                </button>
              </div>

              <p className="text-[11px] text-emerald-200/80 leading-tight">
                Diga uma pista inteligente ao falar. Não seja óbvio demais para não entregar o código secreto ao Agente Infiltrado!
              </p>
            </div>
          )}

          {!isImpostor && isInvestigator && (
            <div className="space-y-2.5 w-full">
              <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🔍 SUA FUNÇÃO: INVESTIGADOR
              </div>

              {revealWordToInvestigators ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    <span>✓ Código Revelado aos Investigadores</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-400/60 flex flex-col items-center justify-center">
                    <span className="text-xs text-emerald-200/80 block mb-0.5 font-bold">
                      Código Secreto:
                    </span>
                    {showSecret ? (
                      <span className="text-3xl font-black text-emerald-300 font-mono tracking-wider break-all">
                        {secretWord}
                      </span>
                    ) : (
                      <span className="text-3xl font-black text-slate-500 font-mono tracking-widest">
                        ••••••••
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
                    >
                      {showSecret ? '👁️ Ocultar palavra' : '👁️ Mostrar palavra'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Você é um Investigador! Você não fala termos, apenas ouve os Agentes no palco e vota em quem é o Agente Infiltrado!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    Investigue os Agentes no Palco!
                  </h4>
                  <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 text-xs text-purple-200/80 leading-relaxed">
                    Como Investigador, você não fala ativamente. Ouça as pistas de cada Agente no palco. Quando a votação for aberta, vote no Agente que você suspeita ser o Infiltrado!
                  </div>
                </div>
              )}
            </div>
          )}

          {!isImpostor && !isAgent && !isInvestigator && (
            <div className="space-y-2 w-full">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🛡️ SUA FUNÇÃO: AGENTE ALIADO
              </div>
              <p className="text-xs text-slate-300">
                Você recebeu o código secreto da partida:
              </p>

              {/* Box da Palavra Secreta */}
              <div className="my-2 p-3.5 rounded-2xl bg-black/50 border-2 border-emerald-400/50 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Código Secreto:</span>
                {showSecret ? (
                  <span className="text-3xl font-black text-emerald-300 font-mono tracking-wider break-all">
                    {secretWord}
                  </span>
                ) : (
                  <span className="text-3xl font-black text-slate-500 font-mono tracking-widest">
                    ••••••••
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="mt-2 text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {showSecret ? '👁️ Ocultar palavra' : '👁️ Mostrar palavra'}
                </button>
              </div>

              <p className="text-[11px] text-emerald-200/80 leading-tight">
                Diga uma palavra relacionada ao código na sua vez sem entregar o jogo ao Agente Infiltrado!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ImpostorRoundEliminationRevealProps {
  eliminatedName: string;
  eliminatedAvatar?: string;
  votesReceived: number;
  wasImpostor: boolean;
  roundNumber: number;
  roundsTotal: number;
  remainingImpostorsCount: number;
  totalImpostorsCount: number;
  isGameOver: boolean;
  winner?: 'impostors' | 'civilians' | 'agents';
  onNextRound?: () => void;
  onNewMatch?: () => void;
  isPresenter?: boolean;
}

export const ImpostorRoundEliminationReveal: React.FC<ImpostorRoundEliminationRevealProps> = ({
  eliminatedName,
  eliminatedAvatar = '👤',
  votesReceived,
  wasImpostor,
  roundNumber,
  roundsTotal,
  remainingImpostorsCount,
  totalImpostorsCount,
  isGameOver,
  winner,
  onNextRound,
  onNewMatch,
  isPresenter = false
}) => {
  const [phase, setPhase] = useState<'voting_summary' | 'elimination' | 'role_reveal'>('voting_summary');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('elimination'), 1600);
    const t2 = setTimeout(() => {
      setPhase('role_reveal');
      if (wasImpostor) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [wasImpostor]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === 'voting_summary' && (
          <motion.div
            key="voting_summary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-3xl animate-pulse">
              🗳️
            </div>
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
              Apuração da Rodada {roundNumber} de {roundsTotal}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              A Votação Foi Encerrada!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              Contabilizando a escolha de todos os participantes...
            </p>
          </motion.div>
        )}

        {phase === 'elimination' && (
          <motion.div
            key="elimination"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-widest text-rose-400 font-black block">
              Jogador Mais Votado da Sala
            </span>
            <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-rose-500/60 shadow-2xl max-w-md mx-auto space-y-3">
              <span className="text-6xl block">{eliminatedAvatar}</span>
              <h3 className="text-3xl font-black text-white">{eliminatedName}</h3>
              <div className="inline-block px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
                Recebeu {votesReceived} {votesReceived === 1 ? 'voto' : 'votos'}
              </div>
              <div className="pt-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider animate-pulse">
                💀 Eliminado da Partida!
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'role_reveal' && (
          <motion.div
            key="role_reveal"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="space-y-6 max-w-xl mx-auto w-full"
          >
            <div
              className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-4 ${
                wasImpostor
                  ? 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-rose-950/80 ring-2 ring-rose-500/40'
                  : 'bg-indigo-950/70 border-indigo-500 text-indigo-100 shadow-indigo-950/80 ring-2 ring-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl">{eliminatedAvatar}</span>
                <span className="text-2xl font-black text-white">{eliminatedName}</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-300 block">
                  A Revelação da Verdadeira Identidade:
                </span>
                <div
                  className={`text-3xl sm:text-5xl font-black tracking-tight ${
                    wasImpostor ? 'text-rose-400 animate-pulse' : 'text-emerald-300'
                  }`}
                >
                  {wasImpostor ? '🚨 AGENTE INFILTRADO ELIMINADO! 🚨' : '🛡️ AGENTE ALIADO ELIMINADO! 🛡️'}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {wasImpostor
                  ? 'A dedução do grupo foi certeira! Um Agente Infiltrado foi descoberto e eliminado.'
                  : 'Atenção! Um Agente Aliado foi eliminado por engano! O(s) Agente(s) Infiltrado(s) continuam no jogo.'}
              </p>

              {/* Status do Jogo Atual */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Infiltrados Restantes
                  </span>
                  <span className="text-lg font-black text-rose-300 font-mono">
                    {remainingImpostorsCount} de {totalImpostorsCount}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Rodada
                  </span>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    {roundNumber} de {roundsTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações do Apresentador ou Aviso para Jogadores */}
            {isPresenter ? (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!isGameOver && onNextRound && (
                  <button
                    onClick={onNextRound}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Seguir para a Rodada {roundNumber + 1} de {roundsTotal}</span>
                  </button>
                )}

                {onNewMatch && (
                  <button
                    onClick={onNewMatch}
                    className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Iniciar Nova Partida</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 animate-pulse">
                {isGameOver
                  ? 'Fim de jogo! Verifique o resultado final no telão.'
                  : `Aguarde o apresentador avançar para a Rodada ${roundNumber + 1}...`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ImpostorStageRevealProps {
  impostorNames: string[];
  winner: 'impostors' | 'civilians' | 'agents';
  secretWord: string;
  category: string;
}

export const ImpostorStageReveal: React.FC<ImpostorStageRevealProps> = ({
  impostorNames,
  winner,
  secretWord,
  category
}) => {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'result'>('intro');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 2200);
    const t2 = setTimeout(() => {
      setPhase('result');
      if (winner === 'civilians' || winner === 'agents') {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      }
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [winner]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
              Fim de Jogo!
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Apurando o resultado final da partida...
            </p>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
            className="space-y-5"
          >
            <span className="text-sm uppercase tracking-widest text-rose-400 font-black">
              {impostorNames.length > 1 ? 'Os Infiltrados Eram:' : 'O Infiltrado Era:'}
            </span>
            <div className="space-y-2">
              {impostorNames.map((name, i) => (
                <div
                  key={i}
                  className="text-4xl sm:text-7xl font-black text-rose-400 font-display tracking-tight filter drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                >
                  {name}
                </div>
              ))}
            </div>
            <div className="text-slate-300 text-sm">
              Palavra secreta da categoria <span className="font-bold text-white">"{category}"</span> era:{' '}
              <span className="text-indigo-400 font-mono font-bold text-lg">{secretWord}</span>
            </div>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="max-w-xl p-8 rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 shadow-2xl backdrop-blur-xl"
          >
            {winner === 'impostors' ? (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Skull className="w-10 h-10" />
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-rose-400">
                  Vitória dos Infiltrados!
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  As rodadas limite acabaram e os Infiltrados conseguiram sobreviver sem que todos fossem descobertos!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">
                  {winner === 'agents' ? 'Vitória dos Investigadores!' : 'Vitória dos Agentes e Civis!'}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Todos os Infiltrados foram descobertos e eliminados com sucesso!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
