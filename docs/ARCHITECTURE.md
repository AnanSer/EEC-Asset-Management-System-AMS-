# EEC EAMS – Phase 1 Documentation

## Architecture Overview

```
EEC-EAMS/
├── frontend/                      # Next.js 14 App
│   ├── app/
│   │   ├── (dashboard)/           # Route group (shared layout)
│   │   │   ├── layout.tsx         # Sidebar + Navbar wrapper
│   │   │   ├── dashboard/page.tsx # KPI cards, activity, charts
│   │   │   ├── departments/       # Empty – Phase 2
│   │   │   ├── employees/         # Empty – Phase 2
│   │   │   ├── assets/            # Empty – Phase 2
│   │   │   ├── assignments/       # Empty – Phase 2
│   │   │   ├── maintenance/       # Empty – Phase 2
│   │   │   ├── testing/           # Empty – Phase 2
│   │   │   ├── reports/           # Empty – Phase 2
│   │   │   ├── notifications/     # Empty – Phase 2
│   │   │   ├── settings/          # Empty – Phase 2
│   │   │   └── profile/           # Placeholder profile
│   │   ├── globals.css            # Global styles + design tokens
│   │   ├── layout.tsx             # Root layout (metadata)
│   │   └── page.tsx               # Redirect → /dashboard
│   ├── components/
│   │   ├── brand/
│   │   │   └── EECLogo.tsx        # SVG logo component
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Collapsible sidebar
│   │   │   └── Navbar.tsx         # Sticky top navbar
│   │   └── ui/
│   │       ├── PageHeader.tsx     # Page title + actions
│   │       ├── StatCard.tsx       # KPI metric card
│   │       ├── StatusBadge.tsx    # Color-coded status pill
│   │       ├── SearchInput.tsx    # Search with clear button
│   │       ├── EmptyState.tsx     # Empty data placeholder
│   │       ├── LoadingSkeleton.tsx # Shimmer loading states
│   │       └── index.ts           # Barrel exports
│   ├── lib/
│   │   └── navigation.ts          # Centralized nav config
│   └── public/
│       └── branding/
│           ├── logo-full.svg      # Full horizontal logo (dark bg)
│           ├── logo-light.svg     # Full horizontal logo (light bg)
│           └── logo-mark.svg      # Icon-only mark
│
├── backend/                       # Express API (skeleton)
│   ├── src/
│   │   └── index.ts               # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL config (no models yet)
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
└── docs/
    └── ARCHITECTURE.md            # This file
```

## Component Inventory

| Component       | Location                    | Purpose                              |
|-----------------|-----------------------------|--------------------------------------|
| EECLogo         | components/brand/           | SVG logo with hexagon mark           |
| Sidebar         | components/layout/          | Collapsible sidebar with nav items   |
| Navbar          | components/layout/          | Sticky top bar, breadcrumb, search   |
| PageHeader      | components/ui/              | Page title + optional actions        |
| StatCard        | components/ui/              | KPI metric card with trend indicator |
| StatusBadge     | components/ui/              | 8-variant status pill                |
| SearchInput     | components/ui/              | Search with clear and focus styles   |
| EmptyState      | components/ui/              | Empty data with icon and CTA         |
| LoadingSkeleton | components/ui/              | Shimmer loading states               |

## Design Tokens

| Token                | Value     |
|----------------------|-----------|
| `eec-primary`        | `#083D4A` |
| `eec-accent`         | `#00A7D6` |
| `eec-active`         | `#C96F59` |
| `eec-background`     | `#F4F8FA` |
| `eec-card`           | `#FFFFFF` |
| `eec-text`           | `#1E293B` |

## Phase 2 Roadmap

- [ ] PostgreSQL models (Asset, Employee, Department, Assignment, Maintenance, Testing)
- [ ] Prisma migrations
- [ ] JWT authentication
- [ ] REST API endpoints (CRUD for all entities)
- [ ] Data fetching in frontend (SWR or React Query)
