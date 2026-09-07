import React, { useState } from 'react';
import { ThermalTemplate } from '../types';
import { downloadBackupFile } from '../utils/backup';
import { X, Archive, Download, Upload, CheckCircle2, ShieldCheck, FileArchive } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ThermalTemplate[];
  userCustomTemplates: ThermalTemplate[];
  favorites: string[];
  onRestoreBackup: (importedTemplates: ThermalTemplate[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  templates,
  userCustomTemplates,
  favorites,
  onRestoreBackup
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await downloadBackupFile(templates, userCustomTemplates, favorites);
      setSuccessMsg('Zip yedek başarıyla oluşturuldu ve indirildi.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.templates || parsed.userCustomTemplates) {
          const list = parsed.userCustomTemplates || parsed.templates || [];
          onRestoreBackup(list);
          setSuccessMsg(`Yedekten ${list.length} şablon başarıyla geri yüklendi!`);
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      } catch (err) {
        alert('Geçerli bir JSON yedek dosyası seçiniz.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] text-white w-full h-[100dvh] sm:h-auto sm:max-w-lg rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-[#2A2A2A] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Archive size={18} />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm sm:text-base">Şablon Arşivi & ZIP Yedekleme</h2>
              <p className="text-[11px] sm:text-xs text-gray-400">Proje ve şablon verilerinizi güvenle yedekleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#252525]">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* Backup info box */}
          <div className="p-4 bg-[#222] border border-[#2A2A2A] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-200">
              <span className="flex items-center gap-1.5">
                <FileArchive size={16} className="text-blue-400" />
                Mevcut Arşiv Durumu
              </span>
              <span className="font-mono bg-[#181818] border border-[#2A2A2A] text-blue-400 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {templates.length + userCustomTemplates.length} Şablon
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-gray-400 font-medium border-t border-[#2A2A2A]">
              <div>Standart Şablonlar: <strong className="text-white">{templates.length}</strong></div>
              <div>Özel Tasarımlar: <strong className="text-white">{userCustomTemplates.length}</strong></div>
              <div>Favoriler: <strong className="text-white">{favorites.length}</strong></div>
              <div>Proje Yedek Klasörü: <strong className="text-blue-400 font-mono">/backup/</strong></div>
            </div>
          </div>

          {/* Download Zip Action */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all transform active:scale-98"
            >
              <Download size={16} />
              {isExporting ? 'Yedek Paketi Hazırlanıyor...' : 'Tüm Şablonları ZIP Olarak İndir'}
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Tüm şablon parametreleri, barkod kuralları ve özelleştirmeler .zip formatında paketlenir.
            </p>
          </div>

          {/* Restore from JSON */}
          <div className="pt-3 border-t border-[#2A2A2A] space-y-2">
            <label className="text-xs font-bold text-gray-300 block">
              Daha Önceki Yedekten Geri Yükle (JSON / Arşiv)
            </label>
            <label className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-[#3A3A3A] hover:border-blue-500 bg-[#222] hover:bg-[#282828] text-gray-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload size={16} className="text-blue-400" />
              Yedek Dosyası Seç (JSON)
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1E1E1E] border-t border-[#2A2A2A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#252525]"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
