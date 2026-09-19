import { Slide } from '../types';
import { SAMPLE_PRESENTATION_SLIDES } from './samplePresentations';

export interface RoomTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  slides: Slide[];
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'full_show',
    name: 'Gincana Completa (Tudo em Um)',
    badge: '🏆',
    description: 'Inclui Quizes competitivos com velocidade, O Infiltrado (Investigador & Clássico), Nuvem de palavras e Pódio.',
    slides: SAMPLE_PRESENTATION_SLIDES
  },
  {
    id: 'impostor_special',
    name: 'Especial: O Jogo do Infiltrado',
    badge: '🕵️',
    description: 'Focado no jogo de blefe e dedução. Contém Lobby QR Code, Regras e rodadas nos Modos Investigador e Clássico.',
    slides: [
      {
        id: 'imp-lobby',
        type: 'content_qrcode_lobby',
        title: 'O Jogo do Infiltrado',
        subtitle: 'Conecte-se pelo QR Code ou PIN para participar',
        content: 'Descubra quem é o impostor no meio dos agentes antes que o tempo acabe!',
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#F43F5E',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'fade', duration: 0.6, backgroundEffect: 'particles' }
      },
      {
        id: 'imp-rules',
        type: 'content_bullets',
        title: 'Como Jogar: O Infiltrado',
        subtitle: 'Entenda os dois modos principais do jogo',
        bullets: [
          '🕵️ Modo Investigador: 4 Agentes sobem ao palco virtual. 1 deles é o Infiltrado.',
          '🗣️ Rodadas de Pistas: Cada agente diz UMA palavra ligada ao tema secreto.',
          '🎭 O Infiltrado NÃO sabe a palavra e precisa improvisar para não ser descoberto.',
          '🗳️ Votação: A platéia (Investigadores) vota pelo celular em quem achar mais suspeito!'
        ],
        theme: {
          backgroundColor: '#1E1B4B',
          accentColor: '#38BDF8',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'grid' }
      },
      {
        id: 'imp-slide-1',
        type: 'game_impostor_investigator',
        title: 'O Infiltrado • 1ª Partida',
        subtitle: 'Modo Investigador • 4 Agentes no palco dão pistas',
        categoryName: 'Personagens Bíblicos',
        impostorConfig: {
          gameStarted: false,
          mode: 'investigator',
          category: 'Personagens Bíblicos',
          secretWord: '',
          impostorParticipantIds: [],
          agentParticipantIds: [],
          roundsTotal: 3,
          currentRound: 1,
          eliminatedIds: [],
          votingActive: false,
          votes: {},
          revealState: 'hidden',
          votingAudience: 'all'
        },
        theme: {
          backgroundColor: '#2E1065',
          accentColor: '#F43F5E',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'particles' }
      },
      {
        id: 'imp-slide-2',
        type: 'game_impostor_investigator',
        title: 'O Infiltrado • 2ª Partida',
        subtitle: 'Modo Investigador • Nova categoria misteriosa',
        categoryName: 'Países do Mundo',
        impostorConfig: {
          gameStarted: false,
          mode: 'investigator',
          category: 'Países do Mundo',
          secretWord: '',
          impostorParticipantIds: [],
          agentParticipantIds: [],
          roundsTotal: 3,
          currentRound: 1,
          eliminatedIds: [],
          votingActive: false,
          votes: {},
          revealState: 'hidden',
          votingAudience: 'all'
        },
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#38BDF8',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'grid' }
      },
      {
        id: 'imp-slide-3',
        type: 'game_impostor_classic',
        title: 'O Infiltrado • Modo Clássico Geral',
        subtitle: 'Todos recebem a palavra no celular, exceto 1 infiltrado!',
        categoryName: 'Animais Selvagens e Aquáticos',
        impostorConfig: {
          gameStarted: false,
          mode: 'classic',
          category: 'Animais Selvagens e Aquáticos',
          secretWord: '',
          impostorParticipantIds: [],
          agentParticipantIds: [],
          roundsTotal: 1,
          currentRound: 1,
          eliminatedIds: [],
          votingActive: false,
          votes: {},
          revealState: 'hidden',
          votingAudience: 'all'
        },
        theme: {
          backgroundColor: '#31102B',
          accentColor: '#F43F5E',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'particles' }
      },
      {
        id: 'imp-leaderboard',
        type: 'leaderboard',
        title: 'Placar de Mestres da Dedução',
        subtitle: 'Melhores pontuações e participantes da partida',
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#F59E0B',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'spring', duration: 0.8, backgroundEffect: 'particles' }
      }
    ]
  },
  {
    id: 'biblical_quiz',
    name: 'Gincana & Quiz Bíblico',
    badge: '📜',
    description: 'Quizes temáticos, vocabulário bíblico e O Infiltrado com personagens das escrituras.',
    slides: [
      {
        id: 'bib-lobby',
        type: 'content_qrcode_lobby',
        title: 'Quiz & Dinâmicas Bíblicas',
        subtitle: 'Conecte-se com seu celular para jogar em tempo real',
        content: 'Teste seus conhecimentos sobre as escrituras em equipe!',
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#F59E0B',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'fade', duration: 0.6, backgroundEffect: 'particles' }
      },
      {
        id: 'bib-quiz-1',
        type: 'quiz_multiple_choice',
        title: 'Quantos dias e noites choveu durante o dilúvio nos tempos de Noé?',
        subtitle: 'Gênesis 7 • Responda rápido para somar bônus',
        isCompetitive: true,
        pointsBase: 1000,
        speedBonus: true,
        timeLimitSeconds: 20,
        options: [
          { id: 'opt-b1', text: '7 dias e 7 noites', isCorrect: false, color: '#EF4444', icon: '▲' },
          { id: 'opt-b2', text: '40 dias e 40 noites', isCorrect: true, color: '#10B981', icon: '◆' },
          { id: 'opt-b3', text: '100 dias e 100 noites', isCorrect: false, color: '#3B82F6', icon: '●' },
          { id: 'opt-b4', text: '12 dias e 12 noites', isCorrect: false, color: '#F59E0B', icon: '■' }
        ],
        theme: {
          backgroundColor: '#1E1B4B',
          accentColor: '#6366F1',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'spring', duration: 0.6, backgroundEffect: 'particles' }
      },
      {
        id: 'bib-sprint',
        type: 'quiz_term_sprint',
        title: 'Sprint de Vocabulário: Personagens Bíblicos',
        subtitle: 'Digite o maior número de personagens do Antigo e Novo Testamento em 45s!',
        categoryName: 'Personagens Bíblicos',
        timeLimitSeconds: 45,
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#10B981',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'grid' }
      },
      {
        id: 'bib-impostor',
        type: 'game_impostor_investigator',
        title: 'O Infiltrado Bíblico',
        subtitle: '4 Agentes dão pistas sobre um personagem bíblico misterioso!',
        categoryName: 'Personagens Bíblicos',
        impostorConfig: {
          gameStarted: false,
          mode: 'investigator',
          category: 'Personagens Bíblicos',
          secretWord: '',
          impostorParticipantIds: [],
          agentParticipantIds: [],
          roundsTotal: 3,
          currentRound: 1,
          eliminatedIds: [],
          votingActive: false,
          votes: {},
          revealState: 'hidden',
          votingAudience: 'all'
        },
        theme: {
          backgroundColor: '#31102B',
          accentColor: '#F43F5E',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'kinetic', duration: 0.7, backgroundEffect: 'particles' }
      },
      {
        id: 'bib-podium',
        type: 'leaderboard',
        title: 'Pódio dos Campeões Bíblicos',
        subtitle: 'Resultado final da gincana',
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#F59E0B',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'spring', duration: 0.8, backgroundEffect: 'particles' }
      }
    ]
  },
  {
    id: 'blank',
    name: 'Apresentação em Branco',
    badge: '📄',
    description: 'Comece do zero com um slide de Capa e um Lobby QR Code para personalizar tudo.',
    slides: [
      {
        id: 'blank-cover',
        type: 'content_cover',
        title: 'Minha Apresentação Interativa',
        subtitle: 'Edite este slide e adicione novos quizes, enquetes ou jogos',
        theme: {
          backgroundColor: '#0F172A',
          accentColor: '#6366F1',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'fade', duration: 0.6, backgroundEffect: 'particles' }
      },
      {
        id: 'blank-lobby',
        type: 'content_qrcode_lobby',
        title: 'Lobby de Entrada',
        subtitle: 'Conecte-se pelo QR Code ou digite o PIN no celular',
        content: 'Apresentação pronta para começar!',
        theme: {
          backgroundColor: '#0B132B',
          accentColor: '#38BDF8',
          textColor: '#FFFFFF',
          fontFamily: 'Outfit'
        },
        animation: { transition: 'spring', duration: 0.6, backgroundEffect: 'grid' }
      }
    ]
  }
];
