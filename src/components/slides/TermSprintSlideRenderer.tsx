import React from 'react';
import { Slide, Participant, TermSubmission } from '../../types';
import { CountdownTimer } from '../motion/CountdownTimer';
import { Zap, Flame, Award, Hash, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TermSprintSlideRendererProps {
  slide: Slide;
  termSubmissions: TermSubmission[];
  timerRemaining: number | null;
  timerActive: boolean;
  participants: Participant[];
}

export const TermSprintSlideRenderer: React.FC<TermSprintSlideRendererProps> = ({
  slide,
  termSubmissions,
  timerRemaining,
  timerActive,
  participants
}) => {
  // Contagem de termos válidos por participante
  const participantCounts: Record<string, number> = {};
  termSubmissions.forEach((sub) => {
    if (sub.isValid) {
      participantCounts[sub.participantId] = (participantCounts[sub.participantId] || 0) + 1;
    }
  });

  // Ranking ordenado do sprint
  const sprintRanking = participants
    .map((p) => ({
      ...p,
      termCount: participantCounts[p.id] || 0
    }))
    .sort((a, b) => b.termCount - a.termCount);

  const totalValidTerms = termSubmissions.filter((t) => t.isValid).length;

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 pb-2">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Sprint de Vocabulário • Termos Únicos</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            {slide.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">{slide.subtitle}</p>
        </div>

        {slide.timeLimitSeconds && slide.timeLimitSeconds > 0 && timerRemaining !== null && (
          <div className="shrink-0">
            <CountdownTimer
              totalSeconds={slide.timeLimitSeconds}
              remainingSeconds={timerRemaining}
              isActive={timerActive}
              size="lg"
            />
          </div>
        )}
      </div>

      {/* Category Spotlight Banner */}
      <div className="my-2 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Categoria Ativa
            </div>
            <div className="text-2xl font-black text-white">
              {slide.categoryName || 'Geral'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total de Termos Válidos
            </div>
            <div className="text-2xl font-mono font-black text-emerald-400">
              {totalValidTerms}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Live Feed of Terms (Left) + Mini Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-2 h-[340px]">
        {/* Left: Waterfall Feed of Incoming Terms */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Feed de Palavras em Tempo Real
            </span>
            <span className="text-xs text-slate-500">Últimos termos aprovados</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 flex flex-col-reverse">
            {termSubmissions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                <span className="text-2xl mb-1">⌨️</span>
                Aguardando participantes digitarem...
              </div>
            ) : (
              <AnimatePresence>
                {termSubmissions.slice(-20).map((term, i) => (
                  <motion.div
                    key={`${term.participantId}-${term.term}-${term.timestamp}`}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-base text-white font-medium capitalize">{term.term}</span>
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      por {term.participantName}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right: Realtime Leaderboard of the Sprint */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              Placar da Rodada
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sprintRanking.slice(0, 8).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-750"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-xs font-mono font-bold text-slate-400">
                    {idx + 1}º
                  </span>
                  <span className="text-lg">{p.avatar}</span>
                  <span className="text-sm font-semibold text-white truncate max-w-[90px]">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-sm font-black text-emerald-400">
                    {p.termCount}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">termos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
