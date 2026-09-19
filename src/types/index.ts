/**
 * Tipos fundamentais da plataforma ApresentaLive
 */

export type UserRole = 'presenter' | 'participant';

export type TeamMode = 'none' | 'choose' | 'random' | 'manual';

export interface Team {
  id: string;
  name: string;
  color: string;
  badge: string; // emoji icon
  score: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string; // emoji ou avatar id
  teamId?: string;
  score: number;
  lastScoreGain?: number;
  isAgent?: boolean;          // Agente (Aliado ou Infiltrado)
  isImpostor?: boolean;       // Agente Infiltrado (não recebe o código secreto)
  isInvestigator?: boolean;   // Investigador (apenas vota, não fala pistas)
  isEliminated?: boolean;     // Eliminado no jogo
  connectedAt: number;
  hasAnswered?: boolean;
  selectedOption?: string | number | string[];
}

export type SlideType =
  // Conteúdo & Apresentação (Estilo Canva / PPT)
  | 'content_blank'
  | 'content_cover'
  | 'content_bullets'
  | 'content_media'
  | 'content_quote'
  | 'content_instruction'
  | 'content_qrcode_lobby'
  // Quizes (Competitivo & Não-Competitivo)
  | 'quiz_multiple_choice'
  | 'quiz_short_answer'
  | 'quiz_image_pin'
  | 'quiz_true_false'
  | 'quiz_match_pairs'
  | 'quiz_term_sprint'
  // Pesquisas & Interações
  | 'poll_single'
  | 'poll_scale'
  | 'interaction_word_cloud'
  // Jogos
  | 'game_impostor_classic'
  | 'game_impostor_investigator'
  // Ranking
  | 'leaderboard';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  color?: string;
  icon?: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface HotspotTarget {
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  radiusPercent: number; // 0 - 100
  label?: string;
}

export interface ImagePinSubmission {
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  teamColor?: string;
  xPercent: number;
  yPercent: number;
  isCorrect?: boolean;
  timestamp?: number;
}

export interface TermSubmission {
  participantId: string;
  participantName: string;
  teamId?: string;
  term: string;
  timestamp: number;
  isValid: boolean;
}

export interface SlideAnimationConfig {
  transition: 'fade' | 'slide' | 'zoom' | 'kinetic' | 'spring';
  duration: number; // seconds
  backgroundEffect?: 'gradient-mesh' | 'particles' | 'grid' | 'pulse' | 'none';
}

export type SlideElementType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'shape'
  | 'sticker'
  | 'quiz_widget'
  | 'poll_widget'
  | 'timer_widget'
  | 'wordcloud_widget';

export interface InteractiveWidgetOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  color?: string;
  icon?: string;
  votesCount?: number;
}

export interface InteractiveWidgetConfig {
  widgetType: 'quiz' | 'poll' | 'timer' | 'wordcloud';
  question?: string;
  options?: InteractiveWidgetOption[];
  timerSeconds?: number;
  points?: number;
  layout?: 'single_column' | 'two_columns' | 'horizontal_row';
  showLiveVotes?: boolean;
  revealAnswer?: boolean;
}

export type ElementAnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'bounce'
  | 'flip'
  | 'rotate-in'
  | 'pulse-loop'
  | 'float-loop'
  | 'spin-loop'
  | 'glow-loop'
  | 'shake-loop'
  | 'heartbeat';

export interface ElementAnimation {
  type: ElementAnimationType;
  delay?: number; // seconds
  duration?: number; // seconds
  trigger?: 'on_load' | 'on_click' | 'on_hover' | 'continuous';
  repeat?: 'once' | 'infinite';
  easing?: 'ease' | 'linear' | 'ease-in-out' | 'spring' | 'bounce';
}

export interface ElementFilter {
  brightness?: number; // 0 - 200 (%)
  contrast?: number; // 0 - 200 (%)
  saturate?: number; // 0 - 200 (%)
  blur?: number; // 0 - 30 (px)
  grayscale?: number; // 0 - 100 (%)
  sepia?: number; // 0 - 100 (%)
  invert?: number; // 0 - 100 (%)
  hueRotate?: number; // 0 - 360 (deg)
  opacity?: number; // 0 - 100 (%)
}

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  fontSize?: number; // px
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glow-indigo' | 'glow-rose' | 'glow-emerald' | 'glow-amber' | 'glow-sky';
  objectFit?: 'cover' | 'contain' | 'fill';
  backdropBlur?: number;
}

export interface SlideElement {
  id: string;
  type: SlideElementType;
  name: string;
  x: number; // 0 - 100 (%)
  y: number; // 0 - 100 (%)
  width: number; // 0 - 100 (%)
  height: number; // 0 - 100 (%) ou auto (-1)
  rotation?: number; // -180 to 180 degrees
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;

  // Specific content
  text?: string;
  mediaUrl?: string; // Image URL, Video URL/Embed, Audio URL/Data URI
  mediaType?: 'upload' | 'url' | 'youtube' | 'preset';
  alt?: string;
  audioTitle?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  volume?: number; // 0 to 1
  audioLayout?: 'badge' | 'player' | 'ambient' | 'button';
  shapeType?: 'rectangle' | 'circle' | 'pill' | 'rounded' | 'speech_bubble' | 'star' | 'badge' | 'arrow_right';
  iconName?: string;
  interactiveConfig?: InteractiveWidgetConfig;

  // Visual Customization & Motion Animation
  style: ElementStyle;
  filter?: ElementFilter;
  animation?: ElementAnimation;
}

export interface ImpostorConfig {
  mode: 'classic' | 'investigator';
  category: string;
  secretWord: string;
  customWordList?: string[];
  numAgents?: number; // Número de agentes (ex: 3, 4, 5, 6). Padrão 4
  numImpostors?: number; // Número de infiltrados (ex: 1, 2). Padrão 1
  impostorRatio?: number; // Proporção de infiltrados (ex: 0.25 para 25% ou 1 a cada 4 jogadores)
  impostorRatioPreset?: '1_per_4' | '1_per_5' | '1_per_3' | '1_per_2' | '1_per_6' | 'custom'; // Preset de proporção
  selectionMethod?: 'random' | 'manual'; // Forma de escolha: 'random' | 'manual'
  revealWordToInvestigators?: boolean; // Revelar palavra para os investigadores
  impostorParticipantIds: string[];
  agentParticipantIds: string[]; // No modo investigador
  roundsTotal: number; // Limite de rodadas configurado pelo apresentador
  currentRound: number;
  eliminatedIds: string[];
  lastEliminatedId?: string | null;
  lastEliminatedWasImpostor?: boolean | null;
  changeWordOnNextRound?: boolean;
  votingActive: boolean;
  votes: Record<string, string>; // voterId -> suspectId
  revealState: 'hidden' | 'words_shown' | 'voting' | 'round_elimination' | 'revealed';
  winner?: 'impostors' | 'civilians' | 'agents';
  votingAudience: 'all' | 'players_only';
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  imageUrl?: string;
  quoteAuthor?: string;
  
  // Custom Media & Overlay Elements (Caixas de Texto, Imagens, Vídeos, Áudios, Formas, Animações)
  elements?: SlideElement[];

  // Configurações do Quiz / Interação
  isCompetitive?: boolean;
  pointsBase?: number;
  speedBonus?: boolean; // Mais rápido = mais pontos
  timeLimitSeconds?: number; // 0 para sem limite
  showRankingAfter?: boolean;
  options?: QuizOption[];
  correctAnswerText?: string;
  matchPairs?: MatchPair[];
  hotspot?: HotspotTarget;
  categoryName?: string; // Para sprint de termos ou O Infiltrado
  
  // Para O Infiltrado
  impostorConfig?: ImpostorConfig;
  
  // Customização visual estilo Canva & Temas Visuais Avançados
  theme: {
    id?: string;
    name?: string;
    backgroundColor?: string;
    backgroundGradient?: string;
    backgroundImage?: string;
    textColor?: string;
    accentColor?: string;
    secondaryColor?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    fontFamily?: string;
    headingFontFamily?: string;
    category?: string;
    overlayGraphic?:
      | 'cyber-grid'
      | 'dots'
      | 'geometric-shapes'
      | 'leaves-organic'
      | 'stars-sparkle'
      | 'film-grain'
      | 'manga-speedlines'
      | 'corporate-lines'
      | 'neon-glow'
      | 'vintage-frame'
      | 'synthwave-sun'
      | 'pixel-matrix'
      | 'none';
    cardStyle?: 'glass' | 'solid' | 'neon' | 'paper' | 'brutalist' | 'minimal' | 'cyber';
    accentBorderRadius?: string;
    glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  };
  animation: SlideAnimationConfig;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number; // porcentagem horizontal de surgimento
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPresentation {
  id: string;
  ownerId: string;
  title: string;
  slides: Slide[];
  theme?: string;
  slideCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRoom {
  id: string;
  roomCode: string;
  ownerId: string;
  presentationTitle: string;
  presentationId?: string;
  slides?: Slide[];
  participantsCount: number;
  roomPassword?: string; // Senha para os participantes entrarem (opcional)
  bannedParticipantIds?: string[];
  status: 'active' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface RoomState {
  roomCode: string;
  presenterPassword: string;
  roomPassword?: string; // Senha da sala para participantes
  bannedParticipantIds?: string[];
  presentationTitle: string;
  currentSlideIndex: number;
  state: 'lobby' | 'presenting' | 'finished';
  teamMode: TeamMode;
  teams: Team[];
  participants: Record<string, Participant>;
  slides: Slide[];
  
  // Estado dinâmico do slide atual
  timerRemaining: number | null;
  timerActive: boolean;
  showAnswers: boolean;
  answersSubmitted: Record<string, any>; // participantId -> submission
  imagePins: ImagePinSubmission[];
  termSubmissions: TermSubmission[];
  reactions: LiveReaction[];
}

