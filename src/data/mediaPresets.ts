export interface MediaPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail?: string;
}

export const PRESET_IMAGES: MediaPreset[] = [
  {
    id: 'img-abstract-1',
    name: 'Nebulosa Futurista',
    category: 'Abstrato',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-abstract-2',
    name: 'Gradiente Líquido',
    category: 'Abstrato',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-tech-1',
    name: 'Conexões Cibernéticas',
    category: 'Tecnologia',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-business-1',
    name: 'Apresentação Corporativa',
    category: 'Negócios',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-celebrate-1',
    name: 'Confete & Celebração',
    category: 'Eventos',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-nature-1',
    name: 'Montanha Espelhada',
    category: 'Natureza',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-space-1',
    name: 'Galáxia Profunda',
    category: 'Espaço',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'img-minimal-1',
    name: 'Geometria Dark Minimal',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80'
  }
];

export const PRESET_AUDIOS: MediaPreset[] = [
  {
    id: 'audio-chime-1',
    name: 'Sino de Notificação',
    category: 'Efeitos',
    url: 'https://cdn.freesound.org/previews/264/264981_4486188-lq.mp3'
  },
  {
    id: 'audio-success-1',
    name: 'Acerto / Vitória',
    category: 'Efeitos',
    url: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
  },
  {
    id: 'audio-drumroll-1',
    name: 'Redoble de Tambores',
    category: 'Suspense',
    url: 'https://cdn.freesound.org/previews/566/566384_6142149-lq.mp3'
  },
  {
    id: 'audio-applause-1',
    name: 'Palmas da Plateia',
    category: 'Celebração',
    url: 'https://cdn.freesound.org/previews/448/448080_9159316-lq.mp3'
  },
  {
    id: 'audio-countdown-1',
    name: 'Tick-Tock Contagem',
    category: 'Timer',
    url: 'https://cdn.freesound.org/previews/254/254316_4062622-lq.mp3'
  },
  {
    id: 'audio-ambient-1',
    name: 'Lo-Fi Chill Apresentação',
    category: 'Música de Fundo',
    url: 'https://cdn.freesound.org/previews/530/530704_11678125-lq.mp3'
  }
];

export const PRESET_VIDEOS: MediaPreset[] = [
  {
    id: 'video-particles-1',
    name: 'Partículas Douradas em Loop',
    category: 'Background',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-floating-golden-particles-in-the-air-41481-large.mp4'
  },
  {
    id: 'video-cyber-1',
    name: 'Túnel Tecnológico Neon',
    category: 'Tecnologia',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-tunnel-with-neon-lights-42513-large.mp4'
  },
  {
    id: 'video-abstract-wave',
    name: 'Ondas Fluidas em Movimento',
    category: 'Abstrato',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4'
  }
];

export const PRESET_STICKERS = [
  '✨', '🔥', '🚀', '💡', '🏆', '🎯', '⭐', '💎', '🎉', '🧠', 
  '⚡', '👏', '🕵️', '🔍', '💥', '📊', '📈', '🔔', '🥇', '👑',
  '🎨', '🔮', '🎙️', '📢', '💻', '🌍', '⏰', '🛡️', '❤️', '🌟'
];

export const PRESET_SHAPES = [
  { type: 'rectangle', label: 'Retângulo' },
  { type: 'rounded', label: 'Cantos Arredondados' },
  { type: 'pill', label: 'Pílula / Tag' },
  { type: 'circle', label: 'Círculo' },
  { type: 'speech_bubble', label: 'Balão de Fala' },
  { type: 'star', label: 'Estrela / Badge' },
  { type: 'arrow_right', label: 'Seta Direita' }
] as const;
