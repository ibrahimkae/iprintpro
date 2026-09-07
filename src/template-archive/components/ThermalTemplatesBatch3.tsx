import React from 'react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { QRCodeRenderer } from './QRCodeRenderer';
import {
  IconTeamLiftTwoPersons,
  IconThermometerColdChain,
  IconBreadWheat,
  IconCheeseWedge,
  IconCoffeeDripperV60,
  IconWineBottleVintage,
  IconHoneyCombBees,
  IconMedicalSyringeVial,
  IconDentalTooth,
  IconCarChassisDyno,
  IconTireSnowFlake,
  IconHeaterRadiator,
  IconCinemaFilmTicket,
  IconLuggageBagTag,
  IconRetroComputerUndo,
  IconPlantSproutWater,
  IconHourglassSand,
  IconGiftBowRibbon,
  IconRecycleTriangleLogo,
  IconDoNotStack,
  IconQcPassedStamp,
  IconSkullCrossbones,
  IconBatteryLowCharging,
  IconToolWrenchScrewdriver,
  IconNewspaperArticle,
  IconBabyFootprint,
  IconSyrupBottleCocktail,
  IconNutHazelnut,
  IconSpiceJarHerbs
} from './ThermalIcons';

interface Batch3RendererProps {
  templateId: string;
  data: Record<string, any>;
  ratio: number;
  widthMm?: number;
}

export const renderBatch3Template = ({
  templateId,
  data,
  ratio,
  widthMm
}: Batch3RendererProps): React.ReactNode | null => {
  switch (templateId) {
    // 101. AMAZON FBA / E-TİCARET PALET & KUTU GİRİŞ ETİKETİ
    case 'tpl-amazon-fba-pallet-box':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-black pb-1.5">
            <div>
              <span className="text-[9px] font-bold tracking-wider bg-black text-white px-1.5 py-0.5 rounded">FBA INBOUND</span>
              <h2 className="font-condensed-bold text-lg font-black leading-tight mt-0.5">{data.shipmentId || 'FBA17Z889K2P'}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono-receipt font-bold">{data.boxCount || 'Box 04 of 12'}</span>
              <div className="text-[9px] font-bold text-stone-600">{data.fcCode || 'BER3 (Germany FC)'}</div>
            </div>
          </div>

          <div className="py-1">
            <div className="text-xs font-bold line-clamp-2 leading-snug">{data.title || 'Ergonomic Wireless Mech Keyboard - Black'}</div>
            <div className="text-[10px] font-mono-receipt text-stone-600 mt-1">Condition: <span className="font-bold text-black">{data.condition || 'New / Sealed'}</span></div>
          </div>

          <div className="border-t-2 border-dashed border-black pt-2 flex flex-col items-center">
            <BarcodeRenderer value={data.fnsku || 'X003A8K9L1'} widthMm={widthMm} height={36 * ratio} width={1.4 * ratio} />
            <span className="text-[10px] font-mono-receipt font-bold tracking-widest mt-1">FNSKU: {data.fnsku || 'X003A8K9L1'}</span>
          </div>
        </div>
      );

    // 102. ULUSLARARASI GÜMRÜK / CN22 İTHALAT-İHRACAT BEYANNAMESİ
    case 'tpl-customs-cn22-declaration':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <span className="font-condensed-bold text-xl font-black">CUSTOMS DECLARATION</span>
            <span className="border-2 border-black px-1 text-xs font-black">CN 22</span>
          </div>
          <div className="text-[9px] font-mono-receipt flex justify-between border-b border-black pb-1">
            <span>CATEGORY: <strong>{data.declarationType || 'Commercial Sample'}</strong></span>
            <span>UPU STANDARD</span>
          </div>
          <div className="space-y-1 text-[10px] font-clean py-1">
            <div className="flex justify-between">
              <span className="text-stone-600">Contents:</span>
              <span className="font-bold">{data.itemDescription || 'Handmade Ceramic Mug & Coaster'}</span>
            </div>
            <div className="flex justify-between font-mono-receipt">
              <span>HS Code: <strong>{data.hsCode || '6912.00.20'}</strong></span>
              <span>Net Wt: <strong>{data.weightKg || '0.450 kg'}</strong></span>
            </div>
            <div className="flex justify-between font-mono-receipt border-t border-stone-200 pt-1">
              <span>Declared Value:</span>
              <span className="font-bold">{data.declaredValue || 'EUR 35.00'}</span>
            </div>
          </div>
          <div className="border-t-2 border-black pt-1 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Sign: {data.senderSign || 'ATELIER CRAFT IST'}</span>
            <QRCodeRenderer value={`CN22-${data.hsCode || '6912'}-${data.declaredValue || '35'}`} size={32 * ratio} />
          </div>
        </div>
      );

    // 103. İADE KABUL & EKSPERTİZ DURUM FİŞİ
    case 'tpl-return-inspection-qc':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <div className="flex items-center space-x-1.5">
              <IconQcPassedStamp size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">RETURN INSPECTION</span>
            </div>
            <span className="text-[10px] font-mono-receipt font-bold">{data.orderNo || '#ORD-99412'}</span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-stone-600">Müşteri:</span><span className="font-bold">{data.customerName || 'Mehmet Yılmaz'}</span></div>
            <div className="flex justify-between"><span className="text-stone-600">Sebep:</span><span className="italic">{data.reason || 'Beden Uyumsuzluğu'}</span></div>
            <div className="p-1.5 bg-stone-100 border border-black rounded text-center font-bold text-xs">
              {data.itemCondition || 'Kusursuz / Yeniden Satılabilir'}
            </div>
          </div>
          <div className="border-t border-black pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Ekspertiz: {data.inspector || 'QC-14 (Ahmet K.)'}</span>
            <BarcodeRenderer value={data.returnId || 'RET-892410'} height={24 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 104. AĞIR KOLİ / 2 KİŞİ İLE KALDIRINIZ UYARI ETİKETİ
    case 'tpl-heavy-package-two-person':
      return (
        <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="bg-black text-white text-center py-1 font-condensed-bold text-xl tracking-wider">
            {data.warningHeader || 'HEAVY PACKAGE • 2 PERSON LIFT'}
          </div>
          <div className="flex items-center justify-around py-1">
            <IconTeamLiftTwoPersons size={44 * ratio} />
            <div className="text-center font-mono-receipt">
              <span className="text-[10px] font-bold text-stone-600 block">TOTAL WEIGHT</span>
              <span className="text-2xl font-black font-condensed-bold">{data.weightKg || '32.5 KG'}</span>
            </div>
          </div>
          <div className="border-t-2 border-black pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>{data.actionInstruction || 'Tek başınıza kaldırmayınız!'}</span>
            <span className="font-bold">DEPO: {data.warehouseLocation || 'ZONE-C / PALLET 08'}</span>
          </div>
        </div>
      );

    // 105. SOĞUK ZİNCİR / ISIYA DUYARLI İLAÇ & GIDA ETİKETİ
    case 'tpl-temperature-sensitive-cold-chain':
      return (
        <div className="p-3 border-2 border-blue-900 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-blue-900 pb-1">
            <div className="flex items-center space-x-1">
              <IconThermometerColdChain size={24 * ratio} className="text-blue-700" />
              <span className="font-condensed-bold text-lg font-black text-blue-950">COLD CHAIN</span>
            </div>
            <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-300">
              {data.statusBadge || 'ACTIVE COLD CHAIN'}
            </span>
          </div>
          <div className="text-center py-1">
            <span className="text-2xl font-black font-condensed-bold text-blue-950 tracking-wider">
              {data.temperatureRange || '+2°C to +8°C'}
            </span>
            <p className="text-[10px] text-stone-600 mt-0.5">{data.instruction || 'Dondurmayınız. Direkt güneşten koruyunuz.'}</p>
          </div>
          <div className="border-t border-blue-900 pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Log No: {data.loggerSerial || 'COLD-SENS-7782'}</span>
            <QRCodeRenderer value={data.loggerSerial || 'COLD-SENS-7782'} size={30 * ratio} />
          </div>
        </div>
      );

    // 106. ARTISAN EKŞİ MAYALI EKMEK & FIRIN BİLGİ ETİKETİ
    case 'tpl-artisanal-sourdough-bread':
      return (
        <div className="p-3 border-2 border-amber-900 font-artisan flex flex-col justify-between h-full space-y-2 bg-amber-50/40">
          <div className="text-center border-b border-amber-800 pb-1">
            <div className="flex justify-center mb-0.5"><IconBreadWheat size={26 * ratio} className="text-amber-900" /></div>
            <h2 className="text-base font-bold text-amber-950 uppercase">{data.bakeryName || 'ODUN FIRINI ARTISAN BAKERY'}</h2>
            <p className="text-[10px] italic text-amber-800">{data.breadType || '72 Saat Fermantasyon Köy Ekmeği'}</p>
          </div>
          <div className="text-[9px] font-clean space-y-1">
            <div><span className="font-bold text-amber-900">Un / Tahıl:</span> {data.flourType || 'Taş Değirmen Siyez & Tam Buğday'}</div>
            <div className="flex justify-between font-mono-receipt text-stone-700">
              <span>Fırın Saati: {data.bakeTime || 'Bugün 06:30'}</span>
              <span>Ağırlık: {data.weight || '850 Gr'}</span>
            </div>
          </div>
          <div className="border-t border-amber-800 pt-1 text-center text-[8px] font-mono-receipt text-amber-900">
            {data.shelfLifeNote || 'Doğal ekşi maya ile katkısız üretilmiştir.'}
          </div>
        </div>
      );

    // 107. ESKİ KAŞAR & GURME PEYNİR ÇARKI ETİKETİ
    case 'tpl-vintage-aged-cheese-wheel':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconCheeseWedge size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-bold">{data.dairyEstate || 'KARS BOĞATEPE MANDIRA'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt bg-stone-200 px-1 py-0.5 rounded font-bold">{data.agingMonths || '24 AY DİNLENMİŞ'}</span>
          </div>
          <div className="text-center py-1">
            <h3 className="font-artisan text-sm font-bold">{data.cheeseName || 'Geleneksel Gravyer & Eski Kaşar'}</h3>
            <p className="text-[9px] text-stone-600 italic mt-0.5">{data.milkSource || '%100 Mera Yayla İnek Sütü'}</p>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Parti: {data.lotBatch || 'LOT-2024-K08'}</span>
            <BarcodeRenderer value={data.lotBatch || 'LOT-2024-K08'} height={22 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 108. 3RD WAVE NİTELİKLİ KAHVE / SINGLE ORIGIN ROASTERY
    case 'tpl-third-wave-single-origin-coffee':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <div className="flex items-center space-x-1">
              <IconCoffeeDripperV60 size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">{data.roasteryName || 'CRAFT COFFEE ROASTERS'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold">{data.altitude || '1950 - 2100m'}</span>
          </div>
          <div>
            <div className="font-condensed-bold text-base font-black">{data.originRegion || 'ETHIOPIA YIRGACHEFFE G1'}</div>
            <div className="text-[10px] text-stone-600 font-mono-receipt">Process: <span className="font-bold text-black">{data.process || 'Natural / Anaerobic'}</span></div>
          </div>
          <div className="p-1.5 bg-stone-100 rounded text-[9px] font-clean">
            <span className="font-bold">Tadım Notaları:</span> {data.tastingNotes || 'Bergamot, Yasemin Çiçeği, Şeftali, Yaban Mersini'}
          </div>
          <div className="border-t border-stone-900 pt-1 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Kavrum: {data.roastDate || '12.08.2026'}</span>
            <span className="font-bold">{data.netWeight || '250g'}</span>
          </div>
        </div>
      );

    // 109. MAHZEN ŞARAP & BUTİK ÜRETİM BOYUN ETİKETİ
    case 'tpl-vintage-cellar-wine-tag':
      return (
        <div className="p-3 border-2 border-red-950 font-artisan flex flex-col justify-between h-full space-y-2 bg-red-50/30">
          <div className="text-center border-b border-red-900 pb-1">
            <div className="flex justify-center mb-0.5"><IconWineBottleVintage size={24 * ratio} className="text-red-900" /></div>
            <h2 className="font-bold text-base text-red-950 uppercase">{data.vineyard || 'URLA BAĞLARI REZERVE'}</h2>
            <p className="text-[10px] italic text-red-800">{data.grapeVariety || 'Boğazkere & Öküzgözü Kupajı'}</p>
          </div>
          <div className="flex justify-around text-[10px] font-mono-receipt text-red-950 py-1">
            <span>Yıl: <strong>{data.vintageYear || '2021'}</strong></span>
            <span>Meşe: <strong>{data.barrelAging || '18 Ay Fransız Meşe'}</strong></span>
          </div>
          <div className="border-t border-red-900 pt-1 flex justify-between items-center text-[9px] font-mono-receipt text-red-950">
            <span>Şişe: {data.bottleNo || 'Şişe #0412 / 1200'}</span>
            <span>{data.alcoholVol || 'Alc. %14.2 Vol'}</span>
          </div>
        </div>
      );

    // 110. HAM ÇİÇEK BALI & ARICILIK HASAT KÜNYESİ
    case 'tpl-raw-organic-honey-jar':
      return (
        <div className="p-3 border-2 border-amber-900 font-clean flex flex-col justify-between h-full space-y-2 bg-amber-50/50">
          <div className="flex justify-between items-center border-b border-amber-900 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconHoneyCombBees size={24 * ratio} className="text-amber-800" />
              <span className="font-condensed-bold text-lg font-bold text-amber-950">{data.apiaryName || 'KAFKAS YAYLA ARICILIK'}</span>
            </div>
            <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.5 rounded">HAM BAL</span>
          </div>
          <div className="text-center py-1">
            <h3 className="font-artisan text-sm font-bold text-amber-950">{data.honeyVariety || 'Ham Karakovan Yayla Çiçek Balı'}</h3>
            <p className="text-[9px] text-amber-800 italic mt-0.5">{data.floraLocation || 'Artvin Macahel Biyosfer Vadisi (2200m)'}</p>
          </div>
          <div className="border-t border-amber-900 pt-1 flex justify-between items-center text-[9px] font-mono-receipt text-amber-950">
            <span>Hasat: {data.harvestDate || 'Ağustos 2026'}</span>
            <span className="font-bold">{data.netWeight || 'Net 460g'}</span>
          </div>
        </div>
      );

    // 111. SOĞUK SIKIM ERKEN HASAT ZEYTİNYAĞI KÜNYESİ
    case 'tpl-olive-oil-harvest-estate':
      return (
        <div className="p-3 border-2 border-emerald-950 font-clean flex flex-col justify-between h-full space-y-2 bg-emerald-50/30">
          <div className="text-center border-b border-emerald-900 pb-1">
            <h2 className="font-artisan text-base font-bold text-emerald-950 uppercase">{data.estateName || 'KAZDAĞLARI ZEYTİN ÇİFTLİĞİ'}</h2>
            <p className="text-[10px] text-emerald-800 italic">{data.oilType || 'Erken Hasat Soğuk Sıkım Naturel Sızma'}</p>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px] font-mono-receipt bg-emerald-100/60 p-1.5 rounded">
            <div>Asit: <strong>{data.acidity || 'Dizim Asit ≤ %0.2'}</strong></div>
            <div>Hasat: <strong>{data.harvestMonth || 'Ekim 2026'}</strong></div>
            <div className="col-span-2">Zeytin: <strong>{data.oliveVariety || 'Edremit Tipi Yağlık'}</strong></div>
          </div>
          <div className="border-t border-emerald-900 pt-1 flex justify-between items-center text-[9px] font-mono-receipt text-emerald-950">
            <span>{data.bottledBatch || 'Seri No: KD-2026-08'}</span>
            <QRCodeRenderer value={data.bottledBatch || 'KD-2026-08'} size={28 * ratio} />
          </div>
        </div>
      );

    // 112. ARTISAN KOKTEYL ŞURUBU & BOTANİK ŞİŞE ETİKETİ
    case 'tpl-cocktail-syrup-apothecary':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <div className="flex items-center space-x-1">
              <IconSyrupBottleCocktail size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">{data.brandName || 'APOTHECARY BOTANICALS'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold">{data.bottleSize || '250 ml'}</span>
          </div>
          <div className="text-center py-1">
            <h3 className="font-artisan text-sm font-bold">{data.flavor || 'Mürver Çiçeği & Taze Biberiye Şurubu'}</h3>
            <p className="text-[9px] text-stone-600 mt-0.5">{data.cocktailPairing || 'Cin Tonik & Prosecco Kokteylleri İçin İdeal'}</p>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between text-[9px] font-mono-receipt">
            <span>Parti: {data.batchNo || 'BATCH #18'}</span>
            <span>Açıldıktan sonra buzdolabında saklayınız</span>
          </div>
        </div>
      );

    // 113. ORGANİK DÖKME ÇAY & DEMLEME KILAVUZU
    case 'tpl-specialty-tea-loose-leaf':
      return (
        <div className="p-3 border-2 border-emerald-900 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-emerald-900 pb-1">
            <span className="font-condensed-bold text-lg font-black text-emerald-950">{data.teaHouse || 'SILK ROAD TEA HOUSE'}</span>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">{data.origin || 'Rize Çamlıhemşin'}</span>
          </div>
          <div>
            <h3 className="font-artisan text-sm font-bold text-emerald-950">{data.teaName || 'Organik Beyaz Çay (Silver Needle)'}</h3>
            <p className="text-[9px] text-stone-600 mt-0.5">{data.flavorProfile || 'Hafif bal aroması, kavun notaları'}</p>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1.5 bg-stone-100 rounded text-[9px] font-mono-receipt text-stone-800">
            <div>Sıcaklık: <strong>{data.waterTemp || '80°C'}</strong></div>
            <div>Süre: <strong>{data.steepTime || '3-4 Dakika'}</strong></div>
          </div>
          <div className="border-t border-emerald-900 pt-1 flex justify-between text-[9px] font-mono-receipt">
            <span>Miktar: {data.doseAmount || '2.5g / 200ml Su'}</span>
            <span className="font-bold">{data.netWeight || '50 Gr'}</span>
          </div>
        </div>
      );

    // 114. DRY AGED DİNLENDİRİLMİŞ ET & KASAP KÜNYESİ
    case 'tpl-dry-aged-steak-butcher':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <span className="font-condensed-bold text-xl font-black">{data.butcherName || 'ARTISAN BUTCHER & DRY AGE'}</span>
            <span className="text-[9px] font-mono-receipt bg-black text-white px-1.5 py-0.5 rounded font-bold">{data.agingDays || '28 GÜN DİNLENDİRİLMİŞ'}</span>
          </div>
          <div className="py-0.5">
            <h3 className="font-condensed-bold text-lg font-black">{data.cutName || 'T-BONE STEAK (DANA PİRZOLA)'}</h3>
            <div className="text-[10px] font-mono-receipt text-stone-600 flex justify-between mt-0.5">
              <span>Irk: <strong>{data.breed || 'Angus / Balıkesir Mera'}</strong></span>
              <span>Ağırlık: <strong>{data.weightKg || '0.620 kg'}</strong></span>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Son Tüketim: {data.bestBefore || '18.08.2026'}</span>
            <BarcodeRenderer value={data.priceBarcode || '200845000620'} height={24 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 115. EV YAPIMI GELENEKSEL REÇEL & MARMELAT ETİKETİ
    case 'tpl-handmade-jam-preserve':
      return (
        <div className="p-3 border-2 border-red-900 font-artisan flex flex-col justify-between h-full space-y-2 bg-red-50/40">
          <div className="text-center border-b border-red-800 pb-1">
            <h2 className="text-base font-bold text-red-950 uppercase">{data.kitchenName || 'ANNEANNE MUTFAĞI'}</h2>
            <p className="text-[10px] italic text-red-800">{data.preserveType || 'Geleneksel Odun Ateşinde Kaynatılmış'}</p>
          </div>
          <div className="text-center py-1">
            <h3 className="font-bold text-sm text-red-950">{data.fruitName || 'Dağ Çileği & Karadut Reçeli'}</h3>
            <p className="text-[9px] font-clean text-stone-600 mt-0.5">{data.ingredients || 'Taze meyve, pancar şekeri, limon suyu (%70 Meyve Oranı)'}</p>
          </div>
          <div className="border-t border-red-800 pt-1 flex justify-between text-[9px] font-mono-receipt text-red-950">
            <span>Üretim: {data.prodDate || 'Temmuz 2026'}</span>
            <span className="font-bold">{data.netWeight || 'Net 380 Gr'}</span>
          </div>
        </div>
      );

    // 116. KLİNİK NUMUNE & BİYOKİMYA KAN TÜPÜ BARKODU
    case 'tpl-clinical-sample-vial-label':
      return (
        <div className="p-2.5 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1">
          <div className="flex justify-between items-center border-b border-black pb-0.5">
            <div className="flex items-center space-x-1">
              <IconMedicalSyringeVial size={18 * ratio} />
              <span className="font-mono-receipt font-bold text-xs">{data.patientId || 'P-984210'}</span>
            </div>
            <span className="text-[9px] font-bold bg-black text-white px-1 rounded">{data.tubeType || 'EDTA K2 (Mor Kapak)'}</span>
          </div>
          <div className="text-[10px] leading-tight">
            <div className="font-bold truncate">{data.patientName || 'Ayşe Kaya (42Y / K)'}</div>
            <div className="text-[9px] text-stone-600 font-mono-receipt">{data.testsRequested || 'Hemogram, Ferritin, B12, TSH'}</div>
          </div>
          <div className="flex justify-between items-center border-t border-black pt-1">
            <BarcodeRenderer value={data.sampleBarcode || '8841029410'} height={22 * ratio} width={1.1 * ratio} />
            <span className="text-[8px] font-mono-receipt">{data.drawTime || '14.08.2026 08:45'}</span>
          </div>
        </div>
      );

    // 117. MAJİSTRAL ECZACILIK İLAÇ HAZIRLAMA ŞİŞE ETİKETİ
    case 'tpl-pharma-compounding-bottle':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="text-center border-b-2 border-stone-800 pb-1">
            <span className="font-condensed-bold text-lg font-black">{data.pharmacyName || 'MERKEZ MAJİSTRAL ECZANESİ'}</span>
            <div className="text-[9px] font-mono-receipt text-stone-600">Reçete No: {data.rxNumber || 'RX-2026-8812'}</div>
          </div>
          <div className="text-[10px] space-y-1">
            <div><span className="font-bold">Hasta:</span> {data.patientName || 'Ali Kemal Demir'}</div>
            <div className="p-1 bg-stone-100 rounded text-[9px] font-mono-receipt">{data.formulaName || 'Klorheksidin %0.2 & Nistatin Gargara Çözeltisi (100ml)'}</div>
            <div className="font-bold text-stone-900 text-[10px]">{data.usageInstructions || 'Günde 3 kez yemeklerden sonra 1 kapak gargara yapınız'}</div>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Hazırlayan: {data.pharmacistSign || 'Ecz. E. Yılmaz'}</span>
            <span>SKT: {data.expiryDays || 'Hazırlandıktan sonra 15 gün'}</span>
          </div>
        </div>
      );

    // 118. OTOKLAV / CERRAHİ STERİLİZASYON İNDİKATÖR ETİKETİ
    case 'tpl-sterilization-autoclave-strip':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <span className="font-condensed-bold text-lg font-black">STERILIZATION PASSED</span>
            <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded">CLASS 4</span>
          </div>
          <div className="text-[10px] font-mono-receipt space-y-1">
            <div className="flex justify-between"><span>Set Adı:</span><strong className="font-clean">{data.setName || 'İmplant Cerrahi Seti #02'}</strong></div>
            <div className="flex justify-between"><span>Otoklav:</span><span>{data.autoclaveNo || 'Otoklav #03 (134°C / 18dk)'}</span></div>
            <div className="flex justify-between"><span>Steril Tarih:</span><span>{data.cycleDate || '14.08.2026 11:20'}</span></div>
          </div>
          <div className="border-t border-black pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Operatör: {data.operator || 'Hemşire M. Can'}</span>
            <BarcodeRenderer value={data.stripBarcode || 'ST-2026-9921'} height={22 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 119. DİŞ PROTEZ LABORATUVARI & HASTA VAKA FİŞİ
    case 'tpl-dental-lab-prosthetic-case':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconDentalTooth size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">{data.labName || 'DENTAL ART PROSTHETIC LAB'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold">{data.caseId || 'CASE-4491'}</span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-stone-600">Hekim / Klinik:</span><span className="font-bold">{data.dentistClinic || 'Dt. Burak Öz / DentArt'}</span></div>
            <div className="flex justify-between"><span className="text-stone-600">Hasta:</span><span>{data.patientName || 'Selin Yıldız'}</span></div>
            <div className="flex justify-between font-mono-receipt"><span>İşlem / Renk:</span><strong>{data.restorationType || 'Zirkonyum Köprü (#14-#16) • Renk: A2 Vita'}</strong></div>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between text-[9px] font-mono-receipt">
            <span>Teslim Tarihi: {data.deliveryDate || '19.08.2026 Saat: 16:00'}</span>
            <QRCodeRenderer value={data.caseId || 'CASE-4491'} size={28 * ratio} />
          </div>
        </div>
      );

    // 120. ACİL SERVİS HASTA BİLEKLİK & BARKOD ŞERİDİ
    case 'tpl-patient-wristband-emergency':
      return (
        <div className="p-2.5 border-2 border-red-600 font-clean flex flex-col justify-between h-full space-y-1 bg-red-50/20">
          <div className="flex justify-between items-center border-b border-red-500 pb-0.5">
            <span className="font-condensed-bold text-base font-black text-red-700">{data.hospitalName || 'ŞEHİR HASTANESİ ACİL SERVİS'}</span>
            <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 rounded">{data.triageColor || 'SARI ALAN (Triyaj 2)'}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <div>
              <div className="font-bold text-xs">{data.patientName || 'Kemal Aydın (34Y)'}</div>
              <div className="font-mono-receipt text-[9px] text-stone-600">Protokol: {data.protocolNo || 'ACIL-2026-99182'} • Kan: {data.bloodType || 'A Rh (+)'}</div>
            </div>
            <span className="text-[9px] font-bold text-red-600 border border-red-500 px-1 py-0.5 rounded">{data.allergyWarning || 'PENİSİLİN ALERJİSİ!'}</span>
          </div>
          <div className="flex justify-between items-center border-t border-red-500 pt-1">
            <BarcodeRenderer value={data.protocolNo || 'ACIL-2026-99182'} height={22 * ratio} width={1.1 * ratio} />
            <span className="text-[8px] font-mono-receipt">{data.admissionTime || '14.08.2026 03:15'}</span>
          </div>
        </div>
      );

    // 121. DYNO PERFORMANS TESTİ & MOTOR TUNING BELGESİ
    case 'tpl-auto-dyno-tuning-spec':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconCarChassisDyno size={24 * ratio} />
              <span className="font-condensed-bold text-xl font-black">{data.shopName || 'TURBO DYNAMICS MOTORSPORT'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt bg-black text-white px-1 py-0.5 rounded font-bold">DYNO RESULT</span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="font-bold">{data.vehicleModel || 'BMW M3 (F80) 3.0 Bi-Turbo'}</div>
            <div className="grid grid-cols-2 gap-1 p-1.5 bg-stone-100 rounded text-center">
              <div><span className="text-[8px] text-stone-500 block">MAX GÜÇ</span><span className="font-condensed-bold text-lg font-black">{data.horsepower || '510 WHP @ 6200 RPM'}</span></div>
              <div><span className="text-[8px] text-stone-500 block">MAX TORK</span><span className="font-condensed-bold text-lg font-black">{data.torque || '680 NM @ 3400 RPM'}</span></div>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-1 flex justify-between items-center text-[8px] font-mono-receipt">
            <span>Harita: {data.tuneMap || 'Stage 2 ECU + TCU Remap'}</span>
            <span>Test Eden: {data.tunerName || 'Chief Tech: S. Yener'}</span>
          </div>
        </div>
      );

    // 122. LASTİK OTELİ & MEVSİMSEK SAKLAMA BARKODU
    case 'tpl-tire-hotel-seasonal-storage':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <div className="flex items-center space-x-1">
              <IconTireSnowFlake size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">LASTİK OTELİ EMANET</span>
            </div>
            <span className="text-[10px] font-mono-receipt font-bold">{data.plateNo || '34 ABC 789'}</span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-stone-600">Müşteri:</span><span className="font-bold">{data.customerName || 'Volkan Çetin'}</span></div>
            <div className="flex justify-between"><span className="text-stone-600">Ebat / Adet:</span><span className="font-mono-receipt">{data.tireSpec || '225/45 R17 Michelin Pilot (4 Adet)'}</span></div>
            <div className="flex justify-between"><span className="text-stone-600">Diş Derinliği:</span><span className="font-bold">{data.treadDepth || '6.5 mm (Çok İyi)'}</span></div>
          </div>
          <div className="border-t border-stone-800 pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Raf: <strong>{data.rackPosition || 'RAF D-14 / KAT 3'}</strong></span>
            <BarcodeRenderer value={data.storageId || 'TIRE-889102'} height={22 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 123. KOMBİ / KLİMA BAKIM & GARANTİ MÜHÜR ETİKETİ
    case 'tpl-hvac-maintenance-warranty-seal':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconHeaterRadiator size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">{data.serviceBrand || 'KOMBİ & İKLİMLENDİRME SERVİSİ'}</span>
            </div>
            <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded">GARANTİLİ</span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-stone-600">Cihaz:</span><span className="font-bold">{data.applianceModel || 'Vaillant ecoTEC Plus 28kW'}</span></div>
            <div className="flex justify-between font-mono-receipt"><span>Bakım Tarihi:</span><span>{data.serviceDate || '14.08.2026'}</span></div>
            <div className="flex justify-between font-mono-receipt font-bold"><span>Sonraki Bakım:</span><span>{data.nextDueDate || 'Ağustos 2027'}</span></div>
          </div>
          <div className="border-t border-stone-900 pt-1 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Teknisyen: {data.technician || 'Murat Usta (Sicil #44)'}</span>
            <span>Tel: {data.contactPhone || '0850 444 00 22'}</span>
          </div>
        </div>
      );

    // 124. ELEKTRONİK KART (PCB) / SERİ NO & DONANIM KİMLİĞİ
    case 'tpl-pcb-electronic-serial-qr':
      return (
        <div className="p-2.5 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b border-black pb-0.5">
            <span className="font-condensed-bold text-base font-black">{data.boardModel || 'IOT-GATEWAY-V3.4'}</span>
            <span className="text-[9px] font-mono-receipt font-bold">HW: {data.hwRevision || 'REV 2.1'}</span>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-0.5">
            <div className="flex justify-between"><span>MAC:</span><span className="font-bold">{data.macAddress || 'EC:62:60:88:9B:1A'}</span></div>
            <div className="flex justify-between"><span>UID:</span><span>{data.uuid || '004A-98F1-B892'}</span></div>
          </div>
          <div className="border-t border-black pt-1 flex justify-between items-center">
            <BarcodeRenderer value={data.serialNumber || 'SN-2026-981240'} height={20 * ratio} width={1.0 * ratio} />
            <QRCodeRenderer value={`MAC=${data.macAddress || 'EC:62:60:88:9B:1A'}&SN=${data.serialNumber || 'SN-2026'}`} size={30 * ratio} />
          </div>
        </div>
      );

    // 125. LİTYUM İYON BATARYA TAŞIMA UYARISI (UN3481)
    case 'tpl-lithium-battery-un3481':
      return (
        <div className="p-3 border-4 border-red-600 font-clean flex flex-col justify-between h-full space-y-2 bg-white">
          <div className="text-center border-b-2 border-red-600 pb-1">
            <div className="flex justify-center mb-0.5"><IconBatteryLowCharging size={26 * ratio} className="text-red-600" /></div>
            <h2 className="font-condensed-bold text-xl font-black text-red-600 tracking-wider">UN 3481</h2>
            <p className="text-[9px] font-bold text-black uppercase">{data.dangerWarning || 'LITHIUM ION BATTERIES CONTAINED IN EQUIPMENT'}</p>
          </div>
          <p className="text-[9px] text-stone-800 text-center leading-tight font-mono-receipt">
            {data.handlingText || 'Hasar durumunda yanıcıdır! Koli hasar görmüşse derhal karantinaya alınız.'}
          </p>
          <div className="border-t-2 border-red-600 pt-1 text-center text-[9px] font-mono-receipt font-bold">
            ACİL DURUM / EMERGENCY TEL: {data.emergencyContact || '+90 212 999 00 11'}
          </div>
        </div>
      );

    // 126. GÜNEŞ ENERJİSİ (GES) İNVERTER DEVREYE ALMA ETİKETİ
    case 'tpl-solar-inverter-commissioning':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <span className="font-condensed-bold text-lg font-black">{data.plantName || 'GÜNEŞ ENERJİ SANTRALİ (GES)'}</span>
            <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded">KOMİSYON RAPORU</span>
          </div>
          <div className="text-[10px] space-y-1 font-mono-receipt">
            <div className="flex justify-between"><span>İnverter:</span><strong className="font-clean">{data.inverterId || 'INV-04 • Huawei SUN2000 (100KTL)'}</strong></div>
            <div className="flex justify-between"><span>DC Kapasite:</span><span>{data.dcCapacity || '120.4 kWp (8 String)'}</span></div>
            <div className="flex justify-between"><span>Devreye Alma:</span><span>{data.commissionDate || '14.08.2026'}</span></div>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Mühendis: {data.engineerSign || 'Müh. K. Aktaş'}</span>
            <QRCodeRenderer value={data.inverterId || 'INV-04-HUAWEI'} size={28 * ratio} />
          </div>
        </div>
      );

    // 127. NOSTALJİK SİNEMA & GALA GÖSTERİM BİLETİ
    case 'tpl-vintage-cinema-stub':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2 bg-amber-50/40">
          <div className="flex justify-between items-center border-b-2 border-dashed border-stone-800 pb-1">
            <div className="flex items-center space-x-1">
              <IconCinemaFilmTicket size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">{data.cinemaName || 'REX KÜLTÜR SİNEMASI'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold">{data.hallNumber || 'SALON 01 (35MM VINTAGE)'}</span>
          </div>
          <div className="text-center py-1">
            <h3 className="font-artisan text-base font-bold uppercase">{data.movieTitle || 'CINEMA PARADISO (1988)'}</h3>
            <div className="text-[10px] font-mono-receipt text-stone-700 mt-1">
              <span>{data.showTime || 'Cuma • 21:00'}</span> • <span>Sıra / Koltuk: <strong>{data.seatNumber || 'SIRA 08 • KOLTUK 14'}</strong></span>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-stone-800 pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Bilet: {data.ticketId || 'TKT-1988-0042'}</span>
            <BarcodeRenderer value={data.ticketId || 'TKT-1988-0042'} height={20 * ratio} width={1.0 * ratio} />
          </div>
        </div>
      );

    // 128. VIP KONSER & FESTİVAL BACKSTAGE GEÇİŞ KARTI
    case 'tpl-concert-vip-backstage-pass':
      return (
        <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-black text-white">
          <div className="text-center border-b border-stone-700 pb-1">
            <h2 className="font-condensed-bold text-xl font-black tracking-widest">{data.eventName || 'SUMMER SOUNDWAVE FESTIVAL'}</h2>
            <div className="inline-block bg-white text-black font-condensed-bold text-lg px-2 py-0.5 mt-1">
              {data.accessLevel || 'ALL ACCESS VIP BACKSTAGE'}
            </div>
          </div>
          <div className="text-center py-1 text-xs">
            <div className="font-bold text-stone-200">{data.passHolder || 'Defne Yılmaz (Artist Guest)'}</div>
            <div className="text-[9px] font-mono-receipt text-stone-400 mt-0.5">{data.validDates || '14-16 AĞUSTOS 2026'}</div>
          </div>
          <div className="border-t border-stone-700 pt-1 flex justify-between items-center">
            <span className="text-[8px] font-mono-receipt text-stone-400">{data.securityCode || 'SEC-PASS-998'}</span>
            <QRCodeRenderer value={data.securityCode || 'VIP-PASS-DEFNE'} size={32 * ratio} />
          </div>
        </div>
      );

    // 129. HAVALİMANI BAGAJ TRANSFER & UÇUŞ BAGAJ KUPONU
    case 'tpl-airline-baggage-transfer-tag':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <div className="flex items-center space-x-1.5">
              <IconLuggageBagTag size={24 * ratio} />
              <span className="font-condensed-bold text-2xl font-black">{data.destAirport || 'JFK'}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono-receipt font-bold">{data.flightNumber || 'TK 0001 (IST ➔ JFK)'}</span>
              <div className="text-[8px] text-stone-600 font-mono-receipt">Weight: {data.weightKg || '23.0 KG'}</div>
            </div>
          </div>
          <div className="text-[10px] space-y-0.5 font-mono-receipt">
            <div>Passenger: <strong className="font-clean">{data.passengerName || 'DEMIR / CAN MR'}</strong></div>
            <div>Final Dest: <strong>{data.finalDestination || 'NEW YORK (JFK Intl Airport)'}</strong></div>
          </div>
          <div className="border-t-2 border-black pt-1.5 flex flex-col items-center">
            <BarcodeRenderer value={data.baggageTag || 'TK-0235981240'} height={28 * ratio} width={1.2 * ratio} />
            <span className="text-[9px] font-mono-receipt font-bold tracking-widest mt-1">{data.baggageTag || 'TK-0235981240'}</span>
          </div>
        </div>
      );

    // 130. VIP VALE & KAPALI OTOPARK ARAÇ TESLİM FİŞİ
    case 'tpl-luxury-valet-parking-receipt':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b border-stone-800 pb-1">
            <span className="font-condensed-bold text-lg font-black">{data.hotelVenue || 'GRAND BOSPHORUS HOTEL & VALET'}</span>
            <span className="text-[10px] font-mono-receipt font-bold bg-black text-white px-1.5 py-0.5 rounded">VALET</span>
          </div>
          <div className="text-center py-1">
            <span className="text-[9px] text-stone-500 font-mono-receipt block">ARAÇ PLAKASI</span>
            <h3 className="font-condensed-bold text-2xl font-black">{data.plateNumber || '34 BJK 1903'}</h3>
            <div className="text-[10px] text-stone-600">{data.carModel || 'Porsche Taycan 4S • Metalik Gri'}</div>
          </div>
          <div className="border-t border-stone-800 pt-1.5 flex justify-between items-center text-[9px] font-mono-receipt">
            <span>Park Yeri: <strong>{data.parkSlot || 'VIP-KAT 1 / SLOT 12'}</strong></span>
            <BarcodeRenderer value={data.valetTicketNo || 'VALET-99412'} height={22 * ratio} width={1.1 * ratio} />
          </div>
        </div>
      );

    // 131. VESTİYER & EMANET ASKI NUMARATÖR FİŞİ
    case 'tpl-cloakroom-coat-check-token':
      return (
        <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
          <div className="border-b-2 border-black pb-1">
            <span className="font-condensed-bold text-base font-bold uppercase">{data.venueName || 'OPERA & BALE MERKEZİ'}</span>
            <p className="text-[9px] text-stone-600 font-mono-receipt">{data.serviceTitle || 'Vestiyer & Emanet Fişi'}</p>
          </div>
          <div className="py-2">
            <span className="text-[10px] font-mono-receipt text-stone-500 block">ASKI NO</span>
            <span className="font-condensed-bold text-4xl font-black">{data.hangerNumber || '# 142'}</span>
          </div>
          <div className="border-t-2 border-black pt-1 text-[8px] font-mono-receipt text-stone-600">
            {data.disclaimer || 'Bu fiş olmadan emanet teslim edilemez.'}
          </div>
        </div>
      );

    // 132. RETRO 3.5" DİSKET & RETRO YAZILIM ARŞİV ETİKETİ
    case 'tpl-retro-floppy-disk-label':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5 bg-stone-100">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <div className="flex items-center space-x-1">
              <IconRetroComputerUndo size={20 * ratio} />
              <span className="font-mono-receipt font-bold text-xs">FLOPPY 3.5" HD</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold bg-black text-white px-1">1.44 MB</span>
          </div>
          <div className="py-1">
            <h3 className="font-condensed-bold text-base font-black uppercase">{data.diskTitle || 'MS-DOS 6.22 SYSTEM INSTALL'}</h3>
            <p className="text-[9px] font-mono-receipt text-stone-600">{data.diskSubtitle || 'Disk 1 of 3 (Setup & Utilities)'}</p>
          </div>
          <div className="border-t border-black pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Format: {data.formatType || 'FAT12 • High Density'}</span>
            <span>Tarih: {data.archiveDate || '08/1994'}</span>
          </div>
        </div>
      );

    // 133. NOSTALJİK KASET / MIXTAPE ŞARKI LİSTESİ
    case 'tpl-cassette-mixtape-jcard':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-1.5 bg-stone-50">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <span className="font-condensed-bold text-base font-black">{data.tapeTitle || 'SUMMER NOSTALGIA MIXTAPE 98'}</span>
            <span className="text-[9px] font-mono-receipt font-bold bg-stone-800 text-white px-1.5 py-0.5 rounded">{data.side || 'SIDE A (60 MIN)'}</span>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-1 py-1">
            <div className="border-b border-stone-200 pb-0.5">1. {data.track1 || 'Massive Attack - Teardrop'}</div>
            <div className="border-b border-stone-200 pb-0.5">2. {data.track2 || 'Portishead - Glory Box'}</div>
            <div className="border-b border-stone-200 pb-0.5">3. {data.track3 || 'The Cranberries - Dreams'}</div>
            <div>4. {data.track4 || 'Radiohead - Fake Plastic Trees'}</div>
          </div>
          <div className="border-t border-stone-900 pt-1 text-[8px] font-mono-receipt italic text-center text-stone-600">
            {data.dedication || 'For roadtrips with open windows and sunsets.'}
          </div>
        </div>
      );

    // 134. VHS VİDEO KASET SIRT & ARŞİV ETİKETİ
    case 'tpl-vhs-video-tape-spine-sticker':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b-2 border-black pb-0.5">
            <span className="font-condensed-bold text-lg font-black">VHS HQ PAL</span>
            <span className="text-[9px] font-mono-receipt font-bold">{data.duration || 'SP 180 MIN'}</span>
          </div>
          <div className="py-1">
            <h3 className="font-artisan text-sm font-bold">{data.videoTitle || 'AİLE ARŞİVİ - YAZ 1996 TATİLİ'}</h3>
            <p className="text-[9px] font-mono-receipt text-stone-600 mt-0.5">{data.recordingDetails || 'Antalya & Kaş Seyahati, Doğum Günü Kutlaması'}</p>
          </div>
          <div className="border-t border-black pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Kayıt: {data.recordingDate || 'Temmuz 1996'}</span>
            <span className="font-bold">{data.tapeNumber || 'TAPE #12'}</span>
          </div>
        </div>
      );

    // 135. ANALOG FOTOĞRAF FİLMİ & GELİŞTİRME KÜNYESİ
    case 'tpl-photographic-film-roll-dx':
      return (
        <div className="p-3 border-2 border-stone-900 font-clean flex flex-col justify-between h-full space-y-2 bg-stone-100">
          <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
            <span className="font-condensed-bold text-xl font-black">{data.filmStock || 'KODAK TRI-X 400'}</span>
            <span className="text-[9px] font-mono-receipt font-bold bg-black text-white px-1.5 py-0.5 rounded">{data.isoRating || 'ISO 400 / 36 EXP'}</span>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-1">
            <div>Kamera: <strong className="font-clean">{data.cameraLens || 'Leica M6 • 35mm Summicron'}</strong></div>
            <div>Geliştirici: <strong>{data.developerChemical || 'Kodak D-76 (1:1 / 20°C / 9.5 dk)'}</strong></div>
          </div>
          <div className="border-t border-stone-900 pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Rulo: {data.rollNumber || 'ROLL #2026-08'}</span>
            <span>Tarih: {data.shotDate || 'Ağustos 2026'}</span>
          </div>
        </div>
      );

    // 136. NOSTALJİK DYMO KABARTMA PLASTİK ŞERİT ETİKET
    case 'tpl-vintage-dymo-embossed-tape':
      return (
        <div className="p-3 border-2 border-stone-900 font-mono-receipt flex flex-col justify-between h-full space-y-2 bg-stone-900 text-white rounded-sm">
          <div className="text-center py-2">
            <span className="text-lg font-black tracking-widest uppercase border border-white/40 px-2 py-1 bg-stone-950 inline-block shadow-inner">
              {data.embossedText || 'OFFICE SUPPLIES ONLY'}
            </span>
          </div>
          <div className="border-t border-stone-700 pt-1 flex justify-between text-[8px] text-stone-400">
            <span>{data.subtext || 'DYMO EMBOSSED 9MM TAPE'}</span>
            <span>CLASSIC RETRO</span>
          </div>
        </div>
      );

    // 137. SAKSI BİTKİSİ & BOTANİK BAKIM KILAVUZU
    case 'tpl-indoor-botanical-care-plant':
      return (
        <div className="p-3 border-2 border-emerald-900 font-clean flex flex-col justify-between h-full space-y-2 bg-emerald-50/40">
          <div className="flex justify-between items-center border-b border-emerald-900 pb-1">
            <div className="flex items-center space-x-1.5">
              <IconPlantSproutWater size={22 * ratio} className="text-emerald-800" />
              <span className="font-artisan text-base font-bold text-emerald-950">{data.plantName || 'Monstera Deliciosa'}</span>
            </div>
            <span className="text-[9px] font-mono-receipt italic text-emerald-800">{data.botanicalLatin || 'Deve Tabanı'}</span>
          </div>
          <div className="text-[9px] space-y-1 text-emerald-950">
            <div className="flex justify-between"><span>Işık İhtiyacı:</span><strong>{data.lightRequirement || 'Dolaylı Parlak Işık (Yarı Gölge)'}</strong></div>
            <div className="flex justify-between"><span>Sulama Sıklığı:</span><strong>{data.waterSchedule || 'Toprak kurudukça (Haftada 1-2)'}</strong></div>
            <div className="flex justify-between"><span>Nem / Sıcaklık:</span><span>{data.humidityLevel || '%60+ Nem • 18-26°C'}</span></div>
          </div>
          <div className="border-t border-emerald-900 pt-1 flex justify-between text-[8px] font-mono-receipt text-emerald-900">
            <span>Saksı Değişimi: {data.repottedDate || 'İlkbahar 2026'}</span>
            <span>Evcil Hayvan: Toksik ⚠️</span>
          </div>
        </div>
      );

    // 138. ATALIK TOHUM & ORGANİK BAHÇE EKİM PAKETİ
    case 'tpl-seed-packet-heirloom-variety':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2 bg-amber-50/50">
          <div className="text-center border-b border-stone-800 pb-1">
            <span className="text-[9px] font-bold tracking-wider uppercase bg-stone-800 text-white px-1.5 py-0.5 rounded">ATALIK TOHUM</span>
            <h3 className="font-artisan text-base font-bold mt-1 text-stone-950">{data.seedVariety || 'Ayaş Köy Domatesi (Heirloom)'}</h3>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-1">
            <div className="flex justify-between"><span>Ekim Zamanı:</span><strong>{data.sowingMonth || 'Mart - Nisan (Fide)'}</strong></div>
            <div className="flex justify-between"><span>Çimlenme:</span><span>{data.germinationDays || '7-14 Gün / 22°C'}</span></div>
            <div className="flex justify-between"><span>Hasat Süresi:</span><span>{data.harvestDays || '80-90 Gün'}</span></div>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Hasat Yılı: {data.harvestYear || '2026 Tohum Hasadı'}</span>
            <span>{data.organicCert || 'GDO\'suz • Doğal'}</span>
          </div>
        </div>
      );

    // 139. EL YAPIMI SERAMİK & ÇÖMLEKÇİ İMZALI KOLEKSİYON ETİKETİ
    case 'tpl-handmade-pottery-ceramics':
      return (
        <div className="p-3 border-2 border-stone-800 font-artisan flex flex-col justify-between h-full space-y-2">
          <div className="text-center border-b border-stone-800 pb-1">
            <h2 className="text-base font-bold uppercase">{data.studioName || 'TOPRAK & ATEŞ SERAMİK ATÖLYESİ'}</h2>
            <p className="text-[10px] italic text-stone-600">{data.pieceType || 'El Yapımı Çift Pişirim Seramik Kupa'}</p>
          </div>
          <div className="text-[9px] font-clean space-y-1">
            <div><span className="font-bold">Kil & Sır:</span> {data.clayGlaze || 'Kırmızı Şamotlu Kil • Reaktif Mat Kül Sırı'}</div>
            <div className="flex justify-between font-mono-receipt text-stone-700">
              <span>Pişirim: {data.firingTemp || '1220°C Yüksek Derece'}</span>
              <span>Gıdaya Uygun ✓</span>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between items-center text-[8px] font-mono-receipt">
            <span>Sanatçı: {data.artisanSign || 'Deniz Soylu'}</span>
            <span>Parça: {data.edition || 'Edisyon #14 / 50'}</span>
          </div>
        </div>
      );

    // 140. HAKİKİ DERİ & EL DİKİŞİ ZANAATKÂR GARANTİ KARTI
    case 'tpl-leather-goods-craftsmanship':
      return (
        <div className="p-3 border-2 border-amber-950 font-clean flex flex-col justify-between h-full space-y-2 bg-amber-50/30">
          <div className="text-center border-b border-amber-900 pb-1">
            <h2 className="font-condensed-bold text-xl font-black tracking-wider text-amber-950">{data.brandName || 'LEATHER CRAFT ATELIER'}</h2>
            <p className="text-[9px] text-amber-800 italic">{data.itemType || 'El Dikişi Minimal Kartlık Cüzdan'}</p>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-1 text-amber-950">
            <div>Deri: <strong>{data.leatherType || 'Bitkisel Tabaklanmış (Veg-Tan) Toskana Derisi'}</strong></div>
            <div>İplik: <strong>{data.threadDetails || 'Mumlanmış Keten İp • Geleneksel Saraç Dikişi'}</strong></div>
          </div>
          <div className="border-t border-amber-900 pt-1 flex justify-between items-center text-[8px] font-mono-receipt text-amber-950">
            <span>Usta: {data.craftsman || 'Usta: Emre S.'}</span>
            <span>Ömür Boyu Dikiş Garantisi</span>
          </div>
        </div>
      );

    // 141. AROMATERAPİ SOYA MUMU & GÜVENLİK TALİMATI
    case 'tpl-natural-soy-candle-safety':
      return (
        <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2">
          <div className="text-center border-b border-stone-800 pb-1">
            <h2 className="font-artisan text-base font-bold">{data.candleBrand || 'LUMEN BOTANICAL CANDLES'}</h2>
            <p className="text-[10px] italic text-stone-600">{data.scentName || 'Sedir Ağacı, Vanilya & Lavanta'}</p>
          </div>
          <div className="text-[9px] space-y-1">
            <div className="flex justify-between font-mono-receipt"><span>İçerik:</span><strong>{data.waxType || '%100 Doğal Soya Mumu & Ahşap Fitil'}</strong></div>
            <div className="flex justify-between font-mono-receipt"><span>Yanma Süresi:</span><strong>{data.burnTime || '~45 Saat'}</strong></div>
            <div className="p-1 bg-stone-100 rounded text-[8px] text-stone-700 text-center">
              {data.safetyTips || 'Fitili yakmadan önce 5mm kısaltınız. Çocuklardan uzak tutunuz.'}
            </div>
          </div>
          <div className="border-t border-stone-800 pt-1 text-center text-[8px] font-mono-receipt text-stone-600">
            {data.batchNo || 'El Yapımı Küçük Parti • BATCH #26'}
          </div>
        </div>
      );

    // 142. POMODORO ODAKLANMA & ÇALIŞMA SEANSI GÜNLÜĞÜ
    case 'tpl-pomodoro-focus-session-log':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <div className="flex items-center space-x-1.5">
              <IconHourglassSand size={22 * ratio} />
              <span className="font-condensed-bold text-lg font-black">POMODORO FOCUS SESSION</span>
            </div>
            <span className="text-[9px] font-mono-receipt font-bold">{data.sessionDate || '14.08.2026'}</span>
          </div>
          <div>
            <span className="text-[9px] text-stone-500 font-mono-receipt">HEDEF GÖREV</span>
            <div className="font-bold text-xs leading-snug">{data.mainTask || 'TypeScript Refactor & API Dokümantasyonu'}</div>
          </div>
          <div className="p-2 bg-stone-100 rounded text-center">
            <span className="text-[9px] font-mono-receipt text-stone-600 block">TAMAMLANAN BLOKLAR</span>
            <span className="text-xl font-black font-condensed-bold tracking-widest">{data.completedBlocks || '🍅 🍅 🍅 🍅 (4 x 25dk = 100dk)'}</span>
          </div>
          <div className="border-t border-black pt-1 flex justify-between text-[8px] font-mono-receipt">
            <span>Odak Skoru: {data.focusScore || '%95 Derin Odaklanma'}</span>
            <span>Mola: {data.breakNotes || '5dk Nefes Molası ✓'}</span>
          </div>
        </div>
      );

    // 143. GÜNLÜK SU TÜKETİMİ & HİDRASYON ÇETELESİ
    case 'tpl-daily-water-hydration-tracker':
      return (
        <div className="p-3 border-2 border-blue-900 font-clean flex flex-col justify-between h-full space-y-2 bg-blue-50/30">
          <div className="flex justify-between items-center border-b border-blue-900 pb-1">
            <span className="font-condensed-bold text-lg font-black text-blue-950">DAILY HYDRATION TRACKER</span>
            <span className="text-[9px] font-mono-receipt font-bold text-blue-900">{data.trackerDate || 'Bugün'}</span>
          </div>
          <div className="text-center py-1">
            <span className="text-[9px] text-blue-800 font-mono-receipt block">HEDEF TÜKETİM</span>
            <span className="text-2xl font-black font-condensed-bold text-blue-950">{data.targetLitres || '2.5 LİTRE (8 Bardak)'}</span>
          </div>
          <div className="p-1.5 bg-white border border-blue-200 rounded text-center">
            <div className="font-mono-receipt text-xs tracking-widest text-blue-900 font-bold">
              {data.glassCheckboxes || '[ ✓ ] [ ✓ ] [ ✓ ] [ ✓ ] [   ] [   ] [   ] [   ]'}
            </div>
            <span className="text-[8px] text-stone-500 mt-0.5 block">{data.motivationNote || 'Her bardak için bir kutu işaretleyin!'}</span>
          </div>
          <div className="border-t border-blue-900 pt-1 text-center text-[8px] font-mono-receipt text-blue-900">
            Daha fazla enerji ve net odaklanma için düzenli su içiniz.
          </div>
        </div>
      );

    // 144. ERTELEME SAVAR / BUGÜNÜN 3 KRİTİK GÖREVİ
    case 'tpl-anti-procrastination-challenge':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
          <div className="bg-black text-white text-center py-1 font-condensed-bold text-lg tracking-wider">
            {data.challengeTitle || 'RULE OF 3: DO NOT PROCRASTINATE'}
          </div>
          <div className="text-[10px] font-clean space-y-1.5 py-1">
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-1">
              <span className="font-bold font-mono-receipt bg-stone-200 px-1 rounded">1</span>
              <span className="font-semibold">{data.priority1 || 'Yatırımcı sunum dosyasını tamamla'}</span>
            </div>
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-1">
              <span className="font-bold font-mono-receipt bg-stone-200 px-1 rounded">2</span>
              <span className="font-semibold">{data.priority2 || 'Müşteri destek maillerini yanıtla'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold font-mono-receipt bg-stone-200 px-1 rounded">3</span>
              <span className="font-semibold">{data.priority3 || '45 dakika koşu & esneme yap'}</span>
            </div>
          </div>
          <div className="border-t-2 border-black pt-1 text-center text-[8px] font-mono-receipt italic text-stone-600">
            {data.mantra || 'Küçük adımlar büyük başarılar yaratır. Şimdi başla!'}
          </div>
        </div>
      );

    // 145. KİTAP OKUMA NOTU & ALINTI AYRACI
    case 'tpl-reading-journal-book-spine':
      return (
        <div className="p-3 border-2 border-stone-800 font-artisan flex flex-col justify-between h-full space-y-2 bg-stone-50">
          <div className="border-b border-stone-800 pb-1 text-center">
            <h3 className="font-bold text-sm text-stone-950 uppercase">{data.bookTitle || 'OTONOM SAVAŞLAR VE GELECEK'}</h3>
            <p className="text-[10px] italic text-stone-600">{data.author || 'Yazar: Ray Kurzweil'}</p>
          </div>
          <div className="text-center py-1">
            <p className="text-[10px] italic text-stone-900 leading-relaxed font-artisan">
              "{data.favoriteQuote || 'Gelecek onu bugünden inşa edenlerin hayal gücüne aittir.'}"
            </p>
          </div>
          <div className="border-t border-stone-800 pt-1 flex justify-between text-[8px] font-mono-receipt text-stone-700">
            <span>Sayfa: {data.pageNumber || 'Sayfa 142'}</span>
            <span>Tarih: {data.dateRead || 'Ağustos 2026'}</span>
          </div>
        </div>
      );

    // 146. 30 GÜNLÜK ALIŞKANLIK & ZİNCİRİ KIRMA ÇETELESİ
    case 'tpl-habit-tracker-30-day-grid':
      return (
        <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <span className="font-condensed-bold text-lg font-black">{data.habitName || '30 GÜN SABAH ERKEN KALKMA (06:00)'}</span>
            <span className="text-[9px] font-mono-receipt font-bold">{data.monthYear || 'AĞUSTOS 2026'}</span>
          </div>
          <div className="py-1">
            <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-mono-receipt">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="border border-stone-400 p-0.5 rounded text-[8px]">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-black pt-1 flex justify-between text-[8px] font-mono-receipt text-stone-700">
            <span>Hedef: {data.targetGoal || '30 Gün Kesintisiz Zincir'}</span>
            <span>ZİNCİRİ KIRMA! ⚡</span>
          </div>
        </div>
      );

    // 147. ACİL DURUM / ÇEVRİMDIŞI KASA & MÜHÜRLÜ BELGE
    case 'tpl-emergency-offline-crypto-paper':
      return (
        <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-stone-100">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <span className="font-condensed-bold text-lg font-black">TOP SECRET SEALED VAULT</span>
            <span className="text-[9px] font-mono-receipt font-bold bg-black text-white px-1">OFFLINE ONLY</span>
          </div>
          <div className="text-[9px] font-mono-receipt space-y-1">
            <div>Kasa No: <strong className="font-bold">{data.vaultName || 'SEC-SAFE-01 (Ana Çelik Kasa)'}</strong></div>
            <div>Kurtarma İpucu: <span className="italic">{data.seedHint || 'Mavi defter sayfa 42 içindeki kelimeler'}</span></div>
          </div>
          <div className="border-t-2 border-black pt-1.5 flex justify-between items-center text-[8px] font-mono-receipt">
            <span>Mühürleyen: {data.sealedBy || 'Kasa Yöneticisi #01'}</span>
            <BarcodeRenderer value={data.sealSerial || 'VAULT-SEAL-88912'} height={20 * ratio} width={1.0 * ratio} />
          </div>
        </div>
      );

    // 148. AŞIRI KAFEİN & DİKKAT DAĞITICI YASAK ALANI
    case 'tpl-danger-high-caffeine-dose':
      return (
        <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
          <div className="bg-black text-white py-1 font-condensed-bold text-xl tracking-wider">
            {data.dangerTitle || 'DANGER: HIGH CAFFEINE AREA'}
          </div>
          <div className="py-1">
            <IconSkullCrossbones size={36 * ratio} className="mx-auto text-black mb-1" />
            <h3 className="font-condensed-bold text-base font-black uppercase">{data.warningSubtext || 'GİRİŞ YALNIZCA KOD YAZANLARA AÇIKTIR'}</h3>
            <p className="text-[9px] font-mono-receipt text-stone-600 mt-0.5">{data.prohibitedItems || 'Telefon bildirimleri ve toplantı davetleri yasaktır!'}</p>
          </div>
          <div className="border-t-2 border-black pt-1 text-[8px] font-mono-receipt font-bold">
            {data.authorizedPersonnel || 'YETKİLİ: Baş Mühendis & Gece Vardiyası'}
          </div>
        </div>
      );

    // 149. YILBAŞI / ÖZEL GÜN SÜRPRİZ KUTU MÜHÜRÜ
    case 'tpl-do-not-open-until-christmas':
      return (
        <div className="p-3 border-2 border-red-800 font-clean flex flex-col justify-between h-full space-y-2 bg-red-50/40">
          <div className="text-center border-b border-red-800 pb-1">
            <div className="flex justify-center mb-0.5"><IconGiftBowRibbon size={24 * ratio} className="text-red-800" /></div>
            <h2 className="font-condensed-bold text-lg font-black text-red-950 uppercase">{data.sealTitle || 'TOP SECRET • SPECIAL DELIVERY'}</h2>
          </div>
          <div className="text-center py-1">
            <span className="text-sm font-black font-condensed-bold text-red-900 tracking-wider bg-red-100 px-2 py-0.5 rounded border border-red-300 inline-block">
              {data.prohibitionDate || 'DO NOT OPEN UNTIL 31 DECEMBER'}
            </span>
            <p className="text-[10px] font-artisan text-stone-800 mt-1">{data.recipientSender || 'Kime: Sevgili Defne • Kimden: Gizli Noel Baba'}</p>
          </div>
          <div className="border-t border-red-800 pt-1 text-center text-[8px] font-mono-receipt text-red-800">
            {data.penaltyNote || 'Erken açanlara sürpriz hediyeler iptal olur!'}
          </div>
        </div>
      );

    // 150. KLASİK TİPOGRAFİK TEŞEKKÜR & BUTİK SİPARİŞ KARTI
    case 'tpl-classic-typography-thank-you-card':
      return (
        <div className="p-3 border-2 border-stone-800 font-artisan flex flex-col justify-between h-full space-y-2 bg-stone-50">
          <div className="text-center border-b border-stone-800 pb-1">
            <h2 className="text-base font-bold uppercase">{data.thankYouHeader || 'Thank You For Supporting Small Business!'}</h2>
            <p className="text-[10px] italic text-stone-600 font-artisan">{data.personalizedNote || 'Bu sipariş sizin için özen ve sevgiyle elde hazırlandı.'}</p>
          </div>
          <div className="text-center py-1 bg-stone-100 rounded border border-stone-200">
            <span className="text-[9px] font-mono-receipt text-stone-500 block">BİR SONRAKİ SİPARİŞİNİZ İÇİN HEDİYE</span>
            <span className="font-mono-receipt font-bold text-xs text-stone-900">{data.couponCode || 'KOD: THANKYOU15 (%15 İndirim)'}</span>
          </div>
          <div className="border-t border-stone-800 pt-1 text-center text-[8px] font-mono-receipt text-stone-600">
            {data.socialMedia || '@atelierslowlife • Paylaşımlarınızı etiketleyin!'}
          </div>
        </div>
      );

    default:
      return null;
  }
};
