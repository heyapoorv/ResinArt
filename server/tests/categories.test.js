/**
 * tests/categories.test.js
 *
 * Tests for GET, POST, PUT, DELETE /api/categories
 */

process.env.MONGODB_URI     = 'placeholder';
process.env.JWT_SECRET      = 'test-secret-key-32-characters-min!!';
process.env.JWT_EXPIRES_IN  = '1h';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY    = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.NODE_ENV        = 'test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

const request  = require('supertest');
const app      = require('../app');
const Admin    = require('../models/Admin');
const Category = require('../models/Category');
const db       = require('./setup');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.disconnect());

async function getToken() {
  await Admin.create({ email: 'admin@test.com', passwordHash: 'Test@1234!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'Test@1234!' });
  return res.body.data.token;
}

// ── GET /api/categories ───────────────────────────────────
describe('GET /api/categories', () => {
  it('returns empty array when no categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns categories with productCount', async () => {
    await Category.create({ name: 'Ocean Series' });
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].productCount).toBe(0);
  });
});

// ── POST /api/categories ──────────────────────────────────
describe('POST /api/categories', () => {
  it('creates a category with valid data', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Geode Style', icon: 'diamond' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Geode Style');
    expect(res.body.data.slug).toBe('geode-style');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('returns 422 when name is missing', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ icon: 'diamond' });
    expect(res.status).toBe(422);
  });

  it('returns 409 on duplicate name', async () => {
    const token = await getToken();
    await Category.create({ name: 'Ocean Series' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ocean Series' });
    expect(res.status).toBe(409);
  });
});

// ── DELETE /api/categories/:id ────────────────────────────
describe('DELETE /api/categories/:id', () => {
  it('deletes a category with no products', async () => {
    const token = await getToken();
    const cat   = await Category.create({ name: 'Temp Cat' });
    const res   = await request(app)
      .delete(`/api/categories/${cat._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent category', async () => {
    const token = await getToken();
    const res   = await request(app)
      .delete('/api/categories/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
