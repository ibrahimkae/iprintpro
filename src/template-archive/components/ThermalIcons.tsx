import React from 'react';

export const IconFragileGlass: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 3h10l-1 8a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4L7 3z" />
    <path d="M12 15v5" />
    <path d="M8 21h8" />
    <path d="M12 3l1.5 4-2.5 3 2 3" strokeWidth="1.5" />
  </svg>
);

export const IconThisSideUp: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 14h3v6h4v-6h3l-5-7-5 7z" />
  </svg>
);

export const IconTwoArrowsUp: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 28 24" fill="currentColor" className={className}>
    <path d="M4 14h2.5v7h3v-7h2.5l-4-7-4 7z" />
    <path d="M16 14h2.5v7h3v-7h2.5l-4-7-4 7z" />
  </svg>
);

export const IconUmbrella: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 13a8 8 0 0 1 16 0z" fill="currentColor" />
    <path d="M12 13v6a2 2 0 0 0 2 2" />
    <path d="M8 3v1" />
    <path d="M12 2v2" />
    <path d="M16 3v1" />
  </svg>
);

export const IconRecycleBadge: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.5 4.5 7 7h3.8L9.5 4.5zM12 2l3 5H9l3-5zm4 10.5 1.5 2.5-3.3 1.9 1.8-4.4zm2.5-1.5 1.5 5.5-4.5-2.6 3-2.9zm-13 0 3 2.9-4.5 2.6 1.5-5.5zm1.7 8.5 1.8 4.4-3.3-1.9 1.5-2.5zm10.6 0 1.5 2.5-3.3 1.9 1.8-4.4zm-5.8 4.5 3-5h-6l3 5z" />
  </svg>
);

export const IconGlobeRestricted: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0 4-10 15.3 15.3 0 0 0-4-10z" />
  </svg>
);

export const IconCEMark: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 22 }) => (
  <div className={`font-condensed-bold font-bold text-center leading-none border-2 border-current rounded-full flex items-center justify-center p-0.5 select-none ${className}`} style={{ width: size, height: size, fontSize: size * 0.55 }}>
    CE
  </div>
);

export const IconAge18: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 22 }) => (
  <div className={`font-condensed-bold font-bold text-center leading-none border-2 border-current rounded-full flex items-center justify-center select-none ${className}`} style={{ width: size, height: size, fontSize: size * 0.48 }}>
    18+
  </div>
);

export const BotanicalStamp: React.FC<{ text?: string; subtext?: string; size?: number; className?: string }> = ({
  text = 'HECHO EN',
  subtext = 'COLOMBIA',
  size = 64,
  className = ''
}) => (
  <div
    className={`rounded-full border border-black border-dashed flex flex-col items-center justify-center text-center p-1 font-mono-receipt ${className}`}
    style={{ width: size, height: size }}
  >
    <span className="text-[7px] uppercase tracking-wider font-semibold opacity-80">{text}</span>
    <svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="my-0.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v8" />
      <path d="M9 11l3-3 3 3" />
    </svg>
    <span className="text-[7px] uppercase tracking-widest font-bold">{subtext}</span>
  </div>
);

export const OrganicBadge: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <div className={`border-2 border-black rounded-lg p-1 text-center font-clean ${className}`} style={{ width: size, height: size }}>
    <div className="text-[6px] font-extrabold uppercase bg-black text-white px-0.5 rounded-xs">100%</div>
    <div className="text-[8px] font-black uppercase mt-0.5 leading-tight tracking-tight">ORGANIC</div>
    <div className="text-[5px] uppercase font-bold opacity-75">NATURAL</div>
  </div>
);

// --- TEKSTİL & ÇAMAŞIR YIKAMA TALİMATI SEMBOLLERİ (ISO 3758) ---
export const IconWashTub: React.FC<{ className?: string; size?: number; degrees?: string }> = ({ className = '', size = 20, degrees = '30°' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 8h18l-2 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 8z" />
    <path d="M3 11c2-1 4 1 6 0s4-1 6 0 4-1 6 0" />
    {degrees && <text x="12" y="18" textAnchor="middle" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold" fontFamily="monospace">{degrees}</text>}
  </svg>
);

export const IconDoNotBleach: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l9 17H3L12 3z" />
    <line x1="5" y1="5" x2="19" y2="19" strokeWidth="1.8" />
  </svg>
);

export const IconTumbleDry: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export const IconDoNotIron: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 16h18a2 2 0 0 0 2-2c0-3.5-3.5-5-7-5H9a5 5 0 0 0-5 5v2z" />
    <path d="M9 9V6h6" />
    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="1.8" />
  </svg>
);

// --- LOJİSTİK & KIRILABİLİR GÜVENLİK SEMBOLLERİ (ISO 780) ---
export const IconBrokenWineGlassBig: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 56" fill="currentColor" className={className}>
    <path d="M10 6 h28 c0 16 -7 24 -12 26 v14 h10 v4 H12 v-4 h10 v-14 c-5 -2 -12 -10 -12 -26 z M15 9 l8 7 l-6 6 l7 6 l-4 4 c4 4 10 3 14 -3 l-7 -6 l6 -6 l-8 -8 z" />
  </svg>
);

export const IconShoeTrampleWarning: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Shoe sole */}
    <path d="M5 8h12l5 3v3h-3l-3-2H9L6 14H3V9a1 1 0 0 1 2-1z" fill="currentColor" />
    {/* Package box underneath */}
    <rect x="4" y="19" width="20" height="7" stroke="currentColor" fill="none" />
    <line x1="14" y1="19" x2="14" y2="26" />
    {/* Impact rays */}
    <path d="M10 16l-2 2M14 15v3M18 16l2 2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const IconKeepDryUmbrella: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Rain drops */}
    <path d="M6 3l-1 3M11 2l-1 3M16 2l-1 3M21 3l-1 3" strokeWidth="1.5" stroke="currentColor" />
    {/* Canopy */}
    <path d="M4 15c0-5.5 4.5-9 10-9s10 3.5 10 9H4z" fill="currentColor" />
    {/* Stick & handle */}
    <path d="M14 15v8a2 2 0 0 1-4 0" stroke="currentColor" strokeWidth="1.8" />
    <line x1="14" y1="4" x2="14" y2="6" strokeWidth="1.8" />
  </svg>
);

export const IconUpwardArrowsHeavy: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" className={className}>
    <path d="M5 12h3v8h3v-8h3L9.5 5 5 12z" />
    <path d="M15 12h3v8h3v-8h3l-4.5-7-4.5 7z" />
    <rect x="5" y="23" width="18" height="2.5" />
  </svg>
);

// --- VİNTAGE GASTRONOMİ & BİLET GRAFİKLERİ ---
export const IconVintageCrossedCutlery: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" className={className}>
    <g transform="rotate(45 16 16)">
      {/* Fork */}
      <path d="M15 2h2v12h-2z M13 2h1v6h-1z M18 2h1v6h-1z M13 8h6v2h-6z M15 14h2v16h-2z" />
    </g>
    <g transform="rotate(-45 16 16)">
      {/* Spoon */}
      <path d="M13 2c0-2 6-2 6 0v7c0 3-6 3-6 0V2z M15 11h2v19h-2z" />
    </g>
  </svg>
);

export const IconVintageForkBanner: React.FC<{ className?: string; width?: number; height?: number }> = ({ className = '', width = 160, height = 24 }) => (
  <svg width={width} height={height} viewBox="0 0 200 30" fill="currentColor" className={className}>
    {/* Vintage fork silhouette pointing horizontally */}
    <path d="M5 14h20c3-5 10-6 18-3l60 2v4l-60 2c-8 3-15 2-18-3H5v-2z" opacity="0.8" />
    <path d="M103 13h40c5-3 10-5 15-5v14c-5 0-10-2-15-5h-40v-4z" />
    <path d="M158 8h36v2h-36z M158 12h38v2h-38z M158 16h38v2h-38z M158 20h36v2h-36z" />
  </svg>
);

// --- 25 YENİ TEMPLATEDE KULLANILACAK VEKTÖREL SİMGELER ---
export const IconCoffeeBeans: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3C7 3 3 7 3 12c0 5 4 9 9 9s9-4 9-9c0-5-4-9-9-9zm0 2c3.5 0 6.5 2.5 7 6-1-1-3-1.5-5-1.5-3 0-5 1.5-6 4-1.5-.5-2.5-1.5-2.8-3.5 1-3 4-5 6.8-5zm-5.5 8.5c.8-1.5 2.2-2.5 4.5-2.5 1.8 0 3.5.5 4.5 1.5-.5 2.5-3 4.5-5.5 4.5-1.5 0-2.8-.5-3.5-1.5z" />
  </svg>
);

export const IconAirplaneFlight: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

export const IconMovieClapper: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M2 7l3.5-4h13L22 7" fill="currentColor" />
    <path d="M6 3l3 4M11 3l3 4M16 3l3 4" stroke="white" strokeWidth="1.5" />
    <circle cx="12" cy="14" r="2.5" fill="currentColor" />
  </svg>
);

export const IconWheatEars: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c-.5 2-2 3.5-4 4 2 .5 3.5 2 4 4 .5-2 2-3.5 4-4-2-.5-3.5-2-4-4zm0 8c-.5 2-2 3.5-4 4 2 .5 3.5 2 4 4 .5-2 2-3.5 4-4-2-.5-3.5-2-4-4zm0 8c-.5 2-2 3.5-4 4 2 .5 3.5 2 4 4 .5-2 2-3.5 4-4-2-.5-3.5-2-4-4z" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconCandleFlame: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c-1.5 2.5-3 4.5-3 6.5 0 1.7 1.3 3 3 3s3-1.3 3-3c0-2-1.5-4-3-6.5z" />
    <rect x="6" y="12" width="12" height="10" rx="1.5" />
    <line x1="12" y1="11.5" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconWrenchGear: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" />
  </svg>
);

export const IconLuggageBag: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="5" y="7" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    <line x1="9" y1="11" x2="9" y2="17" />
    <line x1="15" y1="11" x2="15" y2="17" />
    <circle cx="7.5" cy="21.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="21.5" r="1.5" fill="currentColor" />
  </svg>
);

export const IconBookDue: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.15" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="14" y2="10" />
  </svg>
);

export const IconBeerHops: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5 6h11v11a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V6z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 8h2.5a2.5 2.5 0 0 1 0 5H16" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 6c0-1.5 1.5-2 3-2s2.5 1 4 0 2.5-1 4 0 3 .5 3 2H4z" />
  </svg>
);

export const IconBotanicalLeafCare: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.5 2 2 6.5 2 12c0 4.5 3 8 7.5 9.5-.5-2.5 0-5 1.5-7.5 1.5-2.5 4-4 7-5 1-3-1.5-6-6-7z" />
    <path d="M12 2c5.5 0 10 4.5 10 10 0 4.5-3 8-7.5 9.5.5-2.5 0-5-1.5-7.5-1.5-2.5-4-4-7-5-1-3 1.5-6 6-7z" opacity="0.6" />
    <path d="M12 22v-9" stroke="white" strokeWidth="1.5" />
  </svg>
);

export const IconVipStarBadge: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconDiamondRing: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" fillOpacity="0.2" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="10" y1="3" x2="8" y2="9" />
    <line x1="14" y1="3" x2="16" y2="9" />
    <line x1="12" y1="21" x2="8" y2="9" />
    <line x1="12" y1="21" x2="16" y2="9" />
  </svg>
);

export const IconCarValet: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
);

export const IconPizzaSeal: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l10 17c-2 2-6 3-10 3s-8-1-10-3l10-17z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="11" r="1.5" fill="currentColor" />
    <circle cx="9" cy="16" r="1.2" fill="currentColor" />
    <circle cx="15" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

export const IconHotelKeyRetro: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="7" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="11" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="12" x2="16" y2="15" stroke="currentColor" strokeWidth="2" />
    <line x1="19" y1="12" x2="19" y2="16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconMedicalTube: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 3h12v2H6z M7 5h10v12a5 5 0 0 1-10 0V5z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 9h4v2h-4z M10 13h4v2h-4z" />
  </svg>
);

export const IconNaturalSoapBar: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor" fillOpacity="0.15" />
    <path d="M7 10c2-1 4 1 6 0" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="19" cy="5" r="1" fill="currentColor" />
  </svg>
);

export const IconRoseBouquet: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="7" r="4" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 5c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" />
    <path d="M12 11v10 M12 15l-3-2 M12 17l3-2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const IconWifiTable: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    <path d="M5 12.55a11 11 0 0 1 14.08 0l-1.42 1.43a9 9 0 0 0-11.24 0L5 12.55z" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0l-1.42 1.42a14 14 0 0 0-18.32 0L1.42 9z" />
  </svg>
);

export const IconOliveBranchWreath: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 12c-2-3-1-7 2-8-1 3 0 6 2 8-2 0-3.5-.5-4 0z M18 12c2-3 1-7-2-8 1 3 0 6-2 8 2 0 3.5-.5 4 0z" />
    <path d="M12 21c-4.5 0-8-3.5-8-8 0-2 1-4 2-5 M12 21c4.5 0 8-3.5 8-8 0-2-1-4-2-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <ellipse cx="12" cy="14" rx="2.5" ry="3.5" fill="currentColor" />
  </svg>
);

export const IconFitnessDumbbell: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 5h2v14H6z M2 7h2v10H2z M16 5h2v14h-2z M20 7h2v10h-2z M8 11h8v2H8z" />
  </svg>
);

export const IconSneakerShoe: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 17h20v2H2z" />
    <path d="M3 16l3-8 5-1 4 4 6 1v4H3z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" />
    <line x1="8" y1="10" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5" />
    <line x1="10" y1="9" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconTeaCupLeaf: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="currentColor" fillOpacity="0.15" />
    <line x1="6" y1="2" x2="6" y2="5" />
    <line x1="10" y1="2" x2="10" y2="5" />
    <line x1="14" y1="2" x2="14" y2="5" />
  </svg>
);

export const IconForkliftPallet: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 18h18v3H3z M5 15h14v2H5z M7 10h10v4H7z" fillOpacity="0.2" />
    <rect x="2" y="18" width="20" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M6 7h12v10H6z" stroke="currentColor" strokeWidth="1.8" fill="none" />
    <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// --- 51-75 ŞABLONLARI İÇİN ÖZEL VEKTÖR İKONLAR & PİKTOGRAMLAR ---

export const IconFireFlame: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C9.5 6 7 8.5 7 13a5 5 0 0 0 10 0c0-2-1-4-2-5.5.5 2-1 3.5-2.5 3.5-1.5 0-2.5-1.2-2.5-2.8 0-2.2 2-4.2 2-6.2z" />
  </svg>
);

export const IconFireExtinguisher: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11 2h2v2h-2z M10 4h4l1 2H9l1-2z M9 8h6v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8z" />
    <path d="M7 6h2v3H7z M15 5h3v2h-3z M18 7v4h-2V7h2z" fillOpacity="0.8" />
    <circle cx="12" cy="14" r="1.5" fill="white" />
  </svg>
);

export const IconEmergencyExitDoor: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Open door frame */}
    <rect x="2" y="3" width="3" height="18" />
    <rect x="2" y="3" width="10" height="2" />
    <rect x="2" y="19" width="10" height="2" />
    <path d="M5 5l7-2v18l-7-2V5z" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
    {/* Running person silhouette */}
    <circle cx="16" cy="7" r="1.8" />
    <path d="M14 9h4l2 4-2 1-1.5-3-2.5 1 2 5-2 1-2.5-6.5L12 12l-1.5-1 3.5-2z" />
  </svg>
);

export const IconSlippingFallingPerson: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="18" cy="6" r="2" />
    <path d="M14 8l-3 4-4-1v2l3.5 1-2 5 2 1 2.5-5 3.5 3 2-2-3-3.5 1.5-2.5z" />
    {/* Slip hazard rays/ground */}
    <path d="M2 20h20v2H2z" />
    <path d="M5 16l3 2M11 16l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconCautionTriangle: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

export const IconHighVoltage: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11 2L4 13h6l-2 9 9-11h-6l2-9z" />
  </svg>
);

export const IconBiohazard: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2a5 5 0 0 0-4.5 3 7 7 0 0 1 9 0A5 5 0 0 0 12 2z" />
    <path d="M4 17.5a5 5 0 0 0 5 1.5 7 7 0 0 1-4.5-7.8A5 5 0 0 0 4 17.5z" />
    <path d="M20 17.5a5 5 0 0 1-5 1.5 7 7 0 0 0 4.5-7.8A5 5 0 0 1 20 17.5z" />
  </svg>
);

export const IconAudioCassetteTape: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" fillOpacity="0.05" />
    <rect x="5" y="7" width="14" height="7" rx="1" />
    <circle cx="8" cy="10.5" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10.5" r="1.5" fill="currentColor" />
    <path d="M6 17l2-3h8l2 3" />
  </svg>
);

export const IconVinylTurntable: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const IconVeterinaryPaw: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <ellipse cx="6" cy="8" rx="2" ry="3" />
    <ellipse cx="11" cy="5" rx="2" ry="3" />
    <ellipse cx="16" cy="6" rx="2" ry="3" />
    <ellipse cx="20" cy="10" rx="2" ry="2.5" />
    <path d="M12 11c-4 0-7 2.5-7 6.5 0 2.5 3 4.5 7 4.5s7-2 7-4.5c0-4-3-6.5-7-6.5z" />
  </svg>
);

export const IconSushiSet: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <ellipse cx="8" cy="12" rx="6" ry="4" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="12" r="2" fill="currentColor" />
    <ellipse cx="17" cy="9" rx="5" ry="3" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 15h8v4h-8z" rx="1" />
  </svg>
);

export const IconSpaLotusFlower: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3c-2 4-2 7 0 10 2-3 2-6 0-10z" />
    <path d="M7 8c-1 3 0 6 3 7-1-3-1-5-3-7z M17 8c1 3 0 6-3 7 1-3 1-5 3-7z" opacity="0.8" />
    <path d="M3 13c0 3 3 5 7 5-2-2-3-4-7-5z M21 13c0 3-3 5-7 5 2-2 3-4 7-5z" opacity="0.6" />
    <path d="M2 19h20v2H2z" />
  </svg>
);

export const IconBookmarkRibbon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 2H5a2 2 0 0 0-2 2v18l9-5 9 5V4a2 2 0 0 0-2-2z" />
  </svg>
);

export const IconGlassesOptic: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="6" cy="14" r="4" />
    <circle cx="18" cy="14" r="4" />
    <path d="M10 13a3 3 0 0 1 4 0" />
    <path d="M2 12l2-6h2 M22 12l-2-6h-2" />
  </svg>
);

export const IconDentalTooth: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.5 3C16 3 14 4.5 12 5.5 10 4.5 8 3 5.5 3 3 3 2 5 2 7.5c0 4 2 8 4 13.5 1 2.5 3 2.5 4 .5l2-6 2 6c1 2 3 2 4-.5 2-5.5 4-9.5 4-13.5 0-2.5-1-4.5-3.5-4.5z" />
  </svg>
);

export const IconDropperBottle: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 2h4v2h-4z M11 4h2v2h-2z" />
    <rect x="7" y="6" width="10" height="15" rx="2" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="10" width="6" height="7" fill="currentColor" />
  </svg>
);

export const IconEngineOilGauge: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 4l-4 4h-2V6H7v4H4l-2 2v6h12v-6h2l4-4V4h-2z M8 16H5v-2h3v2zm9-3c-1.1 0-2-.9-2-2s2-4 2-4 2 2.9 2 4-.9 2-2 2z" />
  </svg>
);

export const IconChocolateBar: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export const IconSyrupBottleCocktail: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="10" y="2" width="4" height="3" />
    <path d="M9 5h6l1 4H8l1-4z" />
    <rect x="6" y="9" width="12" height="13" rx="2" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="15" r="2.5" />
  </svg>
);

export const IconNutHazelnut: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8 2 5 5 5 9c0 5 4 10 7 13 3-3 7-8 7-13 0-4-3-7-7-7z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 8c3 2 9 2 12 0-1-3-4-5-6-5s-5 2-6 5z" />
  </svg>
);

export const IconSpiceJarHerbs: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="8" y="2" width="8" height="3" rx="1" />
    <rect x="6" y="5" width="12" height="16" rx="2" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 9c-1 2-2 3-2 5 0 1.5 1 2.5 2 2.5s2-1 2-2.5c0-2-1-3-2-5z" />
  </svg>
);

export const IconBabyFootprint: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <ellipse cx="12" cy="15" rx="4" ry="6" />
    <circle cx="8" cy="6" r="1.5" />
    <circle cx="11" cy="5" r="1.3" />
    <circle cx="14" cy="5.5" r="1.2" />
    <circle cx="16.5" cy="7" r="1" />
  </svg>
);

export const IconWeddingRingsInterlocked: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="9" cy="13" r="6" />
    <circle cx="15" cy="11" r="6" />
    <polygon points="15,4 17,2 19,4 17,6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDoNotStack: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="4" y="15" width="16" height="6" stroke="currentColor" strokeWidth="1.5" fillOpacity="0.2" />
    <rect x="4" y="6" width="16" height="6" stroke="currentColor" strokeWidth="1.5" fillOpacity="0.2" />
    <line x1="3" y1="3" x2="21" y2="21" stroke="red" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const IconQcPassedStamp: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="10" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="8" strokeWidth="1.2" />
    <path d="M8 12l3 3 5-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSkullCrossbones: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8.7 2 6 4.7 6 8c0 2 1 3.8 2.5 4.9V15h7v-2.1C17 11.8 18 10 18 8c0-3.3-2.7-6-6-6zm-2.5 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    <path d="M9.5 16h5v2h-5z" />
    <circle cx="4" cy="20" r="1.5" />
    <circle cx="20" cy="20" r="1.5" />
    <circle cx="4" cy="4" r="1.5" />
    <circle cx="20" cy="4" r="1.5" />
    <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconEyeOffCrossed: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconBatteryLowCharging: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <rect x="4" y="9" width="3" height="6" fill="currentColor" />
  </svg>
);

export const IconToolWrenchScrewdriver: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
  </svg>
);

export const IconSharkFinDanger: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 18c3-1 6-1 9 0 3 1 6 1 9 0v2c-3 1-6 1-9 0s-6-1-9 0v-2z" />
    <path d="M7 16c2-4 5-11 11-12-2 5 0 9-3 12H7z" />
  </svg>
);

export const IconUfoAlienSaucer: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <path d="M7 12c0-3 2.2-5 5-5s5 2 5 5" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="12" r="1" fill="white" />
    <circle cx="12" cy="12" r="1" fill="white" />
    <circle cx="16" cy="12" r="1" fill="white" />
    <path d="M9 16l-3 5M15 16l3 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconBrokenHeartFragile: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fillOpacity="0.2" />
    <path d="M12 4l-2 5 4 3-3 4 3 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5C3 5.9 5 4 7.5 4c1.5 0 2.9.7 3.8 1.9L9 11l4 2-3 4 2 3c-4.4-4-7-6.8-7-11.5z" />
  </svg>
);

export const IconRecycleTriangleLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 4h10l-2 3H9l-2-3zm12.5 5.5l-5 8.7-2.6-1.5 3.5-6.1 4.1-1.1zm-15 0l4.1 1.1 3.5 6.1-2.6 1.5-5-8.7z" />
  </svg>
);

export const IconNewspaperArticle: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
  </svg>
);

// --- 101 - 150 ŞABLONLARI İÇİN ÖZEL VEKTÖREL İKONLAR ---
export const IconTeamLiftTwoPersons: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="6" r="2" />
    <path d="M3 10h4v6H5v5H3v-5H2v-4a2 2 0 0 1 2-2z" />
    <path d="M17 10h4a2 2 0 0 1 2 2v4h-1v5h-2v-5h-2v-6h-1z" />
    <rect x="8" y="11" width="8" height="8" rx="1" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 14h4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconThermometerColdChain: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    <circle cx="11.5" cy="17.5" r="2" fill="currentColor" />
    <path d="M18 4l2 2m-2 0l2-2M19 2v6M17 10h4" strokeWidth="1.5" />
  </svg>
);

export const IconBreadWheat: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 12c0-4 4-8 9-8s9 4 9 8c0 4-3 7-9 7s-9-3-9-7z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 10c1.5-2 3-3 5-3s3.5 1 5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 14c1-1 2-1.5 4-1.5s3 .5 4 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconCheeseWedge: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M4 11l15-7v14L4 18V11z" fill="currentColor" fillOpacity="0.1" />
    <circle cx="9" cy="13" r="1.5" fill="currentColor" />
    <circle cx="14" cy="11" r="1" fill="currentColor" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
    <path d="M4 11l15-7M4 18l15 0" />
  </svg>
);

export const IconCoffeeDripperV60: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16l-4 9H8L4 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 19h12" />
    <path d="M7 22h10" />
    <path d="M12 13v6" />
    <path d="M18 6h3a2 2 0 0 1 0 4h-2" />
  </svg>
);

export const IconWineBottleVintage: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 2h4v3h-4z" />
    <path d="M11 5h2l2 4v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V9l2-4z" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9.5" y="12" width="5" height="5" rx="0.5" fill="white" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const IconHoneyCombBees: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M8 3l4-2 4 2v4l-4 2-4-2V3z" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 10l4-2 4 2v4l-4 2-4-2v-4z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 10l4-2 4 2v4l-4 2-4-2v-4z" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 17l4-2 4 2v4l-4 2-4-2v-4z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const IconMedicalSyringeVial: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2l4 4" />
    <path d="M17 7l3-3" />
    <path d="M19 9l-9 9-4-1 1-4 9-9 3 5z" />
    <path d="M7 17l-4 4" />
    <path d="M10 10l3 3" />
  </svg>
);

export const IconCarChassisDyno: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" fill="currentColor" />
    <circle cx="17" cy="17" r="2" fill="currentColor" />
  </svg>
);

export const IconTireSnowFlake: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" strokeWidth="1.2" />
  </svg>
);

export const IconHeaterRadiator: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M7 6v13M10 6v13M14 6v13M17 6v13" />
    <path d="M5 19v2M19 19v2M12 2v4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconCinemaFilmTicket: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z" fill="currentColor" fillOpacity="0.1" />
    <line x1="9" y1="4" x2="9" y2="20" strokeDasharray="2 2" />
    <circle cx="15" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

export const IconLuggageBagTag: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="5" y="8" width="14" height="13" rx="2" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="12" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" />
    <line x1="15" y1="12" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7" cy="21.5" r="1.5" />
    <circle cx="17" cy="21.5" r="1.5" />
  </svg>
);

export const IconRetroComputerUndo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="3" width="18" height="13" rx="2" />
    <path d="M8 21h8M12 16v5" strokeWidth="2" />
    <path d="M8 9l-3 2 3 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11h8a3 3 0 0 1 3 3" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPlantSproutWater: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 18h10l-1.5 4h-7L7 18z" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z" />
    <path d="M12 12c3 0 5-2 5-5-3 0-5 2-5 5z" />
  </svg>
);

export const IconHourglassSand: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M5 2h14M5 22h14" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 2v6a6 6 0 0 0 6 4 6 6 0 0 0-6 4v6" />
    <path d="M18 2v6a6 6 0 0 1-6 4 6 6 0 0 1 6 4v6" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

export const IconGiftBowRibbon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="8" width="18" height="13" rx="1" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 8v13M3 13h18" strokeWidth="1.8" />
    <path d="M7.5 8C6 8 5 6.5 5 5s1.5-2 3-1 4 4 4 4" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M16.5 8C18 8 19 6.5 19 5s-1.5-2-3-1-4 4-4 4" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// --- PAZARYERİ VE KARGO LOGOLARI / İKONLARI ---
export const IconTrendyolLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-0.5 select-none font-bold tracking-tight ${className}`} style={{ fontSize: size * 0.55 }}>
    <span className="font-extrabold text-black">trendyol</span>
    <span className="bg-orange-500 text-white px-1 py-0.2 rounded-xs text-[0.6em] font-black uppercase">.com</span>
  </div>
);

export const IconHepsiburadaLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-0.5 select-none font-black tracking-tight ${className}`} style={{ fontSize: size * 0.55 }}>
    <span className="font-black text-black">hepsiburada</span>
    <span className="text-orange-600 font-extrabold">.com</span>
  </div>
);

export const IconAmazonLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex flex-col items-center select-none font-black tracking-tight leading-none ${className}`} style={{ fontSize: size * 0.6 }}>
    <span className="font-black text-black tracking-tighter">amazon</span>
    <svg width={size * 0.9} height={size * 0.25} viewBox="0 0 50 14" fill="currentColor" className="text-orange-500 -mt-0.5">
      <path d="M2 3c12 7 30 7 42 0-1 3-3 6-6 8-11 5-26 5-36-8z" />
      <path d="M46 6l-5 4 4 1 1-5z" />
    </svg>
  </div>
);

export const IconHepsiJetLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-black italic tracking-tighter text-black select-none ${className}`} style={{ fontSize: size * 0.55 }}>
    <span className="bg-orange-600 text-white px-1.5 py-0.5 rounded-xs font-black not-italic text-[0.7em]">hepsi</span>
    <span className="text-orange-600 uppercase font-black tracking-normal">JET</span>
  </div>
);

export const IconSuratKargoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold italic tracking-tight text-blue-900 select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="text-red-600 font-black">///</span>
    <span className="font-black tracking-tighter">suratkargo</span>
  </div>
);

export const IconYurticiKargoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold tracking-tight text-amber-950 select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="bg-amber-500 text-black px-1 rounded-xs font-black">YK</span>
    <span className="font-bold">Yurtiçi Kargo</span>
  </div>
);

export const IconArasKargoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold tracking-tight text-emerald-950 select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="bg-emerald-600 text-white px-1 rounded-xs font-black">aras</span>
    <span className="font-semibold text-emerald-900">kargo</span>
  </div>
);

export const IconMngKargoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold tracking-tight text-sky-950 select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="bg-sky-600 text-white px-1 rounded-xs font-black">MNG</span>
    <span className="font-bold text-sky-900">kargo</span>
  </div>
);

export const IconPttKargoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold tracking-tight select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="bg-yellow-400 text-blue-950 px-1.5 py-0.5 rounded-xs font-black">PTT</span>
    <span className="font-black text-blue-950">KARGO</span>
  </div>
);

export const IconKolayGelsinLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`inline-flex items-center gap-1 font-bold tracking-tight select-none ${className}`} style={{ fontSize: size * 0.5 }}>
    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-xs font-black">KG</span>
    <span className="font-black text-black">kolay gelsin</span>
  </div>
);



