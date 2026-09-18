import React from 'react';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { Slide, Participant, Team } from '../../types';
import { Users, Shield, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LobbySlideRendererProps {
  slide: Slide;
  roomCode: string;
  appUrl: string;
  participants: Participant[];
  teams: Team[];
  teamMode: string;
  onStartPresentation: () => void;
  onOpenTeamManager: () => void;
}

export const LobbySlideRenderer: React.FC<LobbySlideRendererProps> = ({
  slide,
  roomCode,
  appUrl,
  participants,
  teams,
  teamMode,
  onStartPresentation,
  onOpenTeamManager
}) => {
  const joinUrl = `${appUrl || window.location.origin}?pin=${roomCode}`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sala Aberta • Conecte-se</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display">
          {slide.title || 'Apresentação Interativa'}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
          {slide.subtitle || 'Aponte a câmera do seu smartphone ou entre pelo código PIN'}
        </p>
      </div>

      {/* Center Grid: QR Code + Quick Info */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
        {/* Left Column: Instructions */}
        <div className="lg:col-span-4 space-y-4 text-left order-2 lg:order-1">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs">1</span>
              Como Participar
            </h3>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Abra a câmera do celular e mire no QR Code ao lado.</li>
              <li>Ou acesse o link no navegador e digite o código PIN.</li>
              <li>Escolha seu apelido e seu avatar animado.</li>
              <li>Aguarde o apresentador iniciar o primeiro slide!</li>
            </ol>
          </div>

          {teamMode !== 'none' && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Dinâmica de Equipes Ativa
                </span>
                <button
                  onClick={onOpenTeamManager}
                  className="text-xs text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
                >
                  Gerenciar
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {teams.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border"
                    style={{ backgroundColor: `${t.color}20`, borderColor: t.color, color: t.color }}
                  >
                    <span>{t.badge}</span>
                    <span>{t.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Big QR Code */}
        <div className="lg:col-span-4 flex justify-center order-1 lg:order-2">
          <QRCodeDisplay
            url={joinUrl}
            roomCode={roomCode}
            size={230}
            showDetails={true}
          />
        </div>

        {/* Right Column: Live Players Stream */}
        <div className="lg:col-span-4 order-3">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col h-72">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Participantes Conectados</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                {participants.length}
              </span>
            </div>

            {participants.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-xl mb-2 animate-pulse">
                  📱
                </div>
                Aguardando participantes entrarem...
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {participants.map((p) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.avatar}</span>
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                          {p.name}
                        </span>
                      </div>
                      {team && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold border"
                          style={{ backgroundColor: `${team.color}20`, borderColor: team.color, color: team.color }}
                        >
                          {team.badge} {team.name}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="w-full flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onStartPresentation}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center gap-3 cursor-pointer group"
        >
          <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          <span>Iniciar Apresentação</span>
        </button>
      </div>
    </div>
  );
};
