# TekZone Somalia

A responsive Somali language electronics store built with HTML, CSS, vanilla JavaScript, Express, MongoDB, Mongoose, JWT and bcrypt. The customer storefront and protected admin dashboard are served by the same Express app.

## Requirements

- Node.js 18 or newer
- MongoDB 6+ running locally or as a managed replica set

## Install and configure

1. Set `JWT_SECRET`, `MONGODB_URI`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. A local `.env` is included in this workspace setup and is excluded from Git; when cloning the project, copy `.env.example` to `.env` first.
2. Install packages: `npm install`
3. Start MongoDB. Local standalone MongoDB works for development: checkout reserves stock with conditional atomic updates and restores stock if order creation fails. On a replica set, checkout uses transactions for full multi-document atomicity.
4. Seed sample categories, 25 realistic products (including seven desktops), settings and the initial admin: `npm run seed`.
5. Start the app: `npm run dev` (waits for MongoDB and automatically opens your browser) or `npm start`.
6. Open `http://localhost:3000`. Admin dashboard: `http://localhost:3000/#/admin`; sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (default 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing key for seven-day access tokens |
| `ADMIN_EMAIL` | Initial seeded admin email |
| `ADMIN_PASSWORD` | Initial admin password; never sent to the browser |
| `ADMIN_PHONE` | Optional phone for the initial admin |

The seed command does not reset existing products or change an existing admin password. Keep `.env` out of source control.

## Features

- Search by name, SKU, brand and category, category/stock/price filtering, sorting and paginated API results.
- Responsive home, shop, product details, cart, checkout, account, orders, wishlist, contact, about, login, registration and not-found views.
- Guest checkout and optional authenticated customer accounts; JWT tokens protect profile, wishlist, review and order history.
- Checkout re-reads prices and stock on the server, calculates configurable delivery, creates order snapshots, and atomically updates stock in MongoDB transactions.
- Admin dashboard with live database totals, product and category CRUD, order status changes, customer list, inventory warnings, review moderation and store settings.
- Customer reviews require a delivered purchase; a customer may submit one review per product.
- Product images can be remote URLs or uploaded via the protected `POST /api/uploads` endpoint (multipart field `images`, up to 6 images, 5 MB each). Uploads are stored in `backend/uploads`; replace this adapter with object storage for multi-instance deployments.

## REST API overview

Public: `GET /api/health`, `GET /api/products`, `GET /api/products/:id`, `GET /api/categories`, `GET /api/settings`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/orders`.

Customer bearer token: `GET/PUT /api/auth/me`, `GET /api/orders/mine`, `GET/POST/DELETE /api/wishlist`, `POST /api/reviews`.

Admin bearer token: product and category CRUD, `GET /api/orders`, `PUT /api/orders/:id/status`, `GET /api/admin/stats`, `/api/admin/customers`, `/api/admin/inventory`, `GET/DELETE /api/reviews`, `PUT /api/settings`, and `POST /api/uploads`.

Send `Authorization: Bearer <token>` for protected routes. API errors return a friendly JSON `message`. The first release supports cash on delivery and manual payment/contact; payment provider credentials and callbacks should be integrated before enabling online payment.

## Deployment

Use a managed MongoDB replica set, HTTPS reverse proxy, strong unique secrets, secure environment variables, request rate limits, backups and persistent/object image storage. Set `NODE_ENV=production`; run `npm ci` then `npm start`. Serve the app behind a process manager/container and restrict admin access as required. Configure the storefront phone, WhatsApp, address, currency and delivery charge from Admin → Settings.
