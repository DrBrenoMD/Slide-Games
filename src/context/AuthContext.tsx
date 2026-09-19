import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  subscribeAuth,
  saveUserPresentation,
  subscribeUserPresentations,
  deleteUserPresentation,
  saveUserRoom,
  subscribeUserRooms,
  deleteUserRoom,
} from '../services/firebase';
import { Slide, UserProfile, SavedPresentation, SavedRoom } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  savedPresentations: SavedPresentation[];
  savedCloudRooms: SavedRoom[];
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  savePresentationToCloud: (
    title: string,
    slides: Slide[],
    theme?: string,
    existingId?: string
  ) => Promise<SavedPresentation | null>;
  removePresentationFromCloud: (id: string) => Promise<void>;
  saveRoomToCloud: (roomData: {
    roomCode: string;
    presentationTitle: string;
    presentationId?: string;
    slides: Slide[];
    participantsCount: number;
    status?: 'active' | 'closed' | 'archived';
  }) => Promise<void>;
  removeRoomFromCloud: (roomId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [savedCloudRooms, setSavedCloudRooms] = useState<SavedRoom[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeAuth((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Apresentador',
          photoURL: currentUser.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setUserProfile(null);
        setSavedPresentations([]);
        setSavedCloudRooms([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore User Presentations & Rooms when logged in
  useEffect(() => {
    if (!user) {
      setSavedPresentations([]);
      setSavedCloudRooms([]);
      return;
    }

    const unsubPres = subscribeUserPresentations(
      user.uid,
      (list) => {
        setSavedPresentations(list);
      },
      (err) => {
        console.warn('Erro ao carregar apresentações do usuário:', err);
      }
    );

    const unsubRooms = subscribeUserRooms(
      user.uid,
      (list) => {
        setSavedCloudRooms(list);
      },
      (err) => {
        console.warn('Erro ao carregar salas do usuário:', err);
      }
    );

    return () => {
      unsubPres();
      unsubRooms();
    };
  }, [user]);

  const loginWithGoogleHandler = async (): Promise<User> => {
    try {
      const loggedUser = await signInWithGoogle();
      return loggedUser;
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
      throw error;
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const savePresentationToCloudHandler = async (
    title: string,
    slides: Slide[],
    theme: string = 'modern-dark',
    existingId?: string
  ): Promise<SavedPresentation | null> => {
    if (!user) {
      throw new Error('Faça login para salvar suas apresentações na nuvem.');
    }

    const payload = {
      id: existingId || `pres_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId: user.uid,
      title: title.trim() || 'Apresentação Sem Título',
      slides,
      theme,
      slideCount: slides.length,
    };

    return await saveUserPresentation(payload);
  };

  const removePresentationFromCloudHandler = async (id: string) => {
    await deleteUserPresentation(id);
  };

  const saveRoomToCloudHandler = async (roomData: {
    roomCode: string;
    presentationTitle: string;
    presentationId?: string;
    slides: Slide[];
    participantsCount: number;
    status?: 'active' | 'closed' | 'archived';
  }) => {
    if (!user) return;
    await saveUserRoom(roomData);
  };

  const removeRoomFromCloudHandler = async (roomId: string) => {
    await deleteUserRoom(roomId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        savedPresentations,
        savedCloudRooms,
        loginWithGoogle: loginWithGoogleHandler,
        logout: logoutHandler,
        savePresentationToCloud: savePresentationToCloudHandler,
        removePresentationFromCloud: removePresentationFromCloudHandler,
        saveRoomToCloud: saveRoomToCloudHandler,
        removeRoomFromCloud: removeRoomFromCloudHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
