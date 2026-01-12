// @vitest-environment node
import request from 'supertest';
import server from '../server.js';
import { describe, expect, it } from 'vitest';

describe('API server', () => {
  it('GET /health returns ok', async () => {
    const res = await request(server.app).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
