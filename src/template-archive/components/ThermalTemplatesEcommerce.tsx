import React from 'react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { QRCodeRenderer } from './QRCodeRenderer';
import {
  IconTrendyolLogo,
  IconHepsiburadaLogo,
  IconAmazonLogo,
  IconHepsiJetLogo,
  IconSuratKargoLogo,
  IconYurticiKargoLogo,
  IconArasKargoLogo,
  IconMngKargoLogo,
  IconPttKargoLogo,
  IconKolayGelsinLogo,
  IconFragileGlass,
  IconThisSideUp,
  IconTwoArrowsUp,
  IconGiftBowRibbon
} from './ThermalIcons';
import { AlertTriangle, Package, Check, Truck, User, MapPin, Phone, Calendar, ShoppingBag, ShieldCheck } from 'lucide-react';

interface TemplateRendererProps {
  id: string;
  data: Record<string, any>;
  widthMm: number;
}

export const ThermalTemplatesEcommerce: React.FC<TemplateRendererProps> = ({ id, data, widthMm }) => {
  const isCompact = widthMm <= 57;
  const isMedium = widthMm > 57 && widthMm <= 80;
  const isLarge = widthMm >= 100;
  const ratio = isCompact ? 1 : isMedium ? 1.15 : 1.35;

  switch (id) {
    // ==========================================
    // 1. TRENDYOL RESMİ KARGO & SİPARİŞ ÇIKTISI (10x15 CM / 100x150 MM)
    // ==========================================
    case 'tpl-trendyol-official-shipping-10x15':
      return (
        <div className="p-3 sm:p-4 bg-white text-black font-clean flex flex-col justify-between h-full space-y-2 sm:space-y-3 select-none text-[11px] leading-snug">
          {/* Üst Uyarı Kutusu (Görsel 1'deki tam metin) */}
          <div className="border border-black p-1.5 sm:p-2 rounded-xs flex items-center gap-1.5 sm:gap-2 bg-gray-50/50">
            <AlertTriangle size={16 * ratio} className="shrink-0 text-black stroke-[2.2]" />
            <div className="text-[9px] sm:text-[9.5px] font-semibold leading-tight">
              {data.marketplaceWarning ||
                'Kargo şirketinin dikkatine, bu bir trendyol.com gönderisidir. Trendyol anlaşmasına uygun işlem yapabilirsiniz.'}
            </div>
          </div>

          {/* Logo & Kargo Şirketi Başlığı */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5 pt-0.5">
            <IconTrendyolLogo size={30 * ratio} />
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-bold text-gray-700">Taşıyıcı:</span>
              <IconSuratKargoLogo size={22 * ratio} />
            </div>
          </div>

          {/* Orta Kısım: Alıcı Bilgileri & Kargo Barkodu (57mm'de dikey istiflenir, 80-100mm'de 2 kolon) */}
          <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-12 gap-3'} border border-black p-2.5 rounded-xs`}>
            {/* Sol / Üst: Alıcı Bilgileri */}
            <div className={`${isCompact ? 'col-span-1 border-b border-black/30 pb-2' : 'col-span-6 pr-2 border-r border-black/40'} space-y-1.5`}>
              <div className="font-bold text-[11.5px] border-b border-black/20 pb-0.5 uppercase tracking-wide">
                Alıcı Bilgileri
              </div>
              <div className="space-y-1 text-[10px] sm:text-[10.5px]">
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Sipariş No</span>
                  <span className="font-mono font-bold">: {data.orderNumber || '2391425900'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Ad Soyad</span>
                  <span className="font-bold uppercase">: {data.recipientName || 'ALİ DAĞTAŞ'}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Adres</span>
                  <span className="leading-tight">: {data.recipientAddress || 'Erenköy MH. Şelale Sok. YASER AP. No:17/1 Selçuklu/ konya'}</span>
                </div>
                <div className="pl-18 text-[9.5px] font-bold uppercase text-gray-700">
                  {data.recipientDistrictCity || 'Erenköy Mah • Selçuklu / KONYA'}
                </div>
                <div className="flex pt-0.5 border-t border-black/10">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Çıkış Şubesi</span>
                  <span className="font-semibold">: {data.originBranch || 'Buğday Şube'}</span>
                </div>
              </div>
            </div>

            {/* Sağ / Alt: Kargo Barkodu */}
            <div className={`${isCompact ? 'col-span-1 pt-1' : 'col-span-6 pl-1'} flex flex-col justify-between items-center text-center`}>
              <div className="font-bold text-[11px] uppercase tracking-wide text-left w-full border-b border-black/20 pb-0.5">
                Kargo Barkodu
              </div>
              <div className="my-auto py-1.5 flex flex-col items-center justify-center w-full">
                <BarcodeRenderer
                  value={data.barcodeVal || '7270012031149210'}
                  widthMm={widthMm}
                  height={(isCompact ? 44 : isLarge ? 64 : 52) * ratio}
                  width={(isCompact ? 1.4 : isLarge ? 1.9 : 1.6) * ratio}
                  displayValue={true}
                />
              </div>
              <div className="text-[8.5px] font-mono font-bold text-gray-600">
                Takip: {data.barcodeVal || '7270012031149210'}
              </div>
            </div>
          </div>

          {/* Alt Kısım: Ürün Bilgileri Çeki Listesi Tablosu */}
          <div className="border border-black p-2 rounded-xs space-y-1.5">
            <div className="font-bold text-[10.5px] uppercase tracking-wider flex items-center justify-between border-b border-black/20 pb-0.5">
              <span>Ürün Bilgileri</span>
              <span className="text-[9.5px] font-mono text-gray-600">Paket: 1 / 1</span>
            </div>

            {/* Tablo Başlıkları & Satır */}
            <div className="flex items-start gap-2 text-[9.5px]">
              <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {data.packageItemCount || '1'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-bold leading-tight text-[10px]">
                  {data.productName || 'Tourneo Courier Arka Koltuk 2+1 Oto Koltuk Kılıfı Siyah Ön Arka Tam Takım Uyumlu TourneoCourier-2+1, one size'}
                </div>
                <div className={`grid ${isCompact ? 'grid-cols-2 gap-1' : 'grid-cols-5 gap-1'} text-[9px] font-mono bg-gray-100/70 p-1 border border-black/10`}>
                  <div>
                    <span className="text-gray-500 block text-[7.5px] uppercase">Adet</span>
                    <span className="font-bold">{data.productQty || '1 Adet'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[7.5px] uppercase">Renk / Beden</span>
                    <span className="font-bold">{data.productColor || 'SİYAH'} / {data.productSize || 'Tek Ebat'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[7.5px] uppercase">Barkod</span>
                    <span className="font-bold">{data.productBarcode || '23111701787'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[7.5px] uppercase">Stok Kodu</span>
                    <span className="font-bold">{data.productSku || 'O-KOLT-TY-01'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Kargo Footer / Mühür */}
          <div className="flex justify-between items-center text-[8.5px] font-mono text-gray-500 border-t border-black pt-1">
            <span>trendyol.com/orders/shipment-packages/created</span>
            <span>Sayfa: 1/1</span>
          </div>
        </div>
      );

    // ==========================================
    // 2. TRENDYOL KARE KOLİ BARKODU (10x10 CM / 100x100 MM)
    // ==========================================
    case 'tpl-trendyol-square-box-10x10':
      return (
        <div className="p-3 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-2 select-none text-[11px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <IconTrendyolLogo size={28 * ratio} />
            <div className="bg-black text-white px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs">
              {data.hubCode || 'HUB: TY-KNY-04'}
            </div>
          </div>

          {/* Alıcı & Rota Bilgisi */}
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-600 font-bold block uppercase">Alıcı Müşteri</span>
              <div className="font-bold uppercase text-[12px]">{data.customerName || 'ALİ DAĞTAŞ'}</div>
              <div className="text-[10px] text-gray-700 leading-tight">{data.addressLine || 'Erenköy Mh. Şelale Sk. No:17/1'}</div>
              <div className="font-black text-[11px] text-black">{data.destination || 'SELÇUKLU / KONYA'}</div>
            </div>
            <div className="space-y-0.5 text-right flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-gray-600 font-bold block uppercase">Sipariş No</span>
                <span className="font-mono font-bold text-[11px]">{data.orderNo || 'TY-2391425900'}</span>
              </div>
              <div className="bg-gray-100 border border-black/30 p-1 text-[9px] font-bold text-center">
                {data.pieceInfo || 'Koli 1 / 1 (Desi: 2.5)'}
              </div>
            </div>
          </div>

          {/* Büyük Kargo Takip Barkodu */}
          <div className="border-y-2 border-black py-2 my-1 flex flex-col items-center justify-center bg-gray-50/40">
            <BarcodeRenderer
              value={data.barcode || '7270012031149210'}
              widthMm={widthMm}
              height={(isCompact ? 42 : isLarge ? 62 : 48) * ratio}
              width={(isCompact ? 1.4 : isLarge ? 1.9 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          {/* Alt Özet & Güvenlik */}
          <div className="flex justify-between items-center text-[9.5px]">
            <div className="truncate max-w-[70%] font-semibold">
              İçerik: {data.itemSummary || 'Oto Koltuk Kılıfı Siyah Tam Takım'}
            </div>
            <div className="font-mono font-bold text-[9px]">
              TEX / SÜRAT
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 3. TRENDYOL MİNİ TERMAL KARGO FİŞİ (57 MM RULO)
    // ==========================================
    case 'tpl-trendyol-mini-slip-57mm': {
      const recipient = data.recipientName || data.customerName || data.buyerName || data.recipient || 'ALİ DAĞTAŞ';
      const address = data.recipientAddress || data.addressLine || data.address || 'Erenköy Mah. Şelale Sok. No:17/1';
      const city = data.recipientDistrictCity || data.destination || data.city || 'SELÇUKLU / KONYA';
      const phone = data.recipientPhone || data.customerPhone || data.phone || '';
      const barcode = data.barcodeVal || data.barcode || data.packageBarcode || data.trackingBarcode || data.cargoTrackingNumber || '7270012031149210';
      const orderNo = data.orderNo || data.orderNumber || data.order_id || '2391425900';
      const carrier = data.cargoProvider || data.cargoName || data.carrier || 'Trendyol Express';
      const itemSummary = data.productName || data.itemSummary || data.itemsList || '1x Oto Koltuk Kılıfı Siyah Tam Takım';
      const pieceInfo = data.pieceInfo || data.productQty || '1/1 Paket • Desi: 1.0';

      return (
        <div className="p-2.5 bg-white text-black font-clean flex flex-col justify-between h-full space-y-1.5 select-none text-[11px] leading-tight">
          {/* Üst Header: Trendyol Logosu & Kargo Taşıyıcı */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <IconTrendyolLogo size={24 * ratio} />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded-xs uppercase tracking-wider">
                {carrier}
              </span>
              <span className="text-[8px] font-mono text-gray-700 font-bold mt-0.5">
                57MM KARGO FİŞİ
              </span>
            </div>
          </div>

          {/* Sipariş No & Tarih */}
          <div className="flex justify-between items-center text-[10px] font-mono font-bold border-b border-black/30 pb-1">
            <span>SİP: #{orderNo}</span>
            <span className="text-[8.5px] font-normal text-gray-600">Pazaryeri Sevk</span>
          </div>

          {/* Hedef / Rota Şehir Kutusu (Kuryenin anında okuması için büyük ve kalın) */}
          <div className="bg-black text-white p-1.5 rounded-xs text-center">
            <div className="text-[7.5px] font-mono text-gray-300 tracking-wider">VARIŞ ŞUBESİ & ROTA</div>
            <div className="text-[14px] font-black tracking-wide uppercase font-mono">
              {city}
            </div>
          </div>

          {/* Alıcı & Adres Detayları */}
          <div className="space-y-0.5 border border-black p-1.5 rounded-xs bg-gray-50/50">
            <div className="flex justify-between items-center">
              <span className="font-black text-[12px] uppercase text-black">{recipient}</span>
              {phone && <span className="font-mono text-[9px] font-bold text-gray-800">{phone}</span>}
            </div>
            <div className="text-black text-[9.5px] leading-tight font-medium">
              {address}
            </div>
          </div>

          {/* Büyük & Net Kargo Barkodu (57mm Genişliğinde Maksimum Okunabilirlik) */}
          <div className="py-1.5 flex flex-col items-center justify-center border-t-2 border-b-2 border-black bg-white">
            <div className="text-[8px] font-mono uppercase font-bold text-gray-600 mb-0.5">
              KARGO TAKİP BARKODU
            </div>
            <BarcodeRenderer
              value={barcode}
              widthMm={widthMm}
              height={(isCompact ? 48 : 56) * ratio}
              width={(isCompact ? 1.6 : 1.8) * ratio}
              displayValue={true}
            />
          </div>

          {/* Ürün & Paket Bilgisi */}
          <div className="space-y-0.5 text-[9px] font-mono">
            <div className="truncate font-bold text-black">
              İçerik: {itemSummary}
            </div>
            <div className="flex justify-between items-center text-gray-700 text-[8.5px] pt-0.5 border-t border-dashed border-black/30">
              <span>{pieceInfo}</span>
              <span>trendyol.com</span>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 4. TRENDYOL EXPRESS (TEX) HIZLI DAĞITIM BARKODU (80 MM / 10x10 CM)
    // ==========================================
    case 'tpl-trendyol-express-tex-80mm':
      return (
        <div className="p-3 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-2 select-none text-[11px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <div className="flex items-center gap-1">
              <span className="bg-orange-600 text-white font-black px-1.5 py-0.5 text-[10px] rounded-xs">TEX</span>
              <span className="font-black tracking-tight text-[12px]">TRENDYOL EXPRESS</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-gray-100 border border-black px-1.5 py-0.5">
              PIN: {data.customerPin || '7841'}
            </span>
          </div>

          {/* Rota Hub Kodu Büyük */}
          <div className="bg-black text-white p-2 rounded-xs text-center">
            <div className="text-[8px] font-mono text-gray-300">TESLİMAT HUB & ROTA KODU</div>
            <div className="text-[18px] font-black tracking-widest font-mono">
              {data.texHubCode || '34-IST-KAD-02'}
            </div>
          </div>

          {/* Alıcı */}
          <div className="text-[10px] space-y-0.5 border-b border-black pb-1">
            <div className="font-bold text-[12px] uppercase">{data.recipientName || 'ALİ DAĞTAŞ'}</div>
            <div className="text-gray-800 leading-tight">{data.deliveryAddress || 'Caferağa Mah. Moda Cad. No:44 Kadıköy / İSTANBUL'}</div>
          </div>

          {/* Barkod */}
          <div className="flex flex-col items-center justify-center py-1">
            <BarcodeRenderer
              value={data.texBarcode || 'TEX994182901TR'}
              widthMm={widthMm}
              height={(isCompact ? 42 : isLarge ? 60 : 48) * ratio}
              width={(isCompact ? 1.4 : isLarge ? 1.9 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-gray-600">
            <span>Teslimat: {data.timeSlot || '09:00 - 13:00'}</span>
            <span>Sipariş: {data.orderId || '2391425900'}</span>
          </div>
        </div>
      );

    // ==========================================
    // 5. HEPSİBURADA RESMİ SİPARİŞ & HEPSİJET KARGO ETİKETİ (10x15 CM / 100x150 MM)
    // ==========================================
    case 'tpl-hepsiburada-official-shipping-10x15':
      return (
        <div className="p-3 sm:p-4 bg-white text-black font-clean flex flex-col justify-between h-full space-y-2 sm:space-y-3 select-none text-[11px] leading-snug">
          {/* Üst Bildirim */}
          <div className="border border-black p-1.5 sm:p-2 rounded-xs flex items-center justify-between bg-orange-50/40">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShoppingBag size={16 * ratio} className="shrink-0 text-orange-600" />
              <div className="text-[9px] sm:text-[9.5px] font-semibold leading-tight">
                {data.platformNotice || 'Hepsiburada.com e-ticaret gönderisidir. Anlaşmalı taşıyıcı güvencesiyle sevk edilmiştir.'}
              </div>
            </div>
            <div className="text-[8.5px] sm:text-[9px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded-xs shrink-0">
              {data.desiWeight || '1.8 Desi'}
            </div>
          </div>

          {/* Logo & HepsiJet Başlığı */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <IconHepsiburadaLogo size={28 * ratio} />
            <IconHepsiJetLogo size={22 * ratio} />
          </div>

          {/* Rota & Gönderi Başlıkları */}
          <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-12 gap-3'} border border-black p-2.5 rounded-xs`}>
            <div className={`${isCompact ? 'col-span-1 border-b border-black/30 pb-2' : 'col-span-7 pr-2 border-r border-black/40'} space-y-1.5`}>
              <div className="flex justify-between items-center border-b border-black/20 pb-0.5">
                <span className="font-bold text-[11.5px] uppercase">Alıcı Bilgileri</span>
                <span className="font-mono text-[9px] bg-gray-200 px-1 font-bold">HB JET</span>
              </div>
              <div className="space-y-1 text-[10px] sm:text-[10.5px]">
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Sipariş No</span>
                  <span className="font-mono font-bold">: {data.orderNumber || 'HB-849102839'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Teslimat</span>
                  <span className="font-mono font-bold">: {data.deliveryNumber || 'HJ-994182901'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Ad Soyad</span>
                  <span className="font-bold uppercase">: {data.recipientName || 'MEHMET EMİN KAYA'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Telefon</span>
                  <span className="font-mono">: {data.recipientPhone || '0532 *** ** 44'}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-18 font-bold text-gray-800 shrink-0">Adres</span>
                  <span className="leading-tight">: {data.recipientAddress || 'Mustafa Kemal Mah. 2118 Cad. No:4/A Çankaya / ANKARA'}</span>
                </div>
              </div>
            </div>

            {/* Sağ Kolon / Alt: Rota Hub Kodu + Karekod */}
            <div className={`${isCompact ? 'col-span-1 pt-1' : 'col-span-5'} flex flex-col justify-between items-center text-center`}>
              <div className="bg-black text-white p-1.5 w-full rounded-xs">
                <div className="text-[7.5px] font-mono opacity-80">TRANSFER HUB</div>
                <div className="text-[12px] sm:text-[13px] font-black font-mono tracking-wider">
                  {data.hubRoute || 'ANK-HUB-04'}
                </div>
              </div>
              <div className="py-1">
                <QRCodeRenderer value={data.qrData || `HB-${data.orderNumber || '849102839'}-HJ`} size={(isCompact ? 36 : 46) * ratio} />
              </div>
              <div className="text-[8px] sm:text-[8.5px] font-mono font-bold text-gray-600">
                HB Express Teslimat
              </div>
            </div>
          </div>

          {/* Kargo Takip Barkodu */}
          <div className="border border-black p-2 rounded-xs flex flex-col items-center justify-center bg-gray-50/50">
            <div className="text-[8.5px] font-mono text-gray-600 font-bold mb-0.5 uppercase">HepsiJet Kargo Takip Numarası</div>
            <BarcodeRenderer
              value={data.barcodeVal || 'HJ669018471TR'}
              widthMm={widthMm}
              height={(isCompact ? 40 : isLarge ? 62 : 48) * ratio}
              width={(isCompact ? 1.35 : isLarge ? 1.85 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          {/* Sipariş İçerik Tablosu */}
          <div className="border border-black p-2 rounded-xs space-y-1">
            <div className="font-bold text-[9.5px] uppercase tracking-wide border-b border-black/20 pb-0.5">
              Paket İçi Ürünler
            </div>
            <div className="text-[9.5px] leading-tight">
              {data.itemsList || '1x Kablosuz Mekanik Klavye RGB • Beden: Standart • SKU: HB-KEY-99'}
            </div>
            <div className="text-[8.5px] font-mono text-gray-500 pt-0.5 flex justify-between">
              <span>Çıkış: {data.dispatchWarehouse || 'Gebze 1 Ana Depo'}</span>
              <span>Koli: 1/1</span>
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 6. HEPSİBURADA / HEPSİJET KARE KOLİ BARKODU (10x10 CM / 100x100 MM)
    // ==========================================
    case 'tpl-hepsiburada-square-box-10x10':
      return (
        <div className="p-3 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-2 select-none text-[11px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <IconHepsiburadaLogo size={26 * ratio} />
            <IconHepsiJetLogo size={22 * ratio} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-[8px] font-bold uppercase text-gray-500 block">Teslim Edilecek Kişi</span>
              <div className="font-black text-[12px] uppercase">{data.recipient || 'AYŞE YILMAZ'}</div>
              <div className="text-gray-800 font-bold">{data.cityDistrict || 'KADIKÖY / İSTANBUL'}</div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold uppercase text-gray-500 block">Hub / Rota</span>
              <div className="font-mono font-black text-[12px] bg-black text-white px-1.5 py-0.5 inline-block rounded-xs">
                {data.hubCode || 'IST-AVP-HUB-12'}
              </div>
              <div className="text-[9px] font-mono mt-0.5">{data.desi || '3 Desi'} • {data.dispatchDate || '27.08.2026'}</div>
            </div>
          </div>

          <div className="border-y-2 border-black py-2 flex flex-col items-center justify-center">
            <BarcodeRenderer
              value={data.barcodeVal || 'HJ889127401TR'}
              widthMm={widthMm}
              height={(isCompact ? 42 : isLarge ? 62 : 48) * ratio}
              width={(isCompact ? 1.4 : isLarge ? 1.9 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono">
            <span>SİP: {data.orderNo || 'HB-10294821'}</span>
            <span className="font-bold text-orange-600">hepsiJET STANDART</span>
          </div>
        </div>
      );

    // ==========================================
    // 7. HEPSİBURADA MİNİ POS KARGO FİŞİ (57 MM RULO)
    // ==========================================
    case 'tpl-hepsiburada-mini-slip-57mm': {
      const recipient = data.recipientName || data.customerName || data.buyerName || data.customer || 'SERKAN DEMİR';
      const address = data.recipientAddress || data.addressLine || data.address || 'Çankaya Mah. Atatürk Bulv. No:82';
      const city = data.recipientDistrictCity || data.destination || data.city || 'ÇANKAYA / ANKARA';
      const barcode = data.barcodeVal || data.barcode || data.packageBarcode || data.trackingBarcode || data.cargoTrackingNumber || 'HJ99120488TR';
      const orderNo = data.orderId || data.orderNo || data.orderNumber || 'HB-991204';
      const skuSummary = data.productName || data.itemSummary || data.skuSummary || '1x Bluetooth Kulaklık ANC';

      return (
        <div className="p-2.5 bg-white text-black font-clean flex flex-col justify-between h-full space-y-1.5 select-none text-[11px] leading-tight">
          <div className="flex items-center justify-between border-b-2 border-black pb-1">
            <IconHepsiburadaLogo size={22 * ratio} />
            <span className="text-[9px] font-mono font-bold bg-orange-600 text-white px-1.5 py-0.5 rounded-xs">hepsiJET</span>
          </div>

          <div className="text-center font-mono font-bold text-[10.5px] border-b border-black/20 pb-0.5">
            SİP: #{orderNo}
          </div>

          <div className="bg-black text-white p-1 rounded-xs text-center font-mono font-bold text-[12px] uppercase">
            {city}
          </div>

          <div className="border border-black p-1.5 rounded-xs space-y-0.5 bg-gray-50/50">
            <div className="font-black uppercase text-[11.5px]">{recipient}</div>
            <div className="text-gray-800 text-[9px]">{address}</div>
          </div>

          <div className="py-1.5 flex flex-col items-center justify-center border-t-2 border-b-2 border-black">
            <BarcodeRenderer
              value={barcode}
              widthMm={widthMm}
              height={(isCompact ? 48 : 56) * ratio}
              width={(isCompact ? 1.6 : 1.8) * ratio}
              displayValue={true}
            />
          </div>

          <div className="text-[8.5px] text-gray-800 font-mono truncate">
            {skuSummary}
          </div>
        </div>
      );
    }

    // ==========================================
    // 8. AMAZON FBA & MFN KARGO & SEVKİYAT ETİKETİ (10x15 CM / 4x6" GÖRSEL 2 FORMATI)
    // ==========================================
    case 'tpl-amazon-fba-mfn-global-10x15':
      return (
        <div className="p-2.5 sm:p-3 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-1.5 sm:space-y-2 select-none text-[11px] leading-tight">
          {/* Üst Rota & Takip Kutusu */}
          <div className={`border-b-2 border-black pb-1.5 sm:pb-2 grid ${isCompact ? 'grid-cols-1 gap-1' : 'grid-cols-12 gap-2'} items-center`}>
            {/* Büyük Rota Harfi "Q" / "FBA-1" */}
            <div className={`${isCompact ? 'flex justify-between items-center border-b border-black/30 pb-1' : 'col-span-3 border-r-2 border-black pr-2 flex items-center justify-center'}`}>
              <span className={`${isCompact ? 'text-[28px]' : 'text-[40px] sm:text-[44px]'} font-black font-serif leading-none select-none`}>
                {data.routeLetter || 'Q'}
              </span>
              {isCompact && (
                <span className="text-[8.5px] font-mono font-bold uppercase">{data.carrierService || 'AMAZON PRIME'}</span>
              )}
            </div>

            {/* Üst Kargo Takip Barkodu */}
            <div className={`${isCompact ? 'pt-1' : 'col-span-9'} flex flex-col items-center justify-center pl-0 sm:pl-1`}>
              {!isCompact && (
                <div className="text-[8.5px] font-mono uppercase tracking-widest text-gray-700 mb-0.5">
                  {data.carrierService || 'AMAZON PRIME DELIVERY / USPS PRIORITY MAIL'}
                </div>
              )}
              <BarcodeRenderer
                value={data.smallBarcode || '12347678'}
                widthMm={widthMm}
                height={(isCompact ? 22 : 28) * ratio}
                width={(isCompact ? 1.15 : 1.35) * ratio}
                displayValue={true}
              />
              <div className="flex justify-between w-full text-[8px] sm:text-[8.5px] font-mono text-gray-600 mt-0.5 px-1 sm:px-2">
                <span>{data.postDate || '08/27/2026'}</span>
                <span>From: {data.fromZip || 'TR-34000 IST'}</span>
              </div>
            </div>
          </div>

          {/* Servis Başlık Şeridi */}
          <div className="border-b-2 border-black pb-0.5 sm:pb-1 text-center font-black tracking-widest text-[10.5px] sm:text-[12px] uppercase font-mono">
            {data.carrierService || 'USPS PRIORITY MAIL / AMAZON EXPEDITED'}
          </div>

          {/* Orta Kısım: Ship To & 2D DataMatrix/QR Kod */}
          <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-12 gap-2'} py-1 items-start`}>
            {/* Sol: Ship To Adres */}
            <div className={`${isCompact ? 'col-span-1 border-b border-black/20 pb-1.5' : 'col-span-7 pr-1'} space-y-0.5 sm:space-y-1 text-[10px] sm:text-[10.5px]`}>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">SHIP TO:</span>
              <div className="font-black text-[12px] sm:text-[13px] uppercase">{data.shipToName || 'StanyoarE'}</div>
              <div className="text-gray-900 leading-tight">{data.shipToAddress || '127 wills avenue bgidge'}</div>
              <div className="text-gray-900 leading-tight font-bold">{data.shipToCityZip || 'Allen streetN,10041 NY, USA'}</div>
              <div className="text-[8.5px] text-gray-600 font-mono pt-0.5">
                AHIP / Ti: Lisa • Jiangxi Chinb
              </div>
            </div>

            {/* Sağ / Alt: 2D DataMatrix & GTIN/SSCC Kodu */}
            <div className={`${isCompact ? 'col-span-1' : 'col-span-5'} flex flex-col items-center justify-center text-center`}>
              <QRCodeRenderer value={data.gtinSscc || '(01) 0 0000123 00501 2'} size={(isCompact ? 38 : 48) * ratio} />
              <div className="text-[7.5px] sm:text-[8px] font-mono font-bold mt-0.5 text-gray-700 leading-tight">
                {data.gtinSscc || '(01) 0 0000123 00501 2'}
              </div>
            </div>
          </div>

          {/* Alt Kısım: Büyük Kargo Teslimat Onay Barkodu (DELIVERY CONFIRMATION) */}
          <div className="border-t-2 border-black pt-1 sm:pt-2 flex flex-col items-center justify-center">
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-0.5 font-mono">
              USPS / AMAZON DELIVERY CONFIRMATION
            </div>
            <BarcodeRenderer
              value={data.bigBarcode || '7270012031149210'}
              widthMm={widthMm}
              height={(isCompact ? 42 : isLarge ? 64 : 52) * ratio}
              width={(isCompact ? 1.35 : isLarge ? 1.85 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-black/40 pt-1 flex justify-between items-center text-[8px] sm:text-[8.5px] font-mono text-gray-600">
            <span className="truncate max-w-[70%]">{data.footerSecurity || 'The safe way to pay and deliver online'}</span>
            <IconAmazonLogo size={18 * ratio} />
          </div>
        </div>
      );

    // ==========================================
    // 9. AMAZON FBA KOLİ & PALET GİRİŞ BARKODU (10x10 CM / 100x100 MM)
    // ==========================================
    case 'tpl-amazon-fba-inbound-box-10x10':
      return (
        <div className="p-3 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-2 select-none text-[11px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <IconAmazonLogo size={26 * ratio} />
            <div className="bg-black text-white px-2 py-0.5 text-[11px] font-mono font-black rounded-xs">
              {data.fcDestination || 'FC: TR01 - İSTANBUL'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-[8px] font-bold text-gray-500 block uppercase">SHIPMENT ID</span>
              <span className="font-mono font-black text-[12px]">{data.shipmentId || 'FBA15J994KKL'}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold text-gray-500 block uppercase">BOX COUNT</span>
              <span className="font-mono font-black text-[12px] bg-gray-100 border border-black px-1.5 py-0.5">
                {data.boxNumber || 'BOX 1 OF 6'}
              </span>
            </div>
          </div>

          {/* FNSKU Barkodu */}
          <div className="border-y-2 border-black py-2 flex flex-col items-center justify-center bg-gray-50/50">
            <div className="text-[8.5px] font-mono text-gray-600 mb-0.5 font-bold">AMAZON INBOUND CARTON FNSKU</div>
            <BarcodeRenderer
              value={data.fnskuBarcode || 'X0019AB872'}
              widthMm={widthMm}
              height={(isCompact ? 42 : isLarge ? 62 : 48) * ratio}
              width={(isCompact ? 1.4 : isLarge ? 1.9 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono font-bold">
            <span>AĞIRLIK: {data.grossWeight || '14.2 KG (MAX 15KG)'}</span>
            <span className="text-gray-700">{data.mixedSkuNotice || 'MIXED SKU INBOUND'}</span>
          </div>
        </div>
      );

    // ==========================================
    // 10. AMAZON MİNİ FNSKU & KARGO SLIP (57 MM RULO)
    // ==========================================
    case 'tpl-amazon-mini-fnsku-slip-57mm': {
      const barcode = data.barcodeVal || data.barcode || data.packageBarcode || data.trackingBarcode || '408192847188';
      const orderNo = data.orderId || data.orderNo || data.orderNumber || '408-1928471-88912';
      const itemTitle = data.productName || data.itemSummary || data.itemTitle || 'Organic Cotton T-Shirt Black L Size';
      const fnsku = data.asinFnsku || data.productSku || 'X0028ABCDE';
      const carrier = data.cargoProvider || data.shipCarrier || 'Kolay Gelsin';

      return (
        <div className="p-2.5 bg-white text-black font-clean flex flex-col justify-between h-full space-y-1.5 select-none text-[11px] leading-tight">
          <div className="flex items-center justify-between border-b-2 border-black pb-1">
            <IconAmazonLogo size={22 * ratio} />
            <span className="text-[9px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded-xs">MFN/FBA</span>
          </div>

          <div className="text-[9.5px] font-mono border-b border-black/20 pb-0.5">
            <span className="font-bold">Sipariş:</span> #{orderNo}
          </div>

          <div className="font-bold text-[10.5px] leading-tight line-clamp-2">
            {itemTitle}
          </div>

          <div className="py-1.5 flex flex-col items-center justify-center border-t-2 border-b-2 border-black">
            <BarcodeRenderer
              value={barcode}
              widthMm={widthMm}
              height={(isCompact ? 48 : 56) * ratio}
              width={(isCompact ? 1.6 : 1.8) * ratio}
              displayValue={true}
            />
          </div>

          <div className="flex justify-between text-[8.5px] font-mono text-gray-800">
            <span>FNSKU: {fnsku}</span>
            <span className="font-bold">{carrier}</span>
          </div>
        </div>
      );
    }

    // ==========================================
    // 11. ÇİÇEKSEPETİ HEDİYE NOTLU KARGO ETİKETİ (10x15 CM / 100x150 MM)
    // ==========================================
    case 'tpl-ciceksepeti-gift-shipping-10x15':
      return (
        <div className="p-4 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-3 select-none text-[11px] leading-snug">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div className="flex items-center gap-1.5">
              <IconGiftBowRibbon size={24 * ratio} className="text-pink-600" />
              <div className="font-black text-[13px] tracking-tight">çiçeksepeti</div>
            </div>
            <div className="bg-pink-100 text-pink-950 border border-pink-300 font-bold px-2 py-0.5 text-[9.5px] rounded-xs font-mono">
              {data.deliverySlot || 'BUGÜN: 14:00 - 18:00'}
            </div>
          </div>

          {/* Alıcı & Sipariş Bilgisi */}
          <div className="border border-black p-2.5 rounded-xs space-y-1 text-[10.5px]">
            <div className="flex justify-between border-b border-black/20 pb-0.5">
              <span className="font-bold uppercase text-[12px]">{data.recipientName || 'ZEYNEP GÜLER'}</span>
              <span className="font-mono text-gray-600">Sipariş: {data.orderNo || 'CS-7719203'}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-700">
              <Phone size={12 * ratio} />
              <span>{data.recipientPhone || '0544 *** ** 88'}</span>
            </div>
            <div className="flex items-start gap-2 text-[10px]">
              <MapPin size={12 * ratio} className="shrink-0 mt-0.5" />
              <span className="leading-tight">{data.address || 'Bağdat Caddesi No:142/8 Kadıköy / İSTANBUL'}</span>
            </div>
          </div>

          {/* Zarf Formatında Özel Hediye Kartı Notu */}
          <div className="border-2 border-dashed border-pink-900 p-3 rounded-xs bg-pink-50/30 space-y-1.5 text-center">
            <div className="text-[9px] font-mono uppercase tracking-widest text-pink-900 font-bold">
              ✉ {data.giftCardTitle || 'ÖZEL HEDİYE KARTI NOTU'} ✉
            </div>
            <div className="text-[12px] font-serif italic leading-snug px-2 text-gray-900">
              "{data.giftMessage || 'Nice mutlu, sağlıklı ve başarı dolu yaşlara canım arkadaşım! İyi ki varsın...'}"
            </div>
            <div className="text-[10px] font-bold text-gray-800 text-right pt-1">
              {data.senderName || '— Gönderen: Can & Deniz'}
            </div>
          </div>

          {/* Kargo Takip Barkodu */}
          <div className="flex flex-col items-center justify-center pt-1 border-t border-black">
            <BarcodeRenderer
              value={data.courierBarcode || 'CS99201481TR'}
              widthMm={widthMm}
              height={(isCompact ? 40 : isLarge ? 58 : 46) * ratio}
              width={(isCompact ? 1.4 : isLarge ? 1.85 : 1.6) * ratio}
              displayValue={true}
            />
          </div>
        </div>
      );

    // ==========================================
    // 12. ÇOKLU KARGO ENTEGRASYONLU SEVK İRSALİYESİ (10x15 CM / 100x150 MM)
    // ==========================================
    case 'tpl-universal-courier-shipping-10x15':
      return (
        <div className="p-3 sm:p-4 bg-white text-black font-clean flex flex-col justify-between h-full border-2 border-black space-y-2 sm:space-y-3 select-none text-[11px] leading-snug">
          {/* Header: Kargo Logosu & Ödeme Tipi */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <div className="flex items-center gap-1.5">
              <IconYurticiKargoLogo size={22 * ratio} />
            </div>
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-xs">
                {data.paymentType || 'ALICI ÖDER • KAPIDA NAKİT'}
              </div>
              <div className="text-[8.5px] sm:text-[9px] font-mono text-gray-600 mt-0.5">
                Desi: {data.desiKg || '3.5 Desi / 2.1 Kg'}
              </div>
            </div>
          </div>

          {/* Gönderici & Alıcı Grid */}
          <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} border border-black p-2.5 rounded-xs text-[10px]`}>
            <div className={`space-y-0.5 ${isCompact ? 'border-b border-black/30 pb-2' : 'border-r border-black/40 pr-2'}`}>
              <span className="text-[8px] sm:text-[8.5px] font-bold text-gray-500 uppercase block">Gönderici</span>
              <div className="font-bold text-[10.5px] sm:text-[11px]">E-Ticaret Lojistik Depo</div>
              <div className="text-gray-700 text-[8.5px] sm:text-[9px] leading-tight">
                {data.senderInfo || 'Maslak Mah. Dereboyu Cad. No:12 Sarıyer / İSTANBUL'}
              </div>
            </div>
            <div className={`space-y-0.5 ${isCompact ? 'pt-1' : 'pl-1'}`}>
              <span className="text-[8px] sm:text-[8.5px] font-bold text-gray-500 uppercase block">Alıcı Müşteri</span>
              <div className="font-black text-[11.5px] sm:text-[12px] uppercase">{data.recipientName || 'BURAK YILDIRIM'}</div>
              <div className="text-gray-800 text-[9px] sm:text-[9.5px] leading-tight">
                {data.recipientAddress || 'Fatih Sultan Mehmet Mah. Nilüfer / BURSA'}
              </div>
              <div className="text-[8.5px] sm:text-[9px] font-mono font-semibold">{data.recipientPhone || 'Tel: 0533 *** ** 12'}</div>
            </div>
          </div>

          {/* Kargo Takip Barkodu */}
          <div className="border border-black p-2 sm:p-2.5 rounded-xs flex flex-col items-center justify-center bg-gray-50/50">
            <div className="text-[8.5px] sm:text-[9px] font-mono text-gray-600 mb-0.5 uppercase font-bold">Kargo Takip Numarası</div>
            <BarcodeRenderer
              value={data.trackingBarcode || '918237461902'}
              widthMm={widthMm}
              height={(isCompact ? 40 : isLarge ? 62 : 48) * ratio}
              width={(isCompact ? 1.35 : isLarge ? 1.85 : 1.6) * ratio}
              displayValue={true}
            />
          </div>

          {/* Alt Kırılabilir Uyarısı & İçerik */}
          <div className="flex items-center justify-between border-t border-black pt-1 sm:pt-1.5 text-[9px] sm:text-[9.5px]">
            <div className="flex items-center gap-1.5">
              <IconFragileGlass size={16 * ratio} className="text-red-600" />
              <span className="font-bold text-red-950">KIRILABİLİR HASSAS İÇERİK</span>
            </div>
            <div className="text-gray-700 font-mono text-[8.5px] sm:text-[9px]">
              {data.contentsNote || '1x Yedek Parça Seti'}
            </div>
          </div>
        </div>
      );

    // ==========================================
    // 13. HIZLI KARGO & KURYE TESLİMAT FİŞİ (57 MM RULO)
    // ==========================================
    case 'tpl-universal-courier-mini-slip-57mm': {
      const recipient = data.recipientName || data.customerName || data.buyerName || data.recipient || 'HASAN KILIÇ';
      const address = data.recipientAddress || data.addressLine || data.address || 'Levent Mah. Cömert Sk. No:5 Beşiktaş / İST';
      const phone = data.recipientPhone || data.customerPhone || data.phone || '0532 999 11 22';
      const barcode = data.barcodeVal || data.barcode || data.packageBarcode || data.trackingBarcode || data.cargoTrackingNumber || 'MK88910293';
      const trackingCode = data.trackingCode || data.orderNo || 'MK-8891';
      const cashCollect = data.cashCollect || data.paymentType || 'KAPIDA TAHSİLAT: 420.00 TL';

      return (
        <div className="p-2.5 bg-white text-black font-clean flex flex-col justify-between h-full space-y-1.5 select-none text-[11px] leading-tight">
          <div className="flex items-center justify-between border-b-2 border-black pb-1">
            <div className="flex items-center gap-1">
              <Truck size={15 * ratio} />
              <span className="font-black text-[11px]">HIZLI KURYE</span>
            </div>
            <span className="font-mono text-[9.5px] font-bold bg-black text-white px-1.5 py-0.5 rounded-xs">
              {trackingCode}
            </span>
          </div>

          <div className="border border-black p-1.5 rounded-xs space-y-0.5 bg-gray-50/50">
            <div className="font-black uppercase text-[11.5px]">{recipient}</div>
            <div className="text-gray-800 text-[9px] leading-tight">{address}</div>
            <div className="font-mono text-[9px] font-bold text-gray-900">{phone}</div>
          </div>

          <div className="bg-gray-100 p-1 border border-black text-center font-bold text-[9.5px]">
            {cashCollect}
          </div>

          <div className="py-1.5 flex flex-col items-center justify-center border-t-2 border-b-2 border-black">
            <BarcodeRenderer
              value={barcode}
              widthMm={widthMm}
              height={(isCompact ? 48 : 56) * ratio}
              width={(isCompact ? 1.6 : 1.8) * ratio}
              displayValue={true}
            />
          </div>
        </div>
      );
    }

    // ==========================================
    // 14. E-TİCARET SİPARİŞ TOPLAMA & PAKETLEME FİŞİ (80 MM RULO)
    // ==========================================
    case 'tpl-ecommerce-warehouse-picking-slip-80mm':
      return (
        <div className="p-3 bg-white text-black font-clean flex flex-col justify-between h-full space-y-2 select-none text-[11px]">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
            <div className="font-black text-[12px]">{data.orderRef || 'SİPARİŞ #TK-99201'}</div>
            <span className="text-[9px] font-mono font-bold bg-gray-200 px-1.5 py-0.5">
              {data.marketplaceSource || 'TRENDYOL'}
            </span>
          </div>

          <div className="text-[9.5px] text-gray-700 font-mono">
            {data.pickerStaff || 'Toplayan: Personel Ahmet (Raf Bölümü: B-12)'}
          </div>

          {/* Ürün Toplama Listesi */}
          <div className="border border-black p-2 rounded-xs space-y-1 bg-gray-50/50">
            <div className="font-bold text-[10px] uppercase border-b border-black/20 pb-0.5">
              Toplanacak Ürün Kalemleri
            </div>
            <div className="whitespace-pre-line font-mono text-[10px] leading-relaxed">
              {data.itemList || '1x Deri Cüzdan Taba (SKU: CZ-01)\n2x Deri Kartlık Siyah (SKU: KR-09)\n1x Bakım Kremi 50ml (SKU: BK-03)'}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-1 border-t border-black">
            <BarcodeRenderer
              value={data.verifyBarcode || 'TK99201CHECK'}
              widthMm={widthMm}
              height={(isCompact ? 38 : isLarge ? 56 : 44) * ratio}
              width={(isCompact ? 1.35 : isLarge ? 1.8 : 1.5) * ratio}
              displayValue={true}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};
