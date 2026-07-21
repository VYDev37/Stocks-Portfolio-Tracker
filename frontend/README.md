# Stocks Portfolio Tracker - Frontend Platform

This directory contains the Next.js frontend platform for the Stocks Portfolio Tracker application. It is a highly interactive, responsive, and visually gorgeous dashboard made with **React 19**, **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **Zustand**.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router with Server Components by default)
- **View Layer**: React 19
- **State Management**: Zustand (Global client state stores)
- **Data Validation**: Zod (Enforcing type-safe runtime data schemas)
- **Styling**: Tailwind CSS v4 & CSS variables (Custom dark mode)
- **Visualizers**: Recharts & TradingView Lightweight Charts (Real-time candle / line renders)
- **Component Primitives**: shadcn/ui (Radix UI) & Lucide Icons
- **Data Fetching**: Axios
- **Package Manager**: pnpm

---

## 🧩 Architectural Modularization & Folder Structure

The frontend leverages Next.js App Router conventions combined with root-level modular folders for separation of concerns:

### 📂 Routing (`app/`)
The `app/` folder is strictly reserved for route layout, pages, and entry points:
- **`app/(account)/`**: Authentication routes group.
  - `loading.tsx`: Elegant shared card skeleton loader.
  - `login/` & `register/`: Pure **Server Component entrypoints** (`page.tsx`) rendering interactive **Client child components** (`LoginClient.tsx` & `RegisterClient.tsx`).
- **`app/admin/`**: Secured dashboards and features layouts.
  - `dashboard/`: Unified stats and portfolio metrics.
  - `stocks/`: Holdings tracker with dynamic metadata routing.
  - `tracker/`: Budgeting ledger cards, cashflow adjustments, and mobile lists.
  - `transactions/`: Complete transaction logs and audit filters.
  - `profile/`: Account setups, asset allocations, and balance sheets.
  - `journals/`: Formatted trading journals list.
  - `composite/[[...id]]/`: IDX Composite Terminal workspace and interactive charts.
  - `calculator/` & `assistant/`: Position size calculator and AI copilot workspace.
- **`app/layout.tsx`**: Root HTML layout context.
- **`app/globals.css`**: Global design system typography, scrollbar, and Tailwind configuration layers.

### 📂 Codebase & Shared Modules
Non-route shared folders are kept in the root folder to prevent route clutter and maintain clean imports:
- **`components/`**: Decomposed application UI components (scoped by business domain):
  - `calculator/`, `dashboard/`, `journal/`, `profile/`, `shared/`, `stock/`, `terminal/`, `tracker/`, `trades/`, `transaction/`, `user/`
  - `ui/`: Radix-based UI primitive components (buttons, dialogs, inputs, sheets).
  - *Direct elements*: `AdminSidebar.tsx` (primary sidebar shell) & `ThemeProvider.tsx` (theme switcher).
- **`hooks/`**: Custom React hooks abstracting API queries, states, and client interactions:
  - `asset/`, `calculator/`, `note/`, `position/`, `table/`, `transaction/`, `user/`
  - `use-mobile.ts`: Viewport responsiveness listener.
- **`lib/`**: Network client instances and standard utilities:
  - `axios.ts`: Pre-configured Axios instance.
  - `formatter.ts`: Currency conversion, percentage ratios, and date/time formatters.
  - `utils.ts`: Standard class-merging helper (`cn`).
  - `index.ts`: Utility modules exporter.
- **`schemas/`**: Strict runtime schema validators using Zod:
  - `asset.schema.ts`, `auth.schema.ts`, `balance.schema.ts`, `journal.schema.ts`, `transaction.schema.ts`
- **`stores/`**: High-performance Zustand store handlers:
  - `useUserStore.ts`: User profile configuration and account state.
  - `useTransactionStore.ts`: Synced log of user transactions.
  - `index.ts`: Stores exporter.
- **`app.config.ts`**: Global configuration namespace (`AppConfig`) holding site metadata constants.

### 📦 Root UI Helpers
- **`components/ui/`**: Core shadcn/ui primitive components (buttons, input, sheet, select, dropdowns, etc.).
- **`hooks/use-mobile.ts`**: Helper hook resolving device viewport size for responsive layout changes.
- **`lib/utils.ts`**: Reusable `cn` merger combining Tailwind classes safely.

### ⚙️ Root Configuration & Meta Files
- **`components.json`**: Shadcn/ui CLI configuration settings.
- **`eslint.config.mjs`**: ESLint linting rules.
- **`next.config.ts`**: Next.js core application settings.
- **`package.json`**: Package dependencies, scripts, and details.
- **`pnpm-lock.yaml`** & **`pnpm-workspace.yaml`**: Lockfile and workspace configs for pnpm.
- **`postcss.config.mjs`**: CSS postcss compiler plugins.
- **`proxy.ts`**: Development API server proxies.
- **`tsconfig.json`**: TS compiler parameters.
- **`Dockerfile`**, **`.dockerignore`**, **`.env.example`**, **`.gitignore`**: Docker container configurations, git ignores, and sample environment variables template.

---

## ⚙️ Environment Config

By default, the client directs API requests using the following fallback inside `app/lib/axios.ts`:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
```

To configure custom endpoints or integrations, create a `.env.local` inside `/frontend`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

---

## 🚀 Get Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm run dev
   ```
4. Access the web dashboard at [http://localhost:3000](http://localhost:3000).
