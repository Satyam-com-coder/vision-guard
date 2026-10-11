/**
 * Web Audio API synthesizer for Vision-Guard
 * Generates an 880Hz warning tone (standard high-pitch security alert frequency)
 * without external audio assets.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.6;
  private isBeeping: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Synthesizes 880Hz audio warning beep via Web Audio API
   * Pattern: double-pulse high alert beep
   */
  public trigger880HzAlertBeep(): void {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isBeeping) return;
    this.isBeeping = true;

    try {
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.connect(ctx.destination);

      // Pulse 1: 880 Hz
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.connect(gainNode);

      // Envelope Pulse 1: 0ms to 140ms
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.02);
      gainNode.gain.setValueAtTime(this.volume, now + 0.12);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

      // Pulse 2: 880 Hz from 190ms to 330ms
      gainNode.gain.setValueAtTime(0, now + 0.19);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.9, now + 0.21);
      gainNode.gain.setValueAtTime(this.volume * 0.9, now + 0.31);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.35);

      osc1.start(now);
      osc1.stop(now + 0.36);

      setTimeout(() => {
        this.isBeeping = false;
      }, 400);
    } catch {
      this.isBeeping = false;
    }
  }

  /**
   * Test tone for user verification in the UI
   */
  public testTone(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // ignore
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
