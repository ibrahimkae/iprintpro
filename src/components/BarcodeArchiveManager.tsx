import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Check,
  QrCode,
  Barcode,
  MapPin,
  Tag,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
  Boxes,
  CheckSquare,
  Square,
  Camera,
  Lock,
  EyeOff
} from 'lucide-react';
import {
  barcodeArchiveStorage,
  BarcodeArchiveRecord,
  ArchiveItem
} from '../lib/barcode-archive-storage';
import { renderArchiveLabel } from '../lib/barcode-archive-renderer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BarcodeArchiveManagerProps {
  onDirectPrint?: (img: string) => void;
  onGenerate: (img: string) => void;
  initialCodeToCreate?: string | null;
  onClearInitialCode?: () => void;
  onSwitchToScan?: () => void;
}

const CATEGORIES = ['Tümü', 'Ofis', 'Depo', 'Atölye', 'Koli', 'Arşiv', 'Ev / Taşınma'];

export const BarcodeArchiveManager: React.FC<BarcodeArchiveManagerProps> = ({
  onDirectPrint,
  onGenerate,
  initialCodeToCreate,
  onClearInitialCode,
  onSwitchToScan
}) => {
  const [archives, setArchives] = useState<BarcodeArchiveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState<'qr' | 'barcode'>('qr');
  const [barcodeFormat, setBarcodeFormat] = useState('code128');
  const [category, setCategory] = useState('Depo');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [embedInQr, setEmbedInQr] = useState(false);
  const [hideItemsOnLabel, setHideItemsOnLabel] = useState(false);

  // New Item Input Fields
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  // Preview / Print Modal
  const [previewRecord, setPreviewRecord] = useState<BarcodeArchiveRecord | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number>(384); // 384 = 57mm, 576 = 80mm
  const [previewShowItems, setPreviewShowItems] = useState<boolean>(true); // true = açık liste, false = gizli mod

  // Load archives
  const refreshList = () => {
    setArchives(barcodeArchiveStorage.getAll());
  };

  useEffect(() => {
    refreshList();
  }, []);

  // Eğer dışarıdan taranan bir kod ile doğrudan arşiv oluşturulmak istenirse
  useEffect(() => {
    if (initialCodeToCreate) {
      handleOpenCreateModal(initialCodeToCreate);
      if (onClearInitialCode) onClearInitialCode();
    }
  }, [initialCodeToCreate]);

  // Open Create Modal
  const handleOpenCreateModal = (prefillCode?: string) => {
    setEditingId(null);
    setTitle('');
    const genCode = prefillCode || `ARC-${Math.floor(1000 + Math.random() * 9000)}`;
    setCode(genCode);
    setCodeType(genCode.length > 15 || genCode.startsWith('ARC') ? 'qr' : 'barcode');
    setBarcodeFormat('code128');
    setCategory('Depo');
    setLocation('');
    setNote('');
    setItems([]);
    setEmbedInQr(false);
    setHideItemsOnLabel(false);
    setNewItemName('');
    setNewItemQty('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: BarcodeArchiveRecord) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setCode(rec.code);
    setCodeType(rec.codeType);
    setBarcodeFormat(rec.barcodeFormat || 'code128');
    setCategory(rec.category || 'Depo');
    setLocation(rec.location || '');
    setNote(rec.note || '');
    setItems(rec.items || []);
    setEmbedInQr(false);
    setHideItemsOnLabel(rec.hideItemsOnLabel || false);
    setNewItemName('');
    setNewItemQty('');
    setIsModalOpen(true);
  };

  // Add Item to current modal
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ArchiveItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      quantity: newItemQty.trim() || undefined,
      checked: true
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemQty('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  // Save Modal Record
  const handleSaveRecord = async (printAfterSave: boolean = false) => {
    if (!title.trim()) {
      alert('Lütfen bir koli / kutu başlığı girin.');
      return;
    }

    let finalCode = code.trim();
    if (!finalCode) {
      finalCode = `ARC-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // QR içerisine gömülü mod seçildiyse kodu gömülü string yap
    if (codeType === 'qr' && embedInQr) {
      finalCode = barcodeArchiveStorage.generateEmbeddedQrString({
        id: editingId || `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
        code: finalCode,
        codeType: 'qr',
        title: title.trim(),
        category,
        location: location.trim(),
        note: note.trim(),
        items
      });
    }

    const saved = barcodeArchiveStorage.save({
      id: editingId || undefined,
      title: title.trim(),
      code: finalCode,
      codeType,
      barcodeFormat: codeType === 'barcode' ? barcodeFormat : undefined,
      category,
      location: location.trim(),
      note: note.trim(),
      items,
      hideItemsOnLabel
    });

    setIsModalOpen(false);
    refreshList();

    if (printAfterSave) {
      handleOpenPrintPreview(saved);
    }
  };

  // Delete Record
  const handleDeleteRecord = (id: string, titleStr: string) => {
    if (confirm(`"${titleStr}" arşivini silmek istediğinize emin misiniz?`)) {
      barcodeArchiveStorage.delete(id);
      refreshList();
    }
  };

  // Toggle item checked in record card
  const handleToggleItemCheck = (archiveId: string, itemId: string) => {
    barcodeArchiveStorage.toggleItemChecked(archiveId, itemId);
    refreshList();
  };

  // Print Preview
  const handleOpenPrintPreview = async (
    rec: BarcodeArchiveRecord,
    width: number = previewWidth,
    showItems?: boolean
  ) => {
    setPreviewRecord(rec);
    setPreviewWidth(width);
    const effectiveShow = showItems !== undefined ? showItems : !rec.hideItemsOnLabel;
    setPreviewShowItems(effectiveShow);
    setIsRenderingPreview(true);
    const dataUrl = await renderArchiveLabel(rec, { width, showItemsList: effectiveShow });
    setPreviewDataUrl(dataUrl);
    setIsRenderingPreview(false);
  };

  const handlePrintLabel = () => {
    if (!previewDataUrl) return;
    if (onDirectPrint) {
      onDirectPrint(previewDataUrl);
    } else {
      onGenerate(previewDataUrl);
    }
  };

  // Filtered List
  const filteredArchives = archives.filter(rec => {
    const matchesCat = selectedCategory === 'Tümü' || rec.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.code.toLowerCase().includes(q) ||
      (rec.location && rec.location.toLowerCase().includes(q)) ||
      rec.items.some(it => it.name.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Üst Bilgi ve Eylem Kartı */}
      <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Boxes size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Koli & İçerik Arşivi
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
              {archives.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Koli içeriğini barkodlayın; kamerayla okutunca içindekiler anında listelensin.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {onSwitchToScan && (
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToScan}
              className="h-7 sm:h-8 px-2.5 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg gap-1 cursor-pointer"
            >
              <Camera size={13} /> Tara
            </Button>
          )}

          <Button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="h-7 sm:h-8 px-3 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg gap-1 cursor-pointer shadow-2xs"
          >
            <Plus size={13} /> Yeni Ekle
          </Button>
        </div>
      </div>

      {/* Arama ve Kategori Filtreleri */}
      <div className="space-y-2">
        <div className="relative flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Koli adı, barkod no veya içerik eşyası ara..."
              className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {onSwitchToScan && (
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToScan}
              className="h-8 px-2 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg gap-1 shrink-0 cursor-pointer"
              title="Kamerayla Barkod Okutarak Bul"
            >
              <Camera size={13} />
              <span className="hidden sm:inline">Okut</span>
            </Button>
          )}
        </div>

        {/* Kategori Hapları */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[10.5px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Arşiv Kartları Listesi */}
      {filteredArchives.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <Package size={28} className="mx-auto text-slate-400" />
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {searchTerm ? 'Aramanıza uygun içerik arşivi bulunamadı.' : 'Henüz içerik arşivi oluşturulmadı.'}
          </div>
          <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
            Koli veya saklama kutularınızın içeriğini kaydetmek için yukarıdaki "+ Yeni İçerik Arşivi Ekle" butonuna tıklayın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredArchives.map(rec => {
            const checkedCount = rec.items.filter(i => i.checked).length;
            const isFullChecked = rec.items.length > 0 && checkedCount === rec.items.length;

            return (
              <Card
                key={rec.id}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-2 flex flex-col justify-between hover:border-teal-300 dark:hover:border-teal-700 transition-all"
              >
                <div className="space-y-1.5">
                  {/* Başlık ve Rozetler */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                          {rec.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {rec.category}
                        </span>
                        {rec.location && (
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center gap-0.5">
                            <MapPin size={9} /> {rec.location}
                          </span>
                        )}
                        {rec.hideItemsOnLabel && (
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-0.5" title="Sade barkod modunda basılır">
                            <Barcode size={9} /> Sade Barkod
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                        {rec.codeType === 'qr' ? <QrCode size={11} /> : <Barcode size={11} />}
                        {rec.code.slice(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* İçindekiler Listesi (Onay Kutulu Özet) */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-500 uppercase">
                      <span>İçindekiler ({rec.items.length} Kalem)</span>
                      <span>
                        {checkedCount}/{rec.items.length} Hazır
                      </span>
                    </div>

                    {rec.items.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic">İçerik öğesi eklenmemiş.</div>
                    ) : (
                      <div className="space-y-0.5 max-h-24 overflow-y-auto pr-0.5">
                        {rec.items.map(it => (
                          <div
                            key={it.id}
                            onClick={() => handleToggleItemCheck(rec.id, it.id)}
                            className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-[10.5px] group select-none"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {it.checked ? (
                                <CheckSquare size={12} className="text-teal-600 shrink-0" />
                              ) : (
                                <Square size={12} className="text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`truncate ${
                                  it.checked
                                    ? 'text-slate-700 dark:text-slate-200'
                                    : 'text-slate-400 line-through'
                                }`}
                              >
                                {it.name}
                              </span>
                            </div>
                            {it.quantity && (
                              <span className="text-[9.5px] text-slate-400 font-mono shrink-0 ml-1">
                                {it.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {rec.note && (
                    <p className="text-[9.5px] text-slate-400 italic truncate">
                      Not: {rec.note}
                    </p>
                  )}
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(rec.updatedAt).toLocaleDateString('tr-TR')}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpenPrintPreview(rec)}
                      className="h-7 text-[10.5px] px-2 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg gap-1 cursor-pointer"
                      title="Termal Etiket Önizle & Yazdır"
                    >
                      <Printer size={11} /> Etiket Yazdır
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleOpenEditModal(rec)}
                      className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit2 size={11} />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeleteRecord(rec.id, rec.title)}
                      className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 OLUŞTURMA / DÜZENLEME MODALI */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3.5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Package size={15} className="text-teal-600" />
                <span>{editingId ? 'İçerik Arşivini Düzenle' : 'Yeni İçerik Arşivi & Koli Tanımla'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form Alanları */}
            <div className="space-y-2.5">
              {/* Koli / Kutu Başlığı */}
              <div>
                <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                  Koli / Kutu Başlığı *
                </Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: Koli #104 - Ofis Kırtasiye & Rulolar"
                  className="h-8 text-xs font-bold mt-1"
                />
              </div>

              {/* Kod Türü & Kod Numarası */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                    Kod Türü
                  </Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <Button
                      type="button"
                      variant={codeType === 'qr' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeType('qr')}
                      className={`h-7 text-xs font-bold rounded-lg cursor-pointer ${
                        codeType === 'qr' ? 'bg-teal-600 text-white' : ''
                      }`}
                    >
                      <QrCode size={12} className="mr-1" /> QR Kod
                    </Button>
                    <Button
                      type="button"
                      variant={codeType === 'barcode' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeType('barcode')}
                      className={`h-7 text-xs font-bold rounded-lg cursor-pointer ${
                        codeType === 'barcode' ? 'bg-teal-600 text-white' : ''
                      }`}
                    >
                      <Barcode size={12} className="mr-1" /> Barkod
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                      Kod Değeri / No
                    </Label>
                    <button
                      type="button"
                      onClick={() => setCode(`ARC-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[9.5px] font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Yeni Kod Üret
                    </button>
                  </div>
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Örn: ARC-1004 veya 8690..."
                    className="h-7 text-xs font-mono font-bold mt-1"
                  />
                </div>
              </div>

              {/* Kategori & Lokasyon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                    Kategori
                  </Label>
                  <Select value={category} onValueChange={v => v && setCategory(v)}>
                    <SelectTrigger className="h-7 text-xs font-bold mt-1">
                      <SelectValue placeholder="Kategori Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                    Lokasyon / Raf (Opsiyonel)
                  </Label>
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Örn: Depo Raf B-3"
                    className="h-7 text-xs mt-1"
                  />
                </div>
              </div>

              {/* İÇİNDEKİLER LİSTESİ YÖNETİMİ */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 uppercase flex items-center gap-1">
                    <Boxes size={12} className="text-teal-600" /> İçerik Eşyaları ({items.length})
                  </span>
                  <span className="text-[9.5px] text-slate-400">Kolinin içine konan ürünler</span>
                </div>

                {/* Yeni Öğe Ekleme Satırı */}
                <form onSubmit={handleAddItem} className="flex items-center gap-1.5">
                  <Input
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="Eşya / Ürün adı (Örn: Makas)"
                    className="h-7 text-xs flex-1 bg-white dark:bg-slate-900"
                  />
                  <Input
                    value={newItemQty}
                    onChange={e => setNewItemQty(e.target.value)}
                    placeholder="Adet (Örn: 2 Adet)"
                    className="h-7 text-xs w-24 font-mono bg-white dark:bg-slate-900"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer shrink-0"
                  >
                    <Plus size={13} />
                  </Button>
                </form>

                {/* Eklenen Öğeler Listesi */}
                {items.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-1">
                    Henüz eşya eklenmedi. Yukarıdaki kutudan isim ve adet yazıp ekleyin.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-[9.5px] font-bold text-slate-400 font-mono w-4">
                            {idx + 1}.
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {it.name}
                          </span>
                          {it.quantity && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              {it.quantity}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ek Not */}
              <div>
                <Label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                  Özel Not (Opsiyonel)
                </Label>
                <Input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Örn: Kırılabilir eşyalar, ıslak zeminden uzak tutun."
                  className="h-7 text-xs mt-1"
                />
              </div>

              {/* Etiket Baskı Türü Seçimi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Varsayılan Etiket Türü:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHideItemsOnLabel(true)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      hideItemsOnLabel
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-100'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold flex items-center gap-1">
                      <Barcode size={12} /> Sade Barkod
                    </div>
                    <div className="text-[9.5px] opacity-80 mt-0.5">
                      Sadece barkod, numara ve özel arşiv işareti basılır.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHideItemsOnLabel(false)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      !hideItemsOnLabel
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-100'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold flex items-center gap-1">
                      <CheckSquare size={12} /> İçerikli Barkod
                    </div>
                    <div className="text-[9.5px] opacity-80 mt-0.5">
                      Başlık, barkod ve koli içindeki ürün listesi basılır.
                    </div>
                  </button>
                </div>
              </div>

              {/* QR için Taşınabilir Gömülü Veri Opsiyonu */}
              {codeType === 'qr' && (
                <label className="flex items-center gap-2 p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={embedInQr}
                    onChange={e => setEmbedInQr(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <div className="text-[10px] text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      Evrensel Taşınabilir QR Kodu Yap
                    </span>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400">
                      İçerik listesi doğrudan QR içine de kodlanır; böylece başka bir cihazdan tarandığında bile liste anında açılır.
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Modal Alt Butonları */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-8 text-xs font-bold rounded-lg cursor-pointer"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={() => handleSaveRecord(false)}
                className="h-8 text-xs font-bold bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg cursor-pointer"
              >
                Kaydet
              </Button>
              <Button
                type="button"
                onClick={() => handleSaveRecord(true)}
                className="h-8 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer size={13} /> Kaydet & Etiket Yazdır
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖨️ TERMAL ETİKET ÖNİZLEME & BASKI MODALI */}
      {/* ========================================================================= */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <Printer size={15} className="text-teal-600" />
                <span>Koli & Envanter Etiketi Baskı Önizleme</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Seçenekler: Ölçü ve Gizlilik Modu */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Genişlik Seçimi */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">Kağıt Ölçüsü:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(previewRecord, 384, previewShowItems)}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md cursor-pointer transition-colors ${
                      previewWidth === 384
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    57mm Standart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(previewRecord, 576, previewShowItems)}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md cursor-pointer transition-colors ${
                      previewWidth === 576
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    80mm Geniş
                  </button>
                </div>
              </div>

              {/* Etiket Baskı Türü */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70 dark:border-slate-750">
                <span className="font-bold text-slate-600 dark:text-slate-400">Etiket Türü:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(previewRecord, previewWidth, false)}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                      !previewShowItems
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="Sadece barkod, numara ve özel arşiv işareti basılır"
                  >
                    <Barcode size={11} /> Sade Barkod
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(previewRecord, previewWidth, true)}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                      previewShowItems
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="Koli başlığı, barkod ve içindekiler listesi basılır"
                  >
                    <CheckSquare size={11} /> İçerikli Barkod
                  </button>
                </div>
              </div>

              <p className="text-[9.5px] text-slate-500 dark:text-slate-400">
                {!previewShowItems
                  ? 'Sade Mod: Sadece barkod, numara ve özel arşiv işareti basılır.'
                  : 'İçerikli Mod: Koli başlığı, barkod ve içindekiler listesi basılır.'}
              </p>
            </div>

            {/* Termal Kağıt Görünümü */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-center min-h-[220px]">
              {isRenderingPreview ? (
                <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
                  <RefreshCw size={18} className="animate-spin text-teal-600" />
                  <span>Etiket hazırlanıyor...</span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Termal Etiket"
                  className="max-h-[340px] object-contain shadow-md border border-slate-300 dark:border-slate-700 bg-white"
                />
              ) : (
                <span className="text-xs text-red-500">Etiket oluşturulamadı.</span>
              )}
            </div>

            {/* Butonlar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewRecord(null)}
                className="h-8 text-xs font-bold rounded-lg cursor-pointer"
              >
                Kapat
              </Button>
              <Button
                type="button"
                onClick={handlePrintLabel}
                disabled={!previewDataUrl}
                className="h-8 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer size={13} /> Yazıcıya Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
