# coop shop — Full-Stack E-Commerce Application

Next.js (frontend) + Express + MySQL (backend), with Stripe payments, an admin panel,
dark/light mode, toast notifications, wishlist, live chat with a FAQ bot, and a
currency switcher (USD/LKR).

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, react-hot-toast, socket.io-client, axios, lucide-react
- **Backend:** Node.js, Express, MySQL (mysql2), JWT auth, bcrypt, multer (image uploads), Socket.io
- **Payments:** Stripe Checkout (test mode, charges in USD regardless of display currency)

## 1. Database setup
1. Install MySQL locally (or use a hosted instance).
2. Run the schema: `mysql -u root -p < backend/database/schema.sql`
3. Copy `backend/.env.example` to `backend/.env` (must be named exactly `.env`) and fill in
   your MySQL credentials, a random `JWT_SECRET`, and Stripe **test** keys.
4. Seed demo data: `cd backend && npm install && npm run seed`
   Admin login: **admin@coopshop.com / Admin@123**

## 2. Run the backend
```
cd backend
npm install
npm run dev
```
API: http://localhost:5000 — health check at `/api/health`

For Stripe order-status updates to work locally, run the Stripe CLI alongside it:
```
stripe listen --forward-to localhost:5000/api/payment/webhook
```
Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env`.

## 3. Run the frontend
```
cd frontend
npm install
cp .env.local.example .env.local   # must be named exactly .env.local
npm run dev
```
Site: http://localhost:3000

## Features
- Product catalog: categories with an expandable sidebar tree, grid density toggle,
  items-per-page, sort, and a top search bar
- Product detail pages with a multi-image gallery, sizes/colors, reviews & ratings
- **Wishlist / Favourites** — heart icon on every product card and detail page
- **Cart drawer** — adding an item slides open a cart panel (plus a full `/cart` page)
- Stripe Checkout (test mode) with a pending → paid order flow
- **Cash on Delivery** as a second payment method — places the order immediately with no
  gateway required, useful for testing the full flow before Stripe keys are configured,
  or as a real option for markets where COD is common
- **Currency switcher** (USD / LKR) — display-only; Stripe still charges in USD
- JWT auth with **show/hide password** fields on login & register
- Admin panel: dashboard stats, **multi-image product upload** with thumbnail previews,
  paginated product table with status badges, order status management, categories,
  and a **live chat inbox**
- Dark/light mode toggle (persisted)
- Toast notifications throughout
- **Live chat widget** with quick-reply FAQ buttons, a simple keyword-matching auto-reply
  bot, and escalation to a human agent (type "agent") who can then reply from the admin
  chat inbox in real time via Socket.io
- Standalone **FAQ page** (`/faq`), sharing its content with the chat bot's auto-replies

## Known limitations to address before going live
- **Stock photography**: the homepage/category images are stock photos provided for
  layout purposes — confirm you have a proper license (or swap in your own photography)
  before using them commercially.
- **Chat history isn't persisted** — the live chat is a real-time Socket.io relay only;
  the admin inbox only shows conversations that arrive while that page is open. For
  production, add a `chat_messages` table and load history on page load.
- **Currency conversion rate is a hardcoded constant** (`USD_TO_LKR` in
  `context/CurrencyContext.js`) — swap in a live FX rate feed for accuracy.
- Stripe keys, CORS origin, and file storage (currently local disk) all need
  production-ready values before launch — see the original setup notes above.
