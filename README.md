# Financial Tracker

A fullstack web application for tracking personal finances including credit card transactions, installment payments, and fixed monthly costs. Designed for household use with support for multiple users sharing the same data.

## Features

- **Dashboard** - Overview of monthly expenses with installment toggle
- **Credit Card Management** - Track multiple cards with billing cycles
- **Transaction Tracking** - Record individual purchases with categories and tags
- **Installment Tracking** - Monitor payment plans (e.g., 8/10 payments completed)
- **Fixed Costs** - Manage recurring monthly expenses (loans, bills, subscriptions)
- **Budget Management** - Set monthly limits per category
- **Analytics** - Spending breakdown by category and card
- **Household Support** - Multiple users can share and manage the same data
- **Receipt Upload** - Attach receipt images to transactions

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- TanStack Query (React Query)
- React Router DOM
- Recharts (charts)
- Zod (validation)

### Backend
- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod (validation)

### Testing
- Vitest (unit & integration tests)
- React Testing Library (component & hook tests)
- Playwright (end-to-end tests)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd financial-tracker
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npx prisma db push    # Create database tables
npx prisma db seed    # Seed with demo data
npm run dev           # Start backend server (port 3000)
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev           # Start frontend server (port 5173)
```

### 5. Access the application

Open http://localhost:5173 in your browser.

**Demo Accounts:**
- Email: `husband@example.com` | Password: `password123`
- Email: `wife@example.com` | Password: `password123`

## Project Structure

```
financial-tracker/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # TanStack Query hooks
│   │   ├── lib/              # API client, utilities
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── backend/                  # Fastify API
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── plugins/          # Fastify plugins (auth)
│   │   └── utils/            # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── package.json
└── docker-compose.yml        # PostgreSQL container
```

## Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (port 5555) |

### Frontend (`/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account + household
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/invite` - Invite household member
- `POST /api/auth/accept-invite` - Accept invitation

### Credit Cards
- `GET /api/cards` - List all cards
- `POST /api/cards` - Create card
- `GET /api/cards/:id` - Get card details
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card (soft delete)
- `GET /api/cards/:id/current-statement` - Get current billing period

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Installments
- `GET /api/installments` - List installments
- `POST /api/installments` - Create installment
- `GET /api/installments/:id` - Get installment
- `PUT /api/installments/:id` - Update installment
- `POST /api/installments/:id/increment` - Advance payment count
- `DELETE /api/installments/:id` - Delete installment
- `GET /api/installments/monthly-total` - Get monthly total

### Fixed Costs
- `GET /api/fixed-costs` - List fixed costs
- `POST /api/fixed-costs` - Create fixed cost
- `GET /api/fixed-costs/:id` - Get fixed cost
- `PUT /api/fixed-costs/:id` - Update fixed cost
- `DELETE /api/fixed-costs/:id` - Delete fixed cost
- `GET /api/fixed-costs/monthly-total` - Get monthly total

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `DELETE /api/tags/:id` - Delete tag

### Budgets
- `GET /api/budgets` - List budgets with spending
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics/monthly-summary` - Monthly spending summary
- `GET /api/analytics/by-category` - Spending by category
- `GET /api/analytics/by-card` - Spending by card
- `GET /api/analytics/billing-cycle-summary` - Billing cycle summary with installments

### Uploads
- `POST /api/uploads/receipt` - Upload receipt image
- `GET /api/uploads/receipts/:file` - Serve receipt image

## Categories

Categories are dynamic and managed per household via the Settings page. Default categories seeded:

| Category | Description |
|----------|-------------|
| HOME | Home-related expenses |
| HEALTH | Medical, fitness, wellness |
| GADGET | Electronics, devices |
| CLOTHES | Clothing, accessories |
| CAR | Vehicle-related |
| CAR_MAINTENANCE | Vehicle maintenance |
| BAKERY | Baking supplies |
| FOOD_DINING | Food and restaurants |
| ENTERTAINMENT | Entertainment, subscriptions |
| TRAVEL | Travel expenses |
| FIXED | Fixed monthly costs |
| OTHERS | Miscellaneous |

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/credit_card_tracker"
JWT_SECRET="your-secret-key"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Currency

All amounts are in Thai Baht (THB).

## License

MIT
