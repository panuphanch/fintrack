# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Financial Tracker is a fullstack web application for tracking personal finances including credit card transactions, installment payments, and fixed monthly costs. Designed for household use with support for multiple users sharing the same data.

## Technology Stack

**Frontend:** Vite + React 19 + TypeScript + Tailwind CSS + TanStack Query + React Router DOM + Zod + Recharts

**Backend:** Fastify + Node.js + TypeScript + Prisma + PostgreSQL + Zod

## Project Structure

```
financial-tracker/
├── frontend/           # Vite + React SPA
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # TanStack Query hooks
│   │   ├── lib/        # API client, utilities
│   │   └── types/      # TypeScript interfaces
│   └── package.json
├── backend/            # Fastify API
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic
│   │   ├── plugins/    # Fastify plugins (auth)
│   │   ├── types/      # TypeScript types + Zod schemas
│   │   └── utils/      # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
└── docker-compose.yml  # PostgreSQL
```

## Development Commands

```bash
# Docker
docker compose up -d     # Start PostgreSQL

# Frontend (from frontend/)
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Production build
npm run lint             # ESLint

# Backend (from backend/)
npm run dev              # Start Fastify server (port 3000)
npm run build            # Build TypeScript
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create/run migrations
npm run db:seed          # Seed database
npm run db:studio        # Prisma Studio (port 5555)
```

## Key Features

1. **Authentication & Households**
   - JWT-based authentication
   - Email invitation for household members
   - Two users share one household

2. **Credit Card Management**
   - Multiple cards per household (supports multiple cards per bank)
   - Billing cycle tracking (cutoff day, due day)
   - Card ownership assignment

3. **Transaction Tracking**
   - 12 spending categories
   - Custom tags
   - Receipt image upload

4. **Installment Tracking**
   - Track payment plans with current/total progress (e.g., 8/10)
   - Assign to specific credit cards
   - Increment payment count
   - Monthly total calculation

5. **Fixed Costs**
   - Recurring monthly expenses (loans, bills, subscriptions)
   - Optional due day
   - Active/inactive toggle

6. **Budget Management**
   - Monthly limits per category
   - Real-time spending tracking

7. **Analytics Dashboard**
   - Monthly spending summary
   - Category breakdown (pie chart)
   - Toggle to include/exclude installments in card totals
   - Per-card spending with installment breakdown

## Database Schema

Key models:
- `Household` - Container for users, cards, transactions
- `User` - Account with JWT auth
- `Invitation` - Email invitation tokens
- `CreditCard` - Card with billing cycle info
- `Transaction` - Individual spending records
- `Tag` - Custom labels for transactions
- `Budget` - Monthly category limits
- `Statement` - Billing period records
- `Installment` - Payment plans with progress tracking
- `FixedCost` - Recurring monthly expenses

## API Routes

```
Auth:
  POST /api/auth/register      - Create user + household
  POST /api/auth/login         - Login, get JWT
  POST /api/auth/logout        - Logout
  GET  /api/auth/me            - Current user
  POST /api/auth/invite        - Send invitation
  POST /api/auth/accept-invite - Join household

Cards:
  GET    /api/cards                    - List cards
  POST   /api/cards                    - Create card
  GET    /api/cards/:id                - Get card
  PUT    /api/cards/:id                - Update card
  DELETE /api/cards/:id                - Delete card (soft)
  GET    /api/cards/:id/current-statement - Current billing period

Transactions:
  GET    /api/transactions             - List with filters
  POST   /api/transactions             - Create
  GET    /api/transactions/:id         - Get one
  PUT    /api/transactions/:id         - Update
  DELETE /api/transactions/:id         - Delete

Installments:
  GET    /api/installments             - List (activeOnly query param)
  POST   /api/installments             - Create
  GET    /api/installments/:id         - Get one
  PUT    /api/installments/:id         - Update
  POST   /api/installments/:id/increment - Advance payment count
  DELETE /api/installments/:id         - Delete
  GET    /api/installments/monthly-total - Sum of active installments

Fixed Costs:
  GET    /api/fixed-costs              - List (activeOnly query param)
  POST   /api/fixed-costs              - Create
  GET    /api/fixed-costs/:id          - Get one
  PUT    /api/fixed-costs/:id          - Update
  DELETE /api/fixed-costs/:id          - Delete
  GET    /api/fixed-costs/monthly-total - Sum of active fixed costs

Tags:
  GET    /api/tags     - List tags
  POST   /api/tags     - Create tag
  DELETE /api/tags/:id - Delete tag

Budgets:
  GET    /api/budgets     - List with spending
  POST   /api/budgets     - Create/set budget
  PUT    /api/budgets/:id - Update budget
  DELETE /api/budgets/:id - Delete budget

Analytics:
  GET /api/analytics/monthly-summary?month=YYYY-MM
  GET /api/analytics/by-category?month=YYYY-MM
  GET /api/analytics/by-card?month=YYYY-MM

Uploads:
  POST /api/uploads/receipt         - Upload image
  GET  /api/uploads/receipts/:file  - Serve image
```

## Domain Context

- **Currency:** Thai Baht (THB) only, 2 decimal precision
- **Categories:** HOME, HEALTH, GADGET, CLOTHES, CAR, CAR_MAINTENANCE, BAKERY, FOOD_DINING, ENTERTAINMENT, TRAVEL, FIXED, OTHERS
- **Billing Cycles:** Monthly, based on card-specific cutoff days

## Development Guidelines

- Use TypeScript strict mode
- Validate all inputs with Zod schemas
- Use factory functions for services (dependency injection)
- Convert Prisma Decimal to number for API responses
- Use TanStack Query for data fetching on frontend
- All React hooks must be called before conditional returns

## Test Accounts (after seeding)

```
Email: husband@example.com (name: Meee)
Email: wife@example.com (name: Je)
Password: password123
```

## Seeded Data

The seed includes:
- 7 credit cards (4 TTB cards with different billing cycles, HOMEPRO, Central, KTC)
- 18 installments assigned to respective cards
- 14 fixed costs (loans, bills, subscriptions)
- 6 budget categories
