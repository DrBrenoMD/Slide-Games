import React, { useState, useEffect, useRef } from 'react';
import {
  Slide,
  Participant,
  Team,
  TeamMode,
  ImpostorConfig,
  GarticConfig,
  GarticStroke,
  GarticGuess,
  ImagePinSubmission,
  TermSubmission,
  LiveReaction
} from './types';
import { SAMPLE_PRESENTATION_SLIDES } from './data/samplePresentations';
import { PRESET_TEAMS, PRESET_WORD_CATEGORIES } from './data/presetWords';
import { GARTIC_CATEGORIES, evaluateGuess, getNextHintIndex } from './data/garticPresets';
import { realtimeService } from './services/realtime';
import { storageService, SavedRoom, SavedPresentationSession } from './services/storage';
import { createDefaultSlide } from './utils/slidePresets';
import { PresentationPlayer } from './components/presenter/PresentationPlayer';
import { SlideEditor } from './components/presenter/SlideEditor';
import { PresenterConsole } from './components/presenter/PresenterConsole';
import { PresenterLoginModal } from './components/presenter/PresenterLoginModal';
import { TeamManagerModal } from './components/presenter/TeamManagerModal';
import { ResumePresentationModal } from './components/common/ResumePresentationModal';
import { ParticipantJoin } from './components/participant/ParticipantJoin';
import { ParticipantView } from './components/participant/ParticipantView';
import { HomePortal } from './components/home/HomePortal';
import { UserAuthBar } from './components/common/UserAuthBar';
import { SavedPresentation } from './types';
import {
  Smartphone,
  Monitor,
  ShieldCheck,
  Sparkles,
  Play,
  Copy,
  Check,
  Lock,
  ArrowLeft,
  Home,
  LogOut,
  Edit3,
  Sliders,
  Tv,
  Users
} from 'lucide-react';

const DEFAULT_ROOM_CODE = '749201';
const DEFAULT_PRESENTER_PASSWORD = '1234';

type AppView = 'portal' | 'presentation' | 'presenter' | 'settings' | 'participants';

export default function App() {
  // Controle principal de tela inicial / visão (4 Telas: Apresentação, Apresentador, Configurações, Participantes)
  const [appView, setAppView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPin = params.get('pin');
      const urlView = params.get('view') as AppView;
      const isProj = params.get('projector') === 'true';
      if (urlView) return urlView;
      if (isProj) return 'presentation';
      if (urlPin) return 'participants';

      const savedView = sessionStorage.getItem('apresentalive_current_view') as AppView;
      if (savedView && ['presentation', 'presenter', 'settings', 'participants', 'portal'].includes(savedView)) {
        return savedView;
      }
    }
    return 'portal';
  });
  const [pendingTargetView, setPendingTargetView] = useState<'presenter' | 'settings' | null>(null);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  // Papel do usuário nesta aba: 'presenter' | 'participant'
  const [role, setRole] = useState<'presenter' | 'participant'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'presenter') return 'presenter';
      if (urlRole === 'guest' || params.get('pin')) return 'participant';
      const savedRole = sessionStorage.getItem('apresentalive_current_role');
      if (savedRole === 'presenter' || savedRole === 'participant') return savedRole;
    }
    return 'participant';
  });
  const [presenterMode, setPresenterMode] = useState<'present' | 'edit'>('present');
  
  // Segurança do Apresentador: Restaura da sessão se já foi autenticado nesta aba/sala
  const [isPresenterAuthenticated, setIsPresenterAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activePin = storageService.getActiveRoomCode() || DEFAULT_ROOM_CODE;
        return sessionStorage.getItem(`apresentalive_presenter_auth_${activePin}`) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Modal para perguntar se deseja iniciar nova apresentação ou retomar a anterior
  const [pendingResumeSession, setPendingResumeSession] = useState<{
    roomCode: string;
    roomTitle: string;
    session: SavedPresentationSession;
    targetView: AppView;
    pendingRoomData?: SavedRoom;
    pendingPresentation?: SavedPresentation;
  } | null>(null);

  // Estado da Sala (Apresentação, slides, participantes, respostas)
  const [roomCode, setRoomCode] = useState<string>(DEFAULT_ROOM_CODE);
  const [roomTitle, setRoomTitle] = useState<string>('Gincana & Slides Interativos');
  const [presenterPassword, setPresenterPassword] = useState<string>(DEFAULT_PRESENTER_PASSWORD);
  const [roomPassword, setRoomPassword] = useState<string | undefined>(undefined);
  const [slides, setSlides] = useState<Slide[]>(SAMPLE_PRESENTATION_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [teams, setTeams] = useState<Team[]>(PRESET_TEAMS);
  const [teamMode, setTeamMode] = useState<TeamMode>('random');
  const [participants, setParticipants] = useState<Record<string, Participant>>({});

  // Dinâmica do slide ativo
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [answersSubmitted, setAnswersSubmitted] = useState<Record<string, any>>({});
  const [imagePins, setImagePins] = useState<ImagePinSubmission[]>([]);
  const [termSubmissions, setTermSubmissions] = useState<TermSubmission[]>([]);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);

  // Dados do participante local nesta aba (restaura objeto completo de avatar, score e time após F5)
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('apresentalive_participant_obj') || localStorage.getItem('apresentalive_participant_current');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) return parsed.id;
        }
        return sessionStorage.getItem('apresentalive_participant_id') || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [localParticipant, setLocalParticipant] = useState<Participant | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('apresentalive_participant_obj') || localStorage.getItem('apresentalive_participant_current');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id && parsed.name) {
            return parsed;
          }
        }
        const id = sessionStorage.getItem('apresentalive_participant_id');
        const name = sessionStorage.getItem('apresentalive_participant_name');
        if (id && name) {
          return {
            id,
            name,
            avatar: sessionStorage.getItem('apresentalive_participant_avatar') || '🦊',
            score: 0,
            connectedAt: Date.now()
          };
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const localParticipantRef = useRef<Participant | null>(localParticipant);
  useEffect(() => {
    localParticipantRef.current = localParticipant;
  }, [localParticipant]);

  // Modo Apresentador Também Joga
  const [isPresenterPlaying, setIsPresenterPlaying] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('apresentalive_presenter_playing') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [presenterPlayerName, setPresenterPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('apresentalive_presenter_name') || 'Apresentador';
      } catch {
        return 'Apresentador';
      }
    }
    return 'Apresentador';
  });

  const [presenterPlayerAvatar, setPresenterPlayerAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('apresentalive_presenter_avatar') || '👑';
      } catch {
        return '👑';
      }
    }
    return '👑';
  });

  // Rastreamento de múltiplos co-apresentadores simultâneos na mesma sala
  const [coPresentersCount, setCoPresentersCount] = useState<number>(1);
  const coPresentersRef = useRef<Map<string, number>>(new Map());

  // Referência viva com o estado mais recente para responder a reconexões imediatas
  const stateRef = useRef({
    currentSlideIndex,
    showAnswers,
    timerRemaining,
    timerActive,
    teams,
    teamMode,
    slides,
    participants,
    role,
    isPresenterAuthenticated,
    roomCode
  });

  useEffect(() => {
    stateRef.current = {
      currentSlideIndex,
      showAnswers,
      timerRemaining,
      timerActive,
      teams,
      teamMode,
      slides,
      participants,
      role,
      isPresenterAuthenticated,
      roomCode
    };
  }, [
    currentSlideIndex,
    showAnswers,
    timerRemaining,
    timerActive,
    teams,
    teamMode,
    slides,
    participants,
    role,
    isPresenterAuthenticated,
    roomCode
  ]);

  // Salva automaticamente o estado da sessão local após qualquer mudança relevante para persistir em F5
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_current_view', appView);
        sessionStorage.setItem('apresentalive_current_role', role);
        sessionStorage.setItem(`apresentalive_presenter_auth_${roomCode}`, isPresenterAuthenticated ? 'true' : 'false');
        if (localParticipant) {
          sessionStorage.setItem('apresentalive_participant_obj', JSON.stringify(localParticipant));
          sessionStorage.setItem('apresentalive_participant_id', localParticipant.id);
          sessionStorage.setItem('apresentalive_participant_name', localParticipant.name);
          if (localParticipant.avatar) sessionStorage.setItem('apresentalive_participant_avatar', localParticipant.avatar);
          localStorage.setItem('apresentalive_participant_current', JSON.stringify(localParticipant));
          localStorage.setItem(`apresentalive_participant_${roomCode}`, JSON.stringify(localParticipant));
        }
      } catch {
        // ignore
      }
    }
  }, [appView, role, isPresenterAuthenticated, roomCode, localParticipant]);

  // Se for o apresentador, salva o snapshot da apresentação no storageService
  useEffect(() => {
    if (role === 'presenter' && isPresenterAuthenticated && roomCode) {
      storageService.saveSession({
        roomCode,
        roomTitle,
        currentSlideIndex,
        participants,
        answersSubmitted,
        imagePins,
        termSubmissions,
        teams,
        teamMode,
        slides
      });
    }
  }, [
    role,
    isPresenterAuthenticated,
    roomCode,
    roomTitle,
    currentSlideIndex,
    participants,
    answersSubmitted,
    imagePins,
    termSubmissions,
    teams,
    teamMode,
    slides
  ]);

  // Auto-reconexão do participante ao recarregar a página (F5)
  useEffect(() => {
    if (localParticipant && role === 'participant' && roomCode) {
      const reconnectTimer = setTimeout(() => {
        realtimeService.broadcast('PARTICIPANT_JOIN', roomCode, localParticipant.id, {
          participant: localParticipant
        });
        realtimeService.broadcast('REQUEST_FULL_STATE', roomCode, localParticipant.id, {});
      }, 400);

      return () => clearTimeout(reconnectTimer);
    }
  }, [roomCode, role]);

  // Referência para timer interval
  const timerRef = useRef<any>(null);

  // Função para abrir o Telão da Apresentação em uma nova janela / 2ª Tela
  const handleOpenProjectorWindow = (targetPin: string = roomCode) => {
    const cleanPin = targetPin.trim().toUpperCase() || roomCode;
    const baseUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : '';
    const url = `${baseUrl}?view=presentation&pin=${cleanPin}&projector=true`;
    window.open(
      url,
      `ApresentaLive_Telao_${cleanPin}`,
      'popup=yes,width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
  };

  // Carrega a sala salva ativa no armazenamento local ou inicializa
  useEffect(() => {
    try {
      const activeCode = storageService.getActiveRoomCode() || DEFAULT_ROOM_CODE;
      const room = storageService.getSavedRoom(activeCode) || storageService.getSavedRooms()[0];
      if (room) {
        setRoomCode(room.roomCode);
        setRoomTitle(room.roomTitle);
        setPresenterPassword(room.presenterPassword);
        if (room.roomPassword !== undefined) setRoomPassword(room.roomPassword);
        if (room.slides && room.slides.length > 0) {
          setSlides(room.slides);
        }
        if (room.teamMode) setTeamMode(room.teamMode);
        if (room.teams && room.teams.length > 0) setTeams(room.teams);
      }
    } catch (e) {
      console.warn('Não foi possível carregar sala salva:', e);
    }
  }, []);

  // Detecta parâmetros de URL ao carregar (ex: ?pin=749201 ou ?view=presentation&projector=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPin = params.get('pin');
      const urlView = params.get('view');
      const isProj = params.get('projector') === 'true';
      const urlRole = params.get('role');

      if (urlPin) {
        const cleanPin = urlPin.replace(/\s+/g, '').toUpperCase();
        setRoomCode(cleanPin);

        // Se houver dados locais salvos desta sala, carrega
        const saved = storageService.getSavedRoom(cleanPin);
        if (saved) {
          setRoomTitle(saved.roomTitle);
          setPresenterPassword(saved.presenterPassword);
          if (saved.roomPassword !== undefined) setRoomPassword(saved.roomPassword);
          if (saved.slides && saved.slides.length > 0) setSlides(saved.slides);
          if (saved.teams && saved.teams.length > 0) setTeams(saved.teams);
          if (saved.teamMode) setTeamMode(saved.teamMode);
        }

        if (urlView === 'presentation' || isProj) {
          setAppView('presentation');
          setIsProjectorMode(true);
          setRole('participant'); // Modo observador/projetor
        } else {
          setRole('participant');
          setAppView('participants');
        }
      } else if (urlView === 'presentation') {
        setAppView('presentation');
        if (isProj) setIsProjectorMode(true);
      } else if (urlRole === 'guest') {
        setRole('participant');
        setAppView('participants');
      }
    }
  }, []);

  // Configura o roomCode no serviço de tempo real
  useEffect(() => {
    realtimeService.setRoomCode(roomCode, role);
  }, [roomCode, role]);

  // Referência para controlar mudança real de slide
  const prevSlideIndexRef = useRef<number>(currentSlideIndex);

  // Inicializa o timer quando o índice do slide realmente muda
  useEffect(() => {
    if (prevSlideIndexRef.current !== currentSlideIndex) {
      prevSlideIndexRef.current = currentSlideIndex;
      const currentSlide = slides[currentSlideIndex];
      if (currentSlide && currentSlide.timeLimitSeconds && currentSlide.timeLimitSeconds > 0) {
        setTimerRemaining(currentSlide.timeLimitSeconds);
        setTimerActive(false);
      } else {
        setTimerRemaining(null);
        setTimerActive(false);
      }
      setShowAnswers(false);
      setAnswersSubmitted({});
      setImagePins([]);
      setTermSubmissions([]);

      // Transmite sincronização para os participantes conectados
      if (role === 'presenter' && isPresenterAuthenticated) {
        realtimeService.broadcast('CHANGE_SLIDE', roomCode, 'presenter', {
          currentSlideIndex,
          timeLimitSeconds: currentSlide?.timeLimitSeconds,
          showAnswers: false,
          slideType: currentSlide?.type
        });
      }
    }
  }, [currentSlideIndex, slides, role, isPresenterAuthenticated, roomCode]);

  // Loop de contagem regressiva do timer
  useEffect(() => {
    if (timerActive && timerRemaining !== null && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev !== null && prev > 1) {
            const nextVal = prev - 1;
            if (role === 'presenter' && isPresenterAuthenticated) {
              realtimeService.broadcast('TIMER_TICK', roomCode, 'presenter', {
                remaining: nextVal
              });
            }
            return nextVal;
          }
          clearInterval(timerRef.current);
          if (role === 'presenter' && isPresenterAuthenticated) {
            setShowAnswers(true);
            realtimeService.broadcast('TIMER_EXPIRED', roomCode, 'presenter', {});
          }
          return 0;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerActive, timerRemaining, role, isPresenterAuthenticated, roomCode]);

  // Loop de contagem regressiva para o Jogo de Desenho (Gartic)
  useEffect(() => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    const gConfig = currentSlide.garticConfig;
    if (gConfig.roundState === 'drawing' && gConfig.timerActive && gConfig.timerRemaining !== undefined && gConfig.timerRemaining > 0) {
      const gTimer = setInterval(() => {
        setSlides((prev) => {
          const curr = prev[currentSlideIndex];
          if (!curr || !curr.garticConfig) return prev;
          const prevTime = curr.garticConfig.timerRemaining ?? 0;
          if (prevTime > 1) {
            const nextTime = prevTime - 1;
            const updated = {
              ...curr.garticConfig,
              timerRemaining: nextTime
            };
            const copy = [...prev];
            copy[currentSlideIndex] = { ...curr, garticConfig: updated };
            return copy;
          } else {
            // Tempo esgotado -> Fim da rodada
            const updated: GarticConfig = {
              ...curr.garticConfig,
              timerRemaining: 0,
              timerActive: false,
              roundState: 'round_end'
            };
            const copy = [...prev];
            copy[currentSlideIndex] = { ...curr, garticConfig: updated };

            if (role === 'presenter' && isPresenterAuthenticated) {
              realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
                currentSlideIndex,
                slides: copy,
                participants
              });
            }
            return copy;
          }
        });
      }, 1000);

      return () => clearInterval(gTimer);
    }
  }, [currentSlideIndex, slides, role, isPresenterAuthenticated, roomCode]);

  // Transmissão de sincronização em lote de estado (heartbeat leve do apresentador)
  useEffect(() => {
    if (role === 'presenter' && isPresenterAuthenticated) {
      const interval = setInterval(() => {
        realtimeService.broadcast('PRESENTER_HEARTBEAT', roomCode, 'presenter', {
          currentSlideIndex,
          active: true
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [
    role,
    isPresenterAuthenticated,
    currentSlideIndex,
    roomCode
  ]);

  // Receptor de Mensagens em Tempo Real (Eventos de Participantes e Apresentador)
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      // 1. Participante entrou na sala
      if (msg.type === 'PARTICIPANT_JOIN' && msg.payload?.participant) {
        const p = msg.payload.participant as Participant;
        setParticipants((prev) => {
          const next = { ...prev };
          const pNameLower = p.name.trim().toLowerCase();
          // Remove duplicatas anteriores com o mesmo nome
          Object.keys(next).forEach((k) => {
            if (k !== p.id && next[k].name.trim().toLowerCase() === pNameLower) {
              delete next[k];
            }
          });
          next[p.id] = p;

          if (stateRef.current.role === 'presenter' || stateRef.current.isPresenterAuthenticated) {
            realtimeService.broadcast('SYNC_STATE', stateRef.current.roomCode, 'presenter', {
              currentSlideIndex: stateRef.current.currentSlideIndex,
              showAnswers: stateRef.current.showAnswers,
              timerRemaining: stateRef.current.timerRemaining,
              timerActive: stateRef.current.timerActive,
              teams: stateRef.current.teams,
              teamMode: stateRef.current.teamMode,
              slides: stateRef.current.slides,
              participants: next
            });
          }
          return next;
        });
      }

      // 1.1 Pedido de sincronização completa de estado
      if (msg.type === 'REQUEST_FULL_STATE') {
        if (stateRef.current.role === 'presenter' || stateRef.current.isPresenterAuthenticated) {
          realtimeService.broadcast('SYNC_STATE', stateRef.current.roomCode, 'presenter', {
            currentSlideIndex: stateRef.current.currentSlideIndex,
            showAnswers: stateRef.current.showAnswers,
            timerRemaining: stateRef.current.timerRemaining,
            timerActive: stateRef.current.timerActive,
            teams: stateRef.current.teams,
            teamMode: stateRef.current.teamMode,
            slides: stateRef.current.slides,
            participants: stateRef.current.participants
          });
        }
      }

      // 2. Resposta de múltipla escolha enviada
      if (msg.type === 'SUBMIT_ANSWER' && msg.payload) {
        const { participantId, answer } = msg.payload;
        setAnswersSubmitted((prev) => ({ ...prev, [participantId]: answer }));

        // Computa pontuação competitiva com bônus de velocidade
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide && currentSlide.options) {
          const opt = currentSlide.options.find((o) => o.id === answer.selectedOption);
          if (opt && opt.isCorrect) {
            const basePoints = currentSlide.pointsBase || 1000;
            let earnedPoints = basePoints;

            if (currentSlide.speedBonus && currentSlide.timeLimitSeconds && timerRemaining !== null) {
              const speedRatio = Math.max(0, timerRemaining) / currentSlide.timeLimitSeconds;
              earnedPoints = Math.round(basePoints * (0.5 + 0.5 * speedRatio));
            }

            // Atualiza o participante e o time
            setParticipants((prev) => {
              const current = prev[participantId];
              if (!current) return prev;
              const updatedScore = current.score + earnedPoints;
              if (current.teamId) {
                setTeams((tList) =>
                  tList.map((t) => (t.id === current.teamId ? { ...t, score: t.score + earnedPoints } : t))
                );
              }
              return { ...prev, [participantId]: { ...current, score: updatedScore } };
            });
          }
        }
      }

      // 3. Pin de imagem enviado
      if (msg.type === 'SUBMIT_IMAGE_PIN' && msg.payload) {
        const { participantId, xPercent, yPercent } = msg.payload;
        const participantObj = participants[participantId];
        const newPin: ImagePinSubmission = {
          participantId,
          participantName: participantObj?.name || 'Participante',
          participantAvatar: participantObj?.avatar || '📍',
          teamColor: teams.find((t) => t.id === participantObj?.teamId)?.color,
          xPercent,
          yPercent,
          timestamp: Date.now()
        };
        setImagePins((prev) => [...prev.filter((p) => p.participantId !== participantId), newPin]);
      }

      // 4. Termo de Vocabulário / Sprint enviado
      if (msg.type === 'SUBMIT_TERM' && msg.payload) {
        const { participantId, term } = msg.payload;
        const participantObj = participants[participantId];
        const newTerm: TermSubmission = {
          participantId,
          participantName: participantObj?.name || 'Jogador',
          teamId: participantObj?.teamId,
          term,
          timestamp: Date.now(),
          isValid: true
        };
        setTermSubmissions((prev) => [...prev, newTerm]);

        // +100 pontos por termo válido
        setParticipants((prev) => {
          const current = prev[participantId];
          if (!current) return prev;
          const updatedScore = current.score + 100;
          if (current.teamId) {
            setTeams((tList) =>
              tList.map((t) => (t.id === current.teamId ? { ...t, score: t.score + 100 } : t))
            );
          }
          return { ...prev, [participantId]: { ...current, score: updatedScore } };
        });
      }

      // 5. Reação ao vivo enviada (coração, fogo, etc.)
      if (msg.type === 'SEND_REACTION' && msg.payload?.emoji) {
        const newReaction: LiveReaction = {
          id: `react-${Date.now()}-${Math.random()}`,
          emoji: msg.payload.emoji,
          x: Math.floor(Math.random() * 80) + 10
        };
        setReactions((prev) => [...prev.slice(-30), newReaction]);
      }

      // 6. Voto no Infiltrado
      if (msg.type === 'IMPOSTOR_VOTE' && msg.payload) {
        const { voterId, suspectId } = msg.payload;
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || !current.impostorConfig) return prevSlides;
          const updatedConfig: ImpostorConfig = {
            ...current.impostorConfig,
            votes: {
              ...current.impostorConfig.votes,
              [voterId]: suspectId
            }
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, impostorConfig: updatedConfig };
          return copy;
        });
      }

      // 6.1 Gartic Traço Desenhado (Tempo Real)
      if (msg.type === 'GARTIC_DRAW_STROKE' && msg.payload?.stroke) {
        const stroke = msg.payload.stroke as GarticStroke;
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const updated: GarticConfig = {
            ...current.garticConfig,
            strokes: [...(current.garticConfig.strokes || []), stroke]
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updated };
          return copy;
        });
      }

      // 6.2 Gartic Limpar Canvas
      if (msg.type === 'GARTIC_CLEAR_CANVAS') {
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const updated: GarticConfig = {
            ...current.garticConfig,
            strokes: []
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updated };
          return copy;
        });
      }

      // 6.3 Gartic Desfazer Último Traço
      if (msg.type === 'GARTIC_UNDO_CANVAS') {
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const currentStrokes = current.garticConfig.strokes || [];
          const updated: GarticConfig = {
            ...current.garticConfig,
            strokes: currentStrokes.slice(0, -1)
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updated };
          return copy;
        });
      }

      // 6.4 Gartic Escolha de Palavra pelo Desenhista
      if (msg.type === 'GARTIC_CHOOSE_WORD' && msg.payload?.word) {
        const chosenWord = msg.payload.word as string;
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const updated: GarticConfig = {
            ...current.garticConfig,
            secretWord: chosenWord,
            roundState: 'drawing',
            timerRemaining: current.garticConfig.roundTimeSeconds || 80,
            timerActive: true,
            strokes: [],
            guessedParticipantIds: [],
            chatGuesses: []
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updated };
          return copy;
        });
      }

      // 6.5 Gartic Envio de Palpite (Digital)
      if (msg.type === 'GARTIC_SUBMIT_GUESS' && msg.payload) {
        const { participantId, text } = msg.payload;
        const guesser = participants[participantId];
        const guesserName = guesser?.name || 'Jogador';
        const guesserAvatar = guesser?.avatar || '👤';

        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const gConfig = current.garticConfig;

          // Se já acertou ou é o desenhista, ignora
          if ((gConfig.guessedParticipantIds || []).includes(participantId) || gConfig.currentDrawerId === participantId) {
            return prevSlides;
          }

          const evalResult = evaluateGuess(text, gConfig.secretWord);
          const newGuessId = `guess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

          let newGuessedIds = [...(gConfig.guessedParticipantIds || [])];
          let updatedScores = { ...(gConfig.scores || {}) };
          let newChat = [...(gConfig.chatGuesses || [])];
          let pointsEarned = 0;

          if (evalResult.isCorrect) {
            // Pontuação por rapidez: 1º ganha 10 pts, 2º ganha 8 pts, 3º ganha 6 pts, demais 5 pts
            const guessOrder = newGuessedIds.length;
            pointsEarned = guessOrder === 0 ? 10 : guessOrder === 1 ? 8 : guessOrder === 2 ? 6 : 5;
            newGuessedIds.push(participantId);

            // Atualiza pontuação do acertador
            updatedScores[participantId] = (updatedScores[participantId] || 0) + pointsEarned;

            // O desenhista ganha pontos a cada acerto, mas diminui conforme as dicas reveladas
            // 0 dicas = 5 pts | 1 dica = 4 pts | 2 dicas = 3 pts | 3 dicas = 2 pts | 4+ dicas = 1 pt (mínimo 1 pt)
            const hintsCount = gConfig.hintsRevealedCount || 0;
            const drawerPoints = Math.max(1, 5 - hintsCount);

            if (gConfig.currentDrawerId) {
              updatedScores[gConfig.currentDrawerId] = (updatedScores[gConfig.currentDrawerId] || 0) + drawerPoints;
            }

            // Atualiza o participante global
            setParticipants((prev) => {
              const currentP = prev[participantId];
              if (!currentP) return prev;
              const next: Record<string, Participant> = {
                ...prev,
                [participantId]: { ...currentP, score: currentP.score + pointsEarned }
              };
              if (gConfig.currentDrawerId && next[gConfig.currentDrawerId]) {
                const drawerP = next[gConfig.currentDrawerId];
                next[gConfig.currentDrawerId] = { ...drawerP, score: drawerP.score + drawerPoints };
              }
              return next;
            });

            newChat.push({
              id: newGuessId,
              participantId,
              participantName: guesserName,
              participantAvatar: guesserAvatar,
              text,
              isCorrect: true,
              pointsEarned,
              timestamp: Date.now()
            });

            // Verifica se todos adivinharam -> encerra rodada
            const totalGuessers = Object.values(participants).filter((p) => p.id !== gConfig.currentDrawerId).length;
            const allGuessed = totalGuessers > 0 && newGuessedIds.length >= totalGuessers;

            // Verifica se alguém atingiu a meta de pontos -> fim de jogo
            const targetScore = gConfig.targetScore || 120;
            const winnerEntry = Object.entries(updatedScores).find(([_, sc]) => sc >= targetScore);

            const nextState = winnerEntry
              ? 'game_over'
              : allGuessed
              ? 'round_end'
              : gConfig.roundState;

            const updatedConfig: GarticConfig = {
              ...gConfig,
              guessedParticipantIds: newGuessedIds,
              scores: updatedScores,
              chatGuesses: newChat,
              roundState: nextState,
              winnerId: winnerEntry ? winnerEntry[0] : undefined,
              winnerName: winnerEntry ? participants[winnerEntry[0]]?.name : undefined,
              winnerAvatar: winnerEntry ? participants[winnerEntry[0]]?.avatar : undefined
            };

            const copy = [...prevSlides];
            copy[currentSlideIndex] = { ...current, garticConfig: updatedConfig };

            if (role === 'presenter') {
              realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
                currentSlideIndex,
                showAnswers,
                timerRemaining,
                timerActive,
                teams,
                teamMode,
                slides: copy,
                participants
              });
            }

            return copy;
          } else if (evalResult.isClose) {
            newChat.push({
              id: newGuessId,
              participantId,
              participantName: guesserName,
              participantAvatar: guesserAvatar,
              text,
              isClose: true,
              timestamp: Date.now()
            });
          } else {
            newChat.push({
              id: newGuessId,
              participantId,
              participantName: guesserName,
              participantAvatar: guesserAvatar,
              text,
              timestamp: Date.now()
            });
          }

          const updatedConfig: GarticConfig = {
            ...gConfig,
            chatGuesses: newChat.slice(-50)
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updatedConfig };
          return copy;
        });
      }

      // 6.6 Gartic Validação Presencial pelo Apresentador
      if (msg.type === 'GARTIC_IN_PERSON_CORRECT') {
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const gConfig = current.garticConfig;
          const updatedScores = { ...(gConfig.scores || {}) };

          if (gConfig.currentDrawerId) {
            updatedScores[gConfig.currentDrawerId] = (updatedScores[gConfig.currentDrawerId] || 0) + 10;
          }

          const copy = [...prevSlides];
          copy[currentSlideIndex] = {
            ...current,
            garticConfig: {
              ...gConfig,
              scores: updatedScores,
              roundState: 'round_end'
            }
          };
          return copy;
        });
      }

      // 6.7 Gartic Revelar Dica de Letra pelo Desenhista
      if (msg.type === 'GARTIC_REVEAL_HINT') {
        setSlides((prevSlides) => {
          const current = prevSlides[currentSlideIndex];
          if (!current || current.type !== 'game_drawing_gartic' || !current.garticConfig) return prevSlides;
          const gConfig = current.garticConfig;
          const currentRevealed = gConfig.revealedLetterIndices || [];
          const nextIdx = getNextHintIndex(gConfig.secretWord, currentRevealed);
          if (nextIdx === null) return prevSlides;

          const updatedRevealed = [...currentRevealed, nextIdx];
          const newHintsCount = (gConfig.hintsRevealedCount || 0) + 1;
          const updated: GarticConfig = {
            ...gConfig,
            revealedLetterIndices: updatedRevealed,
            hintsRevealedCount: newHintsCount
          };
          const copy = [...prevSlides];
          copy[currentSlideIndex] = { ...current, garticConfig: updated };

          if (role === 'presenter') {
            realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
              currentSlideIndex,
              showAnswers,
              timerRemaining,
              timerActive,
              teams,
              teamMode,
              slides: copy,
              participants
            });
          }

          return copy;
        });
      }

      // 7. Sincronização geral de estado recebida pelo Participante, Projetor ou Co-Apresentador
      if (msg.type === 'SYNC_STATE' && msg.payload) {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (isFromSelf) return;

        // Se somos apresentador e a mensagem veio de outro apresentador, registra co-apresentador
        if (role === 'presenter' && msg.senderClientId) {
          coPresentersRef.current.set(msg.senderClientId, Date.now());
          const now = Date.now();
          for (const [id, ts] of coPresentersRef.current.entries()) {
            if (now - ts > 10000) coPresentersRef.current.delete(id);
          }
          setCoPresentersCount(coPresentersRef.current.size + 1);
        }

        const data = msg.payload;
        if (data.currentSlideIndex !== undefined) setCurrentSlideIndex(data.currentSlideIndex);
        if (data.showAnswers !== undefined) setShowAnswers(data.showAnswers);
        if (data.timerRemaining !== undefined) setTimerRemaining(data.timerRemaining);
        if (data.timerActive !== undefined) setTimerActive(data.timerActive);
        if (data.teams) setTeams(data.teams);
        if (data.teamMode) setTeamMode(data.teamMode);
        if (data.slides && data.slides.length > 0) setSlides(data.slides);
        if (data.participants) {
          const myLocal = localParticipantRef.current;
          setParticipants((prev) => {
            const merged = { ...data.participants };
            if (myLocal) {
              merged[myLocal.id] = {
                ...myLocal,
                ...(data.participants[myLocal.id] || {})
              };
            }
            return merged;
          });
          if (myLocal && data.participants[myLocal.id]) {
            setLocalParticipant((prev) => prev ? ({ ...prev, ...data.participants[prev.id] }) : null);
          }
        }
      }

      // 8. Participante Saiu da Sala
      if (msg.type === 'PARTICIPANT_LEAVE' && msg.payload?.participantId) {
        const pId = msg.payload.participantId;
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
        if (localParticipantId === pId || localParticipantRef.current?.id === pId) {
          setLocalParticipantId(null);
          setLocalParticipant(null);
          localParticipantRef.current = null;
        }
      }

      // 9. Participante Removido / Expulso pelo Apresentador
      if (msg.type === 'PARTICIPANT_KICK' && msg.payload?.participantId) {
        const pId = msg.payload.participantId;
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
        if (localParticipantId === pId || localParticipantRef.current?.id === pId) {
          alert('Você foi removido da sala pelo apresentador.');
          setLocalParticipantId(null);
          setLocalParticipant(null);
          localParticipantRef.current = null;
          try {
            sessionStorage.removeItem('apresentalive_participant_id');
            sessionStorage.removeItem('apresentalive_participant_name');
          } catch {
            // ignore
          }
        }
      }

      // 10. Participante Banido pelo Apresentador
      if (msg.type === 'PARTICIPANT_BAN' && msg.payload?.participantId) {
        const pId = msg.payload.participantId;
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
        if (localParticipantId === pId || localParticipantRef.current?.id === pId) {
          alert('Você foi banido desta sala pelo apresentador.');
          setLocalParticipantId(null);
          setLocalParticipant(null);
          localParticipantRef.current = null;
          try {
            sessionStorage.removeItem('apresentalive_participant_id');
            sessionStorage.removeItem('apresentalive_participant_name');
            sessionStorage.setItem(`apresentalive_banned_${roomCode}`, 'true');
          } catch {
            // ignore
          }
        }
      }

      // Reset Geral da Apresentação pelo Apresentador
      if (msg.type === 'RESET_PRESENTATION') {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (!isFromSelf) {
          setParticipants({});
          setAnswersSubmitted({});
          setImagePins([]);
          setTermSubmissions([]);
          setReactions([]);
          setShowAnswers(false);
          setTimerActive(false);
          setTimerRemaining(null);
          setCurrentSlideIndex(0);
          setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
          setSlides((prev) =>
            prev.map((s) => {
              if (!s.impostorConfig) return s;
              return {
                ...s,
                impostorConfig: {
                  ...s.impostorConfig,
                  gameStarted: false,
                  votingActive: false,
                  currentRound: 1,
                  revealState: 'words_shown',
                  winner: undefined,
                  votes: {},
                  agentParticipantIds: [],
                  impostorParticipantIds: [],
                  eliminatedParticipantIds: [],
                  lastEliminatedId: undefined,
                  lastEliminatedName: undefined,
                  lastEliminatedAvatar: undefined,
                  lastEliminatedVotes: undefined,
                  lastEliminatedWasImpostor: undefined,
                  revealWordToInvestigators: false
                }
              };
            })
          );
          if (localParticipantId) {
            setLocalParticipantId(null);
            setLocalParticipant(null);
            localParticipantRef.current = null;
            try {
              sessionStorage.removeItem('apresentalive_participant_id');
              sessionStorage.removeItem('apresentalive_participant_name');
            } catch {
              // ignore
            }
          }
        }
      }

      // 11. Troca de slide direta (sincroniza tanto participantes quanto co-apresentadores)
      if (msg.type === 'CHANGE_SLIDE' && msg.payload) {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (isFromSelf) return;

        if (role === 'presenter' && msg.senderClientId) {
          coPresentersRef.current.set(msg.senderClientId, Date.now());
          setCoPresentersCount(coPresentersRef.current.size + 1);
        }

        if (msg.payload.currentSlideIndex !== undefined) {
          setCurrentSlideIndex(msg.payload.currentSlideIndex);
        }
        if (msg.payload.showAnswers !== undefined) {
          setShowAnswers(msg.payload.showAnswers);
        }
        if (msg.payload.timeLimitSeconds !== undefined) {
          setTimerRemaining(msg.payload.timeLimitSeconds);
        }
      }

      // 12. Tique do cronômetro
      if (msg.type === 'TIMER_TICK' && msg.payload) {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (isFromSelf) return;

        if (msg.payload.remaining !== undefined) {
          setTimerRemaining(msg.payload.remaining);
          setTimerActive(true);
        }
      }

      // 13. Cronômetro esgotado
      if (msg.type === 'TIMER_EXPIRED') {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (isFromSelf) return;

        setTimerRemaining(0);
        setTimerActive(false);
        setShowAnswers(true);
      }

      // 14. Solicitação de estado completo (novo participante, projetor ou co-apresentador conectou)
      if (msg.type === 'REQUEST_FULL_STATE' && role === 'presenter') {
        realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
          currentSlideIndex,
          showAnswers,
          timerRemaining,
          timerActive,
          teams,
          teamMode,
          slides,
          participants
        });
      }

      // 15. Heartbeat de co-apresentador ativo na sala
      if (msg.type === 'PRESENTER_HEARTBEAT') {
        const isFromSelf = Boolean(msg.senderClientId && msg.senderClientId === realtimeService.getClientId());
        if (!isFromSelf && msg.senderClientId) {
          coPresentersRef.current.set(msg.senderClientId, Date.now());
          const now = Date.now();
          for (const [id, ts] of coPresentersRef.current.entries()) {
            if (now - ts > 10000) coPresentersRef.current.delete(id);
          }
          setCoPresentersCount(coPresentersRef.current.size + 1);
        }
      }
    });

    return () => unsubscribe();
  }, [
    role,
    slides,
    currentSlideIndex,
    timerRemaining,
    timerActive,
    showAnswers,
    teams,
    teamMode,
    participants,
    roomCode,
    localParticipantId
  ]);

  // Ação de entrada de participante local
  const handleJoinParticipant = (data: {
    name: string;
    avatar: string;
    roomCode: string;
    teamId?: string;
  }) => {
    const cleanName = data.name.trim();
    const cleanNameLower = cleanName.toLowerCase();

    // Verificar se já existe um participante com este nome na sala (reconexão ou atualização de aba)
    const existing = Object.values(participants).find(
      (p) => p.name.trim().toLowerCase() === cleanNameLower
    );

    let assignedTeamId = data.teamId || existing?.teamId;

    // Se for sorteio proporcional automático
    if (teamMode === 'random' && teams.length > 0 && !assignedTeamId) {
      const pList = Object.values(participants);
      const teamCounts: Record<string, number> = {};
      teams.forEach((t) => (teamCounts[t.id] = 0));
      pList.forEach((p) => {
        if (p.teamId && teamCounts[p.teamId] !== undefined) teamCounts[p.teamId]++;
      });

      const leastPopulatedTeam = teams.reduce((prev, curr) =>
        teamCounts[curr.id] < teamCounts[prev.id] ? curr : prev
      );
      assignedTeamId = leastPopulatedTeam.id;
    }

    const participantId = existing?.id || localParticipantId || `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newParticipant: Participant = {
      id: participantId,
      name: cleanName,
      avatar: data.avatar,
      teamId: assignedTeamId,
      score: existing?.score || 0,
      connectedAt: existing?.connectedAt || Date.now(),
      isAgent: existing?.isAgent,
      isImpostor: existing?.isImpostor
    };

    setLocalParticipantId(newParticipant.id);
    setLocalParticipant(newParticipant);
    localParticipantRef.current = newParticipant;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_participant_id', newParticipant.id);
        sessionStorage.setItem('apresentalive_participant_name', newParticipant.name);
      } catch {
        // ignore
      }
    }

    setParticipants((prev) => {
      const next = { ...prev };
      // Remove qualquer registro duplicado com o mesmo nome para manter sempre 1 registro único
      Object.keys(next).forEach((k) => {
        if (k !== newParticipant.id && next[k].name.trim().toLowerCase() === cleanNameLower) {
          delete next[k];
        }
      });
      next[newParticipant.id] = newParticipant;
      return next;
    });

    realtimeService.broadcast('PARTICIPANT_JOIN', roomCode, newParticipant.id, {
      participant: newParticipant
    });

    // Solicita imediatamente a sincronização de estado completo para a sala
    realtimeService.broadcast('REQUEST_FULL_STATE', roomCode, newParticipant.id, {});
  };

  // Expulsar participante da sala
  const handleKickParticipant = (participantId: string) => {
    setParticipants((prev) => {
      const next = { ...prev };
      delete next[participantId];
      return next;
    });
    realtimeService.broadcast('PARTICIPANT_KICK', roomCode, 'presenter', {
      participantId
    });
  };

  // Banir participante da sala
  const handleBanParticipant = (participantId: string) => {
    const targetName = participants[participantId]?.name;
    setParticipants((prev) => {
      const next = { ...prev };
      delete next[participantId];
      return next;
    });
    const saved = storageService.getSavedRoom(roomCode);
    if (saved) {
      const bannedIds = saved.bannedParticipantIds || [];
      const bannedNames = saved.bannedParticipantNames || [];
      const newBannedIds = bannedIds.includes(participantId) ? bannedIds : [...bannedIds, participantId];
      const newBannedNames = (targetName && !bannedNames.includes(targetName.trim().toLowerCase()))
        ? [...bannedNames, targetName.trim().toLowerCase()]
        : bannedNames;

      storageService.saveRoom({
        ...saved,
        bannedParticipantIds: newBannedIds,
        bannedParticipantNames: newBannedNames
      });
    }
    realtimeService.broadcast('PARTICIPANT_BAN', roomCode, 'presenter', {
      participantId
    });
  };

  // Participante saindo voluntariamente da sala
  const handleLeaveRoom = () => {
    if (!currentLocalParticipant) return;
    const pId = currentLocalParticipant.id;

    realtimeService.broadcast('PARTICIPANT_LEAVE', roomCode, pId, {
      participantId: pId
    });

    setParticipants((prev) => {
      const next = { ...prev };
      delete next[pId];
      return next;
    });

    setLocalParticipantId(null);
    setLocalParticipant(null);
    localParticipantRef.current = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('apresentalive_participant_id');
        sessionStorage.removeItem('apresentalive_participant_name');
      } catch {
        // ignore
      }
    }
  };

  // Transmissão direta de troca de slide para todos os participantes e telas secundárias
  const broadcastSlideChange = (newIndex: number) => {
    setShowAnswers(false);
    const newSlide = slides[newIndex];
    const newTimer = newSlide?.timeLimitSeconds || null;
    if (newTimer) {
      setTimerRemaining(newTimer);
      setTimerActive(false);
    } else {
      setTimerRemaining(null);
      setTimerActive(false);
    }

    // Transmite via WebSocket/MQTT/BroadcastChannel instantaneamente para todos os participantes
    realtimeService.broadcast('CHANGE_SLIDE', roomCode, 'presenter', {
      currentSlideIndex: newIndex,
      showAnswers: false,
      timeLimitSeconds: newTimer
    });

    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex: newIndex,
      showAnswers: false,
      timerRemaining: newTimer,
      timerActive: false,
      teams,
      teamMode,
      slides,
      participants
    });

    // Salvar estado no banco local
    const saved = storageService.getSavedRoom(roomCode);
    if (saved) {
      storageService.saveRoom({
        ...saved,
        slides,
        updatedAt: Date.now()
      });
    }
  };

  // Botões de navegação de slides do apresentador
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      const nextIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(nextIdx);
      broadcastSlideChange(nextIdx);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      broadcastSlideChange(nextIdx);
    }
  };

  const handleGoToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
      broadcastSlideChange(index);
    }
  };

  // Adicionar 5 participantes simulados (Bots) para teste
  const handleAddSimulatedParticipants = () => {
    const demoBots = [
      { id: 'bot-lucas', name: 'Lucas', avatar: '🦁' },
      { id: 'bot-mariana', name: 'Mariana', avatar: '🦊' },
      { id: 'bot-pedro', name: 'Pedro', avatar: '🚀' },
      { id: 'bot-beatriz', name: 'Beatriz', avatar: '🐱' },
      { id: 'bot-felipe', name: 'Felipe', avatar: '🤖' }
    ];

    setParticipants((prev) => {
      const newPartsMap: Record<string, Participant> = { ...prev };

      demoBots.forEach((bot, idx) => {
        // Encontra se já existe um participante ou bot com este nome
        const existingKey = Object.keys(newPartsMap).find(
          (k) => newPartsMap[k].name.trim().toLowerCase() === bot.name.toLowerCase() || k === bot.id
        );
        const id = existingKey || bot.id;
        const assignedTeam = teams[idx % teams.length];
        newPartsMap[id] = {
          id,
          name: bot.name,
          avatar: bot.avatar,
          teamId: newPartsMap[id]?.teamId || (teamMode !== 'none' ? assignedTeam?.id : undefined),
          score: newPartsMap[id]?.score || Math.floor(Math.random() * 600) + 200,
          connectedAt: newPartsMap[id]?.connectedAt || Date.now(),
          isAgent: newPartsMap[id]?.isAgent,
          isImpostor: newPartsMap[id]?.isImpostor
        };
      });

      return newPartsMap;
    });

    // Disparar respostas simuladas nos bots
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide?.options && currentSlide.options.length > 0) {
      setTimeout(() => {
        const simulatedAnswers: Record<string, any> = {};
        demoBots.forEach((bot) => {
          const randomOpt =
            currentSlide.options![Math.floor(Math.random() * currentSlide.options!.length)];
          simulatedAnswers[bot.id] = { selectedOption: randomOpt.id, timestamp: Date.now() };
        });
        setAnswersSubmitted((prev) => ({ ...prev, ...simulatedAnswers }));
      }, 1200);
    }
  };

  // Funções do Jogo O Infiltrado
  const handleUpdateImpostorConfig = (patch: Partial<ImpostorConfig>) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    const updatedConfig = { ...currentSlide.impostorConfig, ...patch };
    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, impostorConfig: updatedConfig };
    setSlides(copy);

    // Salva a alteração na sala atual
    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle,
      presenterPassword,
      slides: copy,
      teamMode,
      teams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    storageService.saveRoom(currentData);

    // Se agentParticipantIds ou impostorParticipantIds mudaram, sincroniza com participants
    if (patch.agentParticipantIds !== undefined || patch.impostorParticipantIds !== undefined) {
      const agentIds = updatedConfig.agentParticipantIds || [];
      const impostorIds = updatedConfig.impostorParticipantIds || [];

      setParticipants((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const isAgent = agentIds.includes(id);
          const isImpostor = impostorIds.includes(id);
          next[id] = { ...next[id], isAgent, isImpostor };
        });

        // Transmissão imediata via realtime para todos os participantes
        realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
          currentSlideIndex,
          showAnswers,
          timerRemaining,
          timerActive,
          teams,
          teamMode,
          slides: copy,
          participants: next
        });

        return next;
      });
    } else {
      realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
        currentSlideIndex,
        showAnswers,
        timerRemaining,
        timerActive,
        teams,
        teamMode,
        slides: copy,
        participants
      });
    }
  };

  const handleStartImpostorVoting = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    const config = currentSlide.impostorConfig;
    const participantList = Object.values(participants);

    let agentIds = [...(config.agentParticipantIds || [])];
    let impostorIds = [...(config.impostorParticipantIds || [])];
    const targetAgents = config.numAgents || 4;
    const targetImpostors = config.numImpostors || 1;

    // Se for modo investigador e não tem agentes suficientes, sorteia entre os participantes
    if (config.mode === 'investigator') {
      if (agentIds.length < targetAgents && participantList.length > 0) {
        const shuffled = [...participantList].sort(() => 0.5 - Math.random());
        agentIds = shuffled.slice(0, Math.min(targetAgents, shuffled.length)).map((p) => p.id);
      }
      // Se não há impostor dentre os agentes, sorteia N impostores dentre os agentes
      if (impostorIds.length === 0 && agentIds.length > 0) {
        const shuffledAgents = [...agentIds].sort(() => 0.5 - Math.random());
        impostorIds = shuffledAgents.slice(0, Math.min(targetImpostors, agentIds.length));
      }
      // Garante que o infiltrado está SEMPRE na lista de agentes no palco
      impostorIds.forEach((impId) => {
        if (!agentIds.includes(impId)) {
          agentIds.push(impId);
        }
      });
    } else {
      // Modo clássico
      if (impostorIds.length === 0 && participantList.length > 0) {
        const shuffled = [...participantList].sort(() => 0.5 - Math.random());
        impostorIds = shuffled.slice(0, Math.min(targetImpostors, participantList.length)).map((p) => p.id);
      }
    }

    // Sincroniza participantes
    setParticipants((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          isAgent: agentIds.includes(id),
          isImpostor: impostorIds.includes(id)
        };
      });
      return updated;
    });

    handleUpdateImpostorConfig({
      votingActive: true,
      agentParticipantIds: agentIds,
      impostorParticipantIds: impostorIds,
      votes: {}
    });
  };

  const handleRevealImpostor = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    const config = currentSlide.impostorConfig;
    const eliminatedSoFar = config.eliminatedIds || [];

    // Calcular quem teve mais votos entre os que não foram eliminados
    const voteCounts: Record<string, number> = {};
    Object.values(config.votes || {}).forEach((suspectId) => {
      if (!eliminatedSoFar.includes(suspectId)) {
        voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
      }
    });

    let mostVotedId: string | null = null;
    let maxVotes = -1;
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = id;
      }
    });

    // Se ninguém votou ou houve empate sem votos, pega um agente ativo aleatório
    if (!mostVotedId) {
      const activeCandidates = (config.agentParticipantIds && config.agentParticipantIds.length > 0
        ? config.agentParticipantIds
        : Object.keys(participants)
      ).filter(id => !eliminatedSoFar.includes(id));
      if (activeCandidates.length > 0) {
        mostVotedId = activeCandidates[0];
      }
    }

    const wasImpostor = mostVotedId !== null && (config.impostorParticipantIds || []).includes(mostVotedId);
    const newEliminatedIds = mostVotedId ? [...eliminatedSoFar, mostVotedId] : eliminatedSoFar;

    // Verificar se todos os infiltrados foram eliminados
    const remainingImpostors = (config.impostorParticipantIds || []).filter(
      (id) => !newEliminatedIds.includes(id)
    );

    const currentRound = config.currentRound || 1;
    const roundsTotal = config.roundsTotal || 3;

    let winner: 'civilians' | 'impostors' | 'agents' | undefined = undefined;

    if (remainingImpostors.length === 0) {
      // Agentes venceram! Todos os infiltrados foram eliminados.
      winner = 'agents';
    } else if (currentRound >= roundsTotal) {
      // Acabaram as rodadas e ainda restam infiltrados -> Infiltrados venceram!
      winner = 'impostors';
    }

    const eliminatedPerson = mostVotedId ? participants[mostVotedId] : null;
    const eliminatedName = eliminatedPerson?.name || 'Jogador';
    const eliminatedAvatar = eliminatedPerson?.avatar || '👤';
    const eliminatedVotes = mostVotedId ? (voteCounts[mostVotedId] || 0) : 0;

    handleUpdateImpostorConfig({
      votingActive: false,
      revealState: 'round_elimination',
      lastEliminatedId: mostVotedId || undefined,
      lastEliminatedName: eliminatedName,
      lastEliminatedAvatar: eliminatedAvatar,
      lastEliminatedVotes: eliminatedVotes,
      lastEliminatedWasImpostor: wasImpostor,
      eliminatedIds: newEliminatedIds,
      winner
    });
  };

  // Seguir para a próxima rodada
  const handleAdvanceToNextRound = (changeWord: boolean = true) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    const config = currentSlide.impostorConfig;
    const nextRound = (config.currentRound || 1) + 1;

    let newWord = config.secretWord;
    if (changeWord) {
      const catName = config.category || 'Personagens Bíblicos';
      const cat = PRESET_WORD_CATEGORIES.find((c) => c.name === catName) || PRESET_WORD_CATEGORIES[0];
      const customList = config.customWordList;
      const wordsPool = customList && customList.length > 0 ? customList : cat.words;
      // Seleciona uma palavra diferente se possível
      const availableWords = wordsPool.filter((w) => w !== config.secretWord);
      const chosenPool = availableWords.length > 0 ? availableWords : wordsPool;
      newWord = chosenPool[Math.floor(Math.random() * chosenPool.length)] || 'Moisés';
    }

    handleUpdateImpostorConfig({
      currentRound: nextRound,
      secretWord: newWord,
      votingActive: false,
      revealState: 'words_shown',
      votes: {}
    });
  };

  const handleToggleRevealWordToInvestigators = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;
    handleUpdateImpostorConfig({
      revealWordToInvestigators: !currentSlide.impostorConfig.revealWordToInvestigators
    });
  };

  // Iniciar jogo do Infiltrado pelo apresentador ou participante
  const handleStartImpostorGame = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    const config = currentSlide.impostorConfig;
    let currentParts = { ...participants };
    let participantList = Object.values(currentParts);

    // 1. Sorteio de Palavra Secreta (se não houver uma pré-selecionada)
    let wordToUse = config.secretWord?.trim();
    if (!wordToUse) {
      const catName = config.category || 'Personagens Bíblicos';
      const cat = PRESET_WORD_CATEGORIES.find((c) => c.name === catName) || PRESET_WORD_CATEGORIES[0];
      const customList = config.customWordList;
      const wordsPool = (customList && customList.length > 0) ? customList : (cat ? cat.words : ['Moisés', 'Apostólo Paulo', 'Davi', 'Golias']);
      wordToUse = wordsPool[Math.floor(Math.random() * wordsPool.length)] || 'Moisés';
    }

    // 2. Se a lista de participantes estiver vazia, gera bots simulados para o jogo rodar imediatamente
    if (participantList.length === 0) {
      const demoBots = [
        { id: 'bot-lucas', name: 'Lucas', avatar: '🦁' },
        { id: 'bot-mariana', name: 'Mariana', avatar: '🦊' },
        { id: 'bot-pedro', name: 'Pedro', avatar: '🚀' },
        { id: 'bot-beatriz', name: 'Beatriz', avatar: '🐱' }
      ];
      demoBots.forEach((bot) => {
        currentParts[bot.id] = {
          id: bot.id,
          name: bot.name,
          avatar: bot.avatar,
          score: 0,
          connectedAt: Date.now()
        };
      });
      participantList = Object.values(currentParts);
    }

    // 3. Sorteio de Agentes e Infiltrado
    let agentIds: string[] = [];
    let impostorIds: string[] = [];
    const targetAgents = config.numAgents || Math.min(4, Math.max(1, participantList.length));
    const targetImpostors = config.numImpostors || 1;

    const shuffled = [...participantList].sort(() => 0.5 - Math.random());

    if (config.mode === 'investigator') {
      agentIds = shuffled.slice(0, Math.min(targetAgents, shuffled.length)).map((p) => p.id);
      const shuffledAgents = [...agentIds].sort(() => 0.5 - Math.random());
      impostorIds = shuffledAgents.slice(0, Math.min(targetImpostors, agentIds.length));
    } else {
      // Modo Clássico
      impostorIds = shuffled.slice(0, Math.min(targetImpostors, participantList.length)).map((p) => p.id);
      agentIds = participantList.map((p) => p.id).filter((id) => !impostorIds.includes(id));
    }

    // Garante que o Infiltrado também é um participante
    impostorIds.forEach((impId) => {
      if (!agentIds.includes(impId)) agentIds.push(impId);
    });

    // Sincroniza participantes
    Object.keys(currentParts).forEach((id) => {
      currentParts[id] = {
        ...currentParts[id],
        isAgent: agentIds.includes(id),
        isImpostor: impostorIds.includes(id)
      };
    });

    setParticipants(currentParts);

    // 4. Atualiza a configuração do Infiltrado no slide e inicia o jogo
    const updatedConfig: ImpostorConfig = {
      ...config,
      gameStarted: true,
      secretWord: wordToUse,
      agentParticipantIds: agentIds,
      impostorParticipantIds: impostorIds,
      revealState: 'words_shown',
      votingActive: false,
      votes: {},
      currentRound: 1,
      eliminatedIds: [],
      lastEliminatedId: undefined,
      lastEliminatedWasImpostor: undefined,
      winner: undefined
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, impostorConfig: updatedConfig };
    setSlides(copy);

    // 5. Transmitir estado sincronizado para TODOS os participantes
    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex,
      showAnswers,
      timerRemaining,
      timerActive,
      teams,
      teamMode,
      slides: copy,
      participants: currentParts
    });

    const saved = storageService.getSavedRoom(roomCode);
    if (saved) {
      storageService.saveRoom({
        ...saved,
        slides: copy,
        updatedAt: Date.now()
      });
    }
  };

  // Iniciar nova partida com todos os eliminados de volta (aguardando início pelo apresentador)
  const handleStartNewMatch = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;

    // Reseta participantes para estado neutro
    setParticipants((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          isAgent: false,
          isImpostor: false
        };
      });
      return updated;
    });

    handleUpdateImpostorConfig({
      gameStarted: false,
      secretWord: '',
      impostorParticipantIds: [],
      agentParticipantIds: [],
      votingActive: false,
      revealState: 'hidden',
      votes: {},
      currentRound: 1,
      eliminatedIds: [],
      lastEliminatedId: undefined,
      lastEliminatedWasImpostor: undefined,
      winner: undefined
    });
  };

  // Limpar seleção de infiltrados, agentes e palavra
  const handleClearImpostorSelection = () => {
    setParticipants((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          isAgent: false,
          isImpostor: false
        };
      });
      return updated;
    });

    handleUpdateImpostorConfig({
      impostorParticipantIds: [],
      agentParticipantIds: [],
      secretWord: '',
      votes: {},
      eliminatedIds: [],
      lastEliminatedId: undefined,
      lastEliminatedWasImpostor: undefined,
      revealState: 'hidden',
      winner: undefined,
      votingActive: false,
      currentRound: 1
    });
  };

  const handleResetImpostorGame = () => {
    handleStartNewMatch();
  };

  // JOGO DE DESENHO (GARTIC & IMAGEM E AÇÃO) - FUNÇÕES DE CONTROLE
  const handleUpdateGarticConfig = (patch: Partial<GarticConfig>) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    const updatedConfig: GarticConfig = {
      ...currentSlide.garticConfig,
      ...patch
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, garticConfig: updatedConfig };
    setSlides(copy);

    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex,
      showAnswers,
      timerRemaining,
      timerActive,
      teams,
      teamMode,
      slides: copy,
      participants
    });
  };

  const handleStartGarticGame = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    let currentParts = { ...participants };
    let participantList = Object.values(currentParts);

    // Se a sala estiver vazia, gera bots simulados para o jogo rodar imediatamente
    if (participantList.length === 0) {
      const demoBots = [
        { id: 'bot-lucas', name: 'Lucas', avatar: '🦁' },
        { id: 'bot-mariana', name: 'Mariana', avatar: '🦊' },
        { id: 'bot-pedro', name: 'Pedro', avatar: '🚀' },
        { id: 'bot-beatriz', name: 'Beatriz', avatar: '🐱' }
      ];
      demoBots.forEach((bot) => {
        currentParts[bot.id] = {
          id: bot.id,
          name: bot.name,
          avatar: bot.avatar,
          score: 0,
          connectedAt: Date.now()
        };
      });
      participantList = Object.values(currentParts);
      setParticipants(currentParts);
    }

    const config = currentSlide.garticConfig;
    const catName = config.category || 'Geral & Variados';
    const catObj = GARTIC_CATEGORIES.find((c) => c.name === catName) || GARTIC_CATEGORIES[0];
    const customList = config.customWordList;
    const pool = customList && customList.length > 0 ? customList : catObj.words;

    // Sorteia quem desenha priorizando participantes humanos reais se houver
    let drawerId = config.currentDrawerId;
    if (!drawerId || config.selectionMethod === 'random') {
      const realHumans = participantList.filter((p) => !p.id.startsWith('bot-'));
      const candidateList = realHumans.length > 0 ? realHumans : participantList;
      const shuffled = [...candidateList].sort(() => 0.5 - Math.random());
      drawerId = shuffled[0]?.id || participantList[0]?.id;
    }

    const drawerP = participantList.find((p) => p.id === drawerId);

    // Sorteia 3 opções de palavras para o desenhista escolher
    const shuffledWords = [...pool].sort(() => 0.5 - Math.random());
    const wordChoices = shuffledWords.slice(0, Math.min(3, shuffledWords.length));
    const chosenWord = wordChoices[0] || 'Elefante';

    const roundSeconds = config.roundTimeSeconds || 80;

    const updatedConfig: GarticConfig = {
      ...config,
      gameStarted: true,
      currentDrawerId: drawerId,
      currentDrawerName: drawerP?.name || 'Artista',
      currentDrawerAvatar: drawerP?.avatar || '🎨',
      wordChoices,
      secretWord: chosenWord,
      roundState: 'drawing',
      timerRemaining: roundSeconds,
      timerActive: true,
      currentRound: 1,
      strokes: [],
      guessedParticipantIds: [],
      chatGuesses: [],
      scores: config.scores || {},
      revealedLetterIndices: [],
      hintsRevealedCount: 0
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, garticConfig: updatedConfig };
    setSlides(copy);

    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex,
      showAnswers,
      timerRemaining: roundSeconds,
      timerActive: true,
      teams,
      teamMode,
      slides: copy,
      participants: currentParts
    });
  };

  const handleAdvanceGarticNextRound = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    const config = currentSlide.garticConfig;
    const participantList = Object.values(participants);
    const catName = config.category || 'Geral & Variados';
    const catObj = GARTIC_CATEGORIES.find((c) => c.name === catName) || GARTIC_CATEGORIES[0];
    const customList = config.customWordList;
    const pool = customList && customList.length > 0 ? customList : catObj.words;

    // Próximo desenhista da fila
    const realHumans = participantList.filter((p) => !p.id.startsWith('bot-'));
    const candidateList = realHumans.length > 0 ? realHumans : participantList;
    const currentIdx = candidateList.findIndex(
      (p) => p.id === config.currentDrawerId || p.name.trim().toLowerCase() === (config.currentDrawerName || '').trim().toLowerCase()
    );
    const nextDrawerP = candidateList.length > 0
      ? candidateList[(currentIdx + 1) % candidateList.length]
      : undefined;

    const shuffledWords = [...pool].sort(() => 0.5 - Math.random());
    const wordChoices = shuffledWords.slice(0, Math.min(3, shuffledWords.length));
    const chosenWord = wordChoices[0] || 'Bicicleta';
    const roundSeconds = config.roundTimeSeconds || 80;

    const updatedConfig: GarticConfig = {
      ...config,
      currentDrawerId: nextDrawerP?.id || config.currentDrawerId,
      currentDrawerName: nextDrawerP?.name || config.currentDrawerName,
      currentDrawerAvatar: nextDrawerP?.avatar || config.currentDrawerAvatar,
      wordChoices,
      secretWord: chosenWord,
      roundState: 'drawing',
      timerRemaining: roundSeconds,
      timerActive: true,
      currentRound: (config.currentRound || 1) + 1,
      strokes: [],
      guessedParticipantIds: [],
      chatGuesses: [],
      revealedLetterIndices: [],
      hintsRevealedCount: 0
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, garticConfig: updatedConfig };
    setSlides(copy);

    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex,
      showAnswers,
      timerRemaining: roundSeconds,
      timerActive: true,
      teams,
      teamMode,
      slides: copy,
      participants
    });
  };

  const handleResetGarticGame = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    const updatedConfig: GarticConfig = {
      ...currentSlide.garticConfig,
      gameStarted: false,
      roundState: 'lobby',
      currentRound: 1,
      strokes: [],
      guessedParticipantIds: [],
      chatGuesses: [],
      scores: {},
      revealedLetterIndices: [],
      hintsRevealedCount: 0,
      winnerId: undefined,
      winnerName: undefined,
      winnerAvatar: undefined
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, garticConfig: updatedConfig };
    setSlides(copy);

    realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
      currentSlideIndex,
      showAnswers,
      timerRemaining: null,
      timerActive: false,
      teams,
      teamMode,
      slides: copy,
      participants
    });
  };

  const handleGarticDrawStroke = (stroke: GarticStroke) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;

    setSlides((prev) => {
      const curr = prev[currentSlideIndex];
      if (!curr || !curr.garticConfig) return prev;
      const copy = [...prev];
      copy[currentSlideIndex] = {
        ...curr,
        garticConfig: {
          ...curr.garticConfig,
          strokes: [...(curr.garticConfig.strokes || []), stroke]
        }
      };
      return copy;
    });

    realtimeService.broadcast('GARTIC_DRAW_STROKE', roomCode, localParticipantId || 'presenter', {
      stroke
    });
  };

  const handleGarticClearCanvas = () => {
    setSlides((prev) => {
      const curr = prev[currentSlideIndex];
      if (!curr || !curr.garticConfig) return prev;
      const copy = [...prev];
      copy[currentSlideIndex] = {
        ...curr,
        garticConfig: {
          ...curr.garticConfig,
          strokes: []
        }
      };
      return copy;
    });

    realtimeService.broadcast('GARTIC_CLEAR_CANVAS', roomCode, localParticipantId || 'presenter', {});
  };

  const handleGarticUndoCanvas = () => {
    setSlides((prev) => {
      const curr = prev[currentSlideIndex];
      if (!curr || !curr.garticConfig) return prev;
      const currentStrokes = curr.garticConfig.strokes || [];
      const copy = [...prev];
      copy[currentSlideIndex] = {
        ...curr,
        garticConfig: {
          ...curr.garticConfig,
          strokes: currentStrokes.slice(0, -1)
        }
      };
      return copy;
    });

    realtimeService.broadcast('GARTIC_UNDO_CANVAS', roomCode, localParticipantId || 'presenter', {});
  };

  const handleGarticSubmitGuess = (guessText: string) => {
    const pId = localParticipantId || presenterParticipantId;
    realtimeService.broadcast('GARTIC_SUBMIT_GUESS', roomCode, pId, {
      participantId: pId,
      text: guessText
    });
  };

  const handleGarticChooseWord = (word: string) => {
    realtimeService.broadcast('GARTIC_CHOOSE_WORD', roomCode, localParticipantId || 'presenter', {
      word
    });
  };

  const handleGarticRevealHint = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || currentSlide.type !== 'game_drawing_gartic' || !currentSlide.garticConfig) return;
    const gConfig = currentSlide.garticConfig;
    const currentRevealed = gConfig.revealedLetterIndices || [];
    const nextIdx = getNextHintIndex(gConfig.secretWord, currentRevealed);
    if (nextIdx === null) return;

    const updatedRevealed = [...currentRevealed, nextIdx];
    const newHintsCount = (gConfig.hintsRevealedCount || 0) + 1;
    const updated: GarticConfig = {
      ...gConfig,
      revealedLetterIndices: updatedRevealed,
      hintsRevealedCount: newHintsCount
    };

    const copy = [...slides];
    copy[currentSlideIndex] = { ...currentSlide, garticConfig: updated };
    setSlides(copy);

    realtimeService.broadcast('GARTIC_REVEAL_HINT', roomCode, localParticipantId || 'presenter', {
      revealedIndex: nextIdx,
      hintsRevealedCount: newHintsCount
    });

    if (role === 'presenter') {
      realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
        currentSlideIndex,
        showAnswers,
        timerRemaining,
        timerActive,
        teams,
        teamMode,
        slides: copy,
        participants
      });
    }
  };

  const handleGarticInPersonCorrect = (participantId?: string) => {
    const targetId = participantId || (localParticipantId || presenterParticipantId);
    realtimeService.broadcast('GARTIC_IN_PERSON_CORRECT', roomCode, 'presenter', {
      participantId: targetId
    });
  };

  const handleGarticInPersonSkip = () => {
    handleAdvanceGarticNextRound();
  };

  // Identificador do apresentador quando joga junto
  const presenterParticipantId = `presenter-player-${roomCode}`;

  const handleTogglePresenterPlaying = (playing: boolean) => {
    setIsPresenterPlaying(playing);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_presenter_playing', String(playing));
      } catch {
        // ignore
      }
    }
    if (playing) {
      setParticipants((prev) => {
        if (prev[presenterParticipantId]) return prev;
        const newPresenterParticipant: Participant = {
          id: presenterParticipantId,
          name: presenterPlayerName,
          avatar: presenterPlayerAvatar,
          teamId: teams[0]?.id || 'team-1',
          score: 0,
          connectedAt: Date.now()
        };
        const next = { ...prev, [presenterParticipantId]: newPresenterParticipant };
        if (role === 'presenter') {
          realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
            currentSlideIndex,
            showAnswers,
            timerRemaining,
            timerActive,
            teams,
            teamMode,
            slides,
            participants: next
          });
        }
        return next;
      });
    } else {
      setParticipants((prev) => {
        if (!prev[presenterParticipantId]) return prev;
        const next = { ...prev };
        delete next[presenterParticipantId];
        if (role === 'presenter') {
          realtimeService.broadcast('SYNC_STATE', roomCode, 'presenter', {
            currentSlideIndex,
            showAnswers,
            timerRemaining,
            timerActive,
            teams,
            teamMode,
            slides,
            participants: next
          });
        }
        return next;
      });
    }
  };

  const handlePresenterSubmitAnswer = (answer: any) => {
    setAnswersSubmitted((prev) => ({ ...prev, [presenterParticipantId]: answer }));

    const currentSlide = slides[currentSlideIndex];
    if (currentSlide && currentSlide.options) {
      const opt = currentSlide.options.find((o) => o.id === answer.selectedOption);
      if (opt && opt.isCorrect) {
        const basePoints = currentSlide.pointsBase || 1000;
        let earnedPoints = basePoints;

        if (currentSlide.speedBonus && currentSlide.timeLimitSeconds && timerRemaining !== null) {
          const speedRatio = Math.max(0, timerRemaining) / currentSlide.timeLimitSeconds;
          earnedPoints = Math.round(basePoints * (0.5 + 0.5 * speedRatio));
        }

        setParticipants((prev) => {
          const current = prev[presenterParticipantId];
          if (!current) return prev;
          const updatedScore = current.score + earnedPoints;
          if (current.teamId) {
            setTeams((tList) =>
              tList.map((t) => (t.id === current.teamId ? { ...t, score: t.score + earnedPoints } : t))
            );
          }
          return { ...prev, [presenterParticipantId]: { ...current, score: updatedScore } };
        });
      }
    }
  };

  const handlePresenterImpostorVote = (suspectId: string) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.impostorConfig) return;
    const currentVotes = { ...(currentSlide.impostorConfig.votes || {}) };
    currentVotes[presenterParticipantId] = suspectId;
    handleUpdateImpostorConfig({ votes: currentVotes });
  };

  const handleChangePresenterPlayerName = (name: string) => {
    setPresenterPlayerName(name);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_presenter_name', name);
      } catch {
        // ignore
      }
    }
    if (isPresenterPlaying) {
      setParticipants((prev) => {
        if (!prev[presenterParticipantId]) return prev;
        return {
          ...prev,
          [presenterParticipantId]: { ...prev[presenterParticipantId], name }
        };
      });
    }
  };

  const handleChangePresenterPlayerAvatar = (avatar: string) => {
    setPresenterPlayerAvatar(avatar);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('apresentalive_presenter_avatar', avatar);
      } catch {
        // ignore
      }
    }
    if (isPresenterPlaying) {
      setParticipants((prev) => {
        if (!prev[presenterParticipantId]) return prev;
        return {
          ...prev,
          [presenterParticipantId]: { ...prev[presenterParticipantId], avatar }
        };
      });
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const currentLocalParticipant = (() => {
    if (localParticipant) {
      return localParticipant;
    }
    if (localParticipantId && participants[localParticipantId]) {
      return participants[localParticipantId];
    }
    if (localParticipantId) {
      const found = Object.values(participants).find((p) => p.id === localParticipantId);
      if (found) return found;
    }
    if (typeof window !== 'undefined') {
      try {
        const savedName = sessionStorage.getItem('apresentalive_participant_name');
        if (savedName) {
          const foundByName = Object.values(participants).find(
            (p) => p.name.trim().toLowerCase() === savedName.trim().toLowerCase()
          );
          if (foundByName) return foundByName;
        }
      } catch {
        // ignore
      }
    }
    return null;
  })();

  // Navegação protegida entre as 4 telas
  const handleNavigateTo = (target: AppView) => {
    if (target === 'presenter' || target === 'settings') {
      if (!isPresenterAuthenticated) {
        setPendingTargetView(target);
        setIsLoginModalOpen(true);
        return;
      }
    }
    setAppView(target);
  };

  const applyLoadSavedRoom = (room: SavedRoom) => {
    setRoomCode(room.roomCode);
    setRoomTitle(room.roomTitle);
    setPresenterPassword(room.presenterPassword);
    setRoomPassword(room.roomPassword);
    setSlides(room.slides);
    setTeamMode(room.teamMode);
    setTeams(room.teams);
    setCurrentSlideIndex(0);
    storageService.setActiveRoomCode(room.roomCode);
  };

  const handleLoadSavedRoom = (room: SavedRoom) => {
    const prevSession = storageService.getSavedSession(room.roomCode);
    if (prevSession && prevSession.hasSessionData) {
      setPendingResumeSession({
        roomCode: room.roomCode,
        roomTitle: room.roomTitle,
        session: prevSession,
        targetView: appView === 'portal' ? 'presenter' : appView,
        pendingRoomData: room
      });
      return;
    }
    applyLoadSavedRoom(room);
  };

  const handleResetPresentation = (targetCode?: string) => {
    const codeToReset = targetCode || roomCode;

    // 1. Zera participantes e respostas
    setParticipants({});
    setAnswersSubmitted({});
    setImagePins([]);
    setTermSubmissions([]);
    setReactions([]);
    setShowAnswers(false);
    setTimerActive(false);
    setTimerRemaining(null);
    setCurrentSlideIndex(0);

    // 2. Zera pontuações dos times
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));

    // 3. Reseta configurações de jogos e sorteios nos slides (ex: Infiltrado)
    setSlides((prev) =>
      prev.map((s) => {
        let copy = { ...s };
        if (copy.impostorConfig) {
          copy.impostorConfig = {
            ...copy.impostorConfig,
            gameStarted: false,
            votingActive: false,
            currentRound: 1,
            revealState: 'words_shown',
            winner: undefined,
            votes: {},
            agentParticipantIds: [],
            impostorParticipantIds: [],
            eliminatedIds: [],
            lastEliminatedId: undefined,
            lastEliminatedName: undefined,
            lastEliminatedAvatar: undefined,
            lastEliminatedVotes: undefined,
            lastEliminatedWasImpostor: undefined,
            revealWordToInvestigators: false
          };
        }
        return copy;
      })
    );

    // 4. Limpa sessão persistida
    storageService.clearSavedSession(codeToReset);

    // 5. Notifica todos os participantes conectados e 2ª tela via realtime
    realtimeService.broadcast('RESET_PRESENTATION', codeToReset, 'presenter', {
      roomCode: codeToReset,
      timestamp: Date.now()
    });

    realtimeService.broadcast('SYNC_STATE', codeToReset, 'presenter', {
      currentSlideIndex: 0,
      showAnswers: false,
      timerActive: false,
      timerRemaining: null,
      participantsCount: 0,
      answersCount: 0
    });
  };

  const handleConfirmResumeSession = () => {
    if (!pendingResumeSession) return;
    const { session, targetView, pendingRoomData, pendingPresentation } = pendingResumeSession;

    if (pendingRoomData) {
      applyLoadSavedRoom(pendingRoomData);
    } else if (pendingPresentation) {
      setRoomTitle(pendingPresentation.title);
      if (pendingPresentation.slides && pendingPresentation.slides.length > 0) {
        setSlides(pendingPresentation.slides);
      }
    }

    // Retoma elementos da última sessão
    if (session.participants && Object.keys(session.participants).length > 0) {
      setParticipants(session.participants);
    }
    if (session.answersSubmitted) {
      setAnswersSubmitted(session.answersSubmitted);
    }
    if (session.imagePins && session.imagePins.length > 0) {
      setImagePins(session.imagePins);
    }
    if (session.termSubmissions && session.termSubmissions.length > 0) {
      setTermSubmissions(session.termSubmissions);
    }
    if (session.teams && session.teams.length > 0) {
      setTeams(session.teams);
    }
    if (session.teamMode) {
      setTeamMode(session.teamMode);
    }
    if (typeof session.currentSlideIndex === 'number') {
      setCurrentSlideIndex(session.currentSlideIndex);
    }

    setAppView(targetView);
    setPendingResumeSession(null);
  };

  const handleConfirmStartNewPresentation = () => {
    if (!pendingResumeSession) return;
    const { roomCode: targetCode, targetView, pendingRoomData, pendingPresentation } = pendingResumeSession;

    if (pendingRoomData) {
      applyLoadSavedRoom(pendingRoomData);
    } else if (pendingPresentation) {
      setRoomTitle(pendingPresentation.title);
      if (pendingPresentation.slides && pendingPresentation.slides.length > 0) {
        setSlides(pendingPresentation.slides);
      }
    }

    // Reseta participantes, pontuações, sorteios, estatísticas, tudo
    handleResetPresentation(targetCode);

    setAppView(targetView);
    setPendingResumeSession(null);
  };

  // Persistência automática da sessão ativa
  useEffect(() => {
    if (!roomCode || appView === 'portal') return;
    const pCount = Object.keys(participants).length;
    const aCount = Object.keys(answersSubmitted).length;
    const pinsCount = imagePins.length;
    const termsCount = termSubmissions.length;
    if (pCount > 0 || aCount > 0 || pinsCount > 0 || termsCount > 0 || currentSlideIndex > 0) {
      storageService.saveSession({
        roomCode,
        roomTitle,
        currentSlideIndex,
        participants,
        answersSubmitted,
        imagePins,
        termSubmissions,
        teams,
        teamMode,
        slides
      });
    }
  }, [roomCode, roomTitle, currentSlideIndex, participants, answersSubmitted, imagePins, termSubmissions, teams, teamMode, slides, appView]);

  const handleCreateNewRoom = (title: string, pin: string, password: string, rPassword?: string) => {
    const defaultSlide = createDefaultSlide('content_cover', 0);
    const newRoom: SavedRoom = {
      id: `room-${pin}`,
      roomCode: pin,
      roomTitle: title,
      presenterPassword: password,
      roomPassword: rPassword,
      slides: [defaultSlide],
      teamMode: 'random',
      teams: PRESET_TEAMS,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    storageService.saveRoom(newRoom);
    storageService.setActiveRoomCode(pin);
    handleLoadSavedRoom(newRoom);
  };

  const handleUpdateRoomSettings = (settings: {
    roomTitle?: string;
    presenterPassword?: string;
    roomPassword?: string;
    teamMode?: TeamMode;
    teams?: Team[];
  }) => {
    if (settings.roomTitle !== undefined) setRoomTitle(settings.roomTitle);
    if (settings.presenterPassword !== undefined) setPresenterPassword(settings.presenterPassword);
    if (settings.roomPassword !== undefined) setRoomPassword(settings.roomPassword);
    if (settings.teamMode !== undefined) setTeamMode(settings.teamMode);
    if (settings.teams !== undefined) setTeams(settings.teams);

    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle: settings.roomTitle ?? roomTitle,
      presenterPassword: settings.presenterPassword ?? presenterPassword,
      roomPassword: settings.roomPassword !== undefined ? settings.roomPassword : roomPassword,
      slides,
      teamMode: settings.teamMode ?? teamMode,
      teams: settings.teams ?? teams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    storageService.saveRoom(currentData);
  };

  const handleUpdateSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle,
      presenterPassword,
      roomPassword,
      slides: newSlides,
      teamMode,
      teams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    storageService.saveRoom(currentData);
  };

  // RENDERIZAÇÃO: TELA INICIAL (PORTAL)
  if (appView === 'portal') {
    return (
      <>
        <HomePortal
          currentRoomCode={roomCode}
          onJoinAsParticipant={(pin) => {
            setRoomCode(pin);
            setRole('participant');
            setAppView('participants');
          }}
          onCreateRoom={(data) => {
            setRoomCode(data.roomCode);
            setRoomTitle(data.roomTitle);
            setPresenterPassword(data.adminPassword);
            setRoomPassword(data.roomPassword);
            setSlides(data.slides);
            setCurrentSlideIndex(0);
            setIsPresenterAuthenticated(true);
            setRole('presenter');
            setAppView('settings'); // Abre direto na tela de configurações/editor
            
            const newRoom: SavedRoom = {
              id: `room-${data.roomCode}`,
              roomCode: data.roomCode,
              roomTitle: data.roomTitle,
              presenterPassword: data.adminPassword,
              roomPassword: data.roomPassword,
              slides: data.slides,
              teamMode,
              teams,
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            storageService.saveRoom(newRoom);
            storageService.setActiveRoomCode(data.roomCode);
          }}
          onOpenAdminLogin={(pin) => {
            let targetTitle = roomTitle;
            const targetPin = pin || roomCode;
            if (pin) {
              setRoomCode(pin);
              const saved = storageService.getSavedRoom(pin);
              if (saved) {
                targetTitle = saved.roomTitle;
                setRoomTitle(saved.roomTitle);
                setPresenterPassword(saved.presenterPassword);
                setRoomPassword(saved.roomPassword);
                if (saved.slides && saved.slides.length > 0) setSlides(saved.slides);
              }
            }
            if (isPresenterAuthenticated) {
              const prevSession = storageService.getSavedSession(targetPin);
              if (prevSession && prevSession.hasSessionData) {
                setPendingResumeSession({
                  roomCode: targetPin,
                  roomTitle: targetTitle,
                  session: prevSession,
                  targetView: 'presenter'
                });
              } else {
                setAppView('presenter');
              }
            } else {
              setPendingTargetView('presenter');
              setIsLoginModalOpen(true);
            }
          }}
          onProjectRoom={(pin) => {
            let targetTitle = roomTitle;
            if (pin) {
              setRoomCode(pin);
              const saved = storageService.getSavedRoom(pin);
              if (saved) {
                targetTitle = saved.roomTitle;
                setRoomTitle(saved.roomTitle);
                setPresenterPassword(saved.presenterPassword);
                setRoomPassword(saved.roomPassword);
                if (saved.slides && saved.slides.length > 0) setSlides(saved.slides);
              }
              const prevSession = storageService.getSavedSession(pin);
              if (prevSession && prevSession.hasSessionData) {
                setPendingResumeSession({
                  roomCode: pin,
                  roomTitle: targetTitle,
                  session: prevSession,
                  targetView: 'presentation'
                });
                return;
              }
            }
            handleOpenProjectorWindow(pin);
          }}
        />

        <PresenterLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            setPendingTargetView(null);
          }}
          expectedPassword={presenterPassword}
          onSuccess={() => {
            setIsPresenterAuthenticated(true);
            setRole('presenter');
            const target = pendingTargetView || 'presenter';
            setPendingTargetView(null);

            const prevSession = storageService.getSavedSession(roomCode);
            if (prevSession && prevSession.hasSessionData) {
              setPendingResumeSession({
                roomCode,
                roomTitle,
                session: prevSession,
                targetView: target
              });
            } else {
              setAppView(target);
            }
          }}
        />

        <ResumePresentationModal
          isOpen={Boolean(pendingResumeSession)}
          roomCode={pendingResumeSession?.roomCode || ''}
          presentationTitle={pendingResumeSession?.roomTitle || ''}
          session={pendingResumeSession?.session || null}
          onResume={handleConfirmResumeSession}
          onStartNew={handleConfirmStartNewPresentation}
          onCancel={() => setPendingResumeSession(null)}
        />
      </>
    );
  }

  // RENDERIZAÇÃO: NAVEGAÇÃO ENTRE AS 4 TELAS
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* Barra de Navegação Superior com as 4 Telas do Sistema */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between z-50 text-xs shrink-0 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => setAppView('portal')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
            title="Voltar para a página inicial"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Início</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Abas das 4 Telas Solicitadas: Apresentação, Apresentador, Configurações, Participantes */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1" aria-label="Telas do Sistema">
            {/* 1. TELA DE APRESENTAÇÃO (TELÃO PÚBLICO) */}
            <button
              id="nav-screen-presentation"
              onClick={() => handleNavigateTo('presentation')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                appView === 'presentation'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Tela de Apresentação pública para telão/projetor (sem segredos)"
            >
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              <span>Apresentação</span>
            </button>

            {/* 2. TELA DO APRESENTADOR (CONSOLE COM REVELAÇÃO E PAINEL CONFIDENCIAL) */}
            <button
              id="nav-screen-presenter"
              onClick={() => handleNavigateTo('presenter')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                appView === 'presenter'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Tela do Apresentador com controles confidenciais e revelação de palavra"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Apresentador</span>
              {!isPresenterAuthenticated && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* 3. TELA DE CONFIGURAÇÕES (SLIDES E REGRAS) */}
            <button
              id="nav-screen-settings"
              onClick={() => handleNavigateTo('settings')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                appView === 'settings'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Tela de Configurações e Editor de Slides"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configurações</span>
              {!isPresenterAuthenticated && <Lock className="w-3 h-3 text-emerald-400/80 ml-0.5" />}
            </button>

            {/* 4. TELA DE PARTICIPANTES (JOGADOR NO CELULAR) */}
            <button
              id="nav-screen-participants"
              onClick={() => handleNavigateTo('participants')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                appView === 'participants'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Tela dos Participantes (visão individual no celular)"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Participantes</span>
            </button>
          </nav>
        </div>

        {/* Informações da Sala e Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Projetar 2ª Tela */}
          <button
            id="btn-project-second-screen"
            onClick={() => handleOpenProjectorWindow()}
            className="px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-600/40 hover:bg-sky-900/60 font-semibold text-xs text-sky-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="Abrir a tela de apresentação em uma nova janela para o projetor / 2ª Tela"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Projetar 2ª Tela</span>
          </button>

          {/* PIN Badge */}
          <button
            id="btn-copy-pin"
            onClick={handleCopyPin}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 font-mono text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Clique para copiar o PIN da sala"
          >
            <span className="text-slate-500">PIN:</span>
            <span className="text-indigo-400 font-bold tracking-wider">{roomCode}</span>
            {copiedPin ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500" />
            )}
          </button>

          {/* Gerenciar Times */}
          {isPresenterAuthenticated && (
            <button
              id="btn-open-teams"
              onClick={() => setIsTeamModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Gerenciar Times dos Participantes"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Times</span>
            </button>
          )}

          {/* Status de Autenticação / Bloqueio */}
          {isPresenterAuthenticated ? (
            <button
              id="btn-lock-logout"
              onClick={() => {
                setIsPresenterAuthenticated(false);
                setAppView('presentation');
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/60 cursor-pointer"
              title="Bloquear telas de controle e proteger respostas"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear Painel</span>
            </button>
          ) : (
            <button
              id="btn-open-auth-modal"
              onClick={() => {
                setPendingTargetView('presenter');
                setIsLoginModalOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Entrar como Apresentador</span>
            </button>
          )}

          {/* Login na Conta Google / Nuvem */}
          <div className="hidden sm:block pl-2 border-l border-slate-800">
            <UserAuthBar />
          </div>
        </div>
      </header>

      {/* Main Viewport: Renderiza a tela selecionada */}
      <main className="flex-1 flex flex-col w-full min-h-0 overflow-y-auto overflow-x-hidden">
        {/* 1. TELA DE APRESENTAÇÃO (TELÃO DO PROJETOR) */}
        {appView === 'presentation' && (
          <PresentationPlayer
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            roomCode={roomCode}
            appUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : ''}
            participants={Object.values(participants)}
            teams={teams}
            teamMode={teamMode}
            showAnswers={showAnswers}
            timerActive={timerActive}
            timerRemaining={timerRemaining}
            answersSubmitted={answersSubmitted}
            imagePins={imagePins}
            termSubmissions={termSubmissions}
            reactions={reactions}
            isProjectorOnly={isProjectorMode}
            isPresenterAuthenticated={isPresenterAuthenticated}
            onOpenPresenterLogin={() => {
              setPendingTargetView('presenter');
              setIsLoginModalOpen(true);
            }}
            onOpenProjectorWindow={() => handleOpenProjectorWindow(roomCode)}
            onPrevSlide={handlePrevSlide}
            onNextSlide={handleNextSlide}
            onGoToSlide={handleGoToSlide}
            onToggleShowAnswers={() => setShowAnswers(!showAnswers)}
            onToggleTimer={() => setTimerActive(!timerActive)}
            onResetTimer={() => {
              const current = slides[currentSlideIndex];
              if (current?.timeLimitSeconds) {
                setTimerRemaining(current.timeLimitSeconds);
                setTimerActive(false);
              }
            }}
            onOpenTeamManager={() => setIsTeamModalOpen(true)}
            onAddSimulatedParticipants={handleAddSimulatedParticipants}
            onSwitchToEditor={() => handleNavigateTo('settings')}
            onStartImpostorGame={handleStartImpostorGame}
            onUpdateImpostorConfig={handleUpdateImpostorConfig}
            onStartImpostorVoting={handleStartImpostorVoting}
            onRevealImpostor={handleRevealImpostor}
            onResetImpostorGame={handleResetImpostorGame}
            onAdvanceToNextRound={handleAdvanceToNextRound}
            onStartNewMatch={handleStartNewMatch}
            onToggleRevealWordToInvestigators={handleToggleRevealWordToInvestigators}
            onStartGarticGame={handleStartGarticGame}
            onUpdateGarticConfig={handleUpdateGarticConfig}
            onAdvanceGarticNextRound={handleAdvanceGarticNextRound}
            onResetGarticGame={handleResetGarticGame}
            onGarticInPersonCorrect={handleGarticInPersonCorrect}
            onGarticInPersonSkip={handleGarticInPersonSkip}
          />
        )}

        {/* 2. TELA DO APRESENTADOR (CONSOLE CENTRAL COM BOTÃO DE REVELAR PALAVRA) */}
        {appView === 'presenter' && (
          !isPresenterAuthenticated ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Tela do Apresentador Protegida</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Esta tela contém o console confidencial com a identidade do infiltrado, lista de agentes e o botão de revelar palavra para os investigadores.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setAppView('presentation')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Ir para Tela de Apresentação
                </button>
                <button
                  onClick={() => {
                    setPendingTargetView('presenter');
                    setIsLoginModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Digitar Senha do Apresentador</span>
                </button>
              </div>
            </div>
          ) : (
            <PresenterConsole
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              roomCode={roomCode}
              participants={Object.values(participants)}
              teams={teams}
              teamMode={teamMode}
              showAnswers={showAnswers}
              timerActive={timerActive}
              timerRemaining={timerRemaining}
              answersSubmitted={answersSubmitted}
              imagePins={imagePins}
              termSubmissions={termSubmissions}
              onOpenProjectorWindow={() => handleOpenProjectorWindow(roomCode)}
              onPrevSlide={handlePrevSlide}
              onNextSlide={handleNextSlide}
              onGoToSlide={handleGoToSlide}
              onToggleShowAnswers={() => setShowAnswers(!showAnswers)}
              onToggleTimer={() => setTimerActive(!timerActive)}
              onResetTimer={() => {
                const current = slides[currentSlideIndex];
                if (current?.timeLimitSeconds) {
                  setTimerRemaining(current.timeLimitSeconds);
                  setTimerActive(false);
                }
              }}
              onAddSimulatedParticipants={handleAddSimulatedParticipants}
              onStartImpostorGame={handleStartImpostorGame}
              onUpdateImpostorConfig={handleUpdateImpostorConfig}
              onStartImpostorVoting={handleStartImpostorVoting}
              onRevealImpostor={handleRevealImpostor}
              onResetImpostorGame={handleResetImpostorGame}
              onAdvanceToNextRound={handleAdvanceToNextRound}
              onStartNewMatch={handleStartNewMatch}
              onClearImpostorSelection={handleClearImpostorSelection}
              onOpenPresentationScreen={() => setAppView('presentation')}
              onOpenSettingsScreen={() => setAppView('settings')}
              isPresenterPlaying={isPresenterPlaying}
              onTogglePresenterPlaying={handleTogglePresenterPlaying}
              onPresenterSubmitAnswer={handlePresenterSubmitAnswer}
              onPresenterImpostorVote={handlePresenterImpostorVote}
              onKickParticipant={handleKickParticipant}
              onBanParticipant={handleBanParticipant}
              presenterPlayerName={presenterPlayerName}
              onChangePresenterPlayerName={handleChangePresenterPlayerName}
              presenterPlayerAvatar={presenterPlayerAvatar}
              onChangePresenterPlayerAvatar={handleChangePresenterPlayerAvatar}
              coPresentersCount={coPresentersCount}
              onStartGarticGame={handleStartGarticGame}
              onUpdateGarticConfig={handleUpdateGarticConfig}
              onAdvanceGarticNextRound={handleAdvanceGarticNextRound}
              onResetGarticGame={handleResetGarticGame}
              onGarticInPersonCorrect={handleGarticInPersonCorrect}
              onGarticInPersonSkip={handleGarticInPersonSkip}
              onRevealGarticHint={handleGarticRevealHint}
            />
          )
        )}

        {/* 3. TELA DE CONFIGURAÇÕES (CONFIGURAÇÃO DA SALA E EDITOR DE SLIDES) */}
        {appView === 'settings' && (
          !isPresenterAuthenticated ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
                <Sliders className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Tela de Configurações Protegida</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Acesse para adicionar ou editar slides, escolher número de agentes, número de infiltrados, lista de palavras e formas de escolha.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setAppView('presentation')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Ir para Tela de Apresentação
                </button>
                <button
                  onClick={() => {
                    setPendingTargetView('settings');
                    setIsLoginModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Digitar Senha do Apresentador</span>
                </button>
              </div>
            </div>
          ) : (
            <SlideEditor
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSelectSlide={setCurrentSlideIndex}
              onUpdateSlides={handleUpdateSlides}
              onStartPresentation={() => setAppView('presentation')}
              onResetPresentation={handleResetPresentation}
              roomCode={roomCode}
              roomTitle={roomTitle}
              presenterPassword={presenterPassword}
              roomPassword={roomPassword}
              teamMode={teamMode}
              teams={teams}
              onUpdateRoomSettings={handleUpdateRoomSettings}
              onLoadSavedRoom={handleLoadSavedRoom}
              onCreateNewRoom={handleCreateNewRoom}
              onLoadPresentation={(pres) => {
                const matchingRoom = storageService.getSavedRooms().find((r) => r.roomTitle === pres.title);
                const checkPin = matchingRoom ? matchingRoom.roomCode : roomCode;
                const prevSession = storageService.getSavedSession(checkPin);
                if (prevSession && prevSession.hasSessionData) {
                  setPendingResumeSession({
                    roomCode: checkPin,
                    roomTitle: pres.title,
                    session: prevSession,
                    targetView: 'settings',
                    pendingPresentation: pres
                  });
                  return;
                }
                setRoomTitle(pres.title);
                if (pres.slides && pres.slides.length > 0) setSlides(pres.slides);
                setCurrentSlideIndex(0);
              }}
            />
          )
        )}

        {/* 4. TELA DE PARTICIPANTES (VISÃO DO JOGADOR NO CELULAR) */}
        {appView === 'participants' && (
          !currentLocalParticipant ? (
            <ParticipantJoin
              initialRoomCode={roomCode}
              onJoin={handleJoinParticipant}
              teams={teams}
              teamMode={teamMode}
              onOpenPresenterLogin={() => {
                setPendingTargetView('presenter');
                setIsLoginModalOpen(true);
              }}
            />
          ) : (
            <ParticipantView
              participant={currentLocalParticipant}
              currentSlide={slides[currentSlideIndex] || slides[0]}
              currentSlideIndex={currentSlideIndex}
              totalSlides={slides.length}
              teams={teams}
              slides={slides}
              roomCode={roomCode}
              showAnswers={showAnswers}
              answersSubmitted={answersSubmitted}
              imagePins={imagePins}
              termSubmissions={termSubmissions}
              onSubmitAnswer={(ans) => {
                realtimeService.broadcast('SUBMIT_ANSWER', roomCode, currentLocalParticipant.id, {
                  participantId: currentLocalParticipant.id,
                  answer: ans
                });
              }}
              onSubmitPin={(x, y) => {
                realtimeService.broadcast('SUBMIT_IMAGE_PIN', roomCode, currentLocalParticipant.id, {
                  participantId: currentLocalParticipant.id,
                  xPercent: x,
                  yPercent: y
                });
              }}
              onSubmitTerm={(term) => {
                realtimeService.broadcast('SUBMIT_TERM', roomCode, currentLocalParticipant.id, {
                  participantId: currentLocalParticipant.id,
                  term
                });
              }}
              onSendReaction={(emoji) => {
                realtimeService.broadcast('SEND_REACTION', roomCode, currentLocalParticipant.id, {
                  emoji
                });
              }}
              onImpostorVote={(suspectId) => {
                realtimeService.broadcast('IMPOSTOR_VOTE', roomCode, currentLocalParticipant.id, {
                  voterId: currentLocalParticipant.id,
                  suspectId
                });
              }}
              allParticipants={Object.values(participants)}
              onLeaveRoom={handleLeaveRoom}
              onStartImpostorGame={handleStartImpostorGame}
              onStartVoting={handleStartImpostorVoting}
              onRevealImpostor={handleRevealImpostor}
              onAdvanceToNextRound={handleAdvanceToNextRound}
              onStartNewMatch={handleStartNewMatch}
              onToggleRevealWordToInvestigators={handleToggleRevealWordToInvestigators}
              onDrawStroke={(stroke) => {
                realtimeService.broadcast('GARTIC_DRAW_STROKE', roomCode, currentLocalParticipant.id, { stroke });
              }}
              onClearCanvas={() => {
                realtimeService.broadcast('GARTIC_CLEAR_CANVAS', roomCode, currentLocalParticipant.id, {});
              }}
              onUndoCanvas={() => {
                realtimeService.broadcast('GARTIC_UNDO_CANVAS', roomCode, currentLocalParticipant.id, {});
              }}
              onSubmitGarticGuess={(text) => {
                realtimeService.broadcast('GARTIC_SUBMIT_GUESS', roomCode, currentLocalParticipant.id, {
                  participantId: currentLocalParticipant.id,
                  text
                });
              }}
              onChooseGarticWord={(word) => {
                realtimeService.broadcast('GARTIC_CHOOSE_WORD', roomCode, currentLocalParticipant.id, { word });
              }}
              onRevealGarticHint={handleGarticRevealHint}
              onStartGarticGame={handleStartGarticGame}
            />
          )
        )}
      </main>

      {/* Modais de Suporte */}
      <PresenterLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingTargetView(null);
        }}
        expectedPassword={presenterPassword}
        onSuccess={() => {
          setIsPresenterAuthenticated(true);
          setRole('presenter');
          const target = pendingTargetView || 'presenter';
          setPendingTargetView(null);

          const prevSession = storageService.getSavedSession(roomCode);
          if (prevSession && prevSession.hasSessionData) {
            setPendingResumeSession({
              roomCode,
              roomTitle,
              session: prevSession,
              targetView: target
            });
          } else {
            setAppView(target);
          }
        }}
      />

      <TeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMode={teamMode}
        onSetTeamMode={setTeamMode}
        teams={teams}
        onUpdateTeams={setTeams}
        participants={Object.values(participants)}
        onUpdateParticipants={setParticipants}
      />

      <ResumePresentationModal
        isOpen={Boolean(pendingResumeSession)}
        roomCode={pendingResumeSession?.roomCode || ''}
        presentationTitle={pendingResumeSession?.roomTitle || ''}
        session={pendingResumeSession?.session || null}
        onResume={handleConfirmResumeSession}
        onStartNew={handleConfirmStartNewPresentation}
        onCancel={() => setPendingResumeSession(null)}
      />
    </div>
  );
}
