import { Slide, Team, TeamMode } from '../types';
import { SAMPLE_PRESENTATION_SLIDES } from '../data/samplePresentations';
import { PRESET_TEAMS } from '../data/presetWords';

export interface SavedRoom {
  id: string;
  roomCode: string;
  roomTitle: string;
  presenterPassword: string;
  roomPassword?: string; // Senha para os participantes entrarem (opcional)
  bannedParticipantIds?: string[];
  bannedParticipantNames?: string[];
  slides: Slide[];
  teamMode: TeamMode;
  teams: Team[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'apresentalive_saved_rooms';
const ACTIVE_ROOM_KEY = 'apresentalive_active_room_code';

export const storageService = {
  getSavedRooms(): SavedRoom[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.initDefaultRooms();
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return this.initDefaultRooms();
    } catch (e) {
      console.error('Erro ao ler salas salvas do storage:', e);
      return this.initDefaultRooms();
    }
  },

  initDefaultRooms(): SavedRoom[] {
    const defaultRoom: SavedRoom = {
      id: 'default-749201',
      roomCode: '749201',
      roomTitle: 'Gincana & Slides Interativos',
      presenterPassword: '1234',
      slides: SAMPLE_PRESENTATION_SLIDES,
      teamMode: 'random',
      teams: PRESET_TEAMS,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now()
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultRoom]));
      } catch (e) {
        console.warn('Não foi possível salvar a sala padrão no storage:', e);
      }
    }
    return [defaultRoom];
  },

  getSavedRoom(code: string): SavedRoom | null {
    const rooms = this.getSavedRooms();
    const cleanCode = code.trim().toUpperCase();
    return rooms.find((r) => r.roomCode.toUpperCase() === cleanCode) || null;
  },

  saveRoom(room: SavedRoom): void {
    if (typeof window === 'undefined') return;
    try {
      const rooms = this.getSavedRooms();
      const cleanCode = room.roomCode.trim().toUpperCase();
      const existingIdx = rooms.findIndex((r) => r.roomCode.toUpperCase() === cleanCode);

      const toSave: SavedRoom = {
        ...room,
        roomCode: cleanCode,
        updatedAt: Date.now()
      };

      let nextRooms: SavedRoom[];
      if (existingIdx >= 0) {
        nextRooms = [...rooms];
        nextRooms[existingIdx] = toSave;
      } else {
        nextRooms = [toSave, ...rooms];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRooms));
    } catch (e) {
      console.error('Erro ao salvar sala no storage:', e);
    }
  },

  duplicateRoom(code: string): SavedRoom | null {
    const original = this.getSavedRoom(code);
    if (!original) return null;

    const newPin = this.generateUniqueRoomCode();
    const newTitle = this.generateUniqueRoomTitle(original.roomTitle);
    const clonedRoom: SavedRoom = {
      ...original,
      id: `room-${newPin}`,
      roomCode: newPin,
      roomTitle: newTitle,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.saveRoom(clonedRoom);
    return clonedRoom;
  },

  deleteRoom(code: string): void {
    if (typeof window === 'undefined') return;
    try {
      const rooms = this.getSavedRooms();
      const cleanCode = code.trim().toUpperCase();
      const nextRooms = rooms.filter((r) => r.roomCode.toUpperCase() !== cleanCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRooms));
    } catch (e) {
      console.error('Erro ao deletar sala do storage:', e);
    }
  },

  getActiveRoomCode(): string {
    if (typeof window === 'undefined') return '749201';
    return localStorage.getItem(ACTIVE_ROOM_KEY) || '749201';
  },

  setActiveRoomCode(code: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_ROOM_KEY, code.trim().toUpperCase());
  },

  isRoomTitleTaken(title: string, excludeRoomCode?: string): boolean {
    const normalize = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanTitle = normalize(title);
    if (!cleanTitle) return false;
    const rooms = this.getSavedRooms();
    return rooms.some((r) => {
      if (excludeRoomCode && r.roomCode.toUpperCase() === excludeRoomCode.trim().toUpperCase()) {
        return false;
      }
      return normalize(r.roomTitle) === cleanTitle;
    });
  },

  generateUniqueRoomTitle(baseTitle: string, excludeRoomCode?: string): string {
    const trimmed = baseTitle.trim().replace(/\s*\(Cópia(\s+\d+)?\)$/i, '');
    let candidate = `${trimmed} (Cópia)`;
    let counter = 2;
    while (this.isRoomTitleTaken(candidate, excludeRoomCode)) {
      candidate = `${trimmed} (Cópia ${counter})`;
      counter++;
    }
    return candidate;
  },

  isRoomCodeTaken(code: string, excludeRoomCode?: string): boolean {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;
    const rooms = this.getSavedRooms();
    return rooms.some((r) => {
      if (excludeRoomCode && r.roomCode.toUpperCase() === excludeRoomCode.trim().toUpperCase()) {
        return false;
      }
      return r.roomCode.toUpperCase() === cleanCode;
    });
  },

  generateUniqueRoomCode(): string {
    const rooms = this.getSavedRooms();
    const existingCodes = new Set(rooms.map((r) => r.roomCode.toUpperCase()));
    let newCode = '';
    let attempts = 0;
    do {
      newCode = Math.floor(100000 + Math.random() * 900000).toString();
      attempts++;
    } while (existingCodes.has(newCode) && attempts < 100);
    return newCode;
  },

  isParticipantBanned(roomCode: string, participantId?: string, participantName?: string): boolean {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem(`apresentalive_banned_${roomCode.trim().toUpperCase()}`) === 'true') {
          return true;
        }
      } catch {
        // ignore
      }
    }
    const room = this.getSavedRoom(roomCode);
    if (!room) return false;

    if (participantId && room.bannedParticipantIds && room.bannedParticipantIds.includes(participantId)) {
      return true;
    }

    if (participantName && room.bannedParticipantNames) {
      const cleanName = participantName.trim().toLowerCase();
      if (room.bannedParticipantNames.some((n) => n.trim().toLowerCase() === cleanName)) {
        return true;
      }
    }

    return false;
  },

  banParticipant(roomCode: string, participantId: string, participantName?: string): void {
    const room = this.getSavedRoom(roomCode);
    if (!room) return;

    const bannedIds = new Set(room.bannedParticipantIds || []);
    bannedIds.add(participantId);

    const bannedNames = new Set(room.bannedParticipantNames || []);
    if (participantName && participantName.trim()) {
      bannedNames.add(participantName.trim());
    }

    const updatedRoom: SavedRoom = {
      ...room,
      bannedParticipantIds: Array.from(bannedIds),
      bannedParticipantNames: Array.from(bannedNames),
      updatedAt: Date.now()
    };
    this.saveRoom(updatedRoom);
  }
};
