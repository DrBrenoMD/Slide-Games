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
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onToggleShowAnswers: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onOpenTeamManager: () => void;
  onAddSimulatedParticipants: () => void;
  onSwitchToEditor: () => void;
  onUpdateImpostorConfig: (config: Partial<ImpostorConfig>) => void;
  onStartImpostorVoting: () => void;
  onRevealImpostor: () => void;
  onResetImpostorGame: () => void;
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
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onToggleShowAnswers,
  onToggleTimer,
  onResetTimer,
  onOpenTeamManager,
  onAddSimulatedParticipants,
  onSwitchToEditor,
  onUpdateImpostorConfig,
  onStartImpostorVoting,
  onRevealImpostor,
  onResetImpostorGame
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Teclas de atalho para o apresentador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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
  }, [onNextSlide, onPrevSlide, onToggleShowAnswers]);

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
            onAddSimulatedParticipants={onAddSimulatedParticipants}
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

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col justify-between overflow-hidden relative select-none bg-slate-950 text-slate-100"
      style={{
        backgroundColor: currentSlide.theme?.backgroundColor || '#0F172A',
        color: currentSlide.theme?.textColor || '#FFFFFF'
      }}
    >
      {/* Floating live emojis from participants */}
      <LiveReactionsOverlay reactions={reactions} />

      {/* Main Slide Stage with Motion Graphic transitions */}
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col relative z-10">
        <MotionSlideContainer
          slideKey={currentSlide.id}
          animation={currentSlide.animation}
        >
          {renderSlideContent()}
        </MotionSlideContainer>
      </div>

      {/* Bottom Presenter Control Bar */}
      <PresenterControlBar
        currentSlideIndex={currentSlideIndex}
        totalSlides={slides.length}
        showAnswers={showAnswers}
        timerActive={timerActive}
        timerRemaining={timerRemaining}
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
      />
    </div>
  );
};
