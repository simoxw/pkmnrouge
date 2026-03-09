import { useCallback, useRef } from 'react';

interface AudioConfig {
  volume?: number;
  preload?: boolean;
}

const AUDIO_URLS = {
  click: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3105019b39.mp3?filename=select-sound-121244.mp3',
  hit: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_96e0b5eba7.mp3?filename=zap-hit-121270.mp3',
  victory: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_c8c5e2e8c0.mp3?filename=success-sound-glockenspiel-131881.mp3',
};

export function useSoundEffects(enabled: boolean = true) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((soundKey: keyof typeof AUDIO_URLS, config?: AudioConfig) => {
    if (!enabled) return;

    try {
      const url = AUDIO_URLS[soundKey];
      if (!url) {
        console.warn(`Sound "${soundKey}" not configured`);
        return;
      }

      let audio = audioRefs.current[soundKey];
      
      if (!audio) {
        audio = new Audio(url);
        audio.volume = config?.volume ?? 0.4;
        audioRefs.current[soundKey] = audio;
      } else {
        audio.currentTime = 0;
        audio.volume = config?.volume ?? 0.4;
      }

      audio.play().catch(e => console.log(`Audio play failed for "${soundKey}":`, e));
    } catch (err) {
      console.error(`Failed to play sound "${soundKey}":`, err);
    }
  }, [enabled]);

  return { playSound };
}
