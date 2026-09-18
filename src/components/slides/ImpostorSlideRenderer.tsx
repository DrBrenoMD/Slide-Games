import React from 'react';
import { Slide, Participant, ImpostorConfig } from '../../types';
import { ImpostorStageReveal } from '../motion/ImpostorAlert';
import {
  ShieldAlert,
  Users,
  Vote,
  Sparkles,
  RefreshCw,
  Tv,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface ImpostorSlideRendererProps {
  slide: Slide;
  participants: Participant[];
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartVoting: () => void;
  onRevealImpostor: () => void;
  onResetGame: () => void;
  onAddSimulatedParticipants?: () => void;
}

export const ImpostorSlideRenderer: React.FC<ImpostorSlideRendererProps> = ({
  slide,
  participants,
  onResetGame
}) => {
  const config = slide.impostorConfig || {
    mode: 'classic',
    category: slide.categoryName || 'Personagens Bíblicos',
    secretWord: 'Moisés',
    numAgents: 4,
    numImpostors: 1,
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

  // Se já está na fase de revelação com animação dramática (após encerramento pelo apresentador)
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
            Jogar Nova Rodada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto relative select-none">
      {/* Top Header - Telão Público (100% Livre de Informações Sigilosas) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>O Infiltrado • {isInvestigatorMode ? 'Modo Investigador' : 'Modo Clássico'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            {slide.title || 'Quem é o Infiltrado?'}
          </h2>
        </div>

        {/* Informações do Tema & Rodada (Telão) */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center shadow-lg">
            <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block">
              Tema da Rodada
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {config.category}
            </span>
          </div>

          {isInvestigatorMode && (
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Rodada de Pistas
              </span>
              <span className="text-sm sm:text-base font-black text-amber-400">
                {config.currentRound || 1} de {config.roundsTotal || 3}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Palco Principal do Telão */}
      <div className="my-auto py-6 space-y-6">
        {/* Banner de Status da Dinâmica */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
              {config.votingActive ? '🗳️' : '🎙️'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {config.votingActive
                  ? 'Votação Aberta nos Celulares!'
                  : `Rodada ${config.currentRound || 1} • Fase de Pistas`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {config.votingActive
                  ? 'Abra seu celular e vote em quem você suspeita que seja o Infiltrado!'
                  : 'Cada agente no palco deve falar apenas 1 palavra ligada ao tema. Prestem atenção nas reações!'}
              </p>
            </div>
          </div>

          {config.votingActive && (
            <div className="px-4 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-300">
                {totalVotesCast} {totalVotesCast === 1 ? 'voto computado' : 'votos computados'}
              </span>
            </div>
          )}
        </div>

        {/* Palco dos Agentes (SEM QUALQUER INDICAÇÃO DE QUEM É O INFILTRADO) */}
        {isInvestigatorMode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Agentes no Palco ({agentParticipants.length} Jogadores)
              </span>
              <span className="text-xs text-slate-400">
                Um deles é o Infiltrado e está blefando!
              </span>
            </div>

            {agentParticipants.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">
                  Aguardando o Apresentador sortear os Agentes para o palco...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {agentParticipants.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl flex flex-col justify-between items-center text-center space-y-3"
                  >
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider">
                      Agente #{idx + 1}
                    </span>

                    <div className="my-2">
                      <span className="text-5xl block animate-bounce" style={{ animationDuration: `${2 + idx * 0.3}s` }}>
                        {p.avatar}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-2 truncate max-w-[160px]">
                        {p.name}
                      </h4>
                    </div>

                    <div className="w-full pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      {config.votingActive ? 'Suspeito Elegível' : 'Aguardando Pista'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Investigadores na Plateia */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                <span className="font-semibold">Investigadores na Plateia ({investigatorParticipants.length})</span>
                <span>Votarão no celular para desmascarar o Infiltrado</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {investigatorParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="px-3 py-1 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 text-xs flex items-center gap-1.5"
                  >
                    <span>{p.avatar}</span>
                    <span className="truncate max-w-[100px]">{p.name}</span>
                  </div>
                ))}
                {investigatorParticipants.length === 0 && (
                  <span className="text-xs text-slate-500">
                    Nenhum outro participante conectado na plateia.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Modo Clássico (Todos os participantes na tela, sem qualquer indicação de quem é o infiltrado) */
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Participantes Conectados ({participants.length})
              </span>
              <span className="text-xs text-slate-400">
                {config.votingActive ? 'Votação em Andamento...' : 'Fase de Pistas'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center text-center shadow"
                >
                  <span className="text-3xl">{p.avatar}</span>
                  <span className="text-xs font-bold text-white truncate max-w-full mt-1">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé Informativo do Telão */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>🎮 Regra: Diga uma palavra que se conecte ao tema sem entregar a palavra ao Infiltrado!</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Telão Público
        </div>
      </div>
    </div>
  );
};
