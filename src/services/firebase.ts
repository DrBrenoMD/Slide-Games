import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Slide, UserProfile, SavedPresentation, SavedRoom } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check configuration.');
    }
  }
}
testConnection();

// Authentication helpers
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync profile document to Firestore
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Apresentador',
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userRef, userProfile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  }

  return user;
};

export const logoutUser = async () => {
  await fbSignOut(auth);
};

export const subscribeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ==========================================
// Presentations Storage
// ==========================================

export async function saveUserPresentation(
  presentation: Omit<SavedPresentation, 'createdAt' | 'updatedAt'> & {
    createdAt?: string;
    updatedAt?: string;
  }
) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('É necessário estar logado para salvar apresentações.');

  const presId = presentation.id || `pres_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `users/${currentUser.uid}/presentations/${presId}`;
  const presRef = doc(db, 'users', currentUser.uid, 'presentations', presId);

  const now = new Date().toISOString();
  const payload: SavedPresentation = {
    id: presId,
    ownerId: currentUser.uid,
    title: presentation.title.trim() || 'Apresentação Sem Título',
    slides: presentation.slides || [],
    theme: presentation.theme || 'modern-dark',
    slideCount: (presentation.slides || []).length,
    createdAt: presentation.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(presRef, payload, { merge: true });
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export function subscribeUserPresentations(
  userId: string,
  onData: (presentations: SavedPresentation[]) => void,
  onError?: (error: any) => void
) {
  const path = `users/${userId}/presentations`;
  const presCol = collection(db, 'users', userId, 'presentations');
  const q = query(presCol);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedPresentation[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as SavedPresentation);
      });
      // Order descending by updatedAt
      items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function deleteUserPresentation(presentationId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Não autenticado');

  const path = `users/${currentUser.uid}/presentations/${presentationId}`;
  const presRef = doc(db, 'users', currentUser.uid, 'presentations', presentationId);
  try {
    await deleteDoc(presRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

// ==========================================
// Rooms Storage
// ==========================================

export async function saveUserRoom(
  room: {
    roomCode: string;
    presentationTitle: string;
    presentationId?: string;
    slides: Slide[];
    participantsCount: number;
    status?: 'active' | 'closed' | 'archived';
  }
) {
  const currentUser = auth.currentUser;
  if (!currentUser) return; // Silent if not logged in

  const cleanRoomCode = room.roomCode.trim().toUpperCase();
  const roomId = `room_${cleanRoomCode}`;
  const path = `users/${currentUser.uid}/rooms/${roomId}`;
  const roomRef = doc(db, 'users', currentUser.uid, 'rooms', roomId);

  const now = new Date().toISOString();
  const payload: SavedRoom = {
    id: roomId,
    roomCode: cleanRoomCode,
    ownerId: currentUser.uid,
    presentationTitle: room.presentationTitle || 'Apresentação ao Vivo',
    presentationId: room.presentationId || '',
    slides: room.slides || [],
    participantsCount: room.participantsCount || 0,
    status: room.status || 'active',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(roomRef, payload, { merge: true });
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeUserRooms(
  userId: string,
  onData: (rooms: SavedRoom[]) => void,
  onError?: (error: any) => void
) {
  const path = `users/${userId}/rooms`;
  const roomCol = collection(db, 'users', userId, 'rooms');
  const q = query(roomCol);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedRoom[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as SavedRoom);
      });
      items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function deleteUserRoom(roomId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Não autenticado');

  const path = `users/${currentUser.uid}/rooms/${roomId}`;
  const roomRef = doc(db, 'users', currentUser.uid, 'rooms', roomId);
  try {
    await deleteDoc(roomRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}
