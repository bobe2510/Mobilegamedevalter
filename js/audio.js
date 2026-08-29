// 極簡 8-bit 音效 / 背景音樂（WebAudio 方波，不需要音檔）
const NOTES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(name) {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) return 0;
  const n = NOTES[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicOn = true;
    this._musicTimer = null;
    this._step = 0;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(f, dur, type = 'square', vol = 0.5, slide = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }

  noise(dur = 0.12, vol = 0.35) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g); g.connect(this.master);
    src.start();
  }

  jump()    { this.tone(320, 0.14, 'square', 0.35, 320); }
  swing()   { this.noise(0.07, 0.18); this.tone(700, 0.06, 'square', 0.16, -300); }
  hit()     { this.noise(0.10, 0.30); this.tone(180, 0.10, 'square', 0.30, -110); }
  hurt()    { this.tone(220, 0.22, 'sawtooth', 0.35, -150); }
  coin()    { this.tone(880, 0.07, 'square', 0.30); setTimeout(() => this.tone(1320, 0.10, 'square', 0.28), 70); }
  heal()    { this.tone(660, 0.09, 'triangle', 0.32); setTimeout(() => this.tone(990, 0.14, 'triangle', 0.30), 90); }
  special() { this.tone(500, 0.30, 'sawtooth', 0.30, 700); this.noise(0.30, 0.25); }
  die()     { this.tone(400, 0.5, 'square', 0.35, -330); }
  clear()   { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => setTimeout(() => this.tone(freq(n), 0.20, 'square', 0.30), i * 110)); }
  boss()    { this.tone(90, 0.7, 'sawtooth', 0.40, 40); this.noise(0.5, 0.30); }
  // 倒地：下行的可憐音階
  faint()   { ['G4', 'F4', 'D4', 'A3'].forEach((n, i) => setTimeout(() => this.tone(freq(n), 0.26, 'triangle', 0.32), i * 150)); }
  // 熊貓車喇叭：噗噗
  honk()    { this.tone(392, 0.13, 'square', 0.30); setTimeout(() => this.tone(294, 0.20, 'square', 0.30), 150); }
  // 哭哭
  sob()     { this.tone(520 + Math.random() * 80, 0.10, 'triangle', 0.14, -120); }
  blip()    { this.tone(760, 0.03, 'square', 0.07); }   // 對話逐字聲

  // 簡短的循環主旋律
  startMusic() {
    if (this._musicTimer || !this.musicOn) return;
    const lead = ['E5', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'B4', 'C5', 'D5',
                  'E5', 'C5', 'A4', 'A4', 'D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'C5', 'E5', 'D5', 'C5', 'B4', 'B4'];
    const bass = ['A2', 'A2', 'E2', 'E2', 'A2', 'A2', 'E2', 'E2', 'F2', 'F2', 'C3', 'C3', 'G2', 'G2', 'E2', 'E2'];
    this._step = 0;
    this._musicTimer = setInterval(() => {
      if (this.muted || !this.musicOn) return;
      const s = this._step++;
      const n = lead[s % lead.length];
      if (n) this.tone(freq(n), 0.13, 'square', 0.10);
      if (s % 2 === 0) this.tone(freq(bass[(s >> 1) % bass.length]), 0.20, 'triangle', 0.16);
      if (s % 4 === 2) this.noise(0.05, 0.06);
    }, 150);
  }

  stopMusic() {
    clearInterval(this._musicTimer);
    this._musicTimer = null;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
