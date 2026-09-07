import JSZip from 'jszip';
import { ThermalTemplate, BackupArchive } from '../types';

export const createProjectZipBackup = async (
  templates: ThermalTemplate[],
  userCustomTemplates: ThermalTemplate[],
  favorites: string[]
): Promise<Blob> => {
  const zip = new JSZip();

  const backupData: BackupArchive = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    templatesCount: templates.length + userCustomTemplates.length,
    templates: templates,
    userCustomTemplates: userCustomTemplates,
    favorites: favorites
  };

  // Add JSON data
  zip.file('termal_sablon_yedek.json', JSON.stringify(backupData, null, 2));

  // Add a readable README in Turkish
  zip.file(
    'BENIOKU_YEDEK_BILGISI.txt',
    `Termal Barkod & Etiket Şablon Arşivi Yedek Paketi
Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
Toplam Şablon Sayısı: ${backupData.templatesCount}

Bu zip arşivi tüm standart ve kullanıcıya özel tasarlanmış 57mm - 150mm termal yazıcı şablonlarını, barkod formatlarını ve favorileri içerir.`
  );

  return await zip.generateAsync({ type: 'blob' });
};

export const downloadBackupFile = async (
  templates: ThermalTemplate[],
  userCustomTemplates: ThermalTemplate[],
  favorites: string[]
) => {
  const blob = await createProjectZipBackup(templates, userCustomTemplates, favorites);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `termal_sablon_arsivi_yedek_${dateStr}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
