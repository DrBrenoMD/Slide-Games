import React, { useState, useEffect } from 'react';
import { Participant, ImpostorConfig } from '../../types';
import { Users, Shuffle, ShieldAlert, Check, X, UserPlus, Sparkles, UserCheck, Search, ShieldCheck } from 'lucide-react';

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
    impostorRatioPreset?: '1_per_2' | '1_per_3' | '1_per_4' | '1_per_5' | '1_per_6' | 'custom',
    mode?: 'classic' | 'investigator'
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
  const [mode, setMode] = useState<'classic' | 'investigator'>(
    currentConfig.mode || 'classic'
  );

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
      const currentMode = currentConfig.mode || 'classic';
      setMode(currentMode);
      const preset = currentConfig.impostorRatioPreset || '1_per_4';
      setRatioPreset(preset);

      const agentCount = currentConfig.numAgents || 4;
      setTargetAgentCount(agentCount);

      const baseTotal = currentMode === 'classic' ? Math.max(participants.length, 4) : agentCount;
      const count = currentConfig.numImpostors || calculateImpostorsForTotal(baseTotal, preset);
      setTargetImpostorCount(count);

      setSelectionMethod(currentConfig.selectionMethod || 'random');
      setSelectedAgentIds(currentConfig.agentParticipantIds || []);
      setSelectedImpostorIds(currentConfig.impostorParticipantIds || []);
    }
  }, [isOpen, currentConfig, participants.length]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'classic' | 'investigator') => {
    setMode(newMode);
    const baseTotal = newMode === 'classic' ? Math.max(participants.length, 4) : targetAgentCount;
    const computed = calculateImpostorsForTotal(baseTotal, ratioPreset);
    setTargetImpostorCount(computed);

    if (newMode === 'classic') {
      // No modo clássico, todos os que não são impostores são agentes
      const allIds = participants.map((p) => p.id);
      const validImpostors = selectedImpostorIds.filter((id) => allIds.includes(id));
      setSelectedImpostorIds(validImpostors);
      setSelectedAgentIds(allIds.filter((id) => !validImpostors.includes(id)));
    }
  };

  const handleRatioChange = (newPreset: '1_per_2' | '1_per_3' | '1_per_4' | '1_per_5' | '1_per_6' | 'custom') => {
    setRatioPreset(newPreset);
    if (newPreset !== 'custom') {
      const baseTotal = mode === 'classic' ? Math.max(participants.length, 4) : targetAgentCount;
      const computed = calculateImpostorsForTotal(baseTotal, newPreset);
      setTargetImpostorCount(computed);
    }
  };

  const handleAgentCountChange = (count: number) => {
    setTargetAgentCount(count);
    if (mode === 'investigator' && ratioPreset !== 'custom') {
      const computed = calculateImpostorsForTotal(count, ratioPreset);
      setTargetImpostorCount(computed);
    }
  };

  // Modo Clássico: Alternar se o participante é o Infiltrado ou Agente Civil
  const handleToggleClassicImpostor = (participantId: string) => {
    if (selectedImpostorIds.includes(participantId)) {
      setSelectedImpostorIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      if (selectedImpostorIds.length >= targetImpostorCount) {
        // Substitui ou adiciona conforme limite
        if (targetImpostorCount === 1) {
          setSelectedImpostorIds([participantId]);
        } else {
          setSelectedImpostorIds((prev) => [...prev.slice(1), participantId]);
        }
      } else {
        setSelectedImpostorIds((prev) => [...prev, participantId]);
      }
    }
  };

  // Modo Investigador: Alternar agente de palco
  const toggleInvestigatorAgent = (participantId: string) => {
    if (selectedAgentIds.includes(participantId)) {
      const newAgents = selectedAgentIds.filter((id) => id !== participantId);
      setSelectedAgentIds(newAgents);
      setSelectedImpostorIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      const newAgents = [...selectedAgentIds, participantId];
      setSelectedAgentIds(newAgents);
      if (selectedImpostorIds.length < targetImpostorCount) {
        setSelectedImpostorIds((prev) => [...prev, participantId]);
      }
    }
  };

  // Modo Investigador: Alternar infiltrado entre os agentes
  const toggleInvestigatorImpostor = (participantId: string) => {
    if (!selectedAgentIds.includes(participantId)) {
      setSelectedAgentIds((prev) => [...prev, participantId]);
    }
    if (selectedImpostorIds.includes(participantId)) {
      setSelectedImpostorIds((prev) => prev.filter((id) => id !== participantId));
    } else {
      if (selectedImpostorIds.length >= targetImpostorCount) {
        setSelectedImpostorIds([participantId]);
      } else {
        setSelectedImpostorIds((prev) => [...prev, participantId]);
      }
    }
  };

  // Sorteio Automático
  const handleRandomize = () => {
    if (participants.length === 0) return;

    if (mode === 'classic') {
      // Modo clássico: todos os participantes jogam
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const impCount = Math.min(targetImpostorCount, Math.max(1, participants.length - 1));
      const chosenImpostors = shuffled.slice(0, impCount).map((p) => p.id);
      const remainingAgents = participants
        .map((p) => p.id)
        .filter((id) => !chosenImpostors.includes(id));

      setSelectedImpostorIds(chosenImpostors);
      setSelectedAgentIds(remainingAgents);
    } else {
      // Modo investigador: sorteia N agentes de palco e X infiltrados entre eles
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const count = Math.min(targetAgentCount, participants.length);
      const chosenAgents = shuffled.slice(0, count).map((p) => p.id);

      setSelectedAgentIds(chosenAgents);

      if (chosenAgents.length > 0) {
        const impCount = Math.min(targetImpostorCount, chosenAgents.length);
        const shuffledAgents = [...chosenAgents].sort(() => 0.5 - Math.random());
        setSelectedImpostorIds(shuffledAgents.slice(0, impCount));
      }
    }
  };

  const handleConfirm = () => {
    let finalAgents = [...selectedAgentIds];
    let finalImpostors = [...selectedImpostorIds];

    if (mode === 'classic') {
      // Garante que todos os participantes estão incluídos (ou como agente ou como infiltrado)
      if (finalImpostors.length === 0 && participants.length > 0) {
        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        const impCount = Math.min(targetImpostorCount, Math.max(1, participants.length - 1));
        finalImpostors = shuffled.slice(0, impCount).map((p) => p.id);
      }
      finalAgents = participants
        .map((p) => p.id)
        .filter((id) => !finalImpostors.includes(id));
    } else {
      // Modo investigador
      if (finalAgents.length === 0 && participants.length > 0) {
        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        const count = Math.min(targetAgentCount, participants.length);
        finalAgents = shuffled.slice(0, count).map((p) => p.id);
      }

      if (finalImpostors.length === 0 && finalAgents.length > 0) {
        const impCount = Math.min(targetImpostorCount, finalAgents.length);
        const shuffledAgents = [...finalAgents].sort(() => 0.5 - Math.random());
        finalImpostors = shuffledAgents.slice(0, impCount);
      }
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
      mode === 'classic' ? participants.length : targetAgentCount,
      targetImpostorCount,
      selectionMethod,
      ratioNum,
      ratioPreset,
      mode
    );
    onClose();
  };

  const audienceInvestigatorsCount = mode === 'investigator'
    ? Math.max(0, participants.length - selectedAgentIds.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Configurar Modo e Papéis do Infiltrado
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o modo de jogo, a proporção de infiltrados e quem participará da rodada
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

        {/* SELETOR DE MODO DE JOGO: CLÁSSICO vs INVESTIGADOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange('classic')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              mode === 'classic'
                ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg ring-1 ring-rose-500/40'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-300">
                <Sparkles className="w-3.5 h-3.5" />
                Modo Clássico
              </span>
              {mode === 'classic' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>Todos jogam</strong> (ou são Agentes ou Infiltrados). <strong>Sem investigadores</strong>. Quantidade de jogadores gerada automaticamente.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('investigator')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              mode === 'investigator'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/40'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                <Search className="w-3.5 h-3.5" />
                Modo Investigador
              </span>
              {mode === 'investigator' && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Apresentador define <strong>Agentes no Palco</strong> e proporção de Infiltrados. Os <strong>demais são Investigadores</strong> na plateia.
            </p>
          </button>
        </div>

        {/* PARÂMETROS DO MODO SELECIONADO */}
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
              Calcula: <strong className="text-rose-300">{targetImpostorCount} infiltrado(s)</strong> {mode === 'classic' ? `para ${participants.length || 4} participantes` : `para ${targetAgentCount} agentes`}
            </span>
          </div>

          {/* Quantidade de Jogadores / Agentes */}
          {mode === 'classic' ? (
            <div>
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Total de Jogadores:
              </label>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span>{participants.length} Participantes</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400">
                  Automático
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Todos os conectados jogam (Sem investigadores)
              </span>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                Qtd. Agentes no Palco:
              </label>
              <select
                value={targetAgentCount}
                onChange={(e) => handleAgentCountChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={3}>3 Agentes</option>
                <option value={4}>4 Agentes (Padrão)</option>
                <option value={5}>5 Agentes</option>
                <option value={6}>6 Agentes</option>
                <option value={8}>8 Agentes</option>
                <option value={10}>10 Agentes</option>
              </select>
              <span className="text-[10px] text-slate-400 block mt-1">
                {audienceInvestigatorsCount} investigadores na plateia
              </span>
            </div>
          )}

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
            <span className="text-[10px] text-slate-400 block mt-1">
              {selectionMethod === 'random' ? 'Sorteado pelo sistema' : 'Definido manualmente'}
            </span>
          </div>
        </div>

        {/* Status bar & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
            <span className="text-slate-400">Distribuição:</span>
            {mode === 'classic' ? (
              <>
                <span className="px-2.5 py-1 rounded-lg border font-mono bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                  {Math.max(0, participants.length - selectedImpostorIds.length)} Agentes
                </span>
                <span className="px-2.5 py-1 rounded-lg border font-mono bg-rose-500/20 text-rose-300 border-rose-500/40">
                  {selectedImpostorIds.length} / {targetImpostorCount} Infiltrado(s)
                </span>
              </>
            ) : (
              <>
                <span className={`px-2.5 py-1 rounded-lg border font-mono ${
                  selectedAgentIds.length === targetAgentCount
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedAgentIds.length} / {targetAgentCount} no Palco
                </span>
                <span className="px-2.5 py-1 rounded-lg border font-mono bg-rose-500/20 text-rose-300 border-rose-500/40">
                  {selectedImpostorIds.length} / {targetImpostorCount} Infiltrado(s)
                </span>
                <span className="px-2.5 py-1 rounded-lg border font-mono bg-slate-800 text-slate-300 border-slate-700">
                  {audienceInvestigatorsCount} Investigador(es)
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {participants.length < (mode === 'classic' ? 3 : targetAgentCount) && onAddSimulatedParticipants && (
              <button
                type="button"
                onClick={onAddSimulatedParticipants}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Adicionar participantes virtuais para testar sozinho"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+4 Jogadores Teste</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRandomize}
              disabled={participants.length === 0}
              className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>
                {mode === 'classic'
                  ? `Sortear Infiltrado(s)`
                  : `Sortear ${targetAgentCount} Agentes`}
              </span>
            </button>
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
                if (mode === 'classic') {
                  // Modo Clássico: participante é Infiltrado ou Agente
                  const isImpostor = selectedImpostorIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleClassicImpostor(p.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isImpostor
                          ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50'
                          : 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.avatar}</span>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            {isImpostor ? (
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                Infiltrado
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                                Agente Civil
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {isImpostor ? (
                              <span className="text-rose-400 font-bold">Não sabe a palavra (Blefando)</span>
                            ) : (
                              <span className="text-indigo-300">Recebe a palavra secreta</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleClassicImpostor(p.id);
                        }}
                        title={isImpostor ? 'Tornar Agente Civil' : 'Definir como Infiltrado'}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isImpostor
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                            : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border-slate-700'
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }

                // Modo Investigador
                const isAgent = selectedAgentIds.includes(p.id);
                const isImpostor = selectedImpostorIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleInvestigatorAgent(p.id)}
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
                              Agente de Palco
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
                            <span className="text-slate-400">Investigador (Plateia)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {isAgent && (
                        <button
                          type="button"
                          onClick={() => toggleInvestigatorImpostor(p.id)}
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
            {mode === 'classic'
              ? 'Modo Clássico: Todos jogam. Clique no participante para definir o Infiltrado.'
              : selectionMethod === 'manual'
              ? 'Modo Investigador: Escolha os agentes de palco e defina o Infiltrado.'
              : 'Modo Investigador: Sorteia agentes de palco e o Infiltrado entre eles.'}
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
