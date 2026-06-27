/**
 * tests/auth.test.js
 *
 * Tests for POST /api/auth/login and GET /api/auth/me
 */

// Set env before loading app
process.env.MONGODB_URI     = 'placeholder'; // overridden by memory server in setup
process.env.JWT_SECRET      = 'test-secret-key-32-characters-min!!';
process.env.JWT_EXPIRES_IN  = '1h';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY    = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.NODE_ENV        = 'test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

const request = require('supertest');
const app     = require('../app');
const Admin   = require('../models/Admin');
const db      = require('./setup');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.disconnect());

const ADMIN = { email: 'test@auraresin.art', password: 'Test@1234!' };

async function createAdmin() {
  return Admin.create({ email: ADMIN.email, passwordHash: ADMIN.password });
}

// ── POST /api/auth/login ──────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns 200 + JWT on valid credentials', async () => {
    await createAdmin();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: ADMIN.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.admin.email).toBe(ADMIN.email);
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    await createAdmin();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@auraresin.art', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 422 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Test@1234!' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});

// ── GET /api/auth/me ─────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns admin profile with valid token', async () => {
    await createAdmin();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: ADMIN.password });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe(ADMIN.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.status).toBe(401);
  });
});
