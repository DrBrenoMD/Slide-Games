import React, { useState, useEffect } from 'react';
import { PRESET_AVATARS } from '../../data/presetWords';
import { Team, TeamMode } from '../../types';
import { storageService } from '../../services/storage';
import { Sparkles, Users, ArrowRight, UserCheck, Smartphone, Lock, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ParticipantJoinProps {
  initialRoomCode?: string;
  roomRequiresPassword?: boolean;
  onJoin: (data: { name: string; avatar: string; roomCode: string; teamId?: string; roomPassword?: string }) => void;
  teams?: Team[];
  teamMode?: TeamMode;
  onOpenPresenterLogin: () => void;
  externalError?: string;
}

export const ParticipantJoin: React.FC<ParticipantJoinProps> = ({
  initialRoomCode = '',
  roomRequiresPassword = false,
  onJoin,
  teams = [],
  teamMode = 'none',
  onOpenPresenterLogin,
  externalError
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [roomPassword, setRoomPassword] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetRoomProtected, setTargetRoomProtected] = useState(roomRequiresPassword);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setIsSubmitting(false);
    }
  }, [externalError]);

  // Checa se a sala digitada possui senha configurada
  useEffect(() => {
    const clean = roomCode.trim().toUpperCase();
    if (clean) {
      const room = storageService.getSavedRoom(clean);
      if (room && room.roomPassword && room.roomPassword.trim()) {
        setTargetRoomProtected(true);
      } else if (!roomRequiresPassword) {
        setTargetRoomProtected(false);
      }
    }
  }, [roomCode, roomRequiresPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError('Por favor, informe o código PIN da sala.');
      return;
    }
    if (!cleanName) {
      setError('Por favor, digite seu apelido ou nome.');
      return;
    }

    // Verifica se este usuário foi banido desta sala
    if (storageService.isParticipantBanned(cleanCode, undefined, cleanName)) {
      setError('🚫 Você foi banido desta sala pelo apresentador e não pode ingressar.');
      return;
    }

    // Se a sala exige senha e o usuário não digitou
    const savedRoom = storageService.getSavedRoom(cleanCode);
    if (savedRoom && savedRoom.roomPassword && savedRoom.roomPassword.trim()) {
      if (!roomPassword.trim()) {
        setError('Esta sala é protegida por senha. Por favor, digite a senha da sala.');
        return;
      }
      if (roomPassword.trim() !== savedRoom.roomPassword.trim()) {
        setError('Senha da sala incorreta. Verifique com o apresentador da sessão.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    onJoin({
      roomCode: cleanCode,
      name: cleanName,
      avatar,
      teamId: selectedTeamId,
      roomPassword: roomPassword.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-xl shadow-indigo-950/50">
            ✨
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            ApresentaLive
          </h1>
          <p className="text-xs text-slate-300">
            Entre na apresentação e interaja ao vivo pelo seu celular!
          </p>
        </div>

        {/* Join Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PIN Input */}
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-indigo-300 block mb-1.5">
                Código PIN da Sala
              </label>
              <input
                type="text"
                placeholder="Ex: 749 201"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-center text-xl tracking-widest uppercase focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 shadow-inner"
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-1.5">
                Seu Nome ou Apelido
              </label>
              <input
                type="text"
                placeholder="Como quer ser chamado?"
                maxLength={24}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-medium text-base focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Optional Room Password (if room is protected) */}
            <div className={targetRoomProtected ? 'p-3 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-1.5' : ''}>
              <label className="text-xs uppercase tracking-wider font-bold text-amber-300 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>{targetRoomProtected ? 'Senha da Sala (Obrigatória)' : 'Senha da Sala (Se solicitada)'}</span>
                </span>
                <span className={`text-[10px] font-semibold ${targetRoomProtected ? 'text-amber-400' : 'text-slate-400 font-normal lowercase'}`}>
                  {targetRoomProtected ? 'requerida' : 'opcional'}
                </span>
              </label>
              <input
                type="password"
                placeholder={targetRoomProtected ? 'Digite a senha da sala para entrar' : 'Deixe em branco se a sala for aberta'}
                value={roomPassword}
                onChange={(e) => {
                  setRoomPassword(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-2.5 rounded-2xl font-mono text-sm shadow-inner transition-colors ${
                  targetRoomProtected
                    ? 'bg-slate-900 border border-amber-500/60 text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40'
                    : 'bg-slate-800 border border-slate-700 text-amber-200 focus:outline-none focus:border-amber-400'
                }`}
              />
              {targetRoomProtected && (
                <p className="text-[11px] text-amber-300/80">
                  Esta sala foi configurada com senha pelo apresentador para evitar participantes indesejados.
                </p>
              )}
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-2 flex items-center justify-between">
                <span>Escolha seu Avatar</span>
                <span className="text-2xl">{avatar}</span>
              </label>
              <div className="grid grid-cols-6 gap-2 bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/60 max-h-36 overflow-y-auto">
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      avatar === emoji
                        ? 'bg-indigo-600 scale-110 shadow-md ring-2 ring-white/50'
                        : 'bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Selection if mode is 'choose' */}
            {teamMode === 'choose' && teams.length > 0 && (
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-2">
                  Escolha sua Equipe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedTeamId === t.id
                          ? 'ring-2 ring-white shadow-lg'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: `${t.color}25`,
                        borderColor: t.color,
                        color: t.color
                      }}
                    >
                      <span className="text-lg">{t.badge}</span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-base shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando à Sala...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Jogo</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Presenter Mode Link */}
        <div className="text-center pt-2">
          <button
            onClick={onOpenPresenterLogin}
            className="text-xs text-indigo-400 hover:text-indigo-200 underline cursor-pointer font-medium"
          >
            Você é o apresentador? Entre com a senha aqui
          </button>
        </div>
      </div>
    </div>
  );
};
