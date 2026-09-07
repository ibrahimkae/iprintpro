import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Music,
  Radio,
  X,
  ExternalLink
} from 'lucide-react';
import {
  CHIPTUNE_PRESETS,
  ChiptuneMelody,
  playChiptunePreview,
  stopChiptunePreview
} from '../lib/chiptune-engine';

export interface RetroChiptunePlayerDialogProps {
  initialSongId?: string;
  initialTitle?: string;
  onClose: () => void;
}

export function RetroChiptunePlayerDialog({
  initialSongId,
  initialTitle,
  onClose
}: RetroChiptunePlayerDialogProps) {
  const [selectedMelody, setSelectedMelody] = useState<ChiptuneMelody>(() => {
    const found = CHIPTUNE_PRESETS.find((m) => m.id === initialSongId);
    return found || CHIPTUNE_PRESETS[0];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeBarHeights, setActiveBarHeights] = useState<number[]>([6, 12, 24, 16, 28, 14, 20, 8]);
  const animIntervalRef = useRef<number | null>(null);

  // Start animated equalizer when playing
  useEffect(() => {
    if (isPlaying) {
      animIntervalRef.current = window.setInterval(() => {
        setActiveBarHeights([
          Math.floor(Math.random() * 28 + 6),
          Math.floor(Math.random() * 32 + 8),
          Math.floor(Math.random() * 30 + 10),
          Math.floor(Math.random() * 36 + 12),
          Math.floor(Math.random() * 34 + 10),
          Math.floor(Math.random() * 28 + 6),
          Math.floor(Math.random() * 32 + 8),
          Math.floor(Math.random() * 24 + 4)
        ]);
      }, 90);
    } else {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      setActiveBarHeights([6, 8, 6, 8, 6, 8, 6, 8]);
    }

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle Playback
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopChiptunePreview();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playChiptunePreview(selectedMelody, () => {
        setIsPlaying(false);
      });
    }
  };

  // Auto-play on user click/interaction
  useEffect(() => {
    // Attempt playback
    const timer = setTimeout(() => {
      try {
        setIsPlaying(true);
        playChiptunePreview(selectedMelody, () => {
          setIsPlaying(false);
        });
      } catch {
        setIsPlaying(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      stopChiptunePreview();
    };
  }, [selectedMelody]);

  const displayTitle = initialTitle || selectedMelody.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 text-white rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
      >
        {/* Top Retro Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400 opacity-75' : 'bg-slate-500 opacity-20'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-emerald-400 uppercase font-mono">
              <Radio size={14} className={isPlaying ? 'animate-pulse text-emerald-400' : 'text-slate-500'} />
              8-BIT CHIPTUNE PLAYER
            </div>
          </div>

          <button
            onClick={() => {
              stopChiptunePreview();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Center Display Card */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Animated Big Icon */}
          <div className="relative">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-5xl shadow-lg shadow-emerald-900/30 select-none"
            >
              {selectedMelody.icon}
            </motion.div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              {selectedMelody.waveform}
            </span>
          </div>

          {/* Song Info */}
          <div>
            <h2 className="text-xl font-black tracking-tight text-white mb-1">
              {displayTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              {selectedMelody.description}
            </p>
          </div>

          {/* Retro Waveform Visualizer */}
          <div className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-end justify-center gap-2 h-10 w-full px-4">
              {activeBarHeights.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${h}px` }}
                  transition={{ duration: 0.08 }}
                  className={`w-3.5 rounded-t-sm transition-colors ${
                    isPlaying
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 px-2 pt-1 border-t border-slate-800">
              <span className="text-emerald-400 font-bold">{selectedMelody.tempo} BPM</span>
              <span>Web Audio API • 100% Çevrimdışı</span>
              <span>15sn Retro Jingle</span>
            </div>
          </div>

          {/* Big Play / Replay Button */}
          <div className="w-full pt-2">
            <button
              onClick={handleTogglePlay}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square size={20} className="fill-slate-950" />
                  <span>DURDUR</span>
                </>
              ) : (
                <>
                  <Play size={22} className="fill-slate-950" />
                  <span>▶ TEKRAR ÇAL</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Melody Selector */}
          <div className="w-full pt-1 text-left">
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Diğer 8-Bit Melodileri Keşfet:
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {CHIPTUNE_PRESETS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMelody(m);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all text-left truncate ${
                    selectedMelody.id === m.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base shrink-0">{m.icon}</span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom App Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Sparkles size={13} />
            <span>iPrint Pro Chiptune Studio</span>
          </div>
          <button
            onClick={() => {
              stopChiptunePreview();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition-colors"
          >
            Uygulamaya Git
          </button>
        </div>
      </motion.div>
    </div>
  );
}
