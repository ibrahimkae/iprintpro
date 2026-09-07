import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { renderProDesigned } from '../lib/canvas-blocks';
import { extractVariables, resolveTemplate, type VariableDef, type VariableValues } from '../lib/template-variables';
import { PRO_CUSTOM_RENDERERS } from '../lib/pro-renderers';

export interface ProLiveDialogProps {
  open: boolean;
  title: string;
  text: string;
  templateId?: string;
  examples: Record<string, string>;
  pageWidth: number;
  onClose: () => void;
  onPrint: (values: VariableValues) => void;
}

/**
 * PROFESYONEL canlı önizleme: solda form, sağda gerçek termal çıktı
 * önizlemesi. Her tuş vuruşunda canvas yeniden çizilir (Template Studio
 * deneyimi, değişkenli şablonlar için).
 */
export function ProLiveDialog({ open, title, text, templateId, examples, pageWidth, onClose, onPrint }: ProLiveDialogProps) {
  const defs = useMemo(() => extractVariables(text), [text]);
  const [values, setValues] = useState<VariableValues>(() => ({ ...examples }));

  const set = (name: string, v: string) => setValues(prev => ({ ...prev, [name]: v }));

  const missing = defs.filter(d => d.required && !(values[d.name] ?? d.defaultValue ?? '').trim());

  const drawPreview = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (templateId && PRO_CUSTOM_RENDERERS[templateId]) {
      PRO_CUSTOM_RENDERERS[templateId]({ ctx, width: pageWidth, canvas, values });
      return;
    }

    const blocks = resolveTemplate(text, values, defs);
    // Ölçüm geçişi (yükseklik)
    const measurer = document.createElement('canvas').getContext('2d')!;
    measurer.font = '24px sans-serif';
    const h = renderProDesigned(measurer, pageWidth, title, blocks, { fontSize: 24 });
    canvas.width = pageWidth;
    canvas.height = Math.ceil(h) + 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#000000';
    renderProDesigned(ctx, pageWidth, title, blocks, { fontSize: 24 });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{title} — Canlı Önizleme</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer border border-white/10"
            title="Kapat"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 overflow-y-auto">
          {/* FORM */}
          <div className="space-y-2">
            {defs.map(def => (
              <div key={def.name} className="space-y-0.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {def.name}{def.required && <span className="text-red-500"> *</span>}
                </label>
                {def.type === 'coksatir' ? (
                  <textarea value={values[def.name] ?? ''} onChange={e => set(def.name, e.target.value)}
                    className="w-full h-16 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none" />
                ) : def.type === 'tarih' ? (
                  <input type="date" value={values[def.name] ?? ''} onChange={e => set(def.name, e.target.value)}
                    className="w-full h-8 text-xs px-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                ) : (
                  <input
                    type={def.type === 'sayi' || def.type === 'para' ? 'number' : 'text'}
                    step={def.type === 'para' ? '0.01' : undefined}
                    value={values[def.name] ?? ''}
                    onChange={e => set(def.name, e.target.value)}
                    placeholder={def.hint || ''}
                    className="w-full h-8 text-xs px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          {/* CANLI ÖNİZLEME — kağıt görünümlü */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Termal Çıktı Önizleme</div>
            <div className="bg-slate-200 dark:bg-black/60 rounded-xl p-3 flex justify-center">
              <canvas ref={drawPreview}
                style={{ width: Math.min(pageWidth / 2, 260) }}
                className="bg-white shadow-inner rounded [image-rendering:pixelated]" />
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">İptal</button>
          <button disabled={missing.length > 0} onClick={() => onPrint(values)}
            className={`flex-[2] h-9 rounded-lg font-bold text-xs text-white ${missing.length > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700'}`}>
            {missing.length > 0 ? `${missing.length} zorunlu alan boş` : 'YAZDIR'}
          </button>
        </div>
      </div>
    </div>
  );
}
