# ServeFlow — Restaurant Order Management

A restaurant point-of-sale web app: browse the menu, take orders, run payments,
and track service live. A typed **React** front end on a **C++ (Crow) REST API**.

> Built to feel like a real product. It ships with a demo mode, so the deployed
> site stays live even when the backend isn't running.

## Features

- **Service dashboard** — KPI row (revenue, orders, avg ticket, top seller),
  a live orders board with status and line items, and the menu.
- **POS order flow** — tap the menu to build an order, add the customer, place it.
- **Payments** — cash, card, and UPI with an animated processing → paid state.
- **Analytics** — revenue by order, revenue by category, and top sellers
  (charts computed client-side from the orders).
- **Light / dark theme**, responsive down to mobile, and reduced-motion support.
- **Demo mode** — bundled sample data with automatic fallback when the API is offline.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Framer Motion ·
Recharts · lucide-react — talking to a C++ / Crow REST API.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build
npm run preview  # serve the production build
```

## Connecting the backend

The app reads the API base URL from an environment variable. Copy the example
and adjust as needed:

```bash
cp .env.example .env
```

| Variable             | Default                   | Purpose                                      |
| -------------------- | ------------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:18080`  | Base URL of the ServeFlow C++ API            |
| `VITE_USE_MOCK`      | _(unset)_                 | Set to `true` to always use bundled demo data |

**Live API:** build and run the `serveflow_api` executable from the backend
(`serve_flow_backend`) so it listens on port `18080`, then start this app. The
backend already sends CORS headers for the browser.

**Demo mode:** if the API is unreachable, the app automatically falls back to
bundled sample data and shows a "Demo mode" banner — no configuration needed.
Set `VITE_USE_MOCK=true` to force it (useful for a static portfolio deploy).

## API

| Method | Route                       | Purpose                       |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/api/menu`                 | List menu items               |
| GET    | `/api/orders`               | List orders with line items   |
| POST   | `/api/orders`               | Create an order               |
| POST   | `/api/orders/<id>/payment`  | Pay an order (cash/card/upi)  |

## Project structure

```
src/
  components/   layout (navbar, footer), banner, toast
  hooks/        theme + data-mode hooks
  lib/          formatting, order stats, analytics helpers
  pages/        Landing, Dashboard, NewOrder, Payment, Analytics, NotFound
  services/     api client, types, mock data
```
