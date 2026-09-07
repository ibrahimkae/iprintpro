import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { PrintHistoryItem, SavedDraftItem } from '../types';
import { historyStorage } from '../lib/history-storage';
import { 
  History, 
  Trash2, 
  Printer, 
  Download, 
  Bookmark, 
  Calendar, 
  Layers, 
  FileText, 
  ImageIcon, 
  QrCode, 
  Tag, 
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  X,
  ArrowLeft,
  Check,
  Edit3
} from 'lucide-react';
import { Input } from './ui/input';

interface PrintHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReprint: (dataUrl: string, title: string) => void;
  onSelectDraft?: (draft: SavedDraftItem) => void;
}

export const PrintHistoryModal: React.FC<PrintHistoryModalProps> = ({
  isOpen,
  onOpenChange,
  onSelectReprint,
  onSelectDraft
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'drafts'>('history');
  const [historyItems, setHistoryItems] = useState<PrintHistoryItem[]>([]);
  const [draftItems, setDraftItems] = useState<SavedDraftItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = () => {
    setHistoryItems(historyStorage.getHistory());
    setDraftItems(historyStorage.getDrafts());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    historyStorage.deleteHistoryItem(id);
    setHistoryItems(historyStorage.getHistory());
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Tüm yazdırma geçmişini silmek istediğinize emin misiniz?')) {
      historyStorage.clearHistory();
      setHistoryItems([]);
    }
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    historyStorage.deleteDraft(id);
    setDraftItems(historyStorage.getDrafts());
  };

  const handleDownload = (dataUrl: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${title.replace(/\s+/g, '_')}_iprint.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'image':
        return { icon: ImageIcon, label: 'Görsel', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' };
      case 'document':
        return { icon: FileText, label: 'Belge', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' };
      case 'template':
        return { icon: Tag, label: 'Şablon', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' };
      case 'collage':
        return { icon: Layers, label: 'Kolaj', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' };
      case 'tools':
        return { icon: QrCode, label: 'Barkod/QR', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' };
      default:
        return { icon: FileText, label: 'Metin', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const filteredHistory = historyItems.filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrafts = draftItems.filter(draft => 
    !searchQuery || draft.title.toLowerCase().includes(searchQuery.toLowerCase()) || draft.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col"
        >
          {/* Header Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Geri Dön"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <History size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                    Yazdırma Geçmişi & Taslaklar
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Tüm geçmiş baskılar ve kayıtlı taslaklarınız
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Kapat"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Sub-header Controls Container */}
          <div className="max-w-4xl mx-auto w-full px-4 pt-3 pb-2 space-y-2.5">
            {/* Tab switchers */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 gap-1 border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <History size={15} /> Yazdırma Geçmişi ({historyItems.length})
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'drafts'
                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Bookmark size={15} /> Kayıtlı Taslaklar ({draftItems.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'history' ? 'Yazdırma geçmişinde başlığa göre ara...' : 'Kayıtlı taslaklarda ara...'}
                className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-xl w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="max-w-4xl mx-auto w-full pb-8">
              {activeTab === 'history' && (
                <div>
                  {filteredHistory.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-slate-400">
                        <Clock size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {searchQuery ? 'Aramanıza uygun yazdırma kaydı bulunamadı' : 'Henüz yazdırılmış bir içerik yok'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {searchQuery ? 'Farklı bir anahtar kelime ile aramayı deneyin.' : 'Termal yazıcıdan bastığınız tüm belgeler ve etiketler burada saklanır ve tek dokunuşla yeniden basılabilir.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredHistory.map((item) => {
                        const badge = getTypeBadge(item.type);
                        const BadgeIcon = badge.icon;
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 bg-slate-50/90 dark:bg-slate-900/90 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 transition-all group shadow-xs hover:border-teal-400 dark:hover:border-teal-700"
                          >
                            {/* Card Top: Preview + Details */}
                            <div 
                              className="flex items-start gap-3 min-w-0 cursor-pointer"
                              onClick={() => {
                                onSelectReprint(item.previewDataUrl, item.title);
                                onOpenChange(false);
                              }}
                            >
                              {/* Thermal Preview Box */}
                              <div className="w-16 h-18 bg-white dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                <img
                                  src={item.previewDataUrl}
                                  alt={item.title}
                                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                                />
                              </div>

                              {/* Text & Meta */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.color}`}>
                                    <BadgeIcon size={11} /> {badge.label}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    {item.width}×{item.height}px
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 break-words leading-tight hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                  {item.title || 'İsimsiz Baskı'}
                                </h4>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                  <Calendar size={11} /> {formatTime(item.timestamp)}
                                </p>
                              </div>
                            </div>

                            {/* Card Bottom: Action Toolbar */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  title="Görseli İndir (PNG)"
                                  onClick={(e) => handleDownload(item.previewDataUrl, item.title, e)}
                                  className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 gap-1 font-medium"
                                >
                                  <Download size={13} />
                                  <span className="hidden sm:inline">İndir</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  title="Geçmişten Sil"
                                  onClick={(e) => handleDeleteHistory(item.id, e)}
                                  className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg gap-1"
                                >
                                  <Trash2 size={13} />
                                  <span className="hidden sm:inline">Sil</span>
                                </Button>
                              </div>

                              <Button
                                size="sm"
                                onClick={() => {
                                  onSelectReprint(item.previewDataUrl, item.title);
                                  onOpenChange(false);
                                }}
                                className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-xs shrink-0 cursor-pointer"
                              >
                                <Printer size={13} /> Tekrar Yazdır
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'drafts' && (
                <div>
                  {filteredDrafts.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-purple-500">
                        <Bookmark size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {searchQuery ? 'Aramanıza uygun kayıtlı taslak bulunamadı' : 'Henüz kayıtlı taslak bulunmuyor'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Şablon Stüdyosu, Metin Editörü veya Pankart ekranından "Taslak Kaydet" butonuna basarak çalışmalarınızı kaydedebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredDrafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="p-3.5 bg-slate-50/90 dark:bg-slate-900/90 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 transition-all shadow-xs hover:border-purple-400 dark:hover:border-purple-700 group"
                        >
                          {/* Card Top: Preview + Details */}
                          <div 
                            className="flex items-start gap-3 min-w-0 cursor-pointer"
                            onClick={() => {
                              if (onSelectDraft) {
                                onSelectDraft(draft);
                                onOpenChange(false);
                              } else if (draft.previewDataUrl) {
                                onSelectReprint(draft.previewDataUrl, draft.title);
                                onOpenChange(false);
                              }
                            }}
                          >
                            {draft.previewDataUrl ? (
                              <div className="w-16 h-18 bg-white dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                <img
                                  src={draft.previewDataUrl}
                                  alt={draft.title}
                                  className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-18 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                                <Bookmark size={22} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                  <Sparkles size={11} /> {draft.category.toUpperCase()}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 break-words leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                {draft.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                <Calendar size={11} /> {formatTime(draft.timestamp)}
                              </p>
                            </div>
                          </div>

                          {/* Card Bottom: Action Toolbar */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Taslağı Sil"
                              onClick={(e) => handleDeleteDraft(draft.id, e)}
                              className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg gap-1"
                            >
                              <Trash2 size={13} />
                              <span className="hidden sm:inline">Sil</span>
                            </Button>

                            <div className="flex items-center gap-1.5">
                              {draft.previewDataUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    onSelectReprint(draft.previewDataUrl!, draft.title);
                                    onOpenChange(false);
                                  }}
                                  className="h-8 px-3 rounded-lg text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <Printer size={13} /> Önizle & Bas
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (onSelectDraft) {
                                    onSelectDraft(draft);
                                    onOpenChange(false);
                                  } else if (draft.previewDataUrl) {
                                    onSelectReprint(draft.previewDataUrl, draft.title);
                                    onOpenChange(false);
                                  }
                                }}
                                className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold gap-1.5 shadow-xs shrink-0 cursor-pointer"
                              >
                                <Edit3 size={13} /> Düzenle & Aç
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          {activeTab === 'history' && historyItems.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 sticky bottom-0 z-10">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Toplam {historyItems.length} kayıtlı baskı</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllHistory}
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl h-8 font-bold gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Tüm Geçmişi Temizle
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
