import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/button';

interface ProWallProps {
  featureTitle: string;
  description?: string;
  onStartTrial: () => void;
  onLater: () => void;
  loadingTrial?: boolean;
}

const PRO_BENEFITS = [
  'Sınırsız toplu baskı (Free: 3 satır)',
  'Pazaryeri, POS, servis ve depo modülleri',
  'Özel marka altbilgi ve şablonlar',
  'Sınırsız kayıt ve taslak'
];

export function ProWall({
  featureTitle,
  description,
  onStartTrial,
  onLater,
  loadingTrial = false
}: ProWallProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${featureTitle} — Pro özelliği`}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-slate-900 text-slate-100 shadow-2xl ring-1 ring-slate-700">
        <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-teal-500 to-teal-700 px-6 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Lock className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-white">{featureTitle}</h2>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-100">
            Pro Özellik
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <p className="text-sm text-slate-300">
            {description ??
              'Bu özelliği kullanmak için iPrint Pro gerekir. 14 gün boyunca tüm Pro avantajlarını ücretsiz deneyin.'}
          </p>

          <ul className="flex flex-col gap-2">
            {PRO_BENEFITS.map(benefit => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-slate-200">
                <span className="mt-0.5 font-semibold text-teal-400" aria-hidden="true">
                  ✓
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              onClick={onStartTrial}
              disabled={loadingTrial}
              className={cn('flex-1', loadingTrial && 'cursor-wait opacity-70')}
            >
              {loadingTrial ? 'Bağlanıyor…' : '14 Gün Ücretsiz Dene'}
            </Button>
            <Button variant="ghost" onClick={onLater} disabled={loadingTrial} className="sm:flex-none">
              Sonra
            </Button>
          </div>

          <p className="text-center text-xs text-slate-500">
            Kart istemez. Deneme bitince otomatik Free plana dönersiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProWall;
