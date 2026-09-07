import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import type { VariableDef } from '../lib/template-variables';
import { resolveTemplate } from '../lib/template-variables';
import { renderBlocks } from '../lib/canvas-blocks';
import {
  parseDataFile, guessMapping, buildBatchRows,
  makeLiteralValue, isLiteralValue, literalText,
  saveCsvMapping, loadCsvMapping,
  saveBatchProgress, loadBatchProgress, clearBatchProgress,
  type ParsedCsv, type BatchProgress
} from '../lib/csv-batch';
import {
  Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Printer,
  Ban, AlertTriangle, CheckCircle2, Download, RotateCcw, Loader2
} from 'lucide-react';

export interface BatchViewProps {
  variableTemplates: { id: string; name: string; variables: VariableDef[] }[];
  maxRows: number;
  onPrintBatch: (templateId: string, rows: Record<string, string>[]) => Promise<void>;
  onBack: () => void;
}

const NONE_OPTION = '__none__';
const LITERAL_OPTION = '__literal__';
const PREVIEW_COUNT = 6;
const EST_LABEL_MM = 43;

type Step = 1 | 2 | 3 | 4;
type RunStatus = 'idle' | 'running' | 'done' | 'cancelled';
interface ReportEntry { row: number; reason: string }

function LabelPreview({
  templateText, defs, values, rowNo
}: { templateText: string; defs: VariableDef[]; values: Record<string, string>; rowNo: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    try {
      renderBlocks(ctx, cv.width, resolveTemplate(templateText, values, defs), {
        fontSize: 13,
        padding: 6,
        codeHeightPx: 34
      });
    } catch {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Önizleme çizilemedi', 8, 20);
    }
  }, [templateText, defs, values]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        width={220}
        height={130}
        className="rounded-lg border border-slate-200 bg-white shadow-xs"
      />
      <span className="text-[10px] font-mono text-slate-400">#{rowNo}</span>
    </div>
  );
}

export function BatchView(props: BatchViewProps) {
  const { variableTemplates, maxRows } = props;

  const [step, setStep] = useState<Step>(1);
  const [templateId, setTemplateId] = useState('');
  const [paperWidth, setPaperWidth] = useState<'58' | '80'>('58');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [mapping, setMapping] = useState<Record<string, string>>({});

  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [doneCount, setDoneCount] = useState(0);
  const [errors, setErrors] = useState<ReportEntry[]>([]);
  const [skipped, setSkipped] = useState<ReportEntry[]>([]);
  const [resume, setResume] = useState<BatchProgress | null>(null);

  const cancelRef = useRef(false);
  const mountedRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRef.current = true;
    };
  }, []);

  const template = useMemo(
    () => variableTemplates.find(t => t.id === templateId) ?? null,
    [variableTemplates, templateId]
  );

  const templateText = useMemo(
    () =>
      template
        ? template.variables.map(v => `{${v.name}}`).join('\n')
        : '',
    [template]
  );

  const applyAutoMapping = useCallback(
    (result: ParsedCsv, tplId: string) => {
      const tpl = variableTemplates.find(t => t.id === tplId);
      if (!tpl) return;
      const saved = loadCsvMapping(tplId);
      const guessed = guessMapping(result.headers, tpl.variables.map(v => v.name));
      const next: Record<string, string> = {};
      for (const def of tpl.variables) {
        const remembered = saved?.columnMap[def.name];
        const g = guessed[def.name];
        const usable =
          remembered &&
          (isLiteralValue(remembered) || result.headers.includes(remembered))
            ? remembered
            : g ?? '';
        next[def.name] = usable ?? '';
      }
      setMapping(next);
    },
    [variableTemplates]
  );

  useEffect(() => {
    if (parsed && templateId) applyAutoMapping(parsed, templateId);
  }, [parsed, templateId, applyAutoMapping]);

  const jobId = useMemo(() => {
    if (!parsed || !templateId) return '';
    const sig = `${fileName}|${parsed.headers.join(',')}|${parsed.rows.length}`;
    let h = 0;
    for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) | 0;
    return `batch_${templateId}_${Math.abs(h)}`;
  }, [parsed, templateId, fileName]);

  useEffect(() => {
    if (!jobId || runStatus === 'running') {
      setResume(null);
      return;
    }
    const p = loadBatchProgress();
    if (p && p.jobId === jobId && p.completedIndex > 0) setResume(p);
    else setResume(null);
  }, [jobId, runStatus]);

  const prepared = useMemo(() => {
    if (!parsed || !template) return null;
    const truncated = parsed.rows.length > maxRows;
    const usable = truncated ? parsed.rows.slice(0, maxRows) : parsed.rows;
    const values = buildBatchRows(mapping, parsed.headers, usable);
    const valid: Record<string, string>[] = [];
    const numbers: number[] = [];
    const skippedList: ReportEntry[] = [];

    values.forEach((vals, i) => {
      const missing = template.variables
        .filter(d => d.required && !(vals[d.name] ?? '').trim())
        .map(d => d.name);
      if (missing.length > 0) {
        skippedList.push({
          row: i + 2,
          reason: `Zorunlu alan boş: ${missing.join(', ')}`
        });
        return;
      }
      valid.push(vals);
      numbers.push(i + 2);
    });

    return { valid, numbers, skippedList, truncated };
  }, [parsed, template, mapping, maxRows]);

  const requiredMissing = useMemo(
    () =>
      (template?.variables ?? [])
        .filter(
          d =>
            d.required &&
            (() => {
              const mv = mapping[d.name];
              if (!mv) return true;
              return isLiteralValue(mv) && literalText(mv).trim() === '';
            })()
        )
        .map(d => d.name),
    [template, mapping]
  );

  async function handleFile(file: File) {
    setFileError(null);
    setLoadingFile(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await parseDataFile(file.name, buffer);
      if (result.headers.length === 0) {
        throw new Error('Dosyada başlık satırı bulunamadı');
      }
      setParsed(result);
      setFileName(file.name);
    } catch (e) {
      setParsed(null);
      setFileName('');
      setFileError(e instanceof Error ? e.message : 'Dosya okunamadı');
    } finally {
      setLoadingFile(false);
    }
  }

  async function runBatch(startFrom: number) {
    if (!prepared || !templateId) return;
    cancelRef.current = false;
    setSkipped(prepared.skippedList);
    setErrors([]);
    setDoneCount(startFrom);
    setRunStatus('running');
    setStep(4);

    const total = prepared.valid.length;
    let cancelledMidway = false;
    for (let i = startFrom; i < total; i++) {
      if (cancelRef.current) {
        cancelledMidway = true;
        break;
      }
      try {
        await props.onPrintBatch(templateId, [prepared.valid[i]]);
      } catch (e) {
        const entry: ReportEntry = {
          row: prepared.numbers[i],
          reason: e instanceof Error ? e.message : String(e)
        };
        setErrors(prev => [...prev, entry]);
      }
      setDoneCount(i + 1);
      saveBatchProgress(jobId, i + 1, total);
    }

    if (!mountedRef.current) return;
    clearBatchProgress(jobId);
    setResume(null);
    setRunStatus(cancelledMidway ? 'cancelled' : 'done');
  }

  function resetRun() {
    cancelRef.current = false;
    setRunStatus('idle');
    setDoneCount(0);
    setErrors([]);
    setSkipped([]);
    setStep(3);
  }

  function goToStep3() {
    if (templateId && parsed) saveCsvMapping(templateId, mapping);
    setStep(3);
  }

  function downloadReport() {
    const lines: string[] = ['Satir,Neden'];
    for (const s of skipped) lines.push(`${s.row},"${s.reason.replace(/"/g, '""')}"`);
    for (const e of errors) lines.push(`${e.row},"${e.reason.replace(/"/g, '""')}"`);
    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'baski-raporu.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectValueFor = (name: string): string => {
    const mv = mapping[name];
    if (!mv) return NONE_OPTION;
    if (isLiteralValue(mv)) return LITERAL_OPTION;
    return mv;
  };

  const totalUsable = prepared?.valid.length ?? 0;
  const metersEstimate = ((totalUsable * EST_LABEL_MM) / 1000).toFixed(1);
  const pct = totalUsable > 0 ? Math.round((doneCount / totalUsable) * 100) : 0;
  const canProceedToMapping = !!parsed && !!template;
  const canProceedToPreview =
    canProceedToMapping && requiredMissing.length === 0 && !!parsed;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={props.onBack}
          className="rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 dark:text-slate-200 text-xs h-8"
        >
          <ArrowLeft size={14} className="mr-1.5" /> Geri
        </Button>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Toplu Etiket · Adım {step}/4
        </span>
      </div>

      {step === 1 && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hedef Şablon (değişkenli)
            </Label>
            <Select
              value={templateId || null}
              onValueChange={v => setTemplateId(v ?? '')}
            >
              <SelectTrigger className="w-full h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
                <SelectValue placeholder="Şablon seç…" />
              </SelectTrigger>
              <SelectContent>
                {variableTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.name} ({t.variables.length} değişken)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              CSV / Excel Dosyası
            </Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFile(f);
              }}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 transition-colors cursor-pointer"
            >
              {loadingFile ? (
                <Loader2 size={22} className="animate-spin text-teal-600" />
              ) : (
                <Upload size={22} className="text-slate-400" />
              )}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {fileName || 'Dosya sürükle veya seç (.csv · .tsv · .xlsx)'}
              </span>
              {parsed && (
                <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                  {parsed.rows.length} satır · {parsed.headers.length} sütun algılandı
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt,.xlsx"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.currentTarget.value = '';
              }}
            />
            {fileError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5">
                <AlertTriangle size={14} className="mt-0.5 text-red-500 shrink-0" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400">{fileError}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kağıt Genişliği
            </Label>
            <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
              {(['58', '80'] as const).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPaperWidth(w)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    paperWidth === w
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {w} mm{w === '58' ? ' (varsayılan)' : ''}
                </button>
              ))}
            </div>
          </div>

          {parsed && prepared?.truncated && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5">
              <AlertTriangle size={14} className="mt-0.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Ücretsiz sürüm ilk {maxRows} satıra kadar baskı yapar — dosyada{' '}
                {parsed.rows.length} satır var. Pro ile tamamı açılır.
              </span>
            </div>
          )}

          {resume && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 p-2.5">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                Önceki baskıdan {resume.completedIndex}/{resume.total} etiket tamamlandı. Kaldığın yerden devam et?
              </span>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  className="h-7 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3"
                  onClick={() => void runBatch(resume.completedIndex)}
                >
                  Devam Et
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-lg text-xs font-bold px-3 dark:border-slate-700"
                  onClick={() => {
                    clearBatchProgress(jobId);
                    setResume(null);
                  }}
                >
                  Yeni Başlat
                </Button>
              </div>
            </div>
          )}

          <Button
            disabled={!canProceedToMapping}
            onClick={() => setStep(2)}
            className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            Sütun Eşlemeye Geç <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </Card>
      )}

      {step === 2 && template && parsed && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="space-y-3">
            {template.variables.map(def => {
              const sv = selectValueFor(def.name);
              return (
                <div key={def.name} className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {'{'}{def.name}{'}'} ({def.type}){def.required && <span className="text-red-500"> *</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={sv}
                      onValueChange={v => {
                        const val = v ?? NONE_OPTION;
                        if (val === NONE_OPTION) {
                          setMapping(m => ({ ...m, [def.name]: '' }));
                        } else if (val === LITERAL_OPTION) {
                          setMapping(m => ({
                            ...m,
                            [def.name]: makeLiteralValue(literalText(m[def.name] ?? '') )
                          }));
                        } else {
                          setMapping(m => ({ ...m, [def.name]: val }));
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION} className="text-xs">
                          (eşleşme yok)
                        </SelectItem>
                        {parsed.headers.map(h => (
                          <SelectItem key={h} value={h} className="text-xs">
                            {h}
                          </SelectItem>
                        ))}
                        <SelectItem value={LITERAL_OPTION} className="text-xs">
                          @ sabit değer gir…
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {sv === LITERAL_OPTION && (
                      <Input
                        value={literalText(mapping[def.name] ?? '')}
                        onChange={e =>
                          setMapping(m => ({
                            ...m,
                            [def.name]: makeLiteralValue(e.target.value)
                          }))
                        }
                        placeholder="Sabit değer…"
                        className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {requiredMissing.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5">
              <AlertTriangle size={14} className="mt-0.5 text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                Zorunlu değişkenler eşlenmedi: {requiredMissing.join(', ')}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 h-9 rounded-xl text-xs font-bold dark:border-slate-700"
            >
              <ArrowLeft size={14} className="mr-1.5" /> Geri
            </Button>
            <Button
              disabled={!canProceedToPreview}
              onClick={goToStep3}
              className="flex-1 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
            >
              Önizleme <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && prepared && template && parsed && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Önizleme (ilk {Math.min(PREVIEW_COUNT, prepared.valid.length)})
            </Label>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {totalUsable} etiket · ~{metersEstimate} m rulo
              {prepared.skippedList.length > 0 && ` · ${prepared.skippedList.length} satır atlanacak`}
            </span>
          </div>

          {prepared.truncated && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5">
              <AlertTriangle size={14} className="mt-0.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Free limiti: sadece ilk {maxRows} satır seçildi (dosya {parsed.rows.length} satır).
              </span>
            </div>
          )}

          {totalUsable === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              Yazdırılabilir satır yok — eşlemeyi kontrol edin.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-x-auto">
              {prepared.valid.slice(0, PREVIEW_COUNT).map((vals, i) => (
                <LabelPreview
                  key={i}
                  templateText={templateText}
                  defs={template.variables}
                  values={vals}
                  rowNo={prepared.numbers[i]}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 h-9 rounded-xl text-xs font-bold dark:border-slate-700"
            >
              <ArrowLeft size={14} className="mr-1.5" /> Geri
            </Button>
            <Button
              disabled={totalUsable === 0}
              onClick={() => void runBatch(0)}
              className="flex-1 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
            >
              <Printer size={14} className="mr-1.5" /> {totalUsable} Etiketi Bas
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Baskı Kuyruğu
          </Label>

          {(runStatus === 'running' || runStatus === 'done' || runStatus === 'cancelled') && (
            <div className="space-y-2">
              <Progress value={pct} className="w-full" />
              <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
                <span>{doneCount}/{totalUsable}</span>
                <span>%{pct}</span>
              </div>
            </div>
          )}

          {runStatus === 'running' && (
            <Button
              variant="destructive"
              onClick={() => {
                cancelRef.current = true;
              }}
              className="w-full h-9 rounded-xl font-bold text-xs"
            >
              <Ban size={14} className="mr-1.5" /> İptal
            </Button>
          )}

          {(runStatus === 'done' || runStatus === 'cancelled') && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-2.5">
                  <CheckCircle2 size={16} className="mx-auto text-emerald-500" />
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {doneCount - errors.length}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Başarılı</div>
                </div>
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5">
                  <AlertTriangle size={16} className="mx-auto text-red-500" />
                  <div className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">{errors.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Hatalı</div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5">
                  <Ban size={16} className="mx-auto text-slate-400" />
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                    {skipped.length + (runStatus === 'cancelled' ? totalUsable - doneCount : 0)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Atlanan</div>
                </div>
              </div>

              {runStatus === 'cancelled' && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  Baskı iptal edildi — {doneCount}/{totalUsable} etiket işlendi.
                </div>
              )}

              {(errors.length > 0 || skipped.length > 0) && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sorunlu Satırlar
                  </Label>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60">
                          <th className="p-2 font-bold text-slate-500 uppercase text-[10px]">Satır</th>
                          <th className="p-2 font-bold text-slate-500 uppercase text-[10px]">Durum</th>
                          <th className="p-2 font-bold text-slate-500 uppercase text-[10px]">Neden</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...errors, ...skipped].map((r, i) => (
                          <tr key={`${r.row}-${i}`} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="p-2 font-mono font-bold">{r.row}</td>
                            <td className={`p-2 font-bold ${errors.includes(r) ? 'text-red-500' : 'text-amber-500'}`}>
                              {errors.includes(r) ? 'Hata' : 'Atlandı'}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-slate-300">{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadReport}
                    className="w-full h-8 rounded-lg text-xs font-bold dark:border-slate-700"
                  >
                    <Download size={13} className="mr-1.5" /> Hataları CSV olarak indir
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                onClick={resetRun}
                className="w-full h-9 rounded-xl font-bold text-xs dark:border-slate-700"
              >
                <RotateCcw size={14} className="mr-1.5" /> Önizlemeye Dön
              </Button>
            </>
          )}
        </Card>
      )}

      {!parsed && step > 1 && (
        <div className="text-center text-xs font-bold text-slate-400 py-4">
          <FileSpreadsheet size={18} className="mx-auto mb-1 text-slate-300" />
          Önce dosya yükleyin.
        </div>
      )}
    </div>
  );
}
