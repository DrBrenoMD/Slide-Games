import React, { useState } from 'react';
import { PRESET_WORD_CATEGORIES, WordCategory, getWordsForCategory, getRandomWordForCategory } from '../../data/presetWords';
import { ImpostorConfig } from '../../types';
import { BookOpen, Sparkles, Shuffle, Plus, X, Check, RefreshCw, KeyRound, Tag } from 'lucide-react';

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: string;
  currentSecretWord: string;
  customWordList?: string[];
  onSave: (data: { category: string; secretWord: string; customWordList: string[] }) => void;
}

export const WordListModal: React.FC<WordListModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  currentSecretWord,
  customWordList,
  onSave
}) => {
  const [selectedCategoryName, setSelectedCategoryName] = useState(currentCategory || 'Personagens Bíblicos');
  const [secretWord, setSecretWord] = useState(currentSecretWord || '');
  const [words, setWords] = useState<string[]>(() => {
    return getWordsForCategory(currentCategory || 'Personagens Bíblicos', customWordList);
  });
  const [newWordInput, setNewWordInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  if (!isOpen) return null;

  const handleSelectPresetCategory = (cat: WordCategory) => {
    setIsCustomCategory(false);
    setSelectedCategoryName(cat.name);
    setWords([...cat.words]);
    // Sorteia palavra secreta padrão para esta categoria
    const randomWord = cat.words[Math.floor(Math.random() * cat.words.length)] || cat.words[0];
    setSecretWord(randomWord);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newWordInput.trim();
    if (!raw) return;

    // Suporte a adicionar múltiplas palavras separadas por vírgula
    const newItems = raw
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && !words.includes(w));

    if (newItems.length > 0) {
      setWords((prev) => [...prev, ...newItems]);
      // Se ainda não tem palavra secreta válida, usa uma das novas
      if (!secretWord) {
        setSecretWord(newItems[0]);
      }
    }
    setNewWordInput('');
  };

  const handleRemoveWord = (wordToRemove: string) => {
    const updated = words.filter((w) => w !== wordToRemove);
    setWords(updated);
    if (secretWord === wordToRemove && updated.length > 0) {
      setSecretWord(updated[0]);
    }
  };

  const handleRandomizeSecretWord = () => {
    if (words.length === 0) return;
    const random = words[Math.floor(Math.random() * words.length)];
    setSecretWord(random);
  };

  const handleResetToDefault = () => {
    const preset = PRESET_WORD_CATEGORIES.find((c) => c.name === selectedCategoryName);
    if (preset) {
      setWords([...preset.words]);
      setSecretWord(preset.words[0]);
    }
  };

  const handleConfirm = () => {
    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || 'Personalizada'
      : selectedCategoryName;

    const finalWord = secretWord.trim() || (words[0] || 'Moisés');

    onSave({
      category: finalCategory,
      secretWord: finalWord,
      customWordList: words
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Definir Categoria & Lista de Palavras
              </h3>
              <p className="text-xs text-slate-400">
                Escolha o tema, edite os termos do jogo e defina a palavra secreta desta rodada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Categoria Preset Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-slate-300 block mb-2">
              1. Escolha a Categoria / Tema
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_WORD_CATEGORIES.map((cat) => {
                const isSelected = !isCustomCategory && selectedCategoryName === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectPresetCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-lg">{cat.icon}</div>
                    <div className="text-xs font-bold truncate mt-1">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {cat.words.length} termos
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(true);
                  if (!customCategoryInput) setCustomCategoryInput('Tema Personalizado');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isCustomCategory
                    ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-lg">✨</div>
                <div className="text-xs font-bold truncate mt-1">Personalizado</div>
                <div className="text-[10px] text-slate-400">Criar tema próprio</div>
              </button>
            </div>

            {isCustomCategory && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Nome da Categoria (Ex: Séries da Netflix, Carros antigos...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Palavra Secreta Desta Rodada */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>2. Palavra Secreta desta Rodada</span>
              </label>

              <button
                type="button"
                onClick={handleRandomizeSecretWord}
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Sortear Palavra</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={secretWord}
                onChange={(e) => setSecretWord(e.target.value)}
                placeholder="Ex: Moisés"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={handleRandomizeSecretWord}
                className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                title="Sortear aleatoriamente da lista de palavras abaixo"
              >
                <Shuffle className="w-4 h-4" />
                <span>Sortear</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Esta é a palavra que os Agentes/Civis verão no celular. O Infiltrado NÃO verá esta palavra.
            </p>
          </div>

          {/* Lista de Palavras da Categoria (Editável) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Lista de Palavras da Categoria ({words.length})</span>
              </label>

              {!isCustomCategory && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restaurar Originais</span>
                </button>
              )}
            </div>

            {/* Input para adicionar nova palavra */}
            <form onSubmit={handleAddWord} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Digite uma palavra (ou várias separadas por vírgula) e aperte Enter..."
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Tags de Palavras */}
            <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
              {words.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center w-full">
                  Nenhuma palavra na lista. Adicione palavras acima!
                </div>
              ) : (
                words.map((w) => {
                  const isCurrentSecret = secretWord.toLowerCase() === w.toLowerCase();
                  return (
                    <div
                      key={w}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCurrentSecret
                          ? 'bg-indigo-600 text-white font-bold shadow ring-1 ring-indigo-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSecretWord(w)}
                        className="cursor-pointer hover:underline"
                        title="Definir como Palavra Secreta desta Rodada"
                      >
                        {w}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(w)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer p-0.5"
                        title="Remover termo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Clique em qualquer palavra da lista para torná-la a Palavra Secreta.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Palavra & Categoria</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
