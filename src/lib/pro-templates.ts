/**
 * PROFESYONEL ŞABLON SETI — Zengin & Özgün Sektörel Tasarımlar
 * Her şablon canlı önizleme, termal düzenleme ve toplu baskı (CSV) uyumludur.
 */

export interface ProTemplate {
  id: string;
  title: string;
  category: string;
  tags: string[];
  text: string;
}

export const PRO_TEMPLATES: ProTemplate[] = [
  // 1. Lojistik & Kargo
  {
    id: 'pro-kargo-gonderi',
    title: 'Kargo Gönderi Etiketi',
    category: 'Lojistik & Kargo',
    tags: ['kargo', 'gonderi', 'nakliye', 'teslimat'],
    text: [
      '=== KARGO / TESLİMAT ===',
      'ALICI: {Alici}',
      'TEL: {Telefon}',
      'ADRES: {Adres:coksatir}',
      'İLÇE/İL: {Ilce} / {Il}',
      '---',
      'TAKİP NO: {Takip_No}',
      '{Barkod:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-iade-etiket',
    title: 'E-Ticaret İade Etiketi',
    category: 'Lojistik & Kargo',
    tags: ['iade', 'e-ticaret', 'pazaryeri'],
    text: [
      '=== İADE GÖNDERİSİ ===',
      'SİPARİŞ NO: {Siparis_No}',
      'MÜŞTERİ: {Musteri_Adi}',
      'İADE SEBEBİ: {Sebep:metin=Beden uymadi}',
      '---',
      'İADE KODU: {Iade_Kodu}',
      '{Iade_Kodu:barkod=CODE128}',
      'HEDEF DEPO: {Depo_Adi}'
    ].join('\n')
  },
  {
    id: 'pro-palet-nakliye',
    title: 'Palet & Nakliye Etiketi',
    category: 'Lojistik & Kargo',
    tags: ['palet', 'nakliye', 'lojistik', 'sevkiyat'],
    text: [
      '=== PALET SEVKİYAT ===',
      'PALET NO: {Palet_No}',
      'GÖNDEREN: {Gonderen}',
      'ALICI: {Alici}',
      '---',
      'KOLİ SAYISI: {Koli_Sayisi:sayi} Koli',
      'DESİ / HACİM: {Desi:sayi} Desi',
      '{Palet_No:barkod=CODE128}'
    ].join('\n')
  },

  // 2. Depo & Stok
  {
    id: 'pro-raf-konum',
    title: 'Raf & Konum Etiketi',
    category: 'Depo & Stok',
    tags: ['raf', 'konum', 'depo', 'barkod'],
    text: [
      '=== RAF & LOKASYON ===',
      'BÖLÜM: {Bolum}',
      'KORİDOR: {Koridor}',
      '---',
      'RAF KODU: {Raf_Kodu}',
      '{Raf_Kodu:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-parti-skt',
    title: 'Parti / SKT Üretim Etiketi',
    category: 'Depo & Stok',
    tags: ['parti', 'lot', 'skt', 'uretim', 'gida'],
    text: [
      '=== ÜRETİM BİLGİSİ ===',
      'PARTİ / LOT NO: {Parti_No}',
      'ÜRETİM: {Uretim:tarih=DD.MM.YYYY}',
      'SKT / TETT: {SKT:tarih=DD.MM.YYYY}',
      '---',
      'OPERATÖR: {Operator}',
      '{Parti_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-stok-sayim',
    title: 'Stok Sayım Fişi',
    category: 'Depo & Stok',
    tags: ['stok', 'sayim', 'envanter', 'depo'],
    text: [
      '=== STOK SAYIM FİŞİ ===',
      'SIRA: #{Sira_No}',
      'ÜRÜN: {Urun}',
      'LOKASYON: {Raf}',
      '---',
      'FİZİKİ ADET: [ ______ ]',
      '{Barkod:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-depo-transfer',
    title: 'Depo İçi Transfer Etiketi',
    category: 'Depo & Stok',
    tags: ['transfer', 'depo', 'sevkiyat', 'raf'],
    text: [
      '=== DEPO İÇİ TRANSFER ===',
      'TRANSFER NO: {Transfer_No}',
      'ÇIKIŞ RAF: {Kaynak_Raf}',
      'HEDEF RAF: {Hedef_Raf}',
      'ÜRÜN: {Urun}',
      'ADET: {Adet:sayi}',
      '---',
      '{Transfer_No:barkod=CODE128}'
    ].join('\n')
  },

  // 3. Mağaza & Perakende
  {
    id: 'pro-agirlik-etiket',
    title: 'Ağırlık & Manav & Şarküteri',
    category: 'Mağaza & Perakende',
    tags: ['terazi', 'agirlik', 'manav', 'sarkuteri', 'fiyat'],
    text: [
      '=== ŞARKÜTERİ / MANAV ===',
      'ÜRÜN: {Urun}',
      'MİKTAR: {Miktar} {Birim:secim=KG|GR|ADET}',
      'BİRİM FİYAT: {Birim_Fiyat:sayi} TL',
      '---',
      'TOPLAM TUTAR: {Toplam:sayi} TL',
      '{Lot:barkod=EAN13}'
    ].join('\n')
  },
  {
    id: 'pro-hediye-ceki',
    title: 'Hediye Çeki / Kupon',
    category: 'Mağaza & Perakende',
    tags: ['hediye', 'cek', 'kupon', 'indirim', 'promosyon'],
    text: [
      '=== HEDİYE ÇEKİ ===',
      '{Isletme_Adi}',
      'TUTAR: {Tutar:sayi} TL',
      'KUPON KODU: {Kod}',
      'SON GEÇERLİLİK: {Son_Tarih:tarih=DD.MM.YYYY}',
      '---',
      '{Kod:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-fis-kdv',
    title: 'KDV Fiş Özeti',
    category: 'Mağaza & Perakende',
    tags: ['fis', 'kdv', 'muhasebe', 'fatura', 'perakende'],
    text: [
      '=== BİLGİ FİŞİ ===',
      '{Firma_Adi}',
      'FİŞ NO: {Fis_No}',
      'ARA TOPLAM: {Tutar} TL',
      'KDV (%20): {Kdv} TL',
      '---',
      'GENEL TOPLAM: {Genel_Toplam} TL',
      '{Fis_No:barkod=CODE128}'
    ].join('\n')
  },

  // 4. Elektronik & Servis
  {
    id: 'pro-seri-imei',
    title: 'Seri No & IMEI Etiketi',
    category: 'Elektronik & Servis',
    tags: ['serino', 'imei', 'elektronik', 'garanti', 'cihaz'],
    text: [
      '=== CİHAZ KİMLİK ETİKETİ ===',
      'CİHAZ: {Cihaz}',
      'IMEI/SN: {Imei}',
      'GARANTİ BİTİŞ: {Garanti:tarih=DD.MM.YYYY}',
      '---',
      '{Imei:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-qc-test',
    title: 'Kalite Kontrol (QC Passed)',
    category: 'Elektronik & Servis',
    tags: ['qc', 'kalite', 'test', 'onay', 'uretim'],
    text: [
      '=== QC PASSED - TEST ONAYLI ===',
      'ÜRÜN: {Urun}',
      'TEST EDEN: {Operator}',
      'TARİH: {Test_Tarihi:tarih=DD.MM.YYYY}',
      'SERİ NO: {Seri_No}',
      '---',
      '{Seri_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-teknik-bakim',
    title: 'Teknik Servis & Bakım Kartı',
    category: 'Elektronik & Servis',
    tags: ['servis', 'bakim', 'tamir', 'kombi', 'klima'],
    text: [
      '=== PERİYODİK BAKIM KARTI ===',
      'SERVİS: {Firma_Adi}',
      'MÜŞTERİ: {Musteri_Adi}',
      'CİHAZ: {Cihaz}',
      'BİR SONRAKİ BAKIM: {Bakim_Tarihi:tarih=DD.MM.YYYY}',
      '---',
      'TEL: {Firma_Tel}'
    ].join('\n')
  },

  // 5. Organizasyon & Sosyal
  {
    id: 'pro-qr-masa',
    title: 'QR Menü & Masa Kartı',
    category: 'Organizasyon & Sosyal',
    tags: ['restoran', 'cafe', 'menu', 'masa', 'qr'],
    text: [
      '=== DİJİTAL MENÜ ===',
      '{Isletme_Adi}',
      'MASA NO: {Masa_No}',
      '---',
      '{Menu_Link:barkod=QRCODE}',
      'Menüyü görüntülemek için okutunuz'
    ].join('\n')
  },

  // 6. Sarf & Özel İşlemler
  {
    id: 'pro-picking-satir',
    title: 'Sipariş Toplama (Picking)',
    category: 'Sarf & Özel İşlemler',
    tags: ['picking', 'toplama', 'depo', 'e-ticaret'],
    text: [
      '=== SİPARİŞ TOPLAMA ===',
      'SİPARİŞ: {Siparis_No}',
      'LOKASYON: {Raf}',
      'ÜRÜN: {Urun}',
      '---',
      'TOPLANAN: [ ______ ]',
      '{Siparis_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-numune-etiket',
    title: 'Numune Etiketi (Satılmaz)',
    category: 'Sarf & Özel İşlemler',
    tags: ['numune', 'test', 'demo', 'satilmaz'],
    text: [
      '=== NUMUNE - SATILMAZ ===',
      'ÜRÜN ADI: {Urun}',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}',
      'SORUMLU: {Sorumlu}',
      '---',
      'KOD: {Kod}',
      '{Kod:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-sarf-kutu',
    title: 'Sarf Kutu Açılış Etiketi',
    category: 'Sarf & Özel İşlemler',
    tags: ['sarf', 'kutu', 'acilis', 'stok'],
    text: [
      '=== SARF KUTU TAKİP ===',
      'İÇERİK: {Icerik}',
      'AÇILIŞ TARİHİ: {Acilis:tarih=DD.MM.YYYY}',
      'MİAD / BİTİŞ: {Bitis:tarih=DD.MM.YYYY}',
      '---',
      'SORUMLU: {Sorumlu}'
    ].join('\n')
  },
  {
    id: 'pro-reklamasyon-fis',
    title: 'Reklamasyon & Arıza Fişi',
    category: 'Sarf & Özel İşlemler',
    tags: ['reklamasyon', 'sikayet', 'destek', 'servis'],
    text: [
      '=== REKLAMASYON KAYDI ===',
      'KAYIT NO: {Kayit_No}',
      'MÜŞTERİ: {Musteri_Adi}',
      'ÜRÜN: {Urun}',
      '---',
      'ŞİKAYET DETAYI:',
      '{Detay:coksatir}',
      '{Kayit_No:barkod=CODE128}'
    ].join('\n')
  },

  // 7. Eğitim, Okul & Kırtasiye (YENİ)
  {
    id: 'pro-okul-defter',
    title: 'Ders & Defter İsim Etiketi',
    category: 'Eğitim & Okul',
    tags: ['okul', 'ogrenci', 'defter', 'kitap', 'sinif', 'ders'],
    text: [
      '=== ÖĞRENCİ DERS DEFTERİ ===',
      'ÖĞRENCİ: {Ogrenci_Adi}',
      'OKUL / SINIF: {Okul_Sinif}',
      'DERS ADI: {Ders_Adi}',
      'OKUL NO: {Okul_No}',
      '---',
      'ÖĞRETMEN: {Ogretmen}'
    ].join('\n')
  },
  {
    id: 'pro-kitap-ayraci',
    title: 'Kitap Ayracı & Alıntı Kartı',
    category: 'Eğitim & Okul',
    tags: ['kitap', 'ayrac', 'alinti', 'okuma', 'kisisel'],
    text: [
      '=== KİTAP AYRACI ===',
      'KİTAP: {Kitap_Adi}',
      'YAZAR: {Yazar}',
      'HEDEF SAYFA: {Hedef_Sayfa}',
      '---',
      'FAVORİ ALINTI:',
      '{Alinti:coksatir}',
      '{Kitap_Link:barkod=QRCODE}'
    ].join('\n')
  },
  {
    id: 'pro-sinav-soru',
    title: 'Soru & Formül Hatırlatıcı',
    category: 'Eğitim & Okul',
    tags: ['sinav', 'formul', 'soru', 'ders', 'calisma'],
    text: [
      '=== FORMÜL & HATIRLATMA ===',
      'DERS: {Ders}',
      'KONU: {Konu}',
      'FORMÜL / KURAL: {Formul}',
      '---',
      'ÖNEMLİ İPUCU:',
      '{Ipucu:coksatir}'
    ].join('\n')
  },

  // 8. Kafe, Fırın & Butik Gıda (YENİ)
  {
    id: 'pro-kahve-siparis',
    title: 'Barista Özel Kahve Sipariş Fişi',
    category: 'Kafe & Butik Gıda',
    tags: ['kahve', 'barista', 'siparis', 'cafe', 'latte', 'espresso'],
    text: [
      '=== KAHVE SİPARİŞ FİŞİ ===',
      'MÜŞTERİ: {Musteri}',
      'KAHVE: {Kahve_Turu}',
      'SÜT TİPİ: {Sut_Tipi}',
      'ŞURUP / AROMA: {Surup}',
      '---',
      'NOT / DERECE: {Ozel_Not}',
      'BARİSTA: {Barista}'
    ].join('\n')
  },
  {
    id: 'pro-tatli-icerik',
    title: 'Gurme Pasta & Alerjen Etiketi',
    category: 'Kafe & Butik Gıda',
    tags: ['pasta', 'tatli', 'alerjen', 'gluten', 'firinci', 'gida'],
    text: [
      '=== GURME TATLI BİLGİSİ ===',
      'TATLI ADI: {Tatli_Adi}',
      'KALORİ: {Kalori} kcal',
      'ALERJENLER: {Alerjenler}',
      '---',
      'TÜKETİM TARİHİ: {Tuketim_Tarihi:tarih=DD.MM.YYYY}',
      'ŞEF: {Sef_Adi}'
    ].join('\n')
  },
  {
    id: 'pro-kavanoz-recel',
    title: 'Butik Reçel / Sos / Konserve',
    category: 'Kafe & Butik Gıda',
    tags: ['recel', 'sos', 'kavanoz', 'organik', 'dogal', 'hasat'],
    text: [
      '=== BUTİK KAVANOZ ETİKETİ ===',
      'ÜRÜN: {Urun_Adi}',
      'İÇİNDEKİLER: {Icindekiler:coksatir}',
      'NET AĞIRLIK: {Agirlik}',
      '---',
      'HASAT / ÜRETİM: {Uretim_Tarihi:tarih=DD.MM.YYYY}',
      'MENŞEİ: {Mensei}'
    ].join('\n')
  },

  // 9. Bitki, Bahçe & Botanik (YENİ)
  {
    id: 'pro-bitki-bakim',
    title: 'Saksı & Bitki Bakım Pasaportu',
    category: 'Bitki & Bahçe',
    tags: ['bitki', 'saksi', 'cicek', 'sulama', 'bahce', 'botanik'],
    text: [
      '=== BİTKİ BAKIM PASAPORTU ===',
      'BİTKİ TÜRÜ: {Bitki_Turu}',
      'SULAMA SIKLIĞI: {Sulama_Sikligi}',
      'IŞIK İHTİYACI: {Isik_Ihtiyaci}',
      '---',
      'SON SULAMA: {Son_Sulama:tarih=DD.MM.YYYY}',
      'NOT: {Bakim_Notu}'
    ].join('\n')
  },
  {
    id: 'pro-tohum-paket',
    title: 'Tohum & Ekim Zarf Etiketi',
    category: 'Bitki & Bahçe',
    tags: ['tohum', 'ekim', 'hasat', 'bahce', 'sebze', 'tarim'],
    text: [
      '=== ORGANİK TOHUM ETİKETİ ===',
      'ÇEŞİT: {Cesit_Adi}',
      'EKİM AYI: {Ekim_Ayi}',
      'ÇİMLENME: {Cimlenme_Gunu} Gün',
      'HASAT VAKTİ: {Hasat_Suresi}',
      '---',
      'SAKLAMA: Kuru ve serin yerde muhafaza ediniz.'
    ].join('\n')
  },

  // 10. Etkinlik, Sinema & Bilet (YENİ)
  {
    id: 'pro-konser-bilet',
    title: 'Vintage Konser & Tiyatro Bileti',
    category: 'Etkinlik & Bilet',
    tags: ['konser', 'tiyatro', 'bilet', 'etkinlik', 'sahne'],
    text: [
      '=== KONSER / TİYATRO GİRİŞ ===',
      'ETKİNLİK: {Etkinlik_Adi}',
      'TARİH / SAAT: {Tarih_Saat}',
      'SALON / MEKAN: {Mekan}',
      'BLOK / SIRA / KOLTUK: {Koltuk_Bilgisi}',
      '---',
      'BİLET NO: {Bilet_No}',
      '{Bilet_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-sinema-bilet',
    title: 'Nostaljik Sinema Bileti',
    category: 'Etkinlik & Bilet',
    tags: ['sinema', 'film', 'bilet', 'seans', 'salon'],
    text: [
      '=== SİNEMA BİLETİ ===',
      'FİLM: {Film_Adi}',
      'SALON: {Salon_No}',
      'SEANS: {Seans_Saati}',
      'KOLTUK: {Koltuk_No}',
      '---',
      'BİLET KODU: {Bilet_Kodu}',
      '{Bilet_Kodu:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-parti-davetiye',
    title: 'VIP Parti & Davetiye Bileti',
    category: 'Etkinlik & Bilet',
    tags: ['parti', 'davetiye', 'vip', 'dogumgunu', 'giris'],
    text: [
      '=== VIP ÖZEL DAVETİYE ===',
      'DAVETLİ: {Davetli_Adi}',
      'KONSEPT: {Konsept}',
      'TARİH: {Tarih}',
      'MEKAN: {Mekan}',
      '---',
      '{Vip_Kodu:barkod=QRCODE}',
      'Kapıda VIP QR kodu gösteriniz'
    ].join('\n')
  },

  // 11. Gezi, Seyahat & Otel (YENİ)
  {
    id: 'pro-valiz-etiket',
    title: 'Uçuş & Bagaj Valiz Kartı',
    category: 'Seyahat & Gezi',
    tags: ['valiz', 'bagaj', 'ucus', 'seyahat', 'havalimani'],
    text: [
      '=== BOARDING PASS / BAGAJ ===',
      'YOLCU: {Yolcu_Adi}',
      'UÇUŞ / SEFER: {Ucus_No}',
      'GÜZERGAH: {Kalkis} ✈ {Varis}',
      'İLETİŞİM TEL: {Telefon}',
      '---',
      'BAGAJ KODU: {Bagaj_No}',
      '{Bagaj_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-otel-kapi',
    title: 'Otel Kapı & Servis Kartı',
    category: 'Seyahat & Gezi',
    tags: ['otel', 'kapi', 'oda', 'temizlik', 'rahatsizetmeyin'],
    text: [
      '=== ODA HİZMET KARTI ===',
      'ODA NO: {Oda_No}',
      'DURUM: {Durum:secim=Lütfen Rahatsız Etmeyiniz|Lütfen Odayı Temizleyiniz}',
      '---',
      'MİSAFİR: {Misafir_Adi}',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}'
    ].join('\n')
  },

  // 12. Kişisel Gelişim, Spor & Sağlık (YENİ)
  {
    id: 'pro-su-takip',
    title: 'Günlük Su & Hidrasyon Çetelesi',
    category: 'Sağlık & Yaşam',
    tags: ['su', 'hidrasyon', 'saglik', 'aliskanlik', 'hedef'],
    text: [
      '=== GÜNLÜK SU TAKİP ÇETELESİ ===',
      'HEDEF: {Hedef_Litre} Litre',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}',
      '---',
      'İÇİLEN BARDAKLAR (İşaretleyin):',
      '[ ] 1. Bardak  [ ] 2. Bardak',
      '[ ] 3. Bardak  [ ] 4. Bardak',
      '[ ] 5. Bardak  [ ] 6. Bardak',
      '[ ] 7. Bardak  [ ] 8. Bardak',
      'MOTİVASYON: {Motivasyon_Sozu}'
    ].join('\n')
  },
  {
    id: 'pro-fitness-log',
    title: 'Antrenman & Ağırlık Günlüğü',
    category: 'Sağlık & Yaşam',
    tags: ['spor', 'fitness', 'antrenman', 'gym', 'agirlik', 'set'],
    text: [
      '=== FITNESS WORKOUT LOG ===',
      'BÖLGE: {Bolge}',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}',
      'EGZERSİZ 1: {Egzersiz_1}',
      'EGZERSİZ 2: {Egzersiz_2}',
      '---',
      'SÜRE: {Sure} Dk  |  YAKILAN: {Kalori} kcal'
    ].join('\n')
  },
  {
    id: 'pro-ilac-takip',
    title: 'İlaç & Vitamin Saat Tablosu',
    category: 'Sağlık & Yaşam',
    tags: ['ilac', 'vitamin', 'saat', 'saglik', 'doz'],
    text: [
      '=== İLAÇ & VİTAMİN TAKİP ===',
      'HASTA: {Hasta_Adi}',
      'İLAÇ ADI: {Ilac_Adi}',
      'DOZ: {Doz}',
      'KULLANIM: {Kullanim:secim=Aç Karnına|Tok Karnına}',
      '---',
      '[ ] SABAH (08:00)',
      '[ ] ÖĞLE (13:00)',
      '[ ] AKŞAM (19:00)',
      '[ ] GECE (23:00)'
    ].join('\n')
  },

  // 13. Evcil Hayvan & Veteriner (YENİ)
  {
    id: 'pro-pet-tasma',
    title: 'Evcil Hayvan Tasma & Kayıp Kartı',
    category: 'Evcil Hayvan',
    tags: ['kedi', 'kopek', 'pet', 'tasma', 'kayip', 'veteriner'],
    text: [
      '=== EVCİL HAYVAN KİMLİK KARTI ===',
      'PET ADI: {Pet_Adi}',
      'IRK / TÜR: {Tur}',
      'SAHİBİ: {Sahip_Adi}',
      'TEL: {Telefon}',
      'ÇİP NO: {Cip_No}',
      '---',
      '{Cip_No:barkod=QRCODE}',
      'Kayıpsam lütfen sahibimi arayın!'
    ].join('\n')
  },
  {
    id: 'pro-veteriner-asi',
    title: 'Veteriner Aşı & Kontrol Kartı',
    category: 'Evcil Hayvan',
    tags: ['veteriner', 'asi', 'kuduz', 'karma', 'pet', 'klinik'],
    text: [
      '=== VETERİNER SAĞLIK KARTI ===',
      'KLİNİK: {Klinik_Adi}',
      'HASTA: {Pet_Adi}',
      'AŞI TÜRÜ: {Asi_Turu}',
      'UYGULAMA: {Uygulama_Tarihi:tarih=DD.MM.YYYY}',
      'GELECEK DOZ: {Gelecek_Doz:tarih=DD.MM.YYYY}',
      '---',
      'VETERİNER HEKİM: {Hekim_Adi}'
    ].join('\n')
  },

  // 14. Oto Servis & Araç Bakım (YENİ)
  {
    id: 'pro-oto-yag-degisim',
    title: 'Periyodik Yağ & Filtre Kartı',
    category: 'Oto & Araç Bakım',
    tags: ['oto', 'araba', 'yag', 'filtre', 'km', 'servis', 'bakim'],
    text: [
      '=== YAĞ & FİLTRE DEĞİŞİM KARTI ===',
      'PLAKA: {Plaka}',
      'DEĞİŞİM KM: {Mevcut_Km} KM',
      'SONRAKİ KM: {Gelecek_Km} KM',
      'YAĞ VİSKOZİTESİ: {Yag_Turu:secim=5W-30|5W-40|10W-40|0W-20}',
      '---',
      'DEĞİŞEN FİLTRELER: {Filtreler}',
      'SERVİS: {Servis_Adi}',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}'
    ].join('\n')
  },

  // 15. Ek Zengin & Çok Yönlü Şablonlar (YENİ)
  {
    id: 'pro-sevk-irsaliye',
    title: 'Paket Sevk & Çıkış İrsaliyesi',
    category: 'Lojistik & Kargo',
    tags: ['sevk', 'irsaliye', 'paket', 'cikis', 'siparis', 'koli'],
    text: [
      '=== SEVK & PAKET ÇIKIŞ FİŞİ ===',
      'İRSALİYE NO: {Irsaliye_No}',
      'MÜŞTERİ: {Musteri}',
      'TARİH: {Tarih:tarih=DD.MM.YYYY}',
      '---',
      '[ ] 1. {Kalem_1}',
      '[ ] 2. {Kalem_2}',
      '[ ] 3. {Kalem_3}',
      '---',
      '{Kargo_Takip:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-kahve-cekirdek',
    title: 'Nitelikli Kahve & Çekirdek Paketi',
    category: 'Kafe & Butik Gıda',
    tags: ['kahve', 'cekirdek', 'roast', 'rakim', 'tadim', 'barista', 'gurme'],
    text: [
      '=== ARABICA SINGLE ORIGIN ===',
      'ÇEKİRDEK: {Cekirdek_Adi}',
      'KÖKEN / RAKIM: {Koken_Rakim}',
      'KAVRUM DÜZEYİ: {Kavrum:secim=Light Roast|Medium Roast|Dark Roast}',
      '---',
      'TADIM NOTLARI: {Tadim_Notlari}',
      'KAVRUM TARİHİ: {Kavrum_Tarihi:tarih=DD.MM.YYYY}',
      'NET GRAMAJ: {Gramaj} gr'
    ].join('\n')
  },
  {
    id: 'pro-vintage-etiket',
    title: 'Vintage & İkinci El Butik Etiketi',
    category: 'Mağaza & Perakende',
    tags: ['vintage', 'ikinciel', 'butik', 'kiyafet', 'fiyat', 'etiket', 'beden'],
    text: [
      '=== VINTAGE & THRIFT SHOP ===',
      'ÜRÜN: {Urun_Adi}',
      'BEDEN: {Beden:secim=XS|S|M|L|XL|Oversize}',
      'KONDİSYON: {Kondisyon:secim=Kusursuz (A+)|Çok İyi (A)|İyi (B)}',
      '---',
      'FİYAT: {Fiyat} ₺',
      'KOD: {Satici_Kod}',
      '{Instagram:barkod=QRCODE}'
    ].join('\n')
  },
  {
    id: 'pro-otopark-vale',
    title: 'Otopark & Vale Müşteri Teslim Kartı',
    category: 'Oto & Araç Bakım',
    tags: ['otopark', 'vale', 'arac', 'plaka', 'fis', 'guvenlik'],
    text: [
      '=== OTOPARK & VALE GİRİŞ KARTI ===',
      'PLAKA: {Plaka}',
      'GİRİŞ SAATİ: {Giris_Saati}',
      'PARK ALANI: {Alan_Kat}',
      'ARAÇ: {Arac_Model}',
      '---',
      'FİŞ NO: {Fis_No}',
      '{Fis_No:barkod=CODE128}',
      'İLETİŞİM: {Iletisim}'
    ].join('\n')
  },
  {
    id: 'pro-taki-aksesuar',
    title: 'El Yapımı Takı & Aksesuar Etiketi',
    category: 'Mağaza & Perakende',
    tags: ['taki', 'mucevher', 'gumus', 'altin', 'kolye', 'yuzuk', 'handmade'],
    text: [
      '=== HANDMADE JEWELRY ===',
      'ÜRÜN: {Urun_Adi}',
      'MATERYAL: {Materyal:secim=925 Ayar Gümüş|14K Altın Kaplama|Pirinç / Çelik}',
      'TAŞ: {Tas_Turu}',
      'GRAMAJ: {Gramaj} gr',
      '---',
      'FİYAT: {Fiyat} ₺',
      '{Barkod_Kodu:barkod=CODE128}'
    ].join('\n')
  },

  // 16. 10x15, 10x10 & 15x10 Zebra / Endüstriyel Etiketler
  {
    id: 'pro-10x15-kargo-zebra',
    title: '10x15 cm Zebra Kargo & Dikey Barkodlu Sevk (100x150mm)',
    category: '10x15 & 15x10 Zebra',
    tags: ['10x15', 'zebra', 'kargo', 'dikey', 'barkod', 'yurtici', 'aras', 'surat', 'mng', 'ptt', 'lojistik', 'sevk'],
    text: [
      '=== ZEBRA 100x150mm KARGO SEVK ===',
      'KARGO FİRMASI: {Kargo_Firmasi:secim=Yurtiçi Kargo|Aras Kargo|MNG Kargo|Sürat Kargo|PTT Kargo|HepsiJet|Trendyol Express}',
      'ROTA KODU: {Rota_Kodu}',
      '---',
      'ALICI ADI: {Alici_Adi}',
      'ALICI TEL: {Alici_Tel}',
      'TESLİMAT ADRESİ: {Teslimat_Adresi:coksatir}',
      'İLÇE / İL: {Ilce} / {Il}',
      '---',
      'GÖNDEREN: {Gonderici_Firma}',
      'SİPARİŞ NO: {Siparis_No}',
      'PAKET / DESİ: {Paket_Adet:sayi} Adet / {Desi:sayi} Desi',
      'ÖDEME TÜRÜ: {Odeme_Turu:secim=Gönderici Ödemeli (Peşin)|Alıcı Ödemeli|Kapıda Nakit Tahsilat}',
      'İÇERİK ÖZETİ: {Icerik_Ozeti:coksatir}',
      '---',
      'TAKİP NO: {Takip_No}',
      '{Takip_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-10x15-trendyol-pazaryeri',
    title: '10x15 cm E-Ticaret Pazaryeri & Kargo Etiketi',
    category: '10x15 & 15x10 Zebra',
    tags: ['10x15', 'trendyol', 'hepsiburada', 'amazon', 'pazaryeri', 'zebra', 'kargo', 'eticaret'],
    text: [
      '=== PAZARYERİ SİPARİŞ ETİKETİ ===',
      'PAZARYERİ: {Pazaryeri:secim=TRENDYOL|HEPSİBURADA|AMAZON TR|N11|ÇİÇEKSEPETİ}',
      'KARGO FİRMASI: {Kargo_Firmasi:secim=Trendyol Express|HepsiJet|Yurtiçi Kargo|Aras Kargo|Kolay Gelsin}',
      'SİPARİŞ NO: {Siparis_No}',
      '---',
      'MÜŞTERİ ADI: {Alici_Adi}',
      'TELEFON: {Alici_Tel}',
      'ADRES: {Teslimat_Adresi:coksatir}',
      '---',
      'SATICI MAĞAZA: {Satici_Magaza}',
      'ÜRÜN LİSTESİ: {Urun_Listesi:coksatir}',
      '---',
      'TAKİP KODU: {Takip_No}',
      '{Takip_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-10x10-kare-depo',
    title: '10x10 cm Zebra Kare Depo & Koli Etiketi (100x100mm)',
    category: '10x15 & 15x10 Zebra',
    tags: ['10x10', 'kare', 'depo', 'zebra', 'raf', 'koli', 'stok', 'barkod'],
    text: [
      '=== ZEBRA 100x100mm KARE DEPO & RAF ===',
      'DEPO ADI: {Depo_Adi}',
      'RAF KODU: {Raf_Kodu}',
      '---',
      'ÜRÜN ADI: {Urun_Adi}',
      'STOK KODU: {Stok_Kodu}',
      'MİKTAR: {Miktar:sayi} {Birim:secim=Adet|Koli|Paket|KG}',
      'LOT / PARTİ: {Parti_Lot}',
      '---',
      '{Stok_Kodu:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-10x15-gs1-lojistik-dikey',
    title: '10x15 cm GS1-128 Lojistik & Palet Sevk (SSCC)',
    category: '10x15 & 15x10 Zebra',
    tags: ['10x15', 'gs1', 'sscc', 'palet', 'lojistik', 'sevkiyat', 'zebra'],
    text: [
      '=== GS1-128 LOJİSTİK ETİKETİ ===',
      'SSCC KODU: {SSCC_No}',
      'ÇIKIŞ TESİSİ: {Gonderen_Tesis}',
      'HEDEF DEPO: {Hedef_Depo}',
      '---',
      'BRÜT AĞIRLIK: {Brut_Agirlik:sayi}',
      'NET AĞIRLIK: {Net_Agirlik:sayi}',
      'KOLİ ADEDİ: {Koli_Adet:sayi}',
      'PARTİ / LOT: {Parti_Lot}',
      'UYARI: {Uyari_Notu:secim=⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ|⚠️ DİKKAT KIRILABİLİR|☔ SU VE NEMDEN KORUYUNUZ}',
      '---',
      '{SSCC_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-15x10-kargo-pazaryeri',
    title: '15x10 cm Yatay E-Ticaret & Kargo Sevk Etiketi',
    category: '10x15 & 15x10 Zebra',
    tags: ['15x10', '10x15', 'kargo', 'trendyol', 'hepsiburada', 'yurtici', 'aras', 'surat', 'sevk', 'etiket', 'pazaryeri'],
    text: [
      '=== PAZARYERİ / E-TİCARET KARGO SEVK ===',
      'KARGO FİRMASI: {Kargo_Firmasi:secim=Yurtiçi Kargo|Aras Kargo|MNG Kargo|Sürat Kargo|PTT Kargo|HepsiJet|Trendyol Express}',
      'ROTA / HAT KODU: {Rota_Kodu}',
      '---',
      'ALICI ADI: {Alici_Adi}',
      'ALICI TEL: {Alici_Tel}',
      'TESLİMAT ADRESİ: {Teslimat_Adresi:coksatir}',
      'İLÇE / İL: {Ilce} / {Il}',
      '---',
      'GÖNDERİCİ: {Gonderici_Firma}',
      'SİPARİŞ / FATURA NO: {Siparis_No}',
      'PAKET / DESİ: {Paket_Adet:sayi} Adet / {Desi:sayi} Desi',
      'ÖDEME TÜRÜ: {Odeme_Turu:secim=Gönderici Ödemeli (Peşin)|Alıcı Ödemeli|Kapıda Nakit Tahsilat|Kapıda Kredi Kartı}',
      'İÇERİK ÖZETİ: {Icerik_Ozeti:coksatir}',
      '---',
      'TAKİP BARKODU:',
      '{Takip_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-15x10-palet-lojistik',
    title: '15x10 cm Palet & Ağır Koli Sevkiyat (GS1/SSCC)',
    category: '15x10 & 10x15 Endüstriyel',
    tags: ['15x10', 'palet', 'sscc', 'gs1', 'koli', 'depo', 'lojistik', 'agirlik', 'sevkiyat'],
    text: [
      '=== GS1-128 LOJİSTİK & PALET SEVKİYAT ===',
      'SSCC KODU: (00) {SSCC_No}',
      'GÖNDEREN TESİS: {Gonderen_Tesis}',
      'HEDEF DEPO / ANTREPO: {Hedef_Depo}',
      '---',
      'BRÜT AĞIRLIK: {Brut_Agirlik:sayi} KG  |  NET: {Net_Agirlik:sayi} KG',
      'PALET / KOLİ ADEDİ: {Koli_Adet:sayi} Koli',
      'PARTİ / LOT NO: {Parti_Lot}',
      'SEVK TARİHİ: {Sevk_Tarihi:tarih=DD.MM.YYYY}',
      'LOJİSTİK UYARI: {Uyari_Notu:secim=⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ|⚠️ DİKKAT KIRILABİLİR MALZEME|☔ RUTUBET VE SUDAN KORUYUNUZ|❄️ SOĞUK ZİNCİR (+2°C / +8°C)}',
      '---',
      '{SSCC_No:barkod=CODE128}'
    ].join('\n')
  },
  {
    id: 'pro-15x10-urun-kimlik',
    title: '15x10 cm Ürün Kimlik, Seri No & Garanti',
    category: '15x10 & 10x15 Endüstriyel',
    tags: ['15x10', 'urun', 'seri', 'garanti', 'teknik', 'ce', 'barkod', 'model'],
    text: [
      '=== ÜRÜN KİMLİK & TEKNİK BELGE ===',
      'MARKA & ÜRETİCİ: {Marka_Uretici}',
      'MODEL / MODEL KODU: {Model_Adi}',
      'AÇIKLAMA: {Urun_Aciklama:coksatir}',
      '---',
      'ÇALIŞMA VOLTAJI: {Voltaj:secim=100-240V AC ~ 50/60Hz|24V DC 2.5A|12V DC 5A|5V Type-C}',
      'GÜÇ TÜKETİMİ: {Guc:sayi} Watt',
      'ÜRETİM YERİ: {Mensei:secim=Made in Türkiye|Made in Germany|Made in Japan|Made in PRC}',
      'ONAYLAR: CE • RoHS • TSE • ISO9001',
      'SERİ NO: {Seri_No}',
      '---',
      '{Seri_No:barkod=CODE128}',
      '{Kullanim_Kilavuzu_Link:barkod=QRCODE}'
    ].join('\n')
  },
  {
    id: 'pro-15x10-gida-besin-deger',
    title: '15x10 cm Gıda İçerik & 100g Besin Tablosu',
    category: '15x10 & 10x15 Endüstriyel',
    tags: ['15x10', 'gida', 'besin', 'alerjen', 'tett', 'kalori', 'icerik', 'tablo'],
    text: [
      '=== GIDA ETİKETİ & BESİN DEĞERLERİ ===',
      'ÜRÜN ADI: {Urun_Adi}',
      'NET MİKTAR: {Net_Miktar:sayi} {Birim:secim=g|kg|ml|L}',
      'İÇİNDEKİLER: {Icindekiler:coksatir}',
      'ALERJEN UYARISI: {Alerjenler:coksatir}',
      '---',
      '100g İÇİN BESİN DEĞERLERİ:',
      '• ENERJİ: {Enerji_Kcal:sayi} kcal / {Enerji_Kj:sayi} kJ',
      '• YAĞ: {Yag:sayi}g (Doymuş Yağ: {Doymus_Yag:sayi}g)',
      '• KARBONHİDRAT: {Karbonhidrat:sayi}g (Şekerler: {Seker:sayi}g)',
      '• PROTEİN: {Protein:sayi}g  |  TUZ: {Tuz:sayi}g',
      '---',
      'İŞLETME KAYIT NO: {Isletme_No}',
      'TETT / SKT: {TETT_Tarihi:tarih=DD.MM.YYYY}',
      'PARTİ NO: {Parti_No}',
      '{Barkod_Ean:barkod=EAN13}'
    ].join('\n')
  },
  {
    id: 'pro-15x10-qc-muayene',
    title: '15x10 cm Üretim & Kalite Kontrol (QC PASS)',
    category: '15x10 & 10x15 Endüstriyel',
    tags: ['15x10', 'qc', 'kalite', 'muayene', 'test', 'uretim', 'operator', 'onay'],
    text: [
      '=== KALİTE KONTROL & MUAYENE ONAY (QC PASS) ===',
      'İŞ EMRİ / PROJE NO: {Is_Emri_No}',
      'ÜRÜN / PARÇA ADI: {Parca_Adi}',
      'REVİZYON: REV-{Revizyon:secim=01|02|03|A|B}',
      '---',
      'TEST & KONTROL SONUÇLARI:',
      '• BOYUTSAL ÖLÇÜM (KUMPAS/MİKROMETRE): [ UYGUN / PASSED ]',
      '• ELEKTRİKSEL TEST & İZOLASYON: [ UYGUN / PASSED ]',
      '• GÖRSEL KUSURSUZLUK & YÜZEY TESTİ: [ KUSURSUZ ]',
      '---',
      'TEST EDEN UZMAN: {Operator_Adi}',
      'TEST TARİHİ & SAATİ: {Test_Tarihi}',
      'KALİTE SERİ NO: {QC_Seri_No}',
      'DURUM: [ ★ KALİTE KONTROL ONAYLANDI (QC PASSED) ★ ]',
      '{QC_Seri_No:barkod=CODE128}'
    ].join('\n')
  }
];

/** Her şablonun formu ÖRNEK verilerle dolu gelir — canlı önizleme için. */
export const PRO_EXAMPLES: Record<string, Record<string, string>> = {
  'pro-kargo-gonderi': { Alici: 'Ayşe Yılmaz', Telefon: '0532 111 22 33', Adres: 'Bağdat Cad. No:112 D:5', Ilce: 'Kadıköy', Il: 'İstanbul', Takip_No: 'TRK7300123', Barkod: '8690123456789' },
  'pro-iade-etiket': { Siparis_No: 'TY-900451', Musteri_Adi: 'Ayşe Yılmaz', Sebep: 'Beden uymadı', Iade_Kodu: 'IADE99312', Depo_Adi: 'Merkez Depo' },
  'pro-raf-konum': { Raf_Kodu: 'A-12-03', Bolum: 'Ana Depo', Koridor: '4' },
  'pro-parti-skt': { Parti_No: 'LOT-2026-081', Uretim: '2026-08-01', SKT: '2027-08-01', Operator: 'M. Kaya' },
  'pro-seri-imei': { Cihaz: 'iPhone 15 Pro', Imei: '356938035643809', Garanti: '2027-08-25' },
  'pro-qr-masa': { Masa_No: '7', Isletme_Adi: 'Cafe Merkez', Menu_Link: 'https://ornek.com/menu/7' },
  'pro-hediye-ceki': { Tutar: '250', Kod: 'HEDIYE-2026', Son_Tarih: '2026-12-31', Isletme_Adi: 'Butik Ayşe' },
  'pro-qc-test': { Urun: 'Kablosuz Kulaklık X9', Operator: 'QC-2 Hattı', Test_Tarihi: '2026-08-26', Seri_No: 'SN88312004' },
  'pro-agirlik-etiket': { Urun: 'Antep Fıstığı', Miktar: '1.5', Birim: 'KG', Birim_Fiyat: '480', Toplam: '720', Lot: 'L77120' },
  'pro-palet-nakliye': { Palet_No: 'PLT-4410', Gonderen: 'Ankara Deposu', Alici: 'İstanbul Mağaza', Koli_Sayisi: '18', Desi: '420' },
  'pro-stok-sayim': { Sira_No: '14', Barkod: '8690123456789', Urun: 'Termal Kağıt Rulo 57mm', Raf: 'B-03-01' },
  'pro-teknik-bakim': { Bakim_Tarihi: '2027-02-25', Cihaz: 'Kombi Demirdöküm', Musteri_Adi: 'Ahmet Demir', Firma_Adi: 'IsıServ', Firma_Tel: '0850 000 00 00' },
  'pro-fis-kdv': { Fis_No: 'FS-00241', Firma_Adi: 'iPrint Market', Tutar: '847.46', Kdv: '152.54', Genel_Toplam: '1000' },
  'pro-picking-satir': { Siparis_No: 'TY-900451', Raf: 'C-07-02', Urun: 'Fotoğraf Mug Beyaz' },
  'pro-depo-transfer': { Transfer_No: 'TRF-0078', Kaynak_Raf: 'A-01-02', Hedef_Raf: 'D-09-01', Urun: 'LED Ampul E27', Adet: '24' },
  'pro-numune-etiket': { Urun: 'Sabun Numunesi 30g', Tarih: '2026-08-26', Sorumlu: 'Satış Ekibi', Kod: 'NMP-0055' },
  'pro-sarf-kutu': { Icerik: 'Eldiven L Beden', Acilis: '2026-08-26', Bitis: '2026-11-26', Sorumlu: 'Depo Görevlisi' },
  'pro-reklamasyon-fis': { Musteri_Adi: 'Zeynep K.', Urun: 'Seramik Vazo Büyük', Detay: 'Kapak kısmında kırık mevcut.', Kayit_No: 'RK-0312' },

  // Yeni Şablonların Örnek Verileri
  'pro-okul-defter': { Ogrenci_Adi: 'Emir Karaca', Okul_Sinif: 'Atatürk İlkokulu / 4-B', Ders_Adi: 'Matematik Defteri', Okul_No: '482', Ogretmen: 'Selin Öğretmen' },
  'pro-kitap-ayraci': { Kitap_Adi: 'Küçük Prens', Yazar: 'Antoine de Saint-Exupéry', Hedef_Sayfa: 'Sayfa 64', Alinti: 'İnsan ancak yüreğiyle baktığı zaman doğruyu görebilir. Gerçeğin mayası gözle görülmez.', Kitap_Link: 'https://iprint.pro/kitap' },
  'pro-sinav-soru': { Ders: 'Fizik / Mekanik', Konu: 'Newton Hareket Yasaları', Formul: 'F_net = m · a', Ipucu: 'Sürtünme kuvveti daima hareket yönünün tersinedir: f_s = k · N' },
  'pro-kahve-siparis': { Musteri: 'Ece D.', Kahve_Turu: 'Iced Caramel Oat Latte', Sut_Tipi: 'Yulaf Sütü (%100)', Surup: 'Karamel (2 Pompa)', Ozel_Not: 'Ekstra buzlu, az şekerli', Barista: 'Ali' },
  'pro-tatli-icerik': { Tatli_Adi: 'San Sebastian Cheesecake', Kalori: '380', Alerjenler: 'Süt, Yumurta, Eser miktarda Fındık', Tuketim_Tarihi: '2026-08-28', Sef_Adi: 'Şef Mehmet' },
  'pro-kavanoz-recel': { Urun_Adi: 'Ev Yapımı Dağ Çileği Reçeli', Icindekiler: 'Doğal Dağ Çileği (%65), Pancar Şekeri, Limon Suyu. Katkısız & Koruyucusuz.', Agirlik: '380 gr Net', Uretim_Tarihi: '2026-08-20', Mensei: 'Bolu / Abant' },
  'pro-bitki-bakim': { Bitki_Turu: 'Monstera Deliciosa (Deve Tabanı)', Sulama_Sikligi: 'Haftada 1 Kez (Toprak kuruyunca)', Isik_Ihtiyaci: 'Yarı gölge, dolaylı parlak ışık', Son_Sulama: '2026-08-25', Bakim_Notu: 'Yapraklarına haftada bir su püskürtün.' },
  'pro-tohum-paket': { Cesit_Adi: 'Organik Pembe Domates Tohumu', Ekim_Ayi: 'Mart - Nisan', Cimlenme_Gunu: '7-10', Hasat_Suresi: '75-80 Gün' },
  'pro-konser-bilet': { Etkinlik_Adi: 'Rock Senfoni Orkestrası', Tarih_Saat: '15.10.2026 - 20:30', Mekan: 'Harbiye Açıkhava Tiyatrosu', Koltuk_Bilgisi: 'Protokol A Blok / Sıra 4 / No 12', Bilet_No: 'TCK-88194' },
  'pro-sinema-bilet': { Film_Adi: 'Yıldızlararası (IMAX Re-Release)', Salon_No: 'Salon 3 (IMAX Laser)', Seans_Saati: '21:15', Koltuk_No: 'G-14, G-15', Bilet_Kodu: 'SNM-44210' },
  'pro-parti-davetiye': { Davetli_Adi: 'Burak & Misafiri', Konsept: 'Retro 80ler & Neon Gecesi', Tarih: '28 Ağustos Cuma 21:00', Mekan: 'Sky Lounge Kadıköy', Vip_Kodu: 'VIP-PARTY-88' },
  'pro-valiz-etiket': { Yolcu_Adi: 'CANAN YILDIZ', Ucus_No: 'TK 1984', Kalkis: 'IST (İstanbul)', Varis: 'LHR (Londra)', Telefon: '+90 532 999 88 77', Bagaj_No: 'BAGG-9012' },
  'pro-otel-kapi': { Oda_No: '408', Durum: 'Lütfen Odayı Temizleyiniz', Misafir_Adi: 'Yıldız Ailesi', Tarih: '2026-08-26' },
  'pro-su-takip': { Hedef_Litre: '2.5', Tarih: '2026-08-26', Motivasyon_Sozu: 'Vücudunu yenile, her yudumda canlan!' },
  'pro-fitness-log': { Bolge: 'Göğüs & Arka Kol (Push Day)', Tarih: '2026-08-26', Egzersiz_1: 'Bench Press: 4x10 (80kg)', Egzersiz_2: 'Incline Dumbbell: 3x12 (26kg)', Sure: '55', Kalori: '420' },
  'pro-ilac-takip': { Hasta_Adi: 'Fatma Hanım', Ilac_Adi: 'B12 Vitamini & Omega-3', Doz: '1 Tablet', Kullanim: 'Tok Karnına' },
  'pro-pet-tasma': { Pet_Adi: 'LOKUM', Tur: 'Golden Retriever', Sahip_Adi: 'Emre Tekin', Telefon: '0544 321 00 99', Cip_No: 'TR-9900012485' },
  'pro-veteriner-asi': { Klinik_Adi: 'Dostlar Veteriner Kliniği', Pet_Adi: 'Pamuk (Tekir Kedi)', Asi_Turu: 'Karma Aşı (3. Doz)', Uygulama_Tarihi: '2026-08-26', Gelecek_Doz: '2027-08-26', Hekim_Adi: 'Vet. Hekim Murat Arslan' },
  'pro-oto-yag-degisim': { Plaka: '34 BJK 1903', Mevcut_Km: '124.500', Gelecek_Km: '134.500', Yag_Turu: '5W-30 Tam Sentetik', Filtreler: 'Yağ + Hava + Polen', Servis_Adi: 'Usta Oto Bosch Car Service', Tarih: '2026-08-26' },

  // 15. Ek Zengin Şablonların Örnek Verileri
  'pro-sevk-irsaliye': { Irsaliye_No: 'IRS-2026-904', Musteri: 'Mavi Lojistik Ltd.', Tarih: '2026-08-26', Kalem_1: 'Termal Kağıt Rulo 57mm (10 Koli)', Kalem_2: 'Bluetooth Mini Yazıcı v3 (2 Adet)', Kalem_3: 'Yedek Şarj Kablosu Type-C (5 Adet)', Kargo_Takip: 'TRK90412288' },
  'pro-kahve-cekirdek': { Cekirdek_Adi: 'Ethiopia Yirgacheffe G1', Koken_Rakim: 'Etiyopya / 2.100m', Kavrum: 'Medium Roast', Tadim_Notlari: 'Yasemin, Bergamot, Narenciye, Bal tatlılığı', Kavrum_Tarihi: '2026-08-22', Gramaj: '250' },
  'pro-vintage-etiket': { Urun_Adi: 'Orijinal 90s Deri Bomber Ceket', Beden: 'L', Kondisyon: 'Kusursuz (A+)', Fiyat: '1.450', Satici_Kod: 'VTG-8812', Instagram: 'https://instagram.com/iprintvintage' },
  'pro-otopark-vale': { Plaka: '34 TCP 2026', Giris_Saati: '19:45', Alan_Kat: 'Kat -2 / B-14', Arac_Model: 'BMW 320i M Sport', Fis_No: 'VALE-0481', Iletisim: '0532 000 11 22' },
  'pro-taki-aksesuar': { Urun_Adi: 'Doğal Ametist Taşlı Ay Kolye', Materyal: '925 Ayar Gümüş', Tas_Turu: 'Hakiki Ametist', Gramaj: '4.8', Fiyat: '680', Barkod_Kodu: 'JW-AM881' },

  // 16. 10x15, 10x10 & 15x10 Zebra / Endüstriyel Şablonların Örnek Verileri
  'pro-10x15-kargo-zebra': {
    Kargo_Firmasi: 'Yurtiçi Kargo',
    Rota_Kodu: '34-KDK / İST-04',
    Alici_Adi: 'Ahmet Yılmaz & Ort.',
    Alici_Tel: '+90 532 987 65 43',
    Teslimat_Adresi: 'Atatürk Bulvarı Papatya Sokak No: 8 Daire: 4 Kadıköy / İstanbul',
    Ilce: 'Kadıköy',
    Il: 'İSTANBUL',
    Gonderici_Firma: 'MegaStore Teknoloji A.Ş.',
    Siparis_No: 'TY-2026-9948201',
    Paket_Adet: '1',
    Desi: '3',
    Odeme_Turu: 'Gönderici Ödemeli (Peşin)',
    Icerik_Ozeti: '1x Zebra 100x150mm Termal Rulo, 2x USB Barkod Okuyucu',
    Takip_No: 'YK-88402914820'
  },
  'pro-10x15-trendyol-pazaryeri': {
    Pazaryeri: 'TRENDYOL',
    Kargo_Firmasi: 'Trendyol Express',
    Siparis_No: '8839049102',
    Alici_Adi: 'Selin Demir',
    Alici_Tel: '0530 123 45 67',
    Teslimat_Adresi: 'Fenerbahçe Mah. Kalamış Cad. No: 18 D: 6 Kadıköy / İstanbul',
    Satici_Magaza: 'iPrint Teknoloji Pazaryeri',
    Urun_Listesi: '1 Adet Zebra 100x150 Termal Rulo\n1 Adet USB Barkod Okuyucu',
    Takip_No: 'TEX-9048123991'
  },
  'pro-10x10-kare-depo': {
    Depo_Adi: 'GEBZE ANA LOJİSTİK DEPOSU',
    Raf_Kodu: 'RAF-A12-KAT3-GÖZ4',
    Urun_Adi: 'Zebra Endüstriyel Termal Rulo (100x150)',
    Stok_Kodu: 'STK-990412',
    Miktar: '250',
    Birim: 'Adet',
    Parti_Lot: 'LOT-2608-01'
  },
  'pro-10x15-gs1-lojistik-dikey': {
    SSCC_No: '386901234567890128',
    Gonderen_Tesis: 'Gebze Ana Lojistik & Üretim Üssü',
    Hedef_Depo: 'İzmir Kemalpaşa Bölge Dağıtım Merkezi',
    Brut_Agirlik: '485 KG',
    Net_Agirlik: '460 KG',
    Koli_Adet: '36',
    Parti_Lot: 'LOT-2026-AUG-88',
    Uyari_Notu: '⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ'
  },
  'pro-15x10-kargo-pazaryeri': {
    Kargo_Firmasi: 'Yurtiçi Kargo',
    Rota_Kodu: '34-KDK / İST-04',
    Alici_Adi: 'Deniz Korkmaz & Ailesi',
    Alici_Tel: '+90 532 999 44 22',
    Teslimat_Adresi: 'Acıbadem Mah. Çeçen Sok. Akasya Evleri A3 Blok K:14 D:58',
    Ilce: 'Üsküdar',
    Il: 'İstanbul',
    Gonderici_Firma: 'MegaStore Teknoloji & E-Ticaret A.Ş.',
    Siparis_No: 'TY-2026-9948201',
    Paket_Adet: '1',
    Desi: '3',
    Odeme_Turu: 'Gönderici Ödemeli (Peşin)',
    Icerik_Ozeti: '1x Zebra Termal Etiket Rulosu (150x100mm)\n2x Type-C Hızlı Şarj Kablosu',
    Takip_No: 'YK-88402914820'
  },
  'pro-15x10-palet-lojistik': {
    SSCC_No: '386901234567890128',
    Gonderen_Tesis: 'Gebze Ana Lojistik & Üretim Üssü',
    Hedef_Depo: 'İzmir Kemalpaşa Bölge Dağıtım Merkezi',
    Brut_Agirlik: '485',
    Net_Agirlik: '460',
    Koli_Adet: '36',
    Parti_Lot: 'LOT-2026-AUG-88',
    Sevk_Tarihi: '26.08.2026',
    Uyari_Notu: '⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ'
  },
  'pro-15x10-urun-kimlik': {
    Marka_Uretici: 'iPrint Industrial Solutions',
    Model_Adi: 'PRO-THERMAL-Z150 (Direct Thermal Barcode Printer)',
    Urun_Aciklama: 'Endüstriyel 203 DPI Yüksek Hızlı Masaüstü Termal Etiket ve Sevk Yazıcısı',
    Voltaj: '100-240V AC ~ 50/60Hz',
    Guc: '65',
    Mensei: 'Made in Türkiye',
    Seri_No: 'SN-Z150-2026-004812',
    Kullanim_Kilavuzu_Link: 'https://iprint.pro/manual/z150'
  },
  'pro-15x10-gida-besin-deger': {
    Urun_Adi: 'Gurme Organik Fıstık Ezmesi (%100 Doğal)',
    Net_Miktar: '400',
    Birim: 'g',
    Icindekiler: 'Kavrulmuş Yer Fıstığı (%100). İlave şeker, palm yağı ve koruyucu içermez.',
    Alerjenler: 'Yer fıstığı içerir. Eser miktarda diğer sert kabuklu meyveler içerebilir.',
    Enerji_Kcal: '588',
    Enerji_Kj: '2460',
    Yag: '50',
    Doymus_Yag: '6.8',
    Karbonhidrat: '20',
    Seker: '4.5',
    Protein: '25',
    Tuz: '0.02',
    Isletme_No: 'TR-34-K-098231',
    TETT_Tarihi: '26.08.2027',
    Parti_No: 'PE-260826-01',
    Barkod_Ean: '8690123456789'
  },
  'pro-15x10-qc-muayene': {
    Is_Emri_No: 'WO-2026-7781',
    Parca_Adi: 'CNC Hassas Alüminyum Gövde & Rulman Yatağı',
    Revizyon: '02',
    Operator_Adi: 'Müh. Selim Çetin (Kalite Güvence)',
    Test_Tarihi: '26.08.2026 - 11:45',
    QC_Seri_No: 'QC-PASS-99042'
  }
};
