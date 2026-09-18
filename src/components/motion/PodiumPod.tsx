import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, Trophy, Medal, Award, Users } from 'lucide-react';
import { Participant, Team } from '../../types';

interface PodiumPodProps {
  participants: Participant[];
  teams?: Team[];
  teamMode?: string;
  isFinal?: boolean;
}

export const PodiumPod: React.FC<PodiumPodProps> = ({
  participants,
  teams = [],
  teamMode = 'none',
  isFinal = false
}) => {
  const isTeamRanking = teamMode !== 'none' && teams.length > 0;

  // Classificação dos jogadores
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  
  // Classificação das equipes
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  useEffect(() => {
    // Disparar confetes festivos
    try {
      const count = isFinal ? 200 : 80;
      confetti({
        particleCount: count,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#38BDF8']
      });

      if (isFinal) {
        const timeout = setTimeout(() => {
          confetti({
            particleCount: 150,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 150,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 1200);
        return () => clearTimeout(timeout);
      }
    } catch {
      // ignore
    }
  }, [isFinal]);

  const top3 = isTeamRanking
    ? sortedTeams.slice(0, 3)
    : sortedParticipants.slice(0, 3);

  // Ordenação do pódio visual: [2º, 1º, 3º]
  const podiumSlots = [
    { rank: 2, item: top3[1], height: 'h-48 sm:h-56', delay: 0.3, color: 'from-slate-400 to-slate-600', border: 'border-slate-300' },
    { rank: 1, item: top3[0], height: 'h-64 sm:h-72', delay: 0.7, color: 'from-amber-400 to-amber-600', border: 'border-amber-300' },
    { rank: 3, item: top3[2], height: 'h-36 sm:h-44', delay: 0.1, color: 'from-amber-700 to-amber-900', border: 'border-amber-600' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4">
      {/* Top 3 Podium */}
      <div className="w-full flex items-end justify-center gap-3 sm:gap-6 pt-12 pb-6">
        {podiumSlots.map(({ rank, item, height, delay, color, border }) => {
          if (!item) {
            return (
              <div key={rank} className="flex-1 max-w-[180px] flex flex-col items-center opacity-40">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-500 font-mono">
                  {rank}º
                </div>
                <div className={`w-full ${height} bg-slate-900/60 rounded-t-2xl border border-slate-800 flex items-center justify-center text-slate-600 text-sm font-bold`}>
                  Vazio
                </div>
              </div>
            );
          }

          const isTeam = 'badge' in item;
          const name = isTeam ? item.name : item.name;
          const badge = isTeam ? item.badge : item.avatar;
          const score = item.score;

          return (
            <motion.div
              key={rank}
              initial={{ opacity: 0, y: 80, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 max-w-[200px] flex flex-col items-center relative"
            >
              {/* Crown for 1st place */}
              {rank === 1 && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1, type: 'spring' }}
                  className="absolute -top-10 text-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                >
                  <Crown className="w-10 h-10 fill-amber-400" />
                </motion.div>
              )}

              {/* Avatar circle */}
              <div className="relative mb-3 flex flex-col items-center">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border-2 ${border} bg-slate-800/90`}
                >
                  {badge}
                </div>
                <span className="mt-1.5 font-bold text-sm sm:text-base text-white truncate max-w-[140px] text-center">
                  {name}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {score.toLocaleString()} pts
                </span>
              </div>

              {/* Podium Column */}
              <div
                className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${color} p-3 flex flex-col items-center justify-between shadow-2xl border-t-2 border-x ${border} relative overflow-hidden`}
              >
                <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white font-black text-lg border border-white/20">
                  {rank}
                </div>
                <div className="text-white/80 font-bold text-xs uppercase tracking-wider text-center">
                  {rank === 1 ? 'Campeão' : `${rank}º Lugar`}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of the leaderboard list (4th to 8th) */}
      {sortedParticipants.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="w-full max-w-xl mt-6 bg-slate-900/80 rounded-2xl border border-slate-800 p-3 shadow-xl backdrop-blur-md"
        >
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 px-3 py-1 flex items-center justify-between">
            <span>Demais Classificados</span>
            <span className="text-slate-500">Total: {sortedParticipants.length} jogadores</span>
          </div>

          <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto pr-1">
            {sortedParticipants.slice(3, 10).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-750"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-mono text-xs font-bold text-slate-400">
                    {idx + 4}º
                  </span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                </div>
                <span className="font-mono text-sm font-bold text-indigo-300">
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
