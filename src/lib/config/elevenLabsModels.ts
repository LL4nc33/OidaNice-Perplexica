// ElevenLabs TTS model configurations

export interface ElevenLabsModel {
  id: string;
  name: string;
  description: string;
  features: {
    multilingual: boolean;
    speed: 'slow' | 'medium' | 'fast' | 'ultra-fast';
    quality: 'standard' | 'high' | 'premium';
    latency: 'high' | 'medium' | 'low' | 'ultra-low';
  };
  languages: string[];
  recommended?: boolean;
}

export const elevenLabsModels: ElevenLabsModel[] = [
  {
    id: 'eleven_multilingual_v2',
    name: 'Multilingual v2',
    description: 'Latest multilingual model with best quality for German',
    features: {
      multilingual: true,
      speed: 'medium',
      quality: 'premium',
      latency: 'medium',
    },
    languages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'hi', 'ar'],
    recommended: true,
  },
  {
    id: 'eleven_turbo_v2',
    name: 'Turbo v2',
    description: 'Fast multilingual model with good quality',
    features: {
      multilingual: true,
      speed: 'fast',
      quality: 'high',
      latency: 'low',
    },
    languages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'hi', 'ar'],
  },
  {
    id: 'eleven_flash_v2',
    name: 'Flash v2',
    description: 'Ultra-fast model with lowest latency',
    features: {
      multilingual: true,
      speed: 'ultra-fast',
      quality: 'standard',
      latency: 'ultra-low',
    },
    languages: ['en', 'de', 'fr', 'es', 'it', 'pt'],
  },
  {
    id: 'eleven_multilingual_v1',
    name: 'Multilingual v1',
    description: 'Previous generation multilingual model',
    features: {
      multilingual: true,
      speed: 'medium',
      quality: 'high',
      latency: 'medium',
    },
    languages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl'],
  },
  {
    id: 'eleven_monolingual_v1',
    name: 'Monolingual v1',
    description: 'English-only model with high quality',
    features: {
      multilingual: false,
      speed: 'medium',
      quality: 'premium',
      latency: 'medium',
    },
    languages: ['en'],
  },
];

// Helper function to get model by ID
export const getModelById = (id: string): ElevenLabsModel | undefined => {
  return elevenLabsModels.find((model) => model.id === id);
};

// Get recommended model for language
export const getRecommendedModel = (language: 'en' | 'de' = 'de'): string => {
  if (language === 'de') {
    // For German, prefer multilingual v2
    return 'eleven_multilingual_v2';
  }
  // For English, could use any model
  return 'eleven_multilingual_v2';
};

// Get models that support a specific language
export const getModelsForLanguage = (language: string): ElevenLabsModel[] => {
  return elevenLabsModels.filter((model) => model.languages.includes(language));
};
