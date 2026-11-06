# ⚡ OpportunityHub

**One board for every campus opportunity — never miss an internship, hackathon, scholarship or tech event again.**

College students miss out on internships, hackathons, scholarships and technical events because the information is scattered across WhatsApp groups, LinkedIn posts, college portals and dozens of websites. OpportunityHub solves this by bringing everything onto **one searchable, filterable board** with clear deadlines.

---

## ✨ Features

- **Browse opportunities** in four categories: Internships, Hackathons, Scholarships and Events
- **One-click filters** with live counts per category
- **Instant search** across title, organisation and description
- **Deadline awareness** — every card shows an urgency chip (`Closes in 3d`, `Closes today!`, `Expired`)
- **Post an opportunity** — anyone can share an opportunity through a validated form, it goes live instantly
- **Sorted by urgency** — the closest deadlines always appear first
- **Zero-setup demo mode** — with no database configured, the app runs on a temporary in-memory MongoDB seeded with sample data
- **Fully responsive** — works on phones, tablets and desktops

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui components |
| Backend | Next.js API Route Handlers (Node.js) |
| Database | MongoDB via Mongoose (MongoDB Atlas in production) |
| Validation | Zod |
| Deployment | Vercel |

> This is a **MERN-style project**: MongoDB (database) · Express-style API routes (backend) · React (frontend) · Node.js (runtime) — unified in a single Next.js codebase, which makes deployment dramatically simpler than separate client/server repos.

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org) installed
- (Optional) A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for persistent data

### Run locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) connect your own database
cp .env.example .env.local
#    then paste your Atlas connection string into MONGODB_URI

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000> — the board is live.

> **Note:** If `MONGODB_URI` is not set, the app automatically starts a temporary **in-memory MongoDB** with 10 sample opportunities. Perfect for demos; data resets when the server restarts.

## 🔐 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | No (local) / Yes (Vercel) | MongoDB connection string, e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/opportunityhub` |

## 📁 Project Structure

```
opportunityhub/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main UI: browse + filters + search + post dialog
│   │   ├── layout.tsx                # Root layout + metadata
│   │   ├── globals.css               # Tailwind theme
│   │   └── api/
│   │       ├── route.ts              # GET /api (health check)
│   │       └── opportunities/
│   │           └── route.ts          # GET + POST /api/opportunities
│   ├── components/ui/                # shadcn/ui component library
│   ├── hooks/                        # use-toast etc.
│   └── lib/
│       ├── mongodb.ts                # DB connection (Atlas ↔ in-memory fallback)
│       ├── opportunity.ts            # Mongoose schema + model
│       └── seed.ts                   # Sample data for first run
├── .env.example                      # Environment variable template
└── package.json
```

## 🔌 API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api` | Health check |
| `GET` | `/api/opportunities?type=Hackathon&q=ai` | List opportunities (optional category filter + text search), sorted by closest deadline |
| `POST` | `/api/opportunities` | Create an opportunity. Body: `{ title, organisation, type, link, deadline, description }` |

Example:

```bash
curl -X POST http://localhost:3000/api/opportunities \
  -H "Content-Type: application/json" \
  -d '{"title":"Flipkart GRiD 6.0","organisation":"Flipkart","type":"Hackathon","link":"https://flipkart.com/grid","deadline":"2026-12-15","description":"Campus engineering challenge."}'
```

## ☁️ Deploy to Vercel (free)

1. **Push this repo to GitHub** (see the build guide or run `git init && git add . && git commit -m "init" && git push`)
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repo
3. Add the environment variable `MONGODB_URI` with your Atlas connection string
4. Click **Deploy** — you get a live link like `opportunityhub.vercel.app` in ~2 minutes

> The 10 sample opportunities are seeded automatically into an empty Atlas database on first load, so your live demo is never blank.

## 🗺 Roadmap ideas

- Student accounts (JWT auth) + admin approval queue
- Bookmark / "My Saves" list per student
- Email or WhatsApp reminders 3 days before a deadline
- College-wise boards and moderation

## 📄 License

MIT — use it, fork it, build your college's official board with it.
