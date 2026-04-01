# 🌿 Maket PNG — Agri-Logistics Platform

**maket.dspng.tech** | Live market prices & PMV transport board for PNG coffee and cocoa farmers.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + Realtime) |
| PWA | next-pwa + Workbox |
| Deployment | Render.com (Singapore region) |
| Languages | English + Tok Pisin |

---

## Quick Start (Local)

```bash
# 1. Clone and install
git clone https://github.com/your-org/maket-dspng.git
cd maket-dspng
npm install

# 2. Configure environment
cp .env.local.example .env.local
# → Fill in your Supabase URL + keys

# 3. Run database schema
# Open Supabase SQL Editor → paste supabase/schema.sql → Run

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

---

## Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Paste the contents of `supabase/schema.sql` and click **Run**
4. This creates:
   - `prices` table — coffee/cocoa prices by region with RLS
   - `transport_requests` table — farmer load postings with RLS
   - Seed data with 6 initial price rows
   - Realtime enabled on both tables

### Tables

**`prices`**
```sql
id, commodity, price_pgk, price_usd, source, region,
week_change_pct, created_at, updated_at
```

**`transport_requests`**
```sql
id, farmer_name, phone, province, village, commodity,
quantity_kg, pickup_date, destination, offered_price_pgk,
notes, status, driver_name, driver_phone, created_at
```

---

## Deploy to Render.com

### Step 1 — Create Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Render will auto-detect `render.yaml`

### Step 2 — Set Environment Variables

In the Render dashboard under **Environment**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API (secret!) |

### Step 3 — Configure Custom Domain

1. Render dashboard → **Settings → Custom Domains**
2. Add `maket.dspng.tech`
3. Add the CNAME record to your DNS:
   ```
   CNAME  maket  your-service.onrender.com
   ```

### Step 4 — Deploy

Render auto-deploys on every push to `main`. The health check at `/api/health` ensures zero-downtime deploys.

---

## PWA / Offline Support

The app is a full Progressive Web App:

- **Install** — Users can "Add to Home Screen" on Android/iOS
- **Offline prices** — Last-fetched price data cached for 24 hours via Workbox `StaleWhileRevalidate`
- **Offline transport** — Board cached for 6 hours via `NetworkFirst` (falls back gracefully)
- **Static assets** — Cached indefinitely via `CacheFirst`

Rural farmers with 2G/no signal can still view the price dashboard from their last visit.

---

## Tok Pisin (TPI) Translation

The UI supports full Tok Pisin localisation via the `lib/i18n.tsx` provider.

Toggle language with the **EN / TPI** button in the top nav.

To add new strings, edit the `translations` object in `lib/i18n.tsx`:
```ts
'your.key': {
  en: 'English text',
  tpi: 'Tok Pisin text',
},
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check for Render zero-downtime deploy |
| `/api/prices` | GET | All commodity prices from Supabase |
| `/api/transport` | GET | Open transport requests (filterable by commodity) |
| `/api/transport` | POST | Post a new farmer load request |

---

## Project Structure

```
maket-dspng/
├── app/
│   ├── api/
│   │   ├── health/route.ts       # Render health check
│   │   ├── prices/route.ts       # Price feed
│   │   └── transport/route.ts    # Transport board CRUD
│   ├── components/
│   │   └── AppShell.tsx          # Nav + offline banner
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Live price dashboard
│   ├── board/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Logistics board
│   ├── layout.tsx                # Root layout + PWA meta
│   └── globals.css               # Design system (CSS variables)
├── hooks/
│   └── useOnlineStatus.ts        # Online/offline detector
├── lib/
│   ├── supabase.ts               # Supabase client + types
│   └── i18n.tsx                  # EN / Tok Pisin translations
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (replace with real PNGs)
├── scripts/
│   └── gen-icons.js              # Icon generation helper
├── supabase/
│   └── schema.sql                # Full DB schema + seed data
├── next.config.js                # Next.js + PWA (next-pwa) config
├── render.yaml                   # Render.com deployment config
└── .env.local.example            # Environment variable template
```

---

## Updating Prices

Prices are managed directly in Supabase. Options:

1. **Manual** — Supabase Table Editor → `prices` table
2. **Scheduled function** — Create a Supabase Edge Function to pull from CIC/CCDA APIs weekly
3. **CSV import** — Use Supabase's CSV import feature

---

## Roadmap

- [ ] SMS alerts via Digicel PNG API when prices change >5%
- [ ] Driver matching — PMV drivers can claim open loads
- [ ] Supabase Realtime — live transport board updates without refresh
- [ ] CCDA/CIC API integration for automated price feeds
- [ ] Multi-language expansion (Hiri Motu)

---

## License

MIT © DSPNG 2024
