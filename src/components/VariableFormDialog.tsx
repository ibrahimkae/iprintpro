import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { VariableDef } from '../lib/template-variables';

export interface VariableFormDialogProps {
  open: boolean;
  defs: VariableDef[];
  /** Daha önce girilen değerler (hatırlama) */
  initialValues?: Record<string, string>;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

/** SPEC-01 §6.2 — değişken tanımlarından otomatik üretilen form. */
export function VariableFormDialog({ open, defs, initialValues, onCancel, onSubmit }: VariableFormDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});

  const missing = useMemo(
    () => defs.filter(d => d.required && !(values[d.name] ?? d.defaultValue ?? '').trim()).map(d => d.name),
    [defs, values]
  );

  const set = (name: string, v: string) => setValues(prev => ({ ...prev, [name]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-xs mx-2 rounded-xl p-3 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-950">
        <DialogHeader className="pb-1 pr-9">
          <DialogTitle className="text-sm font-bold">Değişkenleri Doldur</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {defs.map(def => (
            <div key={def.name} className="space-y-0.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">
                {def.name}{def.required && <span className="text-red-500"> *</span>}
              </Label>
              {def.type === 'secim' ? (
                <select
                  value={values[def.name] ?? def.defaultValue ?? ''}
                  onChange={e => set(def.name, e.target.value)}
                  className="w-full h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-2"
                >
                  <option value="">Seçin…</option>
                  {(def.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : def.type === 'coksatir' ? (
                <textarea
                  value={values[def.name] ?? ''}
                  onChange={e => set(def.name, e.target.value)}
                  className="w-full h-16 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none"
                />
              ) : (
                <Input
                  type={def.type === 'sayi' || def.type === 'para' ? 'number' : def.type === 'tarih' ? 'date' : 'text'}
                  step={def.type === 'para' ? '0.01' : undefined}
                  inputMode={def.type === 'para' ? 'decimal' : undefined}
                  value={values[def.name] ?? ''}
                  onChange={e => set(def.name, e.target.value)}
                  placeholder={def.hint || (def.type === 'barkod' ? 'Barkod numarası' : '')}
                  className="h-8 text-xs rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 h-8 rounded-lg text-xs">İptal</Button>
          <Button
            size="sm"
            disabled={missing.length > 0}
            onClick={() => onSubmit(values)}
            className="flex-[2] h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            {missing.length > 0 ? `${missing.length} zorunlu alan boş` : 'Yazdır'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
