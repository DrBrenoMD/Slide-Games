/**
 * Categorias de Palavras e Helpers para o Jogo de Desenho (Estilo Gartic / Imagem e Ação)
 */

export interface GarticCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  words: string[];
}

export const GARTIC_CATEGORIES: GarticCategory[] = [
  {
    id: 'objects',
    name: 'Objetos & Cotidiano',
    icon: '📦',
    description: 'Coisas do dia a dia, ferramentas e utensílios',
    words: [
      'Bicicleta', 'Avião', 'Relógio', 'Guarda-chuva', 'Óculos', 'Lâmpada', 'Violão',
      'Cadeira', 'Celular', 'Geladeira', 'Televisão', 'Martelo', 'Escova de dentes',
      'Tesoura', 'Vassoura', 'Chave', 'Mochila', 'Livro', 'Sapato', 'Câmera',
      'Carro', 'Barco', 'Foguete', 'Lanterna', 'Dado', 'Espelho', 'Guitarra',
      'Microfone', 'Pente', 'Cofre', 'Caneca', 'Fone de ouvido'
    ]
  },
  {
    id: 'animals',
    name: 'Animais & Natureza',
    icon: '🦁',
    description: 'Animais domésticos, selvagens, aquáticos e elementos naturais',
    words: [
      'Elefante', 'Leão', 'Girafa', 'Tartaruga', 'Pinguim', 'Tubarão', 'Cachorro',
      'Gato', 'Macaco', 'Borboleta', 'Jacaré', 'Coruja', 'Canguru', 'Dinossauro',
      'Baleia', 'Sapo', 'Cavalo', 'Porco', 'Abelha', 'Polvo', 'Árvore',
      'Vulcão', 'Arco-íris', 'Sol', 'Lua', 'Montanha', 'Cacto', 'Estrela do mar'
    ]
  },
  {
    id: 'food',
    name: 'Alimentos & Bebidas',
    icon: '🍕',
    description: 'Comidas deliciosas, frutas e lanches',
    words: [
      'Pizza', 'Hambúrguer', 'Melancia', 'Sorvete', 'Batata frita', 'Abacaxi',
      'Pipoca', 'Chocolate', 'Pão', 'Maçã', 'Morango', 'Banana', 'Ovo frito',
      'Bolo de aniversário', 'Queijo', 'Suco de laranja', 'Pirulito', 'Donut',
      'Café', 'Pastel', 'Cenoura', 'Uva', 'Taco', 'Biscoito'
    ]
  },
  {
    id: 'professions',
    name: 'Profissões & Ações',
    icon: '🧑‍🚒',
    description: 'Trabalhos, personagens e verbos de ação',
    words: [
      'Médico', 'Bombeiro', 'Astronauta', 'Pintor', 'Cozinheiro', 'Policial',
      'Professor', 'Dançarino', 'Pescador', 'Mágico', 'Palhaço', 'Detetive',
      'Nadar', 'Voar', 'Dormir', 'Chorar', 'Cantar', 'Correr', 'Pescar',
      'Esquiar', 'Dirigir', 'Pular corda', 'Surfar'
    ]
  },
  {
    id: 'places',
    name: 'Lugares & Construções',
    icon: '🏰',
    description: 'Lugares, monumentos e construções',
    words: [
      'Castelo', 'Pirâmide', 'Praia', 'Hospital', 'Farol', 'Estádio', 'Ponte',
      'Igreja', 'Parque de diversões', 'Cinema', 'Escola', 'Aeroporto', 'Ilha',
      'Circo', 'Hotel', 'Cachoeira', 'Deserto', 'Piscina'
    ]
  },
  {
    id: 'biblical',
    name: 'Bíblico & Histórias',
    icon: '📜',
    description: 'Personagens, passagens e símbolos bíblicos',
    words: [
      'Moisés', 'Davi e Golias', 'Arca de Noé', 'Jonas e a Baleia', 'Sansão',
      'José do Egito', 'Daniel na Cova dos Leões', 'Torre de Babel', 'Cruz',
      'Manjedoura', 'Cálice', 'Templo de Salomão', 'Ovelha perdida', 'Harpa',
      'Pão e Peixes', 'Muralhas de Jericó', 'Sarça ardente', 'Coroa de Espinhos'
    ]
  },
  {
    id: 'general',
    name: 'Geral & Variados',
    icon: '🎨',
    description: 'Mistura completa e divertida de todas as categorias',
    words: [
      'Balão de ar quente', 'Presente', 'Fantasma', 'Coração', 'Troféu', 'Robô',
      'Pipa', 'Caveira', 'Ampulheta', 'Anel', 'Diamante', 'Bateria', 'Coroa',
      'Guarda-roupa', 'Extintor', 'Monstro', 'Alienígena', 'Fita cassete'
    ]
  }
];

/**
 * Normaliza strings para comparação (remove acentos, pontuação, espaços extras e torna minúsculo)
 */
export function normalizeGarticWord(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove espaços e pontuação
    .trim();
}

/**
 * Calcula distância Levenshtein para identificar se o palpite está "perto"
 */
export function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // exclusão
        matrix[i][j - 1] + 1, // inserção
        matrix[i - 1][j - 1] + cost // substituição
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Verifica se um palpite é correto ou se está próximo da palavra secreta
 */
export function evaluateGuess(
  guess: string,
  secretWord: string
): { isCorrect: boolean; isClose: boolean } {
  const normGuess = normalizeGarticWord(guess);
  const normSecret = normalizeGarticWord(secretWord);

  if (!normGuess || !normSecret) {
    return { isCorrect: false, isClose: false };
  }

  // Acerto exato
  if (normGuess === normSecret) {
    return { isCorrect: true, isClose: false };
  }

  // Muito perto: distância <= 2 se a palavra tem 4+ letras, ou substring quase completa
  if (normSecret.length >= 4) {
    const dist = calculateLevenshtein(normGuess, normSecret);
    if (dist <= 2) {
      return { isCorrect: false, isClose: true };
    }
  }

  return { isCorrect: false, isClose: false };
}

/**
 * Gera a dica visual da palavra com underscores e letras reveladas pelo desenhista
 * Ex: "C _ R R _" para "CARRO"
 */
export function generateWordHint(secretWord: string, revealedIndicesOrRatio: number[] | number = []): string {
  if (!secretWord) return '';

  const chars = secretWord.split('');
  const lettersIndices: number[] = [];

  chars.forEach((char, idx) => {
    if (/[a-zA-Z0-9\u00C0-\u00FF]/.test(char)) {
      lettersIndices.push(idx);
    }
  });

  const revealedIndices = new Set<number>();

  if (Array.isArray(revealedIndicesOrRatio)) {
    revealedIndicesOrRatio.forEach((idx) => revealedIndices.add(idx));
  } else {
    // Se for número (ratio)
    const revealRatio = revealedIndicesOrRatio;
    const totalLetters = lettersIndices.length;
    const countToReveal = Math.min(
      Math.floor(totalLetters * Math.min(0.4, revealRatio)),
      Math.max(0, totalLetters - 2)
    );

    if (countToReveal > 0 && lettersIndices.length > 0) {
      revealedIndices.add(lettersIndices[0]);
    }
    if (countToReveal > 1 && lettersIndices.length > 3) {
      revealedIndices.add(lettersIndices[Math.floor(lettersIndices.length / 2)]);
    }
    if (countToReveal > 2 && lettersIndices.length > 5) {
      revealedIndices.add(lettersIndices[lettersIndices.length - 2]);
    }
  }

  return chars
    .map((char, idx) => {
      if (!/[a-zA-Z0-9\u00C0-\u00FF]/.test(char)) {
        return char === ' ' ? '   ' : char;
      }
      if (revealedIndices.has(idx)) {
        return char.toUpperCase();
      }
      return '_';
    })
    .join(' ');
}

/**
 * Retorna o próximo índice de letra a ser revelado pelo desenhista
 */
export function getNextHintIndex(secretWord: string, currentRevealed: number[] = []): number | null {
  if (!secretWord) return null;

  const chars = secretWord.split('');
  const lettersIndices: number[] = [];

  chars.forEach((char, idx) => {
    if (/[a-zA-Z0-9\u00C0-\u00FF]/.test(char)) {
      lettersIndices.push(idx);
    }
  });

  // Garante que pelo menos 2 letras fiquem ocultas para adivinhar
  const maxAllowedReveals = Math.max(1, lettersIndices.length - 2);
  if (currentRevealed.length >= maxAllowedReveals) {
    return null;
  }

  const unrevealed = lettersIndices.filter((idx) => !currentRevealed.includes(idx));
  if (unrevealed.length === 0) return null;

  // Ordem inteligente de revelação: 1º primeira letra, 2º letra do meio, 3º última letra, 4º demais
  const first = unrevealed.find((idx) => idx === lettersIndices[0]);
  if (first !== undefined) return first;

  const middleIdx = lettersIndices[Math.floor(lettersIndices.length / 2)];
  const middle = unrevealed.find((idx) => idx === middleIdx);
  if (middle !== undefined) return middle;

  const lastIdx = lettersIndices[lettersIndices.length - 1];
  const last = unrevealed.find((idx) => idx === lastIdx);
  if (last !== undefined) return last;

  return unrevealed[0];
}
