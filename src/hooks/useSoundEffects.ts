import { useCallback, useEffect, useRef, useState } from 'react';

const SOUND_ENABLED_KEY = 'anime_idle_sound_enabled';

export type SoundEffectKey =
  | 'action'
  | 'purchase'
  | 'error'
  | 'story'
  | 'unlock'
  | 'ending'
  | 'fever'
  | 'toggle'
  | 'prestige';

type PlaySoundOptions = {
  force?: boolean;
};

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const playTone = (
  context: AudioContext,
  startTime: number,
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  endFrequency = frequency
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(0.001, frequency), startTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(0.001, endFrequency), startTime + duration);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playEffect = (context: AudioContext, effect: SoundEffectKey) => {
  const now = context.currentTime + 0.01;

  switch (effect) {
    case 'action':
      playTone(context, now, 420, 0.08, 'triangle', 0.035, 580);
      break;
    case 'purchase':
      playTone(context, now, 520, 0.08, 'triangle', 0.04, 680);
      playTone(context, now + 0.05, 680, 0.11, 'triangle', 0.035, 860);
      break;
    case 'error':
      playTone(context, now, 280, 0.08, 'sawtooth', 0.025, 220);
      break;
    case 'story':
      playTone(context, now, 440, 0.12, 'sine', 0.03, 660);
      playTone(context, now + 0.08, 660, 0.16, 'sine', 0.025, 880);
      break;
    case 'unlock':
      playTone(context, now, 523.25, 0.12, 'triangle', 0.04, 659.25);
      playTone(context, now + 0.07, 659.25, 0.14, 'triangle', 0.035, 783.99);
      break;
    case 'ending':
      playTone(context, now, 659.25, 0.16, 'sine', 0.035, 783.99);
      playTone(context, now + 0.09, 783.99, 0.18, 'sine', 0.03, 1046.5);
      playTone(context, now + 0.18, 987.77, 0.24, 'triangle', 0.025, 1318.5);
      break;
    case 'fever':
      playTone(context, now, 330, 0.08, 'square', 0.022, 660);
      playTone(context, now + 0.05, 660, 0.09, 'square', 0.02, 990);
      playTone(context, now + 0.1, 990, 0.12, 'triangle', 0.025, 1320);
      break;
    case 'toggle':
      playTone(context, now, 720, 0.08, 'sine', 0.025, 900);
      break;
    case 'prestige':
      playTone(context, now, 392, 0.14, 'triangle', 0.035, 523.25);
      playTone(context, now + 0.09, 523.25, 0.18, 'triangle', 0.03, 783.99);
      break;
  }
};

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const savedValue = window.localStorage.getItem(SOUND_ENABLED_KEY);
    return savedValue === null ? true : savedValue === 'true';
  });
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext || (window as BrowserWindow).webkitAudioContext;

      if (!AudioContextConstructor) {
        return null;
      }

      audioContextRef.current = new AudioContextConstructor();
    }

    return audioContextRef.current;
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    }
  }, []);

  const playSound = useCallback(
    (effect: SoundEffectKey, options?: PlaySoundOptions) => {
      if (!soundEnabled && !options?.force) {
        return;
      }

      const audioContext = getAudioContext();
      if (!audioContext) {
        return;
      }

      void audioContext.resume().then(() => {
        playEffect(audioContext, effect);
      }).catch(() => undefined);
    },
    [getAudioContext, soundEnabled]
  );

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    playSound,
  };
};
