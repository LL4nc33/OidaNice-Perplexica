import { getElevenLabsApiKey } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: {
    accent?: string;
    gender?: string;
    age?: string;
    use_case?: string;
    language?: string;
  };
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability?: number;
    similarity_boost?: number;
  };
}

export const GET = async () => {
  try {
    const elevenLabsApiKey = getElevenLabsApiKey();

    if (!elevenLabsApiKey) {
      // Return a default set of well-known voice IDs if no API key is configured
      return Response.json({
        voices: [
          {
            voice_id: 'pNInz6obpgDQGcFmaJgB',
            name: 'Adam',
            category: 'premade',
            description: 'Deep male voice',
            labels: {
              gender: 'male',
              accent: 'american',
              use_case: 'narration',
            },
          },
          {
            voice_id: 'EXAVITQu4vr4xnSDxMaL',
            name: 'Bella',
            category: 'premade',
            description: 'Soft female voice',
            labels: {
              gender: 'female',
              accent: 'american',
              use_case: 'conversational',
            },
          },
          {
            voice_id: '21m00Tcm4TlvDq8ikWAM',
            name: 'Rachel',
            category: 'premade',
            description: 'Calm female voice',
            labels: {
              gender: 'female',
              accent: 'american',
              use_case: 'narration',
            },
          },
        ],
      });
    }

    // Fetch voices from ElevenLabs API (using v2 endpoint)
    const response = await fetch(
      'https://api.elevenlabs.io/v2/voices?page_size=100',
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
        // Cache for 1 hour to reduce API calls
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error('Failed to fetch ElevenLabs voices:', response.status);
      // Return default voices on error
      return Response.json({
        voices: [
          {
            voice_id: 'pNInz6obpgDQGcFmaJgB',
            name: 'Adam',
            category: 'premade',
            description: 'Deep male voice',
            labels: { gender: 'male', accent: 'american' },
          },
        ],
      });
    }

    const data = await response.json();

    // V2 API returns voices directly in the 'voices' array
    const voices = data.voices || [];

    // Sort voices by category and name for better UX
    const sortedVoices = voices.sort(
      (a: ElevenLabsVoice, b: ElevenLabsVoice) => {
        // Premade voices first, then professional/cloned
        const categoryOrder = [
          'premade',
          'professional',
          'cloned',
          'generated',
        ];
        const aCategoryIndex =
          categoryOrder.indexOf(a.category) !== -1
            ? categoryOrder.indexOf(a.category)
            : 999;
        const bCategoryIndex =
          categoryOrder.indexOf(b.category) !== -1
            ? categoryOrder.indexOf(b.category)
            : 999;

        if (aCategoryIndex !== bCategoryIndex) {
          return aCategoryIndex - bCategoryIndex;
        }

        // Then sort by name
        return a.name.localeCompare(b.name);
      },
    );

    return Response.json({ voices: sortedVoices });
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);

    // Return minimal default voices on error
    return Response.json({
      voices: [
        {
          voice_id: 'pNInz6obpgDQGcFmaJgB',
          name: 'Adam',
          category: 'premade',
          description: 'Default voice',
          labels: { gender: 'male' },
        },
      ],
    });
  }
};
