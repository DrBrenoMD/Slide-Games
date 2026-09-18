import React, { useState } from 'react';
import { ROOM_TEMPLATES, RoomTemplate } from '../../data/templates';
import { Slide } from '../../types';
import {
  Gamepad2,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Tv,
  Users,
  Smartphone,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomePortalProps {
  currentRoomCode: string;
  onJoinAsParticipant: (pin: string) => void;
  onCreateRoom: (data: {
    roomCode: string;
    roomTitle: string;
    adminPassword: string;
    slides: Slide[];
  }) => void;
  onOpenAdminLogin: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  currentRoomCode,
  onJoinAsParticipant,
  onCreateRoom,
  onOpenAdminLogin
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'create'>('options');
  const [pinInput, setPinInput] = useState(currentRoomCode || '');
  const [pinError, setPinError] = useState('');

  // Formulário de Criação de Sala
  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [newRoomCode, setNewRoomCode] = useState(() => generateRandomPin());
  const [roomTitle, setRoomTitle] = useState('Gincana & Slides Interativos');
  const [adminPassword, setAdminPassword] = useState('1234');
  const [confirmPassword, setConfirmPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('full_show');
  const [createError, setCreateError] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setPinError('Digite o código PIN da sala.');
      return;
    }
    setPinError('');
    onJoinAsParticipant(cleanPin);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const cleanPin = newRoomCode.trim().toUpperCase();
    if (!cleanPin || cleanPin.length < 4) {
      setCreateError('O PIN da sala deve ter pelo menos 4 caracteres.');
      return;
    }

    if (!adminPassword || adminPassword.length < 3) {
      setCreateError('A senha de administrador deve ter pelo menos 3 caracteres.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setCreateError('As senhas de administrador não coincidem.');
      return;
    }

    const template = ROOM_TEMPLATES.find((t) => t.id === selectedTemplateId) || ROOM_TEMPLATES[0];

    onCreateRoom({
      roomCode: cleanPin,
      roomTitle: roomTitle.trim() || 'Apresentação Interativa',
      adminPassword,
      slides: template.slides
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shadow-lg">
            ✨
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white font-display block">
              ApresentaLive
            </span>
            <span className="text-[11px] text-slate-400 block -mt-1 font-medium">
              Slides, Quizes & O Infiltrado ao Vivo
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAdminLogin}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
          title="Fazer login como administrador de uma sala já criada"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Login do Administrador</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 my-auto z-10">
        {activeTab === 'options' ? (
          <div className="space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                O que você deseja fazer?
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Entre como jogador pelo celular para interagir ao vivo ou crie sua própria sala protegida por senha para comandar o telão.
              </p>
            </div>

            {/* Two Primary Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Option 1: Jogar / Entrar em uma Sala */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border-2 border-indigo-500/30 hover:border-indigo-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-3xl text-indigo-400 shadow-lg">
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      Convidado / Jogador
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Jogar / Entrar em uma Sala
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      Conecte-se com seu celular. Participe dos quizes com bônus de velocidade, vote nas enquetes e jogue O Infiltrado!
                    </p>
                  </div>

                  {/* Form de PIN rápido */}
                  <form onSubmit={handleQuickJoin} className="pt-2 space-y-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                        Código PIN da Sala
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 749201"
                        maxLength={10}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError('');
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-xl tracking-widest uppercase focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 shadow-inner"
                      />
                      {pinError && (
                        <p className="text-xs text-rose-400 mt-1 font-semibold">{pinError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Entrar na Sala & Jogar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Option 2: Criar uma Nova Sala (Apresentador) */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border-2 border-rose-500/30 hover:border-rose-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-3xl text-rose-400 shadow-lg">
                    <Tv className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-rose-400">
                      Apresentador / Mestre do Jogo
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Criar Sala (Apresentador)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      Defina sua senha de administrador, crie e edite seus slides interativos, defina listas de palavras e comande o telão com total segurança.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <Shield className="w-4 h-4" />
                      <span>Protegido por Senha</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Nenhum participante poderá ver as respostas, palavras secretas ou telão de controle sem a senha que você definir.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-sm shadow-xl hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Criar Sala & Definir Senha</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Create Room Form Screen */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold text-rose-400">
                  Nova Apresentação
                </span>
                <h2 className="text-2xl font-black text-white">Criar Sala de Apresentador</h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('options')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Nome da Sala / Evento */}
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-1.5">
                  Nome da Sala / Evento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gincana de Sexta, Quiz Bíblico..."
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PIN da Sala */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    Código PIN da Sala (Para os Jogadores Conectarem)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewRoomCode(generateRandomPin())}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gerar Novo PIN</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newRoomCode}
                  onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Senha do Administrador */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Definir Senha de Administrador (Obrigatória)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Esta senha será necessária para acessar o telão, abrir o editor de slides e gerenciar os jogos. Guarde-a com você!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sua Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Mínimo 3 caracteres"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 pr-9 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modelo Inicial de Slides */}
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-2">
                  Escolha o Modelo Inicial de Slides
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROOM_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedTemplateId === tmpl.id
                          ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{tmpl.badge}</span>
                        {selectedTemplateId === tmpl.id && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-white">{tmpl.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
                  {createError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Sala & Abrir Editor de Slides</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 z-10">
        <div>ApresentaLive • Plataforma Interativa em Tempo Real</div>
        <div>Totalmente responsivo para Telões & Celulares</div>
      </footer>
    </div>
  );
};
