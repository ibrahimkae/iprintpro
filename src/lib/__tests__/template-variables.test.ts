import { describe, it, expect } from 'vitest';
import {
  extractVariables, resolveTemplate, formatMoney,
  isValidImei, missingRequired
} from '../template-variables';

describe('extractVariables', () => {
  it('temel değişkeni metin tipiyle çıkarır', () => {
    const defs = extractVariables('Merhaba {Musteri_Adi}!');
    expect(defs).toEqual([{ name: 'Musteri_Adi', type: 'metin' }]);
  });

  it('tip ve parametreyi ayrıştırır', () => {
    const defs = extractVariables('{Tarih:tarih=DD.MM.YYYY} {Fiyat:para}');
    expect(defs).toContainEqual({ name: 'Tarih', type: 'tarih', format: 'DD.MM.YYYY' });
    expect(defs).toContainEqual({ name: 'Fiyat', type: 'para' });
  });

  it('barkod sembolojisini doğrular, bilinmeyeni CODE128 yapar', () => {
    expect(extractVariables('{Kod:barkod=EAN13}')[0].format).toBe('EAN13');
    expect(extractVariables('{Kod:barkod=qrcode}')[0].format).toBe('CODE128');
  });

  it('secim seçeneklerini virgülden böler', () => {
    expect(extractVariables('{Beden:secim=S,M,L}')[0].options).toEqual(['S', 'M', 'L']);
  });

  it('tekrar eden değişkeni tekilleştirir', () => {
    expect(extractVariables('{Ad} ve {Ad}').length).toBe(1);
  });

  it('bilinmeyen tipi metin sayar', () => {
    expect(extractVariables('{X:garip}')[0].type).toBe('metin');
  });

  it('boş adı yok sayar', () => {
    expect(extractVariables('{} { }')).toEqual([]);
  });
});

describe('formatMoney', () => {
  it('tr-TR biçiminde ₺ ekler', () => {
    expect(formatMoney(1290.5)).toBe('1.290,50 ₺');
    expect(formatMoney('1290.5')).toBe('1.290,50 ₺');
    expect(formatMoney(0)).toBe('0,00 ₺');
  });

  it('virgüllü girişi kabul eder', () => {
    expect(formatMoney('1234,56')).toBe('1.234,56 ₺');
  });

  it('geçersiz girişi olduğu gibi döndürür', () => {
    expect(formatMoney('abc')).toBe('abc');
  });
});

describe('resolveTemplate', () => {
  it('metin değerini yerine koyar', () => {
    const blocks = resolveTemplate('Merhaba {Musteri_Adi}', { Musteri_Adi: 'Ayşe' });
    expect(blocks).toEqual([{ kind: 'text', value: 'Merhaba Ayşe' }]);
  });

  it('para tipini biçimlendirir', () => {
    const blocks = resolveTemplate('Toplam: {Tutar:para}', { Tutar: '1290.5' });
    expect(blocks[0].value).toBe('Toplam: 1.290,50 ₺');
  });

  it('tarih maskesini uygular (ISO giriş)', () => {
    const blocks = resolveTemplate('{Gun:tarih=DD.MM.YYYY}', { Gun: '2026-03-05' });
    expect(blocks[0].value).toBe('05.03.2026');
  });

  it('maskeli tarih girişini parse eder', () => {
    const blocks = resolveTemplate('{Donem:tarih=MM/YYYY}', { Donem: '07.2026' });
    expect(blocks[0].value).toBe('07.2026');
  });

  it('2 haneli yılı tam yıla çevirir', () => {
    const blocks = resolveTemplate('{Gun:tarih=DD.MM.YYYY}', { Gun: '05.03.26' });
    expect(blocks[0].value).toBe('05.03.2026');
  });
  it('çözülemeyen tarihi olduğu gibi bırakır', () => {
    const blocks = resolveTemplate('{Gun:tarih}', { Gun: 'yakında' });
    expect(blocks[0].value).toBe('yakında');
  });

  it('barkodu ayrı blok yapar', () => {
    const blocks = resolveTemplate('Ürün:\n{Kod:barkod=EAN13}', { Kod: '8690123456785' });
    expect(blocks[0]).toEqual({ kind: 'text', value: 'Ürün:' });
    expect(blocks[1]).toEqual({ kind: 'barcode', value: '8690123456785', symbology: 'EAN13' });
  });

  it('aynı değişken üç yerde tek değerle çözülür', () => {
    const out = resolveTemplate('{Ad}/{Ad}/{Ad}', { Ad: 'X' })
      .map(b => b.value).join('');
    expect(out).toBe('X/X/X');
  });

  it('{{ kaçışı literal { basar', () => {
    const blocks = resolveTemplate('{{kalın}}', {});
    expect(blocks[0].value).toBe('{kalın}');
  });

  it('\n ile satırları bloklara böler', () => {
    const blocks = resolveTemplate('Satır1\nSatır2', {});
    expect(blocks.length).toBe(2);
  });

  it('eksik değer + varsayılan yoksa boş bırakır ama blok düşürmez', () => {
    const blocks = resolveTemplate('A{Yok}B', {});
    expect(blocks[0].value).toBe('AB');
  });

  it('qr bloğu üretir', () => {
    expect(resolveTemplate('{Link:qr}', { Link: 'https://x.y' })[0])
      .toEqual({ kind: 'qr', value: 'https://x.y' });
  });

  it('defs parametresi verilirse yeniden parse etmez', () => {
    const defs = [{ name: 'Sabit', type: 'metin' as const }];
    const blocks = resolveTemplate('{Sabit}', { Sabit: 'v' }, defs);
    expect(blocks[0].value).toBe('v');
  });
});

describe('isValidImei (Luhn)', () => {
  it('geçerli IMEI kabul eder', () => {
    expect(isValidImei('490154203237518')).toBe(true);
  });

  it('kontrol hanesi yanlışsa reddeder', () => {
    expect(isValidImei('490154203237519')).toBe(false);
  });

  it('15 haneden kısa reddeder', () => {
    expect(isValidImei('12345')).toBe(false);
  });
});

describe('missingRequired', () => {
  it('zorunlu ve boş olanları listeler', () => {
    const defs = [
      { name: 'A', type: 'metin' as const, required: true },
      { name: 'B', type: 'metin' as const },
      { name: 'C', type: 'metin' as const, required: true }
    ];
    expect(missingRequired(defs, { A: '', C: 'dolu' })).toEqual(['A']);
  });
});
