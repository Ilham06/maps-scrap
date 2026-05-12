# WFC CAFE FINDER — PROJECT DOCUMENTATION
## Next.js + Prisma + SQLite + OpenAI + Puppeteer + shadcn/ui

---

## 1. PROJECT OVERVIEW

**Nama:** WFC Cafe Finder
**Tagline:** "Bosen WFC di cafe yang itu-itu aja? Temukan cafe unik di kotamu"
**Target User:** Remote workers, freelancer, mahasiswa, content creator Indonesia

### Problem
Orang yang sering WFC selalu balik ke cafe yang sama karena tidak tahu alternatif lain. Padahal banyak cafe lokal dengan nama unik dan vibe menarik yang tersembunyi.

### Solution
Web app yang otomatis scrape Google Maps, filter cafe mainstream, lalu kasih AI-generated vibe description + WFC score untuk bantu user milih cafe yang cocok dengan mood mereka.

### Kenapa Next.js
- Satu repo untuk frontend dan backend
- Satu proses di server (lebih simpel)
- Ship faster, cocok untuk solo developer
- Server Components = performa bagus out of the box
- API Routes cukup untuk kebutuhan project ini

---

## 2. FINAL TECH STACK

| Layer | Tech | Keterangan |
|-------|------|------------|
| Fullstack | Next.js 16 (App Router) | Frontend + Backend dalam satu app |
| UI Components | shadcn/ui | Consistent, accessible, customizable |
| Styling | Tailwind CSS | Utility-first, sudah bundled dengan shadcn |
| ORM | Prisma | Type-safe, migration system |
| Database | SQLite | Zero config, file lokal, cukup MVP |
| Cache | Redis | Kurangi scraping & API calls |
| Scraper | Puppeteer | Background job, scrape Google Maps |
| AI | OpenAI gpt-4o-mini | Vibe analysis, murah |

### Estimasi Biaya
| Komponen | Biaya |
|----------|-------|
| SQLite | $0 (file lokal) |
| Redis | $0 (self-hosted) |
| OpenAI API | ~$1-5/bulan |
| **Total** | **~$1-5/bulan** |

---

## 3. ARSITEKTUR SISTEM

```
[User Browser]
      ↓
[Next.js App]
  ├── /app               → React UI (Server + Client Components)
  ├── /app/api           → API Routes (backend logic)
  ├── Prisma             → SQLite queries
  ├── Redis Client       → Caching
  └── OpenAI SDK         → AI analysis

[Background Scraper - async job]
  └── Puppeteer          → Google Maps scraping
        ↓
      SQLite             → Simpan hasil scraping
```

### Kenapa Scraper Dipisah
Puppeteer berat (spawn browser). Kalau dijalankan langsung di dalam API Route, bisa bikin request timeout dan memory spike. Lebih aman jalan sebagai background job yang dipanggil secara async.

---

## 4. FLOW LENGKAP

### Request Flow (User Search Kota)

```
User pilih kota "Bandung"
        ↓
Next.js API Route: GET /api/cafes?city=Bandung
        ↓
Cek Redis cache
        ↓ (HIT)
Return data langsung ✅ (< 50ms)

        ↓ (MISS)
Query SQLite via Prisma
        ↓
Cek ScrapeLog: apakah data scrape < 24 jam?
        ↓ (YA)
Query cafe dari SQLite → filter → sort → return

        ↓ (TIDAK / belum pernah)
Trigger background scraper async
        ↓
Scraper selesai → upsert ke SQLite → trigger AI analyze
        ↓
Query SQLite → simpan ke Redis → return ke user
```

### Cache Strategy

```
Level 1: Redis (TTL: 1 jam)
  └── Key: "cafes:{city}:{mood}:{sort}"
  └── Hit rate tinggi untuk kota populer

Level 2: SQLite via ScrapeLog (TTL: 24 jam)
  └── Cek kapan terakhir scrape kota ini
  └── Kalau < 24 jam: query DB, skip scraping

Level 3: Fresh scrape + AI analyze
  └── Trigger: belum pernah atau sudah > 24 jam
  └── Berjalan async, user dapat partial data dulu
```

### Scraper Job Flow

```
Trigger: POST /api/scraper/trigger { city }
        ↓
Cek Redis lock (apakah kota ini sedang di-scrape?)
        ↓ (ada lock)
Return "scraping in progress"

        ↓ (tidak ada lock)
Set lock di Redis (expire 10 menit)
        ↓
Puppeteer: launch Chrome
        ↓
Loop 4 query Google Maps:
  1. "cafe unik {city}"
  2. "coffee shop aesthetic {city}"
  3. "kedai kopi lokal {city}"
  4. "cafe hidden gem {city}"
        ↓
Per query:
  - Navigate ke Google Maps search
  - Scroll feed 3x untuk load lebih banyak hasil
  - Extract: nama, rating, review count, alamat, status buka
  - Delay 2 detik sebelum query berikutnya
        ↓
Gabungkan semua hasil, deduplicate by nama
        ↓
Filter: exclude chain + min rating 3.5 + min 5 reviews
        ↓
Hitung uniqueness score per cafe
        ↓
Upsert ke SQLite
        ↓
Release Redis lock
        ↓
Trigger AI analysis untuk cafe yang belum di-analyze (async)
```

---

## 5. FOLDER STRUCTURE

```
wfc-cafe-finder/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page (city selector)
│   ├── globals.css
│   │
│   ├── results/
│   │   └── [city]/
│   │       └── page.tsx              # Results page per kota
│   │
│   └── api/                          # API Routes
│       ├── cafes/
│       │   └── route.ts              # GET /api/cafes
│       ├── cities/
│       │   └── route.ts              # GET /api/cities
│       └── scraper/
│           └── trigger/
│               └── route.ts          # POST /api/scraper/trigger
│
├── components/                       # React components
│   ├── ui/                           # shadcn/ui generated components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── skeleton.tsx
│   │   ├── progress.tsx
│   │   └── separator.tsx
│   │
│   ├── CafeCard.tsx                  # Card per cafe (pakai shadcn Card)
│   ├── CitySelector.tsx              # Pill buttons kota
│   ├── FilterBar.tsx                 # Mood + sort filters
│   ├── LoadingState.tsx              # Skeleton cards saat loading
│   └── EmptyState.tsx                # State kalau tidak ada hasil
│
├── lib/                              # Shared utilities & services
│   ├── prisma.ts                     # Prisma client singleton
│   ├── redis.ts                      # Redis client singleton
│   ├── openai.ts                     # OpenAI client + analyzeCafe()
│   ├── scraper.ts                    # Puppeteer scraping logic
│   ├── filter.ts                     # Filter & uniqueness score logic
│   └── constants.ts                  # Kota, excluded chains, mood tags
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db                        # Auto-created
│
├── public/
│
├── components.json                   # shadcn/ui config
├── .env
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 6. DATABASE SCHEMA

### Tabel: Cafe
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | Int (PK) | Auto increment |
| name | String | Nama cafe |
| city | String | Kota (lowercase) |
| rating | Float? | Rating Google Maps |
| reviewCount | Int? | Jumlah review |
| address | String? | Alamat lengkap |
| isOpen | Boolean? | Status buka/tutup saat scraping |
| uniquenessScore | Int? | 0-100, dihitung dari nama |
| wfcScore | Int? | 0-100, dari OpenAI |
| vibeDescription | String? | AI-generated vibe description |
| moodTags | String? | JSON string: `["Fokus","Santai"]` |
| highlightFeature | String? | Satu hal paling unik dari cafe |
| warningFlag | String? | Hal yang perlu diperhatiin, nullable |
| aiAnalyzed | Boolean | Default false |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto update |

**Constraints:**
- Unique: `[name, city]`
- Index: `city`, `city + wfcScore`, `city + uniquenessScore`

> ⚠️ SQLite tidak support array. `moodTags` disimpan sebagai JSON string, di-parse saat diambil.

### Tabel: ScrapeLog
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | Int (PK) | Auto increment |
| city | String | Kota yang di-scrape |
| cafeCount | Int | Jumlah cafe ditemukan |
| scrapedAt | DateTime | Waktu scraping selesai |

---

## 7. API ROUTES

### GET /api/cafes
Ambil daftar cafe berdasarkan kota

**Query Parameters:**
| Param | Required | Default | Options |
|-------|----------|---------|---------|
| city | ✅ | - | jakarta, bandung, jogja, dll |
| mood | ❌ | - | Fokus, Santai, Social, Aesthetic, Sepi, Ramai, Cozy, Industrial |
| sort | ❌ | unique | unique, rating, wfc |
| limit | ❌ | 20 | number |

**Response:**
```
{
  city: string
  total: number
  cafes: Cafe[]
  lastUpdated: string | null
  scrapingInProgress: boolean
}
```

---

### GET /api/cities
Daftar kota yang didukung

**Response:** Array of `{ id, label, emoji }`

---

### POST /api/scraper/trigger
Trigger scraping untuk kota tertentu

**Body:** `{ city: string }`

**Response:**
- `{ status: "started" }` → scraping dimulai
- `{ status: "in_progress" }` → sudah ada proses scraping berjalan
- `{ status: "fresh" }` → data masih fresh, tidak perlu scrape

---

## 8. LOGIC DETAIL

### Filter Chain Mainstream
Exclude kalau nama mengandung salah satu dari:
```
Starbucks, Kopi Kenangan, Fore Coffee, Janji Jiwa, Excelso,
J.CO, Chatime, Gong Cha, Tiger Sugar, Tomoro Coffee,
Flash Coffee, Dunkin, Costa Coffee, McDonald's, KFC, Pizza Hut
```

Filter tambahan:
- Rating < 3.5 → exclude
- Review count < 5 → exclude

### Uniqueness Score (0-100)
| Kriteria | Poin |
|----------|------|
| Nama ≤ 15 karakter | +10 |
| Nama ≤ 8 karakter | +10 tambahan |
| Ada angka dalam nama | +5 |
| Ada karakter khusus (&, ., ,, ') | +5 |
| Mengandung kata unik | +15 |

Contoh kata unik: `senja, ruang, sudut, pojok, sunyi, langit, gubuk, pondok, lost, void, fog, ghost, error, blank, still, dim`

### WFC Score (0-100)
Diberikan OpenAI berdasarkan:
- Nama cafe → estimasi suasana (industrial, cozy, nature)
- Rating & review count → proxy kualitas
- Alamat → estimasi keramaian area

### Mood Tags
OpenAI assign 1-3 tag dari:
`Fokus, Santai, Social, Aesthetic, Sepi, Ramai, Cozy, Industrial`

Filter mood dilakukan di JavaScript (bukan Prisma query) karena SQLite tidak support array contains.

### OpenAI Config
- Model: `gpt-4o-mini`
- `response_format: json_object` → force valid JSON
- Max tokens: 400
- Temperature: 0.7
- Delay: 500ms antar calls (hindari throttling)
- Analyze max 10 cafe baru per scraping cycle (hemat cost)

---

## 9. ENVIRONMENT VARIABLES

| Variable | Keterangan |
|----------|------------|
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `REDIS_HOST` | Hostname Redis (default: localhost) |
| `REDIS_PORT` | Port Redis (default: 6379) |
| `OPENAI_API_KEY` | API key dari platform.openai.com |
| `OPENAI_MODEL` | Default: gpt-4o-mini |
| `SCRAPER_DELAY_MS` | Delay antar query (default: 2000) |
| `CACHE_HOURS` | Validitas data scraping (default: 24) |
| `MAX_CAFES_PER_CITY` | Batas cafe per kota (default: 20) |
| `SCRAPER_SECRET` | Secret untuk autentikasi trigger endpoint |
| `NEXT_PUBLIC_APP_URL` | URL app untuk metadata |

---

## 10. SUPPORTED CITIES (V1)

| ID | Label | Emoji |
|----|-------|-------|
| jakarta | Jakarta | 🏙️ |
| bandung | Bandung | 🌸 |
| jogja | Yogyakarta | 🏛️ |
| surabaya | Surabaya | 🌊 |
| bali | Bali | 🌴 |
| malang | Malang | 🏔️ |
| semarang | Semarang | 🌆 |
| medan | Medan | ☕ |
| makassar | Makassar | 🌅 |

---

## 11. FRONTEND PAGES & COMPONENTS

### Pages

**`/` — Home Page**
- Hero section dengan tagline
- City selector (pill buttons horizontal scroll)
- Klik kota → navigate ke `/results/{city}`

**`/results/[city]` — Results Page**
- Filter bar (mood + sort)
- Grid cafe cards (2 kolom mobile, 3 kolom desktop)
- Loading skeleton saat scraping
- Empty state kalau tidak ada hasil setelah filter

### Components & shadcn/ui Usage

**CafeCard**
- Menggunakan: `Card, CardHeader, CardContent, CardFooter`
- Nama cafe (typography besar)
- `Badge` untuk mood tags dan "Unik Pick"
- `Progress` untuk WFC score bar
- Rating + review count (text muted)
- AI vibe description (italic)
- Warning: `Badge` variant destructive kalau ada warning
- Tombol Maps: `Button` variant outline

**CitySelector**
- Menggunakan: `Button` variant outline / default untuk active state
- Horizontal scroll dengan gap
- Emoji + label per kota

**FilterBar**
- Mood filter: `Button` group (toggle style)
- Sort: `Button` group
- Separator antara filter dan sort
- Show count: text muted

**LoadingState**
- Menggunakan: `Skeleton`
- Mirror layout CafeCard tapi dengan skeleton placeholder
- Jumlah skeleton cards: 6

**EmptyState**
- Ilustrasi sederhana (SVG atau emoji besar)
- Pesan "Tidak ada cafe dengan filter ini"
- `Button` untuk reset filter

---

## 12. OPENAI COST ESTIMATION

| Skenario | API Calls | Estimasi/bulan |
|----------|-----------|----------------|
| 5 kota pertama kali | 50 calls | ~$0.30 |
| 10 kota, traffic normal | ~100 calls total | ~$0.60 |
| Traffic tinggi (50 kota aktif) | ~500 calls | ~$3 |

**Kenapa tetap murah:**
- Setiap cafe di-analyze sekali, hasil disimpan permanen
- Redis cache mengurangi hit ke API routes
- Scraping hanya dilakukan kalau data > 24 jam

---

## 13. TIKTOK CONTENT STRATEGY

### Video 1: Demo App (60 detik)
```
[0-5s]   Hook: "Bosen WFC di cafe itu-itu aja? Gua build sesuatu"
[5-30s]  Demo: buka web, pilih kota, loading, cards muncul
[30-50s] Show: klik card, WFC score + AI vibe description
[50-60s] CTA: "Gratis, link di bio"
```

### Video 2: Vlog WFC 3 Cafe dari App
```
Hook: "Tes app gua sendiri, WFC di 3 cafe random yang disaranin"
Content: Mini vlog per cafe, compare rekomendasi vs kenyataan
Ending: verdict + engagement question ke audience
```

### Video 3: Tutorial Build (dev audience)
```
Hook: "Build WFC finder dengan Next.js + OpenAI, biaya $1/bulan"
Content: Walkthrough arsitektur, key decisions
CTA: "Repo open source di GitHub"
```

### Video 4: "Nama Cafe Paling Absurd di [Kota]"
```
Hook: Show nama-nama cafe unik hasil scraping
Content: Top 5 nama terunik + reaksi
Engagement: "Kamu pernah ke cafe yang mana?"
```

### Content Loop Ideas
- City battle: "Jakarta vs Bandung, mana yang lebih unik?"
- Weekly hidden gem series per kota
- "WFC score tertinggi di [kota] minggu ini"
- User submit cafe favorit di comment → scrape → review

---

## 14. UPGRADE PATH

### SQLite → PostgreSQL (kapanpun siap)
Yang berubah:
1. `schema.prisma` → ganti `provider = "sqlite"` ke `"postgresql"`
2. `.env` → ganti `DATABASE_URL` ke PostgreSQL connection string
3. `moodTags` bisa ganti dari JSON string ke `String[]` native

Kapan perlu upgrade:
- Traffic > 100 concurrent requests/menit
- Data > 1GB
- Butuh full-text search

### Fitur Tambahan yang Bisa Ditambah
- User submit cafe baru
- User rating cafe
- Filter: ada colokan, noise level, estimasi budget
- Shareable card untuk Instagram / TikTok Stories
- Leaderboard: kota dengan cafe paling unik
- Google Maps embed di detail page
