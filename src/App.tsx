import React, { useState, useEffect, useRef } from 'react';
import {
  Slide,
  Participant,
  Team,
  TeamMode,
  ImpostorConfig,
  ImagePinSubmission,
  TermSubmission,
  LiveReaction
} from './types';
import { SAMPLE_PRESENTATION_SLIDES } from './data/samplePresentations';
import { PRESET_TEAMS, PRESET_WORD_CATEGORIES } from './data/presetWords';
import { realtimeService } from './services/realtime';
import { storageService, SavedRoom } from './services/storage';
import { createDefaultSlide } from './utils/slidePresets';
import { PresentationPlayer } from './components/presenter/PresentationPlayer';
import { SlideEditor } from './components/presenter/SlideEditor';
import { PresenterConsole } from './components/presenter/PresenterConsole';
import { PresenterLoginModal } from './components/presenter/PresenterLoginModal';
import { TeamManagerModal } from './components/presenter/TeamManagerModal';
import { ParticipantJoin } from './components/participant/ParticipantJoin';
import { ParticipantView } from './components/participant/ParticipantView';
import { HomePortal } from './components/home/HomePortal';
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
  const [appView, setAppView] = useState<AppView>('portal');
  const [pendingTargetView, setPendingTargetView] = useState<'presenter' | 'settings' | null>(null);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  // Papel do usuário nesta aba: 'presenter' | 'participant'
  const [role, setRole] = useState<'presenter' | 'participant'>('participant');
  const [presenterMode, setPresenterMode] = useState<'present' | 'edit'>('present');
  
  // Segurança do Apresentador: Por padrão FALSE para exigir a senha definida
  const [isPresenterAuthenticated, setIsPresenterAuthenticated] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Estado da Sala (Apresentação, slides, participantes, respostas)
  const [roomCode, setRoomCode] = useState<string>(DEFAULT_ROOM_CODE);
  const [roomTitle, setRoomTitle] = useState<string>('Gincana & Slides Interativos');
  const [presenterPassword, setPresenterPassword] = useState<string>(DEFAULT_PRESENTER_PASSWORD);
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

  // Dados do participante local nesta aba (se estiver como participante)
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(null);

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

  // Transmissão de sincronização em lote de estado (heartbeat do apresentador)
  useEffect(() => {
    if (role === 'presenter' && isPresenterAuthenticated) {
      const interval = setInterval(() => {
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
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [
    role,
    isPresenterAuthenticated,
    currentSlideIndex,
    showAnswers,
    timerRemaining,
    timerActive,
    teams,
    teamMode,
    slides,
    participants,
    roomCode
  ]);

  // Receptor de Mensagens em Tempo Real (Eventos de Participantes e Apresentador)
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      // 1. Participante entrou na sala
      if (msg.type === 'PARTICIPANT_JOIN' && msg.payload?.participant) {
        const p = msg.payload.participant as Participant;
        setParticipants((prev) => ({ ...prev, [p.id]: p }));
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

      // 7. Sincronização geral de estado recebida pelo Participante ou Projetor
      if (msg.type === 'SYNC_STATE' && role === 'participant' && msg.payload) {
        const data = msg.payload;
        if (data.currentSlideIndex !== undefined) setCurrentSlideIndex(data.currentSlideIndex);
        if (data.showAnswers !== undefined) setShowAnswers(data.showAnswers);
        if (data.timerRemaining !== undefined) setTimerRemaining(data.timerRemaining);
        if (data.timerActive !== undefined) setTimerActive(data.timerActive);
        if (data.teams) setTeams(data.teams);
        if (data.teamMode) setTeamMode(data.teamMode);
        if (data.slides && data.slides.length > 0) setSlides(data.slides);
        if (data.participants) setParticipants(data.participants);
      }

      // 8. Troca de slide direta
      if (msg.type === 'CHANGE_SLIDE' && role === 'participant' && msg.payload) {
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

      // 9. Tique do cronômetro
      if (msg.type === 'TIMER_TICK' && role === 'participant' && msg.payload) {
        if (msg.payload.remaining !== undefined) {
          setTimerRemaining(msg.payload.remaining);
          setTimerActive(true);
        }
      }

      // 10. Cronômetro esgotado
      if (msg.type === 'TIMER_EXPIRED' && role === 'participant') {
        setTimerRemaining(0);
        setTimerActive(false);
        setShowAnswers(true);
      }

      // 11. Solicitação de estado completo (novo participante ou projetor conectou)
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
    roomCode
  ]);

  // Ação de entrada de participante local
  const handleJoinParticipant = (data: {
    name: string;
    avatar: string;
    roomCode: string;
    teamId?: string;
  }) => {
    let assignedTeamId = data.teamId;

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

    const newParticipant: Participant = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      avatar: data.avatar,
      teamId: assignedTeamId,
      score: 0,
      connectedAt: Date.now()
    };

    setLocalParticipantId(newParticipant.id);
    setParticipants((prev) => ({
      ...prev,
      [newParticipant.id]: newParticipant
    }));

    realtimeService.broadcast('PARTICIPANT_JOIN', roomCode, newParticipant.id, {
      participant: newParticipant
    });
  };

  // Botões de navegação de slides do apresentador
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleGoToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  // Adicionar 5 participantes simulados (Bots) para teste
  const handleAddSimulatedParticipants = () => {
    const demoBots = [
      { name: 'Lucas', avatar: '🦁' },
      { name: 'Mariana', avatar: '🦊' },
      { name: 'Pedro', avatar: '🚀' },
      { name: 'Beatriz', avatar: '🐱' },
      { name: 'Felipe', avatar: '🤖' }
    ];

    const newPartsMap: Record<string, Participant> = { ...participants };

    demoBots.forEach((bot, idx) => {
      const id = `bot-${Date.now()}-${idx}`;
      const assignedTeam = teams[idx % teams.length];
      newPartsMap[id] = {
        id,
        name: bot.name,
        avatar: bot.avatar,
        teamId: teamMode !== 'none' ? assignedTeam?.id : undefined,
        score: Math.floor(Math.random() * 600) + 200,
        connectedAt: Date.now()
      };
    });

    setParticipants(newPartsMap);

    // Disparar respostas simuladas nos bots
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide?.options && currentSlide.options.length > 0) {
      setTimeout(() => {
        const simulatedAnswers: Record<string, any> = {};
        Object.keys(newPartsMap).forEach((pId) => {
          const randomOpt =
            currentSlide.options![Math.floor(Math.random() * currentSlide.options!.length)];
          simulatedAnswers[pId] = { selectedOption: randomOpt.id, timestamp: Date.now() };
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

    // Calcular quem teve mais votos
    const voteCounts: Record<string, number> = {};
    Object.values(currentSlide.impostorConfig.votes).forEach((suspectId) => {
      voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
    });

    let mostVotedId: string | null = null;
    let maxVotes = -1;
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = id;
      }
    });

    const isImpostorEliminated =
      mostVotedId !== null && currentSlide.impostorConfig.impostorParticipantIds.includes(mostVotedId);

    const winner: 'civilians' | 'impostors' = isImpostorEliminated ? 'civilians' : 'impostors';

    handleUpdateImpostorConfig({
      votingActive: false,
      revealState: 'revealed',
      winner
    });
  };

  const handleResetImpostorGame = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    const catName = currentSlide.impostorConfig?.category || 'Personagens Bíblicos';
    const cat = PRESET_WORD_CATEGORIES.find((c) => c.name === catName) || PRESET_WORD_CATEGORIES[0];
    const customList = currentSlide.impostorConfig?.customWordList;
    const wordsPool = customList && customList.length > 0 ? customList : cat.words;
    const newWord = wordsPool[Math.floor(Math.random() * wordsPool.length)] || 'Moisés';

    handleUpdateImpostorConfig({
      secretWord: newWord,
      votingActive: false,
      revealState: 'hidden',
      votes: {},
      winner: undefined
    });
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const currentLocalParticipant = localParticipantId ? participants[localParticipantId] : null;

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

  const handleLoadSavedRoom = (room: SavedRoom) => {
    setRoomCode(room.roomCode);
    setRoomTitle(room.roomTitle);
    setPresenterPassword(room.presenterPassword);
    setSlides(room.slides);
    setTeamMode(room.teamMode);
    setTeams(room.teams);
    setCurrentSlideIndex(0);
    storageService.setActiveRoomCode(room.roomCode);
  };

  const handleCreateNewRoom = (title: string, pin: string, password: string) => {
    const defaultSlide = createDefaultSlide('content_cover', 0);
    const newRoom: SavedRoom = {
      id: `room-${pin}`,
      roomCode: pin,
      roomTitle: title,
      presenterPassword: password,
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
    teamMode?: TeamMode;
    teams?: Team[];
  }) => {
    if (settings.roomTitle !== undefined) setRoomTitle(settings.roomTitle);
    if (settings.presenterPassword !== undefined) setPresenterPassword(settings.presenterPassword);
    if (settings.teamMode !== undefined) setTeamMode(settings.teamMode);
    if (settings.teams !== undefined) setTeams(settings.teams);

    const currentData: SavedRoom = {
      id: `room-${roomCode}`,
      roomCode,
      roomTitle: settings.roomTitle ?? roomTitle,
      presenterPassword: settings.presenterPassword ?? presenterPassword,
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
            if (pin) {
              setRoomCode(pin);
              const saved = storageService.getSavedRoom(pin);
              if (saved) {
                setRoomTitle(saved.roomTitle);
                setPresenterPassword(saved.presenterPassword);
                if (saved.slides && saved.slides.length > 0) setSlides(saved.slides);
              }
            }
            setPendingTargetView('presenter');
            setIsLoginModalOpen(true);
          }}
          onProjectRoom={(pin) => {
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
            setAppView(pendingTargetView || 'presenter');
            setPendingTargetView(null);
          }}
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
        </div>
      </header>

      {/* Main Viewport: Renderiza a tela selecionada */}
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* 1. TELA DE APRESENTAÇÃO (TELÃO DO PROJETOR) */}
        {appView === 'presentation' && (
          <PresentationPlayer
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            roomCode={roomCode}
            appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
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
            onUpdateImpostorConfig={handleUpdateImpostorConfig}
            onStartImpostorVoting={handleStartImpostorVoting}
            onRevealImpostor={handleRevealImpostor}
            onResetImpostorGame={handleResetImpostorGame}
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
              onUpdateImpostorConfig={handleUpdateImpostorConfig}
              onStartImpostorVoting={handleStartImpostorVoting}
              onRevealImpostor={handleRevealImpostor}
              onResetImpostorGame={handleResetImpostorGame}
              onOpenPresentationScreen={() => setAppView('presentation')}
              onOpenSettingsScreen={() => setAppView('settings')}
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
              roomCode={roomCode}
              roomTitle={roomTitle}
              presenterPassword={presenterPassword}
              teamMode={teamMode}
              teams={teams}
              onUpdateRoomSettings={handleUpdateRoomSettings}
              onLoadSavedRoom={handleLoadSavedRoom}
              onCreateNewRoom={handleCreateNewRoom}
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
          setAppView(pendingTargetView || 'presenter');
          setPendingTargetView(null);
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
    </div>
  );
}
