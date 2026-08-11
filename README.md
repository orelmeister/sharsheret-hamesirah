# שרשרת המסירה (Sharsheret HaMesirah)

**מאגר ידע אינטראקטיבי על חכמי המשנה והתלמוד — משמעון הצדיק ועד חתימת התלמוד.**

> Interactive Knowledge Graph of Talmudic Sages — from Shimon HaTzadik through the sealing of the Talmud.

## 🎯 Overview

שרשרת המסירה is a digital encyclopedia of Mishnaic and Talmudic sages, designed as both a readable digital book and a searchable, filterable knowledge graph. Users can explore teacher-student chains, chevruta and disputant relationships, timelines, and historical context.

- **Language:** Hebrew (RTL, default)
- **MVP Scope:** Shimon HaTzadik → Sealing of the Talmud
- **Future:** Geonim, Rishonim, Acharonim

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + RTL support |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| Search | PostgreSQL Full-Text Search + pg_trgm |
| Deployment | DigitalOcean App Platform |
| CI/CD | GitHub Actions |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm

### Local Development

```bash
# Clone
git clone https://github.com/orelmeister/sharsheret-hamesirah.git
cd sharsheret-hamesirah

# Install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Database
npx prisma migrate dev --name init
npm run db:seed

# Start
npm run dev
# → http://localhost:3000
```

### Docker

```bash
docker compose up -d
# Runs app + PostgreSQL
# → http://localhost:3000
# Admin: admin / admin123
```

## 📁 Project Structure

```
app/                    # Next.js App Router pages
├── api/                # REST API routes
├── scholars/           # Scholar listing + detail pages
├── search/             # Full-text search
├── timeline/           # Interactive timeline
├── graph/              # Relationship graph
├── map/                # Geographic map
└── admin/              # CMS (authenticated)

prisma/                 # Database schema + migrations + seed

components/             # Reusable React components
├── layout/             # Header, Footer, Navigation
├── scholars/           # Scholar-specific components
├── graph/              # Cytoscape.js wrapper
├── timeline/           # Timeline visualization
└── map/                # Leaflet map wrapper

lib/                    # Shared utilities
├── prisma.ts           # Prisma client singleton
├── constants.ts        # Periods, relationship types
└── utils.ts            # Formatting, slugify, cn()

scripts/                # Data import/export utilities
├── import-sefaria.ts   # Sefaria API → DB pipeline
└── export-content.ts   # Content export (PDF/EPUB ready)

content/                # Content pipeline output
docs/                   # Documentation + ADRs
tests/                  # Unit + E2E tests
```

## 🔌 API Endpoints

```
GET  /api/scholars                 List scholars (paginated, filterable)
GET  /api/scholars/:slug           Full scholar + relationships + sources
GET  /api/scholars/:id/teachers    Scholar's teachers
GET  /api/scholars/:id/students    Scholar's students
GET  /api/search                   Full-text search (scholars, sources, tags)
GET  /api/timeline                 Timeline data
GET  /api/graph                    Relationship graph data
GET  /api/places                   Geographic places
GET  /api/periods                  Historical periods

POST /api/admin/scholars           Create scholar (auth required)
PUT  /api/admin/scholars/:id       Update scholar
...
```

## 🌱 Seed Data

The seed includes 6 scholars from the earliest chain of transmission:
1. **שמעון הצדיק** — Shimon HaTzadik
2. **אנטיגנוס איש סוכו** — Antignos Ish Socho
3. **יוסי בן יועזר** — Yosei ben Yoezer
4. **יוסי בן יוחנן** — Yosei ben Yochanan
5. **יהושע בן פרחיה** — Yehoshua ben Perachya
6. **נתאי הארבלי** — Nitai HaArbeli

Source data courtesy of [Sefaria](https://github.com/Sefaria/Sefaria-Export).

## 🚢 Deployment

### DigitalOcean App Platform

1. Create a PostgreSQL Managed Database on DigitalOcean
2. Create App from GitHub repo
3. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. App auto-deploys on push to `main`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `https://sharsheret.example.com`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for auth encryption |
| `ADMIN_USERNAME` | Yes | Admin login username |
| `ADMIN_PASSWORD` | Yes | Admin login password |

## 📐 Architecture Decisions

See `docs/adr/` for Architecture Decision Records covering:
- Next.js App Router vs alternatives
- Prisma vs Drizzle
- PostgreSQL FTS vs Meilisearch
- REST vs GraphQL

## 📝 Content Principles

1. Hebrew is default, all UI is RTL
2. All content must be real text — no images for content
3. No fact presented as certain without a source
4. Distinguish between: Rabbinic source, Rishonim/Acharonim, external historical source, system conclusion
5. Every significant fact must have a stored source
6. In disputes, present all opinions without ruling
7. Do not invent years, rabbis, students, relationships, or events
8. Unknown information marked: "לא ידוע ממקור מוסמך"

## 📄 License

MIT — see [LICENSE](LICENSE)

Content sourced from Sefaria is used under their respective licenses (CC-BY / CC0).

## 🤝 Acknowledgments

- [Sefaria](https://www.sefaria.org) — primary text source
- All content references include links back to Sefaria
