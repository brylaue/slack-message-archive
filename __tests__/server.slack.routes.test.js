const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Auth and protected routes', () => {
  test('GET /api/channels requires authentication', async () => {
    const res = await request(app).get('/api/channels');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Not authenticated');
  });

  test('GET /api/messages/:channelId requires authentication', async () => {
    const res = await request(app).get('/api/messages/C123');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Not authenticated');
  });

  test('GET /api/user/:userId requires authentication', async () => {
    const res = await request(app).get('/api/user/U123');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Not authenticated');
  });
});

