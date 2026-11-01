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

    if (type === 'c418') {
      this.setupC418();
    } else if (type === 'rain') {
      this.setupRain();
    } else if (type === 'vinyl') {
      this.setupVinyl();
    } else if (type === 'campfire') {
      this.setupCampfire();
    } else if (type === 'ocean') {
      this.setupOcean();
    } else if (type === 'crickets') {
      this.setupCrickets();
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

  private setupC418() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Ambient delay / reverb effect unit for spacious Minecraft feel
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.42, ctx.currentTime);

    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.38, ctx.currentTime);

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFilter.connect(this.masterGain);

    // Warm background drone pad (dreamy Minecraft horizon)
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();

    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(146.83, ctx.currentTime); // D3

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(450, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.04, ctx.currentTime);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    droneOsc1.start();
    droneOsc2.start();

    // Helper: Play a warm felt acoustic piano note
    const playPianoNote = (freq: number, delaySec: number, velocity: number = 0.25) => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const noteTime = ctx.currentTime + delaySec;

      // Primary sine tone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);

      // Subtle warm triangle overtone
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, noteTime);

      // Soft tone lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, noteTime);
      filter.frequency.exponentialRampToValueAtTime(600, noteTime + 2.5);

      const noteGain = ctx.createGain();
      // Gentle soft hammer attack
      noteGain.gain.setValueAtTime(0.0001, noteTime);
      noteGain.gain.linearRampToValueAtTime(velocity, noteTime + 0.02);
      // Long nostalgic decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);

      // Direct dry signal
      noteGain.connect(this.masterGain);
      // Wet delay signal
      noteGain.connect(delay);

      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + 3.6);
      osc2.stop(noteTime + 3.6);
    };

    // Melodic phrases inspired by C418's "Sweden" and "Wet Hands"
    const phrases = [
      // Phrase 1: Iconic Sweden opening progression (D Maj)
      [
        { freq: 146.83, delay: 0.0, vel: 0.28 },  // D3 bass
        { freq: 220.00, delay: 0.05, vel: 0.22 }, // A3
        { freq: 369.99, delay: 0.8, vel: 0.26 },  // F#4
        { freq: 440.00, delay: 1.6, vel: 0.24 },  // A4
        { freq: 587.33, delay: 2.5, vel: 0.30 },  // D5
        { freq: 554.37, delay: 3.8, vel: 0.22 },  // C#5
        { freq: 493.88, delay: 4.8, vel: 0.25 },  // B4
        { freq: 440.00, delay: 5.9, vel: 0.22 },  // A4
        { freq: 369.99, delay: 7.2, vel: 0.24 },  // F#4
      ],
      // Phrase 2: G Maj7 Cadence (Wet Hands feel)
      [
        { freq: 98.00,  delay: 0.0, vel: 0.30 },  // G2 bass
        { freq: 146.83, delay: 0.06, vel: 0.22 }, // D3
        { freq: 493.88, delay: 0.9, vel: 0.26 },  // B4
        { freq: 587.33, delay: 2.0, vel: 0.28 },  // D5
        { freq: 739.99, delay: 3.2, vel: 0.24 },  // F#5
        { freq: 659.25, delay: 4.4, vel: 0.22 },  // E5
        { freq: 587.33, delay: 5.6, vel: 0.25 },  // D5
        { freq: 493.88, delay: 7.0, vel: 0.22 },  // B4
      ],
      // Phrase 3: B Minor nostalgic lullaby
      [
        { freq: 123.47, delay: 0.0, vel: 0.28 },  // B2 bass
        { freq: 185.00, delay: 0.05, vel: 0.22 }, // F#3
        { freq: 587.33, delay: 0.9, vel: 0.27 },  // D5
        { freq: 554.37, delay: 2.1, vel: 0.23 },  // C#5
        { freq: 440.00, delay: 3.3, vel: 0.25 },  // A4
        { freq: 369.99, delay: 4.5, vel: 0.22 },  // F#4
        { freq: 329.63, delay: 5.7, vel: 0.24 },  // E4
        { freq: 293.66, delay: 7.1, vel: 0.26 },  // D4
      ],
      // Phrase 4: A Sus Resolution
      [
        { freq: 110.00, delay: 0.0, vel: 0.28 },  // A2 bass
        { freq: 164.81, delay: 0.06, vel: 0.22 }, // E3
        { freq: 369.99, delay: 0.9, vel: 0.24 },  // F#4
        { freq: 329.63, delay: 2.0, vel: 0.22 },  // E4
        { freq: 293.66, delay: 3.4, vel: 0.26 },  // D4
        { freq: 220.00, delay: 4.8, vel: 0.22 },  // A3
        { freq: 293.66, delay: 6.2, vel: 0.28 },  // D4
      ],
    ];

    let phraseIdx = 0;
    let sequenceTimer: number;

    const playNextPhrase = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const currentNotes = phrases[phraseIdx];
      phraseIdx = (phraseIdx + 1) % phrases.length;

      currentNotes.forEach(({ freq, delay, vel }) => {
        playPianoNote(freq, delay, vel);
      });

      // Pause of ~9.5 seconds between phrases for that authentic spacious Minecraft contemplation
      sequenceTimer = window.setTimeout(playNextPhrase, 9500);
    };

    playNextPhrase();

    this.stopFns.push(() => {
      clearTimeout(sequenceTimer);
      droneOsc1.stop();
      droneOsc2.stop();
      droneOsc1.disconnect();
      droneOsc2.disconnect();
      delay.disconnect();
      delayFilter.disconnect();
      delayFeedback.disconnect();
    });
  }

  private setupCampfire() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Low rumble of burning wood embers
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.24, ctx.currentTime);

    noiseSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    noiseSource.start();

    // Wood pop and crackle generator
    let crackleTimer: number;
    const scheduleCrackle = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // Realistic sharp wood pop
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = 500 + Math.random() * 2200;
      osc.type = Math.random() > 0.4 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(3.0, now);

      const popVol = 0.08 + Math.random() * 0.16;
      popGain.gain.setValueAtTime(popVol, now);
      popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(popGain);
      popGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);

      const nextMs = 60 + Math.random() * 320;
      crackleTimer = window.setTimeout(scheduleCrackle, nextMs);
    };

    scheduleCrackle();

    this.stopFns.push(() => {
      clearTimeout(crackleTimer);
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }

  private setupOcean() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const noiseBuffer = this.createNoiseBuffer(6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Dual filters for water texture
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.15, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);
    noiseSource.start();

    // LFO to create slow 8-second wave rise and retreat
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8.3 sec cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.22, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);
    lfo.start();

    this.stopFns.push(() => {
      lfo.stop();
      lfo.disconnect();
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }

  private setupCrickets() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Soft night breeze
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(900, ctx.currentTime);
    breezeFilter.Q.setValueAtTime(0.5, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.06, ctx.currentTime);

    noiseSource.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(this.masterGain);
    noiseSource.start();

    // Crickets chirp generator
    let chirpTimer: number;
    const playChirpGroup = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // Group of 3 quick chirps
      for (let i = 0; i < 3; i++) {
        const chirpTime = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4700 + Math.random() * 300, chirpTime);

        gain.gain.setValueAtTime(0.05, chirpTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(chirpTime);
        osc.stop(chirpTime + 0.06);
      }

      const nextDelay = 1200 + Math.random() * 1800;
      chirpTimer = window.setTimeout(playChirpGroup, nextDelay);
    };

    playChirpGroup();

    this.stopFns.push(() => {
      clearTimeout(chirpTimer);
      noiseSource.stop();
      noiseSource.disconnect();
    });
  }
}

export const ambientPlayer = new AmbientGenerator();

