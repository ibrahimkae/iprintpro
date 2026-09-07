// 8-Bit Retro Chiptune Web Audio Synthesizer & QR Music Payload Generator
// Super-compact Web Audio API payloads that play 15s nostalgic retro melodies when scanned offline.

export interface ChiptuneMelody {
  id: string;
  name: string;
  category: 'Oyun Klasikleri' | 'Neşeli & Kutlama' | 'Retro & Synth' | 'Özel & Bildirim';
  tempo: number; // BPM
  notes: [string, number][]; // [Note (e.g. 'C4', 'G#5', '-'), Duration in 16th notes]
  waveform: 'square' | 'triangle' | 'sawtooth';
  envelope: { attack: number; decay: number; sustain: number; release: number };
  description: string;
  icon: string;
  vibrato?: boolean;
  arpeggio?: boolean;
}

// Frequency map for standard notes
const NOTE_FREQS: Record<string, number> = {
  '-': 0, // Rest
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
};

// Compact MIDI note number mapping for sub-1.5KB data URLs
const NOTE_TO_MIDI: Record<string, number> = {
  '-': 0,
  'C3': 48, 'C#3': 49, 'D3': 50, 'D#3': 51, 'E3': 52, 'F3': 53, 'F#3': 54, 'G3': 55, 'G#3': 56, 'A3': 57, 'A#3': 58, 'B3': 59,
  'C4': 60, 'C#4': 61, 'D4': 62, 'D#4': 63, 'E4': 64, 'F4': 65, 'F#4': 66, 'G4': 67, 'G#4': 68, 'A4': 69, 'A#4': 70, 'B4': 71,
  'C5': 72, 'C#5': 73, 'D5': 74, 'D#5': 75, 'E5': 76, 'F5': 77, 'F#5': 78, 'G5': 79, 'G#5': 80, 'A5': 81, 'A#5': 82, 'B5': 83,
  'C6': 84, 'D6': 86, 'E6': 88, 'G6': 91, 'A6': 93
};

// 12 Curated, recognizable and melodic 8-bit chiptune songs (~10-15 seconds)
export const CHIPTUNE_PRESETS: ChiptuneMelody[] = [
  {
    id: 'mario-overworld',
    name: 'Super Mario - Overworld',
    category: 'Oyun Klasikleri',
    tempo: 160,
    waveform: 'square',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.05 },
    vibrato: false,
    icon: '🍄',
    description: 'Tüm zamanların en ünlü retro video oyunu ana tema müziği.',
    notes: [
      ['E5', 2], ['E5', 2], ['-', 2], ['E5', 2], ['-', 2], ['C5', 2], ['E5', 4],
      ['G5', 4], ['-', 4], ['G4', 4], ['-', 4],
      ['C5', 4], ['-', 2], ['G4', 2], ['-', 4], ['E4', 4], ['-', 2],
      ['A4', 3], ['B4', 3], ['A#4', 2], ['A4', 3],
      ['G4', 3], ['E5', 3], ['G5', 3], ['A5', 4], ['F5', 2], ['G5', 2]
    ]
  },
  {
    id: 'tetris-korobeiniki',
    name: 'Tetris - Korobeiniki',
    category: 'Oyun Klasikleri',
    tempo: 145,
    waveform: 'square',
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.08 },
    icon: '🧱',
    description: 'Klasik Game Boy Tetris Rus halk ezgisi tema müziği.',
    notes: [
      ['E5', 4], ['B4', 2], ['C5', 2], ['D5', 4], ['C5', 2], ['B4', 2],
      ['A4', 4], ['A4', 2], ['C5', 2], ['E5', 4], ['D5', 2], ['C5', 2],
      ['B4', 4], ['-', 2], ['C5', 2], ['D5', 4], ['E5', 4],
      ['C5', 4], ['A4', 4], ['A4', 6]
    ]
  },
  {
    id: 'zelda-overworld',
    name: 'Zelda - Ana Tema',
    category: 'Oyun Klasikleri',
    tempo: 135,
    waveform: 'square',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.1 },
    icon: '🛡️',
    description: 'Efsanevi Hyrule macerası keşif ve zafer melodisi.',
    notes: [
      ['A#4', 8], ['F4', 4], ['-', 2], ['A#4', 2], ['C5', 2], ['D5', 2], ['D#5', 2],
      ['F5', 12], ['-', 2], ['F5', 2], ['F#5', 2], ['G#5', 2],
      ['A#5', 12], ['G#5', 2], ['F#5', 2], ['G#5', 4], ['F#5', 2], ['F5', 8]
    ]
  },
  {
    id: 'pacman-intro',
    name: 'Pac-Man Arcade Fanfare',
    category: 'Oyun Klasikleri',
    tempo: 155,
    waveform: 'square',
    envelope: { attack: 0.01, decay: 0.04, sustain: 0.2, release: 0.04 },
    icon: '🟡',
    description: 'Orijinal 1980 Namco salon açılış intro müziği.',
    notes: [
      ['B4', 2], ['B5', 2], ['F#5', 2], ['D#5', 2], ['B5', 2], ['F#5', 2], ['D#5', 4],
      ['C5', 2], ['C6', 2], ['G5', 2], ['E5', 2], ['C6', 2], ['G5', 2], ['E5', 4],
      ['B4', 2], ['B5', 2], ['F#5', 2], ['D#5', 2], ['B5', 2], ['F#5', 2], ['D#5', 4],
      ['D#5', 1], ['E5', 1], ['F5', 1], ['F#5', 2], ['G5', 1], ['G#5', 1], ['A5', 1], ['A#5', 2], ['B5', 6]
    ]
  },
  {
    id: 'happy-birthday-8bit',
    name: 'İyi ki Doğdun (Birthday)',
    category: 'Neşeli & Kutlama',
    tempo: 130,
    waveform: 'square',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.08 },
    icon: '🎂',
    description: 'Kutlama kartları ve doğum günü hediyelerine özel 8-bit kutlama ezgisi.',
    notes: [
      ['G4', 3], ['G4', 1], ['A4', 4], ['G4', 4], ['C5', 4], ['B4', 8],
      ['G4', 3], ['G4', 1], ['A4', 4], ['G4', 4], ['D5', 4], ['C5', 8],
      ['G4', 3], ['G4', 1], ['G5', 4], ['E5', 4], ['C5', 4], ['B4', 4], ['A4', 6]
    ]
  },
  {
    id: 'cyber-victory',
    name: 'Cyberpunk Level Win',
    category: 'Retro & Synth',
    tempo: 150,
    waveform: 'sawtooth',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.12 },
    icon: '🏆',
    description: 'Bölüm sonu zafer ve seviye atlama coşkulu synth melodisi.',
    notes: [
      ['C4', 2], ['E4', 2], ['G4', 2], ['C5', 4], ['-', 2], ['G4', 2], ['C5', 6],
      ['D4', 2], ['F#4', 2], ['A4', 2], ['D5', 4], ['-', 2], ['A4', 2], ['D5', 6],
      ['E4', 2], ['G#4', 2], ['B4', 2], ['E5', 4], ['-', 2], ['B4', 2], ['E5', 6],
      ['G5', 2], ['A5', 2], ['B5', 2], ['C6', 8]
    ]
  },
  {
    id: 'neon-synthwave',
    name: 'Outrun Neon Drive',
    category: 'Retro & Synth',
    tempo: 128,
    waveform: 'sawtooth',
    envelope: { attack: 0.03, decay: 0.12, sustain: 0.5, release: 0.15 },
    icon: '🏎️',
    description: '80\'ler neon rüya ve synthwave gece sürüş melodisi.',
    notes: [
      ['A3', 4], ['C4', 4], ['E4', 4], ['A4', 4],
      ['G4', 2], ['E4', 2], ['D4', 4], ['E4', 8],
      ['F3', 4], ['A3', 4], ['C4', 4], ['F4', 4],
      ['E4', 2], ['C4', 2], ['B3', 4], ['A3', 8]
    ]
  },
  {
    id: 'love-8bit-heart',
    name: '8-Bit Aşk Melodisi',
    category: 'Neşeli & Kutlama',
    tempo: 110,
    waveform: 'triangle',
    envelope: { attack: 0.05, decay: 0.15, sustain: 0.6, release: 0.2 },
    icon: '💖',
    description: 'Sevgililer günü, özel notlar ve romantik anı hediyeleri için sıcak melodi.',
    notes: [
      ['C4', 4], ['E4', 4], ['G4', 4], ['B4', 4], ['C5', 8],
      ['A4', 4], ['C5', 4], ['E5', 4], ['D5', 8],
      ['G4', 4], ['B4', 4], ['D5', 4], ['C5', 8],
      ['F4', 4], ['A4', 4], ['C5', 4], ['E5', 4], ['C5', 8]
    ]
  },
  {
    id: 'coffee-cozy-morning',
    name: 'Sabah Kahvesi Lo-Fi',
    category: 'Retro & Synth',
    tempo: 95,
    waveform: 'triangle',
    envelope: { attack: 0.04, decay: 0.1, sustain: 0.5, release: 0.15 },
    icon: '☕',
    description: 'Huzurlu, yumuşak ve tatlı sabah kahvesi melodisi.',
    notes: [
      ['E4', 4], ['G#4', 4], ['B4', 4], ['E5', 6], ['D#5', 2], ['C#5', 4],
      ['B4', 8], ['A4', 4], ['G#4', 4], ['F#4', 8],
      ['E4', 4], ['G#4', 4], ['B4', 4], ['C#5', 4], ['E4', 10]
    ]
  },
  {
    id: 'secret-treasure-found',
    name: 'Gizli Sandık Keşfi',
    category: 'Özel & Bildirim',
    tempo: 140,
    waveform: 'square',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.06 },
    icon: '💎',
    description: 'Zindan sandığı açılma ve gizli ödül keşfetme jingle melodisi.',
    notes: [
      ['G4', 2], ['A#4', 2], ['C5', 2], ['C#5', 2], ['D#5', 2], ['F5', 2], ['F#5', 2],
      ['G#5', 4], ['-', 2], ['G#5', 2], ['A#5', 2], ['C6', 8],
      ['-', 2], ['C5', 2], ['E5', 2], ['G5', 2], ['C6', 10]
    ]
  },
  {
    id: 'boss-battle-tension',
    name: 'Final Boss Mücadele',
    category: 'Özel & Bildirim',
    tempo: 165,
    waveform: 'sawtooth',
    envelope: { attack: 0.01, decay: 0.06, sustain: 0.4, release: 0.04 },
    icon: '👾',
    description: '8-bit aksiyon, adrenalin ve hızlı tempolu retro zindan savaşı.',
    notes: [
      ['D4', 2], ['D4', 2], ['D5', 2], ['D4', 2], ['C5', 2], ['D4', 2], ['B4', 2], ['D4', 2],
      ['A#4', 2], ['D4', 2], ['A4', 2], ['D4', 2], ['G#4', 2], ['A4', 2], ['A#4', 2], ['C5', 2],
      ['F5', 4], ['E5', 4], ['D#5', 4], ['D5', 6]
    ]
  },
  {
    id: 'game-over-sad',
    name: 'Game Over Retro Veda',
    category: 'Özel & Bildirim',
    tempo: 115,
    waveform: 'square',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1 },
    icon: '💀',
    description: 'Klasik atari oyunu bitiş ve hüzünlü retro jingle.',
    notes: [
      ['C5', 4], ['G4', 4], ['E4', 6], ['A4', 3], ['B4', 3], ['A4', 3], ['G#4', 4],
      ['A#4', 3], ['A4', 3], ['G#4', 3], ['G4', 6], ['F4', 4], ['D4', 8]
    ]
  }
];

// Helper: Generate universal web player URL that works on 100% of smartphones, tablets and PCs
export function generateChiptuneWebUrl(melody: ChiptuneMelody, customTitle?: string): string {
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const params = new URLSearchParams();
  params.set('s', melody.id);
  if (customTitle && customTitle !== melody.name) {
    params.set('t', customTitle.trim());
  }
  return `${origin}/play.html?${params.toString()}`;
}

// Helper: Convert MIDI notes into an ultra-compact, standalone offline Web Audio HTML data URL
export function generateChiptuneDataUrl(melody: ChiptuneMelody, customTitle?: string): string {
  const cleanTitle = (customTitle || melody.name).replace(/[^\w\s\u00C0-\u017F-]/gi, '').trim() || '8-Bit Melodi';
  const midiList = melody.notes.map(([n, d]) => `${NOTE_TO_MIDI[n] || 0},${d}`).join(',');
  const bpm = melody.tempo;
  const wave = melody.waveform;
  const icon = melody.icon;

  // Ultra-compact, self-contained standalone HTML5 + Web Audio API player (<1.5KB base64, easily fits in standard QR)
  const html = `<body style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:16px"><div style="font-size:32px">${icon}</div><h3 style="margin:4px 0">${cleanTitle}</h3><p style="color:#94a3b8;font-size:11px;margin:0 0 12px">⚡ 8-Bit Chiptune Offline</p><button onclick="P()" style="padding:10px 24px;background:#10b981;color:#fff;border:0;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">▶ TEKRAR ÇAL</button><script>var A,N=[${midiList}],B=${bpm},W="${wave}";function P(){A=A||new(window.AudioContext||webkitAudioContext)();if(A.state=="suspended")A.resume();var t=A.currentTime+.05,u=60/B/4;for(var i=0;i<N.length;i+=2){var m=N[i],d=N[i+1]*u;if(m>0){var o=A.createOscillator(),g=A.createGain();o.type=W;o.frequency.setValueAtTime(440*Math.pow(2,(m-69)/12),t);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+d-.01);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+d)}t+=d}}window.onload=function(){try{P()}catch(e){}};document.body.onclick=function(){if(!A)P()};</script>`;

  // Encode to UTF-8 base64 data URL
  const base64 = btoa(unescape(encodeURIComponent(html)));
  return `data:text/html;base64,${base64}`;
}

// In-App Web Audio Synthesizer Previewer
let previewAudioCtx: AudioContext | null = null;
let currentTimeoutIds: number[] = [];

export function stopChiptunePreview() {
  if (currentTimeoutIds.length > 0) {
    currentTimeoutIds.forEach((id) => clearTimeout(id));
    currentTimeoutIds = [];
  }
  if (previewAudioCtx && previewAudioCtx.state !== 'closed') {
    try {
      previewAudioCtx.close();
    } catch {}
    previewAudioCtx = null;
  }
}

export function playChiptunePreview(melody: ChiptuneMelody, onEnd?: () => void) {
  stopChiptunePreview();

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  previewAudioCtx = ctx;

  const unit = (60 / melody.tempo) / 4;
  let startTime = ctx.currentTime + 0.05;

  melody.notes.forEach(([noteName, durSteps]) => {
    const f = NOTE_FREQS[noteName] || 0;
    const durSec = durSteps * unit;

    if (f > 20) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = melody.waveform;
      osc.frequency.setValueAtTime(f, startTime);

      // ADSR Envelope
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + melody.envelope.attack);
      gain.gain.linearRampToValueAtTime(0.25 * melody.envelope.sustain, startTime + melody.envelope.attack + melody.envelope.decay);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durSec - 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durSec);
    }

    startTime += durSec;
  });

  const totalMs = (startTime - ctx.currentTime) * 1000;
  const tid = window.setTimeout(() => {
    if (onEnd) onEnd();
  }, totalMs);
  currentTimeoutIds.push(tid);
}
