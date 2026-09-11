import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThermalTemplate, LabelCategory, LabelDimension, ThermalPaperStyle, CommunityTemplate } from '../template-archive/types';
import { INITIAL_TEMPLATES } from '../template-archive/data/templates';
import { INITIAL_COMMUNITY_TEMPLATES } from '../template-archive/data/communityTemplates';
import { STANDARD_DIMENSIONS, CATEGORY_METADATA } from '../template-archive/data/dimensions';
import { CategoryFilter } from '../template-archive/components/CategoryFilter';
import { TemplateCard } from '../template-archive/components/TemplateCard';
import { CommunityCard } from '../template-archive/components/CommunityCard';
import { CommunityDetailModal } from '../template-archive/components/CommunityDetailModal';
import { ShareCommunityModal } from '../template-archive/components/ShareCommunityModal';
import { TemplateEditorModal } from '../template-archive/components/TemplateEditorModal';
import { CustomTemplateCreatorModal } from '../template-archive/components/CustomTemplateCreatorModal';
import { BackupModal } from '../template-archive/components/BackupModal';
import { ThermalTemplateRenderer } from '../template-archive/components/ThermalTemplateRenderer';
import { Button } from '../components/ui/button';
import { captureElementToDataUrl } from '../utils/dom-capture';
import {
  ArrowLeft,
  Search,
  Plus,
  Heart,
  Archive,
  Store,
  Compass,
  Grid2X2,
  Grid3X3,
  Share2,
  Sparkles,
  Layers,
  ArrowUp
} from 'lucide-react';

const LOCAL_STORAGE_KEY_CUSTOM = 'iprint_store_custom_templates';
const LOCAL_STORAGE_KEY_FAVORITES = 'iprint_store_favorites';
const LOCAL_STORAGE_KEY_COMMUNITY = 'iprint_community_templates_v1';
const LOCAL_STORAGE_KEY_COMMUNITY_LIKES = 'iprint_community_likes_v1';

export interface TemplateStoreViewProps {
  onPreviewAndPrint: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack: () => void;
  onSelectWidth?: (w: number) => void;
}

export function TemplateStoreView({
  onPreviewAndPrint,
  onBack,
  onSelectWidth
}: TemplateStoreViewProps) {
  // Navigation tab: 'store' (Official templates) or 'explore' (Community Pinterest stream)
  const [activeTab, setActiveTab] = useState<'store' | 'explore'>('store');

  // Columns layout for Keşfet / Explore: 2 or 3
  const [exploreColumns, setExploreColumns] = useState<2 | 3>(2);

  // Standard and Custom Templates
  const [standardTemplates] = useState<ThermalTemplate[]>(INITIAL_TEMPLATES);
  const [userCustomTemplates, setUserCustomTemplates] = useState<ThermalTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<LabelCategory>('all');
  const [selectedDimension, setSelectedDimension] = useState<LabelDimension>(STANDARD_DIMENSIONS[0]); // 57mm default
  const [paperStyle, setPaperStyle] = useState<ThermalPaperStyle>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Community Stream State
  const [communityTemplates, setCommunityTemplates] = useState<CommunityTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMMUNITY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_COMMUNITY_TEMPLATES;
  });

  const [communityLikes, setCommunityLikes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMMUNITY_LIKES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [activeTemplate, setActiveTemplate] = useState<ThermalTemplate | null>(null);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState<CommunityTemplate | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Quick print hidden renderer ref
  const quickPrintRef = useRef<HTMLDivElement | null>(null);
  const [quickPrintTemplate, setQuickPrintTemplate] = useState<ThermalTemplate | null>(null);

  // Scroll-to-top button state & handler
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load custom templates & favorites on mount
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM);
      if (savedCustom) {
        setUserCustomTemplates(JSON.parse(savedCustom));
      }
      const savedFavs = localStorage.getItem(LOCAL_STORAGE_KEY_FAVORITES);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error('LocalStorage load error:', e);
    }
  }, []);

  // Save custom templates
  const saveCustomTemplates = (list: ThermalTemplate[]) => {
    setUserCustomTemplates(list);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM, JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  };

  // Toggle favorite
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

  // Toggle community post like
  const handleToggleCommunityLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCommunityLikes((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_COMMUNITY_LIKES, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Share new community template
  const handleShareNewPost = (newPost: CommunityTemplate) => {
    const updated = [newPost, ...communityTemplates];
    setCommunityTemplates(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMMUNITY, JSON.stringify(updated));
    } catch {}
    setActiveTab('explore');
  };

  // Add customized copy of template
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
    saveCustomTemplates(updated);
  };

  // Add brand new custom template
  const handleAddCustomTemplate = (newTpl: ThermalTemplate) => {
    const updated = [newTpl, ...userCustomTemplates];
    saveCustomTemplates(updated);
    setActiveCategory('custom');
  };

  // Restore backup
  const handleRestoreBackup = (importedList: ThermalTemplate[]) => {
    saveCustomTemplates(importedList);
  };

  // All combined templates
  const allTemplates = useMemo(() => {
    return [...userCustomTemplates, ...standardTemplates];
  }, [userCustomTemplates, standardTemplates]);

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allTemplates.length,
      favorites: favorites.length,
      pro: 0,
      ecommerce_shipping: 0,
      product: 0,
      receipt: 0,
      inventory: 0,
      shipping: 0,
      warning: 0,
      organization: 0,
      stickers: 0,
      notes: 0,
      custom: userCustomTemplates.length
    };

    allTemplates.forEach((tpl) => {
      if (counts[tpl.category] !== undefined) {
        counts[tpl.category]++;
      }
    });

    return counts;
  }, [allTemplates, userCustomTemplates, favorites]);

  // Filtered templates for Store tab
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      // Favorites filter
      if ((showFavoritesOnly || activeCategory === 'favorites') && !favorites.includes(tpl.id)) {
        return false;
      }

      // Category filter
      if (activeCategory === 'favorites') {
        // already checked above
      } else if (activeCategory === 'custom') {
        if (!tpl.isCustom && tpl.category !== 'custom') return false;
      } else if (activeCategory !== 'all' && tpl.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tpl.title.toLowerCase().includes(q);
        const matchDesc = tpl.description.toLowerCase().includes(q);
        const matchTags = tpl.tags.some((t) => t.toLowerCase().includes(q));
        const matchValues = Object.values(tpl.defaultData).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchDesc && !matchTags && !matchValues) {
          return false;
        }
      }

      return true;
    });
  }, [allTemplates, activeCategory, showFavoritesOnly, favorites, searchQuery]);

  // Reset selected card when active category, tab or search changes
  useEffect(() => {
    setSelectedCardId(null);
  }, [activeCategory, searchQuery, activeTab, showFavoritesOnly]);

  // Filtered templates for Community / Keşfet tab
  const filteredCommunityTemplates = useMemo(() => {
    return communityTemplates.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = item.template.title.toLowerCase().includes(q);
      const matchCaption = (item.caption || '').toLowerCase().includes(q);
      const matchUsername = item.author.username.toLowerCase().includes(q);
      const matchDisplay = item.author.displayName.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchCaption || matchUsername || matchDisplay || matchTags;
    });
  }, [communityTemplates, searchQuery]);

  // Open editor modal for specific template
  const handleOpenEditor = (template: ThermalTemplate) => {
    setActiveTemplate(template);
    setIsEditorOpen(true);
  };

  // Quick print handler
  const handleQuickPrint = async (template: ThermalTemplate) => {
    const targetWidthMm = template.recommendedWidthMm || selectedDimension.widthMm || 57;
    setQuickPrintTemplate(template);
    setTimeout(async () => {
      if (quickPrintRef.current) {
        try {
          const dataUrl = await captureElementToDataUrl(quickPrintRef.current, {
            scale: 1,
            backgroundColor: paperStyle === 'invert' ? '#050505' : '#ffffff'
          });
          if (onSelectWidth) {
            const pxMap: Record<number, number> = { 57: 384, 80: 576, 100: 800, 150: 1200 };
            onSelectWidth(pxMap[targetWidthMm] || Math.round((targetWidthMm / 57) * 384));
          }
          onPreviewAndPrint(dataUrl, template.title, targetWidthMm);
        } catch (e) {
          console.error('Quick print capture error:', e);
          window.print();
        }
      } else {
        window.print();
      }
    }, 120);
  };

  // Handle direct print from modal
  const handleDirectPrintFromModal = (dataUrl: string, title: string, widthMm?: number) => {
    const targetWidthMm = widthMm || selectedDimension.widthMm || 57;
    if (onSelectWidth) {
      const pxMap: Record<number, number> = { 57: 384, 80: 576, 100: 800, 150: 1200 };
      onSelectWidth(pxMap[targetWidthMm] || Math.round((targetWidthMm / 57) * 384));
    }
    onPreviewAndPrint(dataUrl, title, targetWidthMm);
    setIsEditorOpen(false);
  };

  // Bağımsız Sayfa: Şablon düzenleme açıkken arka plandaki mağaza görünmez ve kaydırılmaz
  if (isEditorOpen && activeTemplate) {
    return (
      <TemplateEditorModal
        template={activeTemplate}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveAsCustom={handleSaveAsCustom}
        onPrintDirect={handleDirectPrintFromModal}
        initialWidthMm={selectedDimension.widthMm}
        initialPaperStyle={paperStyle}
        isFavorite={favorites.includes(activeTemplate.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto w-full">
      {/* 1. Üst Bar: MAĞAZA İÇİN AYRI, KEŞFET İÇİN ULTRA-MİNİMALİST */}
      {activeTab === 'store' ? (
        /* MAĞAZA ÜST BARI */
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              {/* Sol Kısım: Geri Butonu */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="rounded-xl h-9 px-3 gap-1.5 font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Geri</span>
                </Button>
              </div>

              {/* Sağ Kısım: Tek Satırda Favoriler, Yedek ve Özel Şablon Butonları */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`rounded-xl h-9 px-2.5 sm:px-3 gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    showFavoritesOnly
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                  <span className="hidden xs:inline">Favoriler</span>
                  <span>({favorites.length})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="rounded-xl h-9 px-2.5 sm:px-3 text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Yedekle / Geri Yükle"
                >
                  <Archive size={14} />
                  <span className="hidden sm:inline">Yedek</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-3 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Özel Şablon</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mağaza Arama & Filtreleme Barı */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-xs space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Arama Kutusu */}
              <div className="sm:col-span-6 relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Şablon ara (örn: kargo, çikolata, sabun, uyarı, barkod)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Rulo Boyutu Seçici */}
              <div className="sm:col-span-3">
                <select
                  value={selectedDimension.id}
                  onChange={(e) => {
                    const found = STANDARD_DIMENSIONS.find((d) => d.id === e.target.value);
                    if (found) setSelectedDimension(found);
                  }}
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STANDARD_DIMENSIONS.map((dim) => (
                    <option key={dim.id} value={dim.id}>
                      🏷️ {dim.name} ({dim.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Baskı Stili */}
              <div className="sm:col-span-3">
                <select
                  value={paperStyle}
                  onChange={(e) => setPaperStyle(e.target.value as ThermalPaperStyle)}
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="standard">✨ Standart Termal</option>
                  <option value="vintage">📜 Vintage Dokulu</option>
                  <option value="dither">🖨️ Tramlı Dither</option>
                  <option value="invert">⬛ Negatif (Ters)</option>
                </select>
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <CategoryFilter
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                categoryCounts={categoryCounts}
              />
            </div>
          </div>
        </>
      ) : (
        /* KEŞFET İÇİN TEK, ULTRA-MİNİMALİST ÜST PANEL */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2.5">
            {/* Arama Alanı */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Keşfet'te ara (mum, kahve, kupon, @kullanıcı)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Minimalist 2/3 Kolon İkon Seçici */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setExploreColumns(2)}
                title="2 Kolon"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                  exploreColumns === 2
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Grid2X2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setExploreColumns(3)}
                title="3 Kolon"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                  exploreColumns === 3
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Grid3X3 size={15} />
              </button>
            </div>
          </div>

          {/* Minimalist Bilgilendirme Çubuğu */}
          <div className="flex items-center justify-between px-1 pt-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Compass size={12} className="text-purple-500" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Keşfet Akışı</span>
              <span>•</span>
              <span>{filteredCommunityTemplates.length} Paylaşım</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Detay için dokunun
            </span>
          </div>
        </div>
      )}

      {/* 2. İÇERİK ALANI: MAĞAZA VEYA KEŞFET AKIŞI */}
      {activeTab === 'store' ? (
        /* MAĞAZA (RESMİ ŞABLONLAR) GÖRÜNÜMÜ */
        <>
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {showFavoritesOnly
                  ? '❤️ Favori Şablonlarım'
                  : activeCategory === 'all'
                  ? 'Tüm Şablonlar'
                  : CATEGORY_METADATA.find((c) => c.id === activeCategory)?.label || 'Şablonlar'}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredTemplates.length} Sonuç
              </span>
            </div>
          </div>

          {/* 2'li Izgara Dizilimi (Seçilen Kart Tam Genişler) */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start transition-all duration-500 ease-out">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  dimension={selectedDimension}
                  paperStyle={paperStyle}
                  isFavorite={favorites.includes(template.id)}
                  isSelected={selectedCardId === template.id}
                  onToggleSelect={(id) => setSelectedCardId(prev => prev === id ? null : id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={handleOpenEditor}
                  onQuickPrint={handleQuickPrint}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Şablon bulunamadı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Filtreleri sıfırlayabilir veya özel termal şablon ekleyebilirsiniz.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setShowFavoritesOnly(false);
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  Filtreleri Sıfırla
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Özel Şablon Ekle
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* KEŞFET (TOPLULUK VE KULLANICI PAYLAŞIMLARI AKIŞI) GÖRÜNÜMÜ */
        <div className="space-y-3">
          {/* Minimalist Pinterest Waterfall Grid (2 Kolon veya 3 Kolon) */}
          {filteredCommunityTemplates.length > 0 ? (
            <div
              className={`gap-3 sm:gap-4 space-y-3 sm:space-y-4 ${
                exploreColumns === 2
                  ? 'columns-2 sm:columns-2 md:columns-2 lg:columns-3'
                  : 'columns-2 sm:columns-3 md:columns-3 lg:columns-4'
              }`}
            >
              {filteredCommunityTemplates.map((item) => (
                <CommunityCard
                  key={item.id}
                  item={item}
                  dimension={selectedDimension}
                  paperStyle={paperStyle}
                  isLiked={communityLikes.includes(item.id)}
                  onToggleLike={(id, e) => handleToggleCommunityLike(id, e)}
                  onSelect={(selected) => setSelectedCommunityItem(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
                <Compass size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aradığınız paylaşım bulunamadı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Arama teriminizi değiştirerek tekrar deneyebilirsiniz.
              </p>
              {searchQuery && (
                <div className="pt-1 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="rounded-xl text-xs font-bold"
                  >
                    Aramayı Temizle
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. ALT KISMA MİNİ MENÜ (AKTİF OLAN AÇILIR, DİĞERİ MİNİMAL İKON GÖRÜNÜR) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeTab === 'store'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Şablon Mağazası"
        >
          <Store size={15} className="shrink-0" />
          {activeTab === 'store' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Mağaza</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('explore')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeTab === 'explore'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative'
          }`}
          title="Keşfet"
        >
          <Compass size={15} className="shrink-0" />
          {activeTab === 'explore' ? (
            <span className="flex items-center gap-1 whitespace-nowrap animate-in fade-in duration-200">
              <span>Keşfet</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-500" />
          )}
        </button>
      </div>

      {/* Gizli Hızlı Baskı Elementi */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        {quickPrintTemplate && (
          <div ref={quickPrintRef}>
            <ThermalTemplateRenderer
              template={quickPrintTemplate}
              data={quickPrintTemplate.defaultData}
              widthMm={quickPrintTemplate.recommendedWidthMm || selectedDimension.widthMm || 57}
              heightMm={quickPrintTemplate.heightMm || selectedDimension.heightMm}
              paperStyle={paperStyle}
              scale={1}
            />
          </div>
        )}
      </div>

      {/* Keşfet Detay & Kullanıcı Bilgisi Modalı */}
      {selectedCommunityItem && (
        <CommunityDetailModal
          item={selectedCommunityItem}
          isOpen={Boolean(selectedCommunityItem)}
          onClose={() => setSelectedCommunityItem(null)}
          dimension={selectedDimension}
          paperStyle={paperStyle}
          isLiked={communityLikes.includes(selectedCommunityItem.id)}
          onToggleLike={(id) => handleToggleCommunityLike(id)}
          onOpenEditor={(tpl) => handleOpenEditor(tpl)}
          onPreviewAndPrint={(dataUrl, title, widthMm) => {
            handleDirectPrintFromModal(dataUrl, title, widthMm);
          }}
          isFavorite={favorites.includes(selectedCommunityItem.template.id)}
          onToggleFavorite={(id) => handleToggleFavorite(id)}
        />
      )}

      {/* Tasarım Paylaş Modalı */}
      {isShareModalOpen && (
        <ShareCommunityModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShareNewPost}
          availableTemplates={allTemplates}
        />
      )}

      {/* Özel Şablon Ekleme Modalı */}
      {isCreateModalOpen && (
        <CustomTemplateCreatorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAddCustomTemplate={handleAddCustomTemplate}
        />
      )}

      {/* Yedekleme & Geri Yükleme Modalı */}
      {isBackupModalOpen && (
        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          templates={standardTemplates}
          userCustomTemplates={userCustomTemplates}
          favorites={favorites}
          onRestoreBackup={handleRestoreBackup}
        />
      )}

      {/* Yukarı Çık Yüzen Butonu (Scroll to Top) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:right-6 z-50 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer border border-indigo-400/30 backdrop-blur-md"
          title="Sayfa Başına Dön"
          aria-label="Sayfa Başına Dön"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

export default TemplateStoreView;
