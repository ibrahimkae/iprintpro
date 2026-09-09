import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  FileText, 
  Bookmark, 
  Trash2, 
  Store,
  Heart,
  Search,
  Printer,
  Edit3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import { type ProTemplate } from '../lib/pro-templates';
import { historyStorage } from '../lib/history-storage';
import { SavedDraftItem } from '../types';
import { ThermalTemplate } from '../template-archive/types';
import { INITIAL_TEMPLATES } from '../template-archive/data/templates';
import { STANDARD_DIMENSIONS } from '../template-archive/data/dimensions';
import { TemplateCard } from '../template-archive/components/TemplateCard';
import { TemplateEditorModal } from '../template-archive/components/TemplateEditorModal';

const LOCAL_STORAGE_KEY_CUSTOM = 'iprint_store_custom_templates';
const LOCAL_STORAGE_KEY_FAVORITES = 'iprint_store_favorites';

interface TemplateLibraryProps {
  pageWidth: number;
  onSelect: (template: any) => void;
  onPreviewAndPrint: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onOpenPro?: (t: ProTemplate) => void;
  onSelectWidth?: (w: number) => void;
  onLoadDraft?: (draft: SavedDraftItem) => void;
  onSelectDraft?: (draft: SavedDraftItem) => void;
  activeDraft?: { id: string; title: string; category: string } | null;
  onClearActiveDraft?: () => void;
  onNavigateStore?: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ 
  pageWidth, 
  onPreviewAndPrint,
  onDirectPrint,
  onLoadDraft,
  onSelectDraft,
  activeDraft,
  onClearActiveDraft,
  onNavigateStore
}) => {
  const handleDraftSelect = onSelectDraft || onLoadDraft;
  const [viewMode, setViewMode] = useState<'favorites' | 'drafts'>('favorites');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Favorites & Store Templates State
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userCustomTemplates, setUserCustomTemplates] = useState<ThermalTemplate[]>([]);
  const [activeEditorTemplate, setActiveEditorTemplate] = useState<ThermalTemplate | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [favSearchQuery, setFavSearchQuery] = useState('');

  // Drafts State
  const [draftsList, setDraftsList] = useState<SavedDraftItem[]>(() => historyStorage.getDrafts());

  const refreshData = () => {
    try {
      const savedFavs = localStorage.getItem(LOCAL_STORAGE_KEY_FAVORITES);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM);
      if (savedCustom) {
        setUserCustomTemplates(JSON.parse(savedCustom));
      }
    } catch (e) {
      console.error('LocalStorage load error:', e);
    }
    setDraftsList(historyStorage.getDrafts());
  };

  useEffect(() => {
    refreshData();
  }, [viewMode]);

  // Combine all store templates to resolve favorites
  const allStoreTemplates = useMemo(() => {
    return [...userCustomTemplates, ...INITIAL_TEMPLATES];
  }, [userCustomTemplates]);

  // Favorited templates list
  const favoriteTemplates = useMemo(() => {
    return allStoreTemplates.filter((t) => {
      const isFav = favorites.includes(t.id);
      if (!isFav) return false;
      if (favSearchQuery.trim()) {
        const q = favSearchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allStoreTemplates, favorites, favSearchQuery]);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_FAVORITES, JSON.stringify(next));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
      return next;
    });
  };

  const handleOpenTemplateEditor = (template: ThermalTemplate) => {
    setActiveEditorTemplate(template);
    setIsEditorModalOpen(true);
  };

  const handleDeleteDraftItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu taslağı silmek istediğinize emin misiniz?')) {
      historyStorage.deleteDraft(id);
      setDraftsList(historyStorage.getDrafts());
      if (activeDraft && activeDraft.id === id && onClearActiveDraft) {
        onClearActiveDraft();
      }
    }
  };

  const handleDirectPrintFromModal = (dataUrl: string, title: string, widthMm?: number) => {
    if (onDirectPrint) {
      onDirectPrint(dataUrl, title, widthMm);
    } else {
      onPreviewAndPrint(dataUrl, title, widthMm);
    }
    setIsEditorModalOpen(false);
  };

  const handleSaveAsCustom = (
    baseTemplate: ThermalTemplate,
    customTitle: string,
    customData: Record<string, any>
  ) => {
    const newTpl: ThermalTemplate = {
      ...baseTemplate,
      id: `custom-${Date.now()}`,
      title: customTitle,
      defaultData: customData,
      isCustom: true,
      category: 'custom',
      createdAt: Date.now()
    };
    const updated = [newTpl, ...userCustomTemplates];
    setUserCustomTemplates(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  };

  // Bağımsız Sayfa: Şablon düzenleme açıkken kütüphane arka planda görünmez ve kaydırılmaz
  if (isEditorModalOpen && activeEditorTemplate) {
    return (
      <TemplateEditorModal
        template={activeEditorTemplate}
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSaveAsCustom={handleSaveAsCustom}
        onPrintDirect={handleDirectPrintFromModal}
        initialWidthMm={pageWidth <= 400 ? 57 : pageWidth <= 600 ? 80 : 100}
        initialPaperStyle="standard"
        isFavorite={favorites.includes(activeEditorTemplate.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <div className="space-y-3 pb-24 max-w-7xl mx-auto w-full">
      {/* 1. FAVORİLER TAB */}
      {viewMode === 'favorites' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header & Search */}
          <div className="flex items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Favori şablonlarım arasında ara..."
                value={favSearchQuery}
                onChange={(e) => setFavSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              />
              {favSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFavSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {onNavigateStore && (
              <button
                type="button"
                onClick={onNavigateStore}
                className="h-8 w-8 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer shrink-0 transition-colors"
                title="Şablon Mağazası"
              >
                <Store size={15} />
              </button>
            )}
          </div>

          {/* Favorites Visual Grid (2'li Izgara - Seçilen Tam Genişler) */}
          {favoriteTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start transition-all duration-500 ease-out">
              {favoriteTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  dimension={STANDARD_DIMENSIONS[0]}
                  paperStyle="standard"
                  isFavorite={true}
                  isSelected={selectedCardId === template.id}
                  onToggleSelect={(id) => setSelectedCardId(prev => prev === id ? null : id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={handleOpenTemplateEditor}
                  onQuickPrint={(tpl) => handleOpenTemplateEditor(tpl)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-8 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-xs border border-rose-100 dark:border-rose-900/60">
                <Heart size={26} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Henüz Favori Şablonunuz Yok
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Şablon Mağazası'nda beğendiğiniz etiket ve form tasarımlarındaki ❤️ simgesine dokunarak favorilerinize ekleyebilir, buradan tek dokunuşla hızlıca yazdırabilirsiniz.
              </p>
              {onNavigateStore && (
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={onNavigateStore}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-xs gap-1.5 cursor-pointer"
                  >
                    <Store size={14} />
                    <span>Şablon Mağazasını Aç</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. TASLAKLAR TAB */}
      {viewMode === 'drafts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5">
              <Bookmark size={14} /> Kaydedilen Taslaklarım ({draftsList.length})
            </h3>
            {draftsList.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">Tam boy önizleme ve düzenleme</span>
            )}
          </div>

          {draftsList.length === 0 ? (
            <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto my-6 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                <Bookmark size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Henüz Kaydedilmiş Bir Taslağınız Yok</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Metin Editörü veya Şablon Stüdyosu'nda tasarladığınız çalışmaları "Taslak Kaydet" butonu ile kaydedip burada listeleyebilirsiniz.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftsList.map((draft) => {
                const isSelected = activeDraft?.id === draft.id;
                const formattedDate = new Date(draft.timestamp || Date.now()).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <Card
                    key={draft.id}
                    onClick={() => handleDraftSelect && handleDraftSelect(draft)}
                    className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden border ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header with Full Title & Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className={`p-2.5 rounded-xl text-xs font-bold shrink-0 mt-0.5 ${
                            draft.category === 'editor' || draft.category === 'text'
                              ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                              : draft.category === 'banner'
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                              : draft.category === 'tools' || draft.category === 'qr'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                          }`}>
                            <FileText size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Full Title (No truncate) */}
                            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-snug break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {draft.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {draft.category === 'editor' || draft.category === 'text'
                                  ? 'Metin Editörü' 
                                  : draft.category === 'banner'
                                  ? 'Bant / Etiket'
                                  : draft.category === 'tools' || draft.category === 'qr'
                                  ? 'Barkod / QR'
                                  : 'Şablon Tasarımı'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${draft.title}" taslağını silmek istediğinize emin misiniz?`)) {
                              handleDeleteDraftItem(draft.id, e);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0 cursor-pointer"
                          title="Taslağı Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Large Roomy Preview Snippet */}
                      {draft.previewDataUrl ? (
                        <div className="min-h-[140px] max-h-[220px] rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center overflow-hidden p-3 shadow-inner">
                          <img
                            src={draft.previewDataUrl}
                            alt={draft.title}
                            className="max-h-[190px] max-w-full object-contain [image-rendering:pixelated] rounded-none shadow-xs border border-slate-200 dark:border-slate-800 bg-white"
                          />
                        </div>
                      ) : draft.payload?.text ? (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800 max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                          {draft.payload.text}
                        </div>
                      ) : null}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (draft.previewDataUrl) {
                            onPreviewAndPrint(draft.previewDataUrl, draft.title);
                          } else if (handleDraftSelect) {
                            handleDraftSelect(draft);
                          }
                        }}
                        className="flex-1 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold gap-1.5 justify-center shadow-none cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Önizle & Bas</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDraftSelect && handleDraftSelect(draft);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 justify-center shadow-xs cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Düzenle & Aç</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ALT KISMA MİNİ MENÜ (AKTİF OLAN AÇILIR, DİĞERLERİ MİNİMAL İKON GÖRÜNÜR) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        {/* Favoriler Butonu */}
        <button
          type="button"
          onClick={() => setViewMode('favorites')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            viewMode === 'favorites'
              ? 'px-3.5 bg-rose-500 text-white shadow-md shadow-rose-500/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative'
          }`}
          title={`Favoriler (${favorites.length})`}
        >
          <Heart size={15} fill={viewMode === 'favorites' ? 'currentColor' : 'none'} className="shrink-0" />
          {viewMode === 'favorites' ? (
            <span className="flex items-center gap-1 whitespace-nowrap animate-in fade-in duration-200">
              <span>Favoriler</span>
              <span className="text-[10px] opacity-85 font-mono font-bold">({favorites.length})</span>
            </span>
          ) : (
            favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )
          )}
        </button>

        {/* Taslaklarım Butonu */}
        <button
          type="button"
          onClick={() => setViewMode('drafts')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            viewMode === 'drafts'
              ? 'px-3.5 bg-indigo-600 text-white shadow-md shadow-indigo-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative'
          }`}
          title={`Taslaklarım (${draftsList.length})`}
        >
          <Bookmark size={15} className="shrink-0" />
          {viewMode === 'drafts' ? (
            <span className="flex items-center gap-1 whitespace-nowrap animate-in fade-in duration-200">
              <span>Taslaklarım</span>
              <span className="text-[10px] opacity-85 font-mono font-bold">({draftsList.length})</span>
            </span>
          ) : (
            draftsList.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )
          )}
        </button>

        {onNavigateStore && (
          <>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
            {/* Mağaza Butonu */}
            <button
              type="button"
              onClick={onNavigateStore}
              className="h-9 w-9 rounded-full text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Şablon Mağazası"
            >
              <Store size={15} className="shrink-0" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
