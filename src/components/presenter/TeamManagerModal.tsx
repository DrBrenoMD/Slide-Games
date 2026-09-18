import React, { useState } from 'react';
import { Team, Participant, TeamMode } from '../../types';
import { Users, Shuffle, UserCheck, Plus, Trash2, X, Check } from 'lucide-react';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMode: TeamMode;
  onSetTeamMode: (mode: TeamMode) => void;
  teams: Team[];
  onUpdateTeams: (teams: Team[]) => void;
  participants: Participant[];
  onUpdateParticipants: (participants: Record<string, Participant>) => void;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  teamMode,
  onSetTeamMode,
  teams,
  onUpdateTeams,
  participants,
  onUpdateParticipants
}) => {
  if (!isOpen) return null;

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamBadge, setNewTeamBadge] = useState('⚡');
  const [newTeamColor, setNewTeamColor] = useState('#3B82F6');

  // Sorteio proporcional automático entre as equipes
  const handleRandomDistribution = () => {
    if (teams.length === 0 || participants.length === 0) return;

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const updatedMap: Record<string, Participant> = {};

    shuffled.forEach((p, idx) => {
      const assignedTeam = teams[idx % teams.length];
      updatedMap[p.id] = {
        ...p,
        teamId: assignedTeam.id
      };
    });

    onUpdateParticipants(updatedMap);
  };

  // Alocação manual de um participante
  const handleManualAssign = (participantId: string, teamId: string) => {
    const p = participants.find((item) => item.id === participantId);
    if (!p) return;

    onUpdateParticipants({
      ...participants.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}),
      [participantId]: { ...p, teamId: teamId || undefined }
    });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      color: newTeamColor,
      badge: newTeamBadge,
      score: 0
    };
    onUpdateTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const handleDeleteTeam = (id: string) => {
    onUpdateTeams(teams.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Gerenciador de Equipes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Modo de Distribuição dos Participantes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Sem Times', desc: 'Competição Individual' },
              { id: 'choose', label: 'Livre Escolha', desc: 'Participante escolhe' },
              { id: 'random', label: 'Sorteio Proporcional', desc: 'Divisão automática' },
              { id: 'manual', label: 'Alocação Manual', desc: 'Apresentador define' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSetTeamMode(mode.id as TeamMode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  teamMode === mode.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold">{mode.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {teamMode !== 'none' && (
          <>
            {/* Quick Sorteio Action */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Shuffle className="w-4 h-4 text-indigo-400" />
                  Sortear Participantes Proporcionalmente
                </div>
                <div className="text-xs text-slate-400">
                  Distribui os {participants.length} participantes igualmente entre as {teams.length} equipes.
                </div>
              </div>
              <button
                onClick={handleRandomDistribution}
                disabled={teams.length === 0 || participants.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow cursor-pointer"
              >
                Sortear Agora
              </button>
            </div>

            {/* Teams List */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Equipes Criadas ({teams.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teams.map((t) => {
                  const memberCount = participants.filter((p) => p.teamId === t.id).length;
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border flex items-center justify-between"
                      style={{ backgroundColor: `${t.color}15`, borderColor: `${t.color}40` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{t.badge}</span>
                        <div>
                          <span className="text-sm font-bold text-white block">{t.name}</span>
                          <span className="text-xs text-slate-400">{memberCount} membros • {t.score} pts</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTeam(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remover equipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Team */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Nome da nova equipe..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  title="Emoji do time"
                  value={newTeamBadge}
                  onChange={(e) => setNewTeamBadge(e.target.value)}
                  className="w-12 text-center py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm"
                />
                <input
                  type="color"
                  value={newTeamColor}
                  onChange={(e) => setNewTeamColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <button
                  onClick={handleAddTeam}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>

            {/* Manual Assignment Section if teamMode === 'manual' */}
            {teamMode === 'manual' && (
              <div className="space-y-3 pt-2">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Alocação Manual por Participante
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.avatar}</span>
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                      <select
                        value={p.teamId || ''}
                        onChange={(e) => handleManualAssign(p.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="">Sem Equipe</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.badge} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
