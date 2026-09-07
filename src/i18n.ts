import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "iPrint Pro",
      "connect": "Connect Printer",
      "disconnect": "Disconnect",
      "connected": "Connected",
      "disconnected": "Disconnected",
      "battery": "Battery",
      "print_preview": "Print Preview",
      "print": "Print",
      "cancel": "Cancel",
      "menu": {
        "document": "Print Document",
        "text": "Text Editor",
        "image": "Image Processing",
        "banner": "Banner / Label",
        "web": "Web Page"
      },
      "settings": {
        "density": "Density (Heat)",
        "tone": "Print Tone",
        "dithering": "Dithering Algorithm",
        "none": "None (Threshold)",
        "floyd": "Floyd-Steinberg",
        "atkinson": "Atkinson",
        "stucki": "Stucki",
        "bayer": "Bayer",
        "sierra": "Sierra",
        "jjn": "Jarvis-Judice-Ninke",
        "fast": "Extreme Fast",
        "dot_matrix": "Dot-Matrix"
      },
      "editor": {
        "placeholder": "Type something...",
        "font_size": "Font Size",
        "align_left": "Left",
        "align_center": "Center",
        "align_right": "Right"
      }
    }
  },
  tr: {
    translation: {
      "app_name": "iPrint Pro",
      "connect": "Yazıcıya Bağlan",
      "disconnect": "Bağlantıyı Kes",
      "connected": "Bağlı",
      "disconnected": "Bağlı Değil",
      "battery": "Pil",
      "print_preview": "Yazdırma Önizleme",
      "print": "Yazdır",
      "cancel": "İptal",
      "menu": {
        "document": "Belge Yazdır",
        "text": "Metin Düzenleyici",
        "image": "Görsel İşleme",
        "banner": "Banner / Etiket",
        "web": "Web Sayfası"
      },
      "settings": {
        "density": "Yoğunluk (Isı)",
        "tone": "Yazdırma Tonu",
        "dithering": "Noktalama Algoritması",
        "none": "Yok (Eşikleme)",
        "floyd": "Floyd-Steinberg",
        "atkinson": "Atkinson",
        "stucki": "Stucki",
        "bayer": "Bayer",
        "sierra": "Sierra",
        "jjn": "Jarvis-Judice-Ninke",
        "fast": "Ekstrem Hızlı",
        "dot_matrix": "Dot-Matrix"
      },
      "editor": {
        "placeholder": "Bir şeyler yazın...",
        "font_size": "Yazı Boyutu",
        "align_left": "Sol",
        "align_center": "Orta",
        "align_right": "Sağ"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
