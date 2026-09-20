import React, { useEffect, useRef } from 'react';
import { Slide, Participant, Team, ImagePinSubmission, TermSubmission, LiveReaction, ImpostorConfig } from '../../types';
import { MotionSlideContainer } from '../motion/MotionSlideContainer';
import { LiveReactionsOverlay } from '../motion/LiveReactionsOverlay';
import { PodiumPod } from '../motion/PodiumPod';
import { LobbySlideRenderer } from '../slides/LobbySlideRenderer';
import { ContentSlideRenderer } from '../slides/ContentSlideRenderer';
import { MultipleChoiceSlideRenderer } from '../slides/MultipleChoiceSlideRenderer';
import { TermSprintSlideRenderer } from '../slides/TermSprintSlideRenderer';
import { ImagePinSlideRenderer } from '../slides/ImagePinSlideRenderer';
import { WordCloudSlideRenderer } from '../slides/WordCloudSlideRenderer';
import { ImpostorSlideRenderer } from '../slides/ImpostorSlideRenderer';
import { ThemeVisualDecorator } from '../themes/ThemeVisualDecorator';
import { getComputedThemeStyles } from '../../utils/themeStyles';
import { AnimatedSlideElementsOverlay } from '../slides/AnimatedSlideElementsOverlay';
import { PresenterControlBar } from './PresenterControlBar';

interface PresentationPlayerProps {
  slides: Slide[];
  currentSlideIndex: number;
  roomCode: string;
  appUrl: string;
  participants: Participant[];
  teams: Team[];
  teamMode: string;
  showAnswers: boolean;
  timerActive: boolean;
  timerRemaining: number | null;
  answersSubmitted: Record<string, any>;
  imagePins: ImagePinSubmission[];
  termSubmissions: TermSubmission[];
  reactions: LiveReaction[];
  isProjectorOnly?: boolean;
  isEmbedded?: boolean;
  isPresenterAuthenticated?: boolean;
  onOpenPresenterLogin?: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onToggleShowAnswers: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onOpenTeamManager: () => void;
  onAddSimulatedParticipants: () => void;
  onSwitchToEditor: () => void;
  onOpenProjectorWindow?: () => void;
  onStartImpostorGame?: () => void;
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartImpostorVoting: () => void;
  onRevealImpostor: () => void;
  onResetImpostorGame: () => void;
  onAdvanceToNextRound?: (changeWord?: boolean) => void;
  onStartNewMatch?: () => void;
  onToggleRevealWordToInvestigators?: () => void;
}

export const PresentationPlayer: React.FC<PresentationPlayerProps> = ({
  slides,
  currentSlideIndex,
  roomCode,
  appUrl,
  participants,
  teams,
  teamMode,
  showAnswers,
  timerActive,
  timerRemaining,
  answersSubmitted,
  imagePins,
  termSubmissions,
  reactions,
  isProjectorOnly = false,
  isEmbedded = false,
  isPresenterAuthenticated = true,
  onOpenPresenterLogin,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onToggleShowAnswers,
  onToggleTimer,
  onResetTimer,
  onOpenTeamManager,
  onAddSimulatedParticipants,
  onSwitchToEditor,
  onOpenProjectorWindow,
  onStartImpostorGame,
  onUpdateImpostorConfig,
  onStartImpostorVoting,
  onRevealImpostor,
  onResetImpostorGame,
  onAdvanceToNextRound,
  onStartNewMatch,
  onToggleRevealWordToInvestigators
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Teclas de atalho para o apresentador (apenas quando não embutido)
  useEffect(() => {
    if (isEmbedded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isPresenterAuthenticated) {
        if (['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' ', 'r', 'R'].includes(e.key)) {
          e.preventDefault();
          onOpenPresenterLogin?.();
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        onNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        onPrevSlide();
      } else if (e.key === 'r' || e.key === 'R') {
        onToggleShowAnswers();
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEmbedded, isPresenterAuthenticated, onNextSlide, onPrevSlide, onToggleShowAnswers, onOpenPresenterLogin]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Seletor dinâmico do renderizador baseado no tipo do slide
  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case 'content_qrcode_lobby':
        return (
          <LobbySlideRenderer
            slide={currentSlide}
            roomCode={roomCode}
            appUrl={appUrl}
            participants={participants}
            teams={teams}
            teamMode={teamMode}
            onStartPresentation={onNextSlide}
            onOpenTeamManager={onOpenTeamManager}
          />
        );

      case 'quiz_multiple_choice':
      case 'quiz_true_false':
      case 'poll_single':
        return (
          <MultipleChoiceSlideRenderer
            slide={currentSlide}
            showAnswers={showAnswers}
            timerRemaining={timerRemaining}
            timerActive={timerActive}
            answersSubmitted={answersSubmitted}
            participants={participants}
          />
        );

      case 'quiz_term_sprint':
        return (
          <TermSprintSlideRenderer
            slide={currentSlide}
            termSubmissions={termSubmissions}
            timerRemaining={timerRemaining}
            timerActive={timerActive}
            participants={participants}
          />
        );

      case 'quiz_image_pin':
        return (
          <ImagePinSlideRenderer
            slide={currentSlide}
            showAnswers={showAnswers}
            timerRemaining={timerRemaining}
            timerActive={timerActive}
            imagePins={imagePins}
            participants={participants}
          />
        );

      case 'interaction_word_cloud':
      case 'quiz_short_answer':
        return (
          <WordCloudSlideRenderer
            slide={currentSlide}
            answersSubmitted={answersSubmitted}
            participants={participants}
          />
        );

      case 'game_impostor_classic':
      case 'game_impostor_investigator':
        return (
          <ImpostorSlideRenderer
            slide={currentSlide}
            participants={participants}
            onUpdateImpostorConfig={onUpdateImpostorConfig}
            onStartVoting={onStartImpostorVoting}
            onRevealImpostor={onRevealImpostor}
            onResetGame={onResetImpostorGame}
            onAdvanceToNextRound={onAdvanceToNextRound}
            onStartNewMatch={onStartNewMatch}
            onStartImpostorGame={onStartImpostorGame}
            onAddSimulatedParticipants={onAddSimulatedParticipants}
            onToggleRevealWordToInvestigators={onToggleRevealWordToInvestigators}
            isPresenter={!isProjectorOnly}
          />
        );

      case 'leaderboard':
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 font-display">
              {currentSlide.title || '🏆 Classificação'}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-slate-300 text-sm sm:text-base mb-4">
                {currentSlide.subtitle}
              </p>
            )}
            <PodiumPod
              participants={participants}
              teams={teams}
              teamMode={teamMode}
              isFinal={currentSlideIndex === slides.length - 1}
            />
          </div>
        );

      case 'content_cover':
      case 'content_bullets':
      case 'content_media':
      case 'content_quote':
      case 'content_instruction':
      default:
        return <ContentSlideRenderer slide={currentSlide} />;
    }
  };

  const themeStyles = getComputedThemeStyles(currentSlide.theme);

  return (
    <div
      ref={containerRef}
      className={`w-full ${isEmbedded ? 'h-full min-h-[300px]' : 'h-screen'} flex flex-col justify-between overflow-hidden relative select-none bg-slate-950 text-slate-100`}
      style={themeStyles.containerStyle}
    >
      {/* Visual Decorator Overlay (Cyber-grid, Stars, Organic leaves, etc.) */}
      <ThemeVisualDecorator theme={currentSlide.theme} />

      {/* Floating live emojis from participants */}
      <LiveReactionsOverlay reactions={reactions} />

      {/* Main Slide Stage with Motion Graphic transitions in 16:9 container */}
      <div className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center relative z-10 ${isEmbedded ? 'p-0' : 'p-1 sm:p-2'}`}>
        <div className={`w-full h-full ${isEmbedded ? 'max-w-full' : 'max-w-7xl aspect-video'} mx-auto flex flex-col relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl bg-black/20`}>
          <MotionSlideContainer
            slideKey={currentSlide.id}
            animation={currentSlide.animation}
          >
            <div className="w-full h-full relative overflow-hidden flex flex-col">
              {renderSlideContent()}
              <AnimatedSlideElementsOverlay elements={currentSlide.elements} />
            </div>
          </MotionSlideContainer>
        </div>
      </div>

      {/* Bottom Presenter Control Bar OR Minimal Projector Bar */}
      {!isEmbedded && (
        isProjectorOnly ? (
          <div className="absolute bottom-3 right-3 z-50 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
            <span className="font-mono text-slate-400 font-bold">
              {currentSlideIndex + 1}/{slides.length}
            </span>
            <span className="text-[10px] text-sky-400 font-semibold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
              Telão Projetado
            </span>
            <button
              onClick={handleToggleFullscreen}
              className="text-slate-300 hover:text-white cursor-pointer px-1 py-0.5"
              title="Tela Cheia"
            >
              ⛶
            </button>
          </div>
        ) : (
          <PresenterControlBar
            currentSlideIndex={currentSlideIndex}
            totalSlides={slides.length}
            showAnswers={showAnswers}
            timerActive={timerActive}
            timerRemaining={timerRemaining}
            isPresenterAuthenticated={isPresenterAuthenticated}
            onOpenPresenterLogin={onOpenPresenterLogin}
            onPrevSlide={onPrevSlide}
            onNextSlide={onNextSlide}
            onToggleShowAnswers={onToggleShowAnswers}
            onToggleTimer={onToggleTimer}
            onResetTimer={onResetTimer}
            onOpenTeamManager={onOpenTeamManager}
            onAddSimulatedParticipants={onAddSimulatedParticipants}
            onToggleFullscreen={handleToggleFullscreen}
            onSwitchToEditor={onSwitchToEditor}
            onGoToLobby={() => onGoToSlide(0)}
            onOpenProjectorWindow={onOpenProjectorWindow}
          />
        )
      )}
    </div>
  );
};
