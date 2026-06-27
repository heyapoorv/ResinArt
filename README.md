# Aura Resin 🌟

> Handcrafted resin art portfolio & e-commerce platform.
> Full-stack: React + Vite (client) · Node.js + Express + MongoDB (server) · Cloudinary (images)

---

## Tech Stack

| Layer     | Technology                                                 |
|-----------|------------------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, TanStack Query, React Router |
| Backend   | Node.js 20, Express, MongoDB Atlas, Mongoose               |
| Images    | Cloudinary (auto WebP/AVIF, lazy thumbnails)               |
| Auth      | JWT (jsonwebtoken) + bcryptjs                              |
| Logging   | Winston (structured JSON in prod)                          |
| Deploy    | Docker / Docker Compose / Render / Vercel / Nginx          |

---

## Project Structure

```
Resin Art/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios instances + API modules
│   │   ├── components/   # Reusable UI, admin, home, product components
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # public/ and admin/ pages
│   │   └── main.jsx      # Entry point
│   ├── public/           # robots.txt, sitemap.xml, favicon
│   ├── nginx.conf        # Production Nginx config
│   ├── Dockerfile
│   └── vercel.json
│
├── server/               # Express API
│   ├── config/           # db.js, cloudinary.js, env.js
│   ├── controllers/      # auth, product, category, setting
│   ├── middleware/        # auth, errorHandler, validate, uploadHandler
│   ├── models/           # Admin, Category, Product, WebsiteSettings
│   ├── routes/           # Express routers
│   ├── services/         # cloudinary.service, product.service, settings.service
│   ├── utils/            # ApiError, ApiResponse, asyncHandler, logger, seed
│   ├── validators/       # express-validator chains
│   ├── tests/            # Jest + Supertest + mongodb-memory-server
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
└── render.yaml
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
```

See [server/.env.example](./server/.env.example) for all required variables.

### 3. Seed Database

```bash
cd server
npm run seed
```

Creates the default admin account, 15 product categories, and a default WebsiteSettings document.

**Default Admin Credentials** (change immediately in production!):
- Email: `admin@auraresin.art`
- Password: `AuraResin@2024!`

### 4. Run Development Servers

```bash
# Terminal 1 – API server (port 5000)
cd server && npm run dev

# Terminal 2 – Vite dev server (port 5173, proxies /api to port 5000)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Reference

See [server/API_DOCS.md](./server/API_DOCS.md) for full API documentation.

**Base URL:** `http://localhost:5000/api`

| Endpoint                        | Auth | Description                     |
|---------------------------------|------|---------------------------------|
| `POST /api/auth/login`          | —    | Admin login → JWT               |
| `GET  /api/auth/me`             | ✅   | Current admin profile           |
| `GET  /api/products`            | —    | List (filter, sort, paginate)   |
| `GET  /api/products/featured`   | —    | Featured products for home page |
| `GET  /api/products/search`     | —    | Full-text search                |
| `POST /api/products`            | ✅   | Create product + images         |
| `PUT  /api/products/:id`        | ✅   | Update product                  |
| `DELETE /api/products/:id`      | ✅   | Delete + Cloudinary cleanup     |
| `GET  /api/categories`          | —    | All categories with counts      |
| `POST /api/categories`          | ✅   | Create category                 |
| `GET  /api/settings`            | —    | Website settings (cached 5 min) |
| `PUT  /api/settings`            | ✅   | Update settings + logo          |
| `GET  /api/health`              | —    | Liveness probe                  |
| `GET  /api/ready`               | —    | Readiness probe (DB status)     |

---

## Running Tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB instance (no real DB needed).

---

## Deployment

### Docker Compose (Self-hosted)

```bash
# Copy and fill in env vars
cp server/.env.example .env

# Build and start
docker compose up -d

# Seed the database
docker compose exec server npm run seed
```

### Render

1. Push to GitHub.
2. Create a new **Web Service** pointing to `./server`.
3. Set env vars from `render.yaml`.
4. For the client, deploy to **Vercel** (auto-detected as Vite).

### Vercel (Client)

```bash
cd client
npx vercel --prod
```

`vercel.json` already configures SPA routing and asset caching.

---

## Environment Variables

| Variable                  | Required | Description                              |
|---------------------------|----------|------------------------------------------|
| `MONGODB_URI`             | ✅        | MongoDB Atlas connection string          |
| `JWT_SECRET`              | ✅        | Min 32 chars in production               |
| `JWT_EXPIRES_IN`          | —        | Default: `7d`                            |
| `CLOUDINARY_CLOUD_NAME`   | ✅        | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`      | ✅        | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`   | ✅        | Cloudinary API secret                    |
| `CLOUDINARY_FOLDER`       | —        | Default: `aura_resin`                    |
| `ALLOWED_ORIGINS`         | ✅        | Comma-separated CORS origins             |
| `PORT`                    | —        | Default: `5000`                          |
| `NODE_ENV`                | —        | `development` \| `production`            |
| `LOG_LEVEL`               | —        | `error`\|`warn`\|`info`\|`debug`         |
| `RATE_LIMIT_MAX`          | —        | Requests per 15 min. Default: `100`      |
| `SEED_ADMIN_EMAIL`        | —        | Default: `admin@auraresin.art`           |
| `SEED_ADMIN_PASSWORD`     | —        | Default: `AuraResin@2024!`               |

---

## Production Checklist

- [ ] Change `SEED_ADMIN_PASSWORD` after first login
- [ ] Set `JWT_SECRET` to a 64+ character random string
- [ ] Set `NODE_ENV=production`
- [ ] Set `ALLOWED_ORIGINS` to your production frontend URL
- [ ] Set up MongoDB Atlas IP allowlist
- [ ] Enable Cloudinary signed uploads if needed
- [ ] Update `sitemap.xml` domain to production URL
