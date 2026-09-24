<h1 align="center">💸 Eazycash</h1>
<p align="center">A full-stack expense tracker built with React Native (Expo) and Express.</p>

![Demo App](/mobile/assets/images/screenshot-for-readme.png)

## Features

- 🔐 Email/password authentication with email verification (Clerk)
- 🏠 Home screen with balance, income/expense summary, and recent transactions
- 🔎 Search, category, income/expense, and date-range filters on the transaction list
- 🏷️ Categorized transactions (Food, Transport, Shopping, Bills, Rent, Entertainment, Health, Salary, Other)
- 💰 Amounts shown in Indian Rupees (₹) with Indian-style formatting
- 📊 Monthly per-category budgets with progress tracking
- 📈 Spending insights — category breakdown and a 6-month income/expense trend
- 🔁 Recurring monthly transactions (rent, subscriptions, salary) with automatic catch-up
- 🔄 Pull-to-refresh, delete transactions, and sign out

## Tech stack

- **Mobile**: React Native, Expo Router, Clerk
- **Backend**: Express, Neon (Postgres), Upstash (Redis rate limiting)

## Project structure

```
backend/   Express API (transactions, budgets, insights)
mobile/    Expo Router app
```

## Setup

### Backend (`/backend`)

Create a `.env` file:

```bash
PORT=5001
NODE_ENV=development

DATABASE_URL=<your_neon_postgres_connection_url>

UPSTASH_REDIS_REST_URL=<your_upstash_redis_rest_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_redis_rest_token>
```

```bash
cd backend
npm install
npm run dev
```

### Mobile (`/mobile`)

Create a `.env` file:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

```bash
cd mobile
npm install
npx expo start
```
