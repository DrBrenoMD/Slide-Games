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
  isAgent?: boolean;       // Para o Modo Investigador de O Infiltrado
  isImpostor?: boolean;    // Para O Infiltrado
  isEliminated?: boolean;  // No jogo do Infiltrado
  connectedAt: number;
  hasAnswered?: boolean;
  selectedOption?: string | number | string[];
}

export type SlideType =
  // Conteúdo & Apresentação (Estilo Canva / PPT)
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

export interface ImpostorConfig {
  mode: 'classic' | 'investigator';
  category: string;
  secretWord: string;
  customWordList?: string[];
  numAgents?: number; // Número de agentes (ex: 3, 4, 5, 6). Padrão 4
  numImpostors?: number; // Número de infiltrados (ex: 1, 2). Padrão 1
  selectionMethod?: 'random' | 'manual'; // Forma de escolha: 'random' | 'manual'
  revealWordToInvestigators?: boolean; // Revelar palavra para os investigadores
  impostorParticipantIds: string[];
  agentParticipantIds: string[]; // No modo investigador
  roundsTotal: number;
  currentRound: number;
  eliminatedIds: string[];
  votingActive: boolean;
  votes: Record<string, string>; // voterId -> suspectId
  revealState: 'hidden' | 'words_shown' | 'voting' | 'revealed';
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
  
  // Customização visual estilo Canva
  theme: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: 'Outfit' | 'Plus Jakarta Sans' | 'JetBrains Mono';
  };
  animation: SlideAnimationConfig;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number; // porcentagem horizontal de surgimento
}

export interface RoomState {
  roomCode: string;
  presenterPassword: string;
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
