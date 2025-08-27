import { getElevenLabsApiKey } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ElevenLabsModel {
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

// Default models as fallback if API fails
const defaultModels: ElevenLabsModel[] = [
  {
    model_id: 'eleven_multilingual_v2',
    name: 'Eleven Multilingual v2',
    can_be_finetuned: false,
    can_do_text_to_speech: true,
    can_do_voice_conversion: false,
    can_use_style: true,
    can_use_speaker_boost: true,
    serves_pro_voices: false,
    language_codes: ['en', 'ja', 'zh', 'de', 'hi', 'fr', 'ko', 'pt', 'it', 'es', 'id', 'nl', 'tr', 'pl', 'sv', 'bg', 'ro', 'ar', 'cs', 'el', 'fi', 'hr', 'ms', 'sk', 'da', 'ta', 'uk'],
    description: 'Multilingual model optimized for diverse languages',
    max_characters_request_free_tier: 333,
    max_characters_request_subscribed_tier: 5000,
  },
  {
    model_id: 'eleven_multilingual_v1',
    name: 'Eleven Multilingual v1',
    can_be_finetuned: false,
    can_do_text_to_speech: true,
    can_do_voice_conversion: false,
    can_use_style: false,
    can_use_speaker_boost: true,
    serves_pro_voices: false,
    language_codes: ['en', 'de', 'pl', 'es', 'fr', 'it', 'pt', 'hi'],
    description: 'Legacy multilingual model',
    max_characters_request_free_tier: 333,
    max_characters_request_subscribed_tier: 5000,
  },
  {
    model_id: 'eleven_monolingual_v1',
    name: 'Eleven English v1',
    can_be_finetuned: true,
    can_do_text_to_speech: true,
    can_do_voice_conversion: false,
    can_use_style: false,
    can_use_speaker_boost: true,
    serves_pro_voices: false,
    language_codes: ['en'],
    description: 'English-only model with high quality',
    max_characters_request_free_tier: 333,
    max_characters_request_subscribed_tier: 5000,
  },
  {
    model_id: 'eleven_turbo_v2',
    name: 'Eleven Turbo v2',
    can_be_finetuned: false,
    can_do_text_to_speech: true,
    can_do_voice_conversion: false,
    can_use_style: false,
    can_use_speaker_boost: true,
    serves_pro_voices: false,
    language_codes: ['en'],
    description: 'Fast English model for low-latency applications',
    max_characters_request_free_tier: 333,
    max_characters_request_subscribed_tier: 5000,
  },
  {
    model_id: 'eleven_turbo_v2_5',
    name: 'Eleven Turbo v2.5',
    can_be_finetuned: false,
    can_do_text_to_speech: true,
    can_do_voice_conversion: false,
    can_use_style: true,
    can_use_speaker_boost: true,
    serves_pro_voices: false,
    language_codes: ['en'],
    description: 'Enhanced fast English model with style control',
    max_characters_request_free_tier: 333,
    max_characters_request_subscribed_tier: 5000,
  }
];

export const GET = async () => {
  try {
    const elevenLabsApiKey = getElevenLabsApiKey();

    if (!elevenLabsApiKey) {
      // Return default models if no API key
      return Response.json({ 
        models: defaultModels,
        source: 'default',
        message: 'ElevenLabs API key not configured, using default models'
      });
    }

    // Fetch models from ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('ElevenLabs models API error:', response.status);
      // Return default models if API fails
      return Response.json({ 
        models: defaultModels,
        source: 'default',
        message: 'Failed to fetch models from ElevenLabs API, using defaults'
      });
    }

    const data = await response.json();
    
    // Filter only TTS-capable models
    const ttsModels = data.filter((model: ElevenLabsModel) => 
      model.can_do_text_to_speech
    );

    return Response.json({ 
      models: ttsModels,
      source: 'api',
      message: 'Models loaded from ElevenLabs API'
    });

  } catch (error) {
    console.error('TTS models API error:', error);
    
    // Return default models if everything fails
    return Response.json({ 
      models: defaultModels,
      source: 'default',
      message: 'Error fetching models, using defaults'
    });
  }
};