import type { AlarmSound, AmbientSound } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ==================== ALARM SOUNDS ====================

export function playAlarm(type: AlarmSound, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'retro8bit': {
        // 8-bit Game Boy / Arcade victory sound
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          noteGain.gain.setValueAtTime(0.2, now + i * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.2);
        });

        // Extra triumphant trill at the end
        setTimeout(() => {
          const activeCtx = audioCtx;
          if (!activeCtx) return;
          const endNow = activeCtx.currentTime;
          [1046.50, 1318.51, 1567.98].forEach((f, idx) => {
            const osc = activeCtx.createOscillator();
            const g = activeCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(f, endNow + idx * 0.07);
            g.gain.setValueAtTime(0.25, endNow + idx * 0.07);
            g.gain.exponentialRampToValueAtTime(0.001, endNow + idx * 0.07 + 0.4);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(endNow + idx * 0.07);
            osc.stop(endNow + idx * 0.07 + 0.45);
          });
        }, 580);
        break;
      }

      case 'lofiBell': {
        // Meditative Tibetan / Zen chime with warm harmonics
        const baseFreq = 528; // Solfeggio Love frequency
        const harmonics = [1, 2.76, 5.4, 8.93];
        harmonics.forEach((harmonic, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * harmonic, now);

          const decay = 2.5 / (idx + 1);
          gain.gain.setValueAtTime(0.3 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + decay);
        });
        break;
      }

      case 'digitalWatch': {
        // Classic 90s digital watch dual-beep
        const beeps = [0, 0.14];
        beeps.forEach(delay => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2048, now + delay);

          gain.gain.setValueAtTime(0.2, now + delay);
          gain.gain.setValueAtTime(0, now + delay + 0.08);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.09);
        });
        break;
      }

      case 'fanfare': {
        // Uplifting warm brass synth fanfare chord progression
        const chordProgressions = [
          { time: 0, notes: [261.63, 329.63, 392.00] }, // C Maj
          { time: 0.25, notes: [293.66, 349.23, 440.00] }, // D min
          { time: 0.5, notes: [392.00, 493.88, 587.33] }, // G Maj
          { time: 0.8, notes: [523.25, 659.25, 783.99, 1046.50] }, // C Maj Octave
        ];

        chordProgressions.forEach(({ time, notes }) => {
          notes.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + time);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now + time);

            const duration = time >= 0.8 ? 1.0 : 0.22;
            gain.gain.setValueAtTime(0.12, now + time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            osc.start(now + time);
            osc.stop(now + time + duration);
          });
        });
        break;
      }

      case 'marimba': {
        // Organic marimba cheerful scale
        const melody = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0.28, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.25);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.3);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
}

// Subtle tick sound for the timer
export function playTick(volume: number = 0.15) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Ignore autoplay restriction for ticks
  }
}

// ==================== PROCEDURAL AMBIENT GENERATOR ====================

class AmbientGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentType: AmbientSound = 'none';
  private stopFns: (() => void)[] = [];

  public start(type: AmbientSound, volume: number = 0.5) {
    this.stop();
    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    this.ctx = getAudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.isPlaying = true;
    this.currentType = type;

    if (type === 'rain') {
      this.setupRain();
    } else if (type === 'vinyl') {
      this.setupVinyl();
    } else if (type === 'lofiChords') {
      this.setupLofiChords();
    } else if (type === 'whiteNoise') {
      this.setupWhiteNoise();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    this.stopFns.forEach(fn => {
      try { fn(); } catch (e) { /* ignore */ }
    });
    this.stopFns = [];
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch (e) { /* ignore */ }
      this.masterGain = null;
    }
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType
    };
  }

  private createNoiseBuffer(durationSeconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private setupRain() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to sound like soft rainfall hitting a window
    const filterLow = this.ctx.createBiquadFilter();
    filterLow.type = 'lowpass';
    filterLow.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const filterHigh = this.ctx.createBiquadFilter();
    filterHigh.type = 'highpass';
    filterHigh.frequency.setValueAtTime(200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSource.connect(filterHigh);
    filterHigh.connect(filterLow);
    filterLow.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
    this.stopFns.push(() => {
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }

  private setupVinyl() {
    if (!this.ctx || !this.masterGain) return;
    // Soft brown noise bed
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const bedGain = this.ctx.createGain();
    bedGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(bedGain);
    bedGain.connect(this.masterGain);
    noiseSource.start();

    // Random pops and crackles simulating vinyl needle
    let popTimer: number;
    const schedulePop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'square';
      popOsc.frequency.setValueAtTime(80 + Math.random() * 800, now);

      const popVol = 0.05 + Math.random() * 0.12;
      popGain.gain.setValueAtTime(popVol, now);
      popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);

      popOsc.start(now);
      popOsc.stop(now + 0.03);

      const nextPopMs = 80 + Math.random() * 450;
      popTimer = window.setTimeout(schedulePop, nextPopMs);
    };

    schedulePop();

    this.stopFns.push(() => {
      clearTimeout(popTimer);
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }

  private setupWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();
    this.stopFns.push(() => {
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }

  private setupLofiChords() {
    if (!this.ctx || !this.masterGain) return;
    // Dreamy 7th chord progression: Dm9 -> G13 -> Cmaj9 -> A7b13
    const chords = [
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9
      [196.00, 246.94, 293.66, 329.63, 440.00], // G13
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9
      [220.00, 277.18, 329.63, 392.00, 415.30], // A7b13
    ];

    let chordIdx = 0;
    let chordTimer: number;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const currentNotes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentNotes.forEach(freq => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Lowpass to give warm lofi tape saturation feel
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(500, now + 3.8);

        // Slow soft swell and long release
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.4);
      });

      chordTimer = window.setTimeout(playChord, 4000);
    };

    playChord();

    this.stopFns.push(() => {
      clearTimeout(chordTimer);
    });
  }
}

export const ambientPlayer = new AmbientGenerator();
