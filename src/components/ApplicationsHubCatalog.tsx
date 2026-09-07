import React from 'react';
import { Card } from './ui/card';
import {
  Sparkles, ShoppingCart, ChevronRight, Palette, HeartPulse,
  Camera, Gamepad2, Music, ShieldCheck, Luggage, PlusCircle, Wrench
} from 'lucide-react';

export type SubAppTabId =
  | 'hub'
  | 'orders'
  | 'assembly'
  | 'ice'
  | 'polaroid'
  | 'games'
  | 'pixelcanvas'
  | 'chiptune'
  | 'crypto'
  | 'luggage';

interface ApplicationsHubCatalogProps {
  onSelectApp: (tabId: SubAppTabId) => void;
}

export function ApplicationsHubCatalog({ onSelectApp }: ApplicationsHubCatalogProps) {
  return (
    <div className="space-y-4 py-1">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-bold text-indigo-300">
            <Sparkles size={12} /> Özel Uygulamalar & Baskı Modülleri Kataloğu
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Uygulamalar & Etiket Merkezi
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            İhtiyacınıza uygun uygulamayı aşağıdaki kutucuklardan seçerek hemen basıma başlayabilirsiniz. Yeni modüller sürekli eklenmektedir.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Tile 1: Pazaryeri & Trendyol Siparişleri */}
        <Card
          onClick={() => onSelectApp('orders')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-orange-500/60 dark:hover:border-orange-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              Pazaryeri & Kargo
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
            Pazaryeri
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Trendyol API entegrasyonu, kargo etiketi, paket fişi ve toplu sipariş yazdırımı.
          </p>
        </Card>

        {/* Tile 1.5: Kurulum Şeması & Montaj Kılavuzu Stüdyosu */}
        <Card
          onClick={() => onSelectApp('assembly')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-teal-500/60 dark:hover:border-teal-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Wrench size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              Şema & Montaj Kılavuzu
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
            Kılavuz Oluşturma
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Çizgisel CAD/IKEA tarzı şemalar, ayarlanabilir görsel kutuları, 2'li vida donanım listeleri ve video QR kodlu profesyonel montaj kılavuzları.
          </p>
        </Card>

        {/* Tile 2: Modül 2: 1-Bit Piksel Çizim & Mikro Tipografi */}
        <Card
          onClick={() => onSelectApp('pixelcanvas')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Palette size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Modül 2 • Piksel Çizim
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            1-Bit Piksel Tuval & Mikro Tipografi
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            384px tuval, 1x1-4x4 fırçalar, resim rötuş dithering ve 5x7 monokrom mikro font damgası.
          </p>
        </Card>

        {/* Tile 3: Acil Sağlık Kartı ICE */}
        <Card
          onClick={() => onSelectApp('ice')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-red-500/60 dark:hover:border-red-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <HeartPulse size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              Medikal & Güvenlik
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex items-center gap-1.5">
            Acil Sağlık Kartı (ICE)
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Kan grubu, kronik hastalıklar, ilaçlar, alerjiler ve 2 acil yakın numaralı QR kodlu medikal kart.
          </p>
        </Card>

        {/* Tile 4: Mini Polaroid & Canlı Kamera */}
        <Card
          onClick={() => onSelectApp('polaroid')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Canlı Kamera & Polaroid
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
            Retro Polaroid & Canlı Kamera Stüdyosu
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Canlı kamera vizörü, deklanşör flaşı, 6 gerçekçi Polaroid çerçevesi, el yazısı notlar ve Atkinson dither baskı.
          </p>
        </Card>

        {/* Tile 5: Termal Oyunlar & Bulmaca */}
        <Card
          onClick={() => onSelectApp('games')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-purple-500/60 dark:hover:border-purple-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Gamepad2 size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Eğlence & Öğrenme
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
            Termal Zeka & Mini Oyunlar
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Kasa şifresi, IQ matrisi, 9x9 Sudoku, labirent, Jumble, kelime avı, mini çapraz ve 5 mikro fark.
          </p>
        </Card>

        {/* Tile 6: 8-Bit Retro Chiptune & QR Müzik */}
        <Card
          onClick={() => onSelectApp('chiptune')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Music size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Ses & Web Audio API
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            8-Bit Retro Chiptune & QR Müzik
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            300 baytlık osilatör data: URL yükü. Kamera tarar taramaz internetsiz 15sn nostaljik melodi çalar.
          </p>
        </Card>

        {/* Tile 7: Kripto Soğuk Cüzdan & Paper Wallet */}
        <Card
          onClick={() => onSelectApp('crypto')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Air-Gap & Kripto
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
            Kripto Soğuk Cüzdan (Paper Wallet)
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Bitcoin, Ethereum, Solana, Doge & 12/24 kelimelik BIP-39 tohum kartı. 100% çevrimdışı, mühür ve katlama çizgili fiziksel cüzdan.
          </p>
        </Card>

        {/* Tile 8: Bavul & Çanta Kayıp Önleme İletişim Kartı */}
        <Card
          onClick={() => onSelectApp('luggage')}
          className="group relative p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-sky-500/60 dark:hover:border-sky-500/60 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Luggage size={24} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Seyahat & Bagaj
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
            Bavul & Çanta Kayıp Önleme Kartı
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            "Beni kaybettiyseniz arayın", uluslararası telefon formatı, WhatsApp mesajı başlatan QR kod ve IATA uçuş standartlarında termal bagaj etiketi.
          </p>
        </Card>

        {/* Tile 9: Gelecek Modüller (Dashed Card) */}
        <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <PlusCircle size={20} className="animate-pulse" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Gelecek Yeni Modüller
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg">
            Sadakat kartları, ajanda ve kütüphane barkodları, yeni e-ticaret pazaryerleri yakında buraya eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
