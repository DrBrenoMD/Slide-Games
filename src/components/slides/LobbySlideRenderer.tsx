import React, { useState } from 'react';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { Slide, Participant, Team } from '../../types';
import { Users, Shield, Play, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
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
  const [copied, setCopied] = useState<boolean>(false);
  const defaultBase = typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : '';
  const joinUrl = `${appUrl || defaultBase}?pin=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 lg:p-12 relative z-10 overflow-hidden">
      {/* Top Header */}
      <div className="text-center space-y-1 sm:space-y-2 shrink-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Sala Aberta • Conecte-se</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-display line-clamp-1">
          {slide.title || 'Apresentação Interativa'}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base md:text-xl max-w-2xl mx-auto font-medium line-clamp-1">
          {slide.subtitle || 'Aponte a câmera do seu smartphone ou digite o código PIN'}
        </p>
      </div>

      {/* Center Grid: QR Code + Quick Info */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 my-auto py-2 sm:py-4 items-center flex-1 overflow-hidden">
        {/* Left Column: Instructions */}
        <div className="space-y-3 text-left order-2 md:order-1 flex flex-col justify-center w-full">
          <div className="p-4 sm:p-6 rounded-2xl md:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-2">
            <h3 className="text-white font-black text-sm sm:text-base md:text-lg mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">1</span>
              Como Participar
            </h3>
            <ol className="text-xs sm:text-sm md:text-base text-slate-300 space-y-2 list-decimal list-inside leading-relaxed font-medium">
              <li>Aponte a câmera pro QR Code.</li>
              <li>Ou acesse pelo navegador com o PIN.</li>
              <li>Escolha seu apelido e avatar.</li>
            </ol>
          </div>

          {teamMode !== 'none' && (
            <div className="p-3 sm:p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Equipes Ativas
                </span>
                <button
                  onClick={onOpenTeamManager}
                  className="text-xs text-indigo-400 hover:text-indigo-200 underline cursor-pointer font-bold"
                >
                  Gerenciar
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap max-h-16 overflow-y-auto">
                {teams.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 border shadow-sm"
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

        {/* Center: Big QR Code + PIN without overlapping buttons */}
        <div className="flex justify-center order-1 md:order-2 shrink-0 scale-105 sm:scale-115 md:scale-125">
          <QRCodeDisplay
            url={joinUrl}
            roomCode={roomCode}
            size={160}
            showDetails={true}
            showActionButtons={false}
          />
        </div>

        {/* Right Column: Live Players Stream */}
        <div className="order-3 flex flex-col justify-center w-full">
          <div className="p-4 sm:p-6 rounded-2xl md:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col min-h-[160px] sm:min-h-[200px] md:min-h-[240px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-sm sm:text-base font-black text-white">Conectados</span>
              </div>
              <span className="font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                {participants.length}
              </span>
            </div>

            {participants.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-sm mb-1 animate-pulse">
                  📱
                </div>
                Aguardando participantes...
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48">
                {participants.map((p) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">{p.avatar}</span>
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[110px]">
                          {p.name}
                        </span>
                      </div>
                      {team && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            color: team.color,
                            borderColor: `${team.color}60`,
                            backgroundColor: `${team.color}20`
                          }}
                        >
                          {team.badge}
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

      {/* Bottom Action Bar: Harmonious, separated action buttons with no overlapping */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-3 pt-2 pb-0.5 shrink-0 z-20 flex-wrap">
        <button
          onClick={handleCopyLink}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 border border-slate-700/80 shadow cursor-pointer active:scale-95"
          title="Copiar Link de Convite da Sala"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Link Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copiar Link</span>
            </>
          )}
        </button>

        <button
          onClick={onStartPresentation}
          className="px-5 py-2 sm:px-6 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2 cursor-pointer group active:scale-95"
        >
          <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
          <span>Iniciar Apresentação</span>
        </button>

        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 border border-slate-700/80 shadow cursor-pointer active:scale-95"
          title="Abrir página de convidado em nova aba"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>Abrir Convidado</span>
        </a>
      </div>
    </div>
  );
};
