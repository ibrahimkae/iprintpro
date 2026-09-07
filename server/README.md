# Backend — iPrint Pro API (Fastify + MariaDB)

Faz 6 (şablon senkronizasyonu + auth) ve Faz 7 (topluluk şablonları) sunucusu.

## Kurulum
```bash
cd server
npm install
cp .env.example .env        # JWT_SECRET vb. doldurun
docker compose up -d        # MariaDB 11 ayağa kalkar (port 3306)
npm run dev                 # API http://localhost:3001
```
Şema ilk istekte otomatik oluşturulur (`db.ts` → `ensureSchema`).

## Endpoint'ler

| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | `/auth/register` | `{email, password}` → `{token}` |
| POST | `/auth/login` | `{email, password}` → `{token}` |
| GET | `/templates?category=&search=` | Topluluk şablon listesi (public) |
| GET | `/templates/:id` | Tek şablon (payload dahil) |
| POST | `/templates` | Şablon paylaş (auth gerekli, payload ≤ 32KB) |
| DELETE | `/templates/:id` | Sahibi veya ekip sahibi (owner) siler |
| POST | `/templates/:id/rate` | `{stars: 1..5}` (auth gerekli) |
| GET | `/billing/entitlements` | Plan + özellik matrisi (auth gerekli) |
| POST | `/billing/trial` | 14 gün ücretsiz deneme (auth, tek hak) |
| POST | `/billing/webhook` | İmzalı ödeme bildirimi (`x-signature`, HMAC-SHA256) |
| GET | `/teams` | Üyesi olunan ekipler (auth gerekli) |
| POST | `/teams` | Ekip oluştur (kurucu otomatik owner) |
| POST | `/teams/:id/members` | Üye ekle — owner, manager; `{email, role}` |
| DELETE | `/teams/:id/members/:userId` | Üye çıkar — owner |
| PATCH | `/teams/:id/members/:userId` | Rol değiştir — owner |
| POST | `/activity` | Anonim baskı olayı kaydı `{type:'print', templateId?, copies}` |
| GET | `/activity?teamId=&from=&to=` | Ekip faaliyet kaydı — manager+ |
| GET | `/trendyol/orders?status=&page=&size=&days=` | Normalize edilmiş Trendyol paketleri (mock/gerçek mod) |
| GET | `/trendyol/orders/:packageId` | Tek paket detayı (önbellek veya tek seferlik tam çekim) |
| POST | `/trendyol/cache/refresh` | Trendyol önbelleğini temizle (15 dk TTL) |

`GET /templates` artık `?scope=team&teamId=` destekler (üye görüntüleyebilir,
staff düzenleyemez). `POST /templates` gövdesinde opsiyonel `teamId` ile şablon
ekiple paylaşılır (manager+ gerekir).

## Manuel QA (MariaDB gerekir)

Otomatik testler saf birim testleridir (imza doğrulama + rol matrisi); DB'ye
bağlı uçlar için manuel kontrol:

```bash
docker compose up -d && npm run dev
export BASE=http://localhost:3001

# 1) Kayıt + token
TOKEN=$(curl -s -X POST $BASE/auth/register -H 'content-type: application/json' \
  -d '{"email":"owner@x.com","password":"parola123"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
curl -s $BASE/billing/entitlements -H "authorization: Bearer $TOKEN"   # plan: free

# 2) Deneme başlat → pro_monthly/trialing
curl -s -X POST $BASE/billing/trial -H "authorization: Bearer $TOKEN"
curl -s $BASE/billing/entitlements -H "authorization: Bearer $TOKEN"   # tüm features true

# 3) Tekrar deneme → 409 'Deneme süresi zaten kullanılmış'
curl -s -X POST $BASE/billing/trial -H "authorization: Bearer $TOKEN"

# 4) Webhook imzasız → 403; imzalı 'paid' → subscriptions güncellenir
BODY='{"userId":1,"plan":"pro_yearly","event":"paid"}'
SIG=$(node -e "const c=require('crypto');console.log('sha256='+c.createHmac('sha256',process.env.WEBHOOK_SECRET||'dev-webhook-secret').update(process.argv[1]).digest('hex'))" "$BODY")
curl -s -X POST $BASE/billing/webhook -H 'content-type: application/json' \
  -H "x-signature: $SIG" -d "$BODY"
curl -s -X POST $BASE/billing/webhook -H 'content-type: application/json' -d "$BODY"   # 403 beklenir

# 5) Ekip akışı: oluştur → üye ekle → rol değiştir → çıkar
TEAM=$(curl -s -X POST $BASE/teams -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"name":"Kahve Dükkanı"}')
curl -s -X POST $BASE/teams/1/members -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"email":"yok@x.com","role":"staff"}'   # 404 Önce uygulamaya kaydolmalı

# 6) Faaliyet: baskı kaydı + manager listesi
curl -s -X POST $BASE/activity -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"type":"print","templateId":3,"copies":5}'
curl -s "$BASE/activity?teamId=1" -H "authorization: Bearer $TOKEN"

# 7) Ekip şablonu: staff paylaşamaz (403), manager paylaşır, owner siler

## Manuel QA — Trendyol (SPEC-03)

```bash
# A) Mock mod: .env → TRENDYOL_MOCK=true (anahtar gerekmez, deterministik 12 paket)
curl -s "$BASE/trendyol/orders" | head -c 400
curl -s "$BASE/trendyol/orders?status=Created&page=0&size=50&days=7"
curl -s "$BASE/trendyol/orders/700001"
curl -s "$BASE/trendyol/orders/999999"        # 404 'Sipariş bulunamadı'

# B) Gerçek mod: TRENDYOL_MOCK=false + üç anahtar dolu
curl -s "$BASE/trendyol/orders?status=&page=0&size=50&days=7"   # status boş = tümü
curl -s -X POST $BASE/trendyol/cache/refresh                     # önbelleği temizle

# C) Hata yolları
#   Anahtar eksik (.env boş)     → 503 'Trendyol anahtarları eksik (.env)'
#   Yanlış anahtar               → 401 'Trendyol anahtarları geçersiz'
#   Hız sınırı (429, tek retry)  → 502 'Trendyol hız sınırı'
```

Notlar:
- Yanıt normalize edilmiştir (`NormalizedOrder` sözleşmesi); istemci ham Trendyol JSON'unu görmez.
- Sunucuda 15 dk bellek önbelleği `(status|page|size|days)` başına; `/trendyol/cache/refresh` ile temizlenir.
- KVKK: tam adresler asla loglanmaz (yalnızca `line1` ilk 10 karakteri maskeli).

```

Notlar:
- `WEBHOOK_SECRET` boşsa webhook 503 döner (fail-closed).
- Faaliyet kayıtları yalnızca `{templateId, copies}` taşır — müşteri içeriği asla loglanmaz (KVKK).


## Geliştirici Test Hesabı

Sunucu her açılışta (`ensureSchema` sonrası) deterministik bir geliştirici hesabı
seed eder — istemcideki "Geliştirici Hızlı Giriş" bu hesapla oturum açar:

- **E-posta:** `dev@iprint.local`
- **Şifre:** `iprint-dev-2026`
- **Plan:** `pro_yearly` / `active` (provider: `manual`, dönem sonu +10 yıl)

Değerler `.env` üzerinden `DEV_TEST_EMAIL` / `DEV_TEST_PASSWORD` ile
değiştirilebilir. Seed idempotenttir; mevcut hesap/abonelik güncellenir, log
yalnızca oluşturma/güncelleme durumunda basılır.

## Güvenlik
- Şifreler scrypt ile saklanır (`node:crypto`, tuzlu)
- JWT (@fastify/jwt), 7 gün geçerli
- Payload şema doğrulama (zod) + hız limiti (@fastify/rate-limit)
- MariaDB parametreli sorgular (SQL injection'a kapalı)

## İstemci entegrasyonu (Faz 7 UI)
Web uygulamasında "Paylaş" butonu `POST /templates` çağırır;
galeri görünümü `GET /templates` listeler. `VITE_API_URL` env değişkeni
ile adres verilir.
