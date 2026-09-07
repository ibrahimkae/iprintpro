import React, { useEffect, useState, useRef, useCallback } from 'react';
import { logger } from '../lib/logger';
import { Terminal, Trash2, ChevronDown, ChevronUp, GripVertical, Move, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MAX_LOGS = 1000;

export function DebugConsole({ 
  onSwitchChannel, 
  activeView, 
  visible,
  onClose
}: { 
  onSwitchChannel?: () => void, 
  activeView?: string, 
  visible?: boolean,
  onClose?: () => void
}) {
  // If visible is explicitly false, do not render anything in DOM
  if (visible === false) {
    return null;
  }

  const [logs, setLogs] = useState(logger.getLogs().slice(-MAX_LOGS));
  const [isOpen, setIsOpen] = useState(true);
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // If visible prop changes to true, ensure logs body is open
  useEffect(() => {
    if (visible === true) {
      setIsOpen(true);
    }
  }, [visible]);

  useEffect(() => {
    return logger.subscribe((newLogs) => {
      setLogs([...newLogs].slice(-MAX_LOGS));
    });
  }, []);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  // Drag handlers for floating mode
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isFloating) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: position.x, oy: position.y };
  }, [isFloating, position]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, dragStart.current.ox + (e.clientX - dragStart.current.mx)),
        y: Math.max(0, dragStart.current.oy + (e.clientY - dragStart.current.my)),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  const levelColor = (level: string) => {
    if (level === 'error') return 'text-red-400';
    if (level === 'warn') return 'text-yellow-400';
    if (level === 'debug') return 'text-purple-400';
    return 'text-blue-400';
  };

  const consoleBody = (
    <div className={`bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden ${isFloating ? '' : 'mx-0'}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${isFloating ? 'cursor-move' : 'cursor-pointer'} hover:bg-slate-800/50 transition-colors select-none touch-manulpation min-h-[44px]`}
        onClick={isFloating ? undefined : () => setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          {isFloating && <GripVertical size={14} className="text-slate-500" />}
          <Terminal size={14} className="text-blue-400" />
          <span className="text-xs font-mono font-bold text-slate-300">SYSTEM CONSOLE</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
            {logs.length}/{MAX_LOGS}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSwitchChannel?.(); }}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-300 transition-colors touch-manipulation"
            title="Switch Bluetooth Channel"
          >
            Switch CH
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsFloating(f => !f); }}
            className={`p-1.5 rounded transition-colors touch-manipulation ${isFloating ? 'bg-teal-700 text-teal-200' : 'hover:bg-slate-700 text-slate-400 hover:text-teal-400'}`}
            title={isFloating ? 'Sabit Yap' : 'Sürüklenebilir Yap'}
          >
            <Move size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); logger.clear(); }}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors touch-manipulation"
            title="Clear Logs"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors touch-manipulation"
            title={isOpen ? "Daralt" : "Genişlet"}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1.5 hover:bg-red-900/40 rounded text-slate-400 hover:text-red-400 transition-colors touch-manipulation"
              title="Hata Konsolunu Kapat"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Log body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 220 }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto p-2 font-mono text-[10px] space-y-0.5 bg-slate-950/60"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 py-8">
                  <Terminal size={20} opacity={0.3} />
                  <p>No system logs yet...</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-2 py-0.5 border-b border-slate-900/40 last:border-0">
                    <span className="text-slate-500 shrink-0 text-[9px]">
                      {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`font-bold shrink-0 text-[9px] ${levelColor(log.level)}`}>
                      [{log.level.toUpperCase().slice(0,3)}]
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                    {log.data && (
                      <span className="text-slate-500 italic truncate max-w-[200px] text-[9px]">
                        {typeof log.data === 'object' ? JSON.stringify(log.data) : String(log.data)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isFloating) {
    return (
      <div
        className="fixed z-[200] w-80 select-none shadow-2xl"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        {consoleBody}
      </div>
    );
  }

  if (!isFloating && activeView && activeView !== 'menu') {
    return null;
  }

  // Inline at bottom of page
  return (
    <div className="w-full mt-2 px-0">
      {consoleBody}
    </div>
  );
}
