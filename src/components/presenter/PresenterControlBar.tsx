import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Users,
  Bot,
  Maximize,
  Edit3,
  QrCode,
  Tv
} from 'lucide-react';

interface PresenterControlBarProps {
  currentSlideIndex: number;
  totalSlides: number;
  showAnswers: boolean;
  timerActive: boolean;
  timerRemaining: number | null;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onToggleShowAnswers: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onOpenTeamManager: () => void;
  onAddSimulatedParticipants: () => void;
  onToggleFullscreen: () => void;
  onSwitchToEditor: () => void;
  onGoToLobby: () => void;
  onOpenProjectorWindow?: () => void;
}

export const PresenterControlBar: React.FC<PresenterControlBarProps> = ({
  currentSlideIndex,
  totalSlides,
  showAnswers,
  timerActive,
  timerRemaining,
  onPrevSlide,
  onNextSlide,
  onToggleShowAnswers,
  onToggleTimer,
  onResetTimer,
  onOpenTeamManager,
  onAddSimulatedParticipants,
  onToggleFullscreen,
  onSwitchToEditor,
  onGoToLobby,
  onOpenProjectorWindow
}) => {
  return (
    <div className="h-16 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-40 shrink-0">
      {/* Left: Navigation & Slide counter */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevSlide}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
          title="Slide Anterior (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-mono text-xs font-bold text-slate-300 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
          {currentSlideIndex + 1} / {totalSlides}
        </span>

        <button
          onClick={onNextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
          title="Próximo Slide (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onGoToLobby}
          className="ml-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Ir para o Lobby com QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Live Presentation Actions (Reveal Answers, Timer, Teams) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleShowAnswers}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            showAnswers
              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Revelar ou Ocultar Respostas"
        >
          {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showAnswers ? 'Ocultar Resposta' : 'Revelar Resposta'}</span>
        </button>

        {timerRemaining !== null && (
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
            <button
              onClick={onToggleTimer}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title={timerActive ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
            >
              {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <span className="font-mono text-xs font-bold text-indigo-400 px-1">
              {timerRemaining}s
            </span>
            <button
              onClick={onResetTimer}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Reiniciar Cronômetro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={onOpenTeamManager}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          title="Gerenciar Equipes"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Equipes</span>
        </button>

        <button
          onClick={onAddSimulatedParticipants}
          className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/40 cursor-pointer"
          title="Adicionar jogadores simulados para testar dinâmicas e votos"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">+5 Bots Demo</span>
        </button>
      </div>

      {/* Right: Studio, 2nd Screen & Fullscreen */}
      <div className="flex items-center gap-2">
        {onOpenProjectorWindow && (
          <button
            onClick={onOpenProjectorWindow}
            className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 border border-sky-500/40 cursor-pointer shadow transition-all"
            title="Abrir Telão da Apresentação em uma nova janela para projetar na 2ª Tela"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Projetar 2ª Tela</span>
          </button>
        )}

        <button
          onClick={onSwitchToEditor}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          title="Abrir Editor de Slides"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editor</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Alternar Tela Cheia"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
