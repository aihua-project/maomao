import { useRef, useEffect, useCallback } from 'react';

class BGMPlayer {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private intervalId: number | null = null;

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.1;
    }
    return this.audioContext;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 0.1;
    }
  }

  playMenuBGM() {
    if (this.isPlaying) return;
    const ctx = this.init();
    if (!ctx || !this.gainNode) return;

    this.isPlaying = true;
    this.stopAllOscillators();

    const melody = [
      { note: 262, duration: 0.25 },
      { note: 294, duration: 0.25 },
      { note: 330, duration: 0.25 },
      { note: 349, duration: 0.25 },
      { note: 392, duration: 0.5 },
      { note: 349, duration: 0.25 },
      { note: 330, duration: 0.25 },
      { note: 294, duration: 0.5 },
      { note: 262, duration: 0.25 },
      { note: 330, duration: 0.25 },
      { note: 392, duration: 0.5 },
      { note: 330, duration: 0.25 },
      { note: 294, duration: 0.25 },
      { note: 262, duration: 0.5 },
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying || !ctx || !this.gainNode) return;

      const { note, duration } = melody[noteIndex % melody.length];
      
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = note;
      
      noteGain.gain.setValueAtTime(0.3, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.9);
      
      osc.connect(noteGain);
      noteGain.connect(this.gainNode);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      this.oscillators.push(osc);
      
      noteIndex++;
    };

    playNote();
    this.intervalId = window.setInterval(playNote, 500);
  }

  playGameBGM() {
    if (this.isPlaying) return;
    const ctx = this.init();
    if (!ctx || !this.gainNode) return;

    this.isPlaying = true;
    this.stopAllOscillators();

    const melody = [
      { note: 196, duration: 0.2 },
      { note: 220, duration: 0.2 },
      { note: 247, duration: 0.2 },
      { note: 262, duration: 0.4 },
      { note: 294, duration: 0.2 },
      { note: 330, duration: 0.2 },
      { note: 349, duration: 0.2 },
      { note: 392, duration: 0.4 },
      { note: 349, duration: 0.2 },
      { note: 330, duration: 0.2 },
      { note: 294, duration: 0.2 },
      { note: 262, duration: 0.4 },
      { note: 247, duration: 0.2 },
      { note: 220, duration: 0.2 },
      { note: 196, duration: 0.4 },
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying || !ctx || !this.gainNode) return;

      const { note, duration } = melody[noteIndex % melody.length];
      
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = note;
      
      noteGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.8);
      
      osc.connect(noteGain);
      noteGain.connect(this.gainNode);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      
      this.oscillators.push(osc);
      
      noteIndex++;
    };

    playNote();
    this.intervalId = window.setInterval(playNote, 400);
  }

  stop() {
    this.isPlaying = false;
    this.stopAllOscillators();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private stopAllOscillators() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    this.oscillators = [];
  }
}

const bgmPlayer = new BGMPlayer();

export function useBGM() {
  const playerRef = useRef(bgmPlayer);

  useEffect(() => {
    playerRef.current.init();
  }, []);

  const playMenuBGM = useCallback(() => {
    playerRef.current.playMenuBGM();
  }, []);

  const playGameBGM = useCallback(() => {
    playerRef.current.playGameBGM();
  }, []);

  const stop = useCallback(() => {
    playerRef.current.stop();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    playerRef.current.setMuted(muted);
  }, []);

  return { playMenuBGM, playGameBGM, stop, setMuted };
}

export { bgmPlayer };
