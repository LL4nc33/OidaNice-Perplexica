import { getElevenLabsApiKey } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TTSRequestBody {
  text: string;
  voice?: string;
  model?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: TTSRequestBody = await req.json();

    if (!body.text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const elevenLabsApiKey = getElevenLabsApiKey();

    if (!elevenLabsApiKey) {
      return Response.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 400 },
      );
    }

    // Use provided voice or default to Adam
    const voiceId = body.voice || 'pNInz6obpgDQGcFmaJgB'; // Adam voice (default)

    // Use provided model or default to multilingual v2
    const modelId = body.model || 'eleven_multilingual_v2';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: body.text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return Response.json(
        { error: 'Failed to generate speech' },
        { status: response.status },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
