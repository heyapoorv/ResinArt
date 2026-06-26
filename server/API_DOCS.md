# Aura Resin Backend – API Documentation

> **Base URL**: `http://localhost:5000/api`  
> **Production**: Replace with your Render / Railway URL

---

## Authentication

All **protected** routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Endpoints

### POST `/api/auth/login`

Authenticates the admin and returns a JWT.

**Request Body** (`application/json`)
```json
{
  "email": "admin@auraresin.art",
  "password": "AuraResin@2024!"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "664abc...",
      "email": "admin@auraresin.art"
    }
  }
}
```

---

### GET `/api/auth/me` 🔒

Returns the currently authenticated admin's profile.

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "admin": { "id": "...", "email": "admin@auraresin.art" }
  }
}
```

---

## 🛍️ Product Endpoints

### GET `/api/products`

List products with pagination, filtering, and sorting.

| Query Param | Type    | Description                                          |
|-------------|---------|------------------------------------------------------|
| `page`      | number  | Page number (default: 1)                             |
| `limit`     | number  | Items per page (default: 12, max: 100)               |
| `q`         | string  | Full-text search across name + description           |
| `category`  | ObjectId| Filter by category ID                               |
| `featured`  | boolean | `true` / `false`                                     |
| `available` | boolean | `true` / `false`                                     |
| `minPrice`  | number  | Minimum price filter                                 |
| `maxPrice`  | number  | Maximum price filter                                 |
| `sort`      | string  | `newest` \| `oldest` \| `price_asc` \| `price_desc` \| `featured` |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [ /* Product array */ ],
  "pagination": {
    "total": 48,
    "page": 1,
    "limit": 12,
    "pages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET `/api/products/featured`

Returns up to 12 featured & available products (used by the **Home** page Featured Collection section).

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Celestial Geode Wall Art",
      "price": 520,
      "images": [{ "url": "https://res.cloudinary.com/...", "publicId": "...", "alt": "" }],
      "category": { "_id": "...", "name": "Geode Style", "slug": "geode-style" },
      "featured": true,
      "available": true,
      "dimensions": "60cm Diameter"
    }
  ]
}
```

---

### GET `/api/products/search?q=ocean`

Full-text search. Results sorted by relevance score.

---

### GET `/api/products/category/:slug`

Filter products by category slug (e.g. `ocean-series`, `geode-style`).

| Query Param | Description                  |
|-------------|------------------------------|
| `page`      | Pagination                   |
| `limit`     | Items per page               |
| `sort`      | Same sort options as list    |

---

### GET `/api/products/stats` 🔒

Returns dashboard counts for the Admin Overview page.

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 142,
    "featured": 8,
    "available": 130,
    "categoryCount": 24
  }
}
```

---

### GET `/api/products/:id`

Returns a single product and 3 related products from the same category.

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "...",
      "name": "Celestial Geode Wall Art",
      "description": "Experience the ethereal beauty...",
      "price": 520,
      "dimensions": "60cm Diameter",
      "images": [{ "url": "...", "publicId": "...", "alt": "" }],
      "category": { "name": "Geode Style", "slug": "geode-style" },
      "featured": true,
      "available": true,
      "sku": "AR-GD-112",
      "createdAt": "2024-10-22T...",
      "thumbnail": "https://res.cloudinary.com/..."
    },
    "related": [
      { "_id": "...", "name": "Amethyst Core", "price": 480, "images": [...] }
    ]
  }
}
```

---

### POST `/api/products` 🔒

Create a new product. Accepts `multipart/form-data`.

| Field         | Type      | Required | Description                          |
|---------------|-----------|----------|--------------------------------------|
| `name`        | string    | ✅        | Product name                         |
| `description` | string    | ✅        | Full description                     |
| `price`       | number    | ✅        | Price in USD                         |
| `category`    | ObjectId  | ✅        | Category `_id`                       |
| `images`      | files[]   | optional | Up to 10 image files                 |
| `featured`    | boolean   | optional | Default: `false`                     |
| `available`   | boolean   | optional | Default: `true`                      |
| `dimensions`  | string    | optional | e.g. `"60cm Diameter"`               |
| `sku`         | string    | optional | e.g. `"AR-GD-001"`                   |

**Response** `201 Created`

---

### PUT `/api/products/:id` 🔒

Update a product. Accepts `multipart/form-data`. All fields are optional.

Additional field:

| Field          | Type     | Description                                         |
|----------------|----------|-----------------------------------------------------|
| `removeImages` | JSON string | Array of `publicId` strings to delete from Cloudinary |

Example `removeImages`:
```
removeImages=["aura_resin/products/xyz","aura_resin/products/abc"]
```

---

### DELETE `/api/products/:id` 🔒

Deletes the product and removes all its images from Cloudinary.

**Response** `200 OK`
```json
{ "success": true, "message": "Product deleted successfully." }
```

---

## 📁 Category Endpoints

### GET `/api/categories`

Returns all categories with their product counts.

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Ocean Series",
      "slug": "ocean-series",
      "icon": "waves",
      "productCount": 12
    }
  ]
}
```

### GET `/api/categories/:id`

Single category by ID.

### POST `/api/categories` 🔒

```json
{
  "name": "New Category",
  "icon": "palette",
  "description": "Optional description"
}
```

### PUT `/api/categories/:id` 🔒

All fields optional.

### DELETE `/api/categories/:id` 🔒

Returns `409 Conflict` if any products reference this category.

---

## ⚙️ Website Settings Endpoints

### GET `/api/settings`

Fetches all website settings used by the frontend (hero text, contact info, social links).

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "businessName": "AURA RESIN",
    "heroTitle": "Handcrafted Resin Art That Makes Every Space Unique",
    "heroSubtitle": "Discover the fusion of nature and artistry...",
    "logo": { "url": "https://...", "publicId": "..." },
    "about": "At Aura Resin, we believe...",
    "whatsapp": "+1 (234) 567-890",
    "email": "hello@auraresin.art",
    "instagram": "https://instagram.com/auraresin",
    "facebook": null,
    "address": "123 Artisan Way, Creative District"
  }
}
```

### PUT `/api/settings` 🔒

Update any settings field. Accepts `multipart/form-data` (for logo upload).

| Field          | Type   | Description                 |
|----------------|--------|-----------------------------|
| `businessName` | string | Brand name                  |
| `heroTitle`    | string | Home page H1                |
| `heroSubtitle` | string | Home page subtitle          |
| `logo`         | file   | Logo image (replaces existing) |
| `about`        | string | About section text          |
| `whatsapp`     | string | WhatsApp number             |
| `email`        | string | Contact email               |
| `instagram`    | string | Instagram URL               |
| `facebook`     | string | Facebook URL                |
| `address`      | string | Studio address              |

---

## 🏥 Health Check

### GET `/api/health`

```json
{
  "success": true,
  "message": "Aura Resin API is healthy 🌟",
  "timestamp": "2024-10-24T12:00:00.000Z",
  "environment": "production"
}
```

---

## Standard Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "price", "message": "Price must be a positive number." }
  ]
}
```

| Code | Meaning                          |
|------|----------------------------------|
| 200  | OK                               |
| 201  | Created                          |
| 400  | Bad Request (validation)         |
| 401  | Unauthorized (no/invalid token)  |
| 404  | Not Found                        |
| 409  | Conflict (duplicate / linked)    |
| 422  | Unprocessable Entity (validation)|
| 429  | Too Many Requests (rate limit)   |
| 500  | Internal Server Error            |

---

## 🚀 Installation & Setup

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your values
cp .env.example .env

# 4. Seed the database (creates admin + categories + default settings)
npm run seed

# 5. Start development server
npm run dev

# 6. Start production server
npm start
```

### Required Environment Variables

| Variable                  | Description                              |
|---------------------------|------------------------------------------|
| `PORT`                    | Server port (default: 5000)              |
| `MONGODB_URI`             | MongoDB Atlas connection string          |
| `JWT_SECRET`              | Strong random secret for JWT signing     |
| `JWT_EXPIRES_IN`          | Token expiry e.g. `7d`                   |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                    |
| `CLOUDINARY_FOLDER`       | Root folder in Cloudinary (e.g. `aura_resin`) |
| `ALLOWED_ORIGINS`         | Comma-separated CORS origins             |

### Default Admin Credentials (after seeding)

| Field    | Value                      |
|----------|----------------------------|
| Email    | `admin@auraresin.art`      |
| Password | `AuraResin@2024!`          |

> ⚠️ **Change these immediately after first login in production.**

---

## 📦 Deployment (Render / Railway)

1. Push the `server/` folder to a Git repository.
2. Create a new **Web Service** on Render or Railway.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env.example`.
6. Run seed once via the shell: `npm run seed`.

---

## 🗂️ Project Structure

```
server/
├── app.js                    ← Express app factory
├── server.js                 ← Entry point
├── config/
│   ├── db.js                 ← MongoDB connection
│   └── cloudinary.js         ← Cloudinary + Multer config
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── category.controller.js
│   └── setting.controller.js
├── middleware/
│   ├── auth.js               ← JWT protect middleware
│   ├── errorHandler.js       ← Global error handler
│   ├── notFound.js           ← 404 handler
│   ├── uploadHandler.js      ← Multer middleware wrappers
│   └── validate.js           ← express-validator result handler
├── models/
│   ├── Admin.js
│   ├── Category.js
│   ├── Product.js
│   └── WebsiteSettings.js
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── category.routes.js
│   └── setting.routes.js
├── services/
│   ├── cloudinary.service.js ← Image CRUD helpers
│   └── product.service.js    ← Filter / sort / paginate logic
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── generateToken.js
│   └── seed.js
├── validators/
│   ├── auth.validators.js
│   ├── product.validators.js
│   ├── category.validators.js
│   └── setting.validators.js
├── uploads/                  ← Local temp (gitignored)
├── .env.example
├── .gitignore
└── package.json
```
