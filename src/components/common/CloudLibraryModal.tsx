import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Slide, SavedPresentation, SavedRoom } from '../../types';
import {
  FolderHeart,
  Layers,
  Calendar,
  Trash2,
  Copy,
  Edit3,
  Play,
  Tv,
  X,
  Plus,
  Cloud,
  Check,
  AlertCircle,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CloudLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'presentations' | 'rooms';
  onLoadPresentation: (presentation: SavedPresentation) => void;
  onHostPresentation: (presentation: SavedPresentation) => void;
  onOpenRoomConsole: (roomCode: string) => void;
  onProjectRoom: (roomCode: string) => void;
  onCreateNewPresentation: () => void;
}

export const CloudLibraryModal: React.FC<CloudLibraryModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'presentations',
  onLoadPresentation,
  onHostPresentation,
  onOpenRoomConsole,
  onProjectRoom,
  onCreateNewPresentation,
}) => {
  const {
    user,
    userProfile,
    loginWithGoogle,
    savedPresentations,
    savedCloudRooms,
    removePresentationFromCloud,
    removeRoomFromCloud,
    savePresentationToCloud,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'presentations' | 'rooms'>(defaultTab);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleDuplicate = async (pres: SavedPresentation) => {
    setIsDuplicating(pres.id);
    try {
      await savePresentationToCloud(
        `${pres.title} (Cópia)`,
        pres.slides || [],
        pres.theme || 'modern-dark'
      );
    } catch (err) {
      console.error('Erro ao duplicar:', err);
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDeletePresentation = async (id: string) => {
    try {
      await removePresentationFromCloud(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Erro ao deletar apresentação:', err);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await removeRoomFromCloud(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Erro ao deletar sala:', err);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Minha Nuvem ApresentaLive</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                  Google Cloud Firestore
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Acesse suas apresentações e salas salvas em qualquer dispositivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If not logged in */}
        {!user ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
              <Cloud className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-white">Faça Login para Acessar a Nuvem</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Com o login Google, todas as suas apresentações criadas, slides interativos e salas salvas ficam sincronizados na nuvem para você projetar e apresentar de qualquer lugar!
              </p>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Entrar com Conta Google</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tabs Bar & Quick Actions */}
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('presentations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'presentations'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Minhas Apresentações ({savedPresentations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'rooms'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Minhas Salas ao Vivo ({savedCloudRooms.length})</span>
                </button>
              </div>

              {activeTab === 'presentations' && (
                <button
                  onClick={() => {
                    onClose();
                    onCreateNewPresentation();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Criar Nova Apresentação</span>
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'presentations' ? (
                savedPresentations.length === 0 ? (
                  <div className="p-12 text-center space-y-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <FolderHeart className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Nenhuma apresentação salva na nuvem</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Abra o editor de slides e clique no botão "Salvar na Nuvem" para sincronizar suas apresentações com a sua conta.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onCreateNewPresentation();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar Primeira Apresentação</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPresentations.map((pres) => {
                      const isDeleting = deleteConfirmId === pres.id;
                      return (
                        <div
                          key={pres.id}
                          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {pres.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-semibold whitespace-nowrap">
                                Nuvem
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-sky-400" />
                                {pres.slides?.length || 0} slides
                              </span>
                              {pres.updatedAt && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(pres.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Botão Editar */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onLoadPresentation(pres);
                                }}
                                className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Abrir no Editor</span>
                              </button>

                              {/* Botão Apresentar / Iniciar Sala */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onHostPresentation(pres);
                                }}
                                className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Iniciar Sala</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                              <button
                                onClick={() => handleDuplicate(pres)}
                                disabled={isDuplicating === pres.id}
                                className="hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isDuplicating === pres.id ? 'Duplicando...' : 'Duplicar'}</span>
                              </button>

                              {isDeleting ? (
                                <div className="flex items-center gap-1.5 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-700">
                                  <span className="text-[10px] text-rose-300">Excluir?</span>
                                  <button
                                    onClick={() => handleDeletePresentation(pres.id)}
                                    className="text-rose-400 font-bold hover:text-rose-200 cursor-pointer px-1 text-xs"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-slate-400 hover:text-white cursor-pointer px-1 text-xs"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(pres.id)}
                                  className="hover:text-rose-400 flex items-center gap-1 cursor-pointer text-slate-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Tab Salas Salvas na Nuvem */
                savedCloudRooms.length === 0 ? (
                  <div className="p-12 text-center space-y-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Tv className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Nenhuma sala na nuvem ainda</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Quando você cria ou apresenta uma sala estando logado, a sessão é registrada na sua conta para acesso rápido.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCloudRooms.map((room) => {
                      const isDeleting = deleteConfirmId === room.id;
                      return (
                        <div
                          key={room.id}
                          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/50 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-sky-300 transition-colors">
                                {room.presentationTitle}
                              </h3>
                              <button
                                onClick={() => handleCopyPin(room.roomCode)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-500 font-mono text-xs text-sky-400 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span>PIN: {room.roomCode}</span>
                                {copiedPin === room.roomCode ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                                {room.participantsCount || 0} participantes
                              </span>
                              {room.updatedAt && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(room.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Apresentar no Console */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenRoomConsole(room.roomCode);
                                }}
                                className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Play className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Apresentar</span>
                              </button>

                              {/* Projetar em 2ª Tela */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onProjectRoom(room.roomCode);
                                }}
                                className="py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Tv className="w-3.5 h-3.5 text-sky-400" />
                                <span>Projetar (2ª Tela)</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-end text-xs pt-1">
                              {isDeleting ? (
                                <div className="flex items-center gap-1.5 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-700">
                                  <span className="text-[10px] text-rose-300">Excluir?</span>
                                  <button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="text-rose-400 font-bold hover:text-rose-200 cursor-pointer px-1 text-xs"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-slate-400 hover:text-white cursor-pointer px-1 text-xs"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(room.id)}
                                  className="hover:text-rose-400 flex items-center gap-1 cursor-pointer text-slate-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div>Sincronização em Tempo Real ativada</div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer font-medium"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
