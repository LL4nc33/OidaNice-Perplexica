import { useState, useEffect } from 'react';

export interface TTSModel {
  model_id: string;
  name: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  serves_pro_voices: boolean;
  language_codes: string[];
  description?: string;
  requires_alpha_access?: boolean;
  max_characters_request_free_tier?: number;
  max_characters_request_subscribed_tier?: number;
}

interface TTSModelsResponse {
  models: TTSModel[];
  source: 'api' | 'default';
  message: string;
}

interface UseTTSModelsReturn {
  models: TTSModel[];
  loading: boolean;
  error: string | null;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  refreshModels: () => Promise<void>;
}

export const useTTSModels = (): UseTTSModelsReturn => {
  const [models, setModels] = useState<TTSModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get selected model from localStorage
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('elevenLabsModel') || 'eleven_multilingual_v2';
    }
    return 'eleven_multilingual_v2';
  });

  const setSelectedModel = (modelId: string) => {
    setSelectedModelState(modelId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevenLabsModel', modelId);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts/models');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data: TTSModelsResponse = await response.json();
      setModels(data.models);

      // If selected model is not available in the fetched models, reset to first available
      if (!data.models.find(model => model.model_id === selectedModel)) {
        if (data.models.length > 0) {
          setSelectedModel(data.models[0].model_id);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch TTS models:', error);
      
      // Fallback to default model if everything fails
      setModels([{
        model_id: 'eleven_multilingual_v2',
        name: 'Eleven Multilingual v2 (Default)',
        can_be_finetuned: false,
        can_do_text_to_speech: true,
        can_do_voice_conversion: false,
        can_use_style: true,
        can_use_speaker_boost: true,
        serves_pro_voices: false,
        language_codes: ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl'],
        description: 'Fallback multilingual model',
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []); // Only run on mount

  return {
    models,
    loading,
    error,
    selectedModel,
    setSelectedModel,
    refreshModels: fetchModels,
  };
};