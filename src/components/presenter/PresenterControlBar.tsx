import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Users,
  Bot,
  Maximize,
  Edit3,
  QrCode,
  Tv,
  Lock
} from 'lucide-react';

interface PresenterControlBarProps {
  currentSlideIndex: number;
  totalSlides: number;
  showAnswers: boolean;
  timerActive: boolean;
  timerRemaining: number | null;
  isPresenterAuthenticated?: boolean;
  onOpenPresenterLogin?: () => void;
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
  isPresenterAuthenticated = true,
  onOpenPresenterLogin,
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
  const handleProtectedAction = (action: () => void) => {
    if (!isPresenterAuthenticated) {
      if (onOpenPresenterLogin) {
        onOpenPresenterLogin();
      } else {
        alert('Apenas usuários com a senha de apresentador podem controlar a apresentação.');
      }
      return;
    }
    action();
  };

  return (
    <div className="min-h-14 sm:h-16 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-40 shrink-0">
      {/* Left: Navigation & Slide counter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => handleProtectedAction(onPrevSlide)}
          disabled={currentSlideIndex === 0}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
          title="Slide Anterior (←)"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <span className="font-mono text-xs font-bold text-slate-300 px-2 sm:px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 whitespace-nowrap">
          {currentSlideIndex + 1} / {totalSlides}
        </span>

        <button
          onClick={() => handleProtectedAction(onNextSlide)}
          disabled={currentSlideIndex === totalSlides - 1}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
          title="Próximo Slide (→)"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {!isPresenterAuthenticated && onOpenPresenterLogin && (
          <button
            onClick={onOpenPresenterLogin}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 ml-1"
            title="Sua visualização é como espectador. Clique para digitar a senha do apresentador e assumir o controle."
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Digitar Senha de Apresentador</span>
          </button>
        )}

        <button
          onClick={() => handleProtectedAction(onGoToLobby)}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden xs:inline-flex"
          title="Ir para o Lobby com QR Code"
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Center: Live Presentation Actions (Reveal Answers, Timer, Teams) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => handleProtectedAction(onToggleShowAnswers)}
          className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
            showAnswers
              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Revelar ou Ocultar Respostas"
        >
          {showAnswers ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <span className="hidden sm:inline">{showAnswers ? 'Ocultar Resposta' : 'Revelar Resposta'}</span>
        </button>

        {timerRemaining !== null && (
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 sm:px-2 py-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => handleProtectedAction(onToggleTimer)}
              className="p-1 text-slate-300 hover:text-white cursor-pointer"
              title={timerActive ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
            >
              {timerActive ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />}
            </button>
            <span className="font-mono text-xs font-bold text-indigo-400 px-0.5 sm:px-1">
              {timerRemaining}s
            </span>
            <button
              onClick={() => handleProtectedAction(onResetTimer)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Reiniciar Cronômetro"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => handleProtectedAction(onOpenTeamManager)}
          className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer hidden md:inline-flex shrink-0"
          title="Gerenciar Equipes"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Equipes</span>
        </button>

        <button
          onClick={() => handleProtectedAction(onAddSimulatedParticipants)}
          className="px-2 sm:px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/40 cursor-pointer hidden lg:inline-flex shrink-0"
          title="Adicionar jogadores simulados para testar dinâmicas e votos"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>+5 Bots</span>
        </button>
      </div>

      {/* Right: Studio, 2nd Screen & Fullscreen */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenProjectorWindow && (
          <button
            onClick={() => handleProtectedAction(onOpenProjectorWindow)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 border border-sky-500/40 cursor-pointer shadow transition-all whitespace-nowrap"
            title="Abrir Telão da Apresentação em uma nova janela para projetar na 2ª Tela"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Projetar</span>
          </button>
        )}

        <button
          onClick={() => handleProtectedAction(onSwitchToEditor)}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer whitespace-nowrap"
          title="Abrir Editor de Slides"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editor</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="Alternar Tela Cheia"
        >
          <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
