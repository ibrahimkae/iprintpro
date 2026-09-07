import React, { useState } from 'react';
import { ThermalTemplate, LabelCategory } from '../types';
import { X, Plus, Sparkles, Check, Tag } from 'lucide-react';

interface CustomTemplateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomTemplate: (template: ThermalTemplate) => void;
}

export const CustomTemplateCreatorModal: React.FC<CustomTemplateCreatorModalProps> = ({
  isOpen,
  onClose,
  onAddCustomTemplate
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LabelCategory>('product');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('özel, barkod, 57mm');
  const [recommendedWidthMm, setRecommendedWidthMm] = useState<number>(57);
  const [barcodeText, setBarcodeText] = useState('CUSTOM-89104');
  const [qrText, setQrText] = useState('https://mybusiness.com');
  const [item1, setItem1] = useState('Özel Ürün Tanımı');
  const [item2, setItem2] = useState('Parti No: BATCH-01');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTemplate: ThermalTemplate = {
      id: `custom-tpl-${Date.now()}`,
      title: title.trim(),
      category: category,
      description: description.trim() || 'Kullanıcı tarafından oluşturulmuş özel dinamik termal etiket.',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      recommendedWidthMm: recommendedWidthMm,
      isCustom: true,
      createdAt: Date.now(),
      fields: [
        { key: 'title', label: 'Etiket Başlığı', type: 'text', defaultValue: title },
        { key: 'description', label: 'Açıklama / Not', type: 'textarea', defaultValue: item1 },
        { key: 'details', label: 'Detay / Alt Satır', type: 'text', defaultValue: item2 },
        { key: 'barcodeVal', label: 'Barkod Kodu', type: 'barcode', defaultValue: barcodeText },
        { key: 'qrCodeVal', label: 'QR Kod Bağlantısı', type: 'qrcode', defaultValue: qrText }
      ],
      defaultData: {
        title: title,
        description: item1,
        details: item2,
        barcodeVal: barcodeText,
        qrCodeVal: qrText
      }
    };

    onAddCustomTemplate(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] text-white w-full h-[100dvh] sm:h-auto sm:max-w-lg rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-[#2A2A2A] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm sm:text-base">Yeni Termal Şablon Oluştur</h2>
              <p className="text-[11px] sm:text-xs text-gray-400">Kendi özel etiket formatınızı Bento galeriye ekleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#252525]">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 pb-16 sm:pb-5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-300">Şablon Adı *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Butik Kahve Kavanoz Etiketi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LabelCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="product">Ürün Etiketleri</option>
                <option value="receipt">Sipariş & Fiş</option>
                <option value="inventory">Envanter & Barkod</option>
                <option value="shipping">Kargo & Gönderi</option>
                <option value="warning">Uyarı & Güvenlik</option>
                <option value="stickers">Çıkartmalar</option>
                <option value="notes">Not & Hatırlatıcı</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">Varsayılan Genişlik</label>
              <select
                value={recommendedWidthMm}
                onChange={(e) => setRecommendedWidthMm(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                <option value="57">57 mm (Mini Termal)</option>
                <option value="80">80 mm (POS / Fiş)</option>
                <option value="100">100 mm (10 cm)</option>
                <option value="150">150 mm (15 cm)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-300">Kısa Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: 250g kavanozlar için parti no ve barkodlu etiket"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-300">Ana İçerik / Açıklama</label>
            <textarea
              rows={2}
              value={item1}
              onChange={(e) => setItem1(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">Varsayılan Barkod</label>
              <input
                type="text"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-blue-500/40 bg-blue-950/20 text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">Varsayılan QR Link</label>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-500/40 bg-indigo-950/20 text-indigo-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-300">Etiketler (Virgülle ayırın)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Check size={14} />
              Şablonu Oluştur & Ekle
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
