import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { type ResolvedBlock } from '../lib/template-variables';
import {
  ArrowLeft, ShoppingCart, LayoutGrid, HeartPulse, Camera,
  Gamepad2, Palette, Music, ShieldCheck, Luggage
} from 'lucide-react';

import { ApplicationsHubCatalog, type SubAppTabId } from '../components/ApplicationsHubCatalog';
import { TrendyolOrdersStudio, buildShippingBlocks, buildPackingBlocks, packageKey } from '../components/TrendyolOrdersStudio';
import { AssemblyManualStudio } from '../components/AssemblyManualStudio';
import { EmergencyHealthCard } from '../components/EmergencyHealthCard';
import { PolaroidGenerator } from '../components/PolaroidGenerator';
import { MiniGamesPrintView } from '../components/MiniGamesPrintView';
import { PixelCanvasStudio } from '../components/PixelCanvasStudio';
import { ChiptuneMusicStudio } from '../components/ChiptuneMusicStudio';
import { CryptoPaperWalletStudio } from '../components/CryptoPaperWalletStudio';
import { LuggageBagTagStudio } from '../components/LuggageBagTagStudio';

export { buildShippingBlocks, buildPackingBlocks, packageKey };

export interface OrdersViewProps {
  apiBase: string;
  pageWidth: number;
  onPrintShippingLabel: (blocks: ResolvedBlock[], label: string) => Promise<void>;
  onPrintPackingSlip: (blocks: ResolvedBlock[], label: string) => Promise<void>;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack: () => void;
  initialTab?: SubAppTabId;
}

export function OrdersView(props: OrdersViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubAppTabId>(props.initialTab || 'hub');

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-3 pb-16"
    >
      {/* Top Bar with Back and Contextual Controls */}
      {activeSubTab === 'hub' && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={props.onBack}
            className="rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 dark:text-slate-200 text-xs h-8 cursor-pointer"
          >
            <ArrowLeft size={14} className="mr-1.5" /> Geri
          </Button>
        </div>
      )}

      {/* Hub (Katalog Kutucukları) */}
      {activeSubTab === 'hub' && (
        <ApplicationsHubCatalog onSelectApp={(tabId) => setActiveSubTab(tabId)} />
      )}

      {/* Sub-App: Pazaryeri / Trendyol Siparişleri */}
      {activeSubTab === 'orders' && (
        <TrendyolOrdersStudio
          apiBase={props.apiBase}
          pageWidth={props.pageWidth}
          onPrintShippingLabel={props.onPrintShippingLabel}
          onPrintPackingSlip={props.onPrintPackingSlip}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Kurulum Şeması & Montaj Kılavuzu Stüdyosu */}
      {activeSubTab === 'assembly' && (
        <AssemblyManualStudio
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Luggage / Bag Smart Tag */}
      {activeSubTab === 'luggage' && (
        <LuggageBagTagStudio
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Crypto Paper Wallet */}
      {activeSubTab === 'crypto' && (
        <CryptoPaperWalletStudio
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Chiptune 8-Bit */}
      {activeSubTab === 'chiptune' && (
        <ChiptuneMusicStudio
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
            else if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: 1-Bit Pixel Canvas */}
      {activeSubTab === 'pixelcanvas' && (
        <PixelCanvasStudio
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Acil Sağlık Kartı ICE */}
      {activeSubTab === 'ice' && (
        <EmergencyHealthCard
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Polaroid Generator */}
      {activeSubTab === 'polaroid' && (
        <PolaroidGenerator
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}

      {/* Sub-App: Mini Games */}
      {activeSubTab === 'games' && (
        <MiniGamesPrintView
          pageWidth={props.pageWidth}
          onPrintImage={(dataUrl, title, widthMm) => {
            if (props.onPreviewAndPrint) props.onPreviewAndPrint(dataUrl, title, widthMm);
            else if (props.onDirectPrint) props.onDirectPrint(dataUrl, title, widthMm);
          }}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveSubTab('hub')}
        />
      )}
    </motion.div>
  );
}
