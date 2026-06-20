/**
 * Lightweight sound service. Real audio assets do not exist yet, so this
 * synthesises short tones with the Web Audio API as placeholders. The public
 * API is stable, so swapping in real files later only touches this file.
 */

export type SoundEvent =
  | 'button'
  | 'swap'
  | 'match'
  | 'combo'
  | 'yarn'
  | 'boss'
  | 'victory'
  | 'defeat';

interface ToneSpec {
  freq: number;
  duration: number;
  type: OscillatorType;
}

const TONES: Record<SoundEvent, ToneSpec> = {
  button: { freq: 520, duration: 0.08, type: 'sine' },
  swap: { freq: 360, duration: 0.07, type: 'triangle' },
  match: { freq: 640, duration: 0.12, type: 'sine' },
  combo: { freq: 820, duration: 0.18, type: 'sawtooth' },
  yarn: { freq: 300, duration: 0.22, type: 'triangle' },
  boss: { freq: 180, duration: 0.4, type: 'sawtooth' },
  victory: { freq: 720, duration: 0.5, type: 'sine' },
  defeat: { freq: 200, duration: 0.5, type: 'sine' },
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  play(event: SoundEvent): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const spec = TONES[event];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = spec.type;
      osc.frequency.value = spec.freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + spec.duration,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + spec.duration);
    } catch {
      // Audio is best-effort; ignore failures (e.g. autoplay restrictions).
    }
  }
}

export const soundManager = new SoundManager();
