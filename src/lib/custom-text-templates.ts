import { logger } from './logger';

export interface CustomTextTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

const CUSTOM_TEXT_TEMPLATES_KEY = 'iprint_pro_custom_text_templates_v1';

export const customTextTemplatesStorage = {
  getTemplates(): CustomTextTemplate[] {
    try {
      const data = localStorage.getItem(CUSTOM_TEXT_TEMPLATES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      logger.error('Failed to read custom text templates', e);
      return [];
    }
  },

  addTemplate(name: string, content: string): CustomTextTemplate | null {
    try {
      const templates = this.getTemplates();
      const newTpl: CustomTextTemplate = {
        id: 'custom_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        name: name.trim() || 'Özel Metin Şablonu',
        content,
        createdAt: Date.now()
      };
      const updated = [newTpl, ...templates];
      localStorage.setItem(CUSTOM_TEXT_TEMPLATES_KEY, JSON.stringify(updated));
      return newTpl;
    } catch (e) {
      logger.error('Failed to save custom text template', e);
      return null;
    }
  },

  updateTemplate(id: string, name: string, content: string): boolean {
    try {
      const templates = this.getTemplates();
      const updated = templates.map(t => {
        if (t.id === id) {
          return { ...t, name: name.trim() || t.name, content };
        }
        return t;
      });
      localStorage.setItem(CUSTOM_TEXT_TEMPLATES_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      logger.error('Failed to update custom text template', e);
      return false;
    }
  },

  deleteTemplate(id: string): void {
    try {
      const templates = this.getTemplates();
      const updated = templates.filter(t => t.id !== id);
      localStorage.setItem(CUSTOM_TEXT_TEMPLATES_KEY, JSON.stringify(updated));
    } catch (e) {
      logger.error('Failed to delete custom text template', e);
    }
  }
};
