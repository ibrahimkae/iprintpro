import { ThermalTemplate } from '../types';

export const INITIAL_TEMPLATES: ThermalTemplate[] = [
  // ==========================================
  // PROFESYONEL VE SEKTÖREL FORM ŞABLONLARI
  // ==========================================
  {
    id: 'tpl-pro-ice-card',
    title: 'Acil Sağlık Kartı (ICE - In Case of Emergency)',
    category: 'pro',
    description: 'Cüzdan, çanta ve araç içi için kan grubu, kronik hastalıklar, ilaçlar, alerjiler ve 2 acil durum yakını kartı.',
    tags: ['acil', 'sağlık', 'ice', 'kan grubu', 'hastalık', 'ilaç', 'cüzdan', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'fullName', label: 'Ad Soyad', type: 'text', defaultValue: 'Ahmet Yılmaz' },
      { key: 'bloodType', label: 'Kan Grubu', type: 'text', defaultValue: '0 Rh(+)' },
      { key: 'chronicDiseases', label: 'Kronik Hastalıklar', type: 'text', defaultValue: 'Tip 1 Diyabet, Astım' },
      { key: 'medications', label: 'Düzenli İlaçlar', type: 'text', defaultValue: 'İnsülin Pen, Ventolin' },
      { key: 'allergies', label: 'Alerjiler', type: 'text', defaultValue: 'Penisilin, Aspirin' },
      { key: 'contact1', label: '1. Acil Yakın (Ad & Tel)', type: 'text', defaultValue: 'Zeynep Yılmaz (Eşi) - 0532 555 1234' },
      { key: 'contact2', label: '2. Acil Yakın (Ad & Tel)', type: 'text', defaultValue: 'Mehmet Yılmaz (Kardeşi) - 0542 444 5678' }
    ],
    defaultData: {
      fullName: 'Ahmet Yılmaz',
      bloodType: '0 Rh(+)',
      chronicDiseases: 'Tip 1 Diyabet, Astım',
      medications: 'İnsülin Pen, Ventolin',
      allergies: 'Penisilin, Aspirin',
      contact1: 'Zeynep Yılmaz (Eşi) - 0532 555 1234',
      contact2: 'Mehmet Yılmaz (Kardeşi) - 0542 444 5678'
    }
  },
  {
    id: 'tpl-pro-shipping-kargo',
    title: 'Kargo & Teslimat Gönderi Etiketi (Alıcı/Barkod)',
    category: 'pro',
    description: 'Pazaryeri, kargo ve lojistik gönderileri için takip barkodlu, alıcı ve gönderici bilgilerini içeren tam formatlı kargo etiketi.',
    tags: ['kargo', 'teslimat', 'lojistik', 'barkod', 'alıcı', 'gönderici', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'carrierName', label: 'Kargo / Taşıyıcı Adı', type: 'text', defaultValue: 'EXPRESS CARGO LOGISTICS' },
      { key: 'trackingNumber', label: 'Takip No / Barkod', type: 'barcode', defaultValue: 'TR98421048201' },
      { key: 'recipientName', label: 'Alıcı Adı Soyadı', type: 'text', defaultValue: 'Ahmet Yılmaz' },
      { key: 'recipientPhone', label: 'Alıcı Telefon', type: 'text', defaultValue: '+90 (532) 123 45 67' },
      { key: 'recipientAddress', label: 'Alıcı Adresi', type: 'textarea', defaultValue: 'Atatürk Mah. İstiklal Cad. No: 42 D: 5 Kadıköy / İSTANBUL' },
      { key: 'senderName', label: 'Gönderici Firma', type: 'text', defaultValue: 'iPrint Mağazacılık A.Ş.' },
      { key: 'shipDate', label: 'Tarih / Desi', type: 'text', defaultValue: '29.08.2026 - 1.5 DESİ' },
      { key: 'notes', label: 'Teslimat Notu', type: 'text', defaultValue: 'KIRILACAK EŞYA - DİKKATLİ TAŞIYINIZ ⚠️' }
    ],
    defaultData: {
      carrierName: 'EXPRESS CARGO LOGISTICS',
      trackingNumber: 'TR98421048201',
      recipientName: 'Ahmet Yılmaz',
      recipientPhone: '+90 (532) 123 45 67',
      recipientAddress: 'Atatürk Mah. İstiklal Cad. No: 42 D: 5 Kadıköy / İSTANBUL',
      senderName: 'iPrint Mağazacılık A.Ş.',
      shipDate: '29.08.2026 - 1.5 DESİ',
      notes: 'KIRILACAK EŞYA - DİKKATLİ TAŞIYINIZ ⚠️'
    }
  },
  {
    id: 'tpl-pro-wifi-card',
    title: 'Wi-Fi Misafir Bağlantı Kartı & QR Kod',
    category: 'pro',
    description: 'Kafe, ofis, otel veya ev için misafirlerin tek dokunuşla Wi-Fi ağına bağlanmasını sağlayan estetik QR kartı.',
    tags: ['wifi', 'qr', 'misafir', 'internet', 'kafe', 'otel', 'ofis', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'networkName', label: 'Wi-Fi Ağ Adı (SSID)', type: 'text', defaultValue: 'KAFE_MISAFIR_WIFI' },
      { key: 'password', label: 'Wi-Fi Şifresi', type: 'text', defaultValue: 'KahveSaati2026' },
      { key: 'securityType', label: 'Güvenlik Türü', type: 'select', defaultValue: 'WPA', options: ['WPA', 'WEP', 'nopass'] },
      { key: 'welcomeMsg', label: 'Hoşgeldiniz Mesajı', type: 'text', defaultValue: 'Aramıza Hoş Geldiniz! İyi Çalışmalar Dileriz.' },
      { key: 'qrUrl', label: 'Wi-Fi QR Bağlantısı', type: 'qrcode', defaultValue: 'WIFI:S:KAFE_MISAFIR_WIFI;T:WPA;P:KahveSaati2026;;' }
    ],
    defaultData: {
      networkName: 'KAFE_MISAFIR_WIFI',
      password: 'KahveSaati2026',
      securityType: 'WPA',
      welcomeMsg: 'Aramıza Hoş Geldiniz! İyi Çalışmalar Dileriz.',
      qrUrl: 'WIFI:S:KAFE_MISAFIR_WIFI;T:WPA;P:KahveSaati2026;;'
    }
  },
  {
    id: 'tpl-pro-pos-receipt',
    title: 'Satış Fişi & Fatura Makbuzu (POS/KDV)',
    category: 'pro',
    description: 'Perakende mağaza, kafe ve restoranlar için kalem listeli, ara toplam, KDV ve toplam tutarlı detaylı fiş formatı.',
    tags: ['fiş', 'fatura', 'pos', 'makbuz', 'satış', 'kdv', 'hesap', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'storeName', label: 'İşletme Adı', type: 'text', defaultValue: 'GURME KAHVE & FIRIN' },
      { key: 'storeAddress', label: 'Adres / Tel / Vergi No', type: 'text', defaultValue: 'Bağdat Cad. No:110 Kadıköy | VN: 1234567890' },
      { key: 'receiptNo', label: 'Fiş / Sipariş No', type: 'text', defaultValue: 'FİŞ NO: #2026-0892' },
      { key: 'date', label: 'Tarih & Saat', type: 'text', defaultValue: '29.08.2026 14:35' },
      { key: 'item1', label: '1. Ürün & Fiyat', type: 'text', defaultValue: '1x Flat White Kahve       120.00 TL' },
      { key: 'item2', label: '2. Ürün & Fiyat', type: 'text', defaultValue: '1x Kruvasan Çikolatalı    140.00 TL' },
      { key: 'item3', label: '3. Ürün & Fiyat', type: 'text', defaultValue: '1x Maden Suyu              35.00 TL' },
      { key: 'subtotal', label: 'Ara Toplam', type: 'text', defaultValue: '295.00 TL' },
      { key: 'tax', label: 'KDV (%10)', type: 'text', defaultValue: '26.82 TL' },
      { key: 'total', label: 'GENEL TOPLAM', type: 'text', defaultValue: '295.00 TL' },
      { key: 'footerMsg', label: 'Alt Bilgi Mesajı', type: 'text', defaultValue: 'Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!' },
      { key: 'barcodeVal', label: 'Fiş Barkodu', type: 'barcode', defaultValue: '869020260892' }
    ],
    defaultData: {
      storeName: 'GURME KAHVE & FIRIN',
      storeAddress: 'Bağdat Cad. No:110 Kadıköy | VN: 1234567890',
      receiptNo: 'FİŞ NO: #2026-0892',
      date: '29.08.2026 14:35',
      item1: '1x Flat White Kahve       120.00 TL',
      item2: '1x Kruvasan Çikolatalı    140.00 TL',
      item3: '1x Maden Suyu              35.00 TL',
      subtotal: '295.00 TL',
      tax: '26.82 TL',
      total: '295.00 TL',
      footerMsg: 'Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!',
      barcodeVal: '869020260892'
    }
  },
  {
    id: 'tpl-pro-pantry-organizer',
    title: 'Kiler, Saklama & Mutfak Düzenleyici Etiketi',
    category: 'pro',
    description: 'Kavanoz, baharatlık, kuru gıda ve ev düzenleme kutuları için dolum tarihi ve saklama talimatı içeren minimalist etiket.',
    tags: ['kiler', 'düzenleyici', 'kavanoz', 'mutfak', 'baharat', 'saklama', 'organizer', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'categoryTitle', label: 'Kategori', type: 'text', defaultValue: 'ORGANİK KURU GIDA' },
      { key: 'itemName', label: 'Ürün / Malzeme Adı', type: 'text', defaultValue: 'SİYAH PİRİNÇ' },
      { key: 'subDetails', label: 'Tür / Özellik', type: 'text', defaultValue: 'Glutensiz & Yüksek Lif' },
      { key: 'fillDate', label: 'Dolum Tarihi', type: 'text', defaultValue: '29.08.2026' },
      { key: 'bestBefore', label: 'Son Tüketim / Raf Ömrü', type: 'text', defaultValue: '29.08.2027' },
      { key: 'storageInstruction', label: 'Saklama Koşulu', type: 'text', defaultValue: 'Serin, kuru ve güneş almayan yerde muhafaza ediniz.' }
    ],
    defaultData: {
      categoryTitle: 'ORGANİK KURU GIDA',
      itemName: 'SİYAH PİRİNÇ',
      subDetails: 'Glutensiz & Yüksek Lif',
      fillDate: '29.08.2026',
      bestBefore: '29.08.2027',
      storageInstruction: 'Serin, kuru ve güneş almayan yerde muhafaza ediniz.'
    }
  },
  {
    id: 'tpl-pro-price-sale',
    title: 'Fiyat, İndirim & Kampanya Etiketi (Barkodlu)',
    category: 'pro',
    description: 'Mağaza reyonları, butikler ve kampanyalar için eski/yeni fiyat vurgulu, ürün açıklamalı barkodlu fiyat etiketi.',
    tags: ['fiyat', 'indirim', 'kampanya', 'etiket', 'barkod', 'mağaza', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'brandName', label: 'Marka / Mağaza', type: 'text', defaultValue: 'BOUTIQUE STUDIO' },
      { key: 'productTitle', label: 'Ürün Adı & Model', type: 'text', defaultValue: 'Oversize Pamuklu T-Shirt' },
      { key: 'productCode', label: 'Stok Kodu / Beden', type: 'text', defaultValue: 'SKU: TS-BLK-L / SİYAH-L' },
      { key: 'oldPrice', label: 'Eski Fiyat', type: 'text', defaultValue: '890.00 TL' },
      { key: 'newPrice', label: 'KAMPANYALI FİYAT', type: 'text', defaultValue: '549.90 TL' },
      { key: 'discountBadge', label: 'İndirim Rozeti', type: 'text', defaultValue: '%40 İNDİRİM' },
      { key: 'barcodeVal', label: 'Ürün Barkodu', type: 'barcode', defaultValue: '869102938475' }
    ],
    defaultData: {
      brandName: 'BOUTIQUE STUDIO',
      productTitle: 'Oversize Pamuklu T-Shirt',
      productCode: 'SKU: TS-BLK-L / SİYAH-L',
      oldPrice: '890.00 TL',
      newPrice: '549.90 TL',
      discountBadge: '%40 İNDİRİM',
      barcodeVal: '869102938475'
    }
  },
  {
    id: 'tpl-pro-article-digest',
    title: 'Mini Makale & Bülten / Bilgi Fişi',
    category: 'pro',
    description: 'Günün sözü, mini makale, tarif veya bilgi notlarını termal kağıtta gazete/bülten tarzında basmak için özel tasarım.',
    tags: ['makale', 'bülten', 'bilgi', 'gazete', 'tarif', 'günün sözü', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'issueTitle', label: 'Bülten / Gazete Adı', type: 'text', defaultValue: 'GÜNLÜK BİLGİ DİGEST' },
      { key: 'date', label: 'Tarih & Sayı', type: 'text', defaultValue: '29 Ağustos 2026 - Sayı: #142' },
      { key: 'headline', label: 'Ana Başlık', type: 'text', defaultValue: 'Odaklanma Sanatı: Derin Çalışma' },
      { key: 'content', label: 'Makale / Metin İçeriği', type: 'textarea', defaultValue: 'Dikkat dağınıklığını önlemek için günün ilk 90 dakikasını en kritik tek bir göreve ayırın. Bildirimleri kapatın ve kesintisiz akış moduna geçin.' },
      { key: 'quote', label: 'Alıntı Söz', type: 'text', defaultValue: '"Nereye odaklanırsanız, enerjiniz oraya akar."' },
      { key: 'qrUrl', label: 'Devamını Oku / QR Link', type: 'qrcode', defaultValue: 'https://iprint.app/digest/142' }
    ],
    defaultData: {
      issueTitle: 'GÜNLÜK BİLGİ DİGEST',
      date: '29 Ağustos 2026 - Sayı: #142',
      headline: 'Odaklanma Sanatı: Derin Çalışma',
      content: 'Dikkat dağınıklığını önlemek için günün ilk 90 dakikasını en kritik tek bir göreve ayırın. Bildirimleri kapatın ve kesintisiz akış moduna geçin.',
      quote: '"Nereye odaklanırsanız, enerjiniz oraya akar."',
      qrUrl: 'https://iprint.app/digest/142'
    }
  },
  {
    id: 'tpl-pro-todo-checklist',
    title: 'Yapılacaklar & Günlük Hedefler / Checklist',
    category: 'pro',
    description: 'Günlük görevler, öncelikler, kontrol kutucukları ve motivasyon notu içeren şık termal planlayıcı.',
    tags: ['todo', 'checklist', 'yapılacaklar', 'planlayıcı', 'görev', 'hedef', 'pro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'title', label: 'Liste Başlığı', type: 'text', defaultValue: 'GÜNLÜK ODAK & HEDEFLER' },
      { key: 'date', label: 'Tarih', type: 'text', defaultValue: '29.08.2026' },
      { key: 'task1', label: '1. Görev', type: 'text', defaultValue: '[ ] E-postaları yanıtla ve rapor hazırla' },
      { key: 'task2', label: '2. Görev', type: 'text', defaultValue: '[ ] Termal yazıcı kargo etiketlerini bas' },
      { key: 'task3', label: '3. Görev', type: 'text', defaultValue: '[ ] Müşteri görüşmelerini tamamla' },
      { key: 'task4', label: '4. Görev', type: 'text', defaultValue: '[ ] 30 dakika yürüyüş / egzersiz yap' },
      { key: 'task5', label: '5. Görev', type: 'text', defaultValue: '[ ] Gün sonu kapanış kontrolleri' },
      { key: 'memo', label: 'Alt Not / Hatırlatıcı', type: 'text', defaultValue: '✨ Küçük adımlar büyük sonuçlar doğurur.' }
    ],
    defaultData: {
      title: 'GÜNLÜK ODAK & HEDEFLER',
      date: '29.08.2026',
      task1: '[ ] E-postaları yanıtla ve rapor hazırla',
      task2: '[ ] Termal yazıcı kargo etiketlerini bas',
      task3: '[ ] Müşteri görüşmelerini tamamla',
      task4: '[ ] 30 dakika yürüyüş / egzersiz yap',
      task5: '[ ] Gün sonu kapanış kontrolleri',
      memo: '✨ Küçük adımlar büyük sonuçlar doğurur.'
    }
  },
  // 1. MONDAYS SHOULD BE OPTIONAL (Referans Görsel 1)
  {
    id: 'tpl-mondays-brutalist',
    title: 'Mondays Optional Brutalist Çıkartma',
    category: 'stickers',
    description: 'Büyük tipografi, alıntı blokları, barkod kutusu ve güvenlik rozetleri içeren brutalist etiket.',
    tags: ['brutalist', 'çıkartma', 'tipografi', 'eğlenceli', '57mm', '100mm'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'topPrefix', label: 'Üst Başlangıç', type: 'text', defaultValue: 'MONDAYS' },
      { key: 'topAction', label: 'Üst Orta Metin', type: 'text', defaultValue: 'SHOULD' },
      { key: 'topSuffix', label: 'Üst Son Metin', type: 'text', defaultValue: 'BE' },
      { key: 'mainTitle', label: 'Ana Büyük Başlık', type: 'text', defaultValue: 'OPTIONAL' },
      { key: 'leftQuote', label: 'Sol Alıntı Metni', type: 'textarea', defaultValue: 'SOMETIMES WE ALL NEED A LITTLE EXTRA TIME TO EASE INTO THE WEEK' },
      { key: 'rightQuote', label: 'Sağ Alıntı Metni', type: 'textarea', defaultValue: 'WHY NOT MAKE MONDAY OPTIONAL? IT MIGHT JUST MAKE EVERYONE BRIGHTER.' },
      { key: 'barcodeVal', label: 'Barkod Kodu', type: 'barcode', defaultValue: '0.123.456.789.0' },
      { key: 'barcodeCredit', label: 'Barkod Yan Metni', type: 'text', defaultValue: 'LIMITED EDITION STUDIO' },
      { key: 'restrictedTitle', label: 'Uyarı Başlığı', type: 'text', defaultValue: 'RESTRICTED' },
      { key: 'restrictedSub', label: 'Uyarı Alt Metni', type: 'text', defaultValue: 'UNDER 17 REQUIRES ACCOMPANYING PARENT OR ADULT GUARDIAN' },
      { key: 'advisoryLabel', label: 'Advisory Başlığı', type: 'text', defaultValue: 'PARENTAL ADVISORY' },
      { key: 'advisorySub', label: 'Advisory Alt Metin', type: 'text', defaultValue: 'EXPLICIT VIBES ONLY' },
      { key: 'showBadges', label: 'CE / 18+ / Geri Dönüşüm Rozetleri', type: 'checkbox', defaultValue: true }
    ],
    defaultData: {
      topPrefix: 'MONDAYS',
      topAction: 'SHOULD',
      topSuffix: 'BE',
      mainTitle: 'OPTIONAL',
      leftQuote: 'SOMETIMES WE ALL NEED A LITTLE EXTRA TIME TO EASE INTO THE WEEK',
      rightQuote: 'WHY NOT MAKE MONDAY OPTIONAL? IT MIGHT JUST MAKE EVERYONE BRIGHTER.',
      barcodeVal: '0.123.456.789.0',
      barcodeCredit: 'LIMITED EDITION STUDIO',
      restrictedTitle: 'RESTRICTED',
      restrictedSub: 'UNDER 17 REQUIRES ACCOMPANYING PARENT OR ADULT GUARDIAN',
      advisoryLabel: 'PARENTAL ADVISORY',
      advisorySub: 'EXPLICIT VIBES ONLY',
      showBadges: true
    }
  },

  // 2. ALMOND SEA SALT ARTISAN GIDA / ÇİKOLATA (Referans Görsel 2)
  {
    id: 'tpl-almond-sea-salt',
    title: 'Artisan Çikolata & Butik Gıda Etiketi',
    category: 'product',
    description: 'Minimalist tipografi, parti numarası, içerik tablosu ve botanik damgalı butik ürün etiketi.',
    tags: ['gıda', 'çikolata', 'artisan', 'minimalist', 'damga', 'içerik'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'productName', label: 'Ürün Adı', type: 'text', defaultValue: 'ALMOND SEA SALT' },
      { key: 'batchNo', label: 'Parti / Seri No (Batch No)', type: 'text', defaultValue: '007' },
      { key: 'weight', label: 'Gramaj / Net Ağırlık', type: 'text', defaultValue: '60 GRAMS' },
      { key: 'cacaoPercent', label: 'Öne Çıkan Yüzde / Oran', type: 'text', defaultValue: '89%' },
      { key: 'originText', label: 'Köken / Özellik Açıklaması', type: 'text', defaultValue: 'SINGLE ORIGIN CACAO' },
      { key: 'dietBadges', label: 'Diyet / Sertifika Özellikleri', type: 'text', defaultValue: 'VEGAN AND GLUTEN FREE' },
      { key: 'ingredientsHeader', label: 'İçindekiler Başlığı', type: 'text', defaultValue: 'INGREDIENTS' },
      { key: 'ingredients', label: 'İçindekiler Metni', type: 'textarea', defaultValue: 'BITTERSWEET CHOCOLATE (CHOCOLATE LIQUOR, CANE SUGAR, COCOA BUTTER, SOY LECITHIN,) ALMONDS, SEA SALT' },
      { key: 'stampTextTop', label: 'Damga Üst Yazı', type: 'text', defaultValue: 'HECHO EN' },
      { key: 'stampTextBottom', label: 'Damga Alt Yazı', type: 'text', defaultValue: 'COLOMBIA' },
      { key: 'barcodeVal', label: 'Ürün EAN / Barkod', type: 'barcode', defaultValue: '8690123456789' }
    ],
    defaultData: {
      productName: 'ALMOND SEA SALT',
      batchNo: '007',
      weight: '60 GRAMS',
      cacaoPercent: '89%',
      originText: 'SINGLE ORIGIN CACAO',
      dietBadges: 'VEGAN AND GLUTEN FREE',
      ingredientsHeader: 'INGREDIENTS',
      ingredients: 'BITTERSWEET CHOCOLATE (CHOCOLATE LIQUOR, CANE SUGAR, COCOA BUTTER, SOY LECITHIN,) ALMONDS, SEA SALT',
      stampTextTop: 'HECHO EN',
      stampTextBottom: 'COLOMBIA',
      barcodeVal: '8690123456789'
    }
  },

  // 3. LEMON POPPYSEED DOĞAL SABUN & KOZMETİK (Referans Görsel 3)
  {
    id: 'tpl-lemon-poppyseed-soap',
    title: 'El Yapımı Sabun & Kozmetik Etiketi',
    category: 'product',
    description: 'Küçük parti (Small batch) el yapımı doğal sabun, krem ve kozmetik ürün etiketi.',
    tags: ['sabun', 'kozmetik', 'doğal', 'butik', 'el yapımı'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'topQualityBadge', label: 'Üst Kalite Başlığı', type: 'text', defaultValue: '100% NATURAL' },
      { key: 'leftSideText', label: 'Sol Dikey Metin', type: 'text', defaultValue: 'SMALL BATCH' },
      { key: 'rightSideText', label: 'Sağ Dikey Metin', type: 'text', defaultValue: 'HAND POURED' },
      { key: 'titleLine1', label: 'Ürün Adı Satır 1', type: 'text', defaultValue: 'LEMON' },
      { key: 'titleLine2', label: 'Ürün Adı Satır 2', type: 'text', defaultValue: 'POPPYSEED' },
      { key: 'subtitle', label: 'Alt Başlık / Özellik', type: 'text', defaultValue: 'FRESH & EXFOLIATING' },
      { key: 'batchNo', label: 'Parti No (Batch No)', type: 'text', defaultValue: '00012' },
      { key: 'brandName', label: 'Marka / Atölye Adı', type: 'text', defaultValue: 'soap + cinder' },
      { key: 'weight', label: 'Ağırlık', type: 'text', defaultValue: '4.5 OZ  128 G.' },
      { key: 'ingredients', label: 'İçerik Açıklaması', type: 'textarea', defaultValue: 'SAPONIFIED OILS OF SOY, COCONUT, AND OLIVE, A BLEND OF ESSENTIAL OILS' }
    ],
    defaultData: {
      topQualityBadge: '100% NATURAL',
      leftSideText: 'SMALL BATCH',
      rightSideText: 'HAND POURED',
      titleLine1: 'LEMON',
      titleLine2: 'POPPYSEED',
      subtitle: 'FRESH & EXFOLIATING',
      batchNo: '00012',
      brandName: 'soap + cinder',
      weight: '4.5 OZ  128 G.',
      ingredients: 'SAPONIFIED OILS OF SOY, COCONUT, AND OLIVE, A BLEND OF ESSENTIAL OILS'
    }
  },

  // 4. ALCHEMIE & CO APOTHECARY RX (Referans Görsel 4)
  {
    id: 'tpl-apothecary-rx',
    title: 'Vintage Eczane & Apothecary İçecek/Tonik',
    category: 'product',
    description: 'Klasik kutulu çerçeve, reçete Rx kodu ve tipografik tonik / esans etiketi.',
    tags: ['apothecary', 'vintage', 'reçete', 'içecek', 'tonik', 'retro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'brandName', label: 'Marka Adı', type: 'text', defaultValue: 'ALCHEMIE & CO' },
      { key: 'solutionType', label: 'Çözelti / Tip', type: 'text', defaultValue: 'EFFERVESCING SOLUTION OF:' },
      { key: 'flavorTitle1', label: 'Aroma Satır 1', type: 'text', defaultValue: 'LEMON' },
      { key: 'flavorTitle2', label: 'Aroma Satır 2', type: 'text', defaultValue: 'LIME' },
      { key: 'rxCode', label: 'Reçete / Seri Rx No', type: 'text', defaultValue: 'C58296023' },
      { key: 'badgeLeft', label: 'Sol Rozet', type: 'text', defaultValue: 'NON-ALCOHOLIC' },
      { key: 'badgeMiddle', label: 'Orta Rozet', type: 'text', defaultValue: 'GLUTEN FREE' },
      { key: 'badgeRight', label: 'Hacim / Boyut', type: 'text', defaultValue: '11.2 FLUID OZ' }
    ],
    defaultData: {
      brandName: 'ALCHEMIE & CO',
      solutionType: 'EFFERVESCING SOLUTION OF:',
      flavorTitle1: 'LEMON',
      flavorTitle2: 'LIME',
      rxCode: 'C58296023',
      badgeLeft: 'NON-ALCOHOLIC',
      badgeMiddle: 'GLUTEN FREE',
      badgeRight: '11.2 FLUID OZ'
    }
  },

  // 5. PRIORITY MAIL SHIPPING & CARGO (Referans Görsel 5)
  {
    id: 'tpl-priority-mail',
    title: 'Hızlı Kargo & Paketleme Gönderi Etiketi',
    category: 'shipping',
    description: 'Büyük P harfi, alıcı/gönderici, koli kırılabilir/şemsiye/ok sembolleri ve barkod alanı.',
    tags: ['kargo', 'gönderi', 'priority', 'lojistik', 'kırılabilir', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'postalSymbol', label: 'Büyük Kargo Harfi / Sembol', type: 'text', defaultValue: 'P' },
      { key: 'toCompany', label: 'Alıcı Adı / Şirket', type: 'text', defaultValue: 'Acme Teknoloji Ltd. Şti.' },
      { key: 'toAddress', label: 'Alıcı Adresi', type: 'textarea', defaultValue: 'Büyükdere Cad. No:142 Kat:5 Şişli / İstanbul' },
      { key: 'headerTitle', label: 'Kargo Servis Başlığı', type: 'text', defaultValue: 'PRIORITY EXPRESS CARGO' },
      { key: 'fromInfo', label: 'Gönderici Bilgisi', type: 'text', defaultValue: 'Termal Studio Depo - Kadıköy, İstanbul' },
      { key: 'lotNumber', label: 'Paket / Lot No', type: 'text', defaultValue: 'LOT-9824' },
      { key: 'refNumber', label: 'Referans No', type: 'text', defaultValue: 'REF-77104' },
      { key: 'shipDate', label: 'Gönderim Tarihi', type: 'text', defaultValue: '26.08.2026' },
      { key: 'weight', label: 'Ağırlık (Kg/Gr)', type: 'text', defaultValue: '1.45 KG' },
      { key: 'itemNr', label: 'Ürün Kodu', type: 'text', defaultValue: 'ITM-0089240' },
      { key: 'barcodeVal', label: 'Takip Barkod No', type: 'barcode', defaultValue: 'TR984210049210' },
      { key: 'deliveryInstruction', label: 'Teslimat Talimatı', type: 'text', defaultValue: 'Güvenliğe veya yetkili kişiye imza karşılığı teslim ediniz.' }
    ],
    defaultData: {
      postalSymbol: 'P',
      toCompany: 'Acme Teknoloji Ltd. Şti.',
      toAddress: 'Büyükdere Cad. No:142 Kat:5 Şişli / İstanbul',
      headerTitle: 'PRIORITY EXPRESS CARGO',
      fromInfo: 'Termal Studio Depo - Kadıköy, İstanbul',
      lotNumber: 'LOT-9824',
      refNumber: 'REF-77104',
      shipDate: '26.08.2026',
      weight: '1.45 KG',
      itemNr: 'ITM-0089240',
      barcodeVal: 'TR984210049210',
      deliveryInstruction: 'Güvenliğe veya yetkili kişiye imza karşılığı teslim ediniz.'
    }
  },

  // 6. USPS EXPRESS MAIL VINTAGE POSTAL (Referans Görsel 6)
  {
    id: 'tpl-usps-express-vintage',
    title: 'Vintage Posta & Hızlı Gönderi Fişi',
    category: 'shipping',
    description: 'Büyük E harfi, posta ücret onay alanı, 2D barkod, alıcı bilgisi ve posta kontrol kutucukları.',
    tags: ['vintage', 'posta', 'ekspres', 'retro', 'kargo'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'symbol', label: 'Posta Harfi', type: 'text', defaultValue: 'E' },
      { key: 'postageHeader', label: 'Posta Ücret Başlığı', type: 'text', defaultValue: 'POSTA & HARÇ ÖDENDİ' },
      { key: 'postageDate', label: 'Tarih & Posta Kodu', type: 'text', defaultValue: 'AUG 26 2026  ZIP: 34710' },
      { key: 'rateZone', label: 'Tarife / Bölge', type: 'text', defaultValue: 'Express Bölge 1 - 500gr' },
      { key: 'expressTitle', label: 'Ekspres Başlık', type: 'text', defaultValue: 'ÖZEL HIZLI GÖNDERİ' },
      { key: 'postageInfo', label: 'Yetki Bilgisi', type: 'text', defaultValue: 'Termal Lojistik Dağıtım A.Ş. (0212) 555-0199' },
      { key: 'warningText', label: 'Uyarı Notu', type: 'text', defaultValue: 'HAFTA SONU VEYA TATİL GÜNÜ TESLİMATI YOKTUR' },
      { key: 'recipientName', label: 'Alıcı Adı', type: 'text', defaultValue: 'Canan Özdemir' },
      { key: 'recipientAddress', label: 'Alıcı Adresi', type: 'textarea', defaultValue: 'Bağdat Caddesi No:312 D:8 Kadıköy, İstanbul' },
      { key: 'barcodeVal', label: 'Kargo Takip Barkodu', type: 'barcode', defaultValue: 'EO 000 161 100 TR' }
    ],
    defaultData: {
      symbol: 'E',
      postageHeader: 'POSTA & HARÇ ÖDENDİ',
      postageDate: 'AUG 26 2026  ZIP: 34710',
      rateZone: 'Express Bölge 1 - 500gr',
      expressTitle: 'ÖZEL HIZLI GÖNDERİ',
      postageInfo: 'Termal Lojistik Dağıtım A.Ş. (0212) 555-0199',
      warningText: 'HAFTA SONU VEYA TATİL GÜNÜ TESLİMATI YOKTUR',
      recipientName: 'Canan Özdemir',
      recipientAddress: 'Bağdat Caddesi No:312 D:8 Kadıköy, İstanbul',
      barcodeVal: 'EO 000 161 100 TR'
    }
  },

  // 7. SPECIALTY COFFEE ROAST & TASTING NOTES (Kahve Kavurma Etiketi)
  {
    id: 'tpl-specialty-coffee',
    title: 'Nitelikli Kahve & Kavurucu Etiketi',
    category: 'product',
    description: 'Kahve kökeni, rakım, işleme yöntemi, tadım notları, kavrum profili ve QR menü.',
    tags: ['kahve', 'coffee', 'specialty', 'kavrum', 'tadım notları', 'qr'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'roasteryName', label: 'Kavurucu Adı', type: 'text', defaultValue: 'ROASTERY & COFFEE LAB' },
      { key: 'coffeeOrigin', label: 'Kahve Kökeni (Ülke / Bölge)', type: 'text', defaultValue: 'ETHIOPIA YIRGACHEFFE' },
      { key: 'processType', label: 'İşleme Yöntemi', type: 'text', defaultValue: 'WASHED / GRADE 1' },
      { key: 'altitude', label: 'Rakım (Elevation)', type: 'text', defaultValue: '1,950 - 2,150 MASL' },
      { key: 'roastLevel', label: 'Kavrum Profili', type: 'select', defaultValue: 'MEDIUM-LIGHT', options: ['LIGHT', 'MEDIUM-LIGHT', 'MEDIUM', 'DARK', 'OMNI-ROAST'] },
      { key: 'tastingNotes', label: 'Tadım Notaları (Tasting Notes)', type: 'text', defaultValue: 'Jasmine, Bergamot, Earl Grey, Peach' },
      { key: 'roastDate', label: 'Kavrum Tarihi', type: 'text', defaultValue: '26.08.2026' },
      { key: 'netWeight', label: 'Net Ağırlık', type: 'text', defaultValue: '250G' },
      { key: 'qrUrl', label: 'Demleme Rehberi / QR Link', type: 'qrcode', defaultValue: 'https://brewguide.coffee/ethiopia-yirgacheffe' }
    ],
    defaultData: {
      roasteryName: 'ROASTERY & COFFEE LAB',
      coffeeOrigin: 'ETHIOPIA YIRGACHEFFE',
      processType: 'WASHED / GRADE 1',
      altitude: '1,950 - 2,150 MASL',
      roastLevel: 'MEDIUM-LIGHT',
      tastingNotes: 'Jasmine, Bergamot, Earl Grey, Peach',
      roastDate: '26.08.2026',
      netWeight: '250G',
      qrUrl: 'https://brewguide.coffee/ethiopia-yirgacheffe'
    }
  },

  // 8. LUXURY SOY CANDLE & SAFETY WARNING (Mum & Koku Etiketi)
  {
    id: 'tpl-soy-candle',
    title: 'Soya Mum & Ortam Kokusu Etiketi',
    category: 'product',
    description: 'Lüks soya mumu, koku piramidi, yanma süresi ve alt güvenlik piktogramları.',
    tags: ['mum', 'koku', 'soya', 'dekor', 'güvenlik', 'lüks'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'brandTitle', label: 'Marka Adı', type: 'text', defaultValue: 'LUMEN ATELIER' },
      { key: 'scentName', label: 'Koku Adı', type: 'text', defaultValue: 'AMBER & OAKMOSS' },
      { key: 'subtitle', label: 'Açıklama / Tip', type: 'text', defaultValue: 'Hand-Poured Soy Wax Candle' },
      { key: 'burnTime', label: 'Ortalama Yanma Süresi', type: 'text', defaultValue: '45+ HOURS BURN TIME' },
      { key: 'scentNotes', label: 'Koku Notaları', type: 'textarea', defaultValue: 'Top: Sage, Orange | Heart: Amber, Lavender | Base: Oakmoss, Tonka' },
      { key: 'safetyText', label: 'Güvenlik Talimatı', type: 'textarea', defaultValue: 'İlk kullanımda yüzey tamamen eriyene kadar yakın. Fitili her yakışta 5mm kesin. Yanıcı maddelerden uzak tutun.' },
      { key: 'netVolume', label: 'Hacim / Gramaj', type: 'text', defaultValue: '220g / 7.7 oz' }
    ],
    defaultData: {
      brandTitle: 'LUMEN ATELIER',
      scentName: 'AMBER & OAKMOSS',
      subtitle: 'Hand-Poured Soy Wax Candle',
      burnTime: '45+ HOURS BURN TIME',
      scentNotes: 'Top: Sage, Orange | Heart: Amber, Lavender | Base: Oakmoss, Tonka',
      safetyText: 'İlk kullanımda yüzey tamamen eriyene kadar yakın. Fitili her yakışta 5mm kesin. Yanıcı maddelerden uzak tutun.',
      netVolume: '220g / 7.7 oz'
    }
  },

  // 9. KAFE & RESTORAN SİPARİŞ FİŞİ (POS Receipt)
  {
    id: 'tpl-cafe-receipt',
    title: 'Kafe & Restoran Sipariş & Satış Fişi',
    category: 'receipt',
    description: 'Masa no, sipariş saati, ürün kalemleri, ara toplam, KDV, WiFi şifresi ve QR hesap kodu.',
    tags: ['fiş', 'kafe', 'pos', 'restoran', 'adisyon', 'hesap', 'wifi'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'cafeName', label: 'İşletme Adı', type: 'text', defaultValue: 'NOOK ARTISAN CAFE & BAKERY' },
      { key: 'address', label: 'Adres & Tel', type: 'text', defaultValue: 'Moda Cad. No:84 Kadıköy | Tel: 0216 345 00 22' },
      { key: 'orderNo', label: 'Sipariş No', type: 'text', defaultValue: '#A-142' },
      { key: 'tableNo', label: 'Masa / Paket', type: 'text', defaultValue: 'Masa 7 (Bahçe)' },
      { key: 'dateTime', label: 'Tarih & Saat', type: 'text', defaultValue: '26.08.2026  14:35:12' },
      { key: 'items', label: 'Sipariş Kalemleri', type: 'textarea', defaultValue: '2x Flat White (Yulaf Sütü) - ₺240.00\n1x San Sebastian Cheesecake - ₺190.00\n1x Kruvasan Sandviç (Somon) - ₺260.00\n1x Filtre Kahve (Büyük) - ₺110.00' },
      { key: 'subtotal', label: 'Ara Toplam', type: 'text', defaultValue: '₺800.00' },
      { key: 'tax', label: 'KDV (%10)', type: 'text', defaultValue: '₺80.00' },
      { key: 'total', label: 'ÖDENECEK TOPLAM', type: 'text', defaultValue: '₺800.00' },
      { key: 'wifiInfo', label: 'WiFi Bilgisi', type: 'text', defaultValue: 'WiFi: NookCafe_Guest | Şifre: espresso2026' },
      { key: 'footerMessage', label: 'Fiş Alt Mesajı', type: 'text', defaultValue: 'Afiyet olsun! Bizi tercih ettiğiniz için teşekkürler.' },
      { key: 'qrPayUrl', label: 'E-Fiş / Bahşiş QR Kodu', type: 'qrcode', defaultValue: 'https://nookcafe.menu/receipt/A142' }
    ],
    defaultData: {
      cafeName: 'NOOK ARTISAN CAFE & BAKERY',
      address: 'Moda Cad. No:84 Kadıköy | Tel: 0216 345 00 22',
      orderNo: '#A-142',
      tableNo: 'Masa 7 (Bahçe)',
      dateTime: '26.08.2026  14:35:12',
      items: '2x Flat White (Yulaf Sütü) - ₺240.00\n1x San Sebastian Cheesecake - ₺190.00\n1x Kruvasan Sandviç (Somon) - ₺260.00\n1x Filtre Kahve (Büyük) - ₺110.00',
      subtotal: '₺800.00',
      tax: '₺80.00',
      total: '₺800.00',
      wifiInfo: 'WiFi: NookCafe_Guest | Şifre: espresso2026',
      footerMessage: 'Afiyet olsun! Bizi tercih ettiğiniz için teşekkürler.',
      qrPayUrl: 'https://nookcafe.menu/receipt/A142'
    }
  },

  // 10. BUTİK MAĞAZA SATIŞ FİŞİ & BARKODLU İADE FİŞİ
  {
    id: 'tpl-retail-sales-slip',
    title: 'Butik Mağaza Satış & İade Fişi',
    category: 'receipt',
    description: 'Giyim, aksesuar ve perakende mağazaları için barkodlu, iade politikası içeren satış fişi.',
    tags: ['mağaza', 'satış', 'fiş', 'perakende', 'iade', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'storeName', label: 'Mağaza Adı', type: 'text', defaultValue: 'ATELIER CONCEPT STORE' },
      { key: 'taxNo', label: 'Vergi Dairesi / VKN', type: 'text', defaultValue: 'Kadıköy V.D. - 1092837465' },
      { key: 'receiptNo', label: 'Fiş No', type: 'text', defaultValue: 'FİŞ NO: 2026/89401' },
      { key: 'cashier', label: 'Kasiyer', type: 'text', defaultValue: 'Kasa: 01 / Melis K.' },
      { key: 'itemsList', label: 'Satılan Ürünler', type: 'textarea', defaultValue: '1x Keten Gömlek (Bej / M) - ₺1,450.00\n1x Deri Kartlık (Taba) - ₺650.00\n1x Organik Mum 200g - ₺380.00' },
      { key: 'discount', label: 'İndirim / Kampanya', type: 'text', defaultValue: '-₺248.00 (YAZ10)' },
      { key: 'totalAmount', label: 'TOPLAM TUTAR', type: 'text', defaultValue: '₺2,232.00' },
      { key: 'paymentMethod', label: 'Ödeme Türü', type: 'text', defaultValue: 'KREDİ KARTI (**** 4891)' },
      { key: 'returnPolicy', label: 'İade & Değişim Kuralı', type: 'textarea', defaultValue: '14 gün içinde fiş ve etiket ile mağazamızda değişim yapılabilir.' },
      { key: 'barcodeVal', label: 'İade / İşlem Barkodu', type: 'barcode', defaultValue: 'SLIP-89401-2026' }
    ],
    defaultData: {
      storeName: 'ATELIER CONCEPT STORE',
      taxNo: 'Kadıköy V.D. - 1092837465',
      receiptNo: 'FİŞ NO: 2026/89401',
      cashier: 'Kasa: 01 / Melis K.',
      itemsList: '1x Keten Gömlek (Bej / M) - ₺1,450.00\n1x Deri Kartlık (Taba) - ₺650.00\n1x Organik Mum 200g - ₺380.00',
      discount: '-₺248.00 (YAZ10)',
      totalAmount: '₺2,232.00',
      paymentMethod: 'KREDİ KARTI (**** 4891)',
      returnPolicy: '14 gün içinde fiş ve etiket ile mağazamızda değişim yapılabilir.',
      barcodeVal: 'SLIP-89401-2026'
    }
  },

  // 11. DEPO & RAF RAF BARKODU (Warehouse Bin Location)
  {
    id: 'tpl-warehouse-bin-barcode',
    title: 'Depo Raf & Lokasyon Barkodu (Bin Tag)',
    category: 'inventory',
    description: 'Büyük harfli raf/koridor lokasyon kodu, ürün SKU kodu, depo bölgesi ve QR kod.',
    tags: ['depo', 'raf', 'envanter', 'sku', 'stok', 'lojistik'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'warehouseName', label: 'Depo / Tesis', type: 'text', defaultValue: 'ANA LOJİSTİK MERKEZİ' },
      { key: 'zone', label: 'Bölge / Sektör', type: 'text', defaultValue: 'BÖLGE-C (AĞIR YÜK)' },
      { key: 'locationCode', label: 'Raf / Bin Lokasyon Kodu', type: 'text', defaultValue: 'C-04-B-12' },
      { key: 'productCategory', label: 'Kategori / Tanım', type: 'text', defaultValue: 'ELEKTRONİK MODÜLLER & KABLOLAR' },
      { key: 'skuCode', label: 'SKU / Ürün Kodu', type: 'text', defaultValue: 'SKU-ELK-90412' },
      { key: 'maxCapacity', label: 'Maks. Kapasite / Adet', type: 'text', defaultValue: 'KAPASİTE: 250 ADET' },
      { key: 'barcodeVal', label: 'Lokasyon Barkodu (Code128)', type: 'barcode', defaultValue: 'LOC-C04-B12' },
      { key: 'qrScanUrl', label: 'ERP / WMS QR Kodu', type: 'qrcode', defaultValue: 'wms://location/C-04-B-12' }
    ],
    defaultData: {
      warehouseName: 'ANA LOJİSTİK MERKEZİ',
      zone: 'BÖLGE-C (AĞIR YÜK)',
      locationCode: 'C-04-B-12',
      productCategory: 'ELEKTRONİK MODÜLLER & KABLOLAR',
      skuCode: 'SKU-ELK-90412',
      maxCapacity: 'KAPASİTE: 250 ADET',
      barcodeVal: 'LOC-C04-B12',
      qrScanUrl: 'wms://location/C-04-B-12'
    }
  },

  // 12. ENVANTER & DEMİRBAŞ TAKİP ETİKETİ (Asset Tag)
  {
    id: 'tpl-asset-inventory-tag',
    title: 'Şirket Demirbaş & Varlık Takip Etiketi',
    category: 'inventory',
    description: 'Demirbaş mülkiyet uyarısı, seri no, departman, QR kod ve takip barkodu.',
    tags: ['demirbaş', 'envanter', 'şirket', 'it', 'seri no', 'varlık'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'companyName', label: 'Mülkiyet Şirketi', type: 'text', defaultValue: 'ACME TEKNOLOJİ A.Ş.' },
      { key: 'warning', label: 'Mülkiyet Uyarısı', type: 'text', defaultValue: 'ŞİRKET DEMİRBAŞIDIR / İZİNSİZ TAŞINAMAZ' },
      { key: 'assetId', label: 'Demirbaş No (Asset ID)', type: 'text', defaultValue: 'AST-2026-8819' },
      { key: 'deviceType', label: 'Cihaz / Ekipman', type: 'text', defaultValue: 'MacBook Pro 16" M3 Max' },
      { key: 'serialNumber', label: 'Seri Numarası (S/N)', type: 'text', defaultValue: 'SN: C02G9X8KMD6R' },
      { key: 'department', label: 'Zimmet Departmanı', type: 'text', defaultValue: 'Yazılım & Ar-Ge Ekibi' },
      { key: 'assignDate', label: 'Kayıt / Zimmet Tarihi', type: 'text', defaultValue: '26.08.2026' },
      { key: 'barcodeVal', label: 'Demirbaş Barkodu', type: 'barcode', defaultValue: 'AST88192026' },
      { key: 'assetQr', label: 'IT Envanter QR', type: 'qrcode', defaultValue: 'https://it.acme.corp/asset/AST-2026-8819' }
    ],
    defaultData: {
      companyName: 'ACME TEKNOLOJİ A.Ş.',
      warning: 'ŞİRKET DEMİRBAŞIDIR / İZİNSİZ TAŞINAMAZ',
      assetId: 'AST-2026-8819',
      deviceType: 'MacBook Pro 16" M3 Max',
      serialNumber: 'SN: C02G9X8KMD6R',
      department: 'Yazılım & Ar-Ge Ekibi',
      assignDate: '26.08.2026',
      barcodeVal: 'AST88192026',
      assetQr: 'https://it.acme.corp/asset/AST-2026-8819'
    }
  },

  // 13. KIRILABİLİR / DİKKAT KARGO UYARISI (Fragile Warning)
  {
    id: 'tpl-fragile-heavy-warning',
    title: 'Kırılabilir Eşya & Ağır Paket Güvenlik Uyarısı',
    category: 'warning',
    description: 'Yüksek kontrastlı kırılabilir kadeh, şemsiye, dikkat ünlemi ve iki yön oku piktogramları.',
    tags: ['kırılabilir', 'uyarı', 'dikkat', 'kargo', 'güvenlik', 'sembol'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'mainWarning', label: 'Ana Uyarı Başlığı', type: 'text', defaultValue: 'DİKKAT / KIRILABİLİR' },
      { key: 'subWarning', label: 'İngilizce Uyarı Başlığı', type: 'text', defaultValue: 'FRAGILE - HANDLE WITH CARE' },
      { key: 'message', label: 'Kullanım & Taşıma Uyarısı', type: 'textarea', defaultValue: 'İçerisinde hassas cam ve elektronik malzeme bulunmaktadır. Düşürmeyiniz, fırlatmayınız, ıslatmayınız!' },
      { key: 'boxWeight', label: 'Paket Ağırlık Uyarısı', type: 'text', defaultValue: 'AĞIR PAKET (HEAVY 15+ KG)' },
      { key: 'showFragileIcons', label: 'Standart Lojistik Sembolleri', type: 'checkbox', defaultValue: true },
      { key: 'warningCode', label: 'Uyarı Referans Barkodu', type: 'barcode', defaultValue: 'FRAGILE-SEC-99' }
    ],
    defaultData: {
      mainWarning: 'DİKKAT / KIRILABİLİR',
      subWarning: 'FRAGILE - HANDLE WITH CARE',
      message: 'İçerisinde hassas cam ve elektronik malzeme bulunmaktadır. Düşürmeyiniz, fırlatmayınız, ıslatmayınız!',
      boxWeight: 'AĞIR PAKET (HEAVY 15+ KG)',
      showFragileIcons: true,
      warningCode: 'FRAGILE-SEC-99'
    }
  },

  // 14. DİK TUTUNUZ & BU YÖN YUKARI (This Side Up)
  {
    id: 'tpl-this-side-up-shipping',
    title: 'Bu Yön Yukarı & Dik Tutunuz Etiketi',
    category: 'warning',
    description: 'Dev çift yukarı ok sembolü, nemden koruyunuz ve yönlendirme ikaz etiketi.',
    tags: ['yön oku', 'dik tutunuz', 'this side up', 'kargo', 'uyarı'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'titleTr', label: 'Türkçe Yön Uyarısı', type: 'text', defaultValue: 'BU YÖN YUKARI' },
      { key: 'titleEn', label: 'İngilizce Yön Uyarısı', type: 'text', defaultValue: 'THIS SIDE UP' },
      { key: 'notice', label: 'Koli İstifleme Uyarısı', type: 'text', defaultValue: 'Maksimum 4 Koli Üst Üste İstiflenebilir' },
      { key: 'keepDry', label: 'Nem Uyarısı', type: 'text', defaultValue: 'KURU TUTUNUZ / KEEP DRY' }
    ],
    defaultData: {
      titleTr: 'BU YÖN YUKARI',
      titleEn: 'THIS SIDE UP',
      notice: 'Maksimum 4 Koli Üst Üste İstiflenebilir',
      keepDry: 'KURU TUTUNUZ / KEEP DRY'
    }
  },

  // 15. GÜNLÜK GÖREVLER & YAPILACAKLAR LİSTESİ (To-Do Checklist)
  {
    id: 'tpl-todo-checklist',
    title: 'Günlük Odak & Yapılacaklar Listesi (To-Do)',
    category: 'notes',
    description: '57mm termal ruloya basılabilir, kutucuklu günlük hedefler ve yapılacaklar listesi.',
    tags: ['todo', 'görev', 'not', 'ajanda', 'plan', 'kontrol'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'title', label: 'Liste Başlığı', type: 'text', defaultValue: 'TODAY’S FOCUS // GÜNLÜK HEDEFLER' },
      { key: 'date', label: 'Tarih / Gün', type: 'text', defaultValue: '26 Ağustos Çarşamba' },
      { key: 'tasks', label: 'Görevler (Her satıra bir görev)', type: 'textarea', defaultValue: 'Termal yazıcı şablonlarını tamamla\nKargo siparişlerini hazırla ve paketle\nE-postaları yanıtla ve faturaları kes\n30 dakika yürüyüş ve mola yap\nYarınki toplantı sunumunu hazırla\nKitap oku (20 sayfa)' },
      { key: 'priorityNote', label: 'Günün En Önemli 1 Önceliği', type: 'text', defaultValue: 'ÖNCELİK: Barkod şablon galerisini yayına al' },
      { key: 'footerQuote', label: 'Motivasyon Notu', type: 'text', defaultValue: 'Küçük adımlar, büyük sonuçlar doğurur.' }
    ],
    defaultData: {
      title: 'TODAY’S FOCUS // GÜNLÜK HEDEFLER',
      date: '26 Ağustos Çarşamba',
      tasks: 'Termal yazıcı şablonlarını tamamla\nKargo siparişlerini hazırla ve paketle\nE-postaları yanıtla ve faturaları kes\n30 dakika yürüyüş ve mola yap\nYarınki toplantı sunumunu hazırla\nKitap oku (20 sayfa)',
      priorityNote: 'ÖNCELİK: Barkod şablon galerisini yayına al',
      footerQuote: 'Küçük adımlar, büyük sonuçlar doğurur.'
    }
  },

  // 16. MİNİ HATIRLATICI & ALIŞVERİŞ LİSTESİ (Shopping Memo)
  {
    id: 'tpl-study-shopping-memo',
    title: 'Mini Alışveriş & Çalışma Notu',
    category: 'notes',
    description: 'Kategorize edilmiş alışveriş kalemleri, bütçe notu ve sevimli kontrol kutucukları.',
    tags: ['alışveriş', 'market', 'not', 'hatırlatıcı', 'liste'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'headerTitle', label: 'Başlık', type: 'text', defaultValue: 'MARKET & ALIŞVERİŞ LİSTESİ' },
      { key: 'category1', label: 'Grup 1 Başlığı', type: 'text', defaultValue: 'Taze Gıda & Sebze' },
      { key: 'items1', label: 'Grup 1 Kalemleri', type: 'textarea', defaultValue: 'Avokado (2 adet)\nDomates & Salatalık\nLimon & Taze Nane\nYulaf Sütü' },
      { key: 'category2', label: 'Grup 2 Başlığı', type: 'text', defaultValue: 'Kahve & İhtiyaçlar' },
      { key: 'items2', label: 'Grup 2 Kalemleri', type: 'textarea', defaultValue: 'Çekirdek Kahve (250g)\nFiltre Kağıdı (No:4)\nZeytinyağı' },
      { key: 'budgetNote', label: 'Bütçe / Hatırlatma Notu', type: 'text', defaultValue: 'Bütçe: ₺750 - Bez torbaları unutma!' }
    ],
    defaultData: {
      headerTitle: 'MARKET & ALIŞVERİŞ LİSTESİ',
      category1: 'Taze Gıda & Sebze',
      items1: 'Avokado (2 adet)\nDomates & Salatalık\nLimon & Taze Nane\nYulaf Sütü',
      category2: 'Kahve & İhtiyaçlar',
      items1_2: 'Çekirdek Kahve (250g)\nFiltre Kağıdı (No:4)\nZeytinyağı',
      budgetNote: 'Bütçe: ₺750 - Bez torbaları unutma!'
    }
  },

  // 17. BUT FIRST, COFFEE & KAFE TİPOGRAFİK ÇIKARTMASI
  {
    id: 'tpl-quote-coffee-sticker',
    title: 'Aesthetic Kahve & Tipografi Çıkartması',
    category: 'stickers',
    description: '"But First, Coffee" kalın retro fontlar, kahve çekirdeği ikonu ve eğlenceli barkod deseni.',
    tags: ['kahve', 'çıkartma', 'sticker', 'vintage', 'retro', 'quote'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'topLine', label: 'Üst Satır', type: 'text', defaultValue: 'BUT FIRST,' },
      { key: 'mainLine', label: 'Ana Kelime', type: 'text', defaultValue: 'COFFEE' },
      { key: 'bottomLine', label: 'Alt Açıklama', type: 'text', defaultValue: 'FUEL FOR CREATIVE MINDS' },
      { key: 'quoteBadge', label: 'Ek Rozet', type: 'text', defaultValue: '100% CAFFEINE & GOOD VIBES' },
      { key: 'barcodeVal', label: 'Estetik Barkod Metni', type: 'barcode', defaultValue: 'COFFEE-IS-LIFE-247' }
    ],
    defaultData: {
      topLine: 'BUT FIRST,',
      mainLine: 'COFFEE',
      bottomLine: 'FUEL FOR CREATIVE MINDS',
      quoteBadge: '100% CAFFEINE & GOOD VIBES',
      barcodeVal: 'COFFEE-IS-LIFE-247'
    }
  },

  // 18. TEŞEKKÜR EDERİZ UNBOXING KARTI (Thank You Small Business)
  {
    id: 'tpl-thank-you-order-card',
    title: 'Sipariş Teşekkür Kartı & Instagram QR',
    category: 'stickers',
    description: 'Küçük işletmeler için sipariş kutusu içi samimi teşekkür mesajı, sosyal medya ve hediye kuponu.',
    tags: ['teşekkür', 'unboxing', 'butik', 'e-ticaret', 'instagram', 'qr'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'title', label: 'Ana Başlık', type: 'text', defaultValue: 'THANK YOU!' },
      { key: 'subTitle', label: 'Alt Başlık', type: 'text', defaultValue: 'Siparişin Bize Ulaştı & Sevgiyle Hazırlandı' },
      { key: 'message', label: 'Samimi Teşekkür Mesajı', type: 'textarea', defaultValue: 'Küçük işletmemizi desteklediğin için çok teşekkür ederiz. Ürünlerimizi keyifle kullanmanı dileriz!' },
      { key: 'couponCode', label: 'Sonraki Alışveriş Kuponu', type: 'text', defaultValue: 'KOD: SEVGILE15 (%15 İndirim)' },
      { key: 'instagramHandle', label: 'Instagram Hesabı', type: 'text', defaultValue: '@atelier.studio' },
      { key: 'qrUrl', label: 'Instagram / Değerlendirme QR', type: 'qrcode', defaultValue: 'https://instagram.com/atelier.studio' }
    ],
    defaultData: {
      title: 'THANK YOU!',
      subTitle: 'Siparişin Bize Ulaştı & Sevgiyle Hazırlandı',
      message: 'Küçük işletmemizi desteklediğin için çok teşekkür ederiz. Ürünlerimizi keyifle kullanmanı dileriz!',
      couponCode: 'KOD: SEVGILE15 (%15 İndirim)',
      instagramHandle: '@atelier.studio',
      qrUrl: 'https://instagram.com/atelier.studio'
    }
  },

  // 19. GARANTİ & İADE GÜVENLİK MÜHRÜ (Security Seal)
  {
    id: 'tpl-warranty-security-seal',
    title: 'Garanti & İptal Güvenlik Mührü (Security Seal)',
    category: 'warning',
    description: 'Kutu açılış kilidi, "Açılırsa Garanti Geçersizdir" güvenlik şeridi ve seri no barkodu.',
    tags: ['güvenlik', 'mühür', 'garanti', 'security seal', 'kutu kilidi', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'sealTitle', label: 'Mühür Başlığı', type: 'text', defaultValue: 'SECURITY SEAL // GÜVENLİK MÜHRÜ' },
      { key: 'sealWarning', label: 'Güvenlik Uyarısı', type: 'text', defaultValue: 'DO NOT ACCEPT IF SEAL IS BROKEN OR TAMPERED' },
      { key: 'subNotice', label: 'Alt Açıklama', type: 'text', defaultValue: 'Mühür açıldığında veya yırtıldığında iade kabul edilmez.' },
      { key: 'serialBarcode', label: 'Güvenlik Seri Barkodu', type: 'barcode', defaultValue: 'SEC-SEAL-891048' }
    ],
    defaultData: {
      sealTitle: 'SECURITY SEAL // GÜVENLİK MÜHRÜ',
      sealWarning: 'DO NOT ACCEPT IF SEAL IS BROKEN OR TAMPERED',
      subNotice: 'Mühür açıldığında veya yırtıldığında iade kabul edilmez.',
      serialBarcode: 'SEC-SEAL-891048'
    }
  },

  // 20. İLAÇ / VİTAMİN GÜNLÜK DOZ TAKİPÇİSİ (Pill Schedule)
  {
    id: 'tpl-pill-dosage-tracker',
    title: 'İlaç & Vitamin Dozaj Takip Etiketi',
    category: 'notes',
    description: 'Sabah, öğle, akşam kutucukları, ilaç adı, doz miktarı ve hekim talimat alanı.',
    tags: ['ilaç', 'sağlık', 'vitamin', 'dozaj', 'takip', 'reçete'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'patientName', label: 'Hasta / Kişi Adı', type: 'text', defaultValue: 'Ahmet Yılmaz' },
      { key: 'medicationName', label: 'İlaç / Vitamin Adı', type: 'text', defaultValue: 'OMEGA-3 + D3 VİTAMİN KOMPLEKS' },
      { key: 'dosageInstruction', label: 'Kullanım Şekli & Doz', type: 'text', defaultValue: 'Günde 1 Kapsül - Yemeklerden sonra bol su ile' },
      { key: 'timeSlots', label: 'Zaman Dilimleri', type: 'text', defaultValue: '[X] SABAH  [ ] ÖĞLE  [ ] AKŞAM' },
      { key: 'startDate', label: 'Başlangıç Tarihi', type: 'text', defaultValue: '26.08.2026' },
      { key: 'doctorNote', label: 'Önemli Hatırlatma', type: 'text', defaultValue: 'Düzenli alınız. Çocukların erişemeyeceği yerde saklayınız.' },
      { key: 'rxBarcode', label: 'Reçete / Takip Kodu', type: 'barcode', defaultValue: 'MED-2026-9901' }
    ],
    defaultData: {
      patientName: 'Ahmet Yılmaz',
      medicationName: 'OMEGA-3 + D3 VİTAMİN KOMPLEKS',
      dosageInstruction: 'Günde 1 Kapsül - Yemeklerden sonra bol su ile',
      timeSlots: '[X] SABAH  [ ] ÖĞLE  [ ] AKŞAM',
      startDate: '26.08.2026',
      doctorNote: 'Düzenli alınız. Çocukların erişemeyeceği yerde saklayınız.',
      rxBarcode: 'MED-2026-9901'
    }
  },

  // 21. VINTAGE DRY CLEANERS TAG (Referans Görsel 1: Kuru Temizleme & Çamaşırhane Fişi)
  {
    id: 'tpl-vintage-dry-cleaners',
    title: 'Vintage Kuru Temizleme & Giysi Fişi (Nº 4072)',
    category: 'receipt',
    description: 'Parisian retro stil, gün seçim kutusu, giysi adet/tutar çizelgesi, QR kod ve etiket delik simülasyonu.',
    tags: ['kuru temizleme', 'çamaşırhane', 'vintage', 'giysi', 'paris', 'fiş', 'retro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'shopLogo', label: 'Oval Logo / Marka', type: 'text', defaultValue: 'HARRY FAMILY' },
      { key: 'ticketNo', label: 'Fiş / Bilet No', type: 'text', defaultValue: 'Nº 4072' },
      { key: 'mainTitle', label: 'Ana Hizmet Başlığı', type: 'text', defaultValue: 'DRY CLEANERS' },
      { key: 'addressLine', label: 'Adres & Şehir', type: 'text', defaultValue: '72 RUE DU FAUBOURG SAINT-DENIS, 75010 PARIS' },
      { key: 'customerName', label: 'Müşteri Adı', type: 'text', defaultValue: 'JEAN-LUC GODARD' },
      { key: 'customerAddress', label: 'Müşteri Adresi / Telefon', type: 'text', defaultValue: '+33 1 42 68 55 00' },
      { key: 'selectedDay', label: 'Teslim Günü', type: 'select', options: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], defaultValue: 'THU' },
      { key: 'item1Desc', label: '1. Ürün Adı & Adet', type: 'text', defaultValue: 'COAT' },
      { key: 'item1Checked', label: '1. Ürün Seçili mi?', type: 'checkbox', defaultValue: false },
      { key: 'item2Desc', label: '2. Ürün Adı & Adet', type: 'text', defaultValue: 'PANTS' },
      { key: 'item2Checked', label: '2. Ürün Seçili mi?', type: 'checkbox', defaultValue: true },
      { key: 'item3Desc', label: '3. Ürün Adı & Adet', type: 'text', defaultValue: 'DRESS' },
      { key: 'item3Checked', label: '3. Ürün Seçili mi?', type: 'checkbox', defaultValue: false },
      { key: 'item4Desc', label: '4. Ürün Adı & Adet', type: 'text', defaultValue: 'SHIRT (3x)' },
      { key: 'item4Checked', label: '4. Ürün Seçili mi?', type: 'checkbox', defaultValue: true },
      { key: 'totalAmount', label: 'Toplam Tutar', type: 'text', defaultValue: '48.50 €' },
      { key: 'legalNotice', label: 'Yasal Sorumluluk Notu', type: 'text', defaultValue: 'NOT RESPONSIBLE FOR ARTICLES LEFT OVER 30 DAYS.' },
      { key: 'qrData', label: 'QR Takip / Web Bağlantısı', type: 'qrcode', defaultValue: 'https://harrydrycleaners.paris/order/4072' }
    ],
    defaultData: {
      shopLogo: 'HARRY FAMILY',
      ticketNo: 'Nº 4072',
      mainTitle: 'DRY CLEANERS',
      addressLine: '72 RUE DU FAUBOURG SAINT-DENIS, 75010 PARIS',
      customerName: 'JEAN-LUC GODARD',
      customerAddress: '+33 1 42 68 55 00',
      selectedDay: 'THU',
      item1Desc: 'COAT',
      item1Checked: false,
      item2Desc: 'PANTS',
      item2Checked: true,
      item3Desc: 'DRESS',
      item3Checked: false,
      item4Desc: 'SHIRT (3x)',
      item4Checked: true,
      totalAmount: '48.50 €',
      legalNotice: 'NOT RESPONSIBLE FOR ARTICLES LEFT OVER 30 DAYS.',
      qrData: 'https://harrydrycleaners.paris/order/4072'
    }
  },

  // 22. TEKSTİL BAKIM & BEDEN ETİKETİ (Referans Görsel 2: Apparel Care & Size Grid)
  {
    id: 'tpl-apparel-care-label',
    title: 'Tekstil Beden & ISO Yıkama Talimatı Etiketi',
    category: 'product',
    description: 'Beden kutusu, uluslararası 4 ISO yıkama ikonu, kumaş karışım sütunu ve marka web alanı.',
    tags: ['tekstil', 'giyim', 'yıkama talimatı', 'beden', 'kumaş', 'care label', 'minimalist'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'brandName', label: 'Marka Adı', type: 'text', defaultValue: 'ATELIER STUDIO' },
      { key: 'brandSub', label: 'Marka Alt Başlığı', type: 'text', defaultValue: 'DESIGN & CO.' },
      { key: 'apparelSize', label: 'Beden (Size)', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OVERSIZE'], defaultValue: 'XS' },
      { key: 'washCare1', label: '1. Yıkama Kuralı', type: 'text', defaultValue: 'WASH COLD (30°C)' },
      { key: 'washCare2', label: '2. Ağartıcı Kuralı', type: 'text', defaultValue: 'DO NOT BLEACH' },
      { key: 'washCare3', label: '3. Kurutma Kuralı', type: 'text', defaultValue: 'TUMBLE DRY LOW' },
      { key: 'washCare4', label: '4. Ütü Kuralı', type: 'text', defaultValue: 'DO NOT IRON' },
      { key: 'fabricComp', label: 'Kumaş İçeriği', type: 'text', defaultValue: '35% COTTON • 65% POLYESTER' },
      { key: 'website', label: 'Web Sitesi / Sosyal Medya', type: 'text', defaultValue: 'www.YourWebsite.com' }
    ],
    defaultData: {
      brandName: 'ATELIER STUDIO',
      brandSub: 'DESIGN & CO.',
      apparelSize: 'XS',
      washCare1: 'WASH COLD (30°C)',
      washCare2: 'DO NOT BLEACH',
      washCare3: 'TUMBLE DRY LOW',
      washCare4: 'DO NOT IRON',
      fabricComp: '35% COTTON • 65% POLYESTER',
      website: 'www.YourWebsite.com'
    }
  },

  // 23. WEST TENTH DENIM VINTAGE AMERICANA FİŞİ (Referans Görsel 4)
  {
    id: 'tpl-west-tenth-denim',
    title: 'West Tenth Vintage Denim Americana Fişi',
    category: 'receipt',
    description: 'Americana vintage tipografi, fırça kaligrafi logosu, noktalı ürün listesi, barkod ve Thank You damgası.',
    tags: ['denim', 'vintage', 'amerikan', 'fiş', 'butik', 'moda', 'receipt', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'receiptNo', label: 'Fiş Numarası', type: 'text', defaultValue: 'No. 001256' },
      { key: 'brandTitle', label: 'Marka Ana Adı (Script)', type: 'text', defaultValue: 'West Tenth' },
      { key: 'brandCategory', label: 'Kategori / Alt Yazı', type: 'text', defaultValue: 'DENIM' },
      { key: 'motto', label: 'Slogan / Motto', type: 'text', defaultValue: '/Embrace the Heritage, Wear the Legend/' },
      { key: 'dateTime', label: 'Tarih & Saat', type: 'text', defaultValue: 'DATE: 03/10 2024 11.26' },
      { key: 'item1Name', label: '1. Ürün', type: 'text', defaultValue: 'Vintage Denim Bucket Hats Upcycled Levi\'s' },
      { key: 'item1Price', label: '1. Ürün Fiyatı', type: 'text', defaultValue: '60$' },
      { key: 'item2Name', label: '2. Ürün', type: 'text', defaultValue: 'Iron Heart 777S-18 Vintage Denim Jeans' },
      { key: 'item2Price', label: '2. Ürün Fiyatı', type: 'text', defaultValue: '365$' },
      { key: 'item3Name', label: '3. Ürün', type: 'text', defaultValue: 'Mister Freedom Dude Rancher - Indigo Corduroy' },
      { key: 'item3Price', label: '3. Ürün Fiyatı', type: 'text', defaultValue: '370$' },
      { key: 'totalAmount', label: 'Toplam Tutar', type: 'text', defaultValue: '795$' },
      { key: 'barcodeVal', label: 'Kasa Barkodu', type: 'barcode', defaultValue: 'WT-DENIM-001256' },
      { key: 'thankYouNote', label: 'Teşekkür Damgası', type: 'text', defaultValue: 'Thank You!' },
      { key: 'phone', label: 'İletişim Telefonu', type: 'text', defaultValue: 'tel: 730 355 442' },
      { key: 'socialTag', label: 'Mağaza İsmi / Instagram', type: 'text', defaultValue: 'WESTTENTHDENIM' }
    ],
    defaultData: {
      receiptNo: 'No. 001256',
      brandTitle: 'West Tenth',
      brandCategory: 'DENIM',
      motto: '/Embrace the Heritage, Wear the Legend/',
      dateTime: 'DATE: 03/10 2024 11.26',
      item1Name: 'Vintage Denim Bucket Hats Upcycled Levi\'s',
      item1Price: '60$',
      item2Name: 'Iron Heart 777S-18 Vintage Denim Jeans',
      item2Price: '365$',
      item3Name: 'Mister Freedom Dude Rancher - Indigo Corduroy',
      item3Price: '370$',
      totalAmount: '795$',
      barcodeVal: 'WT-DENIM-001256',
      thankYouNote: 'Thank You!',
      phone: 'tel: 730 355 442',
      socialTag: 'WESTTENTHDENIM'
    }
  },

  // 24. HUNTINGTON PROGRESSIVE DINNER VINTAGE BİLET (Referans Görsel 5)
  {
    id: 'tpl-vintage-dinner-ticket',
    title: 'Vintage Gastronomi & Etkinlik Bileti (Save The Date)',
    category: 'stickers',
    description: 'Delikli tırtıklı bilet kenarları, klasik çatal motifi, mühür damgası, tarih takvimi ve mekan bilet gişesi.',
    tags: ['bilet', 'etkinlik', 'vintage', 'akşam yemeği', 'gastronomi', 'save the date', 'retro'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'topBorderText', label: 'Üst/Alt Bordür Metni', type: 'text', defaultValue: '• SAVE THE DATE • SAVE THE DATE •' },
      { key: 'presenterText', label: 'Sunan Organizasyon', type: 'text', defaultValue: 'DOWNTOWN HUNTINGTON PARTNERS present' },
      { key: 'eventMainScript', label: 'Etkinlik Ana Adı (Script)', type: 'text', defaultValue: 'Huntington\'s' },
      { key: 'eventSubTitle', label: 'Etkinlik Alt Başlığı', type: 'text', defaultValue: 'PROGRESSIVE DINNER' },
      { key: 'eventFeature', label: 'Öne Çıkan Özellik', type: 'text', defaultValue: 'featuring LOCAL RESTAURANTS' },
      { key: 'menuType', label: 'Menü Tipi', type: 'text', defaultValue: 'PRIX FIXE, 4 COURSE MENU' },
      { key: 'menuSub', label: 'Menü Açıklaması', type: 'text', defaultValue: 'Dine at a New Restaurant Each Course' },
      { key: 'eventDay', label: 'Etkinlik Günü', type: 'text', defaultValue: 'Thursday' },
      { key: 'eventDate', label: 'Büyük Tarih', type: 'text', defaultValue: 'SEPT 19TH' },
      { key: 'calloutBadge', label: 'Uyarı Rozeti', type: 'text', defaultValue: 'tickets sell-out fast!' },
      { key: 'ticketPrice', label: 'Kişi Başı Bilet Fiyatı', type: 'text', defaultValue: '$40 PER PERSON' },
      { key: 'location1', label: '1. Satış Noktası', type: 'text', defaultValue: "ADELL'S ANTIQUES • 926 4th Ave" },
      { key: 'location2', label: '2. Satış Noktası', type: 'text', defaultValue: 'MUG & PIA • 939 3rd Ave' }
    ],
    defaultData: {
      topBorderText: '• SAVE THE DATE • SAVE THE DATE •',
      presenterText: 'DOWNTOWN HUNTINGTON PARTNERS present',
      eventMainScript: "Huntington's",
      eventSubTitle: 'PROGRESSIVE DINNER',
      eventFeature: 'featuring LOCAL RESTAURANTS',
      menuType: 'PRIX FIXE, 4 COURSE MENU',
      menuSub: 'Dine at a New Restaurant Each Course',
      eventDay: 'Thursday',
      eventDate: 'SEPT 19TH',
      calloutBadge: 'tickets sell-out fast!',
      ticketPrice: '$40 PER PERSON',
      location1: "ADELL'S ANTIQUES • 926 4th Ave",
      location2: 'MUG & PIA • 939 3rd Ave'
    }
  },

  // 25. FRAGILE HEAVY-DUTY KARGO GÜVENLİK ETİKETİ (Referans Görsel 6)
  {
    id: 'tpl-fragile-heavy-duty',
    title: 'Ağır Hizmet Kırılabilir Kargo & Lojistik Etiketi',
    category: 'warning',
    description: 'Geniş kırık kadeh piktogramı, 4 uluslararası kargo güvenlik ikonu (Kırılabilir, Kuru Tut, Basma, Yukarı) ve uyarılar.',
    tags: ['kırılabilir', 'fragile', 'lojistik', 'kargo', 'güvenlik', 'paketleme', 'uyarı', '100mm'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'headline', label: 'Ana Uyarı Başlığı', type: 'text', defaultValue: 'FRAGILE' },
      { key: 'subWarning1', label: '1. Taşıma Uyarısı', type: 'text', defaultValue: 'HANDLE WITH CARE' },
      { key: 'subWarning2', label: '2. Basınç / Düşme Uyarısı', type: 'text', defaultValue: "DON'T FALL • NOT PRESSURE" },
      { key: 'showIconFragile', label: '1. İkon: Kırılabilir Kadeh', type: 'checkbox', defaultValue: true },
      { key: 'showIconKeepDry', label: '2. İkon: Şemsiye & Kuru Tut', type: 'checkbox', defaultValue: true },
      { key: 'showIconTrample', label: '3. İkon: Ayakla Basılmaz', type: 'checkbox', defaultValue: true },
      { key: 'showIconUpward', label: '4. İkon: İki Yukarı Ok', type: 'checkbox', defaultValue: true },
      { key: 'trackingBarcode', label: 'Lojistik Takip Barkodu', type: 'barcode', defaultValue: 'EXP-FRG-984021' }
    ],
    defaultData: {
      headline: 'FRAGILE',
      subWarning1: 'HANDLE WITH CARE',
      subWarning2: "DON'T FALL • NOT PRESSURE",
      showIconFragile: true,
      showIconKeepDry: true,
      showIconTrample: true,
      showIconUpward: true,
      trackingBarcode: 'EXP-FRG-984021'
    }
  },

  // 26. SPECIALTY COFFEE ROASTERY BAG LABEL
  {
    id: 'tpl-specialty-coffee-bag',
    title: 'Specialty Nitelikli Kahve Kavurma Paketi',
    category: 'product',
    description: 'Menşei, rakım, işleme yöntemi, tadım notaları ve kavurma tarihi içeren artisan kahve paketi etiketi.',
    tags: ['kahve', 'roastery', 'specialty coffee', 'artisan', 'barista', 'tadım notası', 'etiket'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'roasteryName', label: 'Kavurma Evi / Marka', type: 'text', defaultValue: 'ROAST & ORIGIN' },
      { key: 'coffeeOrigin', label: 'Menşei / Ülke & Bölge', type: 'text', defaultValue: 'ETHIOPIA YIRGACHEFFE' },
      { key: 'varietyAltitude', label: 'Varyete & Rakım', type: 'text', defaultValue: 'HEIRLOOM • 1950 - 2150M' },
      { key: 'processType', label: 'İşleme Yöntemi', type: 'select', options: ['NATURAL', 'WASHED', 'HONEY', 'ANAEROBIC'], defaultValue: 'NATURAL' },
      { key: 'tastingNotes', label: 'Tadım Notaları', type: 'text', defaultValue: 'BERGAMOT • JASMINE • DRIED PEACH' },
      { key: 'roastProfile', label: 'Kavurma Derecesi', type: 'select', options: ['LIGHT ROAST', 'MEDIUM-LIGHT', 'MEDIUM', 'OMNI-ROAST'], defaultValue: 'LIGHT ROAST' },
      { key: 'roastDate', label: 'Kavurma Tarihi', type: 'date', defaultValue: '2026-08-25' },
      { key: 'netWeight', label: 'Net Ağırlık', type: 'text', defaultValue: '250G / 8.8 OZ' },
      { key: 'qrTrace', label: 'Çiftlik Hikayesi QR', type: 'qrcode', defaultValue: 'https://roastandorigin.coffee/beans/yirgacheffe-g1' }
    ],
    defaultData: {
      roasteryName: 'ROAST & ORIGIN',
      coffeeOrigin: 'ETHIOPIA YIRGACHEFFE',
      varietyAltitude: 'HEIRLOOM • 1950 - 2150M',
      processType: 'NATURAL',
      tastingNotes: 'BERGAMOT • JASMINE • DRIED PEACH',
      roastProfile: 'LIGHT ROAST',
      roastDate: '2026-08-25',
      netWeight: '250G / 8.8 OZ',
      qrTrace: 'https://roastandorigin.coffee/beans/yirgacheffe-g1'
    }
  },

  // 27. MODERN MINIMALIST BOARDING PASS
  {
    id: 'tpl-airline-boarding-pass',
    title: 'Modern Minimalist Uçak Biniş Kartı (Boarding Pass)',
    category: 'stickers',
    description: 'Kalkış/Varış IATA kodları, koltuk, kapı, biniş saati ve yoğun güvenlik barkodlu uçuş kartı.',
    tags: ['biniş kartı', 'uçuş', 'havalimanı', 'boarding pass', 'seyahat', 'bilet', 'barkod'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'airlineName', label: 'Havayolu Şirketi', type: 'text', defaultValue: 'AERO EXPRESS' },
      { key: 'passengerName', label: 'Yolcu Adı', type: 'text', defaultValue: 'CAN YILMAZ / MR' },
      { key: 'flightNo', label: 'Uçuş No', type: 'text', defaultValue: 'TK 1984' },
      { key: 'fromCode', label: 'Kalkış IATA', type: 'text', defaultValue: 'IST' },
      { key: 'fromCity', label: 'Kalkış Şehir', type: 'text', defaultValue: 'ISTANBUL' },
      { key: 'toCode', label: 'Varış IATA', type: 'text', defaultValue: 'LHR' },
      { key: 'toCity', label: 'Varış Şehir', type: 'text', defaultValue: 'LONDON' },
      { key: 'seatNo', label: 'Koltuk No', type: 'text', defaultValue: '14A' },
      { key: 'gateNo', label: 'Kapı (Gate)', type: 'text', defaultValue: 'B-12' },
      { key: 'boardTime', label: 'Biniş Saati', type: 'text', defaultValue: '08:45' },
      { key: 'flightClass', label: 'Sınıf / Grup', type: 'text', defaultValue: 'PRIORITY / GRP 1' },
      { key: 'barcodeVal', label: 'Biniş Kartı Barkodu', type: 'barcode', defaultValue: 'M1YILMAZ/CAN ETK1984ISTLHR' }
    ],
    defaultData: {
      airlineName: 'AERO EXPRESS',
      passengerName: 'CAN YILMAZ / MR',
      flightNo: 'TK 1984',
      fromCode: 'IST',
      fromCity: 'ISTANBUL',
      toCode: 'LHR',
      toCity: 'LONDON',
      seatNo: '14A',
      gateNo: 'B-12',
      boardTime: '08:45',
      flightClass: 'PRIORITY / GRP 1',
      barcodeVal: 'M1YILMAZ/CAN ETK1984ISTLHR'
    }
  },

  // 28. CINEMA & FILM FESTIVAL RETRO TICKET
  {
    id: 'tpl-cinema-festival-ticket',
    title: 'Retro Sinema & Bağımsız Film Festivali Bileti',
    category: 'stickers',
    description: 'Tırtıklı kenar simülasyonu, salon/sıra/koltuk, film süresi, klaket simgesi ve gişe barkodu.',
    tags: ['sinema', 'film', 'festival', 'bilet', 'retro', 'etkinlik', 'gece'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'cinemaName', label: 'Sinema / Festival Adı', type: 'text', defaultValue: 'CINEMA MAJESTIC' },
      { key: 'movieTitle', label: 'Film Adı', type: 'text', defaultValue: 'OPPENHEIMER (70MM)' },
      { key: 'hallName', label: 'Salon', type: 'text', defaultValue: 'SALON 1 (IMAX)' },
      { key: 'sessionTime', label: 'Tarih & Seans', type: 'text', defaultValue: '27 AĞU • 21:15' },
      { key: 'rowSeat', label: 'Sıra & Koltuk', type: 'text', defaultValue: 'SIRA: F • NO: 18' },
      { key: 'ticketType', label: 'Bilet Tipi', type: 'text', defaultValue: 'TAM / ADULT • 160 ₺' },
      { key: 'barcodeTicket', label: 'Turnike Barkodu', type: 'barcode', defaultValue: 'MAJ-2026-0914' }
    ],
    defaultData: {
      cinemaName: 'CINEMA MAJESTIC',
      movieTitle: 'OPPENHEIMER (70MM)',
      hallName: 'SALON 1 (IMAX)',
      sessionTime: '27 AĞU • 21:15',
      rowSeat: 'SIRA: F • NO: 18',
      ticketType: 'TAM / ADULT • 160 ₺',
      barcodeTicket: 'MAJ-2026-0914'
    }
  },

  // 29. ARTISAN BAKERY & SOURDOUGH BREAD DAILY TAG
  {
    id: 'tpl-artisan-sourdough',
    title: 'Artisan Ekşi Mayalı Ekmek & Fırın Etiketi',
    category: 'product',
    description: 'Taş fırından çıkış saati, mayalanma süresi (%100 ekşi maya), un çeşitleri ve fırıncı mührü.',
    tags: ['ekmek', 'fırın', 'ekşi maya', 'artisan', 'gıda', 'un', 'taş fırın'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'bakeryName', label: 'Fırın Adı', type: 'text', defaultValue: 'MAYA & TAŞ FIRIN' },
      { key: 'breadName', label: 'Ekmek Çeşidi', type: 'text', defaultValue: 'KÖY EKŞİ MAYALI' },
      { key: 'flourType', label: 'Kullanılan Un', type: 'text', defaultValue: '%100 Taş Değirmen Siyez & Çavdar' },
      { key: 'fermentation', label: 'Mayalanma & Fermantasyon', type: 'text', defaultValue: '36 SAAT SOĞUK FERMANTASYON' },
      { key: 'bakeTime', label: 'Fırından Çıkış', type: 'text', defaultValue: 'BUGÜN 07:30' },
      { key: 'weightPrice', label: 'Gramaj & Fiyat', type: 'text', defaultValue: '850 GR • 95 ₺' },
      { key: 'naturalBadge', label: 'Katkısız / Koruyucusuz Notu', type: 'text', defaultValue: 'SADECE UN, SU, TUZ VE EKŞİ MAYA' }
    ],
    defaultData: {
      bakeryName: 'MAYA & TAŞ FIRIN',
      breadName: 'KÖY EKŞİ MAYALI',
      flourType: '%100 Taş Değirmen Siyez & Çavdar',
      fermentation: '36 SAAT SOĞUK FERMANTASYON',
      bakeTime: 'BUGÜN 07:30',
      weightPrice: '850 GR • 95 ₺',
      naturalBadge: 'SADECE UN, SU, TUZ VE EKŞİ MAYA'
    }
  },

  // 30. WINE BOTTLE VINTAGE CELLAR TAG
  {
    id: 'tpl-wine-cellar-tag',
    title: 'Vintage Şarap Mahzeni & Şişe Boyun Etiketi',
    category: 'product',
    description: 'Mahzen rekolte yılı, üzüm çeşidi, fıçı numarası, sınırlı şişe numarası ve sommelier notu.',
    tags: ['şarap', 'mahzen', 'vintage', 'rekolte', 'butik', 'gurme', 'şişe etiketi'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'estateName', label: 'Bağ / Mahzen Adı', type: 'text', defaultValue: 'CHÂTEAU DE RÉCOLTE' },
      { key: 'wineVintage', label: 'Rekolte Yılı', type: 'text', defaultValue: 'REKOLTE 2019' },
      { key: 'grapeVariety', label: 'Üzüm Çeşidi', type: 'text', defaultValue: 'CABERNET SAUVIGNON & MERLOT' },
      { key: 'barrelAging', label: 'Meşe Fıçı Süresi', type: 'text', defaultValue: '18 AY FRANSIZ MEŞE FIÇI' },
      { key: 'alcoholVol', label: 'Alkol Oranı', type: 'text', defaultValue: '%14.5 VOL • 750 ML' },
      { key: 'bottleNo', label: 'Şişe Numarası', type: 'text', defaultValue: 'ŞİŞE NO: 0284 / 1200' },
      { key: 'servingTemp', label: 'Tavsiye Servis Sıcaklığı', type: 'text', defaultValue: 'İDEAL SERVİS: 16-18°C' }
    ],
    defaultData: {
      estateName: 'CHÂTEAU DE RÉCOLTE',
      wineVintage: 'REKOLTE 2019',
      grapeVariety: 'CABERNET SAUVIGNON & MERLOT',
      barrelAging: '18 AY FRANSIZ MEŞE FIÇI',
      alcoholVol: '%14.5 VOL • 750 ML',
      bottleNo: 'ŞİŞE NO: 0284 / 1200',
      servingTemp: 'İDEAL SERVİS: 16-18°C'
    }
  },

  // 31. APOTHECARY HERBAL CANDLE & ESSENTIAL OIL
  {
    id: 'tpl-apothecary-candle',
    title: 'Apothecary Doğal Soya Mumu & Aromaterapi Etiketi',
    category: 'product',
    description: 'Uçucu yağ esansları, yanma süresi, botanik çerçeve ve mum güvenlik kullanım kuralları.',
    tags: ['mum', 'aromaterapi', 'soya mumu', 'apothecary', 'botanik', 'esans', 'organik'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'candleTitle', label: 'Koku / Aroma Adı', type: 'text', defaultValue: 'LAVENDER & CEDARWOOD' },
      { key: 'subCategory', label: 'Ürün Tanımı', type: 'text', defaultValue: 'HAND POURED 100% SOY CANDLE' },
      { key: 'burnHours', label: 'Yanma Süresi', type: 'text', defaultValue: '~45 HOURS BURN TIME' },
      { key: 'oilBlend', label: 'Esans Karışımı', type: 'text', defaultValue: 'PURE ESSENTIAL OILS • COTTON WICK' },
      { key: 'batchWeight', label: 'Gramaj & Seri', type: 'text', defaultValue: 'NET WT. 220G / BATCH #04' },
      { key: 'safetyRule', label: 'Güvenlik & Kullanım Kuralı', type: 'text', defaultValue: 'Fitili her yakışta 5mm kesin. Çocuk ve evcil hayvanlardan uzak tutun.' }
    ],
    defaultData: {
      candleTitle: 'LAVENDER & CEDARWOOD',
      subCategory: 'HAND POURED 100% SOY CANDLE',
      burnHours: '~45 HOURS BURN TIME',
      oilBlend: 'PURE ESSENTIAL OILS • COTTON WICK',
      batchWeight: 'NET WT. 220G / BATCH #04',
      safetyRule: 'Fitili her yakışta 5mm kesin. Çocuk ve evcil hayvanlardan uzak tutun.'
    }
  },

  // 32. TECH REPAIR & SERVICE WORK ORDER TICKET
  {
    id: 'tpl-tech-repair-ticket',
    title: 'Elektronik & Teknik Servis Cihaz Teslim Fişi',
    category: 'receipt',
    description: 'Cihaz modeli, müşteri şikayeti, servis kabul durumu, teslim alma tarihi ve takip QR kodu.',
    tags: ['teknik servis', 'tamir', 'elektronik', 'telefon', 'bilgisayar', 'servis fişi', 'qr kod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'serviceCenter', label: 'Servis Merkezi', type: 'text', defaultValue: 'NOVA TECH SERVICE' },
      { key: 'workOrderNo', label: 'İş Emri / Servis No', type: 'text', defaultValue: 'SRV-2026-8831' },
      { key: 'customerName', label: 'Müşteri Adı & Tel', type: 'text', defaultValue: 'MURAT KAYA • 0532 990 12 34' },
      { key: 'deviceModel', label: 'Cihaz & Seri No', type: 'text', defaultValue: 'iPhone 15 Pro Max • SN: DX3921' },
      { key: 'reportedIssue', label: 'Bildirilen Arıza', type: 'text', defaultValue: 'Ön cam kırık, batarya sağlığı %74, sıvı teması yok.' },
      { key: 'estCost', label: 'Tahmini Tutar & Teslim', type: 'text', defaultValue: '3.450 ₺ • Teslim: 28.08.2026' },
      { key: 'serviceQr', label: 'Canlı Durum Takip QR', type: 'qrcode', defaultValue: 'https://novatech.repair/track/8831' }
    ],
    defaultData: {
      serviceCenter: 'NOVA TECH SERVICE',
      workOrderNo: 'SRV-2026-8831',
      customerName: 'MURAT KAYA • 0532 990 12 34',
      deviceModel: 'iPhone 15 Pro Max • SN: DX3921',
      reportedIssue: 'Ön cam kırık, batarya sağlığı %74, sıvı teması yok.',
      estCost: '3.450 ₺ • Teslim: 28.08.2026',
      serviceQr: 'https://novatech.repair/track/8831'
    }
  },

  // 33. AIRPORT LUGGAGE & HEAVY BAGGAGE TAG
  {
    id: 'tpl-airport-luggage-tag',
    title: 'Havalimanı Bagaj & Heavy Priority Valiz Etiketi',
    category: 'shipping',
    description: 'Aktarma havalimanı IATA kodları, yolcu soyadı, bagaj ağırlığı, PRIORITY rozeti ve kargo barkodu.',
    tags: ['bagaj', 'valiz', 'havalimanı', 'luggage tag', 'uçak', 'kargo', 'priority'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'destCode', label: 'Büyük Hedef Havalimanı (IATA)', type: 'text', defaultValue: 'JFK' },
      { key: 'transitCode', label: 'Aktarma Havalimanı', type: 'text', defaultValue: 'VIA CDG' },
      { key: 'originCode', label: 'Kalkış Havalimanı', type: 'text', defaultValue: 'FROM: IST' },
      { key: 'passengerSurname', label: 'Yolcu Soyadı / İsim', type: 'text', defaultValue: 'DEMIR / E' },
      { key: 'tagNumber', label: 'Bagaj Seri No', type: 'text', defaultValue: 'TK 894012' },
      { key: 'weightKg', label: 'Ağırlık (KG)', type: 'text', defaultValue: '23.8 KG (HEAVY)' },
      { key: 'baggageBarcode', label: 'Bagaj Takip Barkodu', type: 'barcode', defaultValue: '0235894012' }
    ],
    defaultData: {
      destCode: 'JFK',
      transitCode: 'VIA CDG',
      originCode: 'FROM: IST',
      passengerSurname: 'DEMIR / E',
      tagNumber: 'TK 894012',
      weightKg: '23.8 KG (HEAVY)',
      baggageBarcode: '0235894012'
    }
  },

  // 34. LIBRARY BOOK DUE DATE SLIP
  {
    id: 'tpl-library-due-date',
    title: 'Nostaljik Kütüphane Kitap İade Fişi (Due Date)',
    category: 'organization',
    description: 'Kitap adı, yazar, demirbaş numarası, damga tarih tablosu ve kütüphane kural uyarısı.',
    tags: ['kütüphane', 'kitap', 'nostaljik', 'due date', 'arşiv', 'okul', 'retro'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'libraryTitle', label: 'Kütüphane Adı', type: 'text', defaultValue: 'HALK KÜTÜPHANESİ' },
      { key: 'bookTitle', label: 'Kitap Adı', type: 'text', defaultValue: 'SUÇ VE CEZA' },
      { key: 'authorName', label: 'Yazar', type: 'text', defaultValue: 'F. M. DOSTOYEVSKİ' },
      { key: 'callNumber', label: 'Demirbaş / Raf Kodu', type: 'text', defaultValue: 'RAF: 891.73 DOS' },
      { key: 'date1', label: '1. İade Tarihi', type: 'text', defaultValue: '12 EYL 2026' },
      { key: 'date2', label: '2. İade Tarihi', type: 'text', defaultValue: '26 EYL 2026' },
      { key: 'date3', label: '3. İade Tarihi', type: 'text', defaultValue: '10 EKM 2026' },
      { key: 'warningText', label: 'Gecikme Kuralı Notu', type: 'text', defaultValue: 'Lütfen kitabı temiz ve zamanında teslim ediniz.' }
    ],
    defaultData: {
      libraryTitle: 'HALK KÜTÜPHANESİ',
      bookTitle: 'SUÇ VE CEZA',
      authorName: 'F. M. DOSTOYEVSKİ',
      callNumber: 'RAF: 891.73 DOS',
      date1: '12 EYL 2026',
      date2: '26 EYL 2026',
      date3: '10 EKM 2026',
      warningText: 'Lütfen kitabı temiz ve zamanında teslim ediniz.'
    }
  },

  // 35. CRAFT BEER CAN & BOTTLE LABEL
  {
    id: 'tpl-craft-beer-label',
    title: 'Craft Butik Bira & İçecek Teneke Etiketi',
    category: 'product',
    description: 'Bira stili (Hazy IPA), IBU acılık, ABV alkol oranı, şerbetçiotu profili ve parti seri numarası.',
    tags: ['bira', 'craft beer', 'butik içecek', 'ipa', 'gurme', 'ürün etiketi', '18+'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'breweryName', label: 'Bira Fabrikası / Marka', type: 'text', defaultValue: 'NORDIC HOP BREWERY' },
      { key: 'beerStyle', label: 'Bira Stili & Adı', type: 'text', defaultValue: 'DOUBLE HAZY IPA' },
      { key: 'hopProfile', label: 'Şerbetçiotu (Hops)', type: 'text', defaultValue: 'CITRA • MOSAIC • GALAXY' },
      { key: 'alcoholAbv', label: 'Alkol Oranı (ABV)', type: 'text', defaultValue: '6.8% ABV' },
      { key: 'bitternessIbu', label: 'Acılık Değeri (IBU)', type: 'text', defaultValue: '45 IBU' },
      { key: 'volumeMl', label: 'Hacim', type: 'text', defaultValue: '440 ML / 1 Pint' },
      { key: 'batchDate', label: 'Parti & Dolum Tarihi', type: 'text', defaultValue: 'BATCH #24 • DOLUM: 08/2026' }
    ],
    defaultData: {
      breweryName: 'NORDIC HOP BREWERY',
      beerStyle: 'DOUBLE HAZY IPA',
      hopProfile: 'CITRA • MOSAIC • GALAXY',
      alcoholAbv: '6.8% ABV',
      bitternessIbu: '45 IBU',
      volumeMl: '440 ML / 1 Pint',
      batchDate: 'BATCH #24 • DOLUM: 08/2026'
    }
  },

  // 36. BOTANICAL PLANT NURSERY & CARE TAG
  {
    id: 'tpl-plant-care-tag',
    title: 'Botanik Bitki & Saksı Çiçeği Bakım Etiketi',
    category: 'product',
    description: 'Latince bitki adı, ışık ihtiyacı, sulama sıklığı, nem/sıcaklık şartları ve toksisite uyarısı.',
    tags: ['bitki', 'çiçek', 'botanik', 'fidanlık', 'monstera', 'bakım rehberi', 'bahçe'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'commonName', label: 'Bitki Türkçe Adı', type: 'text', defaultValue: 'DEV MONSTERA' },
      { key: 'latinName', label: 'Latince Botanik Adı', type: 'text', defaultValue: 'Monstera deliciosa' },
      { key: 'lightReq', label: 'Işık İhtiyacı', type: 'text', defaultValue: '☀ Parlak, Dolaylı Işık' },
      { key: 'waterReq', label: 'Sulama Periyodu', type: 'text', defaultValue: '💧 Toprak kurudukça (Haftada 1)' },
      { key: 'tempReq', label: 'İdeal Sıcaklık', type: 'text', defaultValue: '🌡 18°C - 27°C arası' },
      { key: 'petSafety', label: 'Evcil Hayvan Uyarısı', type: 'text', defaultValue: '🐾 Kedi/Köpek için Toksiktir' },
      { key: 'nurseryBrand', label: 'Sera / Botanik Mağazası', type: 'text', defaultValue: 'BOTANICA GREEN STUDIO' }
    ],
    defaultData: {
      commonName: 'DEV MONSTERA',
      latinName: 'Monstera deliciosa',
      lightReq: '☀ Parlak, Dolaylı Işık',
      waterReq: '💧 Toprak kurudukça (Haftada 1)',
      tempReq: '🌡 18°C - 27°C arası',
      petSafety: '🐾 Kedi/Köpek için Toksiktir',
      nurseryBrand: 'BOTANICA GREEN STUDIO'
    }
  },

  // 37. CONCERT & VIP BACKSTAGE ALL ACCESS PASS
  {
    id: 'tpl-vip-backstage-pass',
    title: 'Konser VIP Sahne Arkası Kartı (All Access)',
    category: 'stickers',
    description: 'ALL ACCESS / VIP rozeti, turne adı, tarih, güvenlik güvenlik alanı ve barkod kontrolü.',
    tags: ['konser', 'vip', 'backstage', 'sahne arkası', 'müzik', 'festival', 'all access'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'tourName', label: 'Turne / Festival Başlığı', type: 'text', defaultValue: 'WORLD STADIUM TOUR 2026' },
      { key: 'bandName', label: 'Sanatçı / Grup Adı', type: 'text', defaultValue: 'THE MIDNIGHT ECHO' },
      { key: 'passType', label: 'Giriş Yetkisi / Rozet', type: 'text', defaultValue: 'ALL ACCESS • VIP' },
      { key: 'zoneName', label: 'Erişim Alanı', type: 'text', defaultValue: 'STAGE & PRODUCTION ONLY' },
      { key: 'holderName', label: 'Kart Sahibi', type: 'text', defaultValue: 'ARDA GÜLER / CREW' },
      { key: 'tourDate', label: 'Tarih & Şehir', type: 'text', defaultValue: '28.08.2026 • İSTANBUL STADYUMU' },
      { key: 'accessBarcode', label: 'Geçiş Turnike Barkodu', type: 'barcode', defaultValue: 'VIP-ACCESS-99014' }
    ],
    defaultData: {
      tourName: 'WORLD STADIUM TOUR 2026',
      bandName: 'THE MIDNIGHT ECHO',
      passType: 'ALL ACCESS • VIP',
      zoneName: 'STAGE & PRODUCTION ONLY',
      holderName: 'ARDA GÜLER / CREW',
      tourDate: '28.08.2026 • İSTANBUL STADYUMU',
      accessBarcode: 'VIP-ACCESS-99014'
    }
  },

  // 38. JEWELRY & WATCH PRICE TAG (İnce Kanatlı Takı Etiketi)
  {
    id: 'tpl-jewelry-price-tag',
    title: 'Mücevher, Pırlanta & Saat Fiyat Etiketi',
    category: 'product',
    description: 'Altın ayarı (14K / 585), pırlanta karat değeri, gramaj, model kodu ve mikro barkod.',
    tags: ['mücevher', 'altın', 'pırlanta', 'saat', 'kuyumcu', 'takı', 'fiyat etiketi'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'jewelerName', label: 'Kuyumcu / Marka', type: 'text', defaultValue: 'ZENITH JEWELRY' },
      { key: 'itemTitle', label: 'Ürün / Model', type: 'text', defaultValue: 'TEKTAŞ PIRLANTA YÜZÜK' },
      { key: 'goldPurity', label: 'Ayar / Maden', type: 'text', defaultValue: '14K BEYAZ ALTIN (585)' },
      { key: 'gemstoneSpec', label: 'Taş Özellikleri', type: 'text', defaultValue: '0.35 CT • F COLOR • VS1' },
      { key: 'netWeight', label: 'Net Gramaj', type: 'text', defaultValue: '2.85 GR' },
      { key: 'itemPrice', label: 'Fiyat', type: 'text', defaultValue: '28.500 ₺' },
      { key: 'microBarcode', label: 'Stok Mikro Barkodu', type: 'barcode', defaultValue: 'JW-585-035' }
    ],
    defaultData: {
      jewelerName: 'ZENITH JEWELRY',
      itemTitle: 'TEKTAŞ PIRLANTA YÜZÜK',
      goldPurity: '14K BEYAZ ALTIN (585)',
      gemstoneSpec: '0.35 CT • F COLOR • VS1',
      netWeight: '2.85 GR',
      itemPrice: '28.500 ₺',
      microBarcode: 'JW-585-035'
    }
  },

  // 39. PARKING VALET & CAR WASH SLIP
  {
    id: 'tpl-valet-carwash-slip',
    title: 'Oto Park Vale & Detaylı Araç Yıkama Fişi',
    category: 'receipt',
    description: 'Plaka, araç marka/model, giriş saati, anahtar teslim onay kutuları ve vale takip barkodu.',
    tags: ['vale', 'otopark', 'araç yıkama', 'araba', 'fiş', 'park', 'plaka'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'valetCompany', label: 'Vale Şirketi / Mekan', type: 'text', defaultValue: 'PREMIUM VALET PARKING' },
      { key: 'plateNumber', label: 'Araç Plakası', type: 'text', defaultValue: '34 BJK 1903' },
      { key: 'carModel', label: 'Marka & Model', type: 'text', defaultValue: 'BMW 520i • SİYAH' },
      { key: 'entryTime', label: 'Giriş Saati & Tarih', type: 'text', defaultValue: '27.08.2026 • 19:45' },
      { key: 'serviceRequested', label: 'İstenen Hizmet', type: 'text', defaultValue: 'VALE PARK + İÇ DIŞ YIKAMA' },
      { key: 'parkingFee', label: 'Toplam Ücret', type: 'text', defaultValue: '450 ₺' },
      { key: 'valetBarcode', label: 'Araç Teslim Barkodu', type: 'barcode', defaultValue: 'VAL-34BJK-1903' }
    ],
    defaultData: {
      valetCompany: 'PREMIUM VALET PARKING',
      plateNumber: '34 BJK 1903',
      carModel: 'BMW 520i • SİYAH',
      entryTime: '27.08.2026 • 19:45',
      serviceRequested: 'VALE PARK + İÇ DIŞ YIKAMA',
      parkingFee: '450 ₺',
      valetBarcode: 'VAL-34BJK-1903'
    }
  },

  // 40. PIZZA DELIVERY BOX SECURITY SEAL
  {
    id: 'tpl-pizza-box-seal',
    title: 'Sıcak Pizza & Fast Food Güvenlik Mührü',
    category: 'stickers',
    description: 'Fırından çıkış saati, güvenlik garantisi (Mühür Kırıksa Almayınız), şef ismi ve lezzet notu.',
    tags: ['pizza', 'fast food', 'kutu mührü', 'güvenlik etiketi', 'paket servis', 'restoran'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'pizzeriaName', label: 'Pizzacı / Restoran Adı', type: 'text', defaultValue: 'PIZZERIA NAPOLI' },
      { key: 'sealHeadline', label: 'Mühür Başlığı', type: 'text', defaultValue: 'TAZE VE SICAK FIRINDAN' },
      { key: 'pizzaDetails', label: 'Sipariş & Pizza Adı', type: 'text', defaultValue: 'BÜYÜK BOY QUATTRO FORMAGGI' },
      { key: 'ovenTime', label: 'Fırından Çıkış Saati', type: 'text', defaultValue: '20:15 (FIRINDAN ÇIKIŞ)' },
      { key: 'chefName', label: 'Hazırlayan Şef', type: 'text', defaultValue: 'Şef: Mario R.' },
      { key: 'sealWarning', label: 'Güvenlik Güvencesi Uyarısı', type: 'text', defaultValue: 'GÜVENLİK MÜHRÜDÜR: Kutu bandı yırtılmışsa kuryeden teslim almayınız.' }
    ],
    defaultData: {
      pizzeriaName: 'PIZZERIA NAPOLI',
      sealHeadline: 'TAZE VE SICAK FIRINDAN',
      pizzaDetails: 'BÜYÜK BOY QUATTRO FORMAGGI',
      ovenTime: '20:15 (FIRINDAN ÇIKIŞ)',
      chefName: 'Şef: Mario R.',
      sealWarning: 'GÜVENLİK MÜHRÜDÜR: Kutu bandı yırtılmışsa kuryeden teslim almayınız.'
    }
  },

  // 41. VINTAGE GRAND HOTEL ROOM & LUGGAGE TAG
  {
    id: 'tpl-grand-hotel-tag',
    title: 'Grand Hotel Nostaljik Oda & Bagaj Etiketi',
    category: 'stickers',
    description: 'Oda numarası (Room 304), vintage anahtar motifi, Grand Hotel arması ve resepsiyon bilgisi.',
    tags: ['otel', 'vintage', 'anahtar', 'grand hotel', 'oda kartı', 'retro', 'lüks'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'hotelTitle', label: 'Otel Adı & Şehir', type: 'text', defaultValue: 'GRAND HOTEL DE LUXE' },
      { key: 'roomNumber', label: 'Oda Numarası', type: 'text', defaultValue: 'ROOM 304' },
      { key: 'guestName', label: 'Misafir Adı', type: 'text', defaultValue: 'MR. ALEXANDER WRIGHT' },
      { key: 'checkInDates', label: 'Giriş / Çıkış', type: 'text', defaultValue: '27.08.2026 — 31.08.2026' },
      { key: 'receptionTel', label: 'Resepsiyon Hattı', type: 'text', defaultValue: 'Resepsiyon: Dahili 0 / +90 212 555 0100' },
      { key: 'welcomeMotto', label: 'Karşılama Mottosu', type: 'text', defaultValue: 'Old-world hospitality in modern luxury.' }
    ],
    defaultData: {
      hotelTitle: 'GRAND HOTEL DE LUXE',
      roomNumber: 'ROOM 304',
      guestName: 'MR. ALEXANDER WRIGHT',
      checkInDates: '27.08.2026 — 31.08.2026',
      receptionTel: 'Resepsiyon: Dahili 0 / +90 212 555 0100',
      welcomeMotto: 'Old-world hospitality in modern luxury.'
    }
  },

  // 42. MEDICAL LAB SPECIMEN TUBE TAG
  {
    id: 'tpl-medical-lab-specimen',
    title: 'Tıbbi Laboratuvar & Kan Numune Tüpü Etiketi',
    category: 'warning',
    description: 'Hasta protokol no, numune türü (Serum/EDTA), alım saati, STAT acil rozeti ve medikal barkod.',
    tags: ['laboratuvar', 'tıbbi', 'kan tüpü', 'numune', 'hastane', 'sağlık', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'labHospital', label: 'Laboratuvar / Hastane', type: 'text', defaultValue: 'MERKEZ BİYOKİMYA LAB' },
      { key: 'patientName', label: 'Hasta Adı Soyadı', type: 'text', defaultValue: 'AYŞE KAYA (K/34)' },
      { key: 'protocolNo', label: 'Protokol / Barkod No', type: 'text', defaultValue: 'PRT-2026-90412' },
      { key: 'testType', label: 'İstenen Testler & Tüp', type: 'text', defaultValue: 'CBC + HEMOGRAM • EDTA TÜP' },
      { key: 'sampleTime', label: 'Örnek Alım Saati & Tarih', type: 'text', defaultValue: '27.08.2026 • 09:12' },
      { key: 'isStat', label: 'STAT (Acil Numune) mi?', type: 'checkbox', defaultValue: true },
      { key: 'tubeBarcode', label: 'Tüp Takip Barkodu', type: 'barcode', defaultValue: 'LAB904120912' }
    ],
    defaultData: {
      labHospital: 'MERKEZ BİYOKİMYA LAB',
      patientName: 'AYŞE KAYA (K/34)',
      protocolNo: 'PRT-2026-90412',
      testType: 'CBC + HEMOGRAM • EDTA TÜP',
      sampleTime: '27.08.2026 • 09:12',
      isStat: true,
      tubeBarcode: 'LAB904120912'
    }
  },

  // 43. HANDCRAFTED NATURAL SOAP & COSMETICS
  {
    id: 'tpl-handcrafted-soap',
    title: 'El Yapımı Doğal Sabun & Kozmetik Etiketi',
    category: 'product',
    description: 'Keçi sütü & lavanta içeriği, el yapımı zanaat rozeti, gramaj, pH dengesi ve vegan sertifikası.',
    tags: ['sabun', 'kozmetik', 'doğal', 'el yapımı', 'organik', 'artisan', 'kişisel bakım'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'brandTitle', label: 'Marka Adı', type: 'text', defaultValue: 'BOTANIC ESSENCE' },
      { key: 'soapTitle', label: 'Sabun Çeşidi', type: 'text', defaultValue: 'GOAT MILK & OATMEAL' },
      { key: 'skinType', label: 'Cilt Tipi & Fayda', type: 'text', defaultValue: 'HASSAS VE KURU CİLTLER İÇİN' },
      { key: 'soapIngredients', label: 'İçindekiler', type: 'text', defaultValue: 'Zeytinyağı, Hindistan Cevizi Yağı, Keçi Sütü, Yulaf Unu, Lavanta Yağı.' },
      { key: 'soapWeight', label: 'Net Ağırlık', type: 'text', defaultValue: 'NET: 120 GR (±5G)' },
      { key: 'soapMotto', label: 'Zanaat Mottosu', type: 'text', defaultValue: 'Soğuk sıkım yöntemle elde üretilmiştir.' }
    ],
    defaultData: {
      brandTitle: 'BOTANIC ESSENCE',
      soapTitle: 'GOAT MILK & OATMEAL',
      skinType: 'HASSAS VE KURU CİLTLER İÇİN',
      soapIngredients: 'Zeytinyağı, Hindistan Cevizi Yağı, Keçi Sütü, Yulaf Unu, Lavanta Yağı.',
      soapWeight: 'NET: 120 GR (±5G)',
      soapMotto: 'Soğuk sıkım yöntemle elde üretilmiştir.'
    }
  },

  // 44. BOUTIQUE FLOWER BOUQUET MESSAGE TAG
  {
    id: 'tpl-flower-bouquet-tag',
    title: 'Butik Çiçek Buketi & Hediye Mesaj Kartı',
    category: 'stickers',
    description: 'Zarif botanik gül çerçevesi, özel hediye notu, alıcı/gönderen ve çiçekçi iletişim bilgisi.',
    tags: ['çiçek', 'buket', 'hediye', 'mesaj kartı', 'sevgili', 'doğum günü', 'zarif'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'floristName', label: 'Çiçekçi / Butik Adı', type: 'text', defaultValue: 'L’ATELIER DES FLEURS' },
      { key: 'greetingHeader', label: 'Tebrik Başlığı', type: 'text', defaultValue: 'SEVGİYLE VE MUTLULUKLA' },
      { key: 'giftMessage', label: 'Özel Hediye Mesajı', type: 'textarea', defaultValue: 'Yeni yaşında tüm hayallerinin gerçek olması dileğiyle, iyi ki varsın!' },
      { key: 'fromWhom', label: 'Gönderen', type: 'text', defaultValue: '— Can & Ece' },
      { key: 'careHint', label: 'Vazo Çiçek Bakım Notu', type: 'text', defaultValue: 'Sapları 45° açıyla kesip her gün suyunu tazeleyiniz.' }
    ],
    defaultData: {
      floristName: 'L’ATELIER DES FLEURS',
      greetingHeader: 'SEVGİYLE VE MUTLULUKLA',
      giftMessage: 'Yeni yaşında tüm hayallerinin gerçek olması dileğiyle, iyi ki varsın!',
      fromWhom: '— Can & Ece',
      careHint: 'Sapları 45° açıyla kesip her gün suyunu tazeleyiniz.'
    }
  },

  // 45. QR CODE WIFI & TABLE ORDERING STAND
  {
    id: 'tpl-table-wifi-order',
    title: 'Restoran Masa Üstü WiFi & Dijital Menü QR Kartı',
    category: 'organization',
    description: 'Masa numarası (Table 12), WiFi SSID & şifresi, taranabilir dijital menü QR kodu ve sosyal medya.',
    tags: ['wifi', 'menü', 'restoran', 'kafe', 'masa kartı', 'qr kod', 'sipariş'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'venueName', label: 'Mekan / Kafe Adı', type: 'text', defaultValue: 'COFFEE & CO. BISTRO' },
      { key: 'tableNo', label: 'Masa Numarası', type: 'text', defaultValue: 'MASA 12' },
      { key: 'wifiSsid', label: 'WiFi Ağı (SSID)', type: 'text', defaultValue: 'Bistro_Guest_WiFi' },
      { key: 'wifiPass', label: 'WiFi Şifresi', type: 'text', defaultValue: 'coffee2026' },
      { key: 'menuQr', label: 'Menü & Sipariş QR', type: 'qrcode', defaultValue: 'https://bistromenu.com/table/12' },
      { key: 'socialHandle', label: 'Instagram / İletişim', type: 'text', defaultValue: '@coffeeandco.bistro' }
    ],
    defaultData: {
      venueName: 'COFFEE & CO. BISTRO',
      tableNo: 'MASA 12',
      wifiSsid: 'Bistro_Guest_WiFi',
      wifiPass: 'coffee2026',
      menuQr: 'https://bistromenu.com/table/12',
      socialHandle: '@coffeeandco.bistro'
    }
  },

  // 46. ORGANIC EXTRA VIRGIN OLIVE OIL BOTTLE TAG
  {
    id: 'tpl-olive-oil-bottle',
    title: 'Erken Hasat Soğuk Sıkım Zeytinyağı Etiketi',
    category: 'product',
    description: 'Zeytin çeşidi (Memecik/Ayvalık), asit oranı (<0.3%), hasat yılı, coğrafi işaret ve zeytin dalı çelengi.',
    tags: ['zeytinyağı', 'organik', 'soğuk sıkım', 'gurme', 'hasat', 'ege', 'şişe etiketi'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'farmName', label: 'Zeytinlik / Üretici Çiftlik', type: 'text', defaultValue: 'EGE ZEYTİN BAHÇESİ' },
      { key: 'oilType', label: 'Zeytinyağı Çeşidi', type: 'text', defaultValue: 'ERKEN HASAT SOĞUK SIKIM' },
      { key: 'oliveVariety', label: 'Zeytin Türü & Bölge', type: 'text', defaultValue: '%100 Ayvalık • Kuzey Ege' },
      { key: 'acidityRate', label: 'Asitlik Oranı', type: 'text', defaultValue: 'ASİT ORANI: ≤ %0.3' },
      { key: 'harvestYear', label: 'Hasat Yılı & Dolum', type: 'text', defaultValue: '2025/2026 HASAT DÖNEMİ' },
      { key: 'bottleVol', label: 'Şişe Hacmi', type: 'text', defaultValue: 'NET 500 ML e' }
    ],
    defaultData: {
      farmName: 'EGE ZEYTİN BAHÇESİ',
      oilType: 'ERKEN HASAT SOĞUK SIKIM',
      oliveVariety: '%100 Ayvalık • Kuzey Ege',
      acidityRate: 'ASİT ORANI: ≤ %0.3',
      harvestYear: '2025/2026 HASAT DÖNEMİ',
      bottleVol: 'NET 500 ML e'
    }
  },

  // 47. GYM & FITNESS MEMBERSHIP QR PASS
  {
    id: 'tpl-gym-membership-pass',
    title: 'Spor Salonu & Fitness VIP Üyelik Kartı',
    category: 'organization',
    description: 'Üye adı, üyelik tipi (PLATINUM VIP), bitiş tarihi, hızlı turnike QR kodu ve antrenman mottosu.',
    tags: ['fitness', 'gym', 'spor salonu', 'üyelik', 'turnike', 'kart', 'qr kod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'gymName', label: 'Salon Adı', type: 'text', defaultValue: 'IRON CORE FITNESS CLUB' },
      { key: 'memberName', label: 'Üye Adı Soyadı', type: 'text', defaultValue: 'BURAK ÇELİK' },
      { key: 'membershipType', label: 'Üyelik Sınıfı', type: 'text', defaultValue: 'PLATINUM VIP ALL-HOURS' },
      { key: 'validUntil', label: 'Geçerlilik Tarihi', type: 'text', defaultValue: 'BİTİŞ: 31.12.2026' },
      { key: 'memberId', label: 'Üye ID / No', type: 'text', defaultValue: 'ID: #IC-2026-778' },
      { key: 'gymQr', label: 'Turnike Geçiş QR Kodu', type: 'qrcode', defaultValue: 'GYM-USER-BURAK-778' },
      { key: 'motto', label: 'Motivasyon Mottosu', type: 'text', defaultValue: 'DISCIPLINE OVER MOTIVATION' }
    ],
    defaultData: {
      gymName: 'IRON CORE FITNESS CLUB',
      memberName: 'BURAK ÇELİK',
      membershipType: 'PLATINUM VIP ALL-HOURS',
      validUntil: 'BİTİŞ: 31.12.2026',
      memberId: 'ID: #IC-2026-778',
      gymQr: 'GYM-USER-BURAK-778',
      motto: 'DISCIPLINE OVER MOTIVATION'
    }
  },

  // 48. SNEAKER & SHOE AUTHENTICATION TAG
  {
    id: 'tpl-sneaker-auth-tag',
    title: 'Sneaker & Ayakkabı Orijinallik Doğrulama Etiketi',
    category: 'product',
    description: 'Model adı, US/EU numarası, orijinallik mührü (VERIFIED AUTHENTIC), seri no ve doğrulama QR kodu.',
    tags: ['sneaker', 'ayakkabı', 'orijinallik', 'doğrulama', 'sertifika', 'sokak modası', 'koleksiyon'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'platformName', label: 'Doğrulama Platformu', type: 'text', defaultValue: 'KICKS AUTHENTIC LAB' },
      { key: 'shoeModel', label: 'Sneaker Model Adı', type: 'text', defaultValue: 'RETRO HIGH OG "CHICAGO"' },
      { key: 'shoeSize', label: 'Beden (Size)', type: 'text', defaultValue: 'US 10.5 • EU 44.5 • 28.5 CM' },
      { key: 'skuCode', label: 'SKU / Renk Kodu', type: 'text', defaultValue: 'SKU: DZ5485-612' },
      { key: 'certStatus', label: 'Sertifika Durumu', type: 'text', defaultValue: '✔ 100% VERIFIED AUTHENTIC' },
      { key: 'inspectorId', label: 'Kontrol Eden Uzman', type: 'text', defaultValue: 'INSPECTED BY: #KIK-09' },
      { key: 'authQr', label: 'Orijinallik Doğrulama QR', type: 'qrcode', defaultValue: 'https://kicksauth.com/verify/DZ5485-612-8891' }
    ],
    defaultData: {
      platformName: 'KICKS AUTHENTIC LAB',
      shoeModel: 'RETRO HIGH OG "CHICAGO"',
      shoeSize: 'US 10.5 • EU 44.5 • 28.5 CM',
      skuCode: 'SKU: DZ5485-612',
      certStatus: '✔ 100% VERIFIED AUTHENTIC',
      inspectorId: 'INSPECTED BY: #KIK-09',
      authQr: 'https://kicksauth.com/verify/DZ5485-612-8891'
    }
  },

  // 49. ARTISAN TEA BLEND TIN & POUCH LABEL
  {
    id: 'tpl-artisan-tea-label',
    title: 'Artisan Dökme Çay Tenekesi & Demleme Rehberi',
    category: 'product',
    description: 'Çay çeşidi (Earl Grey Imperial), demleme süresi ve su derecesi (95°C / 4 dk), gramaj ve aroma notaları.',
    tags: ['çay', 'tea', 'artisan', 'demleme', 'earl grey', 'bitki çayı', 'gurme'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'teaHouse', label: 'Çay Evi / Marka', type: 'text', defaultValue: 'ROYAL TEA HERITAGE' },
      { key: 'teaBlendName', label: 'Çay Karışımı Adı', type: 'text', defaultValue: 'EARL GREY IMPERIAL' },
      { key: 'blendDescription', label: 'İçerik & Notalar', type: 'text', defaultValue: 'Ceylon Siyah Çay, Doğal Bergamot Yağı & Mavi Peygamber Çiçeği Yaprakları.' },
      { key: 'brewTemp', label: 'İdeal Su Sıcaklığı', type: 'text', defaultValue: '95°C SU' },
      { key: 'brewTime', label: 'Demleme Süresi', type: 'text', defaultValue: '3 - 4 DAKİKA' },
      { key: 'teaWeight', label: 'Net Gramaj', type: 'text', defaultValue: '100G / 3.5 OZ' },
      { key: 'originInfo', label: 'Köken / Menşei', type: 'text', defaultValue: 'SINGLE ESTATE SRI LANKA' }
    ],
    defaultData: {
      teaHouse: 'ROYAL TEA HERITAGE',
      teaBlendName: 'EARL GREY IMPERIAL',
      blendDescription: 'Ceylon Siyah Çay, Doğal Bergamot Yağı & Mavi Peygamber Çiçeği Yaprakları.',
      brewTemp: '95°C SU',
      brewTime: '3 - 4 DAKİKA',
      teaWeight: '100G / 3.5 OZ',
      originInfo: 'SINGLE ESTATE SRI LANKA'
    }
  },

  // 50. WAREHOUSE MASTER PALLET & HEAVY FREIGHT TAG (100mm/150mm Genişlik)
  {
    id: 'tpl-warehouse-master-pallet',
    title: 'Lojistik Depo Palet & Ağır Yük Ana Etiketi (Master Pallet)',
    category: 'shipping',
    description: 'Palet ID, hedef depo bayı, brüt ağırlık (485 KG), koli adedi, istifleme uyarısı ve büyük GS1-128 lojistik barkodu.',
    tags: ['palet', 'depo', 'lojistik', 'ağır yük', 'kargo', 'forklift', '100mm', '150mm'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'hubTitle', label: 'Lojistik Dağıtım Merkezi', type: 'text', defaultValue: 'GLOBAL LOGISTICS HUB • IST-01' },
      { key: 'palletId', label: 'Palet Numarası (SSCC)', type: 'text', defaultValue: 'PAL-9840-2026-X1' },
      { key: 'destBay', label: 'Hedef Depo & Raf Bay', type: 'text', defaultValue: 'BAY: ZONE-4B / RAF: 12-C' },
      { key: 'grossWeight', label: 'Brüt Ağırlık', type: 'text', defaultValue: '485.5 KG' },
      { key: 'cartonCount', label: 'Koli / Kutu Sayısı', type: 'text', defaultValue: '36 KOLİ / 864 ADET' },
      { key: 'stackWarning', label: 'İstifleme & Taşıma Kuralı', type: 'text', defaultValue: 'MAKSİMUM 2 PALET İSTİFLENEBİLİR • FORKLİFT İLE TAŞIYINIZ' },
      { key: 'masterBarcode', label: 'GS1-128 Lojistik Palet Barkodu', type: 'barcode', defaultValue: '(00)386901234567890123' }
    ],
    defaultData: {
      hubTitle: 'GLOBAL LOGISTICS HUB • IST-01',
      palletId: 'PAL-9840-2026-X1',
      destBay: 'BAY: ZONE-4B / RAF: 12-C',
      grossWeight: '485.5 KG',
      cartonCount: '36 KOLİ / 864 ADET',
      stackWarning: 'MAKSİMUM 2 PALET İSTİFLENEBİLİR • FORKLİFT İLE TAŞIYINIZ',
      masterBarcode: '(00)386901234567890123'
    }
  },

  // ==========================================
  // YENİ ŞABLONLAR (51 - 75)
  // ==========================================

  // 51. YANGIN GÜVENLİĞİ & ACİL ÇIKIŞ / SÖNDÜRÜCÜ PİKTOGRAMI (Görsel Referans 1)
  {
    id: 'tpl-fire-safety-exit-extinguisher',
    title: 'Yangın Güvenliği & Acil Çıkış / Söndürücü Levhası',
    category: 'warning',
    description: 'Kullanıcı referansındaki gibi DANGER, EXIT, FIRE EXTINGUISHER ve piktogramları içeren acil durum güvenlik etiketi.',
    tags: ['yangın', 'acil çıkış', 'exit', 'söndürücü', 'güvenlik', 'isg', 'tabela', 'kırmızı'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'signType', label: 'Tabela Türü (DANGER / EXIT / EXTINGUISHER)', type: 'text', defaultValue: 'FIRE EXTINGUISHER' },
      { key: 'subText', label: 'Alt Açıklama & Yön', type: 'text', defaultValue: 'ACİL DURUM SÖNDÜRME TÜPÜ' },
      { key: 'locationZone', label: 'Konum / Alan', type: 'text', defaultValue: 'KAT 2 • A BLOK KORİDORU' },
      { key: 'inspectDate', label: 'Son Kontrol Tarihi', type: 'text', defaultValue: 'KONTROL: 08/2026 • GEÇERLİLİK: 08/2027' }
    ],
    defaultData: {
      signType: 'FIRE EXTINGUISHER',
      subText: 'ACİL DURUM SÖNDÜRME TÜPÜ',
      locationZone: 'KAT 2 • A BLOK KORİDORU',
      inspectDate: 'KONTROL: 08/2026 • GEÇERLİLİK: 08/2027'
    }
  },

  // 52. ENDÜSTRİYEL DİKKAT ÇALIŞMA VAR / CAUTION WORK IN PROGRESS (Görsel Referans 2)
  {
    id: 'tpl-caution-work-in-progress',
    title: 'Endüstriyel Dikkat Çalışma Var (Caution Work In Progress)',
    category: 'warning',
    description: 'Sarı/siyah kontrastlı, yuvarlak kalın çerçeveli endüstriyel "CAUTION - WORK IN PROGRESS" iş güvenliği levhası.',
    tags: ['caution', 'dikkat', 'çalışma var', 'isg', 'şantiye', 'güvenlik', 'sarı siyah', 'work in progress'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'headerText', label: 'Üst Başlık (CAUTION / DİKKAT)', type: 'text', defaultValue: 'CAUTION' },
      { key: 'mainMessage', label: 'Ana Mesaj', type: 'text', defaultValue: 'WORK IN PROGRESS' },
      { key: 'subNotice', label: 'Alt Uyarı Notu', type: 'text', defaultValue: 'AUTHORIZED PERSONNEL ONLY • BARET VE YELEK ZORUNLUDUR' },
      { key: 'contractorInfo', label: 'Yüklenici / Firma', type: 'text', defaultValue: 'ŞANTİYE GÜVENLİK BİRİMİ' }
    ],
    defaultData: {
      headerText: 'CAUTION',
      mainMessage: 'WORK IN PROGRESS',
      subNotice: 'AUTHORIZED PERSONNEL ONLY • BARET VE YELEK ZORUNLUDUR',
      contractorInfo: 'ŞANTİYE GÜVENLİK BİRİMİ'
    }
  },

  // 53. MİZAHİ OFİS / LAPTOP "CAUTION INTROVERT" STICKER (Görsel Referans 3)
  {
    id: 'tpl-caution-introvert',
    title: 'Mizahi Ofis & Laptop "Caution Introvert" Çıkartması',
    category: 'stickers',
    description: 'Referans 3\'teki "CAUTION INTROVERT: No talking allowed, keep interactions to a minimum" ofis ve laptop etiketi.',
    tags: ['introvert', 'mizah', 'sticker', 'ofis', 'laptop', 'çıkartma', 'caution', 'komik'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'badgeLabel', label: 'İkaz Rozeti', type: 'text', defaultValue: 'CAUTION' },
      { key: 'mainWord', label: 'Büyük Başlık', type: 'text', defaultValue: 'INTROVERT' },
      { key: 'line1', label: '1. Satır Mesajı', type: 'text', defaultValue: 'NO TALKING ALLOWED' },
      { key: 'line2', label: '2. Satır Mesajı', type: 'text', defaultValue: 'ANY OTHER SOCIAL INTERACTIONS SHOULD BE KEPT TO A MINIMUM' },
      { key: 'batteryLevel', label: 'Sosyal Batarya / Mod', type: 'text', defaultValue: '🔋 SOSYAL BATARYA: %4' }
    ],
    defaultData: {
      badgeLabel: 'CAUTION',
      mainWord: 'INTROVERT',
      line1: 'NO TALKING ALLOWED',
      line2: 'ANY OTHER SOCIAL INTERACTIONS SHOULD BE KEPT TO A MINIMUM',
      batteryLevel: '🔋 SOSYAL BATARYA: %4'
    }
  },

  // 54. "TO AVOID INJURY DON'T TELL ME WHAT TO DO" PİKTOGRAMLI MİZAH & İKAZ (Görsel Referans 4)
  {
    id: 'tpl-warning-to-avoid-injury',
    title: 'Mizahi İkaz "To Avoid Injury Don\'t Tell Me What To Do"',
    category: 'stickers',
    description: 'Referans 4\'teki kayıp düşen insan piktogramı, alt tehlike şeritleri ve "WARNING: To avoid injury don\'t tell me what to do" tasarımı.',
    tags: ['warning', 'mizah', 'injury', 'sticker', 'isg', 'komik', 'piktogram', 'zebra şerit'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'warningTitle', label: 'İkaz Başlığı', type: 'text', defaultValue: 'WARNING' },
      { key: 'headlinePart1', label: 'Üst Mesaj', type: 'text', defaultValue: 'TO AVOID INJURY' },
      { key: 'headlinePart2', label: 'Alt Mesaj', type: 'text', defaultValue: "DON'T TELL ME WHAT TO DO" },
      { key: 'footerNote', label: 'Alt Not', type: 'text', defaultValue: 'DEVELOPER AT WORK • DO NOT DISTURB' }
    ],
    defaultData: {
      warningTitle: 'WARNING',
      headlinePart1: 'TO AVOID INJURY',
      headlinePart2: "DON'T TELL ME WHAT TO DO",
      footerNote: 'DEVELOPER AT WORK • DO NOT DISTURB'
    }
  },

  // 55. YÜKSEK GERİLİM & ELEKTRİK PANOSU TEHLİKE LEVHASI
  {
    id: 'tpl-danger-high-voltage',
    title: 'Yüksek Gerilim & Elektrik Panosu Tehlike Levhası',
    category: 'warning',
    description: 'Yıldırım sembolü, 400V / 10.000V gerilim uyarısı, hayati tehlike ikazı ve pano numarası içeren standart ISG etiketi.',
    tags: ['yüksek gerilim', 'elektrik', 'danger', 'high voltage', 'isg', 'trafo', 'pano', 'tehlike'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'dangerHeader', label: 'Tehlike Başlığı', type: 'text', defaultValue: 'TEHLİKE • DANGER' },
      { key: 'voltageText', label: 'Gerilim Seviyesi', type: 'text', defaultValue: '400 VOLT YÜKSEK GERİLİM' },
      { key: 'fatalWarning', label: 'Ölüm / Hayati Tehlike Mesajı', type: 'text', defaultValue: 'ÖLÜM TEHLİKESİ • DOKUNMAYINIZ!' },
      { key: 'panelId', label: 'Pano Kodu / Konum', type: 'text', defaultValue: 'ANA DAĞITIM PANOSU: PNO-08' },
      { key: 'emergencyTel', label: 'Acil İletişim', type: 'text', defaultValue: 'Teknik Ekip: Dahili 4444' }
    ],
    defaultData: {
      dangerHeader: 'TEHLİKE • DANGER',
      voltageText: '400 VOLT YÜKSEK GERİLİM',
      fatalWarning: 'ÖLÜM TEHLİKESİ • DOKUNMAYINIZ!',
      panelId: 'ANA DAĞITIM PANOSU: PNO-08',
      emergencyTel: 'Teknik Ekip: Dahili 4444'
    }
  },

  // 56. BİYOLOJİK & KİMYASAL TEHLİKE NUMUNE ETİKETİ (BIOHAZARD)
  {
    id: 'tpl-biohazard-lab-specimen',
    title: 'Biyolojik & Kimyasal Tehlike Numune Etiketi (Biohazard)',
    category: 'warning',
    description: 'Biohazard simgeli, enfeksiyöz madde uyarı kutulu, UN kodu ve laboratuvar takip barkodlu tescilli numune etiketi.',
    tags: ['biohazard', 'biyolojik tehlike', 'laboratuvar', 'kimyasal', 'numune', 'tıp', 'enfeksiyon'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'hazardTitle', label: 'Tehlike Sınıfı', type: 'text', defaultValue: 'BIOHAZARD • BİYOLOJİK RİSK' },
      { key: 'subRisk', label: 'Risk Türü', type: 'text', defaultValue: 'INFECTIOUS SUBSTANCE • KATEGORİ B' },
      { key: 'unCode', label: 'UN Taşıma Kodu', type: 'text', defaultValue: 'UN 3373' },
      { key: 'labOrigin', label: 'Gönderici Laboratuvar', type: 'text', defaultValue: 'MERKEZ VİROLOJİ & TANI LAB' },
      { key: 'handlingCaution', label: 'Elleçleme Talimatı', type: 'text', defaultValue: 'Yalnızca yetkili personel açabilir. 2-8°C muhafaza ediniz.' },
      { key: 'bioBarcode', label: 'Numune Barkodu', type: 'barcode', defaultValue: 'BIO-3373-89104' }
    ],
    defaultData: {
      hazardTitle: 'BIOHAZARD • BİYOLOJİK RİSK',
      subRisk: 'INFECTIOUS SUBSTANCE • KATEGORİ B',
      unCode: 'UN 3373',
      labOrigin: 'MERKEZ VİROLOJİ & TANI LAB',
      handlingCaution: 'Yalnızca yetkili personel açabilir. 2-8°C muhafaza ediniz.',
      bioBarcode: 'BIO-3373-89104'
    }
  },

  // 57. ISLAK ZEMİN & KAYMA TEHLİKESİ İKAZI
  {
    id: 'tpl-caution-wet-floor',
    title: 'Islak Zemin & Kayma Tehlikesi İkaz Levhası',
    category: 'warning',
    description: 'Kayan adam piktogramı, Türkçe/İngilizce çift dil uyarı "DİKKAT KAYGAN ZEMİN / CAUTION WET FLOOR".',
    tags: ['ıslak zemin', 'kaygan', 'wet floor', 'temizlik', 'güvenlik', 'otel', 'avm', 'ikaz'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'topNotice', label: 'Üst İkaz', type: 'text', defaultValue: 'DİKKAT • CAUTION' },
      { key: 'mainWarningTr', label: 'Türkçe Uyarı', type: 'text', defaultValue: 'KAYGAN ZEMİN' },
      { key: 'mainWarningEn', label: 'İngilizce Uyarı', type: 'text', defaultValue: 'WET FLOOR' },
      { key: 'cleaningStatus', label: 'Temizlik Bilgisi', type: 'text', defaultValue: 'TEMİZLİK YAPILMAKTADIR • YAVAŞ YÜRÜYÜNÜZ' }
    ],
    defaultData: {
      topNotice: 'DİKKAT • CAUTION',
      mainWarningTr: 'KAYGAN ZEMİN',
      mainWarningEn: 'WET FLOOR',
      cleaningStatus: 'TEMİZLİK YAPILMAKTADIR • YAVAŞ YÜRÜYÜNÜZ'
    }
  },

  // 58. VINTAGE 90S MIXTAPE KASET SIRTI & ŞARKI LİSTESİ
  {
    id: 'tpl-vintage-mixtape-cassette',
    title: 'Nostaljik 90\'lar Mixtape Kaset Etiketi (Cassette Side A/B)',
    category: 'stickers',
    description: 'Analog kaset gövdesi veya şeffaf kutu sırtı için şarkı listesi, A/B yüzü, süre ve Dolby NR göstergeli retro tasarım.',
    tags: ['kaset', 'mixtape', 'müzik', '90lar', 'retro', 'vintage', 'şarkı listesi', 'walkman'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'cassetteTitle', label: 'Mixtape Başlığı', type: 'text', defaultValue: 'SUMMER VIBES 1996 • VOL. 1' },
      { key: 'sideLabel', label: 'Kaset Yüzü', type: 'text', defaultValue: 'SIDE A • 45 MIN' },
      { key: 'tracklist', label: 'Parça Listesi', type: 'text', defaultValue: '1. Midnight City  2. Retro Drive  3. Sunset Groove  4. Tape Memory' },
      { key: 'cassetteType', label: 'Kaset Türü & Ses', type: 'text', defaultValue: 'TYPE II (CrO2) • HIGH BIAS • DOLBY B' },
      { key: 'recordDate', label: 'Kayıt Tarihi / Not', type: 'text', defaultValue: 'REC: 14.08.1996 • FOR CAN' }
    ],
    defaultData: {
      cassetteTitle: 'SUMMER VIBES 1996 • VOL. 1',
      sideLabel: 'SIDE A • 45 MIN',
      tracklist: '1. Midnight City  2. Retro Drive  3. Sunset Groove  4. Tape Memory',
      cassetteType: 'TYPE II (CrO2) • HIGH BIAS • DOLBY B',
      recordDate: 'REC: 14.08.1996 • FOR CAN'
    }
  },

  // 59. 33 RPM VİNİL PLAK GÖBEK ETİKETİ (VINYL RECORD CENTER LABEL)
  {
    id: 'tpl-vinyl-center-label',
    title: '33 RPM Vinil Plak Göbek Etiketi (Vinyl Center Label)',
    category: 'stickers',
    description: 'Dairesel dairesel çizgiler, merkez delik rehberi, 33 1/3 RPM, plak şirketi ve parça süreleri içeren plak etiketi.',
    tags: ['vinil', 'plak', 'lp', 'müzik', 'albüm', '33rpm', 'retro', 'center label'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'recordLabel', label: 'Plak Şirketi', type: 'text', defaultValue: 'ANALOG DREAMS RECORDS' },
      { key: 'albumArtist', label: 'Sanatçı & Albüm Adı', type: 'text', defaultValue: 'THE VELVET TRIO • NOCTURNE IN BLUE' },
      { key: 'sideRpm', label: 'Yüz & Devir (RPM)', type: 'text', defaultValue: 'SIDE 1 • 33 ⅓ RPM • STEREO' },
      { key: 'catalogNo', label: 'Katalog Numarası', type: 'text', defaultValue: 'ADR-LP-2026' },
      { key: 'rightsText', label: 'Telif & Üretim', type: 'text', defaultValue: 'ALL RIGHTS RESERVED • MADE IN ISTANBUL' }
    ],
    defaultData: {
      recordLabel: 'ANALOG DREAMS RECORDS',
      albumArtist: 'THE VELVET TRIO • NOCTURNE IN BLUE',
      sideRpm: 'SIDE 1 • 33 ⅓ RPM • STEREO',
      catalogNo: 'ADR-LP-2026',
      rightsText: 'ALL RIGHTS RESERVED • MADE IN ISTANBUL'
    }
  },

  // 60. VETERİNER SAĞLIK & AŞI TAKİP KARNESİ ETİKETİ
  {
    id: 'tpl-pet-vaccination-record',
    title: 'Veteriner Evcil Hayvan Aşı & Sağlık Karnesi Etiketi',
    category: 'organization',
    description: 'Evcil hayvan adı, çip no, kuduz/karma aşı tarihi, bir sonraki aşı hatırlatması ve veteriner QR kodu.',
    tags: ['veteriner', 'kedi', 'köpek', 'aşı', 'evcil hayvan', 'sağlık', 'kuduz aşısı', 'çip no'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'vetClinicName', label: 'Veteriner Kliniği Adı', type: 'text', defaultValue: 'PATİ VETERİNER KLİNİĞİ' },
      { key: 'petNameBreed', label: 'Pet Adı & Irkı', type: 'text', defaultValue: 'LOKUM • Scottish Fold (2 Yaş)' },
      { key: 'microchipNo', label: 'Mikroçip Numarası', type: 'text', defaultValue: 'ÇİP: 981098102948571' },
      { key: 'vaccineName', label: 'Uygulanan Aşı', type: 'text', defaultValue: 'KARMA + KUDUZ (RABIES)' },
      { key: 'vaccineDates', label: 'Uygulama & Sonraki Tarih', type: 'text', defaultValue: 'UYGULAMA: 27.08.2026 • SONRAKİ: 27.08.2027' },
      { key: 'vetSignature', label: 'Hekim Kaşe / Onay', type: 'text', defaultValue: 'Vet. Hek. Elif Demir (Dip No: 4891)' },
      { key: 'petPassportQr', label: 'Dijital Karne QR', type: 'qrcode', defaultValue: 'https://pativet.com/passport/981098102948571' }
    ],
    defaultData: {
      vetClinicName: 'PATİ VETERİNER KLİNİĞİ',
      petNameBreed: 'LOKUM • Scottish Fold (2 Yaş)',
      microchipNo: 'ÇİP: 981098102948571',
      vaccineName: 'KARMA + KUDUZ (RABIES)',
      vaccineDates: 'UYGULAMA: 27.08.2026 • SONRAKİ: 27.08.2027',
      vetSignature: 'Vet. Hek. Elif Demir (Dip No: 4891)',
      petPassportQr: 'https://pativet.com/passport/981098102948571'
    }
  },

  // 61. BUTİK SUSHİ & OMAKASE PAKETLEME MÜHRÜ
  {
    id: 'tpl-sushi-omakase-box',
    title: 'Butik Sushi & Omakase Sipariş Kutusu Mührü',
    category: 'product',
    description: 'Japon estetiği, şef hazırlama saati, wasabi/soya uyarısı ve tazelik tüketim kılavuzu içeren gurme paketleme etiketi.',
    tags: ['sushi', 'japon', 'omakase', 'nigiri', 'restoran', 'paket servis', 'taze', 'gurme'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'sushiBarName', label: 'Sushi Bar / Restoran Adı', type: 'text', defaultValue: 'TOKYO ARTISAN SUSHI LAB' },
      { key: 'setMenuName', label: 'Menü / Set Adı', type: 'text', defaultValue: 'PREMIUM OMAKASE SET (18 PCS)' },
      { key: 'prepTime', label: 'Hazırlanış Saati', type: 'text', defaultValue: 'HAZIRLANDI: BUGÜN 19:25' },
      { key: 'freshnessNote', label: 'Tazelik & Tüketim Uyarısı', type: 'text', defaultValue: 'Lütfen hazırlandıktan sonra 2 saat içinde tüketiniz. Buzdolabında bekletmeyiniz.' },
      { key: 'chefSeal', label: 'Şef Onayı', type: 'text', defaultValue: 'Master Chef: Kenji Sato' }
    ],
    defaultData: {
      sushiBarName: 'TOKYO ARTISAN SUSHI LAB',
      setMenuName: 'PREMIUM OMAKASE SET (18 PCS)',
      prepTime: 'HAZIRLANDI: BUGÜN 19:25',
      freshnessNote: 'Lütfen hazırlandıktan sonra 2 saat içinde tüketiniz. Buzdolabında bekletmeyiniz.',
      chefSeal: 'Master Chef: Kenji Sato'
    }
  },

  // 62. LÜKS SPA & TERMAL MASAJ RANDEVU KARTI
  {
    id: 'tpl-luxury-spa-appointment',
    title: 'Lüks SPA & Termal Masaj Randevu Kartı',
    category: 'organization',
    description: 'Lotus motifli, sakinleştirici tipografili seans saati, terapist adı ve aromaterapi bakım detayları.',
    tags: ['spa', 'masaj', 'wellness', 'randevu', 'terapi', 'aromaterapi', 'güzellik', 'bakım'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'spaName', label: 'SPA & Wellness Merkezi', type: 'text', defaultValue: 'ZENITH BOTANICAL SPA & WELLNESS' },
      { key: 'guestName', label: 'Misafir Adı', type: 'text', defaultValue: 'Selin Yılmaz' },
      { key: 'sessionDetails', label: 'Seans & Masaj Türü', type: 'text', defaultValue: 'Aromaterapi Sıcak Taş Masajı (60 Dk)' },
      { key: 'therapistRoom', label: 'Terapist & Oda', type: 'text', defaultValue: 'Terapist: Maya • Lotus Suiti 3' },
      { key: 'appointmentDateTime', label: 'Tarih & Saat', type: 'text', defaultValue: '28 AĞUSTOS 2026 • 15:30' },
      { key: 'spaNotice', label: 'Hatırlatma Notu', type: 'text', defaultValue: 'Lütfen seans saatinden 15 dakika önce spa alanında olunuz.' }
    ],
    defaultData: {
      spaName: 'ZENITH BOTANICAL SPA & WELLNESS',
      guestName: 'Selin Yılmaz',
      sessionDetails: 'Aromaterapi Sıcak Taş Masajı (60 Dk)',
      therapistRoom: 'Terapist: Maya • Lotus Suiti 3',
      appointmentDateTime: '28 AĞUSTOS 2026 • 15:30',
      spaNotice: 'Lütfen seans saatinden 15 dakika önce spa alanında olunuz.'
    }
  },

  // 63. NOSTALJİK KİTAP AYRACI & EDEBİ ALINTI ŞABLONU
  {
    id: 'tpl-vintage-library-bookmark',
    title: 'Nostaljik Kitap Ayracı & Edebi Alıntı Çıkartması',
    category: 'stickers',
    description: 'Kitapseverler için termal şerit ayracı, okunan sayfa kaydı, favori alıntı ve Ex Libris mührü.',
    tags: ['kitap', 'ayraç', 'bookmark', 'edebiyat', 'alıntı', 'okuma', 'ex libris', 'kütüphane'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'exLibrisHeader', label: 'Ex Libris / Kitaplık', type: 'text', defaultValue: 'EX LIBRIS • KİŞİSEL KÜTÜPHANE' },
      { key: 'bookInfo', label: 'Kitap & Yazar', type: 'text', defaultValue: 'Dönüşüm — Franz Kafka' },
      { key: 'quoteText', label: 'Edebi Alıntı', type: 'text', defaultValue: '"Bir sabah bunaltıcı düşlerden uyandığında, kendini yatağında dev bir böceğe dönüşmüş olarak buldu."' },
      { key: 'pageTracker', label: 'Kaldığım Sayfa & Tarih', type: 'text', defaultValue: 'Sayfa: _____ • Başlama: 27.08.2026' }
    ],
    defaultData: {
      exLibrisHeader: 'EX LIBRIS • KİŞİSEL KÜTÜPHANE',
      bookInfo: 'Dönüşüm — Franz Kafka',
      quoteText: '"Bir sabah bunaltıcı düşlerden uyandığında, kendini yatağında dev bir böceğe dönüşmüş olarak buldu."',
      pageTracker: 'Sayfa: _____ • Başlama: 27.08.2026'
    }
  },

  // 64. OPTİK GÖZLÜK REÇETESİ & ODAK DEĞERLERİ KARTI
  {
    id: 'tpl-optical-rx-prescription',
    title: 'Optik Gözlük Reçetesi & Odak Değerleri Kartı',
    category: 'organization',
    description: 'Gözlükçüler için Sağ/Sol göz SPH, CYL, AXIS, PD değerleri, cam tipi ve sipariş takip barkodu.',
    tags: ['optik', 'gözlük', 'reçete', 'lens', 'sph', 'cyl', 'axis', 'sağlık', 'barkod'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'opticianName', label: 'Optik Mağazası Adı', type: 'text', defaultValue: 'VİZYON OPTİK & GÖZLÜK ATÖLYESİ' },
      { key: 'patientName', label: 'Müşteri / Hasta Adı', type: 'text', defaultValue: 'Emre Karaca' },
      { key: 'rightEye', label: 'Sağ Göz (OD) Değerleri', type: 'text', defaultValue: 'OD: -1.75 | -0.50 | 180°' },
      { key: 'leftEye', label: 'Sol Göz (OS) Değerleri', type: 'text', defaultValue: 'OS: -2.00 | -0.75 | 175°' },
      { key: 'lensDetails', label: 'Cam Tipi & PD', type: 'text', defaultValue: '1.61 Antirefle Mavi Işık Filtreli • PD: 63mm' },
      { key: 'orderBarcode', label: 'Sipariş Takip Barkodu', type: 'barcode', defaultValue: 'OPT-2026-9941' }
    ],
    defaultData: {
      opticianName: 'VİZYON OPTİK & GÖZLÜK ATÖLYESİ',
      patientName: 'Emre Karaca',
      rightEye: 'OD: -1.75 | -0.50 | 180°',
      leftEye: 'OS: -2.00 | -0.75 | 175°',
      lensDetails: '1.61 Antirefle Mavi Işık Filtreli • PD: 63mm',
      orderBarcode: 'OPT-2026-9941'
    }
  },

  // 65. DİŞ KLİNİĞİ RANDEVU & TEDAVİ HATIRLATICI
  {
    id: 'tpl-dental-clinic-appointment',
    title: 'Diş Kliniği Randevu & Kontrol Hatırlatıcı Kartı',
    category: 'organization',
    description: 'Diş sağlığı merkezi logo & dişi, randevu günü/saati, hekim adı, yapılacak işlem ve acil telefon.',
    tags: ['diş', 'diş hekimi', 'klinik', 'randevu', 'sağlık', 'hatırlatıcı', 'dental'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'dentalClinicName', label: 'Klinik Adı', type: 'text', defaultValue: 'DENTANOVA AĞIZ VE DİŞ SAĞLIĞI' },
      { key: 'patientName', label: 'Hasta Adı', type: 'text', defaultValue: 'Gamze Çetin' },
      { key: 'dentistName', label: 'Diş Hekimi', type: 'text', defaultValue: 'Dt. Barış Yıldız' },
      { key: 'appointmentTime', label: 'Randevu Tarih & Saat', type: 'text', defaultValue: '02 EYLÜL 2026 • ÇARŞAMBA 14:00' },
      { key: 'procedureType', label: 'Planlanan İşlem', type: 'text', defaultValue: 'KONTROL & DİŞ TAŞI TEMİZLİĞİ' },
      { key: 'reminderNotice', label: 'İptal / Değişiklik Uyarısı', type: 'text', defaultValue: 'Randevu değişikliği için lütfen 24 saat önceden haber veriniz: 0212 555 12 34' }
    ],
    defaultData: {
      dentalClinicName: 'DENTANOVA AĞIZ VE DİŞ SAĞLIĞI',
      patientName: 'Gamze Çetin',
      dentistName: 'Dt. Barış Yıldız',
      appointmentTime: '02 EYLÜL 2026 • ÇARŞAMBA 14:00',
      procedureType: 'KONTROL & DİŞ TAŞI TEMİZLİĞİ',
      reminderNotice: 'Randevu değişikliği için lütfen 24 saat önceden haber veriniz: 0212 555 12 34'
    }
  },

  // 66. BİTKİSEL YAĞ & TENTÜR DAMLALIK ŞİŞE ETİKETİ (30ML DROPPER)
  {
    id: 'tpl-dropper-tincture-oil',
    title: 'Bitkisel Tentür & Damlalık Şişe Etiketi (30ml Dropper)',
    category: 'product',
    description: 'Küçük boyutlu cam damlalık şişeleri için konsantre botanik ekstrakt, kullanım dozu, parti no ve saklama kılavuzu.',
    tags: ['damlalık', 'şişe', 'tentür', 'ekstrakt', 'botanik', '30ml', 'yağ', 'doğal'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'apothecaryBrand', label: 'Marka Adı', type: 'text', defaultValue: 'HERBAL APOTHECARY' },
      { key: 'tinctureTitle', label: 'Tentür / Ekstrakt Adı', type: 'text', defaultValue: 'VALERIAN & PASSIONFLOWER' },
      { key: 'potencyRatio', label: 'Konsantrasyon & Hacim', type: 'text', defaultValue: '1:3 EKSTRAKT • 30 ML e' },
      { key: 'usageDosage', label: 'Kullanım Dozu', type: 'text', defaultValue: 'Günde 1 kez 15-20 damla suya damlatarak alınız.' },
      { key: 'batchExpiry', label: 'Parti & SKT', type: 'text', defaultValue: 'BATCH: 2608 • SKT: 08/2028' }
    ],
    defaultData: {
      apothecaryBrand: 'HERBAL APOTHECARY',
      tinctureTitle: 'VALERIAN & PASSIONFLOWER',
      potencyRatio: '1:3 EKSTRAKT • 30 ML e',
      usageDosage: 'Günde 1 kez 15-20 damla suya damlatarak alınız.',
      batchExpiry: 'BATCH: 2608 • SKT: 08/2028'
    }
  },

  // 67. ARAÇ MOTOR YAĞI DEĞİŞİM & KM HATIRLATICI CAM ÇIKARTMASI
  {
    id: 'tpl-engine-oil-reminder',
    title: 'Otomotiv Yağ Değişimi & Kilometre Hatırlatıcı Cam Etiketi',
    category: 'organization',
    description: 'Oto servisleri için yapılan bakım tarihi, mevcut km, bir sonraki yağ değişimi km ve kullanılan yağ viskozitesi.',
    tags: ['oto servis', 'yağ değişimi', 'kilometre', 'araç bakım', 'motor yağı', 'hatırlatıcı', 'araba'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'serviceGarage', label: 'Oto Servis Adı', type: 'text', defaultValue: 'MOTORSPEED OTO SERVİS' },
      { key: 'currentService', label: 'Yapılan Bakım & Tarih', type: 'text', defaultValue: '27.08.2026 • 124.500 KM' },
      { key: 'oilViscosity', label: 'Kullanılan Yağ & Filtre', type: 'text', defaultValue: 'Castrol 5W-30 Tam Sentetik + Yağ Filtresi' },
      { key: 'nextServiceDue', label: 'Sonraki Bakım Kilometresi', type: 'text', defaultValue: 'GELECEK BAKIM: 139.500 KM (veya 08/2027)' },
      { key: 'serviceContact', label: 'Servis Randevu Tel', type: 'text', defaultValue: 'Servis Randevu: 0216 444 88 99' }
    ],
    defaultData: {
      serviceGarage: 'MOTORSPEED OTO SERVİS',
      currentService: '27.08.2026 • 124.500 KM',
      oilViscosity: 'Castrol 5W-30 Tam Sentetik + Yağ Filtresi',
      nextServiceDue: 'GELECEK BAKIM: 139.500 KM (veya 08/2027)',
      serviceContact: 'Servis Randevu: 0216 444 88 99'
    }
  },

  // 68. TEK KÖKEN ZANAATKAR ÇİKOLATA SARGI BANDI
  {
    id: 'tpl-single-origin-chocolate',
    title: 'Tek Köken Zanaatkar Çikolata Sargı Bandı (Craft Chocolate)',
    category: 'product',
    description: '%82 Madagaskar kakao oranı, kakao çiftliği menşei, tadım notaları ve bean-to-bar zanaat mührü.',
    tags: ['çikolata', 'kakao', 'single origin', 'craft chocolate', 'gurme', 'artisan', 'tatlı'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'chocolatierName', label: 'Çikolata Atölyesi', type: 'text', defaultValue: 'NOIR & CACAO ARTISAN' },
      { key: 'originCocoa', label: 'Kakao Kökeni & Oranı', type: 'text', defaultValue: '%82 MADAGASCAR SAMBIRANO' },
      { key: 'flavorNotes', label: 'Tadım Notaları', type: 'text', defaultValue: 'KIRMIZI MEYVELER • TURUNÇGİL • SEDİR' },
      { key: 'beanToBarBadge', label: 'Üretim Tekniği', type: 'text', defaultValue: 'BEAN-TO-BAR • TAŞ DEĞİRMENDE 48 SAAT KONÇLANMIŞTIR' },
      { key: 'netWeightPrice', label: 'Gramaj & Fiyat', type: 'text', defaultValue: 'NET: 70G / 2.5 OZ • 140 ₺' }
    ],
    defaultData: {
      chocolatierName: 'NOIR & CACAO ARTISAN',
      originCocoa: '%82 MADAGASCAR SAMBIRANO',
      flavorNotes: 'KIRMIZI MEYVELER • TURUNÇGİL • SEDİR',
      beanToBarBadge: 'BEAN-TO-BAR • TAŞ DEĞİRMENDE 48 SAAT KONÇLANMIŞTIR',
      netWeightPrice: 'NET: 70G / 2.5 OZ • 140 ₺'
    }
  },

  // 69. CRAFT KOKTEYL ŞURUBU & BAR ŞİŞE ETİKETİ
  {
    id: 'tpl-cocktail-syrup-bottle',
    title: 'Craft Kokteyl Şurubu & Bar Şişe Etiketi',
    category: 'product',
    description: 'Barlar ve kafeler için ev yapımı çarkıfelek meyvesi / orman meyvesi şurubu şişesi, brix değeri ve kullanım oranı.',
    tags: ['şurup', 'kokteyl', 'bar', 'kahve şurubu', 'içecek', 'brix', 'artisan', 'şişe'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'syrupBrand', label: 'Marka / Bar Adı', type: 'text', defaultValue: 'BOTANICAL MIXOLOGY CO.' },
      { key: 'syrupFlavor', label: 'Şurup Aroması', type: 'text', defaultValue: 'PASSION FRUIT & VANILLA' },
      { key: 'syrupSpec', label: 'Brix & Doğallık', type: 'text', defaultValue: '65° BRIX • %100 GERÇEK MEYVE PÜRESİ' },
      { key: 'servingRatio', label: 'Önerilen Ölçü', type: 'text', defaultValue: '1 Kısım Şurup + 5 Kısım Soda / Kahve' },
      { key: 'bottleVolExpiry', label: 'Hacim & Saklama', type: 'text', defaultValue: '500 ML • Açıldıktan sonra buzdolabında saklayınız.' }
    ],
    defaultData: {
      syrupBrand: 'BOTANICAL MIXOLOGY CO.',
      syrupFlavor: 'PASSION FRUIT & VANILLA',
      syrupSpec: '65° BRIX • %100 GERÇEK MEYVE PÜRESİ',
      servingRatio: '1 Kısım Şurup + 5 Kısım Soda / Kahve',
      bottleVolExpiry: '500 ML • Açıldıktan sonra buzdolabında saklayınız.'
    }
  },

  // 70. KURU MEYVE & KURUYEMİŞ DOYPACK KİLİTLİ POŞET ETİKETİ
  {
    id: 'tpl-doypack-dried-fruits',
    title: 'Kuru Meyve & Kuruyemiş Doypack Kilitli Poşet Etiketi',
    category: 'product',
    description: 'Güneşte kurutulmuş meyve ve çiğ kuruyemiş ambalajları için besin değerleri, gluten/alerjen ikazı ve üretim yöresi.',
    tags: ['kuru meyve', 'kuruyemiş', 'doypack', 'organik', 'fındık', 'ceviz', 'sağlıklı gıda'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'farmBrand', label: 'Üretici Marka', type: 'text', defaultValue: 'ANADOLU GURME HASAT' },
      { key: 'productTitle', label: 'Ürün Adı', type: 'text', defaultValue: 'GÜNEŞTE KURUTULMUŞ MALATYA KAYISISI' },
      { key: 'processingMethod', label: 'İşleme Türü', type: 'text', defaultValue: '%100 Doğal Gün Kurusu • Kükürtsüz & İlave Şekersiz' },
      { key: 'nutritionSummary', label: 'Besin Değeri & Lif', type: 'text', defaultValue: '100g için: 241 kcal | Yüksek Lif & Potasyum Kaynağı' },
      { key: 'allergenNet', label: 'Alerjen & Net Ağırlık', type: 'text', defaultValue: 'Eser miktarda ceviz içerebilir • NET: 250G e' },
      { key: 'productBarcode', label: 'Barkod', type: 'barcode', defaultValue: '8690192837461' }
    ],
    defaultData: {
      farmBrand: 'ANADOLU GURME HASAT',
      productTitle: 'GÜNEŞTE KURUTULMUŞ MALATYA KAYISISI',
      processingMethod: '%100 Doğal Gün Kurusu • Kükürtsüz & İlave Şekersiz',
      nutritionSummary: '100g için: 241 kcal | Yüksek Lif & Potasyum Kaynağı',
      allergenNet: 'Eser miktarda ceviz içerebilir • NET: 250G e',
      productBarcode: '8690192837461'
    }
  },

  // 71. GURME BAHARAT & TÜTSÜ ÇEŞNİ KAVANOZ ETİKETİ
  {
    id: 'tpl-spice-jar-gastronomy',
    title: 'Gurme Baharat & Tütsü Çeşni Kavanoz Etiketi',
    category: 'product',
    description: 'Tütsülenmiş deniz tuzu, sumak, dağ kekiği kavanozları için cam kapak/gövde gurme baharat etiketi.',
    tags: ['baharat', 'kavanoz', 'çeşni', 'tuz', 'gurme', 'mutfak', 'organik', 'yemek'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'spiceBrand', label: 'Baharatçı / Marka', type: 'text', defaultValue: 'BAHARAT-I OSMANİYE' },
      { key: 'spiceName', label: 'Baharat Adı', type: 'text', defaultValue: 'KAYIN AĞACINDA TÜTSÜLENMİŞ DENİZ TUZU' },
      { key: 'usagePairing', label: 'Uyumlu Yemekler', type: 'text', defaultValue: 'Izgara etler, fırın sebzeler ve füme lezzetler için idealdir.' },
      { key: 'spiceNet', label: 'Net Ağırlık & Menşei', type: 'text', defaultValue: 'NET: 110G • Menşei: Türkiye' }
    ],
    defaultData: {
      spiceBrand: 'BAHARAT-I OSMANİYE',
      spiceName: 'KAYIN AĞACINDA TÜTSÜLENMİŞ DENİZ TUZU',
      usagePairing: 'Izgara etler, fırın sebzeler ve füme lezzetler için idealdir.',
      spiceNet: 'NET: 110G • Menşei: Türkiye'
    }
  },

  // 72. YENİDOĞAN BEBEK DOĞUM BİLGİ & ANI KARTI
  {
    id: 'tpl-baby-milestone-footprint',
    title: 'Yenidoğan Bebek Doğum Bilgi & Ayak İzi Anı Kartı',
    category: 'stickers',
    description: 'Doğum tarihi, doğum saati, boy, kilo, bebek ayak izi ve ebeveyn isimleri içeren hatıra kartı.',
    tags: ['bebek', 'doğum', 'yenidoğan', 'anı', 'hatıra', 'bebek ayak izi', 'milestone', 'hastane'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'welcomeHeading', label: 'Karşılama Başlığı', type: 'text', defaultValue: 'HOŞ GELDİN DÜNYAMIZA' },
      { key: 'babyFullName', label: 'Bebek Adı', type: 'text', defaultValue: 'MİRA DEMİR' },
      { key: 'birthDateTime', label: 'Doğum Tarihi & Saati', type: 'text', defaultValue: '27.08.2026 • 06:42' },
      { key: 'statsWeightHeight', label: 'Kilo & Boy', type: 'text', defaultValue: '3.420 GR • 51 CM' },
      { key: 'parentsNames', label: 'Anne & Baba', type: 'text', defaultValue: 'Zeynep & Emre Demir' }
    ],
    defaultData: {
      welcomeHeading: 'HOŞ GELDİN DÜNYAMIZA',
      babyFullName: 'MİRA DEMİR',
      birthDateTime: '27.08.2026 • 06:42',
      statsWeightHeight: '3.420 GR • 51 CM',
      parentsNames: 'Zeynep & Emre Demir'
    }
  },

  // 73. DÜĞÜN / NİŞAN MASA OTURMA & İSİM KARTI (PLACE CARD)
  {
    id: 'tpl-wedding-place-name-card',
    title: 'Düğün / Nişan Masa Oturma & İsim Kartı (Place Card)',
    category: 'organization',
    description: 'Çift isimleri, masa numarası, davetli adı, özel teşekkür notu ve zarif vintage çerçeve.',
    tags: ['düğün', 'nişan', 'masa kartı', 'place card', 'davetiye', 'oturma düzeni', 'vintage'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'coupleNames', label: 'Gelin & Damat', type: 'text', defaultValue: 'Ece & Caner' },
      { key: 'eventDate', label: 'Düğün Tarihi', type: 'text', defaultValue: '28 EYLÜL 2026' },
      { key: 'guestName', label: 'Davetli Adı', type: 'text', defaultValue: 'Sayın Prof. Dr. Ahmet Yılmaz' },
      { key: 'tableNumber', label: 'Masa Numarası', type: 'text', defaultValue: 'MASA 7' },
      { key: 'thankYouNote', label: 'Teşekkür Mesajı', type: 'text', defaultValue: 'Bu özel günümüzde yanımızda olduğunuz için teşekkür ederiz.' }
    ],
    defaultData: {
      coupleNames: 'Ece & Caner',
      eventDate: '28 EYLÜL 2026',
      guestName: 'Sayın Prof. Dr. Ahmet Yılmaz',
      tableNumber: 'MASA 7',
      thankYouNote: 'Bu özel günümüzde yanımızda olduğunuz için teşekkür ederiz.'
    }
  },

  // 74. KARGO & PALET "ÜST ÜSTE KOYMAYINIZ" AĞIR İKAZ (DO NOT STACK)
  {
    id: 'tpl-do-not-stack-pallet-tag',
    title: 'Kargo Palet "Üst Üste Koymayınız" Ağır İkaz (Do Not Stack)',
    category: 'warning',
    description: 'Kırmızı/siyah çapraz çizilmiş koli piktogramı, ezilebilir hassas yük uyarısı ve kargo takip barkodu.',
    tags: ['do not stack', 'üst üste koymayınız', 'kargo', 'palet', 'ağır yük', 'lojistik', 'kırılabilir', 'isg'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'cautionHeader', label: 'Üst İkaz', type: 'text', defaultValue: 'DİKKAT • HASSAS ÜST YÜZEY' },
      { key: 'mainWarningTr', label: 'Türkçe İkaz', type: 'text', defaultValue: 'ÜST ÜSTE KOYMAYINIZ' },
      { key: 'mainWarningEn', label: 'İngilizce İkaz', type: 'text', defaultValue: 'DO NOT STACK' },
      { key: 'riskReason', label: 'Sebep / Açıklama', type: 'text', defaultValue: 'Koli içerisinde hassas elektronik/cam mevcuttur. Ezilme riski yüksektir.' },
      { key: 'cargoBarcode', label: 'Taşıma Takip Barkodu', type: 'barcode', defaultValue: 'NO-STACK-901842' }
    ],
    defaultData: {
      cautionHeader: 'DİKKAT • HASSAS ÜST YÜZEY',
      mainWarningTr: 'ÜST ÜSTE KOYMAYINIZ',
      mainWarningEn: 'DO NOT STACK',
      riskReason: 'Koli içerisinde hassas elektronik/cam mevcuttur. Ezilme riski yüksektir.',
      cargoBarcode: 'NO-STACK-901842'
    }
  },

  // 75. KALİTE KONTROL ONAYLI / TEST EDİLDİ MÜHRÜ (QC INSPECTED & PASSED)
  {
    id: 'tpl-qc-passed-inspection-stamp',
    title: 'Kalite Kontrol Onay & Muayene Mührü (QC Passed Stamp)',
    category: 'inventory',
    description: 'Üretim hattı veya nihai ürün kabul için müfettiş sicil no, test tarihi, onay damgası ve seri numarası.',
    tags: ['qc passed', 'kalite kontrol', 'onay', 'test edildi', 'muayene', 'fabrika', 'üretim', 'mühür'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'companyTitle', label: 'Fabrika / Şirket Adı', type: 'text', defaultValue: 'ENDÜSTRİYEL ÜRETİM A.Ş.' },
      { key: 'qcStatus', label: 'Kontrol Durumu', type: 'text', defaultValue: 'QC PASSED • TEST EDİLDİ' },
      { key: 'inspectorId', label: 'Kontrol Eden Müfettiş', type: 'text', defaultValue: 'KONTROLÖR NO: QC-42' },
      { key: 'testDateBatch', label: 'Test Tarihi & Seri', type: 'text', defaultValue: '27.08.2026 • SERİ #8849-B' },
      { key: 'qcBarcode', label: 'Onay Doğrulama Barkodu', type: 'barcode', defaultValue: 'QC-PASS-8849' }
    ],
    defaultData: {
      companyTitle: 'ENDÜSTRİYEL ÜRETİM A.Ş.',
      qcStatus: 'QC PASSED • TEST EDİLDİ',
      inspectorId: 'KONTROLÖR NO: QC-42',
      testDateBatch: '27.08.2026 • SERİ #8849-B',
      qcBarcode: 'QC-PASS-8849'
    }
  },

  // ==========================================================
  // 76 - 100 YENİ ŞABLONLAR (Görsel Referansları & Sanatsal / Tipografik)
  // ==========================================================

  // 76. PARENTAL ADVISORY EXPLICIT CONTENT (Görsel Referans 1)
  {
    id: 'tpl-parental-advisory-music',
    title: 'Parental Advisory Explicit Content (İkonik Müzik Etiketi)',
    category: 'stickers',
    description: 'Dünya çapında albüm kapaklarında ve müzik kasetlerinde kullanılan efsanevi siyah-beyaz tipografik uyarı etiketi.',
    tags: ['parental advisory', 'müzik', 'albüm', 'explicit content', 'hiphop', 'retro', 'sticker', 'rock'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'topWord', label: 'Üst Başlık', type: 'text', defaultValue: 'PARENTAL' },
      { key: 'centerWord', label: 'Ana Kelime', type: 'text', defaultValue: 'ADVISORY' },
      { key: 'bottomWord', label: 'Alt İkaz', type: 'text', defaultValue: 'EXPLICIT CONTENT' },
      { key: 'albumArtistTag', label: 'Sanatçı / Koleksiyon Notu', type: 'text', defaultValue: 'LIMITED EDITION • VINYL RELEASE' }
    ],
    defaultData: {
      topWord: 'PARENTAL',
      centerWord: 'ADVISORY',
      bottomWord: 'EXPLICIT CONTENT',
      albumArtistTag: 'LIMITED EDITION • VINYL RELEASE'
    }
  },

  // 77. NUTRITION FACTS (FDA STANDART BESİN DEĞERLERİ TABLOSU) (Görsel Referans 3)
  {
    id: 'tpl-fda-nutrition-facts-label',
    title: 'FDA Standart Besin Değerleri Tablosu (Nutrition Facts)',
    category: 'product',
    description: 'Gıda ürünleri, kafeler ve atıştırmalık ambalajları için resmi porsiyon, kalori, yağ, şeker, protein ve vitamin oranları tablosu.',
    tags: ['nutrition facts', 'besin değerleri', 'kalori', 'gıda etiketi', 'fda', 'protein', 'karbonhidrat', 'organik'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'title', label: 'Tablo Başlığı', type: 'text', defaultValue: 'Nutrition Facts' },
      { key: 'servingSize', label: 'Porsiyon Boyutu', type: 'text', defaultValue: 'Serving size 1 potato (148g/5.2oz)' },
      { key: 'calories', label: 'Kalori Miktarı', type: 'text', defaultValue: '110' },
      { key: 'dailyValueNote', label: 'Günlük Değer İndeksi', type: 'text', defaultValue: '% Daily Value*' },
      { key: 'totalFat', label: 'Toplam Yağ', type: 'text', defaultValue: '0g (0%)' },
      { key: 'sodium', label: 'Sodyum', type: 'text', defaultValue: '0mg (0%)' },
      { key: 'totalCarb', label: 'Toplam Karbonhidrat', type: 'text', defaultValue: '26g (9%)' },
      { key: 'dietaryFiber', label: 'Lif', type: 'text', defaultValue: '2g (7%)' },
      { key: 'protein', label: 'Protein', type: 'text', defaultValue: '3g' },
      { key: 'potassium', label: 'Potasyum', type: 'text', defaultValue: '620mg (15%)' },
      { key: 'vitaminC', label: 'C Vitamini', type: 'text', defaultValue: '27mg (30%)' }
    ],
    defaultData: {
      title: 'Nutrition Facts',
      servingSize: 'Serving size 1 potato (148g/5.2oz)',
      calories: '110',
      dailyValueNote: '% Daily Value*',
      totalFat: '0g (0%)',
      sodium: '0mg (0%)',
      totalCarb: '26g (9%)',
      dietaryFiber: '2g (7%)',
      protein: '3g',
      potassium: '620mg (15%)',
      vitaminC: '27mg (30%)'
    }
  },

  // 78. WARNING: SCROLLING KILLS (DİJİTAL DETOKS & EKRAN BAĞIMLILIĞI) (Görsel Referans 4)
  {
    id: 'tpl-warning-scrolling-kills',
    title: 'Warning: Scrolling Kills (Dijital Detoks & Ekran İkazı)',
    category: 'warning',
    description: 'Ekran süresi, sosyal medya detoksu ve odaklanma için yüksek kontrastlı, zebra şeritli ve barkodlu modern ikaz posteri.',
    tags: ['scrolling kills', 'dijital detoks', 'odak', 'ekran süresi', 'telefon uyarısı', 'minimalist', 'poster'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'headerNotice', label: 'Üst Uyarı Bandı', type: 'text', defaultValue: 'WARNING' },
      { key: 'mainHeadlineWord1', label: 'Ana Başlık 1. Satır', type: 'text', defaultValue: 'SCROLLING' },
      { key: 'mainHeadlineWord2', label: 'Ana Başlık 2. Satır', type: 'text', defaultValue: 'KILLS' },
      { key: 'screenQuote', label: 'Detoks Cümlesi', type: 'text', defaultValue: "DON'T LET THE SCREEN STEAL YOUR LIFE." },
      { key: 'lifeQuote', label: 'Alt Yaşam Mesajı', type: 'text', defaultValue: 'YOUR LIFE. YOUR TIME. YOUR CHOICE.' },
      { key: 'taglineRight', label: 'Sağ Alt Slogan', type: 'text', defaultValue: 'REAL LIFE > ONLINE' },
      { key: 'detoxBarcode', label: 'Barkod Değeri', type: 'barcode', defaultValue: 'DETOX-2026-LIFE' }
    ],
    defaultData: {
      headerNotice: 'WARNING',
      mainHeadlineWord1: 'SCROLLING',
      mainHeadlineWord2: 'KILLS',
      screenQuote: "DON'T LET THE SCREEN STEAL YOUR LIFE.",
      lifeQuote: 'YOUR LIFE. YOUR TIME. YOUR CHOICE.',
      taglineRight: 'REAL LIFE > ONLINE',
      detoxBarcode: 'DETOX-2026-LIFE'
    }
  },

  // 79. MOTIVATION: YOU'RE NOT RICH YET (HUSTLE & DİSİPLİN POSTERİ) (Görsel Referans 5)
  {
    id: 'tpl-motivation-not-rich-yet',
    title: "You're Not Rich Yet (Hustle & Disiplin Motivasyon Posteri)",
    category: 'stickers',
    description: '4 disiplin ikonu (Work Hard, Save Time, Think Smart, Don’t Quit), dev tipografi, Fragile Kırık Kalp ve %100 Organik Başarı mührü.',
    tags: ['motivasyon', 'disiplin', 'hustle', 'girişimcilik', 'zenginlik', 'çalışma', 'ofis', 'poster'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'heroMessage', label: 'Ana Vurucu Başlık', type: 'text', defaultValue: "YOU'RE NOT RICH YET" },
      { key: 'pill1', label: '1. İlke', type: 'text', defaultValue: 'WORK HARD' },
      { key: 'pill2', label: '2. İlke', type: 'text', defaultValue: 'SAVE TIME' },
      { key: 'pill3', label: '3. İlke', type: 'text', defaultValue: 'THINK SMART' },
      { key: 'pill4', label: '4. İlke', type: 'text', defaultValue: "DON'T QUIT" },
      { key: 'cautionNotice', label: 'İkaz Kutusu', type: 'text', defaultValue: 'LONG HOURS MAY CAUSE BIG RESULTS' },
      { key: 'successWarning', label: 'Başarı Uyarısı', type: 'text', defaultValue: 'MAY CONTAIN REAL SUCCESS' },
      { key: 'serialBarcode', label: 'Seri Numarası Barkod', type: 'barcode', defaultValue: 'HUSTLE-9999-$$$$' }
    ],
    defaultData: {
      heroMessage: "YOU'RE NOT RICH YET",
      pill1: 'WORK HARD',
      pill2: 'SAVE TIME',
      pill3: 'THINK SMART',
      pill4: "DON'T QUIT",
      cautionNotice: 'LONG HOURS MAY CAUSE BIG RESULTS',
      successWarning: 'MAY CONTAIN REAL SUCCESS',
      serialBarcode: 'HUSTLE-9999-$$$$'
    }
  },

  // 80. OVERTHINKERS CLUB MEMBERSHIP CARD (Görsel Referans 2)
  {
    id: 'tpl-overthinkers-club-id-card',
    title: 'Overthinkers Club Resmi Üyelik Kartı (Kafatası Rozetli ID)',
    category: 'stickers',
    description: 'Aşırı düşünenler kulübü retro iskelet illüstrasyonu, üye no, isim, e-posta ve beceri alanı bulunan esprili kimlik kartı.',
    tags: ['overthinking', 'üyelik kartı', 'skelet', 'mizah', 'ofis', 'retro', 'kimlik', 'sticker'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'clubTitle', label: 'Kulüp Adı', type: 'text', defaultValue: 'OVERTHINKERS CLUB' },
      { key: 'badgeSubtitle', label: 'Kart Türü', type: 'text', defaultValue: 'OFFICIAL MEMBERSHIP CARD' },
      { key: 'memberName', label: 'Üye Adı Soyadı', type: 'text', defaultValue: 'Mert Aksoy' },
      { key: 'memberPhone', label: 'Telefon / İletişim', type: 'text', defaultValue: '+90 (555) OVER-THINK' },
      { key: 'memberEmail', label: 'E-Posta', type: 'text', defaultValue: 'overthinking@mind.com' },
      { key: 'specialSkill', label: 'Özel Yetenek / Beceri', type: 'text', defaultValue: "Overthinking about how I'm overthinking." },
      { key: 'memberIdNumber', label: 'Üye ID No', type: 'text', defaultValue: 'ID NO: #99481-OT' }
    ],
    defaultData: {
      clubTitle: 'OVERTHINKERS CLUB',
      badgeSubtitle: 'OFFICIAL MEMBERSHIP CARD',
      memberName: 'Mert Aksoy',
      memberPhone: '+90 (555) OVER-THINK',
      memberEmail: 'overthinking@mind.com',
      specialSkill: "Overthinking about how I'm overthinking.",
      memberIdNumber: 'ID NO: #99481-OT'
    }
  },

  // 81. DON'T TOUCH MY TOOLS (ATÖLYE & TAMİR İKAZI) (Görsel Referans 2)
  {
    id: 'tpl-warning-dont-touch-my-tools',
    title: "Don't Touch My Tools (Atölye & Takım Çantası İkazı)",
    category: 'warning',
    description: 'Tamirciler, marangozlar ve ustalar için alet çantası, anahtar ve kırmızı-siyah güçlü takım koruma uyarısı.',
    tags: ['aletler', 'takım çantası', 'dokunma', 'usta', 'atölye', 'garaj', 'tamirci', 'ikaz'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'warningHeader', label: 'Üst İkaz Bandı', type: 'text', defaultValue: 'WARNING' },
      { key: 'subHeader', label: 'Alt Başlık', type: 'text', defaultValue: "DON'T TOUCH MY" },
      { key: 'bigWord', label: 'Vurgulu Kelime', type: 'text', defaultValue: 'TOOLS' },
      { key: 'ownerName', label: 'Alet Sahibi', type: 'text', defaultValue: 'MÜLKİYET: BAŞUSTA AHMET' },
      { key: 'punishmentNotice', label: 'İhlal Uyarısı', type: 'text', defaultValue: 'İzinsiz alanın aletleri elinden alınır!' }
    ],
    defaultData: {
      warningHeader: 'WARNING',
      subHeader: "DON'T TOUCH MY",
      bigWord: 'TOOLS',
      ownerName: 'MÜLKİYET: BAŞUSTA AHMET',
      punishmentNotice: 'İzinsiz alanın aletleri elinden alınır!'
    }
  },

  // 82. SLOW DOWN - WE GET PAID BY THE HOUR (Görsel Referans 2)
  {
    id: 'tpl-slow-down-paid-by-hour',
    title: 'Slow Down We Get Paid By The Hour (Mizahi Çalışma Levhası)',
    category: 'warning',
    description: 'Sarı-siyah trafik levhası tasarımında saatlik ücret çalışanları ve şantiyeler için esprili çalışma hızı ikazı.',
    tags: ['slow down', 'saatlik ücret', 'şantiye', 'mizah', 'trafik levhası', 'ofis', 'yavaş', 'sarı siyah'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'topLine', label: 'Üst Satır', type: 'text', defaultValue: 'SLOW' },
      { key: 'bottomLine', label: 'Orta Satır', type: 'text', defaultValue: 'DOWN' },
      { key: 'punchline', label: 'Esprili Mesaj', type: 'text', defaultValue: 'WE GET PAID BY THE HOUR' },
      { key: 'crewNotice', label: 'Ekip Bilgisi', type: 'text', defaultValue: 'RELAXED WORK CRET • 2026' }
    ],
    defaultData: {
      topLine: 'SLOW',
      bottomLine: 'DOWN',
      punchline: 'WE GET PAID BY THE HOUR',
      crewNotice: 'RELAXED WORK CREW • 2026'
    }
  },

  // 83. AREA 51 WARNING / RESTRICTED ALIEN AREA (Görsel Referans 2)
  {
    id: 'tpl-area-51-alien-restricted',
    title: 'Area 51 Warning / Restricted Alien Area (UFO Askeri Levhası)',
    category: 'warning',
    description: 'UFO ve uzaylı piktogramı, kırmızı-siyah askeri güvenlik uyarısı ve gizli bölge giriş yasağı çıkartması.',
    tags: ['area 51', 'ufo', 'alien', 'uzaylı', 'askeri', 'restricted area', 'yasak bölge', 'retro'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'warningBadge', label: 'Üst İkaz', type: 'text', defaultValue: 'WARNING' },
      { key: 'baseName', label: 'Üs Adı', type: 'text', defaultValue: 'AREA 51' },
      { key: 'entryNotice', label: 'Giriş Yasağı', type: 'text', defaultValue: 'NO TRESPASSING • RESTRICTED AREA' },
      { key: 'securityLevel', label: 'Güvenlik Protokolü', type: 'text', defaultValue: 'USE OF DEADLY FORCE AUTHORIZED' }
    ],
    defaultData: {
      warningBadge: 'WARNING',
      baseName: 'AREA 51',
      entryNotice: 'NO TRESPASSING • RESTRICTED AREA',
      securityLevel: 'USE OF DEADLY FORCE AUTHORIZED'
    }
  },

  // 84. DANGER SHARK ZONE (RETRO MARİN KÖPEKBALIĞI LEVHASI) (Görsel Referans 2)
  {
    id: 'tpl-danger-shark-zone-vintage',
    title: 'Danger Shark Zone (Retro Marin Köpekbalığı Levhası)',
    category: 'warning',
    description: 'Köpekbalığı yüzgeci silüeti, derin deniz dokusu ve plaj/sörf kulüpleri için nostaljik tehlike levhası.',
    tags: ['shark', 'köpekbalığı', 'deniz', 'plaj', 'danger', 'sörf', 'marin', 'retro'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'dangerHeader', label: 'Tehlike Başlığı', type: 'text', defaultValue: 'DANGER' },
      { key: 'hazardSubject', label: 'Tehlike Konusu', type: 'text', defaultValue: 'SHARK' },
      { key: 'zoneText', label: 'Bölge Yazısı', type: 'text', defaultValue: 'ZONE' },
      { key: 'swimWarning', label: 'Yüzme Uyarısı', type: 'text', defaultValue: 'SWIM AT YOUR OWN RISK • DEEP WATER' }
    ],
    defaultData: {
      dangerHeader: 'DANGER',
      hazardSubject: 'SHARK',
      zoneText: 'ZONE',
      swimWarning: 'SWIM AT YOUR OWN RISK • DEEP WATER'
    }
  },

  // 85. PERİYODİK ELEMENT: CO-13 COFFEE (KİMYASAL KAHVE ETİKETİ) (Görsel Referans 2)
  {
    id: 'tpl-periodic-coffee-co13',
    title: 'Periyodik Tablo: Co-13 Kahve Elementi (Periodic Coffee)',
    category: 'stickers',
    description: 'Kimya periyodik tablosu kutucuğu biçiminde atom numarası 13, Co simgesi, kafein kütlesi ve kahve tutkusu etiketi.',
    tags: ['kahve', 'periyodik tablo', 'coffee', 'kimya', 'kafein', 'espresso', 'barista', 'kupa'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'atomicNumber', label: 'Atom Numarası', type: 'text', defaultValue: '13' },
      { key: 'symbol', label: 'Element Sembolü', type: 'text', defaultValue: 'Co' },
      { key: 'elementName', label: 'Element Adı', type: 'text', defaultValue: 'Coffee' },
      { key: 'atomicMass', label: 'Atom Kütlesi / Kafein', type: 'text', defaultValue: '194.19 g/mol (Pure Caffeine)' },
      { key: 'roastOrigin', label: 'Kavrum & Çekirdek', type: 'text', defaultValue: 'Dark Roast • 100% Arabica' }
    ],
    defaultData: {
      atomicNumber: '13',
      symbol: 'Co',
      elementName: 'Coffee',
      atomicMass: '194.19 g/mol (Pure Caffeine)',
      roastOrigin: 'Dark Roast • 100% Arabica'
    }
  },

  // 86. PERİYODİK ELEMENT: SC-14 SARCASM (KİMYASAL SARKAZM ETİKETİ) (Görsel Referans 2)
  {
    id: 'tpl-periodic-sarcasm-sc14',
    title: 'Periyodik Tablo: Sc-14 Sarkazm Elementi (Periodic Sarcasm)',
    category: 'stickers',
    description: 'Kimya periyodik tablosu formatında atom no 14, Sc simgesi, iğneleyici espri ve ofis mizahı çıkartması.',
    tags: ['sarkazm', 'sarcasm', 'periyodik tablo', 'kimya', 'mizah', 'ofis', 'esprili', 'sticker'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'atomicNumber', label: 'Atom Numarası', type: 'text', defaultValue: '14' },
      { key: 'symbol', label: 'Element Sembolü', type: 'text', defaultValue: 'Sc' },
      { key: 'elementName', label: 'Element Adı', type: 'text', defaultValue: 'Sarcasm' },
      { key: 'toxicityLevel', label: 'Toksisite / Doz', type: 'text', defaultValue: '100% Natural Wit & Irony' },
      { key: 'usageWarning', label: 'Kullanım Uyarısı', type: 'text', defaultValue: 'Handle with extreme care around sensitive souls.' }
    ],
    defaultData: {
      atomicNumber: '14',
      symbol: 'Sc',
      elementName: 'Sarcasm',
      toxicityLevel: '100% Natural Wit & Irony',
      usageWarning: 'Handle with extreme care around sensitive souls.'
    }
  },

  // 87. I AM NOT A MORNING PERSON (SABAH İNSANI DEĞİLİM KAHVE ÇIKARTMASI) (Görsel Referans 2)
  {
    id: 'tpl-not-a-morning-person',
    title: 'I Am Not A Morning Person (Kahve Kupalı Sabah Çıkartması)',
    category: 'stickers',
    description: 'Kahve kupası silüeti, kalın çerçeve ve sabahları konuşmak istemeyenler için retro ofis/termos etiketi.',
    tags: ['morning person', 'sabah', 'kahve', 'ofis', 'uyku', 'pazartesi', 'termos', 'mizah'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'headlinePart1', label: '1. Satır', type: 'text', defaultValue: 'I AM NOT A' },
      { key: 'headlinePart2', label: '2. Satır', type: 'text', defaultValue: 'MORNING' },
      { key: 'headlinePart3', label: '3. Satır', type: 'text', defaultValue: 'PERSON' },
      { key: 'coffeeStatus', label: 'Kahve Durumu', type: 'text', defaultValue: 'First Coffee, Then We Talk.' }
    ],
    defaultData: {
      headlinePart1: 'I AM NOT A',
      headlinePart2: 'MORNING',
      headlinePart3: 'PERSON',
      coffeeStatus: 'First Coffee, Then We Talk.'
    }
  },

  // 88. LOW BATTERY 1% - NEED PROTEIN / WORKOUT (Görsel Referans 2)
  {
    id: 'tpl-low-battery-need-protein',
    title: 'Low Battery 1% - Need Protein / Workout (Fitness & Şarj İkazı)',
    category: 'stickers',
    description: 'Kritik seviyede %1 kırmızı pil simgesi, protein tozu ihtiyacı ve antrenman şarj uyarısı.',
    tags: ['fitness', 'protein', 'batarya', 'şarj', 'gym', 'antrenman', 'enerji', 'spor'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'batteryPercent', label: 'Pil Seviyesi', type: 'text', defaultValue: '1% BATTERY' },
      { key: 'mainNeed', label: 'Ana İhtiyaç', type: 'text', defaultValue: 'NEED PROTEIN' },
      { key: 'subAdvice', label: 'Tavsiye / Aksiyon', type: 'text', defaultValue: 'Shake Well & Hit The Gym' },
      { key: 'disciplineSwitch', label: 'Disiplin Anahtarı', type: 'text', defaultValue: 'DISCIPLINE: ON' }
    ],
    defaultData: {
      batteryPercent: '1% BATTERY',
      mainNeed: 'NEED PROTEIN',
      subAdvice: 'Shake Well & Hit The Gym',
      disciplineSwitch: 'DISCIPLINE: ON'
    }
  },

  // 89. EAT SLEEP GYM REPEAT (MİNİMALİST AĞIR TİPOGRAFİ SPOR ETİKETİ) (Görsel Referans 2)
  {
    id: 'tpl-eat-sleep-gym-repeat',
    title: 'Eat Sleep Gym Repeat (Minimalist Ağır Tipografi Spor Etiketi)',
    category: 'stickers',
    description: 'Siyah-beyaz 4 katmanlı monolitik tipografi, fitness tutkunları ve spor salonu shaker şişeleri için şablon.',
    tags: ['eat sleep gym repeat', 'fitness', 'gym', 'vücut geliştirme', 'spor', 'tipografi', 'shaker'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'word1', label: '1. Kelime', type: 'text', defaultValue: 'EAT' },
      { key: 'word2', label: '2. Kelime', type: 'text', defaultValue: 'SLEEP' },
      { key: 'word3', label: '3. Kelime', type: 'text', defaultValue: 'GYM' },
      { key: 'word4', label: '4. Kelime', type: 'text', defaultValue: 'REPEAT' },
      { key: 'gymMotto', label: 'Slogan / Kulüp', type: 'text', defaultValue: 'NO PAIN NO GAIN • ATHLETIC CLUB' }
    ],
    defaultData: {
      word1: 'EAT',
      word2: 'SLEEP',
      word3: 'GYM',
      word4: 'REPEAT',
      gymMotto: 'NO PAIN NO GAIN • ATHLETIC CLUB'
    }
  },

  // 90. USPS PRIORITY MAIL RETRO KARGO ETİKETİ (Görsel Referans 2)
  {
    id: 'tpl-usps-priority-mail-vintage',
    title: 'USPS Priority Mail Retro Kargo & Sevkiyat Etiketi',
    category: 'shipping',
    description: 'Sol üstte dev P harfi, posta ücreti ödendi damgası, gönderici/alıcı adres kutusu ve teslimat doğrulama barkodu.',
    tags: ['usps', 'priority mail', 'kargo', 'retro', 'sevkiyat', 'posta', 'barkod', 'etiket'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'postagePaid', label: 'Posta Damgası Metni', type: 'text', defaultValue: 'US POSTAGE AND FEES PAID' },
      { key: 'mailClass', label: 'Gönderi Sınıfı', type: 'text', defaultValue: 'USPS PRIORITY MAIL®' },
      { key: 'fromAddress', label: 'Gönderici Bilgisi', type: 'text', defaultValue: 'Dr. Harry Whitehouse\n247 High St. Palo Alto, CA' },
      { key: 'toAddress', label: 'Alıcı Bilgisi', type: 'text', defaultValue: 'Shipping Department\nSanford Brands, 2200 Foster Ave\nJanesville, WI 53545' },
      { key: 'trackingBarcode', label: 'Teslimat Takip Barkodu', type: 'barcode', defaultValue: '4205354591123412341234' }
    ],
    defaultData: {
      postagePaid: 'US POSTAGE AND FEES PAID',
      mailClass: 'USPS PRIORITY MAIL®',
      fromAddress: 'Dr. Harry Whitehouse\n247 High St. Palo Alto, CA',
      toAddress: 'Shipping Department\nSanford Brands, 2200 Foster Ave\nJanesville, WI 53545',
      trackingBarcode: '4205354591123412341234'
    }
  },

  // 91. TYPOGRAPHIC MAZE: GOOD TYPE IS ABOUT FINDING WORDS (Görsel Referans 6)
  {
    id: 'tpl-typographic-maze-words',
    title: 'Typographic Maze: Good Type Is About Finding Words',
    category: 'stickers',
    description: 'Labirent çizgileri içine gömülü geometrik tipografi sanat eseri; tasarım stüdyoları ve tipografi severler için özel poster.',
    tags: ['labirent', 'tipografi', 'maze', 'grafik tasarım', 'sanat', 'minimalist', 'poster'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'mazeHeadline', label: 'Gizli Labirent Mesajı', type: 'text', defaultValue: 'GOOD TYPE IS ABOUT FINDING THE RIGHT WORDS' },
      { key: 'studioName', label: 'Tasarım Stüdyosu', type: 'text', defaultValue: 'TYPOGRAPHY ARCHIVE • LABYRINTH EDITION' }
    ],
    defaultData: {
      mazeHeadline: 'GOOD TYPE IS ABOUT FINDING THE RIGHT WORDS',
      studioName: 'TYPOGRAPHY ARCHIVE • LABYRINTH EDITION'
    }
  },

  // 92. LABERINTO - BORGES DİKEY EDEBİ LABİRENT ŞİİR ETİKETİ (Görsel Referans 7)
  {
    id: 'tpl-laberinto-borges-poem',
    title: 'Laberinto Borges Dikey Edebi Labirent Şiir Etiketi',
    category: 'stickers',
    description: 'Jorge Luis Borges’in ölümsüz Laberinto şiirinin dikey labirent grid tipografisiyle birleştiği koleksiyonluk edebi etiket.',
    tags: ['borges', 'laberinto', 'şiir', 'edebiyat', 'kitap', 'sanat', 'dikey tipografi', 'kitapayracı'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'headerTitle', label: 'Üst Başlık', type: 'text', defaultValue: '-LABERINTO- (FRAGMENTO)' },
      { key: 'poemLines', label: 'Şiir Dizesi', type: 'text', defaultValue: 'NO HABRÁ NUNCA UNA PUERTA. ESTÁS ADENTRO Y EL ALCÁZAR ABARCA EL UNIVERSO.' },
      { key: 'authorSignature', label: 'Yazar İmzası', type: 'text', defaultValue: 'Jorge Luis Borges' }
    ],
    defaultData: {
      headerTitle: '-LABERINTO- (FRAGMENTO)',
      poemLines: 'NO HABRÁ NUNCA UNA PUERTA. ESTÁS ADENTRO Y EL ALCÁZAR ABARCA EL UNIVERSO.',
      authorSignature: 'Jorge Luis Borges'
    }
  },

  // 93. GOOD / BAD! DİKEY UZATILMIŞ TİPOGRAFİK TASARIM ROZETİ (Görsel Referans 9)
  {
    id: 'tpl-good-bad-vertical-stretch',
    title: 'Good / Bad! Dikey Uzatılmış Tipografik Tasarım Rozeti',
    category: 'stickers',
    description: 'Ultra uzun harf gövdeleriyle oluşturulan "GOOD / BAD!" çift anlamlı modern grafik illüstrasyon çıkartması.',
    tags: ['good bad', 'tipografi', 'dikey', 'illüstrasyon', 'tasarımcı', 'sticker', 'monokrom'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'topWord', label: 'Üst Anlam', type: 'text', defaultValue: 'GOOD' },
      { key: 'bottomWord', label: 'Alt Anlam', type: 'text', defaultValue: 'BAD!' },
      { key: 'conceptNote', label: 'Konsept Notu', type: 'text', defaultValue: 'DUALITY OF DESIGN • AMBIGRAM EDITION' }
    ],
    defaultData: {
      topWord: 'GOOD',
      bottomWord: 'BAD!',
      conceptNote: 'DUALITY OF DESIGN • AMBIGRAM EDITION'
    }
  },

  // 94. CYBERPUNK MATRIX ŞİFRELİ PİKSEL & GİZLİ KOD KARTI (Görsel Referans 8)
  {
    id: 'tpl-cyberpunk-matrix-cipher',
    title: 'Cyberpunk Matrix Şifreli Piksel & Gizli Kod Kartı',
    category: 'stickers',
    description: 'Piksel matrix ızgarası, lazerle taranabilir şifreleme deseni ve gizli mesaj ortaya çıkarma kartı.',
    tags: ['matrix', 'şifre', 'piksel', 'cyberpunk', 'kod', 'gizli mesaj', 'puzzle', 'qr'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'cardHeader', label: 'Kart Başlığı', type: 'text', defaultValue: 'CIPHER GRID MATRIX • DECODER CARD' },
      { key: 'secretCodeKey', label: 'Gizli Kod Anahtarı', type: 'text', defaultValue: 'KEY: #X9-CYBER-2026' },
      { key: 'instructionText', label: 'Kullanım Talimatı', type: 'text', defaultValue: 'Slide decoder overlay over the grid to reveal message.' },
      { key: 'terminalQr', label: 'Şifre Çözücü QR', type: 'qrcode', defaultValue: 'https://cipher.decode.net/matrix/x9' }
    ],
    defaultData: {
      cardHeader: 'CIPHER GRID MATRIX • DECODER CARD',
      secretCodeKey: 'KEY: #X9-CYBER-2026',
      instructionText: 'Slide decoder overlay over the grid to reveal message.',
      terminalQr: 'https://cipher.decode.net/matrix/x9'
    }
  },

  // 95. MADE IN JAPAN AKILLI BARKOD & KARAKTER SANATI (Görsel Referans 2)
  {
    id: 'tpl-made-in-japan-barcode-art',
    title: 'Made In Japan Akıllı Barkod & Karakter Sanatı (Sticker)',
    category: 'product',
    description: 'Japon kanji yazısı (日本製), dikey entegre barkod çizgileri ve maskot illüstrasyonu içeren sokak tarzı sticker.',
    tags: ['made in japan', 'japon', 'barkod sanatı', 'kanji', 'streetwear', 'tokyo', 'sticker'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'kanjiTitle', label: 'Kanji Başlık', type: 'text', defaultValue: '日本製' },
      { key: 'englishTitle', label: 'İngilizce Başlık', type: 'text', defaultValue: 'MADE IN JAPAN' },
      { key: 'brandOrigin', label: 'Menşei & Şehir', type: 'text', defaultValue: 'TOKYO STREETWEAR LAB' },
      { key: 'verticalCode', label: 'Entegre Barkod', type: 'barcode', defaultValue: '4901234567890' }
    ],
    defaultData: {
      kanjiTitle: '日本製',
      englishTitle: 'MADE IN JAPAN',
      brandOrigin: 'TOKYO STREETWEAR LAB',
      verticalCode: '4901234567890'
    }
  },

  // 96. FRAGILE BROKEN HEART HANDLE WITH CARE (Görsel Referans 2 & 5)
  {
    id: 'tpl-fragile-broken-heart-cargo',
    title: 'Fragile Broken Heart Handle With Care (Mizahi Kırılgan Kalp)',
    category: 'shipping',
    description: 'Kırık kalp piktogramı, kırılabilir kargo ikazları ve "Duygular içerir, dikkatli tutunuz" esprili kargo şablonu.',
    tags: ['fragile', 'kırık kalp', 'kargo', 'handle with care', 'kırılabilir', 'mizah', 'hediye'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'badgeNumber', label: 'Büyük İkaz Numarası', type: 'text', defaultValue: '21' },
      { key: 'headerWarning', label: 'Ana İkaz', type: 'text', defaultValue: 'FRAGILE' },
      { key: 'subInstruction', label: 'Taşıma Talimatı', type: 'text', defaultValue: 'HANDLE WITH CARE • DON’T FALL NOT PRESSURE' },
      { key: 'fragileReason', label: 'İçerik Uyarısı', type: 'text', defaultValue: 'May contain sensitive human feelings.' },
      { key: 'cargoTracking', label: 'Kargo Barkodu', type: 'barcode', defaultValue: 'HEART-FRAGILE-21' }
    ],
    defaultData: {
      badgeNumber: '21',
      headerWarning: 'FRAGILE',
      subInstruction: 'HANDLE WITH CARE • DON’T FALL NOT PRESSURE',
      fragileReason: 'May contain sensitive human feelings.',
      cargoTracking: 'HEART-FRAGILE-21'
    }
  },

  // 97. SPEED LIMIT 69 / ESPRİLİ TRAFİK LEVHASI (Görsel Referans 2)
  {
    id: 'tpl-speed-limit-69-humor',
    title: 'Speed Limit 69 / Esprili Trafik & Hız Sınırı Levhası',
    category: 'warning',
    description: 'Resmi otoyol hız sınırı tabelası formatında SPEED LIMIT ve devasa sayı içeren ikonik otomobil/oda çıkartması.',
    tags: ['speed limit', 'hız sınırı', 'trafik levhası', 'mizah', 'araba', 'garaj', 'sticker', 'yol'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'limitWord1', label: 'Üst Satır', type: 'text', defaultValue: 'SPEED' },
      { key: 'limitWord2', label: 'Orta Satır', type: 'text', defaultValue: 'LIMIT' },
      { key: 'speedNumber', label: 'Hız Limiti Sayısı', type: 'text', defaultValue: '69' },
      { key: 'highwayNotice', label: 'Otoyol Notu', type: 'text', defaultValue: 'MINIMUM SPEED OF ENJOYMENT' }
    ],
    defaultData: {
      limitWord1: 'SPEED',
      limitWord2: 'LIMIT',
      speedNumber: '69',
      highwayNotice: 'MINIMUM SPEED OF ENJOYMENT'
    }
  },

  // 98. ARGON & ASPHYXIATION GAS WARNING (SANAYİ GAZ İKAZI) (Görsel Referans 2)
  {
    id: 'tpl-argon-gas-hazard-warning',
    title: 'Argon Asfiksi & Boğulma Gaz Tehlikesi İkazı (Argon Warning)',
    category: 'warning',
    description: 'Endüstriyel argon tankı, oksijen yetersizliği ve gaz kaçağı alarmı durumunda tahliye güvenlik levhası.',
    tags: ['argon', 'gaz ikazı', 'asphyxiation', 'isg', 'fabrika', 'oksijen', 'sanayi', 'tehlike'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'warningTitle', label: 'Uyarı Başlığı', type: 'text', defaultValue: 'WARNING' },
      { key: 'gasName', label: 'Gaz Türü', type: 'text', defaultValue: 'ARGON' },
      { key: 'hazardDesc', label: 'Tehlike Tanımı', type: 'text', defaultValue: 'HIGH CONCENTRATION OF GAS CAN OCCUR IN THIS AREA AND CAN CAUSE ASPHYXIATION.' },
      { key: 'o2CheckRule', label: 'Oksijen Kontrol Kuralı', type: 'text', defaultValue: 'VERIFY THAT OXYGEN CONCENTRATION IS ABOVE 19.5% BEFORE ENTERING.' },
      { key: 'alarmDirective', label: 'Alarm Direktifi', type: 'text', defaultValue: 'IF ALARM IS SOUNDING - DO NOT ENTER ROOM.' }
    ],
    defaultData: {
      warningTitle: 'WARNING',
      gasName: 'ARGON',
      hazardDesc: 'HIGH CONCENTRATION OF GAS CAN OCCUR IN THIS AREA AND CAN CAUSE ASPHYXIATION.',
      o2CheckRule: 'VERIFY THAT OXYGEN CONCENTRATION IS ABOVE 19.5% BEFORE ENTERING.',
      alarmDirective: 'IF ALARM IS SOUNDING - DO NOT ENTER ROOM.'
    }
  },

  // 99. COFFEE LOADING / OVERTHINKING 28% İLERLEME ÇUBUĞU ROZETİ (Görsel Referans 2)
  {
    id: 'tpl-coffee-overthinking-progress',
    title: 'Coffee Loading / Overthinking %28 İlerleme Çubuğu Rozeti',
    category: 'stickers',
    description: 'Yükleme çubuğu (progress bar), yüzde göstergesi ve yazılımcı/tasarımcı için kafein seviyesi kapsülü.',
    tags: ['loading', 'overthinking', 'progress bar', 'ilerleme çubuğu', 'yazılımcı', 'kahve', 'sticker'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'taskLabel', label: 'İşlem Başlığı', type: 'text', defaultValue: 'overthinking' },
      { key: 'percentage', label: 'Yüzde Oranı', type: 'text', defaultValue: '28%' },
      { key: 'estimatedTime', label: 'Tahmini Süre', type: 'text', defaultValue: 'Estimated time remaining: ALL NIGHT' },
      { key: 'statusState', label: 'Durum Bilgisi', type: 'text', defaultValue: 'STATUS: BUFFERING IDEAS...' }
    ],
    defaultData: {
      taskLabel: 'overthinking',
      percentage: '28%',
      estimatedTime: 'Estimated time remaining: ALL NIGHT',
      statusState: 'STATUS: BUFFERING IDEAS...'
    }
  },

  // 100. FAKE NEWS / NOSTALJİK GAZETE MANŞET & ARŞİV DAMGASI (Görsel Referans 2)
  {
    id: 'tpl-fake-news-vintage-newspaper',
    title: 'Fake News / Nostaljik Gazete Manşet & Arşiv Damgası',
    category: 'stickers',
    description: 'Eski gazete destesi piktogramı, FAKE damgası ve retro arşiv manşeti görünümünde sanatsal baskı etiketi.',
    tags: ['fake news', 'gazete', 'vintage', 'manşet', 'arşiv', 'retro', 'basın', 'damga'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'stampText', label: 'Büyük Damga', type: 'text', defaultValue: 'FAKE' },
      { key: 'paperName', label: 'Gazete Başlığı', type: 'text', defaultValue: 'THE DAILY CHRONICLE' },
      { key: 'headlineText', label: 'Manşet Metni', type: 'text', defaultValue: 'EXTRA! EXTRA! ALL HEADLINES ARE MADE OF DREAMS' },
      { key: 'archiveDate', label: 'Arşiv Tarihi & Baskı', type: 'text', defaultValue: 'VOL. XCIV • OCT 1994 • EDITION #42' }
    ],
    defaultData: {
      stampText: 'FAKE',
      paperName: 'THE DAILY CHRONICLE',
      headlineText: 'EXTRA! EXTRA! ALL HEADLINES ARE MADE OF DREAMS',
      archiveDate: 'VOL. XCIV • OCT 1994 • EDITION #42'
    }
  },

  // 101. AMAZON FBA / E-TİCARET PALET & KUTU GİRİŞ ETİKETİ
  {
    id: 'tpl-amazon-fba-pallet-box',
    title: 'Amazon FBA / E-Ticaret Palet & Kutu Giriş Etiketi',
    category: 'shipping',
    description: 'FNSKU, ASIN, Parti No, Koli adedi ve Fulfillment Center kabul barkodları içeren standart FBA sevkiyat etiketi.',
    tags: ['amazon', 'fba', 'fnsku', 'asin', 'lojistik', 'koli', 'palet', 'barkod'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'shipmentId', label: 'FBA Sevkiyat ID', type: 'text', defaultValue: 'FBA17Z889K2P' },
      { key: 'fnsku', label: 'FNSKU / ASIN Barkod', type: 'barcode', defaultValue: 'X003A8K9L1' },
      { key: 'title', label: 'Ürün Açıklaması', type: 'text', defaultValue: 'Ergonomic Wireless Mech Keyboard - Black' },
      { key: 'condition', label: 'Durum / Condition', type: 'text', defaultValue: 'New / Brand New Sealed' },
      { key: 'boxCount', label: 'Koli / Toplam Koli', type: 'text', defaultValue: 'Box 04 of 12' },
      { key: 'fcCode', label: 'Kabul Depo Kodu', type: 'text', defaultValue: 'BER3 (Germany Fulfillment)' }
    ],
    defaultData: {
      shipmentId: 'FBA17Z889K2P',
      fnsku: 'X003A8K9L1',
      title: 'Ergonomic Wireless Mech Keyboard - Black',
      condition: 'New / Brand New Sealed',
      boxCount: 'Box 04 of 12',
      fcCode: 'BER3 (Germany Fulfillment)'
    }
  },

  // 102. ULUSLARARASI GÜMRÜK / CN22 İTHALAT-İHRACAT BEYANNAMESİ
  {
    id: 'tpl-customs-cn22-declaration',
    title: 'Uluslararası Gümrük / CN22 İhracat Beyannamesi',
    category: 'shipping',
    description: 'Dünya Posta Birliği (UPU) standartlarında CN22 gümrük içerik beyanı, tarife GTİP kodu ve imza alanı.',
    tags: ['gümrük', 'cn22', 'ihracat', 'posta', 'upu', 'beyanname', 'kargo'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'declarationType', label: 'Kategori (Gift/Commercial)', type: 'select', defaultValue: 'Commercial Sample', options: ['Gift', 'Commercial Sample', 'Documents', 'Other / Merchandise'] },
      { key: 'itemDescription', label: 'İçerik Açıklaması', type: 'text', defaultValue: 'Handmade Ceramic Mug & Coaster' },
      { key: 'hsCode', label: 'GTİP / HS Code', type: 'text', defaultValue: '6912.00.20' },
      { key: 'weightKg', label: 'Net Ağırlık (kg)', type: 'text', defaultValue: '0.450 kg' },
      { key: 'declaredValue', label: 'Beyan Edilen Değer', type: 'text', defaultValue: 'EUR 35.00' },
      { key: 'senderSign', label: 'Gönderici İmza & Tarih', type: 'text', defaultValue: 'ATELIER CRAFT IST • 2026' }
    ],
    defaultData: {
      declarationType: 'Commercial Sample',
      itemDescription: 'Handmade Ceramic Mug & Coaster',
      hsCode: '6912.00.20',
      weightKg: '0.450 kg',
      declaredValue: 'EUR 35.00',
      senderSign: 'ATELIER CRAFT IST • 2026'
    }
  },

  // 103. İADE KABUL & EKSPERTİZ DURUM FİŞİ
  {
    id: 'tpl-return-inspection-qc',
    title: 'İade Kabul & Ekspertiz Durum Fişi',
    category: 'inventory',
    description: 'E-ticaret iadeleri için kutu açılış kontrolü, kusur derecesi, iade onay durumu ve QR sorgulama alanı.',
    tags: ['iade', 'ekspertiz', 'qc', 'kalite', 'e-ticaret', 'depo', 'kontrol'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'returnId', label: 'İade Kayıt No', type: 'barcode', defaultValue: 'RET-892410' },
      { key: 'customerName', label: 'Müşteri Adı', type: 'text', defaultValue: 'Mehmet Yılmaz' },
      { key: 'orderNo', label: 'Sipariş No', type: 'text', defaultValue: '#ORD-99412' },
      { key: 'reason', label: 'İade Sebebi', type: 'text', defaultValue: 'Beden Uyumsuzluğu / Cayma Hakkı' },
      { key: 'itemCondition', label: 'Ürün Durumu', type: 'select', defaultValue: 'Kusursuz / Yeniden Satılabilir', options: ['Kusursuz / Yeniden Satılabilir', 'Kutusu Hasarlı', 'Kullanılmış / Kusurlu', 'Eksik Aksesuar'] },
      { key: 'inspector', label: 'Kontrol Eden Uzman', type: 'text', defaultValue: 'QC-14 (Ahmet K.)' }
    ],
    defaultData: {
      returnId: 'RET-892410',
      customerName: 'Mehmet Yılmaz',
      orderNo: '#ORD-99412',
      reason: 'Beden Uyumsuzluğu / Cayma Hakkı',
      itemCondition: 'Kusursuz / Yeniden Satılabilir',
      inspector: 'QC-14 (Ahmet K.)'
    }
  },

  // 104. SOĞUK ZİNCİR SICAKLIK & İLAÇ/AŞI LOJİSTİK İNDİKATÖRÜ
  {
    id: 'tpl-cold-chain-vaccine-temp',
    title: 'Soğuk Zincir Sıcaklık & İlaç/Aşı İndikatörü',
    category: 'warning',
    description: '+2°C / +8°C soğuk zincir protokolü, veri kaydedici seri no ve acil aksiyon talimatı.',
    tags: ['soğuk zincir', 'ilaç', 'aşı', 'medikal', 'sıcaklık', 'termometre', 'lojistik'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'tempRange', label: 'Hedef Sıcaklık Aralığı', type: 'text', defaultValue: '+2°C ile +8°C ARASI' },
      { key: 'drugName', label: 'Ürün / İlaç Adı', type: 'text', defaultValue: 'Biyolojik Serum & Aşı Parti 9' },
      { key: 'loggerSerial', label: 'Termo-Logger No', type: 'barcode', defaultValue: 'TL-99401-X' },
      { key: 'dispatchTime', label: 'Sevkiyat Başlangıç', type: 'text', defaultValue: '27.08.2026 08:30' },
      { key: 'maxHoldHours', label: 'Maksimum İzolasyon Süresi', type: 'text', defaultValue: '48 Saat (Kuru Buz / Jel Destekli)' },
      { key: 'urgentContact', label: 'Sapma Durumunda İletişim', type: 'text', defaultValue: 'Acil Kriz Hattı: 0850 333 44 55' }
    ],
    defaultData: {
      tempRange: '+2°C ile +8°C ARASI',
      drugName: 'Biyolojik Serum & Aşı Parti 9',
      loggerSerial: 'TL-99401-X',
      dispatchTime: '27.08.2026 08:30',
      maxHoldHours: '48 Saat (Kuru Buz / Jel Destekli)',
      urgentContact: 'Acil Kriz Hattı: 0850 333 44 55'
    }
  },

  // 105. CROSS-DOCKING / AKTARMA İSTASYONU ROTA FİŞİ
  {
    id: 'tpl-cross-docking-transfer',
    title: 'Cross-Docking / Aktarma İstasyonu Rota Fişi',
    category: 'shipping',
    description: 'Depoda beklemeden doğrudan araçtan araca transfer kapı numarası, hat no ve aktarma barkodu.',
    tags: ['cross docking', 'aktarma', 'transfer', 'rota', 'hub', 'kapı', 'lojistik'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'transferCode', label: 'Aktarma Kodu', type: 'barcode', defaultValue: 'XD-HUB-IST-089' },
      { key: 'inboundDoor', label: 'Giriş Rampası / Kapı', type: 'text', defaultValue: 'GATE 04 (GELEN)' },
      { key: 'outboundDoor', label: 'Çıkış Rampası / Kapı', type: 'text', defaultValue: 'GATE 19 (ANKARA HATTI)' },
      { key: 'departureTime', label: 'Planlanan Çıkış Saati', type: 'text', defaultValue: '14:45 EXPRESS' },
      { key: 'driverPlate', label: 'Taşıyıcı Plaka', type: 'text', defaultValue: '34 LGT 882' }
    ],
    defaultData: {
      transferCode: 'XD-HUB-IST-089',
      inboundDoor: 'GATE 04 (GELEN)',
      outboundDoor: 'GATE 19 (ANKARA HATTI)',
      departureTime: '14:45 EXPRESS',
      driverPlate: '34 LGT 882'
    }
  },

  // 106. AĞIR YÜK / İKİ KİŞİ TAŞIMALI (TEAM LIFT WARNING)
  {
    id: 'tpl-heavy-team-lift-warning',
    title: 'Ağır Yük / İki Kişi Taşımalı (Team Lift Warning)',
    category: 'warning',
    description: '25kg+ ağır paketler için çift operatör taşıma piktogramı, ağırlık uyarısı ve İSG emniyet bandı.',
    tags: ['ağır yük', 'team lift', 'isg', 'güvenlik', 'kargo', 'koli', 'uyarı'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'grossWeight', label: 'Toplam Brüt Ağırlık', type: 'text', defaultValue: '34.5 KG' },
      { key: 'warningNotice', label: 'Uyarı Başlığı', type: 'text', defaultValue: 'HEAVY / TEAM LIFT REQUIRED' },
      { key: 'subText', label: 'Alt Talimat', type: 'text', defaultValue: 'Tek başınıza kaldırmayınız. İki kişi veya transpalet kullanınız.' },
      { key: 'safetyCode', label: 'İSG Standart Kodu', type: 'text', defaultValue: 'ISO 11228-1 SAFETY' }
    ],
    defaultData: {
      grossWeight: '34.5 KG',
      warningNotice: 'HEAVY / TEAM LIFT REQUIRED',
      subText: 'Tek başınıza kaldırmayınız. İki kişi veya transpalet kullanınız.',
      safetyCode: 'ISO 11228-1 SAFETY'
    }
  },

  // 107. TEHLİKELİ MADDE ADR / UN KİMYASAL TAŞIMA LEVHASI
  {
    id: 'tpl-hazmat-un-adr-placard',
    title: 'Tehlikeli Madde ADR / UN Kimyasal Taşıma Levhası',
    category: 'warning',
    description: 'ADR Sınıf 3 Alevlenir Sıvı / UN 1993 piktogramı ve kimyasal madde acil eylem kodu.',
    tags: ['adr', 'un no', 'hazmat', 'kimyasal', 'yanıcı', 'alev', 'tehlikeli'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'unNumber', label: 'UN Numarası', type: 'text', defaultValue: 'UN 1993' },
      { key: 'hazardClass', label: 'Tehlike Sınıfı', type: 'text', defaultValue: 'CLASS 3 • FLAMMABLE LIQUID' },
      { key: 'properShippingName', label: 'Sevkiyat Resmi Adı', type: 'text', defaultValue: 'SOLVENT BAZLI REÇİNE / RESIN' },
      { key: 'emergencyAction', label: 'Acil Müdahale Kodu (ER)', type: 'text', defaultValue: '3YE • SU İLE SÖNDÜRMEYİNİZ' }
    ],
    defaultData: {
      unNumber: 'UN 1993',
      hazardClass: 'CLASS 3 • FLAMMABLE LIQUID',
      properShippingName: 'SOLVENT BAZLI REÇİNE / RESIN',
      emergencyAction: '3YE • SU İLE SÖNDÜRMEYİNİZ'
    }
  },

  // 108. DEPO RAF / KORİDOR / GÖZ HÜCRE 3D KONUM BARKODU
  {
    id: 'tpl-warehouse-aisle-bin-location',
    title: 'Depo Raf / Koridor / Göz Hücre 3D Konum Barkodu',
    category: 'inventory',
    description: 'Büyük karakterli koridor-raf-kat-hücre (A-04-02-C) konum kodlaması ve yüksek kontrastlı okuma barkodu.',
    tags: ['depo', 'raf', 'hücre', 'adres', 'koridor', 'barkod', 'envanter'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'locationCode', label: '3D Konum Kodu', type: 'text', defaultValue: 'A - 04 - 02 - C' },
      { key: 'barcodeVal', label: 'Konum Barkodu (Code128)', type: 'barcode', defaultValue: 'LOC-A04-02C' },
      { key: 'zoneName', label: 'Bölge / Seksiyon Adı', type: 'text', defaultValue: 'ZON-B : OTOMOTİV YEDEK PARÇA' },
      { key: 'maxCapacity', label: 'Maksimum Kat Kapasitesi', type: 'text', defaultValue: 'MAKS: 750 KG' }
    ],
    defaultData: {
      locationCode: 'A - 04 - 02 - C',
      barcodeVal: 'LOC-A04-02C',
      zoneName: 'ZON-B : OTOMOTİV YEDEK PARÇA',
      maxCapacity: 'MAKS: 750 KG'
    }
  },

  // 109. SERİ NO / IMEI GARANTİ BAŞLANGIÇ BANDI
  {
    id: 'tpl-imei-serial-warranty-strip',
    title: 'Seri No / IMEI Garanti Başlangıç Bandı',
    category: 'inventory',
    description: 'Akıllı cihazlar ve donanımlar için çift IMEI, seri no, MAC adresi ve QR doğrulama şeridi.',
    tags: ['imei', 'seri no', 'garanti', 'barkod', 'cihaz', 'donanım', 'elektronik'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'modelName', label: 'Cihaz Modeli', type: 'text', defaultValue: 'ULTRAVISION X1 5G 256GB' },
      { key: 'imei1', label: 'IMEI 1', type: 'barcode', defaultValue: '864201948201945' },
      { key: 'imei2', label: 'IMEI 2', type: 'text', defaultValue: 'IMEI2: 864201948201946' },
      { key: 'serialNo', label: 'Seri Numarası (S/N)', type: 'text', defaultValue: 'SN: UVX202699841' },
      { key: 'warrantyPeriod', label: 'Garanti Süresi', type: 'text', defaultValue: '24 AY RESMİ DİSTRİBÜTÖR' }
    ],
    defaultData: {
      modelName: 'ULTRAVISION X1 5G 256GB',
      imei1: '864201948201945',
      imei2: 'IMEI2: 864201948201946',
      serialNo: 'SN: UVX202699841',
      warrantyPeriod: '24 AY RESMİ DİSTRİBÜTÖR'
    }
  },

  // 110. HIZLI SEVKİYAT / VIP EKSPRES KURYE TESLİM KARTI
  {
    id: 'tpl-vip-express-courier-pass',
    title: 'Hızlı Sevkiyat / VIP Ekspres Kurye Teslim Kartı',
    category: 'shipping',
    description: 'Aynı gün teslimat, motorlu kurye acil teslim kodu ve alıcı kapı şifresi alanı.',
    tags: ['kurye', 'ekspres', 'vip', 'teslimat', 'aynı gün', 'moto kurye'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'dispatchNo', label: 'Kurye Görev Kodu', type: 'barcode', defaultValue: 'VIP-EXP-992' },
      { key: 'slotTime', label: 'Teslimat Zaman Dilimi', type: 'text', defaultValue: '16:00 - 18:00 (ACİL AYNI GÜN)' },
      { key: 'receiverName', label: 'Alıcı Ad & Soyad', type: 'text', defaultValue: 'Canan Özdemir' },
      { key: 'receiverPhone', label: 'İletişim Tel', type: 'text', defaultValue: '+90 532 999 11 22' },
      { key: 'dropNotes', label: 'Kurye Teslimat Notu', type: 'text', defaultValue: 'Güvenliğe bırakılmasın, bizzat imza ile teslim.' }
    ],
    defaultData: {
      dispatchNo: 'VIP-EXP-992',
      slotTime: '16:00 - 18:00 (ACİL AYNI GÜN)',
      receiverName: 'Canan Özdemir',
      receiverPhone: '+90 532 999 11 22',
      dropNotes: 'Güvenliğe bırakılmasın, bizzat imza ile teslim.'
    }
  },

  // 111. ÖZEL FIRIN / EKŞİ MAYALI EKMEK HİDRASYON & UN ÇEŞİDİ
  {
    id: 'tpl-sourdough-bakery-hydration',
    title: 'Özel Fırın / Ekşi Mayalı Ekmek Künyesi',
    category: 'product',
    description: 'Taş fırın ekşi mayalı ekmekler için hidrasyon oranı, fermantasyon saati ve taş değirmen un bilgisi.',
    tags: ['ekşi maya', 'ekmek', 'fırın', 'artisan', 'hidrasyon', 'un', 'doğal'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'bakeryName', label: 'Fırın / Atelier Adı', type: 'text', defaultValue: 'ODUN TAŞ FIRINI • ARTISAN' },
      { key: 'breadType', label: 'Ekmek Çeşidi', type: 'text', defaultValue: 'Köy Ekşi Mayalı %100 Çavdar & Siyez' },
      { key: 'hydration', label: 'Hidrasyon Oranı', type: 'text', defaultValue: '%78 Hidrasyon' },
      { key: 'fermentationHours', label: 'Soğuk Fermantasyon', type: 'text', defaultValue: '36 Saat Soğuk Mayalama' },
      { key: 'bakedDate', label: 'Fırından Çıkış Saati', type: 'text', defaultValue: 'Bugün 06:15 Taze' }
    ],
    defaultData: {
      bakeryName: 'ODUN TAŞ FIRINI • ARTISAN',
      breadType: 'Köy Ekşi Mayalı %100 Çavdar & Siyez',
      hydration: '%78 Hidrasyon',
      fermentationHours: '36 Saat Soğuk Mayalama',
      bakedDate: 'Bugün 06:15 Taze'
    }
  },

  // 112. GURME PEYNİR / ŞARKÜTERİ OLGUNLAŞMA & MENŞEİ MÜHRÜ
  {
    id: 'tpl-gourmet-cheese-aging-seal',
    title: 'Gurme Peynir / Şarküteri Olgunlaşma Mührü',
    category: 'product',
    description: 'Eski kaşar, gravyer ve obruk peynirleri için dinlendirme ayı, tekerlek no ve süt menşei sertifikası.',
    tags: ['peynir', 'şarküteri', 'gurme', 'gravyer', 'kaşar', 'menşei', 'mühür'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'brandTitle', label: 'Mandıra / Üretici', type: 'text', defaultValue: 'KARS YAYLA GRAVYERİ' },
      { key: 'agingMonths', label: 'Dinlendirme Süresi', type: 'text', defaultValue: '18 AY MAĞARA DİNLENDİRMELİ' },
      { key: 'milkType', label: 'Süt Çeşidi', type: 'text', defaultValue: '%100 Doğal Mera İnek Sütü' },
      { key: 'wheelNo', label: 'Tekerlek / Parti No', type: 'text', defaultValue: 'PARTİ #GRAV-2024/88' },
      { key: 'priceKg', label: 'Kg Birim Fiyatı', type: 'text', defaultValue: '₺ 780.00 / KG' }
    ],
    defaultData: {
      brandTitle: 'KARS YAYLA GRAVYERİ',
      agingMonths: '18 AY MAĞARA DİNLENDİRMELİ',
      milkType: '%100 Doğal Mera İnek Sütü',
      wheelNo: 'PARTİ #GRAV-2024/88',
      priceKg: '₺ 780.00 / KG'
    }
  },

  // 113. BARİSTA ÖZEL DEMLEME REÇETESİ (V60 / AEROPRESS / CHEMEX)
  {
    id: 'tpl-barista-v60-recipe-card',
    title: 'Barista Özel Demleme Reçetesi (V60 / Chemex)',
    category: 'product',
    description: '3. Nesil kahveciler için su sıcaklığı, öğütüm derecesi, oran ve pour-over zamanlama reçetesi.',
    tags: ['barista', 'v60', 'chemex', 'aeropress', 'kahve', 'reçete', 'demleme'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'originName', label: 'Kahve Çekirdeği / Yöre', type: 'text', defaultValue: 'ETHIOPIA YIRGACHEFFE G1' },
      { key: 'method', label: 'Demleme Metodu', type: 'select', defaultValue: 'Hario V60 Pour Over', options: ['Hario V60 Pour Over', 'Chemex 6-Cup', 'AeroPress Inverted', 'Origami Dripper'] },
      { key: 'ratioDose', label: 'Doz & Su Oranı', type: 'text', defaultValue: '18g Kahve / 300g Su (1:16.6)' },
      { key: 'waterTemp', label: 'Su Sıcaklığı & Süre', type: 'text', defaultValue: '93°C • 02:45 dk' },
      { key: 'tastingNotes', label: 'Tadım Notları', type: 'text', defaultValue: 'Bergamot, Yasemin, Narenciye, Bal' }
    ],
    defaultData: {
      originName: 'ETHIOPIA YIRGACHEFFE G1',
      method: 'Hario V60 Pour Over',
      ratioDose: '18g Kahve / 300g Su (1:16.6)',
      waterTemp: '93°C • 02:45 dk',
      tastingNotes: 'Bergamot, Yasemin, Narenciye, Bal'
    }
  },

  // 114. RESTORAN MASADAN QR SİPARİŞ & GARSON ÇAĞIRMA KARTI
  {
    id: 'tpl-qr-table-order-call-bell',
    title: 'Restoran Masadan QR Sipariş & Menü Kartı',
    category: 'organization',
    description: 'Masa no, WiFi şifresi, temassız QR dijital menü ve garson çağrı yönlendirmesi.',
    tags: ['masa', 'restoran', 'qr menü', 'wifi', 'kafe', 'sipariş', 'garson'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'tableNo', label: 'Masa Numarası', type: 'text', defaultValue: 'MASA 12' },
      { key: 'qrUrl', label: 'Dijital Menü QR Linki', type: 'qrcode', defaultValue: 'https://menu.gastrolab.co/table/12' },
      { key: 'venueName', label: 'Mekan Adı', type: 'text', defaultValue: 'BISTRO BOTANICA' },
      { key: 'wifiPass', label: 'Müşteri WiFi Şifresi', type: 'text', defaultValue: 'WiFi: BotanicaGuest • Şifre: coffee2026' }
    ],
    defaultData: {
      tableNo: 'MASA 12',
      qrUrl: 'https://menu.gastrolab.co/table/12',
      venueName: 'BISTRO BOTANICA',
      wifiPass: 'WiFi: BotanicaGuest • Şifre: coffee2026'
    }
  },

  // 115. BUTİK ŞARAP / FERMANTASYON HASAT & REZERVE ŞİŞE BOYUNLUĞU
  {
    id: 'tpl-reserve-wine-bottle-neck',
    title: 'Butik Şarap & Hasat Rezerve Şişe Etiketi',
    category: 'product',
    description: 'Bağ rekolte yılı, meşe fıçı dinlendirme ayı, üzüm kupajı ve sommelier notu.',
    tags: ['şarap', 'bağ', 'hasat', 'rekolte', 'rezerve', 'fıçı', 'şişe'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'wineryTitle', label: 'Bağ & Şaraphane', type: 'text', defaultValue: 'URLA BAĞLARI ÖZEL REZERVE' },
      { key: 'vintageYear', label: 'Rekolte Yılı & Seri No', type: 'text', defaultValue: '2023 REKOLTE • ŞİŞE 412 / 900' },
      { key: 'grapeBlend', label: 'Üzüm Çeşidi / Kupaj', type: 'text', defaultValue: 'Boğazkere & Cabernet Sauvignon' },
      { key: 'agingWood', label: 'Fıçı Bilgisi', type: 'text', defaultValue: '14 Ay Fransız Meşe Fıçılarda' },
      { key: 'alcoholVol', label: 'Alkol Oranı', type: 'text', defaultValue: '%14.2 VOL • 750 ML' }
    ],
    defaultData: {
      wineryTitle: 'URLA BAĞLARI ÖZEL REZERVE',
      vintageYear: '2023 REKOLTE • ŞİŞE 412 / 900',
      grapeBlend: 'Boğazkere & Cabernet Sauvignon',
      agingWood: '14 Ay Fransız Meşe Fıçılarda',
      alcoholVol: '%14.2 VOL • 750 ML'
    }
  },

  // 116. VEGAN / GLUTENSİZ / ALERJEN İÇERİK UYARI KARTI
  {
    id: 'tpl-vegan-allergen-warning-card',
    title: 'Vegan / Glutensiz & Alerjen Bilgilendirme Kartı',
    category: 'warning',
    description: 'Çapraz bulaşma uyarısı, laktozsuz/glutensiz ikonları ve mutfak alerjen beyan şeridi.',
    tags: ['vegan', 'glutensiz', 'alerjen', 'laktozsuz', 'mutfak', 'sağlık', 'gıda'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'dietBadges', label: 'Beslenme Rozetleri', type: 'text', defaultValue: '100% VEGAN • GLUTEN-FREE' },
      { key: 'dishName', label: 'Ürün / Tabak Adı', type: 'text', defaultValue: 'Badem Unlu Çikolatalı Kek' },
      { key: 'containsWarning', label: 'İçerir / Alerjenler', type: 'text', defaultValue: 'DİKKAT: Badem & Fındık (Sert Kabuklu Yemiş) içerir.' },
      { key: 'crossContam', label: 'Çapraz Bulaşma Notu', type: 'text', defaultValue: 'Ayrı glutensiz fırın hattında üretilmiştir.' }
    ],
    defaultData: {
      dietBadges: '100% VEGAN • GLUTEN-FREE',
      dishName: 'Badem Unlu Çikolatalı Kek',
      containsWarning: 'DİKKAT: Badem & Fındık (Sert Kabuklu Yemiş) içerir.',
      crossContam: 'Ayrı glutensiz fırın hattında üretilmiştir.'
    }
  },

  // 117. DONDURULMUŞ GIDA ÇÖZÜNME SÜRESİ & SKT TAKİP ŞERİDİ
  {
    id: 'tpl-frozen-food-thaw-exp-strip',
    title: 'Dondurulmuş Gıda Çözünme Süresi & SKT Şeridi',
    category: 'inventory',
    description: 'Restoran ve profesyonel mutfaklar için dondurucuya giriş, çözülme tarihi ve tüketim son günü etiketi.',
    tags: ['dondurucu', 'derin dondurucu', 'skt', 'çözünme', 'mutfak', 'gıda güvenliği', 'haccp'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'foodItem', label: 'Gıda / Malzeme Adı', type: 'text', defaultValue: 'Dana Bonfile Dilimleri' },
      { key: 'frozenDate', label: 'Dondurucuya Giriş', type: 'text', defaultValue: '15.08.2026' },
      { key: 'thawedDate', label: 'Buzdolabına Çıkış (+4°C)', type: 'text', defaultValue: '27.08.2026 09:00' },
      { key: 'useByHours', label: 'Son Tüketim Süresi', type: 'text', defaultValue: 'Maks. 48 Saat (29.08.2026 09:00)' },
      { key: 'chefSignature', label: 'Sorumlu Şef', type: 'text', defaultValue: 'Şef: Murat U.' }
    ],
    defaultData: {
      foodItem: 'Dana Bonfile Dilimleri',
      frozenDate: '15.08.2026',
      thawedDate: '27.08.2026 09:00',
      useByHours: 'Maks. 48 Saat (29.08.2026 09:00)',
      chefSignature: 'Şef: Murat U.'
    }
  },

  // 118. FAST FOOD PAKET SERVİS GÜVENLİK & MÜHÜR BANDI
  {
    id: 'tpl-tamper-evident-food-seal',
    title: 'Paket Servis Güvenlik & Hijyen Mühür Bandı',
    category: 'shipping',
    description: 'Yemek sipariş poşetleri için açıldığında yırtılan güvenlik mührü, kurye adı ve hijyen garantisi.',
    tags: ['mühür', 'paket servis', 'güvenlik bandı', 'hijyen', 'kurye', 'yemek'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'sealWarning', label: 'Mühür Başlığı', type: 'text', defaultValue: 'HİJYEN VE GÜVENLİK MÜHRÜ' },
      { key: 'orderCode', label: 'Sipariş Kodu', type: 'barcode', defaultValue: 'YMK-40912' },
      { key: 'securityNotice', label: 'Uyarı Metni', type: 'text', defaultValue: 'Mühür yırtılmış veya açılmışsa lütfen teslim almayınız.' },
      { key: 'packedAt', label: 'Paketlenme Saati', type: 'text', defaultValue: '19:42 • Sıcak & Taze Paketlenmiştir' }
    ],
    defaultData: {
      sealWarning: 'HİJYEN VE GÜVENLİK MÜHRÜ',
      orderCode: 'YMK-40912',
      securityNotice: 'Mühür yırtılmış veya açılmışsa lütfen teslim almayınız.',
      packedAt: '19:42 • Sıcak & Taze Paketlenmiştir'
    }
  },

  // 119. ORGANİK ARICILIK / BAL SAĞIM YÖRESİ & POLEN ANALİZ ETİKETİ
  {
    id: 'tpl-raw-honey-origin-analysis',
    title: 'Organik Arıcılık / Ham Bal Sağım Yöresi Etiketi',
    category: 'product',
    description: 'Yayla rakımı, çiçek florası, prolin değeri ve organik kovan sağım parti bilgisi.',
    tags: ['bal', 'arıcılık', 'yayla', 'organik', 'ham bal', 'prolin', 'sağım'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'honeyType', label: 'Bal Çeşidi & Yöre', type: 'text', defaultValue: 'ANZER YAYLASI HAM ÇİÇEK BALI' },
      { key: 'altitude', label: 'Yayla Rakımı & Flora', type: 'text', defaultValue: '2.300m Rakım • 450+ Endemik Çiçek' },
      { key: 'prolineVal', label: 'Prolin Analiz Değeri', type: 'text', defaultValue: 'Prolin: 1.150 mg/kg (Yüksek Aktif)' },
      { key: 'harvestDate', label: 'Sağım Tarihi & Parti', type: 'text', defaultValue: 'Ağustos 2026 • Parti #ANZ-88' },
      { key: 'netWeight', label: 'Net Gramaj', type: 'text', defaultValue: '450 g Net' }
    ],
    defaultData: {
      honeyType: 'ANZER YAYLASI HAM ÇİÇEK BALI',
      altitude: '2.300m Rakım • 450+ Endemik Çiçek',
      prolineVal: 'Prolin: 1.150 mg/kg (Yüksek Aktif)',
      harvestDate: 'Ağustos 2026 • Parti #ANZ-88',
      netWeight: '450 g Net'
    }
  },

  // 120. EV YAPIMI KONSERVE / REÇEL KAVANOZ KAPAĞI MÜHRÜ
  {
    id: 'tpl-homemade-preserve-jar-cap',
    title: 'Ev Yapımı Reçel / Konserve Kavanoz Kapağı Mührü',
    category: 'product',
    description: 'Kavanoz kapağına yapıştırılan dairesel/oval görünümlü el yapımı reçel ve marmelat mührü.',
    tags: ['reçel', 'konserve', 'kavanoz', 'el yapımı', 'marmelat', 'hasat', 'mutfak'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'title', label: 'Ürün Adı', type: 'text', defaultValue: 'Geleneksel Dağ Çileği Reçeli' },
      { key: 'ingredients', label: 'İçindekiler', type: 'text', defaultValue: 'Dağ çileği, pancar şekeri, taze limon suyu.' },
      { key: 'madeDate', label: 'Hazırlanma Tarihi', type: 'text', defaultValue: 'YAZ 2026 HASADI' },
      { key: 'artisanSign', label: 'Hazırlayan / İsim', type: 'text', defaultValue: 'Anne Eliyle Katkısız' }
    ],
    defaultData: {
      title: 'Geleneksel Dağ Çileği Reçeli',
      ingredients: 'Dağ çileği, pancar şekeri, taze limon suyu.',
      madeDate: 'YAZ 2026 HASADI',
      artisanSign: 'Anne Eliyle Katkısız'
    }
  },

  // 121. ECZANE MAJİSTRAL İLAÇ HAZIRLAMA & DOZAJ TALİMATI
  {
    id: 'tpl-pharmacy-magistral-dosage',
    title: 'Eczane Majistral İlaç Hazırlama & Dozaj Talimatı',
    category: 'notes',
    description: 'Eczacı tarafından hazırlanan özel formülasyon (merhem, solüsyon), kullanım saatleri ve saklama koşulları.',
    tags: ['eczane', 'majistral', 'ilaç', 'dozaj', 'reçete', 'doktor', 'sağlık'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'pharmacyName', label: 'Eczane Adı', type: 'text', defaultValue: 'YENİ HAYAT ECZANESİ • MAJİSTRAL LABORATUVARI' },
      { key: 'patientName', label: 'Hasta Ad & Soyad', type: 'text', defaultValue: 'Ahmet Faruk Taner' },
      { key: 'formulaName', label: 'Hazırlanan Formül', type: 'text', defaultValue: '%2 Salisilik Asit & Çinko Oksit Pomadı' },
      { key: 'dosageInstr', label: 'Kullanım Talimatı', type: 'text', defaultValue: 'Günde 2 kez sabah-akşam temiz cilde ince tabaka halinde.' },
      { key: 'expDate', label: 'Son Kullanma Tarihi', type: 'text', defaultValue: 'Hazırlandığı tarihten itibaren 30 gün geçerlidir.' }
    ],
    defaultData: {
      pharmacyName: 'YENİ HAYAT ECZANESİ • MAJİSTRAL LABORATUVARI',
      patientName: 'Ahmet Faruk Taner',
      formulaName: '%2 Salisilik Asit & Çinko Oksit Pomadı',
      dosageInstr: 'Günde 2 kez sabah-akşam temiz cilde ince tabaka halinde.',
      expDate: 'Hazırlandığı tarihten itibaren 30 gün geçerlidir.'
    }
  },

  // 122. LABORATUVAR KAN & BİYOLOJİK NUMUNE BARKOD TÜP ETİKETİ
  {
    id: 'tpl-lab-blood-sample-tube-barcode',
    title: 'Laboratuvar Kan & Biyolojik Numune Tüp Etiketi',
    category: 'inventory',
    description: 'Klinik biyokimya tüpleri için hasta protokol no, barkod, doğum tarihi ve tüp tipi.',
    tags: ['laboratuvar', 'kan', 'numune', 'tüp', 'biyokimya', 'hastane', 'barkod'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'protocolNo', label: 'Hasta Protokol Barkod', type: 'barcode', defaultValue: 'LAB-904128' },
      { key: 'patientName', label: 'Hasta Adı & Cinsiyet', type: 'text', defaultValue: 'KAYA, ELİF (K / 34)' },
      { key: 'sampleType', label: 'Numune & Test Grubu', type: 'text', defaultValue: 'EDTA TAM KAN • HEMOGRAM' },
      { key: 'collectTime', label: 'Alınma Zamanı', type: 'text', defaultValue: '27.08.2026 09:12' }
    ],
    defaultData: {
      protocolNo: 'LAB-904128',
      patientName: 'KAYA, ELİF (K / 34)',
      sampleType: 'EDTA TAM KAN • HEMOGRAM',
      collectTime: '27.08.2026 09:12'
    }
  },

  // 123. RADYOLOJİ / RÖNTGEN ÇEKİM HASTA & DOZ PROTOKOL FİŞİ
  {
    id: 'tpl-radiology-xray-dose-protocol',
    title: 'Radyoloji / Röntgen & MR Çekim Protokol Fişi',
    category: 'notes',
    description: 'Radyolojik görüntüleme için kVp, mAs doz değerleri, çekim bölgesi ve hekim kaşesi.',
    tags: ['radyoloji', 'röntgen', 'mr', 'doz', 'protokol', 'hastane', 'sağlık'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'scanArea', label: 'Çekim Bölgesi & Modalite', type: 'text', defaultValue: 'DİJİTAL AKCİĞER GRAFİSİ (PA / LATERAL)' },
      { key: 'patientId', label: 'Hasta Dosya No', type: 'barcode', defaultValue: 'RAD-778210' },
      { key: 'patientDetails', label: 'Hasta Bilgisi', type: 'text', defaultValue: 'Burak Demir • D.T: 1988' },
      { key: 'exposureDose', label: 'Işınım Dozu (DAP)', type: 'text', defaultValue: 'DAP: 0.12 Gy.cm² (115 kVp / 3.2 mAs)' },
      { key: 'technician', label: 'Radyoloji Teknikeri', type: 'text', defaultValue: 'Tekniker: S. Arslan' }
    ],
    defaultData: {
      scanArea: 'DİJİTAL AKCİĞER GRAFİSİ (PA / LATERAL)',
      patientId: 'RAD-778210',
      patientDetails: 'Burak Demir • D.T: 1988',
      exposureDose: 'DAP: 0.12 Gy.cm² (115 kVp / 3.2 mAs)',
      technician: 'Tekniker: S. Arslan'
    }
  },

  // 124. DİŞ PROTEZ & İMPLANT TAKİP FORMU
  {
    id: 'tpl-dental-implant-prosthesis-tag',
    title: 'Diş Protez & İmplant Laboratuvar Takip Formu',
    category: 'inventory',
    description: 'Diş hekimliği laboratuvarları için diş no (#16, #21), zirkonyum/porselen renk skalası (A2, B1) ve prova tarihi.',
    tags: ['diş', 'implant', 'protez', 'zirkonyum', 'renk skalası', 'diş hekimi', 'laboratuvar'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'dentistName', label: 'Diş Hekimi & Klinik', type: 'text', defaultValue: 'Dr. Dt. Selim Aydın (Aydın Dental)' },
      { key: 'patientName', label: 'Hasta Adı', type: 'text', defaultValue: 'Zeynep Aktaş' },
      { key: 'toothNumbers', label: 'Çalışılan Diş No', type: 'text', defaultValue: '#14, #15, #16 (Üst Sağ Köprü)' },
      { key: 'shadeColor', label: 'Renk Skalası & Materyal', type: 'text', defaultValue: 'VITA A2 • Monolitik Zirkonyum' },
      { key: 'tryInDate', label: 'Prova / Teslim Tarihi', type: 'text', defaultValue: 'Altyapı Prova: 31.08.2026 14:00' }
    ],
    defaultData: {
      dentistName: 'Dr. Dt. Selim Aydın (Aydın Dental)',
      patientName: 'Zeynep Aktaş',
      toothNumbers: '#14, #15, #16 (Üst Sağ Köprü)',
      shadeColor: 'VITA A2 • Monolitik Zirkonyum',
      tryInDate: 'Altyapı Prova: 31.08.2026 14:00'
    }
  },

  // 125. MEDİKAL OTOKLAV & STERİLİZASYON GEÇERLİLİK DAMGASI
  {
    id: 'tpl-medical-autoclave-sterilization',
    title: 'Medikal Otoklav & Sterilizasyon Geçerlilik Damgası',
    category: 'warning',
    description: '134°C buhar otoklav döngüsü, biyolojik indikatör sonucu, sterilite geçerlilik süresi ve paket no.',
    tags: ['sterilizasyon', 'otoklav', 'cerrahi', 'hastane', 'enfeksiyon', 'geçerlilik'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'autoclaveCycle', label: 'Otoklav No & Döngü', type: 'text', defaultValue: 'OTOKLAV #02 • DÖNGÜ #148' },
      { key: 'sterilizeDate', label: 'Sterilizasyon Tarihi', type: 'text', defaultValue: '27.08.2026 07:45 (134°C - 3.5 Bar)' },
      { key: 'expiryDate', label: 'Sterilite Son Geçerlilik', type: 'text', defaultValue: 'GEÇERLİLİK: 27.11.2026 (90 Gün)' },
      { key: 'operatorCode', label: 'Operatör Barkodu', type: 'barcode', defaultValue: 'STER-OP-89' }
    ],
    defaultData: {
      autoclaveCycle: 'OTOKLAV #02 • DÖNGÜ #148',
      sterilizeDate: '27.08.2026 07:45 (134°C - 3.5 Bar)',
      expiryDate: 'GEÇERLİLİK: 27.11.2026 (90 Gün)',
      operatorCode: 'STER-OP-89'
    }
  },

  // 126. HASTA YATAĞI / ALERJİ & DİYABET ACİL BİLGİ BİLEKLİĞİ
  {
    id: 'tpl-hospital-bed-allergy-wristband',
    title: 'Hasta Yatağı / Alerji & Acil Tıbbi Uyarı Bandı',
    category: 'warning',
    description: 'Yatan hasta bilekliği ve yatak başı için penisilin alerjisi, diyabet uyarısı ve kan grubu.',
    tags: ['hasta', 'alerji', 'kan grubu', 'diyabet', 'acil', 'hastane', 'bileklik'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'patientName', label: 'Hasta Ad & Soyad', type: 'text', defaultValue: 'HASAN KORUCU (YATAK: 304-B)' },
      { key: 'bloodGroup', label: 'Kan Grubu', type: 'text', defaultValue: 'A Rh POSITIVE (+)' },
      { key: 'allergyAlert', label: 'KRİTİK ALERJİ BİLGİSİ', type: 'text', defaultValue: 'DİKKAT: PENİSİLİN & LATEX ALERJİSİ VARDIR!' },
      { key: 'conditionTags', label: 'Özel Durum', type: 'text', defaultValue: 'Tip 2 Diyabet • Düşme Riski Yüksek' },
      { key: 'barcodeId', label: 'Hasta Kimlik Barkodu', type: 'barcode', defaultValue: 'MED-YTK-304' }
    ],
    defaultData: {
      patientName: 'HASAN KORUCU (YATAK: 304-B)',
      bloodGroup: 'A Rh POSITIVE (+)',
      allergyAlert: 'DİKKAT: PENİSİLİN & LATEX ALERJİSİ VARDIR!',
      conditionTags: 'Tip 2 Diyabet • Düşme Riski Yüksek',
      barcodeId: 'MED-YTK-304'
    }
  },

  // 127. OPTİK CAM ÖLÇÜM / SFERİK-SİLİNDİRİK AKS DEĞERLERİ FİŞİ
  {
    id: 'tpl-optometry-lens-prescription',
    title: 'Optik Gözlük Camı Ölçüm & Odak Değerleri Fişi',
    category: 'notes',
    description: 'Gözlük montajı için Sağ (OD) / Sol (OS) SPH, CYL, AXIS, PD pupilla mesafesi ve cam kaplama detayları.',
    tags: ['optik', 'gözlük', 'lens', 'diyoptri', 'pupilla', 'preskripsiyon', 'göz'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'customerName', label: 'Müşteri Adı', type: 'text', defaultValue: 'Selin Erdem' },
      { key: 'rightEye', label: 'Sağ Göz (OD)', type: 'text', defaultValue: 'SPH: -1.75 | CYL: -0.50 | AXIS: 95°' },
      { key: 'leftEye', label: 'Sol Göz (OS)', type: 'text', defaultValue: 'SPH: -2.00 | CYL: -0.75 | AXIS: 85°' },
      { key: 'pdDistance', label: 'Pupilla Mesafesi (PD)', type: 'text', defaultValue: 'PD: 63 mm (R: 31.5 / L: 31.5)' },
      { key: 'coatingType', label: 'Cam Tipi & Kaplama', type: 'text', defaultValue: '1.61 Asferik Mavi Işık + Antirefle' }
    ],
    defaultData: {
      customerName: 'Selin Erdem',
      rightEye: 'SPH: -1.75 | CYL: -0.50 | AXIS: 95°',
      leftEye: 'SPH: -2.00 | CYL: -0.75 | AXIS: 85°',
      pdDistance: 'PD: 63 mm (R: 31.5 / L: 31.5)',
      coatingType: '1.61 Asferik Mavi Işık + Antirefle'
    }
  },

  // 128. VETERİNER AŞI TAKVİMİ & MİKROÇİP TANITIM KARTI
  {
    id: 'tpl-vet-vaccine-microchip-passport',
    title: 'Veteriner Aşı Takvimi & Mikroçip Kartı',
    category: 'notes',
    description: 'Evcil hayvanlar için 15 haneli ISO mikroçip no, kuduz/karma aşı tarihi ve sonraki randevu fişi.',
    tags: ['veteriner', 'kedi', 'köpek', 'mikroçip', 'aşı', 'evcil hayvan', 'randevu'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'petName', label: 'Pet Adı & Türü', type: 'text', defaultValue: 'LOKUM (Kedi - British Shorthair)' },
      { key: 'microchip', label: '15 Haneli Mikroçip No', type: 'barcode', defaultValue: '981098109810981' },
      { key: 'appliedVaccine', label: 'Uygulanan Aşı', type: 'text', defaultValue: 'Karma Aşı (Nobivac Tricat) + Kuduz' },
      { key: 'vetClinic', label: 'Klinik & Hekim', type: 'text', defaultValue: 'Pati Dostu Vet Kliniği • Vet. Hekim Aylin D.' },
      { key: 'nextDueDate', label: 'Gelecek Aşı Randevusu', type: 'text', defaultValue: 'Lösemi 2. Doz: 27.09.2026' }
    ],
    defaultData: {
      petName: 'LOKUM (Kedi - British Shorthair)',
      microchip: '981098109810981',
      appliedVaccine: 'Karma Aşı (Nobivac Tricat) + Kuduz',
      vetClinic: 'Pati Dostu Vet Kliniği • Vet. Hekim Aylin D.',
      nextDueDate: 'Lösemi 2. Doz: 27.09.2026'
    }
  },

  // 129. AKILLI TELEFON / TABLET ONARIM KABUL & ARIZA ŞEMASI
  {
    id: 'tpl-smartphone-repair-intake-slip',
    title: 'Akıllı Telefon / Tablet Onarım Kabul & Arıza Fişi',
    category: 'inventory',
    description: 'Cihaz kilit deseni, ekran kırık bölgesi, sıvı teması kontrolü ve onarım takip QR kodu.',
    tags: ['telefon tamiri', 'teknik servis', 'onarım', 'arıza', 'kabul fişi', 'elektronik'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'ticketNo', label: 'Servis Takip Barkodu', type: 'barcode', defaultValue: 'SRV-89410' },
      { key: 'deviceModel', label: 'Cihaz Modeli & Renk', type: 'text', defaultValue: 'iPhone 14 Pro Max 128GB Deep Purple' },
      { key: 'issueReport', label: 'Müşteri Şikayeti', type: 'text', defaultValue: 'Ön cam çatlak, dokunmatik kısmen çalışmıyor.' },
      { key: 'intakeCondition', label: 'Fiziksel Durum / Sıvı Teması', type: 'text', defaultValue: 'Kasada ezilme yok. Sıvı indikatörü: BEYAZ (Temiz).' },
      { key: 'estCost', label: 'Tahmini Onarım Ücreti', type: 'text', defaultValue: '₺ 3.850 (Orijinal Revize Ekran)' }
    ],
    defaultData: {
      ticketNo: 'SRV-89410',
      deviceModel: 'iPhone 14 Pro Max 128GB Deep Purple',
      issueReport: 'Ön cam çatlak, dokunmatik kısmen çalışmıyor.',
      intakeCondition: 'Kasada ezilme yok. Sıvı indikatörü: BEYAZ (Temiz).',
      estCost: '₺ 3.850 (Orijinal Revize Ekran)'
    }
  },

  // 130. OTO EKSPERTİZ DYNO TEST & BOYA-KAPORTA ÖLÇÜM RAPORU
  {
    id: 'tpl-auto-inspection-dyno-report',
    title: 'Oto Ekspertiz Dyno Test & Kaporta Ölçüm Raporu',
    category: 'inventory',
    description: 'Motor güç verimi (HP / Tork), boya mikron kalınlıkları, değişen parçalar ve şasi kontrol özeti.',
    tags: ['oto ekspertiz', 'dyno', 'araba', 'motor gücü', 'boya mikron', 'şasi', 'rapor'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'plateVin', label: 'Plaka & Şasi No (VIN)', type: 'text', defaultValue: '34 GTC 2026 • VIN: WBA3A5C59DF1894' },
      { key: 'dynoPower', label: 'Dyno Motor Gücü', type: 'text', defaultValue: 'Ölçülen: 178 HP / 390 Nm (%94 Motor Verimi)' },
      { key: 'bodyCondition', label: 'Boya & Kaporta Özeti', type: 'text', defaultValue: 'Kaput: Boyalı (160µ) | Sol Çamurluk: Değişen | Tavan: Orijinal (110µ)' },
      { key: 'chassisAirbag', label: 'Şasi & Airbag Durumu', type: 'text', defaultValue: 'Podyeler, direkler ve airbagler TAMAMEN ORİJİNAL' },
      { key: 'reportQr', label: 'Detaylı Rapor QR', type: 'qrcode', defaultValue: 'https://ekspertiz.auto/rapor/34gtc2026' }
    ],
    defaultData: {
      plateVin: '34 GTC 2026 • VIN: WBA3A5C59DF1894',
      dynoPower: 'Ölçülen: 178 HP / 390 Nm (%94 Motor Verimi)',
      bodyCondition: 'Kaput: Boyalı (160µ) | Sol Çamurluk: Değişen | Tavan: Orijinal (110µ)',
      chassisAirbag: 'Podyeler, direkler ve airbagler TAMAMEN ORİJİNAL',
      reportQr: 'https://ekspertiz.auto/rapor/34gtc2026'
    }
  },

  // 131. LASTİK OTELİ & MEVSİMSEL DEĞİŞİM SAKLAMA ETİKETİ
  {
    id: 'tpl-tire-hotel-seasonal-storage',
    title: 'Lastik Oteli & Mevsimsel Saklama Etiketi',
    category: 'inventory',
    description: 'Kışlık/yazlık lastiklerin raf konumu, diş derinliği (mm), DOT üretim haftası ve müşteri plakası.',
    tags: ['lastik oteli', 'oto lastik', 'kışlık lastik', 'depolama', 'diş derinliği', 'plaka'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'plateNumber', label: 'Araç Plakası', type: 'text', defaultValue: '06 ANK 448' },
      { key: 'tireSpecs', label: 'Lastik Marka / Ebat', type: 'text', defaultValue: 'Michelin Alpin 6 • 225/45 R17 94V' },
      { key: 'treadDepth', label: 'Diş Derinliği Ölçümü', type: 'text', defaultValue: 'Ön: 6.8 mm | Arka: 7.1 mm (Çok İyi)' },
      { key: 'rackLocation', label: 'Otel Raf Hücre Kodu', type: 'barcode', defaultValue: 'LST-RAF-C14' },
      { key: 'seasonType', label: 'Saklanan Mevsim', type: 'text', defaultValue: 'KIŞLIK SET (Nisan 2027 Değişim)' }
    ],
    defaultData: {
      plateNumber: '06 ANK 448',
      tireSpecs: 'Michelin Alpin 6 • 225/45 R17 94V',
      treadDepth: 'Ön: 6.8 mm | Arka: 7.1 mm (Çok İyi)',
      rackLocation: 'LST-RAF-C14',
      seasonType: 'KIŞLIK SET (Nisan 2027 Değişim)'
    }
  },

  // 132. KOMBİ & KLİMA YILLIK BAKIM KONTROL ETİKETİ
  {
    id: 'tpl-hvac-boiler-annual-maintenance',
    title: 'Kombi & HVAC Yıllık Bakım Kontrol Etiketi',
    category: 'organization',
    description: 'Kombi gövdesine yapıştırılan genleşme tankı basıncı, brülör temizliği ve sonraki bakım tarihi bandı.',
    tags: ['kombi', 'bakım', 'klima', 'hvac', 'teknik servis', 'periyodik', 'kontrol'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'boilerBrand', label: 'Cihaz Marka & Tip', type: 'text', defaultValue: 'Vaillant ecoTEC Plus Yoğuşmalı Kombi' },
      { key: 'serviceDate', label: 'Bakım Yapılış Tarihi', type: 'text', defaultValue: '27.08.2026' },
      { key: 'checksDone', label: 'Yapılan İşlemler', type: 'text', defaultValue: 'Yanma odası temizlendi, tank 1.2 bar basıldı, filtre yıkandı.' },
      { key: 'nextService', label: 'Gelecek Bakım Zamanı', type: 'text', defaultValue: 'AĞUSTOS 2027 (1 Yıl Sonra)' },
      { key: 'servicePhone', label: 'Yetkili Servis Tel', type: 'text', defaultValue: 'Hızlı Destek: 0212 444 88 99' }
    ],
    defaultData: {
      boilerBrand: 'Vaillant ecoTEC Plus Yoğuşmalı Kombi',
      serviceDate: '27.08.2026',
      checksDone: 'Yanma odası temizlendi, tank 1.2 bar basıldı, filtre yıkandı.',
      nextService: 'AĞUSTOS 2027 (1 Yıl Sonra)',
      servicePhone: 'Hızlı Destek: 0212 444 88 99'
    }
  },

  // 133. SAAT & MÜCEVHER TAMİR / AYAR SERTİFİKASI
  {
    id: 'tpl-luxury-watch-repair-certificate',
    title: 'Saat & Mücevherat Bakım / Ayar Sertifikası',
    category: 'product',
    description: 'Mekanik saatler için sapma oranı (+sn/gün), genlik (amplitude), su geçirmezlik testi ve kalibre bilgisi.',
    tags: ['saat', 'tamir', 'mücevher', 'kalibre', 'sapma', 'su geçirmezlik', 'sertifika'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'watchModel', label: 'Saat Marka & Kalibre', type: 'text', defaultValue: 'Omega Speedmaster Professional • Cal. 1861' },
      { key: 'timingResults', label: 'Mekanizma Sapma Değeri', type: 'text', defaultValue: '+2 sn/gün • 295° Genlik • 0.1ms Beat Error' },
      { key: 'waterproofTest', label: 'Basınç / Su Testi', type: 'text', defaultValue: '5 BAR (50m) Basınç Testi: BAŞARILI' },
      { key: 'serviceSerial', label: 'Servis Seri No', type: 'barcode', defaultValue: 'HORO-991204' },
      { key: 'masterSign', label: 'Saat Ustası', type: 'text', defaultValue: 'Usta: E. Horologist • 1 Yıl Garanti' }
    ],
    defaultData: {
      watchModel: 'Omega Speedmaster Professional • Cal. 1861',
      timingResults: '+2 sn/gün • 295° Genlik • 0.1ms Beat Error',
      waterproofTest: '5 BAR (50m) Basınç Testi: BAŞARILI',
      serviceSerial: 'HORO-991204',
      masterSign: 'Usta: E. Horologist • 1 Yıl Garanti'
    }
  },

  // 134. MARANGOZLUK & MOBİLYA ÖZEL KESİM ÖLÇÜ / KENAR BANDI FİŞİ
  {
    id: 'tpl-woodworking-edge-banding-cut',
    title: 'Mobilya Kesim & Kenar Bandı (PVC) İmalat Fişi',
    category: 'inventory',
    description: 'Ahşap panel ölçüleri (Boy x En mm), 4 kenar PVC kalınlığı (1mm, 2mm), damar yönü ve delik koordinatları.',
    tags: ['ahşap', 'mobilya', 'kesim', 'marangoz', 'pvc', 'kenar bandı', 'cnc'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'partName', label: 'Parça Adı & Malzeme', type: 'text', defaultValue: 'Dolap Üst Sol Kapak • 18mm Meşe Melamin' },
      { key: 'dimensionsMm', label: 'Kesim Ebatları (Boy x En)', type: 'text', defaultValue: '720 mm x 450 mm (Adet: 2)' },
      { key: 'edgeBanding', label: 'Kenar Bandı PVC Şeması', type: 'text', defaultValue: 'Ü: 1mm | A: 1mm | S: 2mm | Sa: 1mm' },
      { key: 'grainDirection', label: 'Damar Yönü & Delik', type: 'text', defaultValue: 'Damar Boyuna | 2x Menteşe Deliği (K-100)' },
      { key: 'partBarcode', label: 'CNC Parça Barkodu', type: 'barcode', defaultValue: 'CNC-DK-720450' }
    ],
    defaultData: {
      partName: 'Dolap Üst Sol Kapak • 18mm Meşe Melamin',
      dimensionsMm: '720 mm x 450 mm (Adet: 2)',
      edgeBanding: 'Ü: 1mm | A: 1mm | S: 2mm | Sa: 1mm',
      grainDirection: 'Damar Boyuna | 2x Menteşe Deliği (K-100)',
      partBarcode: 'CNC-DK-720450'
    }
  },

  // 135. ELEKTRİK PANO & SİGORTA FAZ ŞEMASI NUMARALANDIRMA
  {
    id: 'tpl-electrical-panel-breaker-map',
    title: 'Elektrik Dağıtım Pano & Sigorta Faz Şeması',
    category: 'organization',
    description: 'Pano kapağı içine yapıştırılan linye numarası, sigorta amper değeri (16A, 25A) ve priz/aydınlatma haritası.',
    tags: ['elektrik', 'sigorta', 'pano', 'linye', 'amper', 'faz', 'şema'],
    recommendedWidthMm: 100,
    fields: [
      { key: 'panelName', label: 'Pano Kodu & Konum', type: 'text', defaultValue: 'ANA DAĞITIM PANOSU (ADP-01 / KAT 2)' },
      { key: 'rccbDetails', label: 'Kaçak Akım Rölesi (KAR)', type: 'text', defaultValue: '40A 30mA 3-Faz Yangın/Hayat Koruma' },
      { key: 'breakersTable', label: 'Sigorta Linye Dağılımı', type: 'text', defaultValue: 'F1: Salon Priz (16A B) | F2: Mutfak Fırın (25A C) | F3: Aydınlatma (10A B)' },
      { key: 'installedBy', label: 'Tesisatı Yapan Usta / Tel', type: 'text', defaultValue: 'Voltaj Elektrik • 0532 000 77 88' }
    ],
    defaultData: {
      panelName: 'ANA DAĞITIM PANOSU (ADP-01 / KAT 2)',
      rccbDetails: '40A 30mA 3-Faz Yangın/Hayat Koruma',
      breakersTable: 'F1: Salon Priz (16A B) | F2: Mutfak Fırın (25A C) | F3: Aydınlatma (10A B)',
      installedBy: 'Voltaj Elektrik • 0532 000 77 88'
    }
  },

  // 136. 3D YAZICI FİLAMENT & DİLİMLEME (SLICER) PARAMETRE ETİKETİ
  {
    id: 'tpl-3d-printer-filament-slicer-tag',
    title: '3D Yazıcı Filament & Slicer Parametre Etiketi',
    category: 'organization',
    description: 'Filament makarası üzerine nozül sıcaklığı (215°C), tabla sıcaklığı (60°C), akış katsayısı ve materyal cinsi.',
    tags: ['3d yazıcı', 'filament', 'pla', 'petg', 'sıcaklık', 'slicer', 'baskı'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'materialBrand', label: 'Materyal & Renk', type: 'text', defaultValue: 'PLA PRO+ • Mat Siyah (1.75mm)' },
      { key: 'nozzleBedTemp', label: 'Nozzle / Tabla Sıcaklığı', type: 'text', defaultValue: 'Nozül: 215°C | Tabla (Bed): 60°C' },
      { key: 'fanFlow', label: 'Fan & Akış (Flow) Oranı', type: 'text', defaultValue: 'Fan: %100 | Flow: 0.98 | Retract: 0.8mm' },
      { key: 'spoolWeight', label: 'Boş Makara / Net Gramaj', type: 'text', defaultValue: 'Dara (Boş): 220g | Net: 1000g' }
    ],
    defaultData: {
      materialBrand: 'PLA PRO+ • Mat Siyah (1.75mm)',
      nozzleBedTemp: 'Nozül: 215°C | Tabla (Bed): 60°C',
      fanFlow: 'Fan: %100 | Flow: 0.98 | Retract: 0.8mm',
      spoolWeight: 'Dara (Boş): 220g | Net: 1000g'
    }
  },

  // 137. RETRO SİNEMA / TİYATRO NUMARALI BİLET KOÇANI
  {
    id: 'tpl-vintage-cinema-stub-ticket',
    title: 'Retro Sinema / Tiyatro Numaralı Bilet Koçanı',
    category: 'receipt',
    description: 'Nostaljik perforaj çizgili salon, sıra/koltuk no, seans saati ve barkodlu giriş bileti.',
    tags: ['bilet', 'sinema', 'tiyatro', 'retro', 'vintage', 'koltuk', 'seans'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'movieTitle', label: 'Film / Oyun Adı', type: 'text', defaultValue: 'INTERSTELLAR (70mm IMAX GÖSTERİMİ)' },
      { key: 'hallSeat', label: 'Salon & Koltuk No', type: 'text', defaultValue: 'SALON 1 • SIRA F • KOLTUK 14' },
      { key: 'sessionDate', label: 'Tarih & Seans Saati', type: 'text', defaultValue: '27.08.2026 • 21:15 SEANSI' },
      { key: 'price', label: 'Bilet Fiyatı & Tür', type: 'text', defaultValue: 'TAM BİLET • ₺ 180.00' },
      { key: 'ticketBarcode', label: 'Bilet Giriş Barkodu', type: 'barcode', defaultValue: 'CIN-772910' }
    ],
    defaultData: {
      movieTitle: 'INTERSTELLAR (70mm IMAX GÖSTERİMİ)',
      hallSeat: 'SALON 1 • SIRA F • KOLTUK 14',
      sessionDate: '27.08.2026 • 21:15 SEANSI',
      price: 'TAM BİLET • ₺ 180.00',
      ticketBarcode: 'CIN-772910'
    }
  },

  // 138. FESTİVAL VIP BACKSTAGE & SAHNE GİRİŞ PASOSU
  {
    id: 'tpl-festival-vip-backstage-pass',
    title: 'Festival VIP Backstage & Sahne Giriş Pasosu',
    category: 'organization',
    description: 'Konser ve müzik festivalleri için ALL ACCESS sahne arkası yetki kodu, sanatçı ve QR güvenlik doğrulama bandı.',
    tags: ['backstage', 'vip', 'festival', 'konser', 'all access', 'güvenlik', 'paso'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'festTitle', label: 'Festival Adı', type: 'text', defaultValue: 'SOUNDWAVE MUSIC FESTIVAL 2026' },
      { key: 'accessLevel', label: 'Erişim Seviyesi', type: 'text', defaultValue: 'ALL ACCESS • VIP BACKSTAGE' },
      { key: 'holderName', label: 'Kart Sahibi / Görev', type: 'text', defaultValue: 'GÜNEŞ AKSOY (SOUND ENGINEER)' },
      { key: 'passQr', label: 'Doğrulama QR Kodu', type: 'qrcode', defaultValue: 'https://pass.soundwavefest.com/vip/8892' },
      { key: 'zoneAccess', label: 'İzinli Alanlar', type: 'text', defaultValue: 'MAIN STAGE • GREEN ROOM • MIX TOWER' }
    ],
    defaultData: {
      festTitle: 'SOUNDWAVE MUSIC FESTIVAL 2026',
      accessLevel: 'ALL ACCESS • VIP BACKSTAGE',
      holderName: 'GÜNEŞ AKSOY (SOUND ENGINEER)',
      passQr: 'https://pass.soundwavefest.com/vip/8892',
      zoneAccess: 'MAIN STAGE • GREEN ROOM • MIX TOWER'
    }
  },

  // 139. MÜZE & SERGİ ESER KÜNYESİ (SANATÇI, YIL, TEKNİK, QR)
  {
    id: 'tpl-museum-art-exhibit-placard',
    title: 'Müze & Sanat Galerisi Eser Künyesi',
    category: 'notes',
    description: 'Sergi duvarına asılan sanatçı adı, yapılış yılı, kullanılan teknik, envanter no ve sesli rehber QR kodu.',
    tags: ['müze', 'sergi', 'galeri', 'künye', 'sanatçı', 'tablo', 'sesli rehber'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'artistName', label: 'Sanatçı Adı & Yaşam Yılları', type: 'text', defaultValue: 'FİKRET MUALLA (1903 - 1967)' },
      { key: 'artworkTitle', label: 'Eser Başlığı & Yılı', type: 'text', defaultValue: 'Paris Sokak Kahvesi, 1954' },
      { key: 'mediumDims', label: 'Teknik & Boyut', type: 'text', defaultValue: 'Kağıt üzerine guaj boya • 42 x 58 cm' },
      { key: 'collectionInfo', label: 'Koleksiyon & Bağış', type: 'text', defaultValue: 'Modern Sanat Müzesi Daimi Koleksiyonu' },
      { key: 'audioGuideQr', label: 'Sesli Rehber QR', type: 'qrcode', defaultValue: 'https://museum.art/guide/exhibit-104' }
    ],
    defaultData: {
      artistName: 'FİKRET MUALLA (1903 - 1967)',
      artworkTitle: 'Paris Sokak Kahvesi, 1954',
      mediumDims: 'Kağıt üzerine guaj boya • 42 x 58 cm',
      collectionInfo: 'Modern Sanat Müzesi Daimi Koleksiyonu',
      audioGuideQr: 'https://museum.art/guide/exhibit-104'
    }
  },

  // 140. OTEL BAVUL / BAGAJ EMANET FİŞİ (LUGGAGE CLAIM TAG)
  {
    id: 'tpl-hotel-luggage-claim-check',
    title: 'Otel Bagaj & Bavul Emanet Fişi (Claim Tag)',
    category: 'shipping',
    description: 'Otel resepsiyon ve bellboy emanet bagajları için oda no, bavul adedi ve teslim fişi koçanı.',
    tags: ['otel', 'bagaj', 'bavul', 'emanet', 'bellboy', 'resepsiyon', 'fiş'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'hotelName', label: 'Otel Adı', type: 'text', defaultValue: 'GRAND BOSPHORUS HOTEL' },
      { key: 'claimBarcode', label: 'Emanet Barkodu', type: 'barcode', defaultValue: 'BAG-884102' },
      { key: 'guestRoom', label: 'Misafir & Oda No', type: 'text', defaultValue: 'Mr. David Miller • ODA #604' },
      { key: 'pieceCount', label: 'Bavul Parça Sayısı', type: 'text', defaultValue: 'Toplam: 3 Parça Bagaj' },
      { key: 'checkInTime', label: 'Emanet Alınma Zamanı', type: 'text', defaultValue: '27.08.2026 • 11:30' }
    ],
    defaultData: {
      hotelName: 'GRAND BOSPHORUS HOTEL',
      claimBarcode: 'BAG-884102',
      guestRoom: 'Mr. David Miller • ODA #604',
      pieceCount: 'Toplam: 3 Parça Bagaj',
      checkInTime: '27.08.2026 • 11:30'
    }
  },

  // 141. KONSER BİLEKLİĞİ & GİRİŞ DOĞRULAMA BARKODU
  {
    id: 'tpl-concert-wristband-verification',
    title: 'Konser Bilekliği & Giriş Doğrulama Barkodu',
    category: 'organization',
    description: 'Kola takılan uzun şerit termal bileklikler için kapı barkodu, yaş sınırı (+18) ve sahne önü yetkisi.',
    tags: ['bileklik', 'konser', 'barkod', 'kapı', 'giriş', 'etkinlik'],
    recommendedWidthMm: 150,
    fields: [
      { key: 'eventName', label: 'Konser / Sanatçı', type: 'text', defaultValue: 'ARCTIC MONKEYS LIVE IN ISTANBUL' },
      { key: 'barcodeVal', label: 'Doğrulama Barkodu', type: 'barcode', defaultValue: 'EVT-99201948' },
      { key: 'categoryTier', label: 'Kategori / Kapı', type: 'text', defaultValue: 'SAHNE ÖNÜ (GOLDEN CIRCLE) • KAPI 3' },
      { key: 'ageNotice', label: 'Yaş Sınırı', type: 'text', defaultValue: '18+ ADULT ONLY' }
    ],
    defaultData: {
      eventName: 'ARCTIC MONKEYS LIVE IN ISTANBUL',
      barcodeVal: 'EVT-99201948',
      categoryTier: 'SAHNE ÖNÜ (GOLDEN CIRCLE) • KAPI 3',
      ageNotice: '18+ ADULT ONLY'
    }
  },

  // 142. FOTOĞRAF STÜDYOSU NEGATİF & ÇEKİM ARŞİV ZARFI
  {
    id: 'tpl-photo-studio-negative-envelope',
    title: 'Fotoğraf Stüdyosu Negatif & Çekim Arşiv Zarfı',
    category: 'notes',
    description: '35mm / 120mm analog film banyo detayları, ISO hassasiyeti, kimyasal banyo süresi ve müşteri arşiv no.',
    tags: ['fotoğraf', 'analog film', '35mm', 'negatif', 'banyo', 'karanlık oda', 'arşiv'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'studioName', label: 'Stüdyo / Karanlık Oda', type: 'text', defaultValue: 'MONOCHROME ANALOG LAB ISTANBUL' },
      { key: 'filmType', label: 'Film Çeşidi & ISO', type: 'text', defaultValue: 'Kodak Tri-X 400 • 35mm / 36 Poz' },
      { key: 'devFormula', label: 'Geliştirici & Süre', type: 'text', defaultValue: 'D-76 (1+1) • 20°C • 9.5 Dakika' },
      { key: 'clientArchive', label: 'Müşteri & Rulo Kodu', type: 'barcode', defaultValue: 'FILM-2026-904' }
    ],
    defaultData: {
      studioName: 'MONOCHROME ANALOG LAB ISTANBUL',
      filmType: 'Kodak Tri-X 400 • 35mm / 36 Poz',
      devFormula: 'D-76 (1+1) • 20°C • 9.5 Dakika',
      clientArchive: 'FILM-2026-904'
    }
  },

  // 143. DÜĞÜN & DAVETİYE MASA OTURMA PLANI / İSİM KARTI
  {
    id: 'tpl-wedding-table-seating-card',
    title: 'Düğün & Davetiye Masa Oturma Planı Kartı',
    category: 'organization',
    description: 'Zarif tipografik masa numarası, davetli isimleri ve menü seçimi (Et / Vejetaryen).',
    tags: ['düğün', 'davetiye', 'masa kartı', 'oturma planı', 'zarif', 'etkinlik'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'coupleNames', label: 'Çift İsimleri', type: 'text', defaultValue: 'ZEYNEP & EMRE' },
      { key: 'tableNumber', label: 'Masa Numarası', type: 'text', defaultValue: 'MASA 08' },
      { key: 'guestName', label: 'Davetli Ad & Soyad', type: 'text', defaultValue: 'Sayın Aslı & Kerem Yılmaz' },
      { key: 'menuChoice', label: 'Menü Tercihi', type: 'text', defaultValue: 'Özel Gurme Menü (Vejetaryen Alternatifli)' },
      { key: 'weddingDate', label: 'Tarih & Mekan', type: 'text', defaultValue: '27 Ağustos 2026 • Esma Sultan Yalısı' }
    ],
    defaultData: {
      coupleNames: 'ZEYNEP & EMRE',
      tableNumber: 'MASA 08',
      guestName: 'Sayın Aslı & Kerem Yılmaz',
      menuChoice: 'Özel Gurme Menü (Vejetaryen Alternatifli)',
      weddingDate: '27 Ağustos 2026 • Esma Sultan Yalısı'
    }
  },

  // 144. ESCAPE ROOM / KAÇIŞ OYUNU İPUCU & SÜRE KARTI
  {
    id: 'tpl-escape-room-clue-timer-card',
    title: 'Escape Room / Kaçış Oyunu İpucu & Süre Kartı',
    category: 'stickers',
    description: 'Kriptolu oda ipuçları, kalan süre (60 dk), şifre çözücü semboller ve termal görev fişi.',
    tags: ['kaçış oyunu', 'escape room', 'ipucu', 'şifre', 'görev', 'kripto', 'oyun'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'roomName', label: 'Oda / Görev Adı', type: 'text', defaultValue: 'ODA: SİMYACININ GİZLİ MAHZENİ' },
      { key: 'clueText', label: 'Kriptolu İpucu', type: 'text', defaultValue: 'İPUCU #03: "Güneşin doğduğu raftaki 4. kitabın arkasına bak."' },
      { key: 'timeLimit', label: 'Toplam Kalan Süre', type: 'text', defaultValue: '⏳ Kalan Süre: 24:18 Dakika' },
      { key: 'codeHint', label: 'Kilit Şifre Şablonu', type: 'text', defaultValue: 'KOD: [ _ _ - 8 9 - _ _ ]' }
    ],
    defaultData: {
      roomName: 'ODA: SİMYACININ GİZLİ MAHZENİ',
      clueText: 'İPUCU #03: "Güneşin doğduğu raftaki 4. kitabın arkasına bak."',
      timeLimit: '⏳ Kalan Süre: 24:18 Dakika',
      codeHint: 'KOD: [ _ _ - 8 9 - _ _ ]'
    }
  },

  // 145. "CTRL + Z / UNDO" RETRO BİLGİSAYAR HATA ÇIKARTMASI
  {
    id: 'tpl-ctrl-z-undo-retro-pc-sticker',
    title: 'Ctrl + Z / Undo Retro Bilgisayar Hata Çıkartması',
    category: 'stickers',
    description: '90lar Windows pop-up penceresi, geri al butonu ve yazılımcı/tasarımcı için eğlenceli sticker.',
    tags: ['ctrl z', 'undo', 'retro pc', '90lar', 'yazılımcı', 'tasarımcı', 'sticker'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'windowTitle', label: 'Pencere Başlığı', type: 'text', defaultValue: 'CRITICAL_ERROR.EXE' },
      { key: 'mainPunchline', label: 'Vurgu / Kısayol', type: 'text', defaultValue: 'CTRL + Z' },
      { key: 'subMessage', label: 'Açıklama Metni', type: 'text', defaultValue: 'I wish real life had an undo button for today.' },
      { key: 'buttonText', label: 'Diyalog Butonu', type: 'text', defaultValue: '[ REVERT CHANGES ]' }
    ],
    defaultData: {
      windowTitle: 'CRITICAL_ERROR.EXE',
      mainPunchline: 'CTRL + Z',
      subMessage: 'I wish real life had an undo button for today.',
      buttonText: '[ REVERT CHANGES ]'
    }
  },

  // 146. KİTAP KURDU / OKUMA HEDEFİ & SAYFA İLERLEME AYRACI
  {
    id: 'tpl-bookworm-reading-goal-tracker',
    title: 'Kitap Kurdu / Okuma Hedefi & Sayfa İlerleme Ayracı',
    category: 'notes',
    description: 'Kitap arasına konulan 57mm/70mm termal kitap ayracı; kitap adı, başlama tarihi, favori alıntı ve sayfa kutucukları.',
    tags: ['kitap', 'ayraç', 'okuma hedefi', 'alıntı', 'sayfa takip', 'kitap kurdu', 'not'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'bookTitle', label: 'Kitap & Yazar Adı', type: 'text', defaultValue: 'DUNE • Frank Herbert' },
      { key: 'startDate', label: 'Başlangıç Tarihi & Sayfa', type: 'text', defaultValue: 'Başlama: 20.08.2026 • 712 Sayfa' },
      { key: 'favoriteQuote', label: 'Favori Alıntı', type: 'text', defaultValue: '"Korku aklın katilidir; korku toptan yok oluşu getiren küçük ölümdür."' },
      { key: 'ratingScore', label: 'Kişisel Puanlama', type: 'text', defaultValue: 'Puan: ★★★★★ (5/5)' }
    ],
    defaultData: {
      bookTitle: 'DUNE • Frank Herbert',
      startDate: 'Başlama: 20.08.2026 • 712 Sayfa',
      favoriteQuote: '"Korku aklın katilidir; korku toptan yok oluşu getiren küçük ölümdür."',
      ratingScore: 'Puan: ★★★★★ (5/5)'
    }
  },

  // 147. MİNİMALİST BİTKİ BAKIM & SULAMA HATIRLATICI ÇUBUĞU
  {
    id: 'tpl-plant-care-watering-stake',
    title: 'Minimalist Bitki Bakım & Sulama Hatırlatıcı Çubuğu',
    category: 'organization',
    description: 'Saksıya takılan veya yapıştırılan bitki türü, sulama sıklığı (haftada 1), ışık ihtiyacı ve son saksı değişimi.',
    tags: ['bitki', 'saksı', 'sulama', 'monstera', 'sukulent', 'botanik', 'bakım'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'plantName', label: 'Bitki Adı (Botanik)', type: 'text', defaultValue: 'Monstera Deliciosa (Deve Tabanı)' },
      { key: 'wateringSchedule', label: 'Sulama Periyodu', type: 'text', defaultValue: 'Haftada 1 Kez (Toprak kuruyunca)' },
      { key: 'lightReq', label: 'Işık & Nem İhtiyacı', type: 'text', defaultValue: 'Dolaylı Parlak Işık • Yüksek Nem' },
      { key: 'lastRepot', label: 'Son Toprak Değişimi', type: 'text', defaultValue: 'Toprak Değişimi: Bahar 2026' }
    ],
    defaultData: {
      plantName: 'Monstera Deliciosa (Deve Tabanı)',
      wateringSchedule: 'Haftada 1 Kez (Toprak kuruyunca)',
      lightReq: 'Dolaylı Parlak Işık • Yüksek Nem',
      lastRepot: 'Toprak Değişimi: Bahar 2026'
    }
  },

  // 148. POMODORO & DERİN ÇALIŞMA (FOCUS MODE: DO NOT DISTURB)
  {
    id: 'tpl-pomodoro-deep-focus-dnd',
    title: 'Pomodoro & Derin Çalışma (Focus Mode: DND)',
    category: 'notes',
    description: 'Ofis ve masa üstü için 25 dk odaklanma oturumu, seans hedefi ve "Lütfen Rahatsız Etmeyiniz" uyarısı.',
    tags: ['pomodoro', 'odak', 'çalışma', 'dnd', 'rahatsız etmeyin', 'üretkenlik', 'seans'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'statusHeader', label: 'Durum Başlığı', type: 'text', defaultValue: 'DEEP WORK IN PROGRESS' },
      { key: 'taskGoal', label: 'Mevcut Seans Hedefi', type: 'text', defaultValue: 'GÖREV: API Mimarisi & Kod Refactor' },
      { key: 'sessionInfo', label: 'Pomodoro Seansı', type: 'text', defaultValue: 'Seans: 25 Dakika Odaklanma • 5 Dk Mola' },
      { key: 'dndNotice', label: 'Alt Uyarı', type: 'text', defaultValue: '🚫 Lütfen Bölmeyiniz • Odaklanma Modu Aktif' }
    ],
    defaultData: {
      statusHeader: 'DEEP WORK IN PROGRESS',
      taskGoal: 'GÖREV: API Mimarisi & Kod Refactor',
      sessionInfo: 'Seans: 25 Dakika Odaklanma • 5 Dk Mola',
      dndNotice: '🚫 Lütfen Bölmeyiniz • Odaklanma Modu Aktif'
    }
  },

  // 149. "DO NOT OPEN UNTIL CHRISTMAS / BIRTHDAY" HEDİYE MÜHRÜ
  {
    id: 'tpl-do-not-open-until-gift-seal',
    title: 'Özel Gün & Hediye Paketi Açılmama Mührü',
    category: 'stickers',
    description: 'Hediye paketleri için belirtilen tarihten önce açılmasını yasaklayan eğlenceli mühür ve gizli mesaj.',
    tags: ['hediye', 'do not open', 'doğum günü', 'yılbaşı', 'sürpriz', 'mühür', 'paket'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'sealTitle', label: 'Mühür Başlığı', type: 'text', defaultValue: 'TOP SECRET • SPECIAL DELIVERY' },
      { key: 'prohibitionDate', label: 'Açılma Tarihi Kuralı', type: 'text', defaultValue: 'DO NOT OPEN UNTIL 31 DECEMBER' },
      { key: 'recipientSender', label: 'Kime / Kimden', type: 'text', defaultValue: 'Kime: Sevgili Defne • Kimden: Gizli Noel Baba' },
      { key: 'penaltyNote', label: 'İhlal Cezası', type: 'text', defaultValue: 'Erken açanlara sürpriz hediyeler iptal olur!' }
    ],
    defaultData: {
      sealTitle: 'TOP SECRET • SPECIAL DELIVERY',
      prohibitionDate: 'DO NOT OPEN UNTIL 31 DECEMBER',
      recipientSender: 'Kime: Sevgili Defne • Kimden: Gizli Noel Baba',
      penaltyNote: 'Erken açanlara sürpriz hediyeler iptal olur!'
    }
  },

  // 150. KLASİK TİPOGRAFİK 'THANK YOU FOR YOUR PURCHASE' KARTI
  {
    id: 'tpl-classic-typography-thank-you-card',
    title: 'Klasik Tipografik Teşekkür & Butik Sipariş Kartı',
    category: 'stickers',
    description: 'E-ticaret ve butik sipariş kutuları için el yapımı teşekkür notu, sosyal medya hesabı ve indirim kuponu.',
    tags: ['teşekkür', 'thank you', 'butik', 'e-ticaret', 'sipariş', 'kupon', 'zarif'],
    recommendedWidthMm: 70,
    fields: [
      { key: 'thankYouHeader', label: 'Teşekkür Başlığı', type: 'text', defaultValue: 'Thank You For Supporting Small Business!' },
      { key: 'personalizedNote', label: 'Samimi Mesaj', type: 'text', defaultValue: 'Bu sipariş sizin için özen ve sevgiyle elde hazırlandı.' },
      { key: 'couponCode', label: 'Sonraki Sipariş İndirimi', type: 'text', defaultValue: 'KOD: THANKYOU15 (%15 İndirim)' },
      { key: 'socialMedia', label: 'Sosyal Medya Hesabı', type: 'text', defaultValue: '@atelierslowlife • Paylaşımlarınızı etiketleyin!' }
    ],
    defaultData: {
      thankYouHeader: 'Thank You For Supporting Small Business!',
      personalizedNote: 'Bu sipariş sizin için özen ve sevgiyle elde hazırlandı.',
      couponCode: 'KOD: THANKYOU15 (%15 İndirim)',
      socialMedia: '@atelierslowlife • Paylaşımlarınızı etiketleyin!'
    }
  },

  // =========================================================================
  // PAZARYERİ VE E-TİCARET KARGO BARKODLARI (TRENDYOL, HEPSİBURADA, AMAZON, VB.)
  // =========================================================================

  // 151. TRENDYOL RESMİ SİPARİŞ & KARGO GÖNDERİ BELGESİ (10x15 CM / 100x150 MM)
  {
    id: 'tpl-trendyol-official-shipping-10x15',
    title: 'Trendyol Resmi Kargo & Sipariş Belgesi (10x15 cm)',
    category: 'ecommerce_shipping',
    description: 'Trendyol resmi satıcı paneli formatında; anlaşma uyarısı, alıcı bilgileri, kargo barkodu ve ürün çeki listesi tablosu.',
    tags: ['trendyol', 'kargo', 'sipariş', 'e-ticaret', '10x15', '100x150', 'sürat', 'yurtiçi', 'barkod'],
    recommendedWidthMm: 100,
    heightMm: 150,
    fields: [
      { key: 'marketplaceWarning', label: 'Kargo Anlaşma Uyarısı', type: 'textarea', defaultValue: 'Kargo şirketinin dikkatine, bu bir trendyol.com gönderisidir. Trendyol anlaşmasına uygun işlem yapabilirsiniz.' },
      { key: 'orderNumber', label: 'Trendyol Sipariş No', type: 'text', defaultValue: '2391425900' },
      { key: 'recipientName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'ALİ DAĞTAŞ' },
      { key: 'recipientAddress', label: 'Alıcı Açık Adres', type: 'textarea', defaultValue: 'Erenköy MH. Şelale Sok. YASER AP. No:17/1 Selçuklu/ konya' },
      { key: 'recipientDistrictCity', label: 'İlçe / İl', type: 'text', defaultValue: 'Erenköy Mah • Selçuklu / KONYA' },
      { key: 'originBranch', label: 'Çıkış Şubesi', type: 'text', defaultValue: 'Buğday Şube' },
      { key: 'barcodeVal', label: 'Kargo Takip Barkodu', type: 'barcode', defaultValue: '7270012031149210' },
      { key: 'packageItemCount', label: 'Sıra No / Paket Adedi', type: 'text', defaultValue: '1' },
      { key: 'productName', label: 'Ürün Adı & Model', type: 'textarea', defaultValue: 'Tourneo Courier Arka Koltuk 2+1 Oto Koltuk Kılıfı Siyah Ön Arka Tam Takım Uyumlu TourneoCourier-2+1, one size' },
      { key: 'productQty', label: 'Sipariş Adedi', type: 'text', defaultValue: '1 Adet' },
      { key: 'productColor', label: 'Ürün Rengi', type: 'text', defaultValue: 'SİYAH' },
      { key: 'productSize', label: 'Beden / Ebat', type: 'text', defaultValue: 'Tek Ebat' },
      { key: 'productBarcode', label: 'Ürün EAN / Barkod', type: 'text', defaultValue: '23111701787' },
      { key: 'productSku', label: 'Stok Kodu (SKU)', type: 'text', defaultValue: 'O-KOLT-TY-01' }
    ],
    defaultData: {
      marketplaceWarning: 'Kargo şirketinin dikkatine, bu bir trendyol.com gönderisidir. Trendyol anlaşmasına uygun işlem yapabilirsiniz.',
      orderNumber: '2391425900',
      recipientName: 'ALİ DAĞTAŞ',
      recipientAddress: 'Erenköy MH. Şelale Sok. YASER AP. No:17/1 Selçuklu/ konya',
      recipientDistrictCity: 'Erenköy Mah • Selçuklu / KONYA',
      originBranch: 'Buğday Şube',
      barcodeVal: '7270012031149210',
      packageItemCount: '1',
      productName: 'Tourneo Courier Arka Koltuk 2+1 Oto Koltuk Kılıfı Siyah Ön Arka Tam Takım Uyumlu TourneoCourier-2+1, one size',
      productQty: '1 Adet',
      productColor: 'SİYAH',
      productSize: 'Tek Ebat',
      productBarcode: '23111701787',
      productSku: 'O-KOLT-TY-01'
    }
  },

  // 152. TRENDYOL KARE KOLİ & HIZLI KARGO BARKODU (10x10 CM / 100x100 MM)
  {
    id: 'tpl-trendyol-square-box-10x10',
    title: 'Trendyol Kare Koli Barkodu (10x10 cm)',
    category: 'ecommerce_shipping',
    description: '10x10 cm kare termal koli etiketleri için Trendyol HUB transfer kodu ve büyük kargo barkodu.',
    tags: ['trendyol', 'koli', '10x10', '100x100', 'kare', 'kargo', 'tex'],
    recommendedWidthMm: 100,
    heightMm: 100,
    fields: [
      { key: 'hubCode', label: 'Hub Rota Kodu', type: 'text', defaultValue: 'HUB: TY-KNY-04' },
      { key: 'customerName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'ALİ DAĞTAŞ' },
      { key: 'addressLine', label: 'Kısa Adres', type: 'text', defaultValue: 'Erenköy Mh. Şelale Sk. No:17/1' },
      { key: 'destination', label: 'Hedef Şehir / İlçe', type: 'text', defaultValue: 'SELÇUKLU / KONYA' },
      { key: 'orderNo', label: 'Trendyol Sipariş No', type: 'text', defaultValue: 'TY-2391425900' },
      { key: 'pieceInfo', label: 'Koli / Desi Bilgisi', type: 'text', defaultValue: 'Koli 1 / 1 (Desi: 2.5)' },
      { key: 'barcode', label: 'Kargo Barkodu', type: 'barcode', defaultValue: '7270012031149210' },
      { key: 'itemSummary', label: 'Paket Özeti', type: 'text', defaultValue: 'Oto Koltuk Kılıfı Siyah Tam Takım' }
    ],
    defaultData: {
      hubCode: 'HUB: TY-KNY-04',
      customerName: 'ALİ DAĞTAŞ',
      addressLine: 'Erenköy Mh. Şelale Sk. No:17/1',
      destination: 'SELÇUKLU / KONYA',
      orderNo: 'TY-2391425900',
      pieceInfo: 'Koli 1 / 1 (Desi: 2.5)',
      barcode: '7270012031149210',
      itemSummary: 'Oto Koltuk Kılıfı Siyah Tam Takım'
    }
  },

  // 153. TRENDYOL MİNİ TERMAL KARGO FİŞİ (57 MM RULO)
  {
    id: 'tpl-trendyol-mini-slip-57mm',
    title: 'Trendyol Mini Termal Kargo Fişi (57 mm)',
    category: 'ecommerce_shipping',
    description: '57mm taşınabilir mobil termal yazıcılar için sıkıştırılmış Trendyol sipariş ve takip barkodu fişi.',
    tags: ['trendyol', '57mm', 'mini', 'rulo', 'fiş', 'kargo'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'orderNo', label: 'Sipariş No', type: 'text', defaultValue: '2391425900' },
      { key: 'recipient', label: 'Alıcı', type: 'text', defaultValue: 'ALİ DAĞTAŞ' },
      { key: 'city', label: 'İlçe / İl', type: 'text', defaultValue: 'Erenköy Mah. Selçuklu / KONYA' },
      { key: 'barcode', label: 'Kargo Barkodu', type: 'barcode', defaultValue: '7270012031149210' },
      { key: 'sku', label: 'Ürün Kodu', type: 'text', defaultValue: 'SKU: 23111701787' }
    ],
    defaultData: {
      orderNo: '2391425900',
      recipient: 'ALİ DAĞTAŞ',
      city: 'Erenköy Mah. Selçuklu / KONYA',
      barcode: '7270012031149210',
      sku: 'SKU: 23111701787'
    }
  },

  // 154. TRENDYOL EXPRESS (TEX) HIZLI DAĞITIM BARKODU (80 MM / 10x10 CM)
  {
    id: 'tpl-trendyol-express-tex-80mm',
    title: 'Trendyol Express (TEX) Dağıtım Barkodu (80 mm)',
    category: 'ecommerce_shipping',
    description: 'Trendyol Express kurye dağıtımı için büyük rota hub kodu, müşteri teslimat PIN kodu ve takip barkodu.',
    tags: ['tex', 'trendyol express', 'kurye', 'pin', '80mm', 'rota', 'dağıtım'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'customerPin', label: 'Müşteri Teslimat PIN', type: 'text', defaultValue: '7841' },
      { key: 'texHubCode', label: 'TEX Rota Hub Kodu', type: 'text', defaultValue: '34-IST-KAD-02' },
      { key: 'recipientName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'ALİ DAĞTAŞ' },
      { key: 'deliveryAddress', label: 'Teslimat Adresi', type: 'textarea', defaultValue: 'Caferağa Mah. Moda Cad. No:44 Kadıköy / İSTANBUL' },
      { key: 'texBarcode', label: 'TEX Takip Barkodu', type: 'barcode', defaultValue: 'TEX994182901TR' },
      { key: 'timeSlot', label: 'Teslimat Zaman Dilimi', type: 'text', defaultValue: '09:00 - 13:00' },
      { key: 'orderId', label: 'Sipariş No', type: 'text', defaultValue: '2391425900' }
    ],
    defaultData: {
      customerPin: '7841',
      texHubCode: '34-IST-KAD-02',
      recipientName: 'ALİ DAĞTAŞ',
      deliveryAddress: 'Caferağa Mah. Moda Cad. No:44 Kadıköy / İSTANBUL',
      texBarcode: 'TEX994182901TR',
      timeSlot: '09:00 - 13:00',
      orderId: '2391425900'
    }
  },

  // 155. HEPSİBURADA RESMİ SİPARİŞ & HEPSİJET KARGO ETİKETİ (10x15 CM / 100x150 MM)
  {
    id: 'tpl-hepsiburada-official-shipping-10x15',
    title: 'Hepsiburada Resmi Sipariş & HepsiJet Etiketi (10x15 cm)',
    category: 'ecommerce_shipping',
    description: 'Hepsiburada pazaryeri anlaşması, HepsiJet rota transfer kodu, QR karekod ve paket içerik dökümü.',
    tags: ['hepsiburada', 'hepsijet', 'kargo', 'pazaryeri', '10x15', '100x150', 'e-ticaret'],
    recommendedWidthMm: 100,
    heightMm: 150,
    fields: [
      { key: 'platformNotice', label: 'Platform Sevk Notu', type: 'text', defaultValue: 'Hepsiburada.com e-ticaret gönderisidir. Anlaşmalı taşıyıcı güvencesiyle sevk edilmiştir.' },
      { key: 'desiWeight', label: 'Desi / Ağırlık', type: 'text', defaultValue: '1.8 Desi • 0.95 Kg' },
      { key: 'orderNumber', label: 'HB Sipariş No', type: 'text', defaultValue: 'HB-849102839' },
      { key: 'deliveryNumber', label: 'HepsiJet Teslimat Kodu', type: 'text', defaultValue: 'HJ-994182901' },
      { key: 'recipientName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'MEHMET EMİN KAYA' },
      { key: 'recipientPhone', label: 'Telefon No', type: 'text', defaultValue: '0532 *** ** 44' },
      { key: 'recipientAddress', label: 'Açık Adres', type: 'textarea', defaultValue: 'Mustafa Kemal Mah. 2118 Cad. No:4/A Çankaya / ANKARA' },
      { key: 'hubRoute', label: 'HepsiJet Transfer Hub', type: 'text', defaultValue: 'ANK-HUB-04' },
      { key: 'barcodeVal', label: 'Kargo Takip Barkodu', type: 'barcode', defaultValue: 'HJ669018471TR' },
      { key: 'itemsList', label: 'Paket İçi Ürünler', type: 'textarea', defaultValue: '1x Kablosuz Mekanik Klavye RGB • Beden: Standart • SKU: HB-KEY-99' },
      { key: 'dispatchWarehouse', label: 'Çıkış Deposu', type: 'text', defaultValue: 'Gebze 1 Ana Depo' }
    ],
    defaultData: {
      platformNotice: 'Hepsiburada.com e-ticaret gönderisidir. Anlaşmalı taşıyıcı güvencesiyle sevk edilmiştir.',
      desiWeight: '1.8 Desi • 0.95 Kg',
      orderNumber: 'HB-849102839',
      deliveryNumber: 'HJ-994182901',
      recipientName: 'MEHMET EMİN KAYA',
      recipientPhone: '0532 *** ** 44',
      recipientAddress: 'Mustafa Kemal Mah. 2118 Cad. No:4/A Çankaya / ANKARA',
      hubRoute: 'ANK-HUB-04',
      barcodeVal: 'HJ669018471TR',
      itemsList: '1x Kablosuz Mekanik Klavye RGB • Beden: Standart • SKU: HB-KEY-99',
      dispatchWarehouse: 'Gebze 1 Ana Depo'
    }
  },

  // 156. HEPSİBURADA / HEPSİJET KARE KOLİ BARKODU (10x10 CM / 100x100 MM)
  {
    id: 'tpl-hepsiburada-square-box-10x10',
    title: 'Hepsiburada / HepsiJet Koli Barkodu (10x10 cm)',
    category: 'ecommerce_shipping',
    description: '10x10 cm kare termal kutular için HepsiJet bölge hub kodu ve takip barkodu.',
    tags: ['hepsiburada', 'hepsijet', '10x10', '100x100', 'koli', 'kargo'],
    recommendedWidthMm: 100,
    heightMm: 100,
    fields: [
      { key: 'recipient', label: 'Teslim Alacak Kişi', type: 'text', defaultValue: 'AYŞE YILMAZ' },
      { key: 'cityDistrict', label: 'İlçe / İl', type: 'text', defaultValue: 'KADIKÖY / İSTANBUL' },
      { key: 'hubCode', label: 'Transfer Hub', type: 'text', defaultValue: 'IST-AVP-HUB-12' },
      { key: 'desi', label: 'Desi', type: 'text', defaultValue: '3 Desi' },
      { key: 'dispatchDate', label: 'Sevk Tarihi', type: 'text', defaultValue: '27.08.2026' },
      { key: 'barcodeVal', label: 'HepsiJet Barkodu', type: 'barcode', defaultValue: 'HJ889127401TR' },
      { key: 'orderNo', label: 'HB Sipariş No', type: 'text', defaultValue: 'HB-10294821' }
    ],
    defaultData: {
      recipient: 'AYŞE YILMAZ',
      cityDistrict: 'KADIKÖY / İSTANBUL',
      hubCode: 'IST-AVP-HUB-12',
      desi: '3 Desi',
      dispatchDate: '27.08.2026',
      barcodeVal: 'HJ889127401TR',
      orderNo: 'HB-10294821'
    }
  },

  // 157. HEPSİBURADA MİNİ POS KARGO FİŞİ (57 MM RULO)
  {
    id: 'tpl-hepsiburada-mini-slip-57mm',
    title: 'Hepsiburada Mini POS Kargo Fişi (57 mm)',
    category: 'ecommerce_shipping',
    description: '57mm rulo fiş yazıcıları için kompakt Hepsiburada sipariş ve kargo takip fişi.',
    tags: ['hepsiburada', '57mm', 'mini', 'fiş', 'kargo', 'hepsijet'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'orderId', label: 'HB Sipariş No', type: 'text', defaultValue: 'HB-991204' },
      { key: 'customer', label: 'Müşteri Adı', type: 'text', defaultValue: 'SERKAN DEMİR' },
      { key: 'city', label: 'İlçe / Şehir', type: 'text', defaultValue: 'Çankaya / ANKARA' },
      { key: 'barcode', label: 'HepsiJet Takip Barkodu', type: 'barcode', defaultValue: 'HJ99120488TR' },
      { key: 'skuSummary', label: 'Ürün Özeti', type: 'text', defaultValue: '1x Bluetooth Kulaklık ANC' }
    ],
    defaultData: {
      orderId: 'HB-991204',
      customer: 'SERKAN DEMİR',
      city: 'Çankaya / ANKARA',
      barcode: 'HJ99120488TR',
      skuSummary: '1x Bluetooth Kulaklık ANC'
    }
  },

  // 158. AMAZON FBA & MFN KARGO & SEVKİYAT ETİKETİ (10x15 CM / 4x6")
  {
    id: 'tpl-amazon-fba-mfn-global-10x15',
    title: 'Amazon FBA & MFN Global Kargo Etiketi (10x15 cm)',
    category: 'ecommerce_shipping',
    description: 'Amazon Prime / USPS Priority 4x6" rulo formatı; rota kodu (Q), çift barkod, 2D DataMatrix ve GTIN/SSCC onay bloğu.',
    tags: ['amazon', 'fba', 'mfn', 'usps', 'global', '10x15', '4x6', 'kargo', 'ihracat'],
    recommendedWidthMm: 100,
    heightMm: 150,
    fields: [
      { key: 'routeLetter', label: 'Rota Harf Kodu', type: 'text', defaultValue: 'Q' },
      { key: 'carrierService', label: 'Kargo Servis Adı', type: 'text', defaultValue: 'AMAZON PRIME DELIVERY / USPS PRIORITY MAIL' },
      { key: 'smallBarcode', label: 'Üst Takip Barkodu', type: 'barcode', defaultValue: '12347678' },
      { key: 'postDate', label: 'Posta Tarihi', type: 'text', defaultValue: '08/27/2026' },
      { key: 'fromZip', label: 'Çıkış Posta Kodu', type: 'text', defaultValue: 'TR-34000 IST' },
      { key: 'shipToName', label: 'Alıcı / Ship To', type: 'text', defaultValue: 'StanyoarE' },
      { key: 'shipToAddress', label: 'Alıcı Adresi', type: 'text', defaultValue: '127 wills avenue bgidge' },
      { key: 'shipToCityZip', label: 'Şehir, Eyalet, Zip', type: 'text', defaultValue: 'Allen streetN,10041 NY, USA' },
      { key: 'gtinSscc', label: '2D Karekod GTIN / SSCC', type: 'text', defaultValue: '(01) 0 0000123 00501 2' },
      { key: 'bigBarcode', label: 'Alt Büyük Teslimat Barkodu', type: 'barcode', defaultValue: '7270012031149210' },
      { key: 'footerSecurity', label: 'Güvenlik Dipnotu', type: 'text', defaultValue: 'The safe way to pay and deliver online' }
    ],
    defaultData: {
      routeLetter: 'Q',
      carrierService: 'AMAZON PRIME DELIVERY / USPS PRIORITY MAIL',
      smallBarcode: '12347678',
      postDate: '08/27/2026',
      fromZip: 'TR-34000 IST',
      shipToName: 'StanyoarE',
      shipToAddress: '127 wills avenue bgidge',
      shipToCityZip: 'Allen streetN,10041 NY, USA',
      gtinSscc: '(01) 0 0000123 00501 2',
      bigBarcode: '7270012031149210',
      footerSecurity: 'The safe way to pay and deliver online'
    }
  },

  // 159. AMAZON FBA KOLİ & PALET GİRİŞ BARKODU (10x10 CM / 100x100 MM)
  {
    id: 'tpl-amazon-fba-inbound-box-10x10',
    title: 'Amazon FBA Koli & Depo Giriş Barkodu (10x10 cm)',
    category: 'ecommerce_shipping',
    description: 'Amazon Lojistik Lojman Deposu (FC) için FBA Shipment ID, Koli sayısı ve FNSKU koli etiketi.',
    tags: ['amazon', 'fba', 'koli', 'depo', 'inbound', 'fnsku', '10x10', '100x100'],
    recommendedWidthMm: 100,
    heightMm: 100,
    fields: [
      { key: 'fcDestination', label: 'Amazon FC Hedef Depo', type: 'text', defaultValue: 'FC: TR01 - İSTANBUL' },
      { key: 'shipmentId', label: 'FBA Sevkiyat ID', type: 'text', defaultValue: 'FBA15J994KKL' },
      { key: 'boxNumber', label: 'Koli Sayısı (Box Count)', type: 'text', defaultValue: 'BOX 1 OF 6' },
      { key: 'fnskuBarcode', label: 'Koli FNSKU Barkodu', type: 'barcode', defaultValue: 'X0019AB872' },
      { key: 'grossWeight', label: 'Brüt Koli Ağırlığı', type: 'text', defaultValue: '14.2 KG (MAX 15KG)' },
      { key: 'mixedSkuNotice', label: 'SKU Tipi', type: 'text', defaultValue: 'MIXED SKU INBOUND' }
    ],
    defaultData: {
      fcDestination: 'FC: TR01 - İSTANBUL',
      shipmentId: 'FBA15J994KKL',
      boxNumber: 'BOX 1 OF 6',
      fnskuBarcode: 'X0019AB872',
      grossWeight: '14.2 KG (MAX 15KG)',
      mixedSkuNotice: 'MIXED SKU INBOUND'
    }
  },

  // 160. AMAZON MİNİ FNSKU & KARGO SLIP (57 MM RULO)
  {
    id: 'tpl-amazon-mini-fnsku-slip-57mm',
    title: 'Amazon Mini FNSKU & Kargo Slip (57 mm)',
    category: 'ecommerce_shipping',
    description: '57mm rulo için Amazon satıcı MFN kargo takip no ve ürün FNSKU etiket slipi.',
    tags: ['amazon', 'fnsku', '57mm', 'mfn', 'kolay gelsin', 'mini'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'orderId', label: 'Amazon Sipariş No', type: 'text', defaultValue: '408-1928471-88912' },
      { key: 'itemTitle', label: 'Ürün Adı', type: 'text', defaultValue: 'Organic Cotton T-Shirt Black L Size' },
      { key: 'barcode', label: 'Amazon Takip Barkodu', type: 'barcode', defaultValue: '408192847188' },
      { key: 'asinFnsku', label: 'FNSKU / ASIN', type: 'text', defaultValue: 'X0028ABCDE' },
      { key: 'shipCarrier', label: 'Kargo Taşıyıcı', type: 'text', defaultValue: 'Kolay Gelsin' }
    ],
    defaultData: {
      orderId: '408-1928471-88912',
      itemTitle: 'Organic Cotton T-Shirt Black L Size',
      barcode: '408192847188',
      asinFnsku: 'X0028ABCDE',
      shipCarrier: 'Kolay Gelsin'
    }
  },

  // 161. ÇİÇEKSEPETİ HEDİYE NOTLU KARGO ETİKETİ (10x15 CM / 100x150 MM)
  {
    id: 'tpl-ciceksepeti-gift-shipping-10x15',
    title: 'Çiçeksepeti Hediye Notlu Kargo Etiketi (10x15 cm)',
    category: 'ecommerce_shipping',
    description: 'Çiçeksepeti gönderileri için kargo takip barkodu, teslimat zaman aralığı ve özel zarf formatında tebrik notu.',
    tags: ['çiçeksepeti', 'hediye', 'not', 'kargo', '10x15', '100x150', 'özel gün'],
    recommendedWidthMm: 100,
    heightMm: 150,
    fields: [
      { key: 'deliverySlot', label: 'Teslimat Saati', type: 'text', defaultValue: 'BUGÜN: 14:00 - 18:00' },
      { key: 'orderNo', label: 'ÇS Sipariş No', type: 'text', defaultValue: 'CS-7719203' },
      { key: 'recipientName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'ZEYNEP GÜLER' },
      { key: 'recipientPhone', label: 'Telefon', type: 'text', defaultValue: '0544 *** ** 88' },
      { key: 'address', label: 'Teslimat Adresi', type: 'textarea', defaultValue: 'Bağdat Caddesi No:142/8 Kadıköy / İSTANBUL' },
      { key: 'giftCardTitle', label: 'Hediye Kartı Başlığı', type: 'text', defaultValue: 'ÖZEL HEDİYE KARTI NOTU' },
      { key: 'giftMessage', label: 'Hediye Mesajı', type: 'textarea', defaultValue: 'Nice mutlu, sağlıklı ve başarı dolu yaşlara canım arkadaşım! İyi ki varsın...' },
      { key: 'senderName', label: 'Gönderen İmzası', type: 'text', defaultValue: '— Gönderen: Can & Deniz' },
      { key: 'courierBarcode', label: 'Kurye Takip Barkodu', type: 'barcode', defaultValue: 'CS99201481TR' }
    ],
    defaultData: {
      deliverySlot: 'BUGÜN: 14:00 - 18:00',
      orderNo: 'CS-7719203',
      recipientName: 'ZEYNEP GÜLER',
      recipientPhone: '0544 *** ** 88',
      address: 'Bağdat Caddesi No:142/8 Kadıköy / İSTANBUL',
      giftCardTitle: 'ÖZEL HEDİYE KARTI NOTU',
      giftMessage: 'Nice mutlu, sağlıklı ve başarı dolu yaşlara canım arkadaşım! İyi ki varsın...',
      senderName: '— Gönderen: Can & Deniz',
      courierBarcode: 'CS99201481TR'
    }
  },

  // 162. ÇOKLU KARGO ENTEGRASYONLU SEVK İRSALİYESİ (10x15 CM / 100x150 MM)
  {
    id: 'tpl-universal-courier-shipping-10x15',
    title: 'Universal Kargo (Yurtiçi/Aras/MNG/PTT/Sürat) Sevk Belgesi (10x15 cm)',
    category: 'ecommerce_shipping',
    description: 'Yurtiçi, Aras, MNG, Sürat, PTT kargolarına uyumlu sevk belgesi; kapıda ödeme/tahsilat, desi ve kırılabilir uyarısı.',
    tags: ['kargo', 'yurtiçi', 'aras', 'mng', 'sürat', 'ptt', '10x15', '100x150', 'kapıda ödeme'],
    recommendedWidthMm: 100,
    heightMm: 150,
    fields: [
      { key: 'paymentType', label: 'Ödeme & Tahsilat Tipi', type: 'text', defaultValue: 'ALICI ÖDER • KAPIDA NAKİT' },
      { key: 'desiKg', label: 'Desi ve Ağırlık', type: 'text', defaultValue: '3.5 Desi / 2.1 Kg' },
      { key: 'senderInfo', label: 'Gönderici Firma & Adres', type: 'textarea', defaultValue: 'Maslak Mah. Dereboyu Cad. No:12 Sarıyer / İSTANBUL' },
      { key: 'recipientName', label: 'Alıcı Ad Soyad', type: 'text', defaultValue: 'BURAK YILDIRIM' },
      { key: 'recipientAddress', label: 'Alıcı Adresi', type: 'textarea', defaultValue: 'Fatih Sultan Mehmet Mah. Nilüfer / BURSA' },
      { key: 'recipientPhone', label: 'Alıcı Telefonu', type: 'text', defaultValue: 'Tel: 0533 *** ** 12' },
      { key: 'trackingBarcode', label: 'Kargo Takip Barkodu', type: 'barcode', defaultValue: '918237461902' },
      { key: 'contentsNote', label: 'Paket İçerik Notu', type: 'text', defaultValue: '1x Yedek Parça Seti' }
    ],
    defaultData: {
      paymentType: 'ALICI ÖDER • KAPIDA NAKİT',
      desiKg: '3.5 Desi / 2.1 Kg',
      senderInfo: 'Maslak Mah. Dereboyu Cad. No:12 Sarıyer / İSTANBUL',
      recipientName: 'BURAK YILDIRIM',
      recipientAddress: 'Fatih Sultan Mehmet Mah. Nilüfer / BURSA',
      recipientPhone: 'Tel: 0533 *** ** 12',
      trackingBarcode: '918237461902',
      contentsNote: '1x Yedek Parça Seti'
    }
  },

  // 163. HIZLI KARGO & KURYE TESLİMAT FİŞİ (57 MM RULO)
  {
    id: 'tpl-universal-courier-mini-slip-57mm',
    title: 'Hızlı Kargo & Kurye Teslimat Fişi (57 mm)',
    category: 'ecommerce_shipping',
    description: '57mm mobil yazıcılar için motokurye, kapıda nakit tahsilat ve teslimat fişi.',
    tags: ['kurye', '57mm', 'kapıda tahsilat', 'nakit', 'hızlı kargo', 'fiş'],
    recommendedWidthMm: 57,
    fields: [
      { key: 'trackingCode', label: 'Kurye Takip Kodu', type: 'text', defaultValue: 'MK-8891' },
      { key: 'recipient', label: 'Alıcı Müşteri', type: 'text', defaultValue: 'HASAN KILIÇ' },
      { key: 'address', label: 'Adres', type: 'text', defaultValue: 'Levent Mah. Cömert Sk. No:5 Beşiktaş / İST' },
      { key: 'phone', label: 'Telefon', type: 'text', defaultValue: '0532 999 11 22' },
      { key: 'cashCollect', label: 'Kapıda Tahsilat Tutarı', type: 'text', defaultValue: 'KAPIDA TAHSİLAT: 420.00 TL' },
      { key: 'barcode', label: 'Teslimat Barkodu', type: 'barcode', defaultValue: 'MK88910293' }
    ],
    defaultData: {
      trackingCode: 'MK-8891',
      recipient: 'HASAN KILIÇ',
      address: 'Levent Mah. Cömert Sk. No:5 Beşiktaş / İST',
      phone: '0532 999 11 22',
      cashCollect: 'KAPIDA TAHSİLAT: 420.00 TL',
      barcode: 'MK88910293'
    }
  },

  // 164. E-TİCARET SİPARİŞ TOPLAMA & PAKETLEME FİŞİ (80 MM RULO)
  {
    id: 'tpl-ecommerce-warehouse-picking-slip-80mm',
    title: 'E-Ticaret Depo Toplama & Paketleme Slip (80 mm)',
    category: 'ecommerce_shipping',
    description: 'Depo personeli için çoklu pazaryeri sipariş toplama listesi, raf lokasyonları ve doğrulama barkodu.',
    tags: ['depo', 'picking', 'toplama', 'paketleme', '80mm', 'stok', 'e-ticaret'],
    recommendedWidthMm: 80,
    fields: [
      { key: 'orderRef', label: 'Sipariş Referansı', type: 'text', defaultValue: 'SİPARİŞ #TK-99201' },
      { key: 'marketplaceSource', label: 'Pazaryeri Kaynağı', type: 'text', defaultValue: 'TRENDYOL' },
      { key: 'pickerStaff', label: 'Toplayan Personel & Raf', type: 'text', defaultValue: 'Toplayan: Personel Ahmet (Raf Bölümü: B-12)' },
      { key: 'itemList', label: 'Toplanacak Ürün Kalemleri', type: 'textarea', defaultValue: '1x Deri Cüzdan Taba (SKU: CZ-01)\n2x Deri Kartlık Siyah (SKU: KR-09)\n1x Bakım Kremi 50ml (SKU: BK-03)' },
      { key: 'verifyBarcode', label: 'Doğrulama Barkodu', type: 'barcode', defaultValue: 'TK99201CHECK' }
    ],
    defaultData: {
      orderRef: 'SİPARİŞ #TK-99201',
      marketplaceSource: 'TRENDYOL',
      pickerStaff: 'Toplayan: Personel Ahmet (Raf Bölümü: B-12)',
      itemList: '1x Deri Cüzdan Taba (SKU: CZ-01)\n2x Deri Kartlık Siyah (SKU: KR-09)\n1x Bakım Kremi 50ml (SKU: BK-03)',
      verifyBarcode: 'TK99201CHECK'
    }
  }
];

