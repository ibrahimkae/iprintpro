import React from 'react';
import { LabelCategory } from '../types';
import { CATEGORY_METADATA } from '../data/dimensions';
import {
  LayoutGrid,
  Heart,
  ShoppingBag,
  Tag,
  Receipt,
  Barcode,
  Truck,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckSquare,
  Bookmark,
  Zap
} from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: LabelCategory;
  onSelectCategory: (cat: LabelCategory) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'favorites':
        return <Heart size={13} fill="currentColor" />;
      case 'pro':
        return <Zap size={13} className="text-amber-500 fill-amber-500" />;
      case 'ecommerce_shipping':
        return <ShoppingBag size={13} />;
      case 'product':
        return <Tag size={13} />;
      case 'receipt':
        return <Receipt size={13} />;
      case 'inventory':
        return <Barcode size={13} />;
      case 'shipping':
        return <Truck size={13} />;
      case 'warning':
        return <AlertTriangle size={13} />;
      case 'organization':
        return <Layers size={13} />;
      case 'stickers':
        return <Sparkles size={13} />;
      case 'notes':
        return <CheckSquare size={13} />;
      case 'custom':
        return <Bookmark size={13} />;
      case 'all':
      default:
        return <LayoutGrid size={13} />;
    }
  };

  const categoriesWithFavorites = [
    { id: 'all', label: 'Tümü' },
    { id: 'favorites', label: 'Favoriler' },
    ...CATEGORY_METADATA.filter((c) => c.id !== 'all')
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none no-print">
      <div className="flex items-center gap-2 min-w-max">
        {categoriesWithFavorites.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          const isFavTab = cat.id === 'favorites';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as LabelCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
                isSelected
                  ? isFavTab
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 border border-rose-500'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500'
                  : isFavTab
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : isFavTab
                    ? 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
