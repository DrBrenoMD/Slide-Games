import React, { useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface PresenterLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedPassword: string;
  onSuccess: () => void;
}

export const PresenterLoginModal: React.FC<PresenterLoginModalProps> = ({
  isOpen,
  onClose,
  expectedPassword,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPassword = expectedPassword || '1234';
    if (password === targetPassword) {
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Modo Apresentador</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Digite a senha de controle para gerenciar a sala, controlar os slides, iniciar votações e jogos. (Senha padrão: <span className="text-indigo-400 font-mono font-bold">1234</span>)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              autoFocus
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border text-white text-sm focus:outline-none ${
                error ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {error && (
              <span className="text-xs text-rose-400 font-medium mt-1 block">
                Senha incorreta. Tente novamente ou use 1234.
              </span>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Acessar Painel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
