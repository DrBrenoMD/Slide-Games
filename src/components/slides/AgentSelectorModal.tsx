import React, { useState, useEffect } from 'react';
import { Participant, ImpostorConfig } from '../../types';
import { Users, Shuffle, ShieldAlert, Check, X, UserPlus, Sparkles, Settings } from 'lucide-react';

interface AgentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentConfig: ImpostorConfig;
  onSave: (
    agents: string[],
    impostors: string[],
    numAgents?: number,
    numImpostors?: number,
    selectionMethod?: 'random' | 'manual',
    impostorRatio?: number,
    impostorRatioPreset?: '1_per_2' | '1_per_3' | '1_per_4' | '1_per_5' | '1_per_6' | 'custom'
  ) => void;
  onAddSimulatedParticipants?: () => void;
}

export const AgentSelectorModal: React.FC<AgentSelectorModalProps> = ({
  isOpen,
  onClose,
  participants,
  currentConfig,
  onSave,
  onAddSimulatedParticipants
}) => {
  const [ratioPreset, setRatioPreset] = useState<'1_per_2' | '1_per_3' | '1_per_4' | '1_per_5' | '1_per_6' | 'custom'>(
    currentConfig.impostorRatioPreset || '1_per_4'
  );
  const [targetAgentCount, setTargetAgentCount] = useState<number>(
    currentConfig.numAgents || 4
  );
  const [targetImpostorCount, setTargetImpostorCount] = useState<number>(
    currentConfig.numImpostors || 1
  );
  const [selectionMethod, setSelectionMethod] = useState<'random' | 'manual'>(
    currentConfig.selectionMethod || 'random'
  );

  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    currentConfig.agentParticipantIds || []
  );
  const [selectedImpostorIds, setSelectedImpostorIds] = useState<string[]>(
    currentConfig.impostorParticipantIds || []
  );

  // Calcular número de impostores recomendado com base na proporção e no total de participantes
  const calculateImpostorsForTotal = (total: number, preset: string): number => {
    if (total <= 1) return 1;
    let ratio = 0.25;
    if (preset === '1_per_2') ratio = 0.50;
    else if (preset === '1_per_3') ratio = 0.333;
    else if (preset === '1_per_4') ratio = 0.25;
    else if (preset === '1_per_5') ratio = 0.20;
    else if (preset === '1_per_6') ratio = 0.166;
    const count = Math.round(total * ratio);
    return Math.max(1, Math.min(count, Math.max(1, total - 1)));
  };

  useEffect(() => {
    if (isOpen) {
      const preset = currentConfig.impostorRatioPreset || '1_per_4';
      setRatioPreset(preset);
      setTargetAgentCount(currentConfig.numAgents || 4);
      
      const count = currentConfig.numImpostors || calculateImpostorsForTotal(participants.length || 4, preset);
      setTargetImpostorCount(count);

      setSelectionMethod(currentConfig.selectionMethod || 'random');
      setSelectedAgentIds(currentConfig.agentParticipantIds || []);
      setSelectedImpostorIds(currentConfig.impostorParticipantIds || []);
    }
  }, [isOpen, currentConfig, participants.length]);

  if (!isOpen) return null;

  const handleRatioChange = (newPreset: '1_per_2' | '1_per_3' | '1_per_4' | '1_per_5' | '1_per_6' | 'custom') => {
    setRatioPreset(newPreset);
    if (newPreset !== 'custom') {
      const computed = calculateImpostorsForTotal(participants.length || 4, newPreset);
      setTargetImpostorCount(computed);
    }
  };

  const toggleAgent = (participantId: string) => {
    if (selectedAgentIds.includes(participantId)) {
      // Remove agente
      const newAgents = selectedAgentIds.filter((id) => id !== participantId);
      setSelectedAgentIds(newAgents);
      // Se era o infiltrado, desmarca
      setSelectedImpostorIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      // Adiciona agente
      const newAgents = [...selectedAgentIds, participantId];
      setSelectedAgentIds(newAgents);

      // Se ainda não tem infiltrados suficientes, define este
      if (selectedImpostorIds.length < targetImpostorCount) {
        setSelectedImpostorIds((prev) => [...prev, participantId]);
      }
    }
  };

  const handleRandomizeAgents = () => {
    if (participants.length === 0) return;

    // Embaralha participantes
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const count = Math.min(targetAgentCount, participants.length);
    const chosenAgents = shuffled.slice(0, count).map((p) => p.id);

    setSelectedAgentIds(chosenAgents);

    // Sorteia N infiltrados dentre os agentes
    if (chosenAgents.length > 0) {
      const impCount = Math.min(targetImpostorCount, chosenAgents.length);
      const shuffledAgents = [...chosenAgents].sort(() => 0.5 - Math.random());
      setSelectedImpostorIds(shuffledAgents.slice(0, impCount));
    }
  };

  const handleRandomizeImpostorOnly = () => {
    if (selectedAgentIds.length === 0) return;
    const impCount = Math.min(targetImpostorCount, selectedAgentIds.length);
    const shuffledAgents = [...selectedAgentIds].sort(() => 0.5 - Math.random());
    setSelectedImpostorIds(shuffledAgents.slice(0, impCount));
  };

  const handleToggleImpostor = (participantId: string) => {
    // Garante que é um agente primeiro
    if (!selectedAgentIds.includes(participantId)) {
      setSelectedAgentIds((prev) => [...prev, participantId]);
    }

    if (selectedImpostorIds.includes(participantId)) {
      setSelectedImpostorIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      // Se atingiu o limite, substitui o primeiro ou adiciona
      if (selectedImpostorIds.length >= targetImpostorCount) {
        setSelectedImpostorIds([participantId]);
      } else {
        setSelectedImpostorIds((prev) => [...prev, participantId]);
      }
    }
  };

  const handleConfirm = () => {
    let finalAgents = [...selectedAgentIds];
    let finalImpostors = [...selectedImpostorIds];

    // Se método for sorteio automático ou se faltam agentes, sorteia agora se tiver participantes
    if (finalAgents.length === 0 && participants.length > 0) {
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const count = Math.min(targetAgentCount, participants.length);
      finalAgents = shuffled.slice(0, count).map((p) => p.id);
    }

    // Se faltam infiltrados dentre os agentes, sorteia
    if (finalImpostors.length === 0 && finalAgents.length > 0) {
      const impCount = Math.min(targetImpostorCount, finalAgents.length);
      const shuffledAgents = [...finalAgents].sort(() => 0.5 - Math.random());
      finalImpostors = shuffledAgents.slice(0, impCount);
    }

    let ratioNum = 0.25;
    if (ratioPreset === '1_per_2') ratioNum = 0.5;
    else if (ratioPreset === '1_per_3') ratioNum = 0.333;
    else if (ratioPreset === '1_per_4') ratioNum = 0.25;
    else if (ratioPreset === '1_per_5') ratioNum = 0.20;
    else if (ratioPreset === '1_per_6') ratioNum = 0.166;

    onSave(
      finalAgents,
      finalImpostors,
      targetAgentCount,
      targetImpostorCount,
      selectionMethod,
      ratioNum,
      ratioPreset
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Configurar Agentes & Infiltrados
              </h3>
              <p className="text-xs text-slate-400">
                Defina a proporção de infiltrados baseada nos jogadores, agentes e método de escolha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Parâmetros Solicitados: Proporção de Infiltrados, Número de Agentes e Forma de Escolha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          {/* Proporção de Infiltrados */}
          <div>
            <label className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
              Proporção de Infiltrados:
            </label>
            <select
              value={ratioPreset}
              onChange={(e) => handleRatioChange(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="1_per_4">1 a cada 4 jogadores (25%)</option>
              <option value="1_per_5">1 a cada 5 jogadores (20%)</option>
              <option value="1_per_3">1 a cada 3 jogadores (33%)</option>
              <option value="1_per_2">1 a cada 2 jogadores (50%)</option>
              <option value="1_per_6">1 a cada 6 jogadores (16%)</option>
              <option value="custom">Manual / Fixo ({targetImpostorCount})</option>
            </select>
            <span className="text-[10px] text-slate-400 block mt-1">
              Calcula: <strong className="text-rose-300">{targetImpostorCount} infiltrado(s)</strong> para {participants.length || 4} jogadores
            </span>
          </div>

          {/* Número de Agentes no Palco */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Qtd. Agentes no Palco:
            </label>
            <select
              value={targetAgentCount}
              onChange={(e) => setTargetAgentCount(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={3}>3 Agentes</option>
              <option value={4}>4 Agentes (Padrão)</option>
              <option value={5}>5 Agentes</option>
              <option value={6}>6 Agentes</option>
              <option value={8}>8 Agentes</option>
            </select>
          </div>

          {/* Forma de Escolha */}
          <div>
            <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              Forma de Escolha:
            </label>
            <select
              value={selectionMethod}
              onChange={(e) => setSelectionMethod(e.target.value as 'random' | 'manual')}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="random">Sorteio Automático</option>
              <option value="manual">Seleção Manual</option>
            </select>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">Status:</span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-mono ${
                selectedAgentIds.length === targetAgentCount
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {selectedAgentIds.length} / {targetAgentCount} Agentes
            </span>
            <span className="px-2.5 py-1 rounded-lg border font-mono bg-rose-500/20 text-rose-300 border-rose-500/40">
              {selectedImpostorIds.length} / {targetImpostorCount} Infiltrado(s)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {participants.length < targetAgentCount && onAddSimulatedParticipants && (
              <button
                type="button"
                onClick={onAddSimulatedParticipants}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Adicionar participantes virtuais para testar sozinho"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+{targetAgentCount} Jogadores Teste</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRandomizeAgents}
              disabled={participants.length === 0}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Sortear {targetAgentCount} Agentes</span>
            </button>

            {selectedAgentIds.length > 0 && (
              <button
                type="button"
                onClick={handleRandomizeImpostorOnly}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Sortear Infiltrado</span>
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {participants.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                Nenhum participante conectado nesta sala ainda
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Conecte seu celular com o PIN da sala ou adicione participantes de teste para jogar.
              </p>
              {onAddSimulatedParticipants && (
                <button
                  type="button"
                  onClick={onAddSimulatedParticipants}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar 4 Jogadores Virtuais Agora</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {participants.map((p) => {
                const isAgent = selectedAgentIds.includes(p.id);
                const isImpostor = selectedImpostorIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleAgent(p.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isAgent
                        ? isImpostor
                          ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50'
                          : 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-950/30'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          {isAgent && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                              Agente
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {isAgent ? (
                            isImpostor ? (
                              <span className="text-rose-400 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                Infiltrado Secreto
                              </span>
                            ) : (
                              <span className="text-indigo-300">Agente Civil (Sabe a palavra)</span>
                            )
                          ) : (
                            <span>Investigador (Plateia)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {isAgent && (
                        <button
                          type="button"
                          onClick={() => handleToggleImpostor(p.id)}
                          title={isImpostor ? 'Remover status de Infiltrado' : 'Marcar este agente como Infiltrado'}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isImpostor
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                              : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border-slate-700'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isAgent
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isAgent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            {selectionMethod === 'manual'
              ? 'Modo Manual: Escolha os agentes e clique no escudo vermelho para definir o infiltrado.'
              : 'Modo Sorteio: O sistema sorteará automaticamente na abertura da partida.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
