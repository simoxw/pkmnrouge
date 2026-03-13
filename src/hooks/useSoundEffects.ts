import { useCallback, useRef } from 'react';

const AUDIO_URLS = {
  money: `${import.meta.env.BASE_URL}audio/pokemon_money.mp3`,
  hitSuper: `${import.meta.env.BASE_URL}audio/hit-super-effective.mp3`,
  hitWeak: `${import.meta.env.BASE_URL}audio/hit-weak-not-very-effective.mp3`,
  hit: null,
  victory: null,
  click: null,
};

export function useSoundEffects(enabled: boolean = true) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((soundKey: keyof typeof AUDIO_URLS, volume = 0.4) => {
    if (!enabled) return;
    const url = AUDIO_URLS[soundKey];
    if (!url) return;

    try {
      let audio = audioRefs.current[soundKey];
      if (!audio) {
        audio = new Audio(url);
        audio.volume = volume;
        audioRefs.current[soundKey] = audio;
      } else {
        audio.currentTime = 0;
        audio.volume = volume;
      }
      audio.play().catch(e => console.log(`Audio play failed for "${soundKey}":`, e));
    } catch (err) {
      console.error(`Failed to play sound "${soundKey}":`, err);
    }
  }, [enabled]);

  return { playSound };
}