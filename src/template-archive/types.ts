export type LabelCategory =
  | 'all'
  | 'favorites'
  | 'pro'
  | 'product'
  | 'shipping'
  | 'ecommerce_shipping'
  | 'receipt'
  | 'inventory'
  | 'warning'
  | 'stickers'
  | 'notes'
  | 'organization'
  | 'custom';

export type ThermalPaperStyle = 'standard' | 'vintage' | 'dither' | 'invert';

export interface LabelDimension {
  id: string;
  name: string;
  widthMm: number;
  heightMm?: number; // undefined means continuous roll
  description: string;
  badge: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'barcode' | 'qrcode' | 'select' | 'checkbox' | 'date' | 'items_table';
  defaultValue: any;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export interface ThermalTemplate {
  id: string;
  title: string;
  category: LabelCategory;
  description: string;
  tags: string[];
  recommendedWidthMm: number; // e.g. 57, 80, 100, 150
  heightMm?: number; // optional, e.g. 30, 50, 100 or continuous
  fields: TemplateField[];
  defaultData: Record<string, any>;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PrinterSettings {
  selectedWidthMm: number;
  selectedHeightMm?: number;
  isContinuousRoll: boolean;
  paperStyle: ThermalPaperStyle;
  dpi: 203 | 300;
  darknessContrast: number; // 1 to 5
  copies: number;
  autoCut: boolean;
}

export interface CommunityTemplate {
  id: string;
  template: ThermalTemplate;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
    badge?: string;
    verified?: boolean;
  };
  likesCount: number;
  printCount: number;
  tags: string[];
  createdAt: number;
  caption?: string;
  paperStyle?: ThermalPaperStyle;
}

export interface BackupArchive {
  version: string;
  timestamp: string;
  templatesCount: number;
  templates: ThermalTemplate[];
  userCustomTemplates: ThermalTemplate[];
  favorites: string[];
}
