import { CommunityTemplate } from '../types';

export const INITIAL_COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  {
    id: 'comm-candle-craft',
    author: {
      username: 'selin_crafts',
      displayName: 'Selin Atölye',
      avatar: '🕯️',
      badge: 'El Yapımı',
      verified: true
    },
    likesCount: 142,
    printCount: 489,
    tags: ['mum', 'el yapımı', 'soya', 'butik', 'aromaterapi'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    caption: 'Kendi döktüğüm soya mumları için tasarladığım minimalist koku ve yanma uyarı etiketi. 57mm ve 80mm rulo için harika çıkıyor!',
    paperStyle: 'vintage',
    template: {
      id: 'comm-candle-craft-tpl',
      title: 'Doğal Soya Mumu & Koku Etiketi',
      category: 'product',
      description: 'El yapımı mum kavanozları için koku notaları ve güvenlik uyarıları içeren şık tasarım.',
      tags: ['mum', 'soya', 'koku', 'el yapımı'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'brand', label: 'Marka Adı', type: 'text', defaultValue: 'ATELIER BOTANIQUE' },
        { key: 'scent', label: 'Koku / Aroma', type: 'text', defaultValue: 'VANİLYA & SEDİR AĞACI' },
        { key: 'specs', label: 'Özellikler', type: 'text', defaultValue: '🌿 %100 Doğal Soya Mumu • 180 gr • ~45 Saat Yanma' },
        { key: 'notes', label: 'Koku Notaları', type: 'text', defaultValue: 'Üst: Bergamot | Orta: Vanilya | Alt: Amber & Sedir' },
        { key: 'warning', label: 'Kullanım Tavsiyesi', type: 'text', defaultValue: '⚠️ İlk yakışta en az 2 saat söndürmeyiniz. Fitili 5mm kısaltınız.' },
        { key: 'batchNo', label: 'Seri / Parti No', type: 'text', defaultValue: 'LOT: #2026-SOYA-08' }
      ],
      defaultData: {
        brand: 'ATELIER BOTANIQUE',
        scent: 'VANİLYA & SEDİR AĞACI',
        specs: '🌿 %100 Doğal Soya Mumu • 180 gr • ~45 Saat Yanma',
        notes: 'Üst: Bergamot | Orta: Vanilya | Alt: Amber & Sedir',
        warning: '⚠️ İlk yakışta en az 2 saat söndürmeyiniz. Fitili 5mm kısaltınız.',
        batchNo: 'LOT: #2026-SOYA-08'
      }
    }
  },
  {
    id: 'comm-coffee-roaster',
    author: {
      username: 'barista_mert',
      displayName: 'Mert Roastery',
      avatar: '☕',
      badge: 'Kahve Uzmanı',
      verified: true
    },
    likesCount: 218,
    printCount: 630,
    tags: ['kahve', 'roastery', 'single origin', 'çekirdek', 'tadım'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    caption: 'Taze kavrum kahve paketlerimize yapıştırdığımız tadım notları ve demleme tavsiyesi etiketi. QR ile demleme rehberine gidiyor.',
    paperStyle: 'standard',
    template: {
      id: 'comm-coffee-roaster-tpl',
      title: 'Specialty Coffee Çekirdek Künyesi',
      category: 'product',
      description: 'Nitelikli kahve paketleri için orijin, yükseklik, varyete ve tadım notalı etiket.',
      tags: ['kahve', 'barista', 'tadım'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'origin', label: 'Kahve Kökeni & Ülke', type: 'text', defaultValue: 'ETHIOPIA YIRGACHEFFE G1' },
        { key: 'process', label: 'İşlem & Yükseklik', type: 'text', defaultValue: 'Yıkanmış • 1950 - 2150m' },
        { key: 'notes', label: 'Tadım Notaları', type: 'text', defaultValue: 'Yasemin, Bergamot, Limon Otu, Bal' },
        { key: 'roastDate', label: 'Kavrum Tarihi', type: 'text', defaultValue: '28.08.2026' },
        { key: 'brewAdvice', label: 'Önerilen Demleme', type: 'text', defaultValue: 'V60: 1:16 Oran • 92°C • 2:45 dk' },
        { key: 'qrCode', label: 'Demleme Rehberi QR', type: 'qrcode', defaultValue: 'https://iprint.pro/brew/ethiopia-yirgacheffe' }
      ],
      defaultData: {
        origin: 'ETHIOPIA YIRGACHEFFE G1',
        process: 'Yıkanmış • 1950 - 2150m',
        notes: 'Yasemin, Bergamot, Limon Otu, Bal',
        roastDate: '28.08.2026',
        brewAdvice: 'V60: 1:16 Oran • 92°C • 2:45 dk',
        qrCode: 'https://iprint.pro/brew/ethiopia-yirgacheffe'
      }
    }
  },
  {
    id: 'comm-boutique-thanks',
    author: {
      username: 'zeyno_butik',
      displayName: 'Zeynep Tasarım',
      avatar: '🌸',
      badge: 'Satıcı',
      verified: true
    },
    likesCount: 310,
    printCount: 940,
    tags: ['teşekkür', 'kupon', 'butik', 'kargo içi', 'indirim'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    caption: 'Trendyol ve Dolap kargolarımın içine attığım teşekkür kartı! Müşteriler çok seviyor, bir sonraki sipariş için %15 indirim kuponlu.',
    paperStyle: 'standard',
    template: {
      id: 'comm-boutique-thanks-tpl',
      title: 'Kargo İçi Teşekkür & İndirim Kuponu',
      category: 'ecommerce_shipping',
      description: 'E-ticaret ve butik kargo paketleri için sıcak teşekkür mesajı ve sonraki alışveriş kuponu.',
      tags: ['teşekkür', 'butik', 'kupon'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'storeName', label: 'Butik Adı', type: 'text', defaultValue: '🌸 ZEYNO BOUTIQUE 🌸' },
        { key: 'headerMsg', label: 'Mesaj Başlığı', type: 'text', defaultValue: 'Bizi Tercih Ettiğiniz İçin Teşekkürler!' },
        { key: 'contentMsg', label: 'Mesaj İçeriği', type: 'textarea', defaultValue: 'Siparişiniz sevgiyle ve özenle hazırlandı. Ürününüzü güzel günlerde keyifle kullanmanızı dileriz.' },
        { key: 'couponCode', label: 'Kupon Kodu', type: 'text', defaultValue: 'HEDİYE15' },
        { key: 'couponDetail', label: 'Kupon Detayı', type: 'text', defaultValue: 'Bir sonraki siparişinizde %15 İndirim!' },
        { key: 'social', label: 'Sosyal Medya', type: 'text', defaultValue: 'Instagram: @zeyno_boutique' }
      ],
      defaultData: {
        storeName: '🌸 ZEYNO BOUTIQUE 🌸',
        headerMsg: 'Bizi Tercih Ettiğiniz İçin Teşekkürler!',
        contentMsg: 'Siparişiniz sevgiyle ve özenle hazırlandı. Ürününüzü güzel günlerde keyifle kullanmanızı dileriz.',
        couponCode: 'HEDİYE15',
        couponDetail: 'Bir sonraki siparişinizde %15 İndirim!',
        social: 'Instagram: @zeyno_boutique'
      }
    }
  },
  {
    id: 'comm-plant-care',
    author: {
      username: 'flora_botanik',
      displayName: 'Flora Botanik Evi',
      avatar: '🌿',
      badge: 'Bitki Sever',
      verified: false
    },
    likesCount: 95,
    printCount: 312,
    tags: ['bitki', 'botanik', 'bakım', 'sulama', 'monstera'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    caption: 'Saksılara taktığımız su geçirmez şeffaf bantlı bitki bakım rehberi. Hangi bitki ne kadar su ve ışık ister unutmaya son!',
    paperStyle: 'standard',
    template: {
      id: 'comm-plant-care-tpl',
      title: 'İç Mekan Bitki Bakım & Sulama Kartı',
      category: 'organization',
      description: 'Ev ve ofis bitkileri için ışık, sulama sıklığı ve toprak ihtiyacı rehberi.',
      tags: ['bitki', 'sulama', 'çiçek'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'plantName', label: 'Bitki Adı', type: 'text', defaultValue: '🌿 MONSTERA DELICIOSA (Deve Tabanı)' },
        { key: 'light', label: 'Işık İhtiyacı', type: 'text', defaultValue: '☀️ Yarı gölge / Dolaylı parlak ışık' },
        { key: 'water', label: 'Sulama Periyodu', type: 'text', defaultValue: '💧 Haftada 1 kez (Toprak kurudukça)' },
        { key: 'humidity', label: 'Nem & Sıcaklık', type: 'text', defaultValue: '💨 Yüksek nem sever • 18-26°C' },
        { key: 'repotted', label: 'Son Toprak Değişimi', type: 'text', defaultValue: '📅 Mart 2026' }
      ],
      defaultData: {
        plantName: '🌿 MONSTERA DELICIOSA (Deve Tabanı)',
        light: '☀️ Yarı gölge / Dolaylı parlak ışık',
        water: '💧 Haftada 1 kez (Toprak kurudukça)',
        humidity: '💨 Yüksek nem sever • 18-26°C',
        repotted: '📅 Mart 2026'
      }
    }
  },
  {
    id: 'comm-vintage-bookmark',
    author: {
      username: 'kitap_kurdu',
      displayName: 'Eren Kütüphane',
      avatar: '📖',
      badge: 'Okur',
      verified: true
    },
    likesCount: 184,
    printCount: 520,
    tags: ['kitap', 'ayraç', 'vintage', 'alıntı', 'okuma'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    caption: 'Termal kağıda kitap ayracı basıp içine okuduğum kitabın başlama ve bitiş tarihini not alıyorum. Vintage filtre ile harika duruyor.',
    paperStyle: 'vintage',
    template: {
      id: 'comm-vintage-bookmark-tpl',
      title: 'Vintage Kitap Ayracı & Okuma Notu',
      category: 'notes',
      description: 'Kitap okuma takibi, günün alıntısı ve başlama/bitiş tarihi için özel termal ayraç.',
      tags: ['kitap', 'ayraç', 'vintage', 'alıntı'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'header', label: 'Üst Başlık', type: 'text', defaultValue: '📚 EX LIBRIS • KİTAP AYRACI' },
        { key: 'quote', label: 'Günün Alıntısı', type: 'textarea', defaultValue: '“Bir kitap, içimizdeki donmuş denizi parçalayacak bir balta olmalıdır.”\n— Franz Kafka' },
        { key: 'bookTitle', label: 'Kitap Adı', type: 'text', defaultValue: 'Dönüşüm — Franz Kafka' },
        { key: 'dates', label: 'Okuma Tarihleri', type: 'text', defaultValue: 'Başlama: 20.08.2026 | Bitiş: __.__.____' },
        { key: 'rating', label: 'Puanım', type: 'text', defaultValue: 'Puan: ★ ★ ★ ★ ☆' }
      ],
      defaultData: {
        header: '📚 EX LIBRIS • KİTAP AYRACI',
        quote: '“Bir kitap, içimizdeki donmuş denizi parçalayacak bir balta olmalıdır.”\n— Franz Kafka',
        bookTitle: 'Dönüşüm — Franz Kafka',
        dates: 'Başlama: 20.08.2026 | Bitiş: __.__.____',
        rating: 'Puan: ★ ★ ★ ★ ☆'
      }
    }
  },
  {
    id: 'comm-habit-tracker',
    author: {
      username: 'zen_planner',
      displayName: 'Planla & Yaşa',
      avatar: '⚡',
      badge: 'Verimlilik',
      verified: true
    },
    likesCount: 265,
    printCount: 780,
    tags: ['alışkanlık', 'tracker', 'su', 'ajanda', 'plan'],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    caption: 'Masanıza veya defterinize yapıştırabileceğiniz günlük mini alışkanlık ve su içme takipçisi!',
    paperStyle: 'standard',
    template: {
      id: 'comm-habit-tracker-tpl',
      title: 'Günlük Mini Alışkanlık & Su Çizelgesi',
      category: 'notes',
      description: 'Günlük hedefleri, su tüketimini ve rutinleri tik atarak takip etmek için pratik mini etiket.',
      tags: ['planlayıcı', 'ajanda', 'su', 'hedef'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'dateTitle', label: 'Tarih / Gün', type: 'text', defaultValue: '🎯 GÜNLÜK ODAK & ALIŞKANLIKLAR' },
        { key: 'habit1', label: '1. Alışkanlık', type: 'text', defaultValue: '[ ] 30 Dk Kitap Okuma' },
        { key: 'habit2', label: '2. Alışkanlık', type: 'text', defaultValue: '[ ] 20 Dk Yürüyüş / Egzersiz' },
        { key: 'habit3', label: '3. Alışkanlık', type: 'text', defaultValue: '[ ] Sıfır Şeker / Sağlıklı Beslenme' },
        { key: 'habit4', label: '4. Alışkanlık', type: 'text', defaultValue: '[ ] 1 Saat Odaklı Çalışma (Deep Work)' },
        { key: 'waterGlasses', label: 'Su Takibi', type: 'text', defaultValue: '💧 Su: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] (2.5L)' },
        { key: 'mood', label: 'Günün Modu', type: 'text', defaultValue: 'Mod: 😊 Süper | 😐 Normal | 😴 Yorgun' }
      ],
      defaultData: {
        dateTitle: '🎯 GÜNLÜK ODAK & ALIŞKANLIKLAR',
        habit1: '[ ] 30 Dk Kitap Okuma',
        habit2: '[ ] 20 Dk Yürüyüş / Egzersiz',
        habit3: '[ ] Sıfır Şeker / Sağlıklı Beslenme',
        habit4: '[ ] 1 Saat Odaklı Çalışma (Deep Work)',
        waterGlasses: '💧 Su: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] (2.5L)',
        mood: 'Mod: 😊 Süper | 😐 Normal | 😴 Yorgun'
      }
    }
  },
  {
    id: 'comm-gourmet-sauce',
    author: {
      username: 'chef_burak',
      displayName: 'Burak Şef',
      avatar: '👨‍🍳',
      badge: 'Şef',
      verified: false
    },
    likesCount: 112,
    printCount: 340,
    tags: ['sos', 'mutfak', 'şef', 'reçel', 'organik'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    caption: 'Kavanozladığımız ev yapımı acı sos ve pesto soslarımız için hazırladığım rustik etiket.',
    paperStyle: 'vintage',
    template: {
      id: 'comm-gourmet-sauce-tpl',
      title: 'Ev Yapımı Gurme Sos & Kavanoz Etiketi',
      category: 'product',
      description: 'Ev yapımı soslar, reçeller ve turşular için içerik ve tüketim tarihi etiketi.',
      tags: ['sos', 'kavanoz', 'gurme'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'name', label: 'Ürün Adı', type: 'text', defaultValue: '🌶️ FERMENTE ACI BİBER SOSU' },
        { key: 'ingredients', label: 'İçindekiler', type: 'text', defaultValue: 'Habanero Biberi, Sarımsak, Elma Sirkesi, Deniz Tuzu, Zeytinyağı' },
        { key: 'dates', label: 'Üretim & Tüketim', type: 'text', defaultValue: 'ÜRT: 25.08.2026 • STT: 25.02.2027' },
        { key: 'storage', label: 'Saklama Koşulu', type: 'text', defaultValue: 'Açıldıktan sonra buzdolabında saklayınız.' },
        { key: 'craftedBy', label: 'Hazırlayan', type: 'text', defaultValue: 'Chef Burak Artisan Kitchen • Katkısızdır' }
      ],
      defaultData: {
        name: '🌶️ FERMENTE ACI BİBER SOSU',
        ingredients: 'Habanero Biberi, Sarımsak, Elma Sirkesi, Deniz Tuzu, Zeytinyağı',
        dates: 'ÜRT: 25.08.2026 • STT: 25.02.2027',
        storage: 'Açıldıktan sonra buzdolabında saklayınız.',
        craftedBy: 'Chef Burak Artisan Kitchen • Katkısızdır'
      }
    }
  },
  {
    id: 'comm-retro-game',
    author: {
      username: 'pixel_nostalji',
      displayName: 'Pixel Studio',
      avatar: '👾',
      badge: 'Pixel Art',
      verified: true
    },
    likesCount: 389,
    printCount: 1120,
    tags: ['retro', 'game', 'pixel', 'nostalji', 'koleksiyon'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    caption: 'GameBoy ve 8-bit hayranları için termal yazıcıda harika çıkan piksel koleksiyon kartı!',
    paperStyle: 'dither',
    template: {
      id: 'comm-retro-game-tpl',
      title: 'Retro 8-Bit Gaming Koleksiyon Kartı',
      category: 'stickers',
      description: 'Nostaljik oyun severler için dither tramlı retro oyun ve skor kartı.',
      tags: ['oyun', 'pixel', 'retro', 'dither'],
      recommendedWidthMm: 57,
      fields: [
        { key: 'gameTitle', label: 'Oyun Adı', type: 'text', defaultValue: '👾 RETRO ARCADE RUNNER 1989' },
        { key: 'player', label: 'Oyuncu Adı', type: 'text', defaultValue: 'PLAYER 1: [ PIXEL_HERO ]' },
        { key: 'score', label: 'Yüksek Skor', type: 'text', defaultValue: 'HIGH SCORE: 998,420 PTS ★★★' },
        { key: 'level', label: 'Seviye & Aşama', type: 'text', defaultValue: 'STAGE: WORLD 8-4 [COMPLETED]' },
        { key: 'achievement', label: 'Kazanılan Başarım', type: 'text', defaultValue: '🏆 UNLOCKED: MASTER OF THE PIXELS' }
      ],
      defaultData: {
        gameTitle: '👾 RETRO ARCADE RUNNER 1989',
        player: 'PLAYER 1: [ PIXEL_HERO ]',
        score: 'HIGH SCORE: 998,420 PTS ★★★',
        level: 'STAGE: WORLD 8-4 [COMPLETED]',
        achievement: '🏆 UNLOCKED: MASTER OF THE PIXELS'
      }
    }
  }
];
