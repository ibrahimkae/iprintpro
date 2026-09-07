type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  private constructor() {}

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      level,
      message,
      data
    };
    this.logs = [entry, ...this.logs].slice(0, 1000);
    this.notify();
    
    // Also log to browser console (dev only — keep the in-app console as the
    // single source of truth in production builds)
    if (import.meta.env.DEV) {
      const consoleMsg = `[${level.toUpperCase()}] ${message}`;
      if (data) {
        console.log(consoleMsg, data);
      } else {
        console.log(consoleMsg);
      }
    }
  }

  info(message: string, data?: any) { this.addLog('info', message, data); }
  warn(message: string, data?: any) { this.addLog('warn', message, data); }
  error(message: string, data?: any) { this.addLog('error', message, data); }
  debug(message: string, data?: any) { this.addLog('debug', message, data); }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = Logger.getInstance();
