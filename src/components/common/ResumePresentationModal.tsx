import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, X, Users, Layers, Calendar, BarChart3 } from 'lucide-react';
import { SavedPresentationSession } from '../../services/storage';

export interface ResumePresentationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  roomTitle?: string;
  presentationTitle?: string;
  roomCode: string;
  session?: SavedPresentationSession | null;
  participantsCount?: number;
  currentSlideIndex?: number;
  totalSlides?: number;
  answersCount?: number;
  lastOpenedAt?: number;
  onResume: () => void;
  onStartNew: () => void;
}

export const ResumePresentationModal: React.FC<ResumePresentationModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  roomTitle,
  presentationTitle,
  roomCode,
  session,
  participantsCount,
  currentSlideIndex,
  totalSlides,
  answersCount,
  lastOpenedAt,
  onResume,
  onStartNew
}) => {
  if (!isOpen) return null;

  const handleClose = onCancel || onClose || (() => {});
  const displayTitle = presentationTitle || roomTitle || session?.roomTitle || 'Apresentação';
  const displayParticipants = participantsCount ?? (session?.participants ? Object.keys(session.participants).length : 0);
  const displaySlideIndex = currentSlideIndex ?? session?.currentSlideIndex ?? 0;
  const displayTotalSlides = totalSlides ?? (session?.slides ? session.slides.length : 1);
  const displayAnswers = answersCount ?? (session?.answersSubmitted ? Object.keys(session.answersSubmitted).length : 0);
  const displayLastOpened = lastOpenedAt ?? session?.lastOpenedAt;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Sessão recente';
    try {
      return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Sessão recente';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-slate-800 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                  PIN: {roomCode}
                </span>
                <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                  Apresentação Aberta Anteriormente
                </h3>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-300 line-clamp-1">
              {displayTitle}
            </p>
          </div>

          {/* Resumo da Sessão Anterior */}
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="font-semibold text-slate-300">Elementos salvos da última sessão:</span>
                {displayLastOpened && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatDate(displayLastOpened)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-bold mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Participantes</span>
                  </div>
                  <span className="text-lg font-black text-white font-mono">
                    {displayParticipants}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Slide Atual</span>
                  </div>
                  <span className="text-lg font-black text-white font-mono">
                    {displaySlideIndex + 1} <span className="text-xs text-slate-500">/ {displayTotalSlides || 1}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Respostas</span>
                  </div>
                  <span className="text-lg font-black text-white font-mono">
                    {displayAnswers}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 text-center font-medium leading-relaxed">
              Como deseja abrir esta apresentação? Você pode continuar exatamente de onde parou ou iniciar uma nova sessão do zero.
            </p>

            {/* As duas opções principais */}
            <div className="space-y-3 pt-1">
              {/* Opção 1: Retomar Anterior */}
              <button
                onClick={onResume}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-950/50 flex items-start gap-3.5 text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-98 group border border-indigo-400/30"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:rotate-[-15deg] transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black flex items-center gap-1.5">
                    <span>Retomar Apresentação Anterior</span>
                    <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded-full font-bold">Recomendado</span>
                  </div>
                  <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed">
                    Mantém todos os participantes conectados, pontuações salvas, sorteios realizados, respostas computadas e posição do slide.
                  </p>
                </div>
              </button>

              {/* Opção 2: Iniciar Nova Apresentação */}
              <button
                onClick={onStartNew}
                className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 text-slate-200 shadow-lg flex items-start gap-3.5 text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-98 group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-rose-300 transition-colors">
                    Iniciar Nova Apresentação
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Reseta todos os participantes, pontuações, sorteios, estatísticas e respostas acumuladas, voltando ao primeiro slide.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
