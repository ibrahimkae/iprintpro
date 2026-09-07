import React, { useEffect, useState } from 'react';
import { Loader2, Printer, UserRound } from 'lucide-react';
import {
  DEV_EMAIL,
  DEV_PASSWORD,
  getSessionSnapshot,
  useAuth
} from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';

export interface AuthDialogProps {
  open: boolean;
  initialMode?: 'login' | 'register';
  onSuccess: (token: string, email: string) => void;
  onGuest: () => void;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export function AuthDialog({ open, initialMode = 'login', onSuccess, onGuest, onClose }: AuthDialogProps) {
  const { login, register, loginDeveloper, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | 'form' | 'dev'>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setError(null);
      setBusy(null);
    }
  }, [open, initialMode]);

  const finishSuccess = (token: string, userEmail: string) => {
    onSuccess(token, userEmail);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setBusy('form');
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
      const session = getSessionSnapshot();
      if (session) finishSuccess(session.token, session.email);
      else setError('Oturum oluşturulamadı. Tekrar deneyin.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setBusy(null);
    }
  };

  const handleGuest = () => {
    if (busy) return;
    continueAsGuest();
    onGuest();
  };

  const handleDevLogin = async () => {
    if (busy) return;
    setError(null);
    setBusy('dev');
    try {
      await loginDeveloper();
      const session = getSessionSnapshot();
      if (session) finishSuccess(session.token, session.email);
      else setError('Test hesabıyla giriş başarısız oldu.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test hesabıyla girilemedi.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 bg-slate-900 dark:bg-slate-950 pr-12">
          <DialogTitle className="flex items-center gap-2 text-white text-sm font-bold">
            <Printer size={16} className="text-teal-400" />
            iPrint Pro Hesabı
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-300 leading-relaxed">
            Pro özellikler, şablon senkronu ve cihaz profilleri için hesabınıza giriş yapın.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 pt-4 space-y-4 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`h-8 text-xs font-bold rounded-lg transition-all ${
                  mode === m
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                {m === 'login' ? 'Giriş' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
              <p className="text-xs font-bold text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-posta</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="ornek@firma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy !== null}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Şifre</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy !== null}
                className="h-10 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={busy !== null}
              className="w-full h-10 rounded-lg font-bold text-xs gap-2 transition-transform active:scale-95"
            >
              {busy === 'form' && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">veya</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hızlı Erişim</p>
            <button
              type="button"
              onClick={handleGuest}
              disabled={busy !== null}
              className="w-full h-11 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors text-left px-3 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <UserRound size={15} className="text-teal-500" />
                👤 Misafir Olarak Devam Et
              </span>
              <span className="block mt-0.5 pl-6 text-[10px] text-slate-400">
                Tüm araçlar yerel deneme modunda çalışır.
              </span>
            </button>

            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/60 dark:bg-purple-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  🛠️ Geliştirici
                </p>
                <span className="text-[9px] font-bold bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-800">
                  Yerel Sunucu
                </span>
              </div>
              <pre className="rounded-lg bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 px-2.5 py-2 font-mono text-[10px] leading-relaxed text-purple-700 dark:text-purple-200 overflow-x-auto select-text">
{`${DEV_EMAIL}\n${DEV_PASSWORD}`}
              </pre>
              <Button
                type="button"
                variant="outline"
                onClick={handleDevLogin}
                disabled={busy !== null}
                className="w-full h-9 rounded-lg font-bold text-xs gap-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-200"
              >
                {busy === 'dev' && <Loader2 size={13} className="animate-spin" />}
                Test Hesabıyla Gir (Pro)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
