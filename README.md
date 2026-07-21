# Stocks Portfolio Tracker

A premium, full-stack, real-time portfolio management and financial auditing application tailored for tracking stock portfolios, analyzing trade performances, and monitoring personal cashflows.

### ✨ Core Features
- **Advanced Security & Authentication**: Secure login and registration system utilizing **JWT** verification and **Argon2id** password hashing, enhanced with automated skeleton suspense loaders for a seamless user experience.
- **IDX Composite Terminal**: A high-performance trading terminal rendering real-time stock details, fundamental metrics, and interactive charts powered by **TradingView's `lightweight-charts`**.
- **Automated Market Feeds**: Integration of background daemons and modules to fetch live tick prices and historical candlestick data directly from Yahoo Finance.
- **Multi-Account Financial Tracker**: Manage multiple distinct broker portfolios and bank accounts under a single unified dashboard. Includes dynamic budget tracking, consolidated balance sheets, and mobile-responsive chronological cashflow views.
- **Trade Management & Audits**: Record buy/sell actions with custom execution fee inputs. Track current holdings and live performance with detailed, paginated transaction histories equipped with server-side filtering and search.
- **Interactive Analytics Dashboard**: A visual overview of account balances and portfolio allocations with interactive data visualization powered by **Recharts**.
- **Shareable Trade Cards**: Instant generation of clean, professional PnL and ROI performance report cards, perfect for sharing trading results.
- **Comprehensive Trading Journals**: Document trading plans and personal notes with rich-text support, cloud-backed image attachments, and responsive card-based layouts for both desktop and mobile.
- **Profile Configuration**: Manage user settings and adjust balance sheet structures dynamically to fit evolving financial needs.
- **AI Portfolio Auditor (Coming Soon)**: A built-in intelligent agent designed to analyze trading habits, detect performance anomalies, and offer custom advisory insights..

---

## 🛠 Tech Stack

### Backend (Go Engine)
- **Language & Runtime**: Go 1.25+
- **Core HTTP Engine**: Fiber v3 (High-performance, low-overhead routing)
- **Database Engine**: PostgreSQL with connection pooling
- **ORM Persistence Layer**: GORM (Auto-migrations and relational bindings)
- **Data Validation & Security**: Argon2id crypt hashes, struct validations
- **Architecture**: Domain-Driven Design (DDD) & Clean Architecture

### Frontend (Next.js Platform)
- **Core Platform**: Next.js 16 (App Router, Server Components by default)
- **View Layer**: React 19
- **State Management**: Zustand
- **Data Validation**: Zod (Type-safe schemas)
- **Styling & UI**: Vanilla CSS and Tailwind CSS v4
- **Components System**: shadcn/ui (Radix UI), Lucide Icons
- **Data Fetching**: Axios
- **Interactive Visualizers**: Recharts & TradingView Lightweight Charts
- **Package Manager**: pnpm

---

## 📂 Project Structure

```text
stocks-portfolio-tracker/
├── backend/                    # Go API Engine
│   ├── cmd/                    # Application Entrypoints
│   │   └── api/                # Fiber API runtime
│   │       └── main.go         # Bootstraps configuration, DB, handlers, and routers
│   ├── core/                   # Domain-Driven Design Core
│   │   ├── config/             # DB connectivity & pooling configs (database.go)
│   │   ├── delivery/           # Request controllers & endpoint routing
│   │   │   ├── handlers/       # Endpoint handlers (user, positions, notes, assets, etc.)
│   │   │   └── http/           # Fiber router configuration (routers.go)
│   │   ├── domain/             # Core business models, GORM structures & contracts
│   │   ├── integrations/       # Live market data scrapers & scanner feeds
│   │   │   └── providers/      # TV Scanner (TradingView) & Yahoo Finance adapters
│   │   ├── repositories/       # Database access layers & persistence queries
│   │   ├── script/             # Executable utilities (auto-migrate.go script)
│   │   ├── services/           # Enterprise logic, use cases & calculations
│   │   └── worker/             # Background daemons (update_stock.go price synchronizer)
│   ├── pkg/                    # Reusable framework utilities
│   │   ├── middleware/         # Security & JWT router guards
│   │   └── utils/              # Helper utilities (auth, excel, format, hash, market)
│   ├── .dockerignore           # Excluded files for containerization
│   ├── .env.example            # Backend environment blueprint
│   ├── .gitignore              # Git patterns to ignore in backend
│   ├── Dockerfile              # Go lightweight production container
│   ├── go.mod                  # Go engine dependencies
│   ├── go.sum                  # Dependencies checksum verification
│   └── README.md               # Backend technical guide
│
├── frontend/                   # Next.js Application
│   ├── app/                    # Next.js App Router (Strictly route pages and layouts)
│   │   ├── (account)/          # Auth routes (login, register) with Server/Client splits
│   │   │   ├── loading.tsx     # Animated auth page skeleton loader
│   │   │   ├── login/          # LoginPage Server parent + LoginClient interactive form
│   │   │   └── register/       # RegisterPage Server parent + RegisterClient interactive form
│   │   ├── admin/              # Secured administrative dashboard views
│   │   │   ├── assistant/      # AI Copilot layout and conversational workspace
│   │   │   ├── calculator/     # Position sizing & risk-reward ratio calculator
│   │   │   ├── composite/      # IDX Composite Terminal details & lightweight-charts UI
│   │   │   ├── dashboard/      # Unified balance summaries & key statistics
│   │   │   ├── journals/       # Notebook space & formatted journal cards
│   │   │   ├── profile/        # Accounts management, asset splits & passwords
│   │   │   ├── stocks/         # Holdings trackers with dynamic metadata routing
│   │   │   ├── tracker/        # Budgeting columns & mobile-friendly lists
│   │   │   └── transactions/   # Filterable logs, trade audits & fee records
│   │   ├── favicon.ico         # App Favicon
│   │   ├── globals.css         # Typography, tailwind layers & scroll themes
│   │   ├── layout.tsx          # Root HTML frame & fonts binding
│   │   └── page.tsx            # Main landing page route entrypoint
│   ├── components/             # Reusable UI components
│   │   ├── calculator/         # Custom numeric pads and input screens
│   │   ├── dashboard/          # Account balance widgets & charts cards
│   │   ├── journal/            # Note editors & popup sheet displays
│   │   ├── profile/            # Allocation charts & manage-balance side sheets
│   │   ├── shared/             # Common Dialog wrappers, image boxes & modals
│   │   ├── stock/              # Position selectors & custom charts
│   │   ├── terminal/           # TradingView lightweight chart visualizers
│   │   ├── tracker/            # Budgeting columns & mobile-friendly lists
│   │   ├── trades/             # Performance modal wrappers & ROI sheets
│   │   ├── transaction/        # Responsive table structures & data columns
│   │   ├── ui/                 # Shadcn/ui core primitive components
│   │   ├── user/               # Authentication controls & reusable input forms
│   │   ├── AdminSidebar.tsx    # Main navigation bar layout
│   │   └── ThemeProvider.tsx   # System theme contexts switcher
│   ├── hooks/                  # Custom React hooks (domain-specific & viewport helpers)
│   │   ├── asset/              # IDX composite details and candle chart queries
│   │   ├── calculator/         # Formulas and evaluations helpers
│   │   ├── note/               # Journal fetchers, adders, modifiers, and deleters
│   │   ├── position/           # Holdings mutations and live-prices socket listeners
│   │   ├── table/              # Sorting and paginating helpers
│   │   ├── transaction/        # Historical lists queries and migrations handlers
│   │   ├── use-mobile.ts       # Global viewport width detector helper
│   │   └── user/               # Auth session actions, registration flows, and profiles
│   ├── lib/                    # Standard utilities, formatting, and axios configurations
│   │   ├── axios.ts            # Preconfigured axios instance routing to backend endpoints
│   │   ├── formatter.ts        # Currency conversion, dates, and number formatters
│   │   └── utils.ts            # Class merging utility (cn) helper
│   ├── schemas/                # Safe runtime validators enforced via Zod
│   │   ├── asset.schema.ts     # IDX asset data formats validation
│   │   ├── auth.schema.ts      # Authentication models validation
│   │   ├── balance.schema.ts   # Capital and balance transaction data validator
│   │   ├── journal.schema.ts   # Journal logs and attachments validator
│   │   └── transaction.schema.ts # Orders and trade executions validator
│   ├── stores/                 # Global stores managed via Zustand
│   │   ├── useTransactionStore.ts # Synced cache for user order histories
│   │   └── useUserStore.ts     # Active profile context and authentication session store
│   ├── app.config.ts           # App constant configuration options
│   ├── components.json         # Shadcn/ui configuration settings
│   ├── public/                 # Static graphical assets & icons
│   ├── tsconfig.json           # Compiler rules for TypeScript
│   ├── next.config.ts          # Core Next.js configuration rules
│   ├── package.json            # Node modules dependencies and task runners
│   ├── pnpm-lock.yaml          # Pnpm lockfile for deterministic installs
│   ├── pnpm-workspace.yaml     # Monorepo workspaces definition
│   ├── eslint.config.mjs       # Code style enforcement rules
│   ├── postcss.config.mjs      # CSS compile specifications
│   ├── proxy.ts                # Dev server connection proxies
│   ├── .dockerignore           # Excluded files for frontend containerization
│   ├── .env.example            # Frontend environment blueprint
│   ├── .gitignore              # Git patterns to ignore in frontend
│   ├── Dockerfile              # Next.js production container config
│   └── README.md               # Frontend user guide
│
├── .gitignore                  # Global project files to ignore
├── AUDIT_REPORT.md             # Security and codebase audit documentation
├── backup_trade_tracker.sql    # Relational database seed snapshot
├── CHANGELOG.md                # Historic record of releases & milestones
├── DEPLOYMENT.md               # Production cloud deployment guide
├── docker-compose.yml          # Container orchestration blueprints
├── vercel.json                 # Monorepo vercel routing config
└── README.md                   # Main workspace manual
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Go](https://go.dev/doc/install) (1.25 or higher)
- [Node.js](https://nodejs.org/) (20 or higher)
- [pnpm](https://pnpm.io/installation) (Preferred package manager)
- [PostgreSQL](https://www.postgresql.org/download/) (Main database)
- [Cloudinary](https://console.cloudinary.com/) (Media management for image uploads and CDN.)
- [Vercel](https://vercel.com) (Managed PostgreSQL & Connection Pooling.)
- [Supabase](https://supabase.com/) (Managed PostgreSQL & Connection Pooling, use this if you're going to online)

### 1. Backend Engine Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your PostgreSQL credentials.*
3. Download dependencies:
   ```bash
   go mod tidy
   ```
4. Perform auto-migration:
   ```bash
   go run core/script/auto-migrate.go
   ```
5. Boot the server engine:
   ```bash
   go run cmd/api/main.go
   ```
   *The server starts on the configured port (default `:8080`).*

### 2. Frontend Platform Setup

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install clean dependencies:
   ```bash
   pnpm install
   ```
3. Boot the Next.js development server:
   ```bash
   pnpm run dev
   ```
   *Access the client directly at [http://localhost:3000](http://localhost:3000).*

---

## ⚙️ Environment Blueprint

Copy the `.env.example` file to `.env` in both `/frontend` and `/backend` directories, then fill in the following variables:

### 🌐 Frontend (`/frontend`)
| Variable | Description | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Go Backend Engine URL | Default: `http://localhost:8080/api` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name | Cloudinary Console Dashboard |

### ⚙️ Backend (`/backend`)
| Variable | Description | Source |
| :--- | :--- | :--- |
| `DB_CONNECTION` | PostgreSQL Connection String | See [Database Setup Guide](#🔧-database-setup-guide) |
| `PORT` | Server Port | Default: `8080`. |
| `JWT_SECRET` | Secret key for JWT signing | Create a random secure string (e.g., using `openssl rand -base64 32`). |
| `PRODUCTION_MODE` | App environment state | Set to `false` for local dev, `true` for production/Vercel. |
| `PRODUCTION_ENVIRONMENT` | App environment name | Example: Vercel, localhost, etc. |
| `API_GROUP_NAME` | Fiber route prefix | Default: `/api`. |
| `ALLOW_ORIGINS` | Allowed CORS Origins (splitted with comma) | Example: http://localhost:3000, https://tpt-v3.vercel.app. |

---

## 🔧 Database Setup Guide

- **Cloud (Recommended)**: Go to Supabase > Connect > Transaction Pooler. Use Port `6543`.
- **Local Dev**: Use your local PostgreSQL connection string (e.g., `postgres://user:pass@localhost:5432/db`).

<p align="center">
  <img src="./assets/image-1.png" alt="Image 1" width="800" />
</p>
<p align="center">
  <img src="./assets/image-2.png" alt="Image 2" width="800" />
</p>
<p align="center">
  <img src="./assets/image-3.png" alt="Image 3" width="800" />
</p>
<p align="center">
  <img src="./assets/image-4.png" alt="Image 4" width="800" />
</p>

---

## 🌍 Deployment

For comprehensive production deployment instructions on Vercel, including our seamless "Zero-Config" True Monorepo setup, please refer to the [Deployment Guide](DEPLOYMENT.md).

---

## 📝 License

This project is licensed under the MIT License.
