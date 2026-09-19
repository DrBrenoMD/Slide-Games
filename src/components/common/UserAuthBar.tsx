import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Cloud,
  LogOut,
  User,
  FolderHeart,
  Sparkles,
  ChevronDown,
  Loader2,
  Check,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface UserAuthBarProps {
  onOpenLibrary?: (tab?: 'presentations' | 'rooms') => void;
  onSaveCurrentToCloud?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
}

export const UserAuthBar: React.FC<UserAuthBarProps> = ({
  onOpenLibrary,
  onSaveCurrentToCloud,
  isSaving,
  saveSuccess,
}) => {
  const { user, userProfile, loading, loginWithGoogle, logout, savedPresentations, savedCloudRooms } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError('Falha ao conectar com o Google. Tente novamente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        <span>Conectando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 border border-indigo-400/30 transition-all cursor-pointer"
          title="Faça login para salvar apresentações e salas na nuvem"
        >
          {isLoggingIn ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
          )}
          <span>Entrar com Google</span>
        </button>

        {authError && (
          <div className="absolute right-0 top-full mt-1.5 p-2 rounded-xl bg-rose-950 border border-rose-800 text-[11px] text-rose-200 whitespace-nowrap shadow-xl z-50">
            {authError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Botão de Salvar na Nuvem (se fornecido) */}
      {onSaveCurrentToCloud && (
        <button
          onClick={onSaveCurrentToCloud}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer border ${
            saveSuccess
              ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
              : 'bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/40 text-indigo-200'
          }`}
          title="Salvar apresentação atual na sua conta na nuvem"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>{isSaving ? 'Salvando...' : saveSuccess ? 'Salvo na Nuvem' : 'Salvar na Nuvem'}</span>
        </button>
      )}

      {/* Botão de Abrir Biblioteca */}
      {onOpenLibrary && (
        <button
          onClick={() => onOpenLibrary('presentations')}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow"
          title="Ver minhas apresentações e salas salvas"
        >
          <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
          <span>Minha Nuvem</span>
          {(savedPresentations.length > 0 || savedCloudRooms.length > 0) && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
              {savedPresentations.length}
            </span>
          )}
        </button>
      )}

      {/* User Profile Badge & Menu Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-medium cursor-pointer transition-all shadow"
        >
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-400/50"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span className="max-w-[110px] truncate hidden sm:inline text-xs font-semibold">
            {userProfile?.displayName || user.email?.split('@')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 space-y-3 z-50 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Header */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {userProfile?.displayName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Conta Conectada</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onOpenLibrary) onOpenLibrary('presentations');
                }}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="text-base font-bold text-indigo-400">{savedPresentations.length}</div>
                <div className="text-[10px] text-slate-400">Apresentações</div>
              </div>

              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onOpenLibrary) onOpenLibrary('rooms');
                }}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/40 cursor-pointer transition-colors"
              >
                <div className="text-base font-bold text-sky-400">{savedCloudRooms.length}</div>
                <div className="text-[10px] text-slate-400">Salas ao Vivo</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1 pt-1">
              {onOpenLibrary && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenLibrary('presentations');
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Minha Biblioteca na Nuvem</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-300 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors border border-transparent hover:border-rose-800/40"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Desconectar Conta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
