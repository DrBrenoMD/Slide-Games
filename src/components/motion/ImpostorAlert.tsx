import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Eye, ShieldAlert, Sparkles, Skull, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImpostorParticipantCardProps {
  isImpostor: boolean;
  secretWord: string;
  category: string;
  isAgent?: boolean;
  isInvestigator?: boolean;
  revealWordToInvestigators?: boolean;
  hasBeenAssigned?: boolean;
}

export const ImpostorParticipantCard: React.FC<ImpostorParticipantCardProps> = ({
  isImpostor,
  secretWord,
  category,
  isAgent = false,
  isInvestigator = false,
  revealWordToInvestigators = false,
  hasBeenAssigned = true
}) => {
  // Se deve mostrar a palavra secreta para este participante
  const shouldSeeWord = !isImpostor && (!isInvestigator || revealWordToInvestigators);
  // Por padrão visível para que o participante nunca fique sem saber
  const [showSecret, setShowSecret] = useState<boolean>(true);

  // Se os papéis ainda não foram definidos nesta rodada
  if (!hasBeenAssigned) {
    return (
      <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center">
        <div className="w-full rounded-3xl p-6 bg-slate-900 border-2 border-amber-500/40 text-center shadow-xl space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl animate-pulse">
            🎲
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 block">
            Aguardando Início da Rodada
          </span>
          <h3 className="text-lg font-black text-white">
            Sorteando Agentes & Infiltrados...
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            O apresentador está preparando a rodada. Assim que o sorteio ocorrer, sua função secreta e palavra aparecerão aqui na sua tela!
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
                🚨 SUA FUNÇÃO: O INFILTRADO 🚨
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                VOCÊ NÃO SABE A PALAVRA!
              </h3>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/30 text-left text-xs text-rose-200/90 leading-relaxed space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <span>🎯 Sua Missão:</span>
                </div>
                <p>
                  Ouça com muita atenção as dicas dos outros jogadores. Invente pistas ambíguas que pareçam que você sabe o tema, e não deixe ninguém desconfiar de você!
                </p>
              </div>
            </div>
          )}

          {!isImpostor && isAgent && (
            <div className="space-y-2 w-full">
              <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🕵️ SUA FUNÇÃO: AGENTE NO PALCO
              </div>
              <p className="text-xs text-slate-300">
                Você está no palco dos agentes! Sua palavra secreta é:
              </p>

              {/* Box da Palavra Secreta */}
              <div className="my-2 p-3.5 rounded-2xl bg-black/50 border-2 border-amber-400/50 flex flex-col items-center justify-center">
                {showSecret ? (
                  <span className="text-3xl font-black text-amber-300 font-mono tracking-wider break-all">
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

              <p className="text-[11px] text-amber-200/80 leading-tight">
                Diga uma pista inteligente ao falar. Não seja óbvio demais para não entregar a palavra ao infiltrado!
              </p>
            </div>
          )}

          {!isImpostor && isInvestigator && (
            <div className="space-y-2.5 w-full">
              <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🔍 SUA FUNÇÃO: INVESTIGADOR (PLATEIA)
              </div>

              {revealWordToInvestigators ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    <span>✓ Palavra Revelada pelo Apresentador!</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-400/60 flex flex-col items-center justify-center">
                    <span className="text-xs text-emerald-200/80 block mb-0.5 font-bold">
                      Palavra Secreta desta Rodada:
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
                    Você sabe a palavra! Ouça atentamente os agentes no palco e descubra quem está dando pistas vagas ou blefando!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    Descubra quem é o Infiltrado!
                  </h4>
                  <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 text-xs text-purple-200/80 leading-relaxed">
                    A palavra secreta está oculta para a plateia. Ouça as pistas de cada agente no palco para deduzir o infiltrado. Quando a votação for aberta, vote no suspeito!
                  </div>
                </div>
              )}
            </div>
          )}

          {!isImpostor && !isAgent && !isInvestigator && (
            <div className="space-y-2 w-full">
              <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full font-black text-xs uppercase tracking-wider">
                🛡️ SUA FUNÇÃO: CIVIL INOCENTE
              </div>
              <p className="text-xs text-slate-300">
                Sua Palavra Secreta desta Rodada:
              </p>

              {/* Box da Palavra Secreta */}
              <div className="my-2 p-3.5 rounded-2xl bg-black/50 border-2 border-indigo-400/50 flex flex-col items-center justify-center">
                {showSecret ? (
                  <span className="text-3xl font-black text-white font-mono tracking-wider break-all">
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

              <p className="text-[11px] text-indigo-200/80 leading-tight">
                Diga uma palavra relacionada sem ser óbvio demais, para o Infiltrado não descobrir!
              </p>
            </div>
          )}
        </div>
      </div>
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
              Quem é o Infiltrado?
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Votação encerrada! Apurando os votos da sala...
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
              O Infiltrado Revelado
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
                  Vitória do Infiltrado!
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  O Infiltrado conseguiu se camuflar perfeitamente e enganou a todos sem ser eliminado!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">
                  {winner === 'agents' ? 'Vitória dos Investigadores!' : 'Vitória dos Civis!'}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  O Infiltrado foi desmascarado com sucesso através da dedução das pistas!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
