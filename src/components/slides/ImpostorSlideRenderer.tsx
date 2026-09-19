import React from 'react';
import { Slide, Participant, ImpostorConfig } from '../../types';
import { ImpostorStageReveal, ImpostorRoundEliminationReveal } from '../motion/ImpostorAlert';
import {
  ShieldAlert,
  Users,
  Vote,
  Sparkles,
  RefreshCw,
  Tv,
  CheckCircle,
  HelpCircle,
  Clock,
  Skull
} from 'lucide-react';
import { motion } from 'motion/react';

interface ImpostorSlideRendererProps {
  slide: Slide;
  participants: Participant[];
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartVoting: () => void;
  onRevealImpostor: () => void;
  onResetGame: () => void;
  onAdvanceToNextRound?: (changeWord?: boolean) => void;
  onStartNewMatch?: () => void;
  onStartImpostorGame?: () => void;
  onAddSimulatedParticipants?: () => void;
  isPresenter?: boolean;
}

export const ImpostorSlideRenderer: React.FC<ImpostorSlideRendererProps> = ({
  slide,
  participants,
  onResetGame,
  onAdvanceToNextRound,
  onStartNewMatch,
  onStartImpostorGame,
  isPresenter = false
}) => {
  const config = slide.impostorConfig || {
    mode: 'classic',
    category: slide.categoryName || 'Personagens Bíblicos',
    secretWord: 'Moisés',
    numAgents: 4,
    numImpostors: 1,
    impostorRatio: 0.25,
    impostorRatioPreset: '1_per_4',
    selectionMethod: 'random',
    revealWordToInvestigators: false,
    impostorParticipantIds: [],
    agentParticipantIds: [],
    roundsTotal: 3,
    currentRound: 1,
    eliminatedIds: [],
    votingActive: false,
    votes: {},
    revealState: 'hidden',
    votingAudience: 'all'
  };

  const isInvestigatorMode = config.mode === 'investigator';
  const eliminatedIds = config.eliminatedIds || [];

  // Participantes que são agentes no palco (NUNCA REVELAR QUEM É O INFILTRADO NO TELÃO)
  const agentParticipants = participants.filter((p) =>
    (config.agentParticipantIds || []).includes(p.id)
  );

  // Participantes que são investigadores na plateia
  const investigatorParticipants = participants.filter(
    (p) => !(config.agentParticipantIds || []).includes(p.id)
  );

  // Participantes que são infiltrados (usado apenas quando a revelação acontecer)
  const impostorParticipants = participants.filter((p) =>
    (config.impostorParticipantIds || []).includes(p.id)
  );
  const impostorNames = impostorParticipants.map((p) => p.name);

  // Votos computados (totais para contagem visual)
  const totalVotesCast = Object.keys(config.votes || {}).length;

  const totalImpostorsCount = (config.impostorParticipantIds || []).length;
  const remainingImpostorsCount = (config.impostorParticipantIds || []).filter(
    (id) => !eliminatedIds.includes(id)
  ).length;

  // Se a partida ainda não foi iniciada pelo apresentador
  if (!config.gameStarted) {
    return (
      <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-5xl mx-auto text-center select-none overflow-hidden">
        {/* Top Header */}
        <div className="space-y-1 sm:space-y-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>O Infiltrado • Preparação da Partida</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">
            {slide.title || 'Quem é o Infiltrado?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isInvestigatorMode
              ? 'Alguns participantes serão convocados ao palco como Agentes. Entre eles, há infiltrados disfarçados!'
              : 'Todos os participantes recebem a palavra secreta no celular... exceto o infiltrado que terá que blefar!'}
          </p>
        </div>

        {/* Central Card */}
        <div className="my-auto py-4 max-w-lg mx-auto w-full">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-rose-900/30 animate-pulse">
              🕵️
            </div>

            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold">
                Tema Selecionado
              </span>
              <div className="text-xl sm:text-3xl font-black text-amber-300 font-mono">
                {config.category || 'Geral'}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold">
                <Users className="w-4 h-4" />
                <span>{participants.length} participante{participants.length === 1 ? '' : 's'} na sala</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Aguardando o apresentador definir a palavra secreta e iniciar a partida...
              </p>
            </div>

            {isPresenter && onStartImpostorGame && (
              <button
                type="button"
                onClick={onStartImpostorGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Iniciar Partida do Infiltrado</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Fique atento à sua tela quando a partida for iniciada!</span>
        </div>
      </div>
    );
  }

  // Se está na fase de revelação da eliminação da rodada
  if (config.revealState === 'round_elimination') {
    const eliminatedParticipant = participants.find((p) => p.id === config.lastEliminatedId);
    
    // Contar votos recebidos pelo eliminado
    let votesReceived = 0;
    if (config.lastEliminatedId && config.votes) {
      Object.values(config.votes).forEach((targetId) => {
        if (targetId === config.lastEliminatedId) votesReceived++;
      });
    }

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 max-w-5xl mx-auto">
        <ImpostorRoundEliminationReveal
          eliminatedName={eliminatedParticipant?.name || 'Jogador Eliminado'}
          eliminatedAvatar={eliminatedParticipant?.avatar || '👤'}
          votesReceived={votesReceived}
          wasImpostor={Boolean(config.lastEliminatedWasImpostor)}
          roundNumber={config.currentRound || 1}
          roundsTotal={config.roundsTotal || 3}
          remainingImpostorsCount={remainingImpostorsCount}
          totalImpostorsCount={totalImpostorsCount}
          isGameOver={config.winner !== undefined}
          winner={config.winner}
          onNextRound={onAdvanceToNextRound ? () => onAdvanceToNextRound(true) : undefined}
          onNewMatch={onStartNewMatch || onResetGame}
          isPresenter={isPresenter}
        />
      </div>
    );
  }

  // Se já está na fase de revelação final com animação dramática de vitória
  if (config.revealState === 'revealed') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-6 max-w-5xl mx-auto">
        <ImpostorStageReveal
          impostorNames={impostorNames.length > 0 ? impostorNames : ['Infiltrado']}
          winner={config.winner || 'civilians'}
          secretWord={config.secretWord}
          category={config.category}
        />
        <div className="flex justify-center pb-4">
          <button
            onClick={onResetGame}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Iniciar Nova Partida
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 sm:p-4 md:p-6 max-w-7xl mx-auto relative select-none overflow-hidden">
      {/* Top Header - Telão Público (100% Livre de Informações Sigilosas) */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 pb-2 border-b border-slate-800/80 shrink-0">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>O Infiltrado • {isInvestigatorMode ? 'Modo Investigador' : 'Modo Clássico'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight font-display">
            {slide.title || 'Quem é o Infiltrado?'}
          </h2>
        </div>

        {/* Informações do Tema & Rodada (Telão) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center shadow">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-indigo-300 font-bold block">
              Tema da Partida
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[140px] block">
              {config.category}
            </span>
          </div>

          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono shadow">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Rodada
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-400">
              {config.currentRound || 1}/{config.roundsTotal || 3}
            </span>
          </div>
        </div>
      </div>

      {/* Palco Principal do Telão */}
      <div className="my-auto py-1 sm:py-2 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center overflow-hidden">
        {/* Banner de Status da Dinâmica */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm sm:text-lg shrink-0">
              {config.votingActive ? '🗳️' : '🎙️'}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {config.votingActive
                  ? `Votação Aberta nos Celulares! (Rodada ${config.currentRound || 1} de ${config.roundsTotal || 3})`
                  : `Rodada ${config.currentRound || 1} de ${config.roundsTotal || 3} • Fase de Pistas`}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                {config.votingActive
                  ? 'Abra seu celular e vote no Agente que você suspeita ser o Agente Infiltrado para eliminá-lo!'
                  : 'Cada Agente deve falar apenas 1 termo ou palavra ligada ao código. Quem está blefando?'}
              </p>
            </div>
          </div>

          {config.votingActive && (
            <div className="px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] sm:text-xs font-bold text-rose-300 whitespace-nowrap">
                {totalVotesCast} {totalVotesCast === 1 ? 'voto' : 'votos'}
              </span>
            </div>
          )}
        </div>

        {/* Palco dos Agentes (SEM QUALQUER INDICAÇÃO DE QUEM É O INFILTRADO) */}
        {isInvestigatorMode ? (
          <div className="space-y-2 flex-1 flex flex-col justify-center overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold shrink-0">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Agentes no Palco ({agentParticipants.length})
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Infiltrados disfarçados entre Aliados!
              </span>
            </div>

            {agentParticipants.length === 0 ? (
              <div className="text-center py-6 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 space-y-1">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">
                  Aguardando o Apresentador sortear os Agentes para o palco...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-1 items-stretch">
                {agentParticipants.map((p, idx) => {
                  const isEliminated = eliminatedIds.includes(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: isEliminated ? 1 : 1.02 }}
                      className={`p-2.5 sm:p-3 rounded-2xl border shadow-lg flex flex-col justify-between items-center text-center space-y-1 transition-all ${
                        isEliminated
                          ? 'bg-slate-950/80 border-rose-900/60 opacity-60 grayscale-[40%]'
                          : 'bg-slate-900/80 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isEliminated ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                            <Skull className="w-2.5 h-2.5" />
                            <span>Eliminado</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold uppercase tracking-wider">
                            Agente #{idx + 1}
                          </span>
                        )}
                      </div>

                      <div className="my-1">
                        <span
                          className={`text-2xl sm:text-3xl md:text-4xl block ${!isEliminated ? 'animate-bounce' : ''}`}
                          style={{ animationDuration: `${2 + idx * 0.3}s` }}
                        >
                          {p.avatar}
                        </span>
                        <h4 className={`text-xs sm:text-sm font-extrabold mt-1 truncate max-w-[120px] sm:max-w-[140px] ${isEliminated ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {p.name}
                        </h4>
                      </div>

                      <div className="w-full pt-1 border-t border-slate-800 text-[10px] text-slate-400 truncate">
                        {isEliminated ? (
                          <span className="text-rose-400 font-bold">Eliminado</span>
                        ) : config.votingActive ? (
                          'Votável'
                        ) : (
                          'Fala Termo'
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Investigadores na Plateia */}
            <div className="pt-1.5 border-t border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs text-slate-400">
                <span className="font-semibold text-purple-300">🔍 Investigadores ({investigatorParticipants.length})</span>
                <span className="hidden sm:inline">Ouvirão e votarão</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-14 sm:max-h-16 overflow-y-auto">
                {investigatorParticipants.map((p) => {
                  const isEliminated = eliminatedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] flex items-center gap-1 ${
                        isEliminated
                          ? 'bg-rose-950/40 border-rose-800/40 text-rose-300 line-through opacity-70'
                          : 'bg-purple-950/30 border-purple-800/40 text-purple-200'
                      }`}
                    >
                      <span>{p.avatar}</span>
                      <span className="truncate max-w-[80px]">{p.name}</span>
                      {isEliminated && <span className="text-[9px] text-rose-400 font-bold">💀</span>}
                    </div>
                  );
                })}
                {investigatorParticipants.length === 0 && (
                  <span className="text-[10px] text-slate-500">
                    Nenhum outro participante conectado.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Modo Clássico (Todos os participantes são Agentes Aliados ou Infiltrados) */
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-xl space-y-2 flex-1 flex flex-col justify-center overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Agentes na Rodada ({participants.length})
              </span>
              <span className="text-[10px] text-slate-400">
                {config.votingActive ? 'Votação em Andamento...' : 'Fase de Pistas'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
              {participants.map((p) => {
                const isEliminated = eliminatedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center shadow transition-all ${
                      isEliminated
                        ? 'bg-slate-950/80 border-rose-900/60 opacity-60'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{p.avatar}</span>
                    <span className={`text-[11px] font-bold truncate max-w-full mt-0.5 ${isEliminated ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {p.name}
                    </span>
                    {isEliminated && (
                      <span className="text-[9px] text-rose-400 font-bold mt-0.5">💀 Eliminado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé Informativo do Telão */}
      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span>🎮 Regra: Identifique e elimine os Agentes Infiltrados antes do fim das rodadas!</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500 shrink-0">
          Telão Público
        </div>
      </div>
    </div>
  );
};
