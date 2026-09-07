import React, { useRef, useState, useLayoutEffect } from 'react';
import { ThermalTemplate, ThermalPaperStyle } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { QRCodeRenderer } from './QRCodeRenderer';
import {
  IconFragileGlass,
  IconTwoArrowsUp,
  IconUmbrella,
  IconRecycleBadge,
  IconGlobeRestricted,
  IconCEMark,
  IconAge18,
  BotanicalStamp,
  IconThisSideUp,
  IconWashTub,
  IconDoNotBleach,
  IconTumbleDry,
  IconDoNotIron,
  IconBrokenWineGlassBig,
  IconShoeTrampleWarning,
  IconKeepDryUmbrella,
  IconUpwardArrowsHeavy,
  IconVintageCrossedCutlery,
  IconVintageForkBanner,
  IconCoffeeBeans,
  IconAirplaneFlight,
  IconMovieClapper,
  IconWheatEars,
  IconCandleFlame,
  IconWrenchGear,
  IconLuggageBag,
  IconBookDue,
  IconBeerHops,
  IconBotanicalLeafCare,
  IconVipStarBadge,
  IconDiamondRing,
  IconCarValet,
  IconPizzaSeal,
  IconHotelKeyRetro,
  IconMedicalTube,
  IconNaturalSoapBar,
  IconRoseBouquet,
  IconWifiTable,
  IconOliveBranchWreath,
  IconFitnessDumbbell,
  IconSneakerShoe,
  IconTeaCupLeaf,
  IconForkliftPallet,
  IconFireFlame,
  IconFireExtinguisher,
  IconEmergencyExitDoor,
  IconSlippingFallingPerson,
  IconCautionTriangle,
  IconHighVoltage,
  IconBiohazard,
  IconAudioCassetteTape,
  IconVinylTurntable,
  IconVeterinaryPaw,
  IconSushiSet,
  IconSpaLotusFlower,
  IconBookmarkRibbon,
  IconGlassesOptic,
  IconDentalTooth,
  IconDropperBottle,
  IconEngineOilGauge,
  IconChocolateBar,
  IconSyrupBottleCocktail,
  IconNutHazelnut,
  IconSpiceJarHerbs,
  IconBabyFootprint,
  IconWeddingRingsInterlocked,
  IconDoNotStack,
  IconQcPassedStamp,
  IconSkullCrossbones,
  IconEyeOffCrossed,
  IconBatteryLowCharging,
  IconToolWrenchScrewdriver,
  IconSharkFinDanger,
  IconUfoAlienSaucer,
  IconBrokenHeartFragile,
  IconRecycleTriangleLogo,
  IconNewspaperArticle
} from './ThermalIcons';
import { renderBatch3Template } from './ThermalTemplatesBatch3';
import { ThermalTemplatesEcommerce } from './ThermalTemplatesEcommerce';

interface ThermalTemplateRendererProps {
  template: ThermalTemplate;
  data: Record<string, any>;
  widthMm?: number;
  heightMm?: number;
  paperStyle?: ThermalPaperStyle;
  isPrintMode?: boolean;
  scale?: number; // visual zoom multiplier
  className?: string;
  id?: string;
}

export const ThermalTemplateRenderer: React.FC<ThermalTemplateRendererProps> = ({
  template,
  data,
  widthMm = 57,
  heightMm,
  paperStyle = 'standard',
  isPrintMode = false,
  scale = 1,
  className = '',
  id
}) => {
  // Base design width for standard thermal labels is 384px (57mm canonical print resolution).
  // Calculate adaptive scale ratio based on paper width for typography and icons
  const isCompact = widthMm <= 57;
  const isMedium = widthMm > 57 && widthMm <= 80;
  const isLarge = widthMm >= 100;
  const ratio = isCompact ? 1 : isMedium ? 1.2 : 1.5;

  // Paper style classes with complete thermal mode support (White, Kraft, Matrix, Black)
  const getPaperClasses = () => {
    if (isPrintMode) return 'print-monochrome';
    switch (paperStyle) {
      case 'vintage':
        return 'thermal-paper thermal-mode-kraft text-stone-900 border border-stone-400';
      case 'dither':
        return 'thermal-paper thermal-mode-matrix text-black border border-stone-400';
      case 'invert':
        return 'thermal-paper thermal-mode-black text-white border border-stone-800';
      case 'standard':
      default:
        return 'thermal-paper thermal-mode-white text-black border border-stone-300';
    }
  };

  const renderTemplateContent = () => {
    // Check if template is an ecommerce / marketplace shipping template
    if (
      template.id.startsWith('tpl-trendyol') ||
      template.id.startsWith('tpl-hepsiburada') ||
      template.id.startsWith('tpl-amazon') ||
      template.id.startsWith('tpl-ciceksepeti') ||
      template.id.startsWith('tpl-universal') ||
      template.id.startsWith('tpl-ecommerce')
    ) {
      return <ThermalTemplatesEcommerce id={template.id} data={data} widthMm={widthMm} />;
    }

    // Check if template is in Batch 3 (Templates 101 to 150)
    const batch3Result = renderBatch3Template({ templateId: template.id, data, ratio, widthMm });
    if (batch3Result) {
      return batch3Result;
    }

    switch (template.id) {
      // 1. MONDAYS SHOULD BE OPTIONAL (Brutalist Sticker - Ref 1)
      case 'tpl-mondays-brutalist':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2">
            {/* Top row */}
            <div className="flex justify-between items-baseline border-b-2 border-black pb-1">
              <span className="font-condensed-bold text-lg md:text-xl tracking-wider font-extrabold">{data.topPrefix || 'MONDAYS'}</span>
              <span className="font-clean text-xs font-bold tracking-widest">{data.topAction || 'SHOULD'}</span>
              <span className="font-condensed-bold text-lg md:text-xl tracking-wider font-extrabold">{data.topSuffix || 'BE'}</span>
            </div>

            {/* Giant Title */}
            <div className="text-center py-1 border-b-2 border-black">
              <h1 className="font-condensed-bold text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
                {data.mainTitle || 'OPTIONAL'}
              </h1>
            </div>

            {/* 2-Column Quotes */}
            <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2 text-[8px] md:text-[9.5px] leading-tight font-semibold">
              <div className="border-r-2 border-black pr-1.5 uppercase font-mono-receipt">
                {data.leftQuote}
              </div>
              <div className="pl-1.5 uppercase font-mono-receipt">
                {data.rightQuote}
              </div>
            </div>

            {/* Barcode & Parental Advisory Block */}
            <div className="grid grid-cols-3 gap-1 border-b-2 border-black pb-1.5 items-center">
              <div className="col-span-2 flex flex-col items-center">
                <BarcodeRenderer value={data.barcodeVal || '0.123.456.789.0'} height={28 * ratio} width={1.3 * ratio} fontSize={8} />
                <div className="flex justify-between w-full text-[7px] font-mono-receipt tracking-wider font-bold mt-0.5">
                  <span>CODE: {data.barcodeVal}</span>
                  <span className="truncate">{data.barcodeCredit}</span>
                </div>
              </div>
              <div className="border-2 border-black p-0.5 text-center flex flex-col justify-center">
                <span className="text-[6px] font-extrabold uppercase tracking-tight">{data.advisoryLabel || 'PARENTAL'}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter bg-black text-white px-0.5 py-0.5 my-0.5 leading-none">
                  ADVISORY
                </span>
                <span className="text-[5.5px] font-bold uppercase">{data.advisorySub || 'EXPLICIT VIBES'}</span>
              </div>
            </div>

            {/* Restricted & Badges Footer */}
            <div className="grid grid-cols-3 gap-1 items-stretch">
              <div className="col-span-2 border-2 border-black p-1 flex items-center gap-1.5">
                <IconGlobeRestricted size={22 * ratio} />
                <div className="leading-tight">
                  <div className="text-[8px] font-black tracking-wider bg-black text-white px-1 py-0.5 inline-block uppercase">
                    {data.restrictedTitle || 'RESTRICTED'}
                  </div>
                  <p className="text-[6px] font-bold mt-0.5 uppercase opacity-90 line-clamp-2">
                    {data.restrictedSub}
                  </p>
                </div>
              </div>
              <div className="border-2 border-black p-1 flex flex-wrap items-center justify-around gap-1">
                <IconRecycleBadge size={16 * ratio} />
                <IconCEMark size={16 * ratio} />
                <IconAge18 size={16 * ratio} />
              </div>
            </div>
          </div>
        );

      // 2. ALMOND SEA SALT (Artisan Food / Chocolate - Ref 2)
      case 'tpl-almond-sea-salt':
        return (
          <div className="p-3.5 border border-black font-mono-receipt flex flex-col justify-between h-full space-y-2.5">
            {/* Header */}
            <div className="flex justify-between items-baseline border-b border-black pb-1.5">
              <h2 className="font-mono-receipt text-sm md:text-base font-bold tracking-widest uppercase">
                {data.productName}
              </h2>
              <div className="text-right leading-none">
                <span className="text-[8px] opacity-75 block font-sans uppercase">BATCH NO.</span>
                <span className="text-xs font-bold text-red-600 font-mono-receipt">{data.batchNo}</span>
              </div>
            </div>

            {/* Weight Bar */}
            <div className="border-b border-black pb-1 text-[9px] font-semibold tracking-wider uppercase">
              {data.weight}
            </div>

            {/* Cacao & Diet Section */}
            <div className="grid grid-cols-3 gap-2 border-b border-black pb-2 items-center">
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black font-condensed-bold">{data.cacaoPercent}</span>
                <span className="text-[8px] font-bold leading-tight uppercase font-clean">{data.originText}</span>
              </div>
              <div className="border-l border-black pl-2 text-[7.5px] uppercase font-bold leading-tight">
                {data.dietBadges}
              </div>
            </div>

            {/* Ingredients & Stamp */}
            <div className="grid grid-cols-4 gap-2 items-center pt-1 border-b border-black pb-2">
              <div className="col-span-3">
                <div className="text-[7.5px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                  {data.ingredientsHeader || 'INGREDIENTS'}
                </div>
                <p className="text-[7px] leading-relaxed uppercase font-mono-receipt font-medium">
                  {data.ingredients}
                </p>
              </div>
              <div className="col-span-1 flex justify-center">
                <BotanicalStamp text={data.stampTextTop} subtext={data.stampTextBottom} size={48 * ratio} />
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="pt-0.5 flex justify-center">
              <BarcodeRenderer value={data.barcodeVal || '8690123456789'} height={24 * ratio} width={1.2 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 3. LEMON POPPYSEED (Natural Soap - Ref 3)
      case 'tpl-lemon-poppyseed-soap':
        return (
          <div className="p-4 border-2 border-black font-mono-receipt flex flex-col justify-between h-full space-y-3">
            {/* Top Quality Badge */}
            <div className="text-center">
              <span className="text-[9px] tracking-widest font-semibold uppercase">{data.topQualityBadge}</span>
            </div>

            {/* Center with Side Texts */}
            <div className="flex items-center justify-between my-2">
              <div className="writing-vertical text-[7px] tracking-widest font-bold uppercase -rotate-90 origin-center py-2">
                {data.leftSideText}
              </div>
              <div className="text-center px-2 flex-1">
                <h1 className="font-condensed-bold text-2xl md:text-4xl font-extrabold tracking-widest uppercase leading-none">
                  {data.titleLine1}
                </h1>
                <h1 className="font-condensed-bold text-2xl md:text-4xl font-extrabold tracking-widest uppercase leading-none mt-0.5">
                  {data.titleLine2}
                </h1>
                <div className="mt-2 text-[8px] font-clean tracking-widest font-bold uppercase opacity-80">
                  {data.subtitle}
                </div>
              </div>
              <div className="writing-vertical text-[7px] tracking-widest font-bold uppercase rotate-90 origin-center py-2">
                {data.rightSideText}
              </div>
            </div>

            {/* 3-Box Middle Grid */}
            <div className="grid grid-cols-3 border-2 border-black text-center text-[8px] items-center divide-x-2 divide-black">
              <div className="p-1">
                <span className="block text-[6.5px] opacity-75 font-sans">BATCH NO.</span>
                <span className="font-bold text-red-600">{data.batchNo}</span>
              </div>
              <div className="p-1 font-bold lowercase tracking-wider text-[9px]">
                {data.brandName}
              </div>
              <div className="p-1">
                <span className="block text-[6.5px] opacity-75 font-sans">APROX. WEIGHT</span>
                <span className="font-bold">{data.weight}</span>
              </div>
            </div>

            {/* Ingredients Footer */}
            <div className="text-center pt-1 border-t border-black">
              <p className="text-[6.5px] tracking-wider leading-tight uppercase font-mono-receipt">
                {data.ingredients}
              </p>
            </div>
          </div>
        );

      // 4. ALCHEMIE & CO APOTHECARY (Ref 4)
      case 'tpl-apothecary-rx':
        return (
          <div className="p-3 border-4 border-double border-black font-clean flex flex-col justify-between h-full space-y-2 bg-transparent">
            {/* Header Brand */}
            <div className="text-center border-b-2 border-black pb-1.5">
              <h1 className="font-condensed-bold text-2xl md:text-4xl font-black tracking-wide uppercase">
                {data.brandName}
              </h1>
            </div>

            {/* Solution and Flavor Grid */}
            <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black my-1">
              <div className="p-2 flex flex-col justify-center text-[7.5px] font-mono-receipt uppercase font-bold leading-tight">
                {data.solutionType}
              </div>
              <div className="col-span-2 p-2 flex flex-col justify-center">
                <span className="font-condensed-bold text-xl md:text-2xl font-black leading-none tracking-wider text-amber-600 uppercase">
                  {data.flavorTitle1}
                </span>
                <span className="font-condensed-bold text-xl md:text-2xl font-black leading-none tracking-wider text-amber-600 uppercase">
                  {data.flavorTitle2}
                </span>
              </div>
            </div>

            {/* Rx Row & Badges */}
            <div className="border-2 border-black divide-y-2 divide-black text-[7.5px] font-mono-receipt font-bold uppercase">
              <div className="p-1 flex items-center gap-2">
                <span className="bg-black text-white px-1 py-0.5 text-[7px]">RX.</span>
                <span>{data.rxCode}</span>
              </div>
              <div className="grid grid-cols-3 divide-x-2 divide-black text-center py-1">
                <div>{data.badgeLeft}</div>
                <div>{data.badgeMiddle}</div>
                <div>{data.badgeRight}</div>
              </div>
            </div>
          </div>
        );

      // 5. PRIORITY MAIL SHIPPING (Ref 5)
      case 'tpl-priority-mail':
        return (
          <div className="p-2.5 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5 text-black">
            {/* Top Row: Big P + TO */}
            <div className="grid grid-cols-4 border-2 border-black divide-x-2 divide-black">
              <div className="col-span-1 flex items-center justify-center p-1 font-condensed-bold text-4xl md:text-5xl font-black">
                {data.postalSymbol || 'P'}
              </div>
              <div className="col-span-3 p-1.5 leading-tight">
                <div className="text-[7px] font-bold font-mono-receipt uppercase">TO:</div>
                <div className="text-[10px] font-extrabold">{data.toCompany}</div>
                <div className="text-[8px] font-medium leading-snug">{data.toAddress}</div>
              </div>
            </div>

            {/* Banner Header */}
            <div className="bg-black text-white text-center py-0.5 font-condensed-bold text-sm md:text-base font-black tracking-widest uppercase">
              {data.headerTitle || 'PRIORITY MAIL'}
            </div>

            {/* FROM */}
            <div className="border border-black p-1 text-[7.5px] leading-tight">
              <span className="font-bold">FROM: </span>
              <span>{data.fromInfo}</span>
            </div>

            {/* 4-Box Metadata */}
            <div className="grid grid-cols-2 border border-black divide-x divide-y divide-black text-[7.5px] font-mono-receipt">
              <div className="p-1"><span className="font-bold">LOT NUMBER:</span> {data.lotNumber}</div>
              <div className="p-1"><span className="font-bold">REF NUMBER:</span> {data.refNumber}</div>
              <div className="p-1"><span className="font-bold">SHIP DATE:</span> {data.shipDate}</div>
              <div className="p-1"><span className="font-bold">WEIGHT:</span> {data.weight}</div>
            </div>

            {/* Icons + Barcode */}
            <div className="grid grid-cols-2 border-2 border-black divide-x-2 divide-black p-1 items-center">
              <div className="flex flex-col items-center justify-center gap-1 p-1">
                <div className="flex items-center justify-around w-full">
                  <IconFragileGlass size={18 * ratio} />
                  <IconTwoArrowsUp size={18 * ratio} />
                  <IconUmbrella size={18 * ratio} />
                </div>
                <span className="text-[6.5px] font-extrabold uppercase tracking-wider text-center">HANDLE WITH CARE</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <span className="text-[6.5px] font-mono-receipt self-start font-bold">Item nr: {data.itemNr}</span>
                <BarcodeRenderer value={data.barcodeVal || '000000000000'} height={24 * ratio} width={1.1 * ratio} fontSize={7} />
              </div>
            </div>

            {/* Footer Instruction */}
            <div className="border border-black p-1 text-[6.5px] font-mono-receipt">
              <span className="font-bold">Delivery instruction: </span>{data.deliveryInstruction}
            </div>
          </div>
        );

      // 6. USPS EXPRESS VINTAGE (Ref 6)
      case 'tpl-usps-express-vintage':
        return (
          <div className="p-2 border-2 border-black font-mono-receipt flex flex-col justify-between h-full space-y-1.5 text-black">
            {/* Top postage section */}
            <div className="grid grid-cols-4 border-2 border-black divide-x-2 divide-black">
              <div className="col-span-1 flex items-center justify-center font-condensed-bold text-4xl md:text-5xl font-black">
                {data.symbol || 'E'}
              </div>
              <div className="col-span-3 p-1.5 text-[7px] leading-tight flex flex-col justify-between">
                <div>
                  <div className="font-bold uppercase">{data.postageHeader}</div>
                  <div className="text-[6.5px]">{data.postageDate}</div>
                  <div className="text-[6.5px] italic">{data.rateZone}</div>
                </div>
                <div className="border-t border-dashed border-black pt-0.5 mt-0.5 flex items-center justify-between text-[6px]">
                  <span className="font-bold">VOID - DO NOT COPY</span>
                  <span>071V00500588</span>
                </div>
              </div>
            </div>

            {/* Express Header */}
            <div className="text-center border-y-2 border-black py-0.5">
              <h2 className="font-condensed-bold text-base md:text-lg font-black tracking-wider uppercase">
                {data.expressTitle}
              </h2>
            </div>

            {/* Postage info & Recipient */}
            <div className="space-y-1 text-[7.5px]">
              <p className="text-[6.5px] opacity-80">{data.postageInfo}</p>
              <div className="bg-black text-white text-center py-0.5 text-[6.5px] font-bold uppercase tracking-wider">
                {data.warningText}
              </div>
              <div className="p-1 border border-black">
                <div className="font-bold">SHIP TO: {data.recipientName}</div>
                <div className="text-[7px]">{data.recipientAddress}</div>
              </div>
            </div>

            {/* Barcode */}
            <div className="border-2 border-black p-1 flex flex-col items-center">
              <div className="text-[7px] font-bold uppercase mb-0.5">{data.expressTitle}</div>
              <BarcodeRenderer value={data.barcodeVal || 'EO 000 161 100 TR'} height={28 * ratio} width={1.2 * ratio} fontSize={8} />
            </div>

            {/* Postal Checkboxes Grid */}
            <div className="border border-black text-[6px] p-1 leading-tight">
              <div className="font-bold uppercase bg-black text-white px-1 py-0.2 inline-block">POSTAL USE ONLY</div>
              <div className="grid grid-cols-3 gap-1 mt-1 font-mono-receipt">
                <div>[ ] AM  [X] PM</div>
                <div>[X] Next Day</div>
                <div>[ ] 12 Noon</div>
              </div>
            </div>
          </div>
        );

      // 7. SPECIALTY COFFEE
      case 'tpl-specialty-coffee':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
            <div className="text-center border-b-2 border-black pb-1">
              <span className="text-[8px] font-mono-receipt tracking-widest uppercase font-bold">{data.roasteryName}</span>
              <h1 className="font-condensed-bold text-xl md:text-2xl font-black tracking-wide uppercase mt-0.5">
                {data.coffeeOrigin}
              </h1>
            </div>

            <div className="grid grid-cols-2 border border-black divide-x divide-black text-[8px] font-mono-receipt p-1">
              <div><span className="font-bold">PROCESS:</span> {data.processType}</div>
              <div className="pl-1"><span className="font-bold">ALTITUDE:</span> {data.altitude}</div>
            </div>

            <div className="border-2 border-black p-1.5 bg-stone-100">
              <div className="text-[7px] font-bold font-mono-receipt uppercase text-stone-600">TASTING NOTES:</div>
              <div className="font-artisan text-xs font-bold italic mt-0.5">{data.tastingNotes}</div>
            </div>

            <div className="grid grid-cols-3 gap-1 items-center border-t border-black pt-1">
              <div className="col-span-2 text-[7.5px] font-mono-receipt leading-tight">
                <div><span className="font-bold">ROAST:</span> {data.roastLevel}</div>
                <div><span className="font-bold">DATE:</span> {data.roastDate}</div>
                <div><span className="font-bold">NET:</span> {data.netWeight}</div>
              </div>
              <div className="col-span-1 flex justify-center">
                <QRCodeRenderer value={data.qrUrl || 'https://brewguide.coffee'} size={46 * ratio} />
              </div>
            </div>
          </div>
        );

      // 8. SOY CANDLE
      case 'tpl-soy-candle':
        return (
          <div className="p-3.5 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
            <div className="border-b border-black pb-1">
              <span className="text-[8px] font-mono-receipt tracking-widest uppercase font-bold">{data.brandTitle}</span>
              <h1 className="font-artisan text-lg md:text-xl font-bold tracking-wider uppercase mt-0.5">
                {data.scentName}
              </h1>
              <span className="text-[7.5px] italic opacity-80 block">{data.subtitle}</span>
            </div>

            <div className="text-[8px] font-mono-receipt font-semibold tracking-wider border-y border-black py-0.5">
              {data.burnTime}
            </div>

            <div className="text-[7.5px] leading-relaxed font-mono-receipt text-left p-1 border border-stone-300">
              <div className="font-bold uppercase text-[7px]">SCENT PROFILE:</div>
              <div>{data.scentNotes}</div>
            </div>

            <div className="border-t border-black pt-1 text-[6.5px] leading-tight text-left opacity-90">
              <span className="font-bold">GÜVENLİK: </span>{data.safetyText}
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono-receipt pt-1 border-t border-black">
              <span>{data.netVolume}</span>
              <span className="font-bold">100% NATURAL SOY</span>
            </div>
          </div>
        );

      // 9. CAFE RECEIPT
      case 'tpl-cafe-receipt':
        return (
          <div className="p-3 font-mono-receipt text-black flex flex-col justify-between h-full space-y-2 text-[8px] leading-tight">
            {/* Cafe Header */}
            <div className="text-center border-b border-dashed border-black pb-1.5">
              <h2 className="font-condensed-bold text-base md:text-lg font-bold uppercase">{data.cafeName}</h2>
              <p className="text-[7px] opacity-80 mt-0.5">{data.address}</p>
              <div className="flex justify-between mt-1 text-[7.5px] font-bold">
                <span>{data.orderNo}</span>
                <span>{data.tableNo}</span>
              </div>
              <div className="text-[7px] text-left opacity-75">{data.dateTime}</div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-black py-1 whitespace-pre-line leading-relaxed">
              {data.items}
            </div>

            {/* Totals */}
            <div className="space-y-0.5 border-b-2 border-black pb-1 text-[8.5px]">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span>{data.subtotal}</span>
              </div>
              <div className="flex justify-between text-[7.5px] opacity-80">
                <span>KDV (%10):</span>
                <span>{data.tax}</span>
              </div>
              <div className="flex justify-between font-bold text-[11px] pt-1 border-t border-black">
                <span>TOPLAM:</span>
                <span>{data.total}</span>
              </div>
            </div>

            {/* WiFi & QR */}
            <div className="grid grid-cols-3 gap-1 items-center pt-1 border-b border-dashed border-black pb-1.5">
              <div className="col-span-2 text-[7px] leading-tight">
                <div className="font-bold">{data.wifiInfo}</div>
                <p className="mt-0.5 opacity-85">{data.footerMessage}</p>
              </div>
              <div className="col-span-1 flex justify-center">
                <QRCodeRenderer value={data.qrPayUrl || 'https://nookcafe.menu'} size={44 * ratio} />
              </div>
            </div>

            <div className="text-center text-[7px] opacity-75">
              *** MALİ DEĞERİ YOKTUR - BİLGİ FİŞİDİR ***
            </div>
          </div>
        );

      // 10. RETAIL SALES SLIP
      case 'tpl-retail-sales-slip':
        return (
          <div className="p-3 font-mono-receipt text-black flex flex-col justify-between h-full space-y-1.5 text-[8px]">
            <div className="text-center border-b-2 border-black pb-1">
              <h2 className="font-condensed-bold text-base md:text-lg font-bold tracking-wider">{data.storeName}</h2>
              <div className="text-[7px]">{data.taxNo}</div>
              <div className="flex justify-between text-[7px] mt-1 font-bold">
                <span>{data.receiptNo}</span>
                <span>{data.cashier}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-black py-1 whitespace-pre-line leading-relaxed">
              {data.itemsList}
            </div>

            <div className="space-y-0.5 border-b-2 border-black pb-1">
              <div className="flex justify-between text-red-600 font-bold">
                <span>İndirim:</span>
                <span>{data.discount}</span>
              </div>
              <div className="flex justify-between font-black text-[10.5px] pt-0.5 border-t border-black">
                <span>ÖDENEN TUTAR:</span>
                <span>{data.totalAmount}</span>
              </div>
              <div className="text-[7px] text-right opacity-80">{data.paymentMethod}</div>
            </div>

            <div className="text-[6.5px] leading-tight border-b border-dashed border-black pb-1">
              <span className="font-bold">İADE KOŞULU: </span>{data.returnPolicy}
            </div>

            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.barcodeVal || 'SLIP-89401'} height={24 * ratio} width={1.1 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 11. WAREHOUSE BIN BARCODE
      case 'tpl-warehouse-bin-barcode':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-center border-b-2 border-black pb-1 text-[8px] font-mono-receipt font-bold">
              <span>{data.warehouseName}</span>
              <span className="bg-black text-white px-1 py-0.2">{data.zone}</span>
            </div>

            {/* Huge Location Bin Code */}
            <div className="text-center border-2 border-black py-1 bg-stone-100">
              <div className="text-[7.5px] font-mono-receipt font-bold text-stone-600">LOKASYON / RAF KODU</div>
              <h1 className="font-condensed-bold text-3xl md:text-5xl font-black tracking-widest text-black leading-none">
                {data.locationCode}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-1 items-center border-y-2 border-black py-1">
              <div className="col-span-2 text-[8px] font-mono-receipt leading-tight">
                <div className="font-bold truncate">{data.productCategory}</div>
                <div className="text-stone-700 font-extrabold">{data.skuCode}</div>
                <div className="text-[7px] opacity-80">{data.maxCapacity}</div>
              </div>
              <div className="col-span-1 flex justify-center">
                <QRCodeRenderer value={data.qrScanUrl || data.locationCode} size={46 * ratio} />
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeVal || data.locationCode} height={28 * ratio} width={1.4 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 12. ASSET INVENTORY TAG
      case 'tpl-asset-inventory-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-1.5">
            <div className="bg-black text-white text-center py-1 font-condensed-bold text-sm md:text-base font-black tracking-wider">
              {data.companyName}
            </div>
            <div className="text-[6.5px] text-center font-mono-receipt font-bold uppercase tracking-wider text-red-600">
              {data.warning}
            </div>

            <div className="grid grid-cols-3 gap-1 border-2 border-black p-1 items-center">
              <div className="col-span-2 text-[7.5px] font-mono-receipt leading-snug">
                <div className="font-black text-[9px] bg-stone-200 px-1 inline-block">{data.assetId}</div>
                <div className="font-bold truncate mt-0.5">{data.deviceType}</div>
                <div className="text-[7px]">{data.serialNumber}</div>
                <div className="text-[7px] opacity-80">{data.department} - {data.assignDate}</div>
              </div>
              <div className="col-span-1 flex justify-center">
                <QRCodeRenderer value={data.assetQr || data.assetId} size={42 * ratio} />
              </div>
            </div>

            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.barcodeVal || data.assetId} height={24 * ratio} width={1.2 * ratio} fontSize={7.5} />
            </div>
          </div>
        );

      // 13. FRAGILE WARNING
      case 'tpl-fragile-heavy-warning':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
            <div className="bg-black text-white py-1">
              <h1 className="font-condensed-bold text-xl md:text-3xl font-black tracking-wider uppercase leading-none">
                {data.mainWarning}
              </h1>
              <span className="text-[7.5px] font-bold font-mono-receipt tracking-widest block uppercase mt-0.5">
                {data.subWarning}
              </span>
            </div>

            {data.showFragileIcons && (
              <div className="flex items-center justify-around border-2 border-black py-1.5">
                <IconFragileGlass size={32 * ratio} />
                <IconThisSideUp size={32 * ratio} />
                <IconUmbrella size={32 * ratio} />
              </div>
            )}

            <div className="text-[8px] font-mono-receipt font-bold leading-tight uppercase p-1 border border-black">
              {data.message}
            </div>

            <div className="bg-black text-white py-0.5 font-condensed-bold text-xs md:text-sm font-bold tracking-widest">
              {data.boxWeight}
            </div>

            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.warningCode || 'FRAGILE-99'} height={20 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 14. THIS SIDE UP
      case 'tpl-this-side-up-shipping':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
            <div className="flex justify-around items-center py-2 border-b-2 border-black">
              <IconTwoArrowsUp size={44 * ratio} />
              <IconTwoArrowsUp size={44 * ratio} />
            </div>

            <div>
              <h1 className="font-condensed-bold text-2xl md:text-4xl font-black tracking-wider uppercase leading-none">
                {data.titleTr}
              </h1>
              <h2 className="font-condensed-bold text-lg md:text-2xl font-bold tracking-widest uppercase mt-0.5">
                {data.titleEn}
              </h2>
            </div>

            <div className="border-2 border-black p-1 text-[8px] font-mono-receipt font-bold uppercase">
              {data.notice}
            </div>

            <div className="bg-black text-white py-1 font-mono-receipt text-[8px] font-extrabold tracking-widest">
              {data.keepDry}
            </div>
          </div>
        );

      // 15. TO-DO CHECKLIST
      case 'tpl-todo-checklist':
        return (
          <div className="p-3 border-2 border-black font-mono-receipt flex flex-col justify-between h-full space-y-2 text-[8px]">
            <div className="border-b-2 border-black pb-1 text-center">
              <h2 className="font-condensed-bold text-sm md:text-base font-black tracking-wider uppercase">
                {data.title}
              </h2>
              <span className="text-[7.5px] opacity-80 font-bold block">{data.date}</span>
            </div>

            <div className="space-y-1.5 py-1">
              {(data.tasks || '').split('\n').filter(Boolean).map((task: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1.5 border-b border-dashed border-stone-300 pb-1">
                  <span className="w-3.5 h-3.5 border border-black flex-shrink-0 inline-block mt-0.5" />
                  <span className="leading-tight font-medium">{task}</span>
                </div>
              ))}
            </div>

            <div className="border-2 border-black p-1 bg-stone-100 font-bold text-[7.5px]">
              {data.priorityNote}
            </div>

            <div className="text-center text-[7px] italic border-t border-black pt-1 opacity-80">
              "{data.footerQuote}"
            </div>
          </div>
        );

      // 16. SHOPPING / STUDY MEMO
      case 'tpl-study-shopping-memo':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 text-[8px]">
            <div className="text-center bg-black text-white py-1 font-condensed-bold text-sm md:text-base font-black tracking-widest uppercase">
              {data.headerTitle}
            </div>

            <div className="space-y-1 font-mono-receipt">
              <div className="font-bold border-b border-black pb-0.5 text-[8.5px]">{data.category1}:</div>
              <div className="space-y-1 pl-1">
                {(data.items1 || '').split('\n').filter(Boolean).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-black inline-block flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-black p-1 text-[7.5px] font-mono-receipt font-bold text-center">
              {data.budgetNote}
            </div>
          </div>
        );

      // 17. BUT FIRST COFFEE STICKER
      case 'tpl-quote-coffee-sticker':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
            <span className="font-mono-receipt text-[8px] font-extrabold tracking-widest uppercase">
              {data.topLine}
            </span>
            <h1 className="font-condensed-bold text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
              {data.mainLine}
            </h1>
            <div className="border-y-2 border-black py-0.5 font-mono-receipt text-[8px] font-bold tracking-wider uppercase">
              {data.bottomLine}
            </div>
            <div className="bg-black text-white text-[7.5px] font-bold py-0.5 tracking-wider uppercase">
              {data.quoteBadge}
            </div>
            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeVal || 'COFFEE-247'} height={24 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 18. THANK YOU ORDER CARD
      case 'tpl-thank-you-order-card':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 text-center">
            <div className="border-b-2 border-black pb-1">
              <h1 className="font-condensed-bold text-2xl md:text-3xl font-black tracking-wider uppercase leading-none">
                {data.title}
              </h1>
              <span className="text-[7.5px] font-bold opacity-80 block mt-0.5">{data.subTitle}</span>
            </div>

            <p className="text-[7.5px] font-mono-receipt leading-relaxed p-1 border border-black">
              {data.message}
            </p>

            <div className="bg-black text-white py-1 font-mono-receipt text-[8px] font-bold">
              {data.couponCode}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 border-t border-black">
              <QRCodeRenderer value={data.qrUrl || 'https://instagram.com'} size={38 * ratio} />
              <div className="text-[7.5px] font-mono-receipt font-bold text-left">
                <div>TAKİP ET:</div>
                <div className="text-[9px]">{data.instagramHandle}</div>
              </div>
            </div>
          </div>
        );

      // 19. WARRANTY SECURITY SEAL
      case 'tpl-warranty-security-seal':
        return (
          <div className="p-2 border-4 border-black font-clean flex flex-col justify-between h-full space-y-1.5 text-center">
            <div className="bg-black text-white py-1 font-condensed-bold text-xs md:text-sm font-black tracking-widest">
              {data.sealTitle}
            </div>
            <div className="text-[7.5px] font-mono-receipt font-extrabold text-red-600 leading-tight uppercase">
              {data.sealWarning}
            </div>
            <p className="text-[6.5px] font-mono-receipt opacity-85 leading-tight">
              {data.subNotice}
            </p>
            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.serialBarcode || 'SEC-SEAL-8910'} height={22 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 20. PILL DOSAGE TRACKER
      case 'tpl-pill-dosage-tracker':
        return (
          <div className="p-3 border-2 border-black font-mono-receipt flex flex-col justify-between h-full space-y-1.5 text-[8px]">
            <div className="border-b-2 border-black pb-1">
              <div className="text-[7px] opacity-75">HASTA: {data.patientName}</div>
              <h2 className="font-condensed-bold text-sm md:text-base font-bold uppercase">{data.medicationName}</h2>
            </div>

            <div className="border border-black p-1 font-bold text-[7.5px]">
              {data.dosageInstruction}
            </div>

            <div className="bg-black text-white text-center py-1 font-bold text-[8.5px] tracking-wider">
              {data.timeSlots}
            </div>

            <div className="text-[6.5px] leading-tight opacity-80 border-t border-black pt-1">
              <span className="font-bold">NOT: </span>{data.doctorNote}
            </div>

            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.rxBarcode || 'MED-2026'} height={20 * ratio} width={1.1 * ratio} fontSize={6.5} />
            </div>
          </div>
        );

      // 21. VINTAGE DRY CLEANERS TAG (Referans Görsel 1)
      case 'tpl-vintage-dry-cleaners':
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const selectedDay = (data.selectedDay || 'THU').toUpperCase();

        return (
          <div className="p-3 border-[1.5px] border-stone-800 font-clean flex flex-col justify-between h-full space-y-2 relative text-stone-900">
            {/* Top Tag Hole Simulation & Header */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-[1.5px] border-stone-500 bg-stone-100 shadow-inner flex items-center justify-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
              </div>

              <div className="flex justify-between items-center w-full">
                {/* Oval Harry Family Brand */}
                <div className="border-[1.5px] border-stone-800 rounded-full px-2 py-0.5 text-[8px] font-condensed-bold tracking-widest font-extrabold uppercase">
                  {data.shopLogo || 'HARRY FAMILY'}
                </div>
                {/* Ticket Number */}
                <div className="font-condensed-bold text-sm md:text-base font-black tracking-wider text-blue-900">
                  {data.ticketNo || 'Nº 4072'}
                </div>
              </div>
            </div>

            {/* Main Service Title & Address */}
            <div className="text-center py-1">
              <h1 className="font-condensed-bold text-2xl md:text-3xl font-black tracking-tight text-blue-950 leading-none uppercase">
                {data.mainTitle || 'DRY CLEANERS'}
              </h1>
              <p className="text-[6.5px] md:text-[7.5px] font-bold tracking-tight uppercase text-stone-700 mt-0.5">
                {data.addressLine || '72 RUE DU FAUBOURG SAINT-DENIS, 75010 PARIS'}
              </p>
            </div>

            {/* Ruled Name & Address lines */}
            <div className="space-y-1 text-[7.5px] font-mono-receipt font-semibold border-t border-b border-stone-800 py-1">
              <div className="flex items-end">
                <span className="font-bold mr-1">NAME:</span>
                <span className="flex-1 border-b border-stone-800 font-bold uppercase truncate">{data.customerName}</span>
              </div>
              <div className="flex items-end">
                <span className="font-bold mr-1">TEL/ADDR:</span>
                <span className="flex-1 border-b border-stone-800 font-bold uppercase truncate">{data.customerAddress}</span>
              </div>
            </div>

            {/* Days of the Week Grid */}
            <div className="border-[1.5px] border-stone-800 grid grid-cols-7 text-center font-condensed-bold text-[7.5px] font-extrabold">
              {days.map((day, idx) => {
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    className={`py-1 relative border-r border-stone-800 last:border-r-0 ${
                      isSelected ? 'bg-blue-50 text-blue-950 font-black' : 'bg-transparent'
                    }`}
                  >
                    {day}
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-blue-800 text-sm font-black pointer-events-none transform -rotate-12 scale-125">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Garment Table Checklist */}
            <div className="border-[1.5px] border-stone-800 text-[7.5px] font-mono-receipt">
              <div className="grid grid-cols-6 border-b border-stone-800 bg-stone-100 font-bold text-[7px] py-0.5 px-1">
                <span className="col-span-1 text-center">QTY</span>
                <span className="col-span-3">DESCRIPTION</span>
                <span className="col-span-2 text-right">AMOUNT</span>
              </div>

              {/* Items with checkboxes */}
              {[
                { desc: data.item1Desc || 'COAT', checked: data.item1Checked },
                { desc: data.item2Desc || 'PANTS', checked: data.item2Checked },
                { desc: data.item3Desc || 'DRESS', checked: data.item3Checked },
                { desc: data.item4Desc || 'SHIRT', checked: data.item4Checked }
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-6 border-b border-stone-300 py-0.5 px-1 items-center">
                  <div className="col-span-1 flex justify-center">
                    <span className="w-3 h-3 border border-stone-800 rounded-xs flex items-center justify-center text-[8px] font-black leading-none">
                      {item.checked ? '✓' : ''}
                    </span>
                  </div>
                  <span className="col-span-3 font-bold uppercase truncate">{item.desc}</span>
                  <span className="col-span-2 text-right opacity-60">——</span>
                </div>
              ))}

              {/* Total Row */}
              <div className="grid grid-cols-6 py-1 px-1 bg-stone-100 font-bold font-condensed-bold text-[8.5px]">
                <span className="col-span-4 text-right pr-2">TOTAL AMOUNT:</span>
                <span className="col-span-2 text-right font-black text-blue-900">{data.totalAmount || '48.50 €'}</span>
              </div>
            </div>

            {/* Bottom QR & Fine Print Disclaimer */}
            <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
              <QRCodeRenderer value={data.qrData || 'https://harrydrycleaners.paris/order/4072'} size={34 * ratio} />
              <div className="flex-1 text-[6.5px] font-bold text-stone-700 leading-tight uppercase">
                {data.legalNotice || 'NOT RESPONSIBLE FOR ARTICLES LEFT OVER 30 DAYS.'}
              </div>
            </div>
          </div>
        );

      // 22. TEKSTİL BAKIM & BEDEN ETİKETİ (Referans Görsel 2)
      case 'tpl-apparel-care-label':
        return (
          <div className="p-3 border-[2.5px] border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            {/* Top Brand Block */}
            <div className="text-center border-b-[2px] border-black pb-2 pt-1">
              <h1 className="font-condensed-bold text-2xl md:text-3xl font-black tracking-widest leading-none uppercase">
                {data.brandName || 'LOGO DESIGN'}
              </h1>
              <p className="text-[7.5px] font-bold tracking-widest uppercase mt-0.5 opacity-80 font-clean">
                {data.brandSub || 'DESIGN'}
              </p>
            </div>

            {/* Middle Bento Section (Size + Laundry Icons + Text Rules + Fabric Column) */}
            <div className="border-[2px] border-black grid grid-cols-4 divide-x-[2px] divide-black">
              {/* Left Column: Size Box + Care Icons Box */}
              <div className="col-span-1 flex flex-col divide-y-[2px] divide-black">
                {/* Size */}
                <div className="h-10 flex items-center justify-center font-condensed-bold text-xl md:text-2xl font-black tracking-wider">
                  {data.apparelSize || 'XS'}
                </div>
                {/* Care Icons */}
                <div className="p-1 flex items-center justify-around gap-0.5 bg-stone-50">
                  <IconWashTub size={13 * ratio} />
                  <IconDoNotBleach size={13 * ratio} />
                  <IconTumbleDry size={13 * ratio} />
                  <IconDoNotIron size={13 * ratio} />
                </div>
              </div>

              {/* Center Column: Text Instructions */}
              <div className="col-span-2 p-1.5 flex flex-col justify-center space-y-0.5 text-[6.5px] md:text-[7.5px] font-bold font-clean uppercase tracking-tight leading-tight">
                <div>• {data.washCare1 || 'WASH COLD'}</div>
                <div>• {data.washCare2 || 'DO NOT BLEACH'}</div>
                <div>• {data.washCare3 || 'TUMBLE DRY LOW'}</div>
                <div>• {data.washCare4 || 'DO NOT IRON'}</div>
              </div>

              {/* Right Column: Fabric Composition */}
              <div className="col-span-1 p-1 flex items-center justify-center text-center text-[6px] font-mono-receipt font-extrabold uppercase leading-tight bg-stone-50">
                {data.fabricComp || '35% COTTON 65% POLYESTER'}
              </div>
            </div>

            {/* Bottom Website Bar */}
            <div className="text-center font-clean text-[7.5px] font-bold tracking-wider border-t-[1.5px] border-black pt-1">
              {data.website || 'www.YourWebsite.com'}
            </div>
          </div>
        );

      // 23. WEST TENTH DENIM VINTAGE AMERICANA FİŞİ (Referans Görsel 4)
      case 'tpl-west-tenth-denim':
        return (
          <div className="p-3 border-2 border-stone-800 font-mono-receipt flex flex-col justify-between h-full space-y-2 relative text-stone-900 bg-[#FCFBF7]">
            {/* Header: RECEIPT & No */}
            <div className="flex justify-between items-baseline font-clean font-bold text-[9px]">
              <span className="text-red-600 tracking-wider font-extrabold">RECEIPT</span>
              <span className="font-mono-receipt font-black tracking-tight">{data.receiptNo || 'No. 001256'}</span>
            </div>

            {/* Brand Brush Script Logo & Category */}
            <div className="text-center py-1">
              <div className="font-serif italic text-2xl md:text-3xl font-extrabold text-red-600 leading-none">
                {data.brandTitle || 'West Tenth'}
              </div>
              <div className="font-condensed-bold text-xs md:text-sm font-black tracking-widest text-red-600 mt-0.5">
                {data.brandCategory || 'DENIM'}
              </div>
              <div className="text-[6.5px] font-mono-receipt tracking-tight font-semibold mt-0.5 opacity-85">
                {data.motto || '/Embrace the Heritage, Wear the Legend/'}
              </div>
            </div>

            {/* Dashed Date Line */}
            <div className="text-center border-t border-b border-dashed border-stone-700 py-1 text-[7.5px] font-bold">
              {data.dateTime || 'DATE: 03/10 2024 11.26'}
            </div>

            {/* Itemized List with Dotted Line Leaders */}
            <div className="space-y-1.5 text-[7.5px] font-mono-receipt py-1">
              {[
                { name: data.item1Name, price: data.item1Price },
                { name: data.item2Name, price: data.item2Price },
                { name: data.item3Name, price: data.item3Price }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-end gap-1">
                  <span className="truncate max-w-[70%] font-semibold">{item.name}</span>
                  <span className="flex-1 border-b border-dotted border-stone-400 mb-0.5"></span>
                  <span className="font-black whitespace-nowrap">{item.price}</span>
                </div>
              ))}
            </div>

            {/* Dashed Total Line */}
            <div className="border-t border-dashed border-stone-700 pt-1 flex justify-between items-center text-sm font-bold">
              <span className="font-condensed-bold font-black text-xs tracking-wider">TOTAL:</span>
              <span className="font-mono-receipt font-black text-base text-stone-900">{data.totalAmount || '795$'}</span>
            </div>

            {/* Crisp Dense Barcode */}
            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeVal || 'WT-DENIM-001256'} height={28 * ratio} width={1.3 * ratio} fontSize={7.5} />
            </div>

            {/* Thank You Red Calligraphy Stamp */}
            <div className="text-center py-0.5">
              <span className="font-serif italic text-xl md:text-2xl font-bold text-red-600 tracking-wide">
                {data.thankYouNote || 'Thank You!'}
              </span>
            </div>

            {/* Footer Contact & Halftone Texture */}
            <div className="flex justify-between items-center text-[7px] font-mono-receipt font-bold pt-1 border-t border-stone-300 opacity-80">
              <span>{data.phone || 'tel: 730 355 442'}</span>
              <span className="tracking-widest uppercase">{data.socialTag || 'WESTTENTHDENIM'}</span>
            </div>
          </div>
        );

      // 24. HUNTINGTON PROGRESSIVE DINNER VINTAGE BİLET (Referans Görsel 5)
      case 'tpl-vintage-dinner-ticket':
        return (
          <div className="p-3 border-2 border-stone-800 font-clean flex flex-col justify-between h-full space-y-2 bg-[#F6F1E6] text-stone-900 relative">
            {/* Top Border String */}
            <div className="text-center text-[6.5px] font-bold font-clean uppercase tracking-widest text-red-700 border-b border-stone-300 pb-0.5">
              {data.topBorderText || '• SAVE THE DATE • SAVE THE DATE •'}
            </div>

            {/* Presenter Text */}
            <div className="text-center text-[6.5px] font-bold uppercase tracking-wider text-stone-700">
              {data.presenterText || 'DOWNTOWN HUNTINGTON PARTNERS present'}
            </div>

            {/* Red / Dark Header Box with Script Overlay */}
            <div className="bg-red-800 text-white p-2 rounded-xs text-center relative shadow-sm">
              <div className="font-serif italic text-2xl md:text-3xl font-normal leading-none text-red-100 transform -rotate-1">
                {data.eventMainScript || "Huntington's"}
              </div>
              <div className="font-condensed-bold text-base md:text-lg font-black tracking-widest uppercase mt-0.5">
                {data.eventSubTitle || 'PROGRESSIVE DINNER'}
              </div>
              <div className="text-[6.5px] font-serif italic text-red-200 mt-0.5">
                {data.eventFeature || 'featuring LOCAL RESTAURANTS'}
              </div>
            </div>

            {/* Centerpiece: Vintage Fork Banner & Circular Seal */}
            <div className="flex items-center justify-center gap-2 py-1">
              <IconVintageCrossedCutlery size={28 * ratio} className="text-stone-800 opacity-85" />
              <div className="text-center">
                <div className="font-condensed-bold text-xs font-black tracking-wider uppercase text-stone-900">
                  {data.menuType || 'PRIX FIXE, 4 COURSE MENU'}
                </div>
                <div className="font-serif italic text-[7.5px] text-stone-700">
                  {data.menuSub || 'Dine at a New Restaurant Each Course'}
                </div>
              </div>
            </div>

            {/* Bottom Bento Box: Date Block + Tickets Callout */}
            <div className="border-[1.5px] border-stone-800 grid grid-cols-5 divide-x-[1.5px] divide-stone-800">
              {/* Left Date Block */}
              <div className="col-span-2 p-1.5 text-center flex flex-col justify-center bg-stone-100">
                <div className="font-serif italic text-[7.5px] text-stone-600">{data.eventDay || 'Thursday'}</div>
                <div className="font-condensed-bold text-base md:text-lg font-black leading-none text-red-700 uppercase">
                  {data.eventDate || 'SEPT 19TH'}
                </div>
              </div>

              {/* Right Ticket Info Block */}
              <div className="col-span-3 flex flex-col divide-y divide-stone-800">
                <div className="bg-red-800 text-white font-serif italic text-[8.5px] font-bold text-center py-0.5">
                  {data.calloutBadge || 'tickets sell-out fast!'}
                </div>
                <div className="p-1 text-[6.5px] font-clean font-bold leading-tight">
                  <div className="text-center text-red-700 font-extrabold">{data.ticketPrice || '$40 PER PERSON'}</div>
                  <div className="mt-0.5 opacity-80 truncate">{data.location1}</div>
                  <div className="opacity-80 truncate">{data.location2}</div>
                </div>
              </div>
            </div>

            {/* Bottom Border String */}
            <div className="text-center text-[6.5px] font-bold font-clean uppercase tracking-widest text-red-700 border-t border-stone-300 pt-0.5">
              {data.topBorderText || '• SAVE THE DATE • SAVE THE DATE •'}
            </div>
          </div>
        );

      // 25. FRAGILE HEAVY-DUTY KARGO GÜVENLİK ETİKETİ (Referans Görsel 6)
      case 'tpl-fragile-heavy-duty':
        return (
          <div className="p-3 border-[3px] border-red-600 rounded-xl bg-red-600 text-white font-clean flex flex-col justify-between h-full space-y-2 shadow-md">
            {/* Top Main Section: Broken Glass White Box + FRAGILE Headline */}
            <div className="grid grid-cols-5 gap-2 items-center">
              {/* Left Box: Broken Wine Glass Icon */}
              <div className="col-span-2 bg-white text-red-600 rounded-lg p-2 flex items-center justify-center aspect-square shadow-inner">
                <IconBrokenWineGlassBig size={54 * ratio} />
              </div>

              {/* Right Block: Headline & Warnings */}
              <div className="col-span-3 space-y-1">
                <h1 className="font-condensed-bold text-3xl md:text-4xl font-black tracking-wider leading-none text-white uppercase">
                  {data.headline || 'FRAGILE'}
                </h1>
                <div className="text-[8px] md:text-[9px] font-condensed-bold font-extrabold uppercase tracking-wide leading-tight text-white">
                  {data.subWarning1 || 'HANDLE WITH CARE'}
                </div>
                <div className="text-[7px] md:text-[8px] font-mono-receipt font-bold uppercase tracking-tight text-red-100">
                  {data.subWarning2 || "DON'T FALL • NOT PRESSURE"}
                </div>
              </div>
            </div>

            {/* 4 Standard ISO Shipping Pictogram Boxes */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {/* 1. FRAGILE */}
              <div className="bg-white text-red-600 rounded-md p-1 text-center flex flex-col items-center justify-between h-14">
                <IconFragileGlass size={18 * ratio} className="my-auto" />
                <span className="text-[5.5px] font-extrabold uppercase font-clean border-t border-red-200 w-full pt-0.5">
                  FRAGILE
                </span>
              </div>

              {/* 2. KEEP DRY */}
              <div className="bg-white text-red-600 rounded-md p-1 text-center flex flex-col items-center justify-between h-14">
                <IconKeepDryUmbrella size={18 * ratio} className="my-auto" />
                <span className="text-[5.5px] font-extrabold uppercase font-clean border-t border-red-200 w-full pt-0.5">
                  KEEP DRY
                </span>
              </div>

              {/* 3. DO NOT TRAMPLE */}
              <div className="bg-white text-red-600 rounded-md p-1 text-center flex flex-col items-center justify-between h-14">
                <IconShoeTrampleWarning size={18 * ratio} className="my-auto" />
                <span className="text-[5.5px] font-extrabold uppercase font-clean border-t border-red-200 w-full pt-0.5">
                  NO TRAMPLE
                </span>
              </div>

              {/* 4. UPWARD */}
              <div className="bg-white text-red-600 rounded-md p-1 text-center flex flex-col items-center justify-between h-14">
                <IconUpwardArrowsHeavy size={18 * ratio} className="my-auto" />
                <span className="text-[5.5px] font-extrabold uppercase font-clean border-t border-red-200 w-full pt-0.5">
                  UPWARD
                </span>
              </div>
            </div>

            {/* Logistics Tracking Barcode */}
            <div className="bg-white rounded-md p-1 text-black flex justify-center">
              <BarcodeRenderer value={data.trackingBarcode || 'EXP-FRG-984021'} height={22 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 26. SPECIALTY COFFEE ROASTERY BAG LABEL
      case 'tpl-specialty-coffee-bag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="border-b-2 border-black pb-1.5 flex items-center justify-between">
              <div>
                <div className="text-[7px] tracking-widest font-bold uppercase opacity-75">ROASTED IN SMALL BATCHES</div>
                <div className="font-serif-vintage text-base font-black tracking-tight">{data.roasteryName || 'ROAST & ORIGIN'}</div>
              </div>
              <IconCoffeeBeans size={24 * ratio} className="text-black" />
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-lg font-black tracking-wide uppercase leading-tight">
                {data.coffeeOrigin || 'ETHIOPIA YIRGACHEFFE'}
              </div>
              <div className="text-[8px] font-mono-receipt font-bold opacity-80 mt-0.5">
                {data.varietyAltitude || 'HEIRLOOM • 1950 - 2150M'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[7.5px] border-b border-black pb-1.5 font-clean">
              <div className="bg-black text-white p-1 rounded-xs text-center">
                <span className="opacity-75 block text-[6px]">PROCESS:</span>
                <span className="font-black uppercase">{data.processType || 'NATURAL'}</span>
              </div>
              <div className="border border-black p-1 rounded-xs text-center">
                <span className="opacity-75 block text-[6px]">PROFILE:</span>
                <span className="font-black uppercase">{data.roastProfile || 'LIGHT ROAST'}</span>
              </div>
            </div>

            <div className="bg-stone-100 p-1.5 rounded-xs border border-dashed border-black">
              <div className="text-[6.5px] font-bold uppercase tracking-wider text-center opacity-75 mb-0.5">TASTING NOTES</div>
              <div className="text-[8.5px] font-condensed-bold font-bold text-center uppercase tracking-tight">
                {data.tastingNotes || 'BERGAMOT • JASMINE • DRIED PEACH'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[7px] font-mono-receipt border-t border-black">
              <div>
                <div>ROAST DATE: <span className="font-bold">{data.roastDate || '2026-08-25'}</span></div>
                <div>NET WT: <span className="font-bold">{data.netWeight || '250G / 8.8 OZ'}</span></div>
              </div>
              <QRCodeRenderer value={data.qrTrace || 'https://roastandorigin.coffee/beans/yirgacheffe-g1'} size={32 * ratio} />
            </div>
          </div>
        );

      // 27. MODERN MINIMALIST BOARDING PASS
      case 'tpl-airline-boarding-pass':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1.5">
                <IconAirplaneFlight size={18 * ratio} className="text-black" />
                <span className="font-condensed-bold text-sm font-black tracking-wider uppercase">{data.airlineName || 'AERO EXPRESS'}</span>
              </div>
              <span className="text-[7.5px] font-bold bg-black text-white px-1 py-0.5 rounded-xs uppercase">
                {data.flightClass || 'PRIORITY / GRP 1'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="text-left">
                <span className="text-[7px] opacity-70 uppercase font-mono-receipt">FROM</span>
                <div className="font-condensed-bold text-2xl font-black leading-none">{data.fromCode || 'IST'}</div>
                <div className="text-[7.5px] font-bold tracking-tight">{data.fromCity || 'ISTANBUL'}</div>
              </div>
              <div className="flex flex-col items-center px-2">
                <span className="text-[7px] font-mono-receipt font-bold">{data.flightNo || 'TK 1984'}</span>
                <span className="text-xs">✈ ➔</span>
                <span className="text-[6.5px] opacity-70">NON-STOP</span>
              </div>
              <div className="text-right">
                <span className="text-[7px] opacity-70 uppercase font-mono-receipt">TO</span>
                <div className="font-condensed-bold text-2xl font-black leading-none">{data.toCode || 'LHR'}</div>
                <div className="text-[7.5px] font-bold tracking-tight">{data.toCity || 'LONDON'}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 py-1.5 border-t border-b border-black text-center font-mono-receipt">
              <div className="border-r border-black/30 pr-1">
                <div className="text-[6px] opacity-70">PASSENGER</div>
                <div className="text-[7.5px] font-bold truncate">{data.passengerName || 'CAN YILMAZ'}</div>
              </div>
              <div className="border-r border-black/30 pr-1">
                <div className="text-[6px] opacity-70">SEAT</div>
                <div className="text-[10px] font-black">{data.seatNo || '14A'}</div>
              </div>
              <div className="border-r border-black/30 pr-1">
                <div className="text-[6px] opacity-70">GATE</div>
                <div className="text-[10px] font-black">{data.gateNo || 'B-12'}</div>
              </div>
              <div>
                <div className="text-[6px] opacity-70">BOARDING</div>
                <div className="text-[10px] font-black">{data.boardTime || '08:45'}</div>
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeVal || 'M1YILMAZ/CAN ETK1984ISTLHR'} height={24 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 28. CINEMA & FILM FESTIVAL RETRO TICKET
      case 'tpl-cinema-festival-ticket':
        return (
          <div className="p-3 border-2 border-dashed border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconMovieClapper size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase tracking-wider">{data.cinemaName || 'CINEMA MAJESTIC'}</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold bg-black text-white px-1 py-0.5">ADMIT ONE</span>
            </div>

            <div className="text-center py-1">
              <div className="text-[7px] uppercase tracking-widest font-mono-receipt opacity-75">NOW SHOWING</div>
              <div className="font-condensed-bold text-base font-black uppercase tracking-tight leading-tight">
                {data.movieTitle || 'OPPENHEIMER (70MM)'}
              </div>
            </div>

            <div className="bg-stone-100 p-1.5 rounded-xs border border-black space-y-1 font-mono-receipt text-[8px]">
              <div className="flex justify-between border-b border-stone-300 pb-0.5">
                <span className="opacity-75">SALON:</span>
                <span className="font-bold">{data.hallName || 'SALON 1 (IMAX)'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-300 pb-0.5">
                <span className="opacity-75">TARİH & SAAT:</span>
                <span className="font-bold">{data.sessionTime || '27 AĞU • 21:15'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-300 pb-0.5">
                <span className="opacity-75">KOLTUK:</span>
                <span className="font-black text-[9px]">{data.rowSeat || 'SIRA: F • NO: 18'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">ÜCRET:</span>
                <span className="font-bold">{data.ticketType || 'TAM / ADULT • 160 ₺'}</span>
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeTicket || 'MAJ-2026-0914'} height={22 * ratio} width={1.1 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 29. ARTISAN BAKERY & SOURDOUGH BREAD DAILY TAG
      case 'tpl-artisan-sourdough':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="border-b-2 border-black pb-1 text-center">
              <div className="flex items-center justify-center space-x-1.5 mb-0.5">
                <IconWheatEars size={16 * ratio} />
                <span className="font-serif-vintage text-sm font-black tracking-wide uppercase">{data.bakeryName || 'MAYA & TAŞ FIRIN'}</span>
                <IconWheatEars size={16 * ratio} />
              </div>
              <div className="text-[6.5px] font-mono-receipt tracking-widest uppercase opacity-75">GÜNLÜK TAŞ FIRIN EKMEĞİ</div>
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-lg font-black uppercase tracking-tight">
                {data.breadName || 'KÖY EKŞİ MAYALI'}
              </div>
              <div className="text-[7.5px] font-serif-vintage italic mt-0.5">
                {data.flourType || '%100 Taş Değirmen Siyez & Çavdar'}
              </div>
            </div>

            <div className="space-y-1 font-clean text-[7.5px]">
              <div className="bg-black text-white p-1 text-center font-bold tracking-wider uppercase rounded-xs">
                {data.fermentation || '36 SAAT SOĞUK FERMANTASYON'}
              </div>
              <div className="flex justify-between items-center px-1 font-mono-receipt">
                <span>FIRINDAN ÇIKIŞ: <strong className="font-black">{data.bakeTime || 'BUGÜN 07:30'}</strong></span>
                <span className="font-black text-xs">{data.weightPrice || '850 GR • 95 ₺'}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-black pt-1 text-center">
              <div className="text-[6.5px] font-mono-receipt font-bold opacity-80 uppercase">
                {data.naturalBadge || 'SADECE UN, SU, TUZ VE EKŞİ MAYA'}
              </div>
            </div>
          </div>
        );

      // 30. WINE BOTTLE VINTAGE CELLAR TAG
      case 'tpl-wine-cellar-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="text-center border-b-2 border-black pb-1.5">
              <div className="text-[7px] font-serif-vintage tracking-widest uppercase opacity-75">GRAND RÉSERVE</div>
              <div className="font-serif-vintage text-base font-black uppercase tracking-tight">{data.estateName || 'CHÂTEAU DE RÉCOLTE'}</div>
              <div className="text-[8.5px] font-mono-receipt font-bold bg-black text-white px-2 py-0.5 inline-block rounded-xs mt-1">
                {data.wineVintage || 'REKOLTE 2019'}
              </div>
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-sm font-bold uppercase tracking-wide">
                {data.grapeVariety || 'CABERNET SAUVIGNON & MERLOT'}
              </div>
              <div className="text-[7.5px] font-mono-receipt opacity-80 mt-0.5">
                {data.barrelAging || '18 AY FRANSIZ MEŞE FIÇI'}
              </div>
            </div>

            <div className="flex justify-between items-center text-[7.5px] font-mono-receipt px-1">
              <span>{data.alcoholVol || '%14.5 VOL • 750 ML'}</span>
              <span className="font-black border border-black px-1 py-0.5">{data.bottleNo || 'ŞİŞE NO: 0284 / 1200'}</span>
            </div>

            <div className="border-t border-black pt-1 text-center text-[6.5px] font-mono-receipt opacity-75">
              {data.servingTemp || 'İDEAL SERVİS: 16-18°C'}
            </div>
          </div>
        );

      // 31. APOTHECARY HERBAL CANDLE & ESSENTIAL OIL
      case 'tpl-apothecary-candle':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconCandleFlame size={18 * ratio} />
              <span className="text-[7px] font-mono-receipt font-bold uppercase tracking-widest opacity-80">APOTHECARY BOTANICALS</span>
              <IconCandleFlame size={18 * ratio} />
            </div>

            <div className="text-center py-1">
              <div className="font-condensed-bold text-base font-black tracking-tight uppercase leading-tight">
                {data.candleTitle || 'LAVENDER & CEDARWOOD'}
              </div>
              <div className="text-[7.5px] font-serif-vintage italic opacity-80 mt-0.5">
                {data.subCategory || 'HAND POURED 100% SOY CANDLE'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 border-t border-b border-black py-1 font-mono-receipt text-[7.5px] text-center">
              <div className="border-r border-black/30 pr-1">
                <span className="opacity-70 block text-[6px]">BURN TIME</span>
                <span className="font-bold">{data.burnHours || '~45 HOURS BURN TIME'}</span>
              </div>
              <div>
                <span className="opacity-70 block text-[6px]">BATCH & WEIGHT</span>
                <span className="font-bold">{data.batchWeight || 'NET WT. 220G / BATCH #04'}</span>
              </div>
            </div>

            <div className="text-[7px] text-center font-clean opacity-90 border-b border-black pb-1">
              {data.oilBlend || 'PURE ESSENTIAL OILS • COTTON WICK'}
            </div>

            <div className="text-[6px] font-mono-receipt opacity-70 text-center leading-tight">
              ⚠ {data.safetyRule || 'Fitili her yakışta 5mm kesin. Çocuk ve evcil hayvanlardan uzak tutun.'}
            </div>
          </div>
        );

      // 32. TECH REPAIR & SERVICE WORK ORDER TICKET
      case 'tpl-tech-repair-ticket':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconWrenchGear size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase">{data.serviceCenter || 'NOVA TECH SERVICE'}</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold bg-black text-white px-1 py-0.5">
                {data.workOrderNo || 'SRV-2026-8831'}
              </span>
            </div>

            <div className="space-y-1 text-[8px] font-mono-receipt">
              <div className="flex justify-between border-b border-stone-200 pb-0.5">
                <span className="opacity-75">MÜŞTERİ:</span>
                <span className="font-bold">{data.customerName || 'MURAT KAYA • 0532 990 12 34'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-0.5">
                <span className="opacity-75">CİHAZ:</span>
                <span className="font-black">{data.deviceModel || 'iPhone 15 Pro Max'}</span>
              </div>
              <div className="bg-stone-50 p-1 border border-stone-300 rounded-xs">
                <span className="opacity-75 block text-[6.5px]">BİLDİRİLEN ARIZA:</span>
                <span className="text-[7.5px] leading-tight block">{data.reportedIssue || 'Ön cam kırık, batarya sağlığı %74.'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black text-[7.5px] font-mono-receipt">
              <div>
                <div>TUTAR / TESLİM:</div>
                <div className="font-black text-[9px]">{data.estCost || '3.450 ₺ • 28.08.2026'}</div>
              </div>
              <QRCodeRenderer value={data.serviceQr || 'https://novatech.repair/track/8831'} size={32 * ratio} />
            </div>
          </div>
        );

      // 33. AIRPORT LUGGAGE & HEAVY BAGGAGE TAG
      case 'tpl-airport-luggage-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconLuggageBag size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase">BAGGAGE CLAIM</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold bg-black text-white px-1.5 py-0.5 uppercase">
                {data.tagNumber || 'TK 894012'}
              </span>
            </div>

            <div className="flex items-baseline justify-between py-1 border-b-2 border-black">
              <div>
                <div className="text-[7px] font-mono-receipt opacity-75">{data.originCode || 'FROM: IST'}</div>
                <div className="font-condensed-bold text-3xl font-black leading-none">{data.destCode || 'JFK'}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-bold">{data.transitCode || 'VIA CDG'}</div>
                <div className="text-[7px] font-mono-receipt opacity-80">{data.passengerSurname || 'DEMIR / E'}</div>
              </div>
            </div>

            <div className="bg-black text-white p-1 text-center font-condensed-bold text-xs font-black tracking-widest uppercase">
              PRIORITY • {data.weightKg || '23.8 KG (HEAVY)'}
            </div>

            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.baggageBarcode || '0235894012'} height={24 * ratio} width={1.2 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 34. LIBRARY BOOK DUE DATE SLIP
      case 'tpl-library-due-date':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconBookDue size={16 * ratio} />
                <span className="font-serif-vintage text-xs font-bold uppercase">{data.libraryTitle || 'HALK KÜTÜPHANESİ'}</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold">{data.callNumber || 'RAF: 891.73 DOS'}</span>
            </div>

            <div className="text-center py-0.5 border-b border-black">
              <div className="font-condensed-bold text-sm font-black uppercase">{data.bookTitle || 'SUÇ VE CEZA'}</div>
              <div className="text-[7.5px] font-serif-vintage italic opacity-80">{data.authorName || 'F. M. DOSTOYEVSKİ'}</div>
            </div>

            <div className="border border-black text-[8px] font-mono-receipt">
              <div className="bg-black text-white text-center py-0.5 text-[6.5px] font-bold uppercase">İADE TARİHLERİ / DUE DATES</div>
              <div className="grid grid-cols-3 divide-x divide-black text-center py-1">
                <div className="font-bold">{data.date1 || '12 EYL 2026'}</div>
                <div className="font-bold">{data.date2 || '26 EYL 2026'}</div>
                <div className="font-bold">{data.date3 || '10 EKM 2026'}</div>
              </div>
            </div>

            <div className="text-[6.5px] font-mono-receipt opacity-75 text-center pt-1 border-t border-black">
              {data.warningText || 'Lütfen kitabı temiz ve zamanında teslim ediniz.'}
            </div>
          </div>
        );

      // 35. CRAFT BEER CAN & BOTTLE LABEL
      case 'tpl-craft-beer-label':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconBeerHops size={18 * ratio} />
              <span className="font-condensed-bold text-xs font-black uppercase tracking-wider">{data.breweryName || 'NORDIC HOP BREWERY'}</span>
              <IconBeerHops size={18 * ratio} />
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-lg font-black uppercase tracking-tight">
                {data.beerStyle || 'DOUBLE HAZY IPA'}
              </div>
              <div className="text-[7.5px] font-mono-receipt font-bold opacity-80 mt-0.5">
                HOPS: {data.hopProfile || 'CITRA • MOSAIC • GALAXY'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono-receipt text-[8px] border-b border-black pb-1.5">
              <div className="bg-black text-white p-1 rounded-xs">
                <span className="text-[6px] opacity-75 block">ALCOHOL</span>
                <span className="font-black">{data.alcoholAbv || '6.8% ABV'}</span>
              </div>
              <div className="border border-black p-1 rounded-xs">
                <span className="text-[6px] opacity-75 block">BITTERNESS</span>
                <span className="font-black">{data.bitternessIbu || '45 IBU'}</span>
              </div>
              <div className="border border-black p-1 rounded-xs">
                <span className="text-[6px] opacity-75 block">VOLUME</span>
                <span className="font-bold">{data.volumeMl || '440 ML'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[6.5px] font-mono-receipt opacity-75 pt-0.5">
              <span>{data.batchDate || 'BATCH #24 • DOLUM: 08/2026'}</span>
              <span className="font-bold border border-black px-1">18+ ONLY</span>
            </div>
          </div>
        );

      // 36. BOTANICAL PLANT NURSERY & CARE TAG
      case 'tpl-plant-care-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconBotanicalLeafCare size={18 * ratio} />
              <span className="font-serif-vintage text-xs font-bold uppercase">{data.nurseryBrand || 'BOTANICA GREEN STUDIO'}</span>
              <IconBotanicalLeafCare size={18 * ratio} />
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-base font-black uppercase tracking-tight">{data.commonName || 'DEV MONSTERA'}</div>
              <div className="text-[7.5px] font-serif-vintage italic opacity-80">{data.latinName || 'Monstera deliciosa'}</div>
            </div>

            <div className="space-y-1 font-clean text-[7.5px] bg-stone-50 p-1.5 border border-stone-300 rounded-xs">
              <div className="flex items-center space-x-1">
                <span>{data.lightReq || '☀ Parlak, Dolaylı Işık'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{data.waterReq || '💧 Toprak kurudukça (Haftada 1)'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{data.tempReq || '🌡 18°C - 27°C arası'}</span>
              </div>
            </div>

            <div className="text-[6.5px] font-mono-receipt font-bold text-center border-t border-black pt-1">
              {data.petSafety || '🐾 Kedi/Köpek için Toksiktir'}
            </div>
          </div>
        );

      // 37. CONCERT & VIP BACKSTAGE ALL ACCESS PASS
      case 'tpl-vip-backstage-pass':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-black text-white">
            <div className="flex items-center justify-between border-b border-stone-600 pb-1">
              <IconVipStarBadge size={16 * ratio} className="text-white" />
              <span className="text-[7px] font-mono-receipt font-bold tracking-widest uppercase">{data.tourName || 'WORLD STADIUM TOUR 2026'}</span>
              <IconVipStarBadge size={16 * ratio} className="text-white" />
            </div>

            <div className="text-center py-1">
              <div className="font-condensed-bold text-sm font-bold uppercase tracking-wider text-stone-300">{data.bandName || 'THE MIDNIGHT ECHO'}</div>
              <div className="bg-white text-black font-condensed-bold text-lg font-black uppercase py-0.5 tracking-widest rounded-xs my-1">
                {data.passType || 'ALL ACCESS • VIP'}
              </div>
              <div className="text-[7.5px] font-mono-receipt tracking-tight text-stone-300">{data.zoneName || 'STAGE & PRODUCTION ONLY'}</div>
            </div>

            <div className="bg-stone-900 border border-stone-700 p-1 rounded-xs text-center font-mono-receipt text-[7.5px]">
              <div className="text-[6px] text-stone-400">PASSHOLDER</div>
              <div className="font-bold text-white">{data.holderName || 'ARDA GÜLER / CREW'}</div>
              <div className="text-[6.5px] text-stone-400 mt-0.5">{data.tourDate || '28.08.2026 • İSTANBUL'}</div>
            </div>

            <div className="bg-white rounded-xs p-1 text-black flex justify-center">
              <BarcodeRenderer value={data.accessBarcode || 'VIP-ACCESS-99014'} height={20 * ratio} width={1.1 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 38. JEWELRY & WATCH PRICE TAG
      case 'tpl-jewelry-price-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconDiamondRing size={16 * ratio} />
              <span className="font-serif-vintage text-xs font-bold uppercase">{data.jewelerName || 'ZENITH JEWELRY'}</span>
              <IconDiamondRing size={16 * ratio} />
            </div>

            <div className="text-center py-0.5">
              <div className="font-condensed-bold text-sm font-black uppercase">{data.itemTitle || 'TEKTAŞ PIRLANTA YÜZÜK'}</div>
              <div className="text-[7.5px] font-mono-receipt font-bold opacity-80 mt-0.5">{data.goldPurity || '14K BEYAZ ALTIN (585)'}</div>
            </div>

            <div className="bg-stone-100 p-1 border border-black text-[7.5px] font-mono-receipt space-y-0.5 text-center">
              <div>{data.gemstoneSpec || '0.35 CT • F COLOR • VS1'}</div>
              <div className="font-bold">AĞIRLIK: {data.netWeight || '2.85 GR'}</div>
            </div>

            <div className="text-center border-t border-black pt-1">
              <div className="font-condensed-bold text-base font-black">{data.itemPrice || '28.500 ₺'}</div>
            </div>

            <div className="flex justify-center pt-0.5">
              <BarcodeRenderer value={data.microBarcode || 'JW-585-035'} height={18 * ratio} width={1.0 * ratio} fontSize={6} />
            </div>
          </div>
        );

      // 39. PARKING VALET & CAR WASH SLIP
      case 'tpl-valet-carwash-slip':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconCarValet size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase">{data.valetCompany || 'PREMIUM VALET'}</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold">{data.entryTime || '27.08 • 19:45'}</span>
            </div>

            <div className="border-2 border-black py-1 px-2 text-center rounded-xs">
              <span className="text-[6.5px] font-mono-receipt opacity-75 block">PLAKA / PLATE</span>
              <div className="font-condensed-bold text-xl font-black uppercase tracking-wider leading-none">
                {data.plateNumber || '34 BJK 1903'}
              </div>
              <div className="text-[7.5px] font-bold mt-0.5">{data.carModel || 'BMW 520i • SİYAH'}</div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono-receipt border-t border-b border-black py-1">
              <span>{data.serviceRequested || 'VALE + YIKAMA'}</span>
              <span className="font-black text-sm">{data.parkingFee || '450 ₺'}</span>
            </div>

            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.valetBarcode || 'VAL-34BJK-1903'} height={22 * ratio} width={1.1 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 40. PIZZA DELIVERY BOX SECURITY SEAL
      case 'tpl-pizza-box-seal':
        return (
          <div className="p-3 border-2 border-dashed border-red-600 font-clean flex flex-col justify-between h-full space-y-2 bg-white text-red-600">
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-1">
              <IconPizzaSeal size={18 * ratio} />
              <span className="font-condensed-bold text-xs font-black uppercase">{data.pizzeriaName || 'PIZZERIA NAPOLI'}</span>
              <IconPizzaSeal size={18 * ratio} />
            </div>

            <div className="text-center py-0.5">
              <div className="font-condensed-bold text-sm font-black uppercase bg-red-600 text-white py-0.5 rounded-xs">
                {data.sealHeadline || 'TAZE VE SICAK FIRINDAN'}
              </div>
              <div className="text-[8px] font-bold text-black mt-1">{data.pizzaDetails || 'BÜYÜK BOY QUATTRO FORMAGGI'}</div>
            </div>

            <div className="flex justify-between text-[7.5px] font-mono-receipt text-black border-t border-b border-red-200 py-1">
              <span>{data.ovenTime || '20:15 (FIRINDAN ÇIKIŞ)'}</span>
              <span className="font-bold">{data.chefName || 'Şef: Mario R.'}</span>
            </div>

            <div className="text-[6.5px] font-mono-receipt text-center text-red-700 leading-tight">
              🔒 {data.sealWarning || 'GÜVENLİK MÜHRÜDÜR: Kutu bandı yırtılmışsa kuryeden teslim almayınız.'}
            </div>
          </div>
        );

      // 41. VINTAGE GRAND HOTEL ROOM & LUGGAGE TAG
      case 'tpl-grand-hotel-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="text-center border-b-2 border-black pb-1">
              <div className="flex items-center justify-center space-x-1">
                <IconHotelKeyRetro size={16 * ratio} />
                <span className="font-serif-vintage text-sm font-black tracking-wider uppercase">{data.hotelTitle || 'GRAND HOTEL DE LUXE'}</span>
              </div>
              <div className="text-[6.5px] font-mono-receipt opacity-75">{data.welcomeMotto || 'Old-world hospitality in modern luxury.'}</div>
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-2xl font-black uppercase leading-none">{data.roomNumber || 'ROOM 304'}</div>
              <div className="text-[8px] font-serif-vintage italic mt-0.5">{data.guestName || 'MR. ALEXANDER WRIGHT'}</div>
            </div>

            <div className="text-[7.5px] font-mono-receipt text-center space-y-0.5">
              <div>{data.checkInDates || '27.08.2026 — 31.08.2026'}</div>
              <div className="text-[6.5px] opacity-75">{data.receptionTel || 'Resepsiyon: Dahili 0'}</div>
            </div>
          </div>
        );

      // 42. MEDICAL LAB SPECIMEN TUBE TAG
      case 'tpl-medical-lab-specimen':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconMedicalTube size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase">{data.labHospital || 'MERKEZ BİYOKİMYA LAB'}</span>
              </div>
              {data.isStat && (
                <span className="text-[7px] font-black bg-red-600 text-white px-1 py-0.2 rounded-xs animate-pulse">STAT / ACİL</span>
              )}
            </div>

            <div className="space-y-0.5 text-[8px] font-mono-receipt">
              <div className="flex justify-between font-bold">
                <span>HASTA:</span>
                <span>{data.patientName || 'AYŞE KAYA (K/34)'}</span>
              </div>
              <div className="flex justify-between opacity-80">
                <span>PROTOKOL:</span>
                <span>{data.protocolNo || 'PRT-2026-90412'}</span>
              </div>
              <div className="flex justify-between border-t border-stone-300 pt-0.5">
                <span>TEST:</span>
                <span className="font-bold">{data.testType || 'CBC + HEMOGRAM'}</span>
              </div>
              <div className="flex justify-between opacity-75 text-[7px]">
                <span>ÖRNEK SAATİ:</span>
                <span>{data.sampleTime || '27.08.2026 • 09:12'}</span>
              </div>
            </div>

            <div className="flex justify-center pt-1 border-t border-black">
              <BarcodeRenderer value={data.tubeBarcode || 'LAB904120912'} height={20 * ratio} width={1.1 * ratio} fontSize={7} />
            </div>
          </div>
        );

      // 43. HANDCRAFTED NATURAL SOAP & COSMETICS
      case 'tpl-handcrafted-soap':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconNaturalSoapBar size={16 * ratio} />
              <span className="font-serif-vintage text-xs font-bold uppercase">{data.brandTitle || 'BOTANIC ESSENCE'}</span>
              <IconNaturalSoapBar size={16 * ratio} />
            </div>

            <div className="text-center py-0.5 border-b border-black">
              <div className="font-condensed-bold text-base font-black uppercase">{data.soapTitle || 'GOAT MILK & OATMEAL'}</div>
              <div className="text-[7px] font-mono-receipt uppercase tracking-wider opacity-80">{data.skinType || 'HASSAS VE KURU CİLTLER İÇİN'}</div>
            </div>

            <div className="text-[7px] font-clean opacity-85 leading-tight text-center">
              {data.soapIngredients || 'Zeytinyağı, Hindistan Cevizi Yağı, Keçi Sütü, Yulaf Unu, Lavanta Yağı.'}
            </div>

            <div className="flex justify-between items-center text-[7.5px] font-mono-receipt border-t border-black pt-1">
              <span>{data.soapMotto || 'Soğuk sıkım yöntemle üretilmiştir.'}</span>
              <span className="font-bold">{data.soapWeight || 'NET: 120 GR'}</span>
            </div>
          </div>
        );

      // 44. BOUTIQUE FLOWER BOUQUET MESSAGE TAG
      case 'tpl-flower-bouquet-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="text-center border-b border-black pb-1">
              <div className="flex items-center justify-center space-x-1 mb-0.5">
                <IconRoseBouquet size={16 * ratio} />
                <span className="font-serif-vintage text-xs font-bold uppercase">{data.floristName || 'L’ATELIER DES FLEURS'}</span>
                <IconRoseBouquet size={16 * ratio} />
              </div>
              <div className="text-[7px] font-mono-receipt tracking-widest uppercase opacity-75">{data.greetingHeader || 'SEVGİYLE VE MUTLULUKLA'}</div>
            </div>

            <div className="py-2 text-center">
              <p className="font-serif-vintage italic text-xs leading-relaxed">
                "{data.giftMessage || 'Yeni yaşında tüm hayallerinin gerçek olması dileğiyle, iyi ki varsın!'}"
              </p>
              <div className="font-bold text-[8px] text-right mt-2 font-mono-receipt">{data.fromWhom || '— Can & Ece'}</div>
            </div>

            <div className="border-t border-dashed border-black pt-1 text-center text-[6.5px] font-mono-receipt opacity-75">
              {data.careHint || 'Sapları 45° açıyla kesip her gün suyunu tazeleyiniz.'}
            </div>
          </div>
        );

      // 45. QR CODE WIFI & TABLE ORDERING STAND
      case 'tpl-table-wifi-order':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black text-center">
            <div className="border-b-2 border-black pb-1">
              <div className="text-[7px] font-mono-receipt tracking-widest uppercase opacity-75">{data.venueName || 'COFFEE & CO. BISTRO'}</div>
              <div className="font-condensed-bold text-xl font-black uppercase leading-none mt-0.5">{data.tableNo || 'MASA 12'}</div>
            </div>

            <div className="flex flex-col items-center py-1">
              <QRCodeRenderer value={data.menuQr || 'https://bistromenu.com/table/12'} size={50 * ratio} />
              <div className="text-[7.5px] font-condensed-bold font-bold uppercase tracking-wide mt-1">MENÜYÜ GÖR & SİPARİŞ VER</div>
            </div>

            <div className="bg-stone-100 p-1.5 rounded-xs border border-black text-[7.5px] font-mono-receipt space-y-0.5">
              <div className="flex items-center justify-center space-x-1 font-bold">
                <IconWifiTable size={12 * ratio} />
                <span>WiFi: {data.wifiSsid || 'Bistro_Guest_WiFi'}</span>
              </div>
              <div>ŞİFRE: <strong className="font-black">{data.wifiPass || 'coffee2026'}</strong></div>
            </div>

            <div className="text-[6.5px] font-mono-receipt opacity-75">
              {data.socialHandle || '@coffeeandco.bistro'}
            </div>
          </div>
        );

      // 46. ORGANIC EXTRA VIRGIN OLIVE OIL BOTTLE TAG
      case 'tpl-olive-oil-bottle':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="text-center border-b-2 border-black pb-1">
              <div className="flex items-center justify-center space-x-1">
                <IconOliveBranchWreath size={16 * ratio} />
                <span className="font-serif-vintage text-sm font-black tracking-wide uppercase">{data.farmName || 'EGE ZEYTİN BAHÇESİ'}</span>
                <IconOliveBranchWreath size={16 * ratio} />
              </div>
              <div className="text-[6.5px] font-mono-receipt tracking-widest uppercase opacity-75">SOĞUK SIKIM NATUREL SIZMA</div>
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-base font-black uppercase">{data.oilType || 'ERKEN HASAT SOĞUK SIKIM'}</div>
              <div className="text-[7.5px] font-serif-vintage italic mt-0.5">{data.oliveVariety || '%100 Ayvalık • Kuzey Ege'}</div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-center font-mono-receipt text-[7.5px] py-1 border-b border-black">
              <div className="bg-black text-white p-1 rounded-xs font-bold">{data.acidityRate || 'ASİT ORANI: ≤ %0.3'}</div>
              <div className="border border-black p-1 rounded-xs font-bold">{data.bottleVol || 'NET 500 ML e'}</div>
            </div>

            <div className="text-[6.5px] font-mono-receipt text-center opacity-75">
              {data.harvestYear || '2025/2026 HASAT DÖNEMİ'}
            </div>
          </div>
        );

      // 47. GYM & FITNESS MEMBERSHIP QR PASS
      case 'tpl-gym-membership-pass':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-black text-white text-center">
            <div className="border-b border-stone-700 pb-1">
              <div className="flex items-center justify-center space-x-1">
                <IconFitnessDumbbell size={16 * ratio} className="text-white" />
                <span className="font-condensed-bold text-xs font-black uppercase tracking-wider">{data.gymName || 'IRON CORE CLUB'}</span>
                <IconFitnessDumbbell size={16 * ratio} className="text-white" />
              </div>
            </div>

            <div className="py-1">
              <div className="font-condensed-bold text-base font-black uppercase text-white">{data.memberName || 'BURAK ÇELİK'}</div>
              <div className="bg-white text-black font-mono-receipt text-[7.5px] font-black uppercase px-2 py-0.5 inline-block rounded-xs mt-0.5">
                {data.membershipType || 'PLATINUM VIP'}
              </div>
            </div>

            <div className="bg-white p-2 rounded-xs flex justify-center text-black">
              <QRCodeRenderer value={data.gymQr || 'GYM-USER-BURAK-778'} size={46 * ratio} />
            </div>

            <div className="flex justify-between text-[7px] font-mono-receipt text-stone-400 border-t border-stone-800 pt-1">
              <span>{data.memberId || 'ID: #IC-778'}</span>
              <span>{data.validUntil || 'BİTİŞ: 31.12.2026'}</span>
            </div>

            <div className="text-[6.5px] font-mono-receipt text-stone-300 uppercase tracking-widest">
              {data.motto || 'DISCIPLINE OVER MOTIVATION'}
            </div>
          </div>
        );

      // 48. SNEAKER & SHOE AUTHENTICATION TAG
      case 'tpl-sneaker-auth-tag':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1">
                <IconSneakerShoe size={16 * ratio} />
                <span className="font-condensed-bold text-xs font-black uppercase">{data.platformName || 'KICKS AUTH LAB'}</span>
              </div>
              <span className="text-[7px] font-mono-receipt font-bold bg-black text-white px-1 py-0.5">VERIFIED</span>
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-sm font-black uppercase">{data.shoeModel || 'RETRO HIGH OG "CHICAGO"'}</div>
              <div className="text-[8px] font-mono-receipt font-bold mt-0.5">{data.shoeSize || 'US 10.5 • EU 44.5'}</div>
            </div>

            <div className="bg-black text-white p-1 text-center font-condensed-bold text-xs font-bold rounded-xs">
              {data.certStatus || '✔ 100% VERIFIED AUTHENTIC'}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black text-[7px] font-mono-receipt">
              <div>
                <div>{data.skuCode || 'SKU: DZ5485-612'}</div>
                <div className="opacity-75">{data.inspectorId || 'INSPECTED BY #09'}</div>
              </div>
              <QRCodeRenderer value={data.authQr || 'https://kicksauth.com/verify/DZ5485'} size={30 * ratio} />
            </div>
          </div>
        );

      // 49. ARTISAN TEA BLEND TIN & POUCH LABEL
      case 'tpl-artisan-tea-label':
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <IconTeaCupLeaf size={16 * ratio} />
              <span className="font-serif-vintage text-xs font-bold uppercase">{data.teaHouse || 'ROYAL TEA HERITAGE'}</span>
              <IconTeaCupLeaf size={16 * ratio} />
            </div>

            <div className="text-center py-1 border-b border-black">
              <div className="font-condensed-bold text-base font-black uppercase">{data.teaBlendName || 'EARL GREY IMPERIAL'}</div>
              <div className="text-[7px] font-serif-vintage italic opacity-85 mt-0.5 leading-tight">
                {data.blendDescription || 'Ceylon Siyah Çay, Doğal Bergamot Yağı & Peygamber Çiçeği.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-center font-mono-receipt text-[7.5px] border-b border-black pb-1.5">
              <div className="bg-black text-white p-1 rounded-xs font-bold">🌡 {data.brewTemp || '95°C SU'}</div>
              <div className="border border-black p-1 rounded-xs font-bold">⏱ {data.brewTime || '3 - 4 DAKİKA'}</div>
            </div>

            <div className="flex justify-between text-[7px] font-mono-receipt opacity-80 pt-0.5">
              <span>{data.originInfo || 'SINGLE ESTATE'}</span>
              <span className="font-bold">{data.teaWeight || '100G / 3.5 OZ'}</span>
            </div>
          </div>
        );

      // 50. WAREHOUSE MASTER PALLET & HEAVY FREIGHT TAG
      case 'tpl-warehouse-master-pallet':
        return (
          <div className="p-3 border-4 border-black font-clean flex flex-col justify-between h-full space-y-2 bg-white text-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1.5">
                <IconForkliftPallet size={22 * ratio} />
                <span className="font-condensed-bold text-sm font-black uppercase">{data.hubTitle || 'GLOBAL LOGISTICS HUB'}</span>
              </div>
              <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black font-mono-receipt">PALLET UNIT</span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2">
              <div className="border-2 border-black p-1.5 rounded-xs">
                <div className="text-[6.5px] font-mono-receipt opacity-75">PALLET ID (SSCC)</div>
                <div className="font-condensed-bold text-lg font-black">{data.palletId || 'PAL-9840-2026-X1'}</div>
              </div>
              <div className="bg-black text-white p-1.5 rounded-xs">
                <div className="text-[6.5px] opacity-75 font-mono-receipt">HEDEF RAF / BAY</div>
                <div className="font-condensed-bold text-sm font-black">{data.destBay || 'BAY: ZONE-4B'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono-receipt text-center">
              <div className="border border-black p-1">
                <span className="text-[6.5px] opacity-75 block">BRÜT AĞIRLIK</span>
                <span className="font-black text-base">{data.grossWeight || '485.5 KG'}</span>
              </div>
              <div className="border border-black p-1">
                <span className="text-[6.5px] opacity-75 block">KOLİ ADEDİ</span>
                <span className="font-black text-base">{data.cartonCount || '36 KOLİ'}</span>
              </div>
            </div>

            <div className="bg-stone-100 p-1 border border-black text-center text-[7px] font-mono-receipt font-bold">
              ⚠ {data.stackWarning || 'MAKSİMUM 2 PALET İSTİFLENEBİLİR • FORKLİFT İLE TAŞIYINIZ'}
            </div>

            <div className="flex justify-center pt-1 border-t-2 border-black">
              <BarcodeRenderer value={data.masterBarcode || '(00)386901234567890123'} height={32 * ratio} width={1.4 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // ========================================================
      // 51 - 75 YENİ ŞABLONLAR
      // ========================================================

      // 51. YANGIN GÜVENLİĞİ & ACİL ÇIKIŞ / SÖNDÜRÜCÜ (Görsel Referans 1)
      case 'tpl-fire-safety-exit-extinguisher':
        return (
          <div className="p-3 bg-red-600 text-white rounded-xl flex flex-col justify-between h-full space-y-2 border-4 border-white shadow-inner font-sans">
            <div className="border-2 border-white rounded-lg p-2 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex justify-center items-center space-x-3 pt-1">
                <div className="bg-white text-red-600 p-2 rounded-full shadow">
                  {data.signType?.includes('EXIT') ? (
                    <IconEmergencyExitDoor size={36 * ratio} />
                  ) : data.signType?.includes('DANGER') ? (
                    <IconFireFlame size={36 * ratio} />
                  ) : (
                    <IconFireExtinguisher size={36 * ratio} />
                  )}
                </div>
              </div>

              <h1 className="font-condensed-bold text-2xl tracking-wider font-black uppercase text-white leading-none">
                {data.signType || 'FIRE EXTINGUISHER'}
              </h1>

              <div className="bg-white text-red-600 font-bold px-3 py-1 text-xs rounded uppercase tracking-wide">
                {data.subText || 'ACİL DURUM SÖNDÜRME TÜPÜ'}
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono border-t border-red-400 pt-1 text-red-100">
              <span>{data.locationZone || 'KAT 2 • A BLOK'}</span>
              <span>{data.inspectDate || 'KONTROL: 08/2026'}</span>
            </div>
          </div>
        );

      // 52. ENDÜSTRİYEL DİKKAT ÇALIŞMA VAR (Görsel Referans 2)
      case 'tpl-caution-work-in-progress':
        return (
          <div className="p-3 bg-amber-400 text-black border-4 border-black rounded-2xl flex flex-col justify-between h-full space-y-2 font-sans">
            {/* Siyah üst ikaz bandı */}
            <div className="bg-black text-amber-400 py-1.5 px-3 rounded-lg text-center flex items-center justify-center space-x-2">
              <IconCautionTriangle size={20 * ratio} className="text-amber-400" />
              <span className="font-condensed-bold text-2xl font-black tracking-widest uppercase">
                {data.headerText || 'CAUTION'}
              </span>
              <IconCautionTriangle size={20 * ratio} className="text-amber-400" />
            </div>

            {/* Orta devasa WORK IN PROGRESS */}
            <div className="text-center py-2 flex flex-col items-center justify-center">
              <h2 className="font-condensed-bold text-3xl sm:text-4xl font-black uppercase leading-none tracking-tight text-black">
                {data.mainMessage || 'WORK IN PROGRESS'}
              </h2>
            </div>

            {/* Alt uyarı & şantiye bilgisi */}
            <div className="border-t-2 border-black pt-1.5 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">
                {data.subNotice || 'AUTHORIZED PERSONNEL ONLY • BARET VE YELEK ZORUNLUDUR'}
              </p>
              <div className="text-[8px] font-mono font-semibold opacity-75">
                {data.contractorInfo || 'ŞANTİYE GÜVENLİK BİRİMİ'}
              </div>
            </div>
          </div>
        );

      // 53. MİZAHİ OFİS / LAPTOP "CAUTION INTROVERT" STICKER (Görsel Referans 3)
      case 'tpl-caution-introvert':
        return (
          <div className="p-3 bg-amber-400 text-black border-4 border-black rounded-2xl flex flex-col justify-between h-full space-y-2 font-sans">
            <div className="border-2 border-black rounded-xl p-2.5 flex flex-col items-center text-center space-y-1.5 bg-amber-300">
              {/* Caution header with triangle icon */}
              <div className="flex items-center space-x-1 font-condensed-bold text-sm tracking-widest font-black uppercase">
                <IconCautionTriangle size={14 * ratio} />
                <span>{data.badgeLabel || 'CAUTION'}</span>
              </div>

              {/* Huge INTROVERT text */}
              <h1 className="font-condensed-bold text-3xl font-black tracking-wider uppercase leading-none text-black">
                {data.mainWord || 'INTROVERT'}
              </h1>

              {/* Subtitles */}
              <div className="border-t border-black w-full pt-1.5 space-y-1">
                <p className="font-bold text-xs uppercase tracking-wide">
                  {data.line1 || 'NO TALKING ALLOWED'}
                </p>
                <p className="text-[9px] font-semibold tracking-tight uppercase leading-snug px-1">
                  {data.line2 || 'ANY OTHER SOCIAL INTERACTIONS SHOULD BE KEPT TO A MINIMUM'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-mono font-bold text-stone-800 px-1">
              <span>{data.batteryLevel || '🔋 SOSYAL BATARYA: %4'}</span>
              <span>DND MODE: ON</span>
            </div>
          </div>
        );

      // 54. "TO AVOID INJURY DON'T TELL ME WHAT TO DO" PİKTOGRAMLI MİZAH & İKAZ (Görsel Referans 4)
      case 'tpl-warning-to-avoid-injury':
        return (
          <div className="p-3 bg-amber-400 text-black border-4 border-black rounded-2xl flex flex-col justify-between h-full space-y-2 font-sans">
            {/* Üst Warning Rozeti */}
            <div className="bg-black text-amber-400 py-1 px-3 rounded-lg text-center flex items-center justify-center space-x-1.5">
              <IconCautionTriangle size={18 * ratio} className="text-amber-400" />
              <span className="font-condensed-bold text-xl font-black tracking-widest uppercase">
                {data.warningTitle || 'WARNING'}
              </span>
            </div>

            {/* Düşen adam piktogramı */}
            <div className="flex justify-center items-center py-1">
              <IconSlippingFallingPerson size={48 * ratio} className="text-black" />
            </div>

            {/* Mesaj */}
            <div className="border-t-2 border-black pt-1 text-center space-y-0.5">
              <p className="font-condensed-bold text-sm font-black tracking-wider uppercase text-black">
                {data.headlinePart1 || 'TO AVOID INJURY'}
              </p>
              <h2 className="font-condensed-bold text-base font-black tracking-wide uppercase text-black leading-tight">
                {data.headlinePart2 || "DON'T TELL ME WHAT TO DO"}
              </h2>
            </div>

            {/* Sarı-Siyah Hazard Zebra Çizgileri */}
            <div
              className="h-4 w-full rounded border border-black"
              style={{
                background: 'repeating-linear-gradient(45deg, #000, #000 8px, #f59e0b 8px, #f59e0b 16px)'
              }}
            />

            <div className="text-center text-[8px] font-mono font-semibold text-stone-900">
              {data.footerNote || 'DEVELOPER AT WORK • DO NOT DISTURB'}
            </div>
          </div>
        );

      // 55. YÜKSEK GERİLİM & ELEKTRİK PANOSU TEHLİKE LEVHASI
      case 'tpl-danger-high-voltage':
        return (
          <div className="p-3 border-4 border-black bg-yellow-300 text-black rounded-lg flex flex-col justify-between h-full space-y-2 font-sans">
            <div className="bg-red-600 text-white text-center py-1 rounded font-condensed-bold text-lg font-black tracking-wider uppercase flex items-center justify-center space-x-2">
              <IconHighVoltage size={20 * ratio} className="text-yellow-300" />
              <span>{data.dangerHeader || 'TEHLİKE • DANGER'}</span>
              <IconHighVoltage size={20 * ratio} className="text-yellow-300" />
            </div>

            <div className="flex items-center space-x-3 py-1">
              <div className="bg-black text-yellow-300 p-2 rounded-lg flex-shrink-0">
                <IconHighVoltage size={36 * ratio} />
              </div>
              <div className="space-y-1">
                <div className="font-condensed-bold text-base font-black uppercase text-black leading-tight">
                  {data.voltageText || '400 VOLT YÜKSEK GERİLİM'}
                </div>
                <div className="text-[10px] font-black text-red-700 uppercase tracking-wide">
                  {data.fatalWarning || 'ÖLÜM TEHLİKESİ • DOKUNMAYINIZ!'}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black pt-1 flex justify-between items-center text-[9px] font-mono font-bold">
              <span>{data.panelId || 'PNO-08'}</span>
              <span>{data.emergencyTel || 'Dahili: 4444'}</span>
            </div>
          </div>
        );

      // 56. BİYOLOJİK & KİMYASAL TEHLİKE NUMUNE ETİKETİ (BIOHAZARD)
      case 'tpl-biohazard-lab-specimen':
        return (
          <div className="p-3 border-2 border-black bg-amber-500 text-black rounded-lg flex flex-col justify-between h-full space-y-2 font-sans">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-2">
                <IconBiohazard size={26 * ratio} className="text-black" />
                <span className="font-condensed-bold text-sm font-black uppercase tracking-wider">
                  {data.hazardTitle || 'BIOHAZARD • BİYOLOJİK RİSK'}
                </span>
              </div>
              <span className="bg-black text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                {data.unCode || 'UN 3373'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-black uppercase">{data.subRisk || 'INFECTIOUS SUBSTANCE • KATEGORİ B'}</div>
              <div className="text-[10px] font-mono">{data.labOrigin || 'MERKEZ VİROLOJİ & TANI LAB'}</div>
              <p className="text-[9px] italic leading-tight text-stone-900 border-l-2 border-black pl-1.5">
                {data.handlingCaution || 'Yalnızca yetkili personel açabilir. 2-8°C muhafaza ediniz.'}
              </p>
            </div>

            <div className="flex justify-center pt-1 border-t border-black">
              <BarcodeRenderer value={data.bioBarcode || 'BIO-3373-89104'} height={22 * ratio} width={1.2 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 57. ISLAK ZEMİN & KAYMA TEHLİKESİ İKAZI
      case 'tpl-caution-wet-floor':
        return (
          <div className="p-3 bg-yellow-400 text-black border-4 border-black rounded-xl flex flex-col justify-between h-full space-y-2 text-center font-sans">
            <div className="bg-black text-yellow-400 py-1 rounded font-condensed-bold text-base font-black tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <IconCautionTriangle size={16 * ratio} />
              <span>{data.topNotice || 'DİKKAT • CAUTION'}</span>
            </div>

            <div className="flex justify-center py-1">
              <IconSlippingFallingPerson size={44 * ratio} className="text-black" />
            </div>

            <div className="space-y-0.5">
              <h2 className="font-condensed-bold text-xl font-black uppercase text-black leading-none">
                {data.mainWarningTr || 'KAYGAN ZEMİN'}
              </h2>
              <h3 className="font-condensed-bold text-lg font-black uppercase text-stone-900 leading-none">
                {data.mainWarningEn || 'WET FLOOR'}
              </h3>
            </div>

            <div className="text-[8px] font-mono font-bold border-t border-black pt-1 text-stone-900">
              {data.cleaningStatus || 'TEMİZLİK YAPILMAKTADIR • YAVAŞ YÜRÜYÜNÜZ'}
            </div>
          </div>
        );

      // 58. VINTAGE 90S MIXTAPE KASET SIRTI & ŞARKI LİSTESİ
      case 'tpl-vintage-mixtape-cassette':
        return (
          <div className="p-2.5 border-2 border-stone-800 bg-stone-100 text-stone-900 font-mono flex flex-col justify-between h-full space-y-1.5">
            {/* Kaset üst başlığı ve yüzü */}
            <div className="border-b-2 border-stone-800 pb-1 flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                <IconAudioCassetteTape size={18 * ratio} className="text-stone-800" />
                <span className="font-bold text-xs uppercase tracking-tight">{data.cassetteTitle || 'SUMMER VIBES 1996'}</span>
              </div>
              <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{data.sideLabel || 'SIDE A'}</span>
            </div>

            {/* Parça Listesi */}
            <div className="bg-white border border-stone-300 p-1.5 rounded text-[9px] leading-relaxed space-y-0.5 font-mono">
              <div className="text-stone-600 text-[8px] font-bold">TRACKLIST:</div>
              <div>{data.tracklist || '1. Midnight City  2. Retro Drive  3. Sunset Groove'}</div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-stone-600 border-t border-stone-300 pt-1">
              <span>{data.cassetteType || 'TYPE II (CrO2) • DOLBY B'}</span>
              <span>{data.recordDate || 'REC: 1996'}</span>
            </div>
          </div>
        );

      // 59. 33 RPM VİNİL PLAK GÖBEK ETİKETİ
      case 'tpl-vinyl-center-label':
        return (
          <div className="p-3 border-4 border-stone-900 bg-stone-900 text-amber-100 rounded-full flex flex-col justify-between items-center text-center h-full aspect-square space-y-1 font-serif">
            <div className="pt-1">
              <div className="text-[9px] font-sans font-black tracking-widest uppercase text-amber-300">
                {data.recordLabel || 'ANALOG DREAMS RECORDS'}
              </div>
              <div className="text-[7px] font-mono tracking-widest text-stone-400">STEREO HIGH FIDELITY</div>
            </div>

            {/* Plak göbek deliği halkası */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center bg-stone-800">
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-stone-500" />
              </div>
            </div>

            <div>
              <h2 className="font-bold text-xs text-white leading-tight">{data.albumArtist || 'THE VELVET TRIO • NOCTURNE IN BLUE'}</h2>
              <p className="text-[8px] font-mono text-amber-200 mt-0.5">{data.sideRpm || 'SIDE 1 • 33 ⅓ RPM'}</p>
            </div>

            <div className="text-[7px] font-mono text-stone-400 pb-1">
              {data.catalogNo || 'ADR-LP-2026'} • {data.rightsText || 'MADE IN ISTANBUL'}
            </div>
          </div>
        );

      // 60. VETERİNER SAĞLIK & AŞI TAKİP KARNESİ ETİKETİ
      case 'tpl-pet-vaccination-record':
        return (
          <div className="p-3 border-2 border-emerald-800 bg-emerald-50 text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconVeterinaryPaw size={20 * ratio} className="text-emerald-800" />
                <span className="font-condensed-bold text-xs font-bold text-emerald-900 uppercase">
                  {data.vetClinicName || 'PATİ VETERİNER KLİNİĞİ'}
                </span>
              </div>
              <span className="text-[8px] font-mono bg-emerald-800 text-white px-1.5 py-0.5 rounded font-bold">AŞI KARTI</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="col-span-2 space-y-0.5">
                <div className="font-bold text-xs text-stone-900">{data.petNameBreed || 'LOKUM • Scottish Fold'}</div>
                <div className="text-[9px] font-mono text-stone-600">{data.microchipNo || 'ÇİP: 981098102948571'}</div>
                <div className="bg-emerald-100 text-emerald-900 text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5">
                  {data.vaccineName || 'KARMA + KUDUZ'}
                </div>
                <div className="text-[8px] font-mono text-stone-700 pt-0.5">{data.vaccineDates || 'UYGULAMA: 27.08.2026'}</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <QRCodeRenderer value={data.petPassportQr || 'https://pativet.com/passport'} size={44 * ratio} />
                <span className="text-[7px] font-mono text-stone-500 mt-0.5">Dijital Karne</span>
              </div>
            </div>

            <div className="text-[8px] font-mono text-stone-500 border-t border-emerald-200 pt-1 text-right">
              {data.vetSignature || 'Vet. Hek. Onay'}
            </div>
          </div>
        );

      // 61. BUTİK SUSHİ & OMAKASE PAKETLEME MÜHRÜ
      case 'tpl-sushi-omakase-box':
        return (
          <div className="p-3 border-2 border-stone-900 bg-stone-50 text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="text-center border-b border-stone-300 pb-1">
              <div className="flex justify-center py-0.5">
                <IconSushiSet size={22 * ratio} className="text-stone-800" />
              </div>
              <h2 className="font-condensed-bold text-xs tracking-widest font-black uppercase text-stone-900">
                {data.sushiBarName || 'TOKYO ARTISAN SUSHI LAB'}
              </h2>
            </div>

            <div className="text-center space-y-1 py-1">
              <h3 className="font-bold text-sm text-stone-900 uppercase">{data.setMenuName || 'PREMIUM OMAKASE SET (18 PCS)'}</h3>
              <div className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded inline-block">
                {data.prepTime || 'HAZIRLANDI: 19:25'}
              </div>
              <p className="text-[8px] text-stone-600 italic px-2">
                {data.freshnessNote || 'Lütfen hazırlandıktan sonra 2 saat içinde tüketiniz.'}
              </p>
            </div>

            <div className="border-t border-stone-300 pt-1 flex justify-between items-center text-[8px] font-mono text-stone-500">
              <span>{data.chefSeal || 'Chef: Kenji Sato'}</span>
              <span>AUTHENTIC JAPANESE</span>
            </div>
          </div>
        );

      // 62. LÜKS SPA & TERMAL MASAJ RANDEVU KARTI
      case 'tpl-luxury-spa-appointment':
        return (
          <div className="p-3 border border-stone-400 bg-stone-50 text-stone-800 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-serif">
            <div className="text-center border-b border-stone-300 pb-1">
              <div className="flex justify-center py-0.5">
                <IconSpaLotusFlower size={22 * ratio} className="text-stone-700" />
              </div>
              <h1 className="font-sans text-xs tracking-widest uppercase font-bold text-stone-900">
                {data.spaName || 'ZENITH BOTANICAL SPA & WELLNESS'}
              </h1>
            </div>

            <div className="space-y-1 text-xs py-0.5">
              <div className="flex justify-between border-b border-stone-200 pb-0.5">
                <span className="text-stone-500 font-sans text-[10px]">Misafir:</span>
                <span className="font-bold">{data.guestName || 'Selin Yılmaz'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-0.5">
                <span className="text-stone-500 font-sans text-[10px]">Bakım:</span>
                <span className="font-semibold">{data.sessionDetails || 'Aromaterapi Sıcak Taş'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-0.5">
                <span className="text-stone-500 font-sans text-[10px]">Terapist & Oda:</span>
                <span>{data.therapistRoom || 'Maya • Lotus Suiti'}</span>
              </div>
              <div className="bg-stone-200 text-stone-900 font-sans font-bold text-[10px] text-center py-1 rounded">
                {data.appointmentDateTime || '28 AĞUSTOS 2026 • 15:30'}
              </div>
            </div>

            <p className="text-[7px] font-sans text-stone-500 text-center italic border-t border-stone-200 pt-1">
              {data.spaNotice || 'Lütfen seans saatinden 15 dakika önce spa alanında olunuz.'}
            </p>
          </div>
        );

      // 63. NOSTALJİK KİTAP AYRACI & EDEBİ ALINTI ŞABLONU
      case 'tpl-vintage-library-bookmark':
        return (
          <div className="p-2.5 border-2 border-stone-800 bg-amber-50 text-stone-900 flex flex-col justify-between h-full space-y-2 font-serif">
            <div className="text-center border-b border-stone-800 pb-1">
              <div className="flex justify-center">
                <IconBookmarkRibbon size={18 * ratio} className="text-stone-800" />
              </div>
              <span className="text-[9px] font-sans font-bold tracking-wider uppercase text-stone-700">
                {data.exLibrisHeader || 'EX LIBRIS • KİŞİSEL KÜTÜPHANE'}
              </span>
            </div>

            <div className="space-y-1.5 py-1 text-center">
              <h2 className="font-bold text-xs italic text-stone-900">{data.bookInfo || 'Dönüşüm — Franz Kafka'}</h2>
              <blockquote className="text-[9px] italic leading-relaxed text-stone-800 px-1 border-y border-stone-300 py-1.5">
                {data.quoteText || '"Kendini yatağında dev bir böceğe dönüşmüş olarak buldu."'}
              </blockquote>
            </div>

            <div className="text-[8px] font-sans text-stone-600 border-t border-stone-800 pt-1 text-center font-mono">
              {data.pageTracker || 'Sayfa: _____ • 2026'}
            </div>
          </div>
        );

      // 64. OPTİK GÖZLÜK REÇETESİ & ODAK DEĞERLERİ KARTI
      case 'tpl-optical-rx-prescription':
        return (
          <div className="p-3 border-2 border-stone-900 bg-white text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex justify-between items-center border-b-2 border-stone-900 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconGlassesOptic size={20 * ratio} className="text-stone-900" />
                <span className="font-condensed-bold text-xs font-bold uppercase">{data.opticianName || 'VİZYON OPTİK'}</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded">Rx CARD</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-stone-900">Hasta: {data.patientName || 'Emre Karaca'}</div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[10px] bg-stone-100 p-1.5 rounded border border-stone-300">
                <div className="font-bold">{data.rightEye || 'OD: -1.75 | -0.50 | 180°'}</div>
                <div className="font-bold">{data.leftEye || 'OS: -2.00 | -0.75 | 175°'}</div>
              </div>
              <div className="text-[9px] text-stone-600">{data.lensDetails || '1.61 Antirefle Mavi Işık • PD: 63mm'}</div>
            </div>

            <div className="flex justify-center border-t border-stone-300 pt-1">
              <BarcodeRenderer value={data.orderBarcode || 'OPT-2026-9941'} height={20 * ratio} width={1.1 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 65. DİŞ KLİNİĞİ RANDEVU & TEDAVİ HATIRLATICI
      case 'tpl-dental-clinic-appointment':
        return (
          <div className="p-3 border-2 border-cyan-800 bg-cyan-50 text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b-2 border-cyan-800 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconDentalTooth size={18 * ratio} className="text-cyan-800" />
                <span className="font-condensed-bold text-xs font-bold text-cyan-900 uppercase">
                  {data.dentalClinicName || 'DENTANOVA AĞIZ VE DİŞ'}
                </span>
              </div>
              <span className="text-[8px] font-mono bg-cyan-800 text-white px-1.5 py-0.5 rounded font-bold">RANDEVU</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-500">Hasta:</span>
                <span className="font-bold">{data.patientName || 'Gamze Çetin'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-500">Hekim:</span>
                <span className="font-semibold">{data.dentistName || 'Dt. Barış Yıldız'}</span>
              </div>
              <div className="bg-cyan-800 text-white font-bold text-center py-1 rounded text-xs">
                {data.appointmentTime || '02 EYLÜL 2026 • 14:00'}
              </div>
              <div className="text-[9px] font-mono text-cyan-900 font-semibold text-center">
                {data.procedureType || 'KONTROL & DİŞ TAŞI TEMİZLİĞİ'}
              </div>
            </div>

            <p className="text-[7px] text-stone-500 italic text-center border-t border-cyan-200 pt-1">
              {data.reminderNotice || 'Randevu değişikliği için lütfen 24 saat önceden haber veriniz.'}
            </p>
          </div>
        );

      // 66. BİTKİSEL YAĞ & TENTÜR DAMLALIK ŞİŞE ETİKETİ
      case 'tpl-dropper-tincture-oil':
        return (
          <div className="p-2.5 border-2 border-stone-800 bg-stone-50 text-stone-900 rounded flex flex-col justify-between h-full space-y-1 font-serif">
            <div className="text-center border-b border-stone-300 pb-0.5">
              <div className="flex justify-center">
                <IconDropperBottle size={16 * ratio} className="text-stone-700" />
              </div>
              <span className="text-[8px] font-sans font-bold tracking-widest uppercase text-stone-600">
                {data.apothecaryBrand || 'HERBAL APOTHECARY'}
              </span>
            </div>

            <div className="text-center space-y-0.5 py-0.5">
              <h2 className="font-bold text-xs uppercase text-stone-900">{data.tinctureTitle || 'VALERIAN & PASSIONFLOWER'}</h2>
              <div className="text-[9px] font-sans font-bold text-stone-700">{data.potencyRatio || '1:3 EKSTRAKT • 30 ML'}</div>
              <p className="text-[8px] font-sans text-stone-600 italic leading-tight px-1">
                {data.usageDosage || 'Günde 1 kez 15-20 damla suya damlatarak alınız.'}
              </p>
            </div>

            <div className="text-[7px] font-mono text-stone-500 border-t border-stone-300 pt-0.5 text-center">
              {data.batchExpiry || 'BATCH: 2608 • SKT: 08/2028'}
            </div>
          </div>
        );

      // 67. ARAÇ MOTOR YAĞI DEĞİŞİM & KM HATIRLATICI CAM ÇIKARTMASI
      case 'tpl-engine-oil-reminder':
        return (
          <div className="p-3 border-2 border-black bg-yellow-100 text-black rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b-2 border-black pb-1">
              <div className="flex items-center space-x-1.5">
                <IconEngineOilGauge size={20 * ratio} className="text-black" />
                <span className="font-condensed-bold text-xs font-bold uppercase">{data.serviceGarage || 'MOTORSPEED OTO SERVİS'}</span>
              </div>
              <span className="text-[8px] font-mono bg-black text-yellow-300 px-1.5 py-0.5 rounded font-bold">PERİYODİK BAKIM</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[10px] text-stone-700">Son Bakım: {data.currentService || '27.08.2026 • 124.500 KM'}</div>
              <div className="text-[10px] font-mono font-semibold">{data.oilViscosity || 'Castrol 5W-30 Tam Sentetik'}</div>
              <div className="bg-black text-yellow-300 p-1.5 rounded text-center font-bold text-xs">
                {data.nextServiceDue || 'GELECEK BAKIM: 139.500 KM'}
              </div>
            </div>

            <div className="text-[8px] font-mono text-stone-600 border-t border-stone-400 pt-1 text-center">
              {data.serviceContact || 'Servis Randevu: 0216 444 88 99'}
            </div>
          </div>
        );

      // 68. TEK KÖKEN ZANAATKAR ÇİKOLATA SARGI BANDI
      case 'tpl-single-origin-chocolate':
        return (
          <div className="p-3 border-2 border-stone-900 bg-amber-950 text-amber-50 rounded flex flex-col justify-between h-full space-y-1.5 font-serif">
            <div className="text-center border-b border-amber-800 pb-1">
              <div className="flex justify-center py-0.5">
                <IconChocolateBar size={20 * ratio} className="text-amber-200" />
              </div>
              <span className="text-[8px] font-sans font-bold tracking-widest uppercase text-amber-400">
                {data.chocolatierName || 'NOIR & CACAO ARTISAN'}
              </span>
            </div>

            <div className="text-center space-y-1 py-0.5">
              <h2 className="font-bold text-sm tracking-wide text-white">{data.originCocoa || '%82 MADAGASCAR SAMBIRANO'}</h2>
              <div className="text-[9px] font-sans tracking-wider text-amber-300 uppercase">
                {data.flavorNotes || 'KIRMIZI MEYVELER • TURUNÇGİL • SEDİR'}
              </div>
              <div className="text-[8px] font-sans text-amber-200/80 italic">{data.beanToBarBadge || 'BEAN-TO-BAR ZANAAT'}</div>
            </div>

            <div className="border-t border-amber-800 pt-1 flex justify-between items-center text-[8px] font-mono text-amber-300">
              <span>{data.netWeightPrice || 'NET: 70G'}</span>
              <span>CRAFT CHOCOLATE</span>
            </div>
          </div>
        );

      // 69. CRAFT KOKTEYL ŞURUBU & BAR ŞİŞE ETİKETİ
      case 'tpl-cocktail-syrup-bottle':
        return (
          <div className="p-2.5 border-2 border-stone-800 bg-stone-50 text-stone-900 rounded flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="text-center border-b border-stone-300 pb-1">
              <div className="flex justify-center">
                <IconSyrupBottleCocktail size={18 * ratio} className="text-stone-800" />
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase text-stone-600">
                {data.syrupBrand || 'BOTANICAL MIXOLOGY CO.'}
              </span>
            </div>

            <div className="text-center space-y-0.5 py-0.5">
              <h2 className="font-condensed-bold text-sm font-black uppercase text-stone-900">
                {data.syrupFlavor || 'PASSION FRUIT & VANILLA'}
              </h2>
              <div className="text-[9px] font-bold text-amber-700">{data.syrupSpec || '65° BRIX • DOĞAL MEYVE'}</div>
              <div className="text-[8px] text-stone-600">{data.servingRatio || '1 Kısım Şurup + 5 Kısım Soda'}</div>
            </div>

            <div className="text-[7px] font-mono text-stone-500 border-t border-stone-300 pt-0.5 text-center">
              {data.bottleVolExpiry || '500 ML • Buzdolabında Saklayınız'}
            </div>
          </div>
        );

      // 70. KURU MEYVE & KURUYEMİŞ DOYPACK KİLİTLİ POŞET ETİKETİ
      case 'tpl-doypack-dried-fruits':
        return (
          <div className="p-3 border-2 border-stone-900 bg-stone-50 text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b border-stone-300 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconNutHazelnut size={18 * ratio} className="text-stone-800" />
                <span className="font-condensed-bold text-xs font-bold uppercase">{data.farmBrand || 'ANADOLU GURME HASAT'}</span>
              </div>
              <span className="text-[8px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">%100 DOĞAL</span>
            </div>

            <div className="space-y-0.5">
              <h2 className="font-bold text-xs text-stone-900">{data.productTitle || 'GÜNEŞTE KURUTULMUŞ MALATYA KAYISISI'}</h2>
              <p className="text-[9px] text-stone-600">{data.processingMethod || 'Kükürtsüz & İlave Şekersiz'}</p>
              <div className="text-[8px] font-mono text-stone-500">{data.nutritionSummary || '100g: 241 kcal | Yüksek Lif'}</div>
              <div className="text-[8px] font-bold text-stone-700">{data.allergenNet || 'NET: 250G e'}</div>
            </div>

            <div className="flex justify-center border-t border-stone-300 pt-1">
              <BarcodeRenderer value={data.productBarcode || '8690192837461'} height={20 * ratio} width={1.1 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 71. GURME BAHARAT & TÜTSÜ ÇEŞNİ KAVANOZ ETİKETİ
      case 'tpl-spice-jar-gastronomy':
        return (
          <div className="p-2.5 border-2 border-stone-800 bg-amber-50 text-stone-900 rounded flex flex-col justify-between h-full space-y-1 font-serif">
            <div className="text-center border-b border-stone-300 pb-0.5">
              <div className="flex justify-center">
                <IconSpiceJarHerbs size={16 * ratio} className="text-stone-700" />
              </div>
              <span className="text-[8px] font-sans font-bold tracking-wider uppercase text-stone-600">
                {data.spiceBrand || 'BAHARAT-I OSMANİYE'}
              </span>
            </div>

            <div className="text-center space-y-0.5 py-0.5">
              <h2 className="font-bold text-xs uppercase text-stone-900">{data.spiceName || 'TÜTSÜLENMİŞ DENİZ TUZU'}</h2>
              <p className="text-[8px] font-sans text-stone-600 italic px-1">
                {data.usagePairing || 'Izgara etler ve fırın sebzeler için idealdir.'}
              </p>
            </div>

            <div className="text-[7px] font-mono text-stone-500 border-t border-stone-300 pt-0.5 text-center">
              {data.spiceNet || 'NET: 110G • Menşei: Türkiye'}
            </div>
          </div>
        );

      // 72. YENİDOĞAN BEBEK DOĞUM BİLGİ & ANI KARTI
      case 'tpl-baby-milestone-footprint':
        return (
          <div className="p-3 border-2 border-pink-300 bg-pink-50 text-stone-800 rounded-xl flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="text-center border-b border-pink-200 pb-1">
              <div className="flex justify-center py-0.5">
                <IconBabyFootprint size={22 * ratio} className="text-pink-600" />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-pink-700">
                {data.welcomeHeading || 'HOŞ GELDİN DÜNYAMIZA'}
              </span>
            </div>

            <div className="text-center space-y-1 py-0.5">
              <h1 className="font-serif text-lg font-bold text-pink-950 tracking-wide">{data.babyFullName || 'MİRA DEMİR'}</h1>
              <div className="flex justify-center space-x-3 text-[10px] font-mono text-stone-700 bg-white/80 py-1 rounded border border-pink-200">
                <span>📅 {data.birthDateTime || '27.08.2026 • 06:42'}</span>
                <span>⚖️ {data.statsWeightHeight || '3.420 GR • 51 CM'}</span>
              </div>
            </div>

            <div className="text-[8px] text-stone-500 border-t border-pink-200 pt-1 text-center italic">
              {data.parentsNames || 'Zeynep & Emre Demir'}
            </div>
          </div>
        );

      // 73. DÜĞÜN / NİŞAN MASA OTURMA & İSİM KARTI (PLACE CARD)
      case 'tpl-wedding-place-name-card':
        return (
          <div className="p-3 border-2 border-stone-400 bg-stone-50 text-stone-900 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-serif">
            <div className="text-center border-b border-stone-300 pb-1">
              <div className="flex justify-center py-0.5">
                <IconWeddingRingsInterlocked size={20 * ratio} className="text-stone-700" />
              </div>
              <span className="font-serif italic text-xs font-bold text-stone-800">
                {data.coupleNames || 'Ece & Caner'} • {data.eventDate || '28 EYLÜL 2026'}
              </span>
            </div>

            <div className="text-center py-1 space-y-1">
              <span className="text-[9px] font-sans text-stone-500 uppercase tracking-widest">Hoş Geldiniz</span>
              <h2 className="font-bold text-sm text-stone-900">{data.guestName || 'Sayın Prof. Dr. Ahmet Yılmaz'}</h2>
              <div className="bg-stone-900 text-white font-sans text-xs font-bold px-3 py-1 rounded inline-block">
                {data.tableNumber || 'MASA 7'}
              </div>
            </div>

            <p className="text-[7px] text-stone-500 text-center italic border-t border-stone-300 pt-1">
              {data.thankYouNote || 'Bu özel günümüzde yanımızda olduğunuz için teşekkür ederiz.'}
            </p>
          </div>
        );

      // 74. KARGO & PALET "ÜST ÜSTE KOYMAYINIZ" AĞIR İKAZ (DO NOT STACK)
      case 'tpl-do-not-stack-pallet-tag':
        return (
          <div className="p-3 bg-white text-black border-4 border-red-600 rounded-lg flex flex-col justify-between h-full space-y-2 font-sans">
            <div className="bg-red-600 text-white text-center py-1 rounded font-condensed-bold text-sm font-black tracking-wider uppercase">
              {data.cautionHeader || 'DİKKAT • HASSAS ÜST YÜZEY'}
            </div>

            <div className="flex items-center space-x-3 py-1">
              <div className="bg-red-50 p-2 rounded-lg border border-red-300 flex-shrink-0">
                <IconDoNotStack size={40 * ratio} className="text-red-600" />
              </div>
              <div className="space-y-0.5">
                <h2 className="font-condensed-bold text-lg font-black uppercase text-red-600 leading-none">
                  {data.mainWarningTr || 'ÜST ÜSTE KOYMAYINIZ'}
                </h2>
                <h3 className="font-condensed-bold text-base font-black uppercase text-black leading-none">
                  {data.mainWarningEn || 'DO NOT STACK'}
                </h3>
              </div>
            </div>

            <p className="text-[9px] font-semibold text-stone-700 border-l-2 border-red-600 pl-1.5">
              {data.riskReason || 'Koli içerisinde hassas elektronik mevcuttur.'}
            </p>

            <div className="flex justify-center border-t border-stone-300 pt-1">
              <BarcodeRenderer value={data.cargoBarcode || 'NO-STACK-901842'} height={22 * ratio} width={1.2 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 75. KALİTE KONTROL ONAYLI / TEST EDİLDİ MÜHRÜ (QC INSPECTED & PASSED)
      case 'tpl-qc-passed-inspection-stamp':
        return (
          <div className="p-3 border-2 border-emerald-800 bg-emerald-50 text-emerald-950 rounded-lg flex flex-col justify-between h-full space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-1">
              <div className="font-condensed-bold text-xs font-bold uppercase">{data.companyTitle || 'ENDÜSTRİYEL ÜRETİM A.Ş.'}</div>
              <span className="text-[8px] font-mono bg-emerald-800 text-white px-1.5 py-0.5 rounded font-bold">QC DEPT</span>
            </div>

            <div className="flex items-center space-x-3 py-1">
              <div className="bg-emerald-200 text-emerald-900 p-2 rounded-full border border-emerald-600 flex-shrink-0">
                <IconQcPassedStamp size={32 * ratio} />
              </div>
              <div className="space-y-0.5">
                <h2 className="font-condensed-bold text-base font-black uppercase text-emerald-900 leading-none">
                  {data.qcStatus || 'QC PASSED • TEST EDİLDİ'}
                </h2>
                <div className="text-[10px] font-mono font-bold text-stone-800">{data.inspectorId || 'KONTROLÖR: QC-42'}</div>
                <div className="text-[9px] font-mono text-stone-600">{data.testDateBatch || '27.08.2026 • SERİ #8849-B'}</div>
              </div>
            </div>

            <div className="flex justify-center border-t border-emerald-300 pt-1">
              <BarcodeRenderer value={data.qcBarcode || 'QC-PASS-8849'} height={18 * ratio} width={1.1 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // ==========================================================
      // 76 - 100 YENİ ŞABLONLAR RENDER MOTORU
      // ==========================================================

      // 76. PARENTAL ADVISORY EXPLICIT CONTENT
      case 'tpl-parental-advisory-music':
        return (
          <div className="p-3 bg-black text-white font-sans flex flex-col justify-between h-full border-4 border-black">
            <div className="bg-black text-white text-center py-1">
              <span className="font-black text-lg md:text-2xl tracking-[0.25em] block leading-none">
                {data.topWord || 'PARENTAL'}
              </span>
            </div>
            <div className="bg-white text-black text-center py-2 px-1 my-1">
              <span className="font-impact text-3xl md:text-5xl font-black tracking-tight block uppercase leading-none">
                {data.centerWord || 'ADVISORY'}
              </span>
            </div>
            <div className="bg-black text-white text-center py-1">
              <span className="font-condensed-bold text-xs md:text-sm tracking-[0.2em] block font-bold">
                {data.bottomWord || 'EXPLICIT CONTENT'}
              </span>
            </div>
            {data.albumArtistTag && (
              <div className="border-t border-white/30 pt-1 mt-1 text-[9px] text-center text-white/70 uppercase tracking-wider">
                {data.albumArtistTag}
              </div>
            )}
          </div>
        );

      // 77. NUTRITION FACTS (FDA STANDART BESİN DEĞERLERİ TABLOSU)
      case 'tpl-fda-nutrition-facts-label':
        return (
          <div className="p-3 bg-white text-black font-sans border-2 border-black space-y-1">
            <h1 className="font-impact text-3xl font-black leading-tight border-b-8 border-black pb-0.5">
              {data.title || 'Nutrition Facts'}
            </h1>
            <div className="text-xs font-bold border-b-4 border-black pb-1">
              {data.servingSize || 'Serving size 1 potato (148g/5.2oz)'}
            </div>
            <div className="flex justify-between items-baseline border-b-8 border-black py-1">
              <div>
                <div className="text-[10px] font-bold">Amount per serving</div>
                <div className="text-xl font-black">Calories</div>
              </div>
              <div className="text-4xl font-impact font-black">
                {data.calories || '110'}
              </div>
            </div>
            <div className="text-right text-[10px] font-bold border-b border-black py-0.5">
              {data.dailyValueNote || '% Daily Value*'}
            </div>
            <div className="text-xs space-y-0.5 border-b-4 border-black pb-1">
              <div className="flex justify-between border-b border-stone-300 py-0.5">
                <span><strong>Total Fat</strong> {data.totalFat?.split('(')[0] || '0g'}</span>
                <strong>{data.totalFat?.includes('(') ? data.totalFat.split('(')[1].replace(')', '') : '0%'}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-300 py-0.5">
                <span><strong>Sodium</strong> {data.sodium?.split('(')[0] || '0mg'}</span>
                <strong>{data.sodium?.includes('(') ? data.sodium.split('(')[1].replace(')', '') : '0%'}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-300 py-0.5">
                <span><strong>Total Carbohydrate</strong> {data.totalCarb?.split('(')[0] || '26g'}</span>
                <strong>{data.totalCarb?.includes('(') ? data.totalCarb.split('(')[1].replace(')', '') : '9%'}</strong>
              </div>
              <div className="flex justify-between pl-3 border-b border-stone-300 py-0.5 text-[11px]">
                <span>Dietary Fiber {data.dietaryFiber?.split('(')[0] || '2g'}</span>
                <span>{data.dietaryFiber?.includes('(') ? data.dietaryFiber.split('(')[1].replace(')', '') : '7%'}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold">
                <span>Protein {data.protein || '3g'}</span>
                <span></span>
              </div>
            </div>
            <div className="text-[10px] space-y-0.5 border-b-2 border-black pb-1">
              <div className="flex justify-between">
                <span>Potassium {data.potassium || '620mg (15%)'}</span>
                <span>Vitamin C {data.vitaminC || '27mg (30%)'}</span>
              </div>
            </div>
            <div className="text-[8px] leading-tight text-stone-600 pt-0.5">
              * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet.
            </div>
          </div>
        );

      // 78. WARNING: SCROLLING KILLS
      case 'tpl-warning-scrolling-kills':
        return (
          <div className="p-3 bg-black text-white font-sans flex flex-col justify-between h-full border-2 border-white rounded-lg space-y-2">
            <div className="flex items-center justify-between border-b border-white/40 pb-1">
              <div className="flex items-center space-x-1 text-amber-400">
                <IconCautionTriangle size={16 * ratio} />
                <span className="font-impact tracking-widest text-xs font-bold text-white">
                  {data.headerNotice || 'WARNING'}
                </span>
              </div>
              <IconCautionTriangle size={16 * ratio} className="text-amber-400" />
            </div>

            <div className="text-center py-2">
              <div className="font-impact text-4xl md:text-5xl font-black leading-none tracking-tight">
                {data.mainHeadlineWord1 || 'SCROLLING'}
              </div>
              <div className="font-impact text-4xl md:text-5xl font-black leading-none tracking-tight text-stone-200">
                {data.mainHeadlineWord2 || 'KILLS'}
              </div>
            </div>

            <div className="border-t border-b border-white/50 py-2 flex items-center space-x-2">
              <div className="p-1 border border-white/60 rounded">
                <IconEyeOffCrossed size={28 * ratio} className="text-white" />
              </div>
              <div className="text-[11px] font-condensed-bold leading-tight uppercase font-bold tracking-wide">
                {data.screenQuote || "DON'T LET THE SCREEN STEAL YOUR LIFE."}
              </div>
            </div>

            {/* Warning Hazard Diagonal Stripes */}
            <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#fff,#fff_8px,#000_8px,#000_16px)] border border-white/40 my-1" />

            <div className="flex items-center justify-between pt-1">
              <div className="flex-1">
                <BarcodeRenderer value={data.detoxBarcode || 'DETOX-2026-LIFE'} height={20 * ratio} width={1 * ratio} fontSize={8} />
                <div className="text-[8px] tracking-wider text-stone-300 font-mono mt-0.5">
                  {data.lifeQuote || 'YOUR LIFE. YOUR TIME. YOUR CHOICE.'}
                </div>
              </div>
              <div className="border-l border-white/40 pl-2 text-right">
                <span className="text-[9px] font-black uppercase text-amber-300 block">
                  {data.taglineRight || 'REAL LIFE > ONLINE'}
                </span>
              </div>
            </div>
          </div>
        );

      // 79. MOTIVATION: YOU'RE NOT RICH YET
      case 'tpl-motivation-not-rich-yet':
        return (
          <div className="p-3 bg-white text-black font-sans border-2 border-black flex flex-col justify-between h-full space-y-2">
            {/* 4 Pillars Header */}
            <div className="grid grid-cols-4 gap-1 border-b-2 border-black pb-2 text-center">
              <div className="border border-black p-1 rounded">
                <div className="text-[9px] font-black">{data.pill1 || 'WORK HARD'}</div>
              </div>
              <div className="border border-black p-1 rounded">
                <div className="text-[9px] font-black">{data.pill2 || 'SAVE TIME'}</div>
              </div>
              <div className="border border-black p-1 rounded">
                <div className="text-[9px] font-black">{data.pill3 || 'THINK SMART'}</div>
              </div>
              <div className="border border-black p-1 rounded">
                <div className="text-[9px] font-black">{data.pill4 || "DON'T QUIT"}</div>
              </div>
            </div>

            {/* Giant Monolithic Type */}
            <div className="text-center py-2">
              <h1 className="font-impact text-3xl md:text-5xl font-black leading-none tracking-tight">
                {data.heroMessage || "YOU'RE NOT RICH YET"}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t-2 border-black pt-2 text-xs">
              <div className="flex items-center space-x-1.5 border border-black p-1.5 rounded">
                <IconBrokenHeartFragile size={22 * ratio} className="text-black shrink-0" />
                <div>
                  <div className="font-black text-[9px]">CAUTION</div>
                  <div className="text-[8px] leading-tight">{data.cautionNotice || 'LONG HOURS MAY CAUSE BIG RESULTS'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 border border-black p-1.5 rounded">
                <IconRecycleTriangleLogo size={22 * ratio} className="text-black shrink-0" />
                <div>
                  <div className="font-black text-[9px]">100% ORGANIC</div>
                  <div className="text-[8px] leading-tight">{data.successWarning || 'MAY CONTAIN REAL SUCCESS'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-black pt-1">
              <BarcodeRenderer value={data.serialBarcode || 'HUSTLE-9999-$$$$'} height={18 * ratio} width={1.1 * ratio} fontSize={8} />
              <div className="text-[9px] font-black tracking-widest uppercase">DISCIPLINE OVER MOTIVATION</div>
            </div>
          </div>
        );

      // 80. OVERTHINKERS CLUB MEMBERSHIP CARD
      case 'tpl-overthinkers-club-id-card':
        return (
          <div className="p-3 bg-amber-50 text-stone-900 border-2 border-dashed border-stone-800 rounded-xl font-mono-receipt flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-start border-b border-stone-800 pb-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-stone-900 text-white rounded">
                  <IconSkullCrossbones size={24 * ratio} />
                </div>
                <div>
                  <h2 className="font-condensed-bold text-sm font-black uppercase tracking-wider">{data.clubTitle || 'OVERTHINKERS CLUB'}</h2>
                  <span className="text-[9px] text-stone-600 block">{data.badgeSubtitle || 'OFFICIAL MEMBERSHIP CARD'}</span>
                </div>
              </div>
              <div className="text-[9px] font-bold bg-stone-200 px-1.5 py-0.5 rounded border border-stone-400">
                {data.memberIdNumber || 'ID NO: #99481-OT'}
              </div>
            </div>

            <div className="space-y-1 text-xs bg-white/70 p-2 rounded border border-stone-300">
              <div className="flex justify-between"><span className="font-bold text-stone-500">NAME:</span> <span className="font-bold">{data.memberName || 'Mert Aksoy'}</span></div>
              <div className="flex justify-between"><span className="font-bold text-stone-500">PHONE:</span> <span>{data.memberPhone || '+90 (555) OVER-THINK'}</span></div>
              <div className="flex justify-between"><span className="font-bold text-stone-500">EMAIL:</span> <span>{data.memberEmail || 'overthinking@mind.com'}</span></div>
              <div className="border-t border-stone-300 pt-1 mt-1 text-[10px]">
                <span className="font-bold text-stone-500 block">SPECIAL SKILL:</span>
                <span className="italic">{data.specialSkill || "Overthinking about how I'm overthinking."}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-stone-500 pt-0.5">
              <span>VALID THROUGH: FOREVER</span>
              <span className="font-bold">SIGNATURE: ✍️ OVERTHINKER</span>
            </div>
          </div>
        );

      // 81. DON'T TOUCH MY TOOLS
      case 'tpl-warning-dont-touch-my-tools':
        return (
          <div className="p-3 bg-white text-black border-4 border-black font-sans flex flex-col justify-between h-full space-y-2">
            <div className="bg-red-600 text-white text-center py-1 font-impact text-xl tracking-widest font-black uppercase rounded-t">
              {data.warningHeader || 'WARNING'}
            </div>

            <div className="text-center py-1">
              <div className="font-condensed-bold text-sm font-black uppercase tracking-wider">
                {data.subHeader || "DON'T TOUCH MY"}
              </div>
              <div className="font-impact text-4xl font-black text-red-600 tracking-tight">
                {data.bigWord || 'TOOLS'}
              </div>
            </div>

            <div className="flex justify-center py-1">
              <div className="p-2 border-2 border-black rounded-full bg-stone-100">
                <IconToolWrenchScrewdriver size={36 * ratio} className="text-black" />
              </div>
            </div>

            <div className="border-t-2 border-black pt-1 text-center">
              <div className="font-black text-xs uppercase">{data.ownerName || 'MÜLKİYET: BAŞUSTA AHMET'}</div>
              <div className="text-[9px] text-stone-600 font-bold">{data.punishmentNotice || 'İzinsiz alanın aletleri elinden alınır!'}</div>
            </div>
          </div>
        );

      // 82. SLOW DOWN - WE GET PAID BY THE HOUR
      case 'tpl-slow-down-paid-by-hour':
        return (
          <div className="p-3 bg-amber-300 text-black border-4 border-black rounded-xl font-sans flex flex-col justify-between h-full text-center space-y-1">
            <div className="border-b-4 border-black pb-1">
              <div className="font-impact text-4xl md:text-5xl font-black tracking-tight leading-none">
                {data.topLine || 'SLOW'}
              </div>
              <div className="font-impact text-4xl md:text-5xl font-black tracking-tight leading-none">
                {data.bottomLine || 'DOWN'}
              </div>
            </div>

            <div className="bg-black text-amber-300 p-2 my-1 rounded font-impact text-base md:text-lg uppercase leading-tight font-black">
              {data.punchline || 'WE GET PAID BY THE HOUR'}
            </div>

            <div className="text-[9px] font-mono font-bold tracking-widest text-black/80 uppercase">
              {data.crewNotice || 'RELAXED WORK CREW • 2026'}
            </div>
          </div>
        );

      // 83. AREA 51 WARNING / RESTRICTED ALIEN AREA
      case 'tpl-area-51-alien-restricted':
        return (
          <div className="p-3 bg-stone-100 text-black border-4 border-red-700 font-sans flex flex-col justify-between h-full space-y-1.5">
            <div className="bg-red-700 text-white text-center py-1 font-impact text-lg tracking-widest uppercase">
              {data.warningBadge || 'WARNING'}
            </div>

            <div className="flex items-center justify-center space-x-2 py-1">
              <IconUfoAlienSaucer size={32 * ratio} className="text-stone-800" />
              <div className="font-impact text-3xl font-black tracking-tighter">
                {data.baseName || 'AREA 51'}
              </div>
            </div>

            <div className="bg-black text-white text-center py-1 px-2 font-condensed-bold text-xs uppercase font-bold tracking-wider">
              {data.entryNotice || 'NO TRESPASSING • RESTRICTED AREA'}
            </div>

            <div className="text-[9px] text-center font-bold text-red-700 uppercase tracking-tight border-t border-stone-400 pt-1">
              {data.securityLevel || 'USE OF DEADLY FORCE AUTHORIZED'}
            </div>
          </div>
        );

      // 84. DANGER SHARK ZONE
      case 'tpl-danger-shark-zone-vintage':
        return (
          <div className="p-3 bg-slate-900 text-white border-4 border-slate-700 font-sans flex flex-col justify-between h-full text-center space-y-1">
            <div className="bg-red-600 text-white font-impact text-xl tracking-widest py-1 uppercase rounded-t">
              {data.dangerHeader || 'DANGER'}
            </div>

            <div className="py-1">
              <div className="font-impact text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
                {data.hazardSubject || 'SHARK'}
              </div>
              <div className="font-impact text-2xl font-black tracking-widest text-slate-300">
                {data.zoneText || 'ZONE'}
              </div>
            </div>

            <div className="flex justify-center py-1">
              <IconSharkFinDanger size={36 * ratio} className="text-cyan-400" />
            </div>

            <div className="text-[9px] font-bold text-slate-300 border-t border-slate-700 pt-1 uppercase">
              {data.swimWarning || 'SWIM AT YOUR OWN RISK • DEEP WATER'}
            </div>
          </div>
        );

      // 85. PERİYODİK ELEMENT: CO-13 COFFEE
      case 'tpl-periodic-coffee-co13':
        return (
          <div className="p-3 bg-stone-900 text-amber-100 border-4 border-amber-600 rounded-lg font-sans flex flex-col justify-between h-full">
            <div className="flex justify-between items-start text-xs font-mono font-bold text-amber-400">
              <span>{data.atomicNumber || '13'}</span>
              <span>☕ BEAN</span>
            </div>
            <div className="text-center my-1">
              <div className="font-serif text-5xl font-black leading-none text-amber-400">
                {data.symbol || 'Co'}
              </div>
              <div className="font-bold text-sm tracking-wider uppercase text-white mt-1">
                {data.elementName || 'Coffee'}
              </div>
            </div>
            <div className="border-t border-amber-800 pt-1 text-[9px] font-mono text-center text-amber-200/80">
              <div>{data.atomicMass || '194.19 g/mol (Pure Caffeine)'}</div>
              <div className="font-bold text-amber-400">{data.roastOrigin || 'Dark Roast • 100% Arabica'}</div>
            </div>
          </div>
        );

      // 86. PERİYODİK ELEMENT: SC-14 SARCASM
      case 'tpl-periodic-sarcasm-sc14':
        return (
          <div className="p-3 bg-zinc-900 text-zinc-100 border-4 border-zinc-500 rounded-lg font-sans flex flex-col justify-between h-full">
            <div className="flex justify-between items-start text-xs font-mono font-bold text-zinc-400">
              <span>{data.atomicNumber || '14'}</span>
              <span>😏 WIT</span>
            </div>
            <div className="text-center my-1">
              <div className="font-mono text-5xl font-black leading-none text-zinc-200">
                {data.symbol || 'Sc'}
              </div>
              <div className="font-bold text-sm tracking-wider uppercase text-zinc-300 mt-1">
                {data.elementName || 'Sarcasm'}
              </div>
            </div>
            <div className="border-t border-zinc-700 pt-1 text-[9px] font-mono text-center text-zinc-400">
              <div>{data.toxicityLevel || '100% Natural Wit & Irony'}</div>
              <div className="italic text-[8px] text-zinc-500">{data.usageWarning || 'Handle with extreme care around sensitive souls.'}</div>
            </div>
          </div>
        );

      // 87. I AM NOT A MORNING PERSON
      case 'tpl-not-a-morning-person':
        return (
          <div className="p-3 bg-stone-200 text-stone-900 border-4 border-stone-900 rounded-2xl font-sans flex flex-col justify-between h-full text-center space-y-1">
            <div className="flex justify-center pt-1">
              <IconCoffeeBeans size={28 * ratio} className="text-stone-800" />
            </div>
            <div className="py-1">
              <div className="font-impact text-2xl font-black uppercase leading-tight tracking-wide">
                {data.headlinePart1 || 'I AM NOT A'}
              </div>
              <div className="font-impact text-4xl font-black uppercase text-stone-900 leading-none tracking-tight">
                {data.headlinePart2 || 'MORNING'}
              </div>
              <div className="font-impact text-3xl font-black uppercase text-stone-800 leading-tight">
                {data.headlinePart3 || 'PERSON'}
              </div>
            </div>
            <div className="bg-stone-900 text-white py-1 px-2 rounded-full text-[9px] font-bold tracking-wider uppercase">
              {data.coffeeStatus || 'First Coffee, Then We Talk.'}
            </div>
          </div>
        );

      // 88. LOW BATTERY 1% - NEED PROTEIN
      case 'tpl-low-battery-need-protein':
        return (
          <div className="p-3 bg-black text-white border-2 border-white rounded-xl font-sans flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-center border-b border-white/30 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconBatteryLowCharging size={20 * ratio} className="text-red-500" />
                <span className="font-mono text-xs font-black text-red-500">{data.batteryPercent || '1% BATTERY'}</span>
              </div>
              <span className="text-[9px] font-bold bg-white text-black px-1.5 py-0.5 rounded">{data.disciplineSwitch || 'DISCIPLINE: ON'}</span>
            </div>
            <div className="text-center py-2">
              <div className="font-impact text-3xl md:text-4xl font-black uppercase text-amber-400 leading-none">
                {data.mainNeed || 'NEED PROTEIN'}
              </div>
              <div className="text-xs text-stone-300 font-condensed-bold uppercase tracking-wider mt-1">
                {data.subAdvice || 'Shake Well & Hit The Gym'}
              </div>
            </div>
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden border border-white/40">
              <div className="h-full bg-red-600 w-[5%] animate-pulse" />
            </div>
          </div>
        );

      // 89. EAT SLEEP GYM REPEAT
      case 'tpl-eat-sleep-gym-repeat':
        return (
          <div className="p-3 bg-black text-white border-4 border-white font-impact flex flex-col justify-between h-full text-center space-y-0.5">
            <div className="text-3xl md:text-4xl font-black tracking-tight leading-tight border-b border-white/30 pb-0.5">
              {data.word1 || 'EAT'}
            </div>
            <div className="text-3xl md:text-4xl font-black tracking-tight leading-tight border-b border-white/30 pb-0.5 text-stone-300">
              {data.word2 || 'SLEEP'}
            </div>
            <div className="text-3xl md:text-4xl font-black tracking-tight leading-tight border-b border-white/30 pb-0.5 text-amber-400">
              {data.word3 || 'GYM'}
            </div>
            <div className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {data.word4 || 'REPEAT'}
            </div>
            <div className="font-mono text-[8px] tracking-widest text-white/70 pt-1 uppercase">
              {data.gymMotto || 'NO PAIN NO GAIN • ATHLETIC CLUB'}
            </div>
          </div>
        );

      // 90. USPS PRIORITY MAIL RETRO KARGO
      case 'tpl-usps-priority-mail-vintage':
        return (
          <div className="p-3 bg-white text-black border-2 border-black font-sans flex flex-col justify-between h-full space-y-1.5 text-xs">
            <div className="flex border-b-2 border-black pb-1">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-impact text-4xl font-black mr-2 shrink-0">
                P
              </div>
              <div className="flex-1 text-[9px] leading-tight">
                <div className="font-bold">{data.postagePaid || 'US POSTAGE AND FEES PAID'}</div>
                <div className="text-[8px] text-stone-600">Commercial Base Pricing</div>
                <div className="font-bold text-[10px] mt-0.5">{data.mailClass || 'USPS PRIORITY MAIL®'}</div>
              </div>
            </div>

            <div className="border border-black p-1 text-[10px] leading-tight space-y-1">
              <div>
                <span className="font-bold text-[8px] text-stone-500 block">FROM:</span>
                <pre className="font-sans whitespace-pre-wrap">{data.fromAddress || 'Dr. Harry Whitehouse\n247 High St. Palo Alto, CA'}</pre>
              </div>
              <div className="border-t border-stone-300 pt-1">
                <span className="font-bold text-[8px] text-stone-500 block">SHIP TO:</span>
                <pre className="font-sans whitespace-pre-wrap font-bold">{data.toAddress || 'Shipping Department\nSanford Brands, 2200 Foster Ave\nJanesville, WI 53545'}</pre>
              </div>
            </div>

            <div className="text-center pt-1 border-t-2 border-black">
              <div className="text-[8px] font-bold uppercase mb-0.5">USPS DELIVERY CONFIRMATION</div>
              <BarcodeRenderer value={data.trackingBarcode || '4205354591123412341234'} height={24 * ratio} width={1 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 91. TYPOGRAPHIC MAZE: GOOD TYPE IS ABOUT FINDING WORDS
      case 'tpl-typographic-maze-words':
        return (
          <div className="p-3 bg-white text-black border-4 border-black font-mono flex flex-col justify-between h-full space-y-2">
            <div className="border-2 border-black p-2 bg-stone-50">
              <div className="font-impact text-xl md:text-2xl font-black leading-tight text-center tracking-wider uppercase border-b-2 border-black pb-1">
                {data.mazeHeadline || 'GOOD TYPE IS ABOUT FINDING THE RIGHT WORDS'}
              </div>
              {/* Vektörel Labirent Izgara Görünümü */}
              <div className="grid grid-cols-8 gap-0.5 py-2">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className={`h-2 ${i % 3 === 0 ? 'bg-black' : (i % 2 === 0 ? 'border-t-2 border-l-2 border-black' : 'border-r-2 border-b-2 border-black')}`} />
                ))}
              </div>
            </div>
            <div className="text-[8px] text-center font-bold tracking-widest uppercase text-stone-700">
              {data.studioName || 'TYPOGRAPHY ARCHIVE • LABYRINTH EDITION'}
            </div>
          </div>
        );

      // 92. LABERINTO - BORGES DİKEY EDEBİ LABİRENT ŞİİR
      case 'tpl-laberinto-borges-poem':
        return (
          <div className="p-3 bg-stone-100 text-stone-900 border border-stone-400 font-serif flex flex-col justify-between h-full space-y-2">
            <div className="text-center border-b border-stone-400 pb-1">
              <span className="font-serif italic text-xs font-bold tracking-widest uppercase block">
                {data.headerTitle || '-LABERINTO- (FRAGMENTO)'}
              </span>
            </div>
            <div className="border-2 border-stone-800 p-2 bg-white text-center font-mono text-[11px] font-bold leading-relaxed tracking-wider">
              {data.poemLines || 'NO HABRÁ NUNCA UNA PUERTA. ESTÁS ADENTRO Y EL ALCÁZAR ABARCA EL UNIVERSO.'}
            </div>
            <div className="text-right text-xs font-serif italic border-t border-stone-400 pt-1">
              — {data.authorSignature || 'Jorge Luis Borges'}
            </div>
          </div>
        );

      // 93. GOOD / BAD! DİKEY UZATILMIŞ TİPOGRAFİ
      case 'tpl-good-bad-vertical-stretch':
        return (
          <div className="p-3 bg-black text-white border-4 border-white font-impact flex flex-col justify-between h-full text-center space-y-1">
            <div className="text-5xl md:text-6xl font-black tracking-widest scale-y-125 my-2">
              {data.topWord || 'GOOD'}
            </div>
            <div className="h-0.5 bg-white w-full my-1" />
            <div className="text-5xl md:text-6xl font-black tracking-widest scale-y-125 my-2 text-stone-400">
              {data.bottomWord || 'BAD!'}
            </div>
            <div className="text-[8px] font-mono tracking-widest text-white/70 pt-1">
              {data.conceptNote || 'DUALITY OF DESIGN • AMBIGRAM EDITION'}
            </div>
          </div>
        );

      // 94. CYBERPUNK MATRIX ŞİFRELİ PİKSEL
      case 'tpl-cyberpunk-matrix-cipher':
        return (
          <div className="p-3 bg-zinc-950 text-emerald-400 border-2 border-emerald-500 font-mono flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-1 text-[9px]">
              <span className="font-bold">{data.cardHeader || 'CIPHER GRID MATRIX'}</span>
              <span className="text-white">{data.secretCodeKey || 'KEY: #X9-CYBER-2026'}</span>
            </div>
            {/* Matrix Pixel Izgara */}
            <div className="grid grid-cols-12 gap-0.5 bg-black p-1.5 border border-emerald-900 rounded">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className={`h-1.5 ${i % 4 === 0 || i % 7 === 0 ? 'bg-emerald-400' : 'bg-emerald-950'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[8px] text-emerald-300/80 leading-tight max-w-[65%]">
                {data.instructionText || 'Slide decoder overlay over the grid to reveal message.'}
              </div>
              <QRCodeRenderer value={data.terminalQr || 'https://cipher.decode.net/matrix/x9'} size={32 * ratio} />
            </div>
          </div>
        );

      // 95. MADE IN JAPAN AKILLI BARKOD
      case 'tpl-made-in-japan-barcode-art':
        return (
          <div className="p-3 bg-white text-black border-2 border-black font-sans flex flex-col justify-between h-full space-y-1.5">
            <div className="flex justify-between items-center border-b-2 border-black pb-1">
              <span className="font-bold text-2xl font-serif">{data.kanjiTitle || '日本製'}</span>
              <span className="font-impact text-sm font-bold tracking-wider">{data.englishTitle || 'MADE IN JAPAN'}</span>
            </div>
            <div className="flex items-center justify-center py-2">
              <BarcodeRenderer value={data.verticalCode || '4901234567890'} height={28 * ratio} width={1.2 * ratio} fontSize={9} />
            </div>
            <div className="text-center font-mono text-[9px] font-bold border-t border-black pt-1 uppercase">
              {data.brandOrigin || 'TOKYO STREETWEAR LAB'}
            </div>
          </div>
        );

      // 96. FRAGILE BROKEN HEART
      case 'tpl-fragile-broken-heart-cargo':
        return (
          <div className="p-3 bg-red-50 text-red-950 border-4 border-red-600 rounded-lg font-sans flex flex-col justify-between h-full space-y-1.5">
            <div className="flex justify-between items-center border-b-2 border-red-600 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconBrokenHeartFragile size={24 * ratio} className="text-red-600" />
                <span className="font-impact text-2xl font-black text-red-600 uppercase">{data.headerWarning || 'FRAGILE'}</span>
              </div>
              <span className="font-impact text-2xl font-black bg-red-600 text-white px-2 py-0.5 rounded">{data.badgeNumber || '21'}</span>
            </div>
            <div className="text-center py-1">
              <div className="text-[10px] font-bold text-red-800 uppercase tracking-wide">
                {data.subInstruction || 'HANDLE WITH CARE • DON’T FALL NOT PRESSURE'}
              </div>
              <div className="text-xs italic text-red-700 mt-0.5">
                {data.fragileReason || 'May contain sensitive human feelings.'}
              </div>
            </div>
            <div className="flex justify-center border-t border-red-400 pt-1">
              <BarcodeRenderer value={data.cargoTracking || 'HEART-FRAGILE-21'} height={18 * ratio} width={1.1 * ratio} fontSize={8} />
            </div>
          </div>
        );

      // 97. SPEED LIMIT 69
      case 'tpl-speed-limit-69-humor':
        return (
          <div className="p-3 bg-white text-black border-4 border-black rounded-2xl font-sans flex flex-col justify-between h-full text-center space-y-1">
            <div className="border-b-2 border-black pb-1">
              <div className="font-impact text-lg font-black tracking-widest uppercase">{data.limitWord1 || 'SPEED'}</div>
              <div className="font-impact text-lg font-black tracking-widest uppercase">{data.limitWord2 || 'LIMIT'}</div>
            </div>
            <div className="font-impact text-6xl md:text-7xl font-black tracking-tight leading-none my-1">
              {data.speedNumber || '69'}
            </div>
            <div className="text-[8px] font-mono font-bold tracking-wider uppercase text-stone-600 border-t border-black pt-1">
              {data.highwayNotice || 'MINIMUM SPEED OF ENJOYMENT'}
            </div>
          </div>
        );

      // 98. ARGON GAS HAZARD WARNING
      case 'tpl-argon-gas-hazard-warning':
        return (
          <div className="p-3 bg-amber-50 text-black border-4 border-amber-500 font-sans flex flex-col justify-between h-full space-y-1.5">
            <div className="bg-amber-400 text-black font-impact text-xl font-black text-center py-1 tracking-widest uppercase flex items-center justify-center space-x-1">
              <IconCautionTriangle size={20 * ratio} />
              <span>{data.warningTitle || 'WARNING'}</span>
            </div>
            <div className="text-center py-1 border-b border-stone-400">
              <div className="font-impact text-2xl font-black tracking-wider text-red-700">{data.gasName || 'ARGON'}</div>
              <div className="text-[9px] font-bold text-stone-800 leading-tight mt-0.5">
                {data.hazardDesc || 'HIGH CONCENTRATION OF GAS CAN OCCUR IN THIS AREA AND CAN CAUSE ASPHYXIATION.'}
              </div>
            </div>
            <div className="text-[8px] leading-tight space-y-1 text-stone-700">
              <div>{data.o2CheckRule || 'VERIFY THAT OXYGEN CONCENTRATION IS ABOVE 19.5% BEFORE ENTERING.'}</div>
              <div className="font-bold text-red-700 uppercase">{data.alarmDirective || 'IF ALARM IS SOUNDING - DO NOT ENTER ROOM.'}</div>
            </div>
          </div>
        );

      // 99. COFFEE LOADING / OVERTHINKING PROGRESS
      case 'tpl-coffee-overthinking-progress':
        return (
          <div className="p-3 bg-stone-900 text-white border-2 border-stone-600 rounded-xl font-mono flex flex-col justify-between h-full space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold italic text-amber-400">{data.taskLabel || 'overthinking'}</span>
              <span className="font-black bg-stone-700 px-1.5 py-0.5 rounded text-[10px]">{data.percentage || '28%'}</span>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-full bg-stone-800 rounded-full border border-stone-600 overflow-hidden p-0.5">
                <div className="h-full bg-amber-400 rounded-full w-[28%]" />
              </div>
              <div className="text-[8px] text-stone-400 text-right">{data.estimatedTime || 'Estimated time remaining: ALL NIGHT'}</div>
            </div>
            <div className="text-[9px] text-stone-300 font-bold border-t border-stone-700 pt-1">
              {data.statusState || 'STATUS: BUFFERING IDEAS...'}
            </div>
          </div>
        );

      // 100. FAKE NEWS / NOSTALJİK GAZETE MANŞET
      case 'tpl-fake-news-vintage-newspaper':
        return (
          <div className="p-3 bg-amber-50 text-stone-900 border-2 border-stone-800 font-serif flex flex-col justify-between h-full space-y-1.5">
            <div className="flex justify-between items-center border-b-2 border-stone-800 pb-1">
              <div className="flex items-center space-x-1.5">
                <IconNewspaperArticle size={20 * ratio} className="text-stone-800" />
                <span className="font-bold text-xs uppercase tracking-widest">{data.paperName || 'THE DAILY CHRONICLE'}</span>
              </div>
              <span className="font-impact text-lg font-black border-2 border-red-600 text-red-600 px-1.5 py-0.2 rounded -rotate-6">
                {data.stampText || 'FAKE'}
              </span>
            </div>
            <div className="py-1">
              <h3 className="font-impact text-sm md:text-base font-black leading-tight uppercase text-stone-950">
                {data.headlineText || 'EXTRA! EXTRA! ALL HEADLINES ARE MADE OF DREAMS'}
              </h3>
            </div>
            <div className="text-[8px] font-mono text-stone-600 border-t border-stone-400 pt-1 flex justify-between">
              <span>{data.archiveDate || 'VOL. XCIV • OCT 1994 • EDITION #42'}</span>
              <span>VERIFIED HOAX ✓</span>
            </div>
          </div>
        );

      // Custom / Fallback Generic Template
      default:
        return (
          <div className="p-3 border-2 border-black font-clean flex flex-col justify-between h-full space-y-2">
            <div className="text-center border-b-2 border-black pb-1">
              <h1 className="font-condensed-bold text-xl font-bold uppercase">{template.title}</h1>
            </div>
            <div className="space-y-1 text-xs font-mono-receipt">
              {Object.entries(data).map(([key, val]) => {
                if (typeof val === 'string' && val.length > 0) {
                  return (
                    <div key={key} className="flex justify-between border-b border-stone-200 pb-0.5">
                      <span className="font-bold opacity-75 capitalize">{key}:</span>
                      <span>{val}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div className="flex justify-center pt-1">
              <BarcodeRenderer value={data.barcodeVal || 'CUSTOM-LABEL'} height={24 * ratio} width={1.2 * ratio} />
            </div>
          </div>
        );
    }
  };

  const innerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const el = innerRef.current;
    const updateHeight = () => {
      if (el) {
        setMeasuredHeight(el.scrollHeight || el.offsetHeight);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(() => updateHeight());
    ro.observe(el);
    return () => ro.disconnect();
  }, [template.id, data, widthMm, heightMm]);

  // Base Design Dimensions (57mm canonical thermal dot resolution)
  const baseDesignWidth = 384;
  
  // Canonical Pixel Dimensions matching physical thermal print head dot resolutions:
  // 57mm -> 384 dots (1.0x), 80mm -> 576 dots (1.5x), 100mm (10x15cm) -> 800 dots (2.083x), 150mm -> 1200 dots (3.125x)
  const canonicalWidthPx =
    widthMm === 57
      ? 384
      : widthMm === 80
      ? 576
      : widthMm >= 100
      ? 800
      : Math.max(280, Math.round(((widthMm / 57) * 384) / 8) * 8);

  const scaleMultiplier = canonicalWidthPx / baseDesignWidth;

  const baseDesignHeight = heightMm
    ? Math.round((heightMm / widthMm) * baseDesignWidth)
    : undefined;

  // Total scale factor combining paper dimension scale with UI zoom scale
  const zoom = scale || 1;
  const totalScale = scaleMultiplier * zoom;

  const containerWidthPx = Math.round(canonicalWidthPx * zoom);
  
  // Exact container height: if fixed heightMm is given, use proportional height; otherwise shrink-wrap measured natural height!
  const effectiveBaseHeight = baseDesignHeight || measuredHeight;
  const containerHeightPx = effectiveBaseHeight ? Math.round(effectiveBaseHeight * totalScale) : undefined;

  return (
    <div
      id={id}
      className={`thermal-container relative select-none shrink-0 overflow-hidden ${getPaperClasses()} ${className}`}
      style={{
        width: `${containerWidthPx}px`,
        height: containerHeightPx ? `${containerHeightPx}px` : undefined,
        minHeight: containerHeightPx ? `${containerHeightPx}px` : undefined,
        boxSizing: 'border-box',
        backgroundColor: paperStyle === 'invert' ? '#050505' : paperStyle === 'vintage' ? '#f7edd8' : '#ffffff',
        color: paperStyle === 'invert' ? '#ffffff' : '#000000',
        colorScheme: paperStyle === 'invert' ? 'dark' : 'light',
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: `${baseDesignWidth}px`,
          height: baseDesignHeight ? `${baseDesignHeight}px` : 'auto',
          minHeight: baseDesignHeight ? `${baseDesignHeight}px` : undefined,
          transform: `scale(${totalScale})`,
          transformOrigin: 'top left',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: baseDesignHeight ? 'space-between' : 'flex-start',
        }}
      >
        {renderTemplateContent()}
      </div>
    </div>
  );
};

