const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Server endpoints', () => {
  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('service', 'slack-message-viewer');
  });

  test('GET /api/auth/status returns JSON with expected fields', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('authenticated');
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/not-found-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Route not found');
  });
});

