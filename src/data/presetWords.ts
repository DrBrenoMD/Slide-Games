/**
 * Listas editáveis de palavras para o jogo "O Infiltrado" (Impostor)
 * Cada categoria contém cerca de 20 termos bem selecionados.
 */

export interface WordCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  words: string[];
}

export const PRESET_WORD_CATEGORIES: WordCategory[] = [
  {
    id: 'biblical',
    name: 'Personagens Bíblicos',
    icon: '📜',
    description: 'Figuras históricas e profetas do Antigo e Novo Testamento',
    words: [
      'Moisés',
      'Davi',
      'Noé',
      'Abraão',
      'Salomão',
      'Pedro',
      'Paulo',
      'Elias',
      'Daniel',
      'José',
      'Sansão',
      'Jonas',
      'Isaías',
      'Maria',
      'Rute',
      'Ester',
      'Tiago',
      'João Batista',
      'Josué',
      'Samuel',
      'Gideão',
      'Lucas'
    ]
  },
  {
    id: 'countries',
    name: 'Países do Mundo',
    icon: '🌍',
    description: 'Nações conhecidas de diferentes continentes',
    words: [
      'Brasil',
      'Japão',
      'França',
      'Canadá',
      'Egito',
      'Austrália',
      'Itália',
      'México',
      'Argentina',
      'Alemanha',
      'Índia',
      'Coreia do Sul',
      'Portugal',
      'Grécia',
      'Noruega',
      'África do Sul',
      'Espanha',
      'Peru',
      'Suíça',
      'Chile',
      'Nova Zelândia',
      'Marrocos'
    ]
  },
  {
    id: 'animals',
    name: 'Animais Selvagens e Aquáticos',
    icon: '🦁',
    description: 'Animais dos mais diversos habitats',
    words: [
      'Leão',
      'Golfinho',
      'Águia',
      'Elefante',
      'Camaleão',
      'Pinguim',
      'Lobo',
      'Urso Polar',
      'Girafa',
      'Coruja',
      'Canguru',
      'Tubarão',
      'Panda',
      'Tigre',
      'Polvo',
      'Raposa',
      'Castor',
      'Falcão',
      'Leopardo',
      'Zebra',
      'Gorila',
      'Tartaruga Marinha'
    ]
  },
  {
    id: 'places',
    name: 'Lugares e Monumentos',
    icon: '🏛️',
    description: 'Pontos turísticos e maravilhas do mundo',
    words: [
      'Torre Eiffel',
      'Pirâmides de Gizé',
      'Coliseu de Roma',
      'Muralha da China',
      'Cristo Redentor',
      'Taj Mahal',
      'Machu Picchu',
      'Grand Canyon',
      'Monte Everest',
      'Cataratas do Iguaçu',
      'Big Ben',
      'Acrópole de Atenas',
      'Estátua da Liberdade',
      'Petra',
      'Vaticano',
      'Canais de Veneza',
      'Ilhas Galápagos',
      'Floresta Amazônica',
      'Deserto do Saara',
      'Stonehenge',
      'Disneyland',
      'Pão de Açúcar'
    ]
  },
  {
    id: 'professions',
    name: 'Profissões e Ocupações',
    icon: '💼',
    description: 'Atividades e carreiras do dia a dia',
    words: [
      'Astronauta',
      'Médico Cirurgião',
      'Bombeiro',
      'Arquiteto',
      'Chef de Cozinha',
      'Piloto de Avião',
      'Programador',
      'Detetive Particular',
      'Jornalista',
      'Professor',
      'Cientista',
      'Advogado',
      'Fotógrafo',
      'Veterinário',
      'Músico',
      'Arqueólogo',
      'Mergulhador',
      'Policial',
      'Psicólogo',
      'Dentista'
    ]
  },
  {
    id: 'objects',
    name: 'Objetos do Cotidiano',
    icon: '🎒',
    description: 'Itens domésticos e utilidades comuns',
    words: [
      'Guarda-chuva',
      'Micro-ondas',
      'Violão',
      'Telescópio',
      'Relógio de Pulso',
      'Lanterna',
      'Cafeteira',
      'Bússola',
      'Mochila',
      'Óculos de Sol',
      'Espelho',
      'Ventilador',
      'Livro Antigo',
      'Tesoura',
      'Chaveiro',
      'Garrafa Térmica',
      'Fone de Ouvido',
      'Ferro de Passar',
      'Luminária',
      'Calculadora'
    ]
  },
  {
    id: 'food',
    name: 'Alimentos e Comidas',
    icon: '🍕',
    description: 'Pratos, sobremesas e ingredientes populares',
    words: [
      'Pizza Margherita',
      'Hambúrguer Artesanal',
      'Sushi',
      'Lasanha',
      'Churrasco',
      'Feijoada',
      'Pastel de Queijo',
      'Pão de Queijo',
      'Coxinha',
      'Tacos Mexicanos',
      'Bolo de Chocolate',
      'Sorvete de Baunilha',
      'Açaí na Tigela',
      'Panqueca',
      'Guacamole',
      'Batata Frita',
      'Espaguete à Carbonara',
      'Croissant',
      'Pipoca Doce',
      'Fondue de Queijo',
      'Salada Caesar',
      'Waffle'
    ]
  },
  {
    id: 'movies',
    name: 'Filmes, Séries e Desenhos',
    icon: '🎬',
    description: 'Produções famosas do cinema e televisão',
    words: [
      'O Rei Leão',
      'Harry Potter',
      'Vingadores: Ultimato',
      'Star Wars',
      'Jurassic Park',
      'Titanic',
      'Toy Story',
      'Stranger Things',
      'O Senhor dos Anéis',
      'Homem-Aranha',
      'Batman: O Cavaleiro das Trevas',
      'Frozen',
      'Shrek',
      'Matrix',
      'Avatar',
      'Monstros S.A.',
      'Piratas do Caribe',
      'Procurando Nemo',
      'De Volta para o Futuro',
      'Os Incríveis',
      'Carros',
      'Kung Fu Panda'
    ]
  }
];

export function getWordsForCategory(categoryName: string, customList?: string[]): string[] {
  if (customList && customList.length > 0) {
    return customList;
  }
  const found = PRESET_WORD_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.words : PRESET_WORD_CATEGORIES[0].words;
}

export function getRandomWordForCategory(categoryName: string, customList?: string[]): string {
  const words = getWordsForCategory(categoryName, customList);
  return words[Math.floor(Math.random() * words.length)] || 'Moisés';
}

export const PRESET_AVATARS = [
  '🦊', '🚀', '🦁', '🤖', '🐱', '⚡', '🎨', '🧙', 
  '👾', '🦄', '🐼', '🦖', '🌟', '🐬', '🦉', '🏎️',
  '👑', '🐙', '🎯', '🔥', '💎', '🍀', '🌈', '🎸'
];

export const PRESET_TEAMS = [
  { id: 'team-red', name: 'Fênix Escarlate', color: '#EF4444', badge: '🔥', score: 0 },
  { id: 'team-blue', name: 'Tubarões Azuis', color: '#3B82F6', badge: '🌊', score: 0 },
  { id: 'team-emerald', name: 'Dragões Esmeralda', color: '#10B981', badge: '🐉', score: 0 },
  { id: 'team-amber', name: 'Trovão Dourado', color: '#F59E0B', badge: '⚡', score: 0 },
];
