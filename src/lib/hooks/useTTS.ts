import { useState, useRef, useCallback } from 'react';

export type TTSProvider = 'browser' | 'elevenlabs';

interface UseTTSOptions {
  provider?: TTSProvider;
}

interface UseTTSReturn {
  isPlaying: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  error: string | null;
}

export const useTTS = (options: UseTTSOptions = {}): UseTTSReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const provider = options.provider || 'browser';

  // Browser TTS refs
  const speechSynthesis =
    typeof window !== 'undefined' ? window.speechSynthesis : null;
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // ElevenLabs TTS refs
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const isSupported = provider === 'browser' ? !!speechSynthesis : true; // ElevenLabs works if API key is configured

  const stopBrowserTTS = useCallback(() => {
    if (speechSynthesis && currentUtterance.current) {
      speechSynthesis.cancel();
      currentUtterance.current = null;
    }
    setIsPlaying(false);
  }, [speechSynthesis]);

  const stopElevenLabsTTS = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    setError(null);
    if (provider === 'browser') {
      stopBrowserTTS();
    } else {
      stopElevenLabsTTS();
    }
  }, [provider, stopBrowserTTS, stopElevenLabsTTS]);

  const speakWithBrowser = useCallback(
    async (text: string) => {
      if (!speechSynthesis) {
        throw new Error('Browser TTS not supported');
      }

      // Stop any current speech
      stopBrowserTTS();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance.current = utterance;

      // Try to use German voice if available
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(
        (voice) =>
          voice.lang.startsWith('de') ||
          voice.name.toLowerCase().includes('german'),
      );

      if (germanVoice) {
        utterance.voice = germanVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      return new Promise<void>((resolve, reject) => {
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
          setIsPlaying(false);
          currentUtterance.current = null;
          resolve();
        };
        utterance.onerror = (event) => {
          setIsPlaying(false);
          currentUtterance.current = null;
          reject(new Error(`Browser TTS error: ${event.error}`));
        };

        speechSynthesis.speak(utterance);
      });
    },
    [speechSynthesis, stopBrowserTTS],
  );

  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      // Stop any current audio
      stopElevenLabsTTS();

      // Get selected voice and model from localStorage
      const selectedVoice =
        typeof window !== 'undefined'
          ? localStorage.getItem('elevenLabsVoice') || 'pNInz6obpgDQGcFmaJgB'
          : 'pNInz6obpgDQGcFmaJgB';

      const selectedModel =
        typeof window !== 'undefined'
          ? localStorage.getItem('elevenLabsModel') || 'eleven_multilingual_v2'
          : 'eleven_multilingual_v2';

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            model: selectedModel,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `ElevenLabs API error: ${response.status}`,
          );
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudio.current = audio;

        return new Promise<void>((resolve, reject) => {
          audio.onloadstart = () => setIsPlaying(true);
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            currentAudio.current = null;
            resolve();
          };
          audio.onerror = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            currentAudio.current = null;
            reject(new Error('Audio playback failed'));
          };

          audio.play().catch(reject);
        });
      } catch (error) {
        throw new Error(
          `ElevenLabs TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [stopElevenLabsTTS],
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setError(null);

      try {
        if (provider === 'browser') {
          await speakWithBrowser(text);
        } else {
          await speakWithElevenLabs(text);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'TTS failed';
        setError(errorMessage);
        console.error('TTS Error:', error);
        throw error;
      }
    },
    [provider, speakWithBrowser, speakWithElevenLabs],
  );

  return {
    isPlaying,
    speak,
    stop,
    isSupported,
    error,
  };
};
