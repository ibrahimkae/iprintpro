# SPEC-06 — Ekip & Çoklu Kullanım

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★ (karar #4: İLK SÜRÜMDE dahil)
> Bağımlılık: Faz 6 backend, SPEC-05 (ekip yönetimi Pro/İşletme özelliği)

## 1. Amaç

Kafe, servis, depo gibi çok personelli işletmelerde: aynı işletme hesabı altında
birden fazla kişi giriş yapar; şablonlar, menü/ürün tanımları ve cihaz profilleri
ortak kullanılır; kim ne bastı kayıtlıdır.

## 2. Roller

| Rol | Yetkiler |
|---|---|
| **owner** | Her şey + faturalandırma + ekip yönetimi |
| **manager** | Şablon/ürün düzenleme, raporlar, ekip üyesi ekleme (fatura hariç) |
| **staff** | Yalnız baskı ve günlük işlemler; ayarları değiştiremez |

## 3. Veri Modeli (Server)

```sql
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  owner_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE team_members (
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner','manager','staff') NOT NULL DEFAULT 'staff',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- paylaşılan kaynaklara team sahipliği eklenir
ALTER TABLE templates ADD COLUMN team_id INT NULL, ADD FOREIGN KEY (team_id) REFERENCES teams(id);
```

Kaynak görünürlük kuralı:
- `team_id` dolu şablon → ekip üyeleri görür/düzenler (role'e göre)
- `team_id` boş → yalnız sahibinin kişisel kütüphanesi

## 4. API

| Yöntem | Yol | Rol |
|---|---|---|
| POST | `/teams` | herkes (otomatik owner atanır) |
| POST | `/teams/:id/members` | owner, manager — `{email, role}` davet |
| DELETE | `/teams/:id/members/:userId` | owner |
| PATCH | `/teams/:id/members/:userId` | owner — rol değiştirme |
| GET | `/templates?scope=team` | üye — ekip şablonları |
| GET | `/activity?from=&to=` | manager+ — faaliyet kaydı |

Davet akışı v1: e-posta linki yok (basit tutulur) — owner, üyenin zaten kayıtlı
e-postasını ekler; kayıtlı değilse "önce uygulamaya kaydolsun" mesajı. (E-posta
davet altyapısı v1.1.)

## 5. İstemci Davranışı

- **Hesap bağlamı:** giriş yapılmışsa üst barda ekip adı + rol rozeti
- **Şablonlar ekranı:** iki sekme — "Benim" / "Ekibim" (rol staff ise Ekibim salt okunur düzenleme kilitli)
- **Ayarlar kilidi:** staff için yazıcı ayarı değişimi gizli (yanlış dokunuş koruması)
- **Faaliyet kaydı:** her baskıda server'a anonim olay (`{userId, templateId, copies, ts}`);
  adres/müşteri verisi gönderilmez (KVKK uyumu — içerik asla loglanmaz)

## 6. Cihaz Profili Senkronu

Mevcut yerel cihaz profilleri (Faz 3) ekip modunda opsiyonel buluta taşınır:
- `POST /teams/:id/devices` — profil paylaşımı (hangi BLE yazıcı, hangi kanal, koyuluk)
- Diğer üye aynı yazıcıyı seçtiğinde ayarlar otomatik gelir ("Reception yazıcısı" gibi isimlendirilir)
- Çakışma: son yazan kazanır + önceki değer 30 gün geri alınabilir (audit kolonları)

## 7. Kabul Kriterleri

1. Owner şablonu "ekiple paylaş" işaretlerse manager/staff hesaplarında Ekibim sekmesinde görünür
2. Staff şablon düzenleyemez (UI kilit + server 403 çift kontrol)
3. Manager üye ekleyebilir, faturalandırmaya erişemez
4. Faaliyet kaydı baskı sayısını doğru sayar; müşteri/adres içeriği kayıtlarda geçmez
5. Üye çıkarılınca erişim anında kesilir (token'da team scope doğrulaması)
6. Cihaz profili paylaşımı: ikinci cihazda giriş yapan personel aynı yazıcı ayarlarını görür
7. Server testleri: rol matrisi × endpoint ≥20 vaka; client testleri: görünüm kilidi ≥8 vaka
8. Tek kişilik kullanım hiçbir ekstra adım görmez (ekipsiz akış bugünkü gibi)

## 8. Kapsam Dışı (v1)

- E-posta davet linkleri + kayıt dönüşümü → v1.1
- Ayrıntılı izin özelleştirme (özel roller) → talebe göre
- Mesajlaşma/yorum akışı → kapsam dışı
