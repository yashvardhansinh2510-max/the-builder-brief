import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({}),
  gte: vi.fn().mockReturnValue({}),
  count: vi.fn().mockReturnValue({}),
}));

vi.mock('../../lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
  FROM_EMAIL: 'noreply@test.com',
  SITE_URL: 'http://localhost:3000',
}));

vi.mock('@workspace/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      email: 'test@example.com',
      portalState: {},
      startupStage: null,
      biggestChallenge: null,
    }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  subscribersTable: {},
}));

vi.mock('../../middleware/verifyUser', () => ({
  verifyUser: (req: any, _res: any, next: any) => {
    req.user = { id: 'user_123', email: 'test@example.com' };
    next();
  },
}));

import express from 'express';
import request from 'supertest';
import subscribersRouter from '../subscribers';

const app = express();
app.use(express.json());
app.use('/', subscribersRouter);

describe('PATCH /subscribers/me', () => {
  it('returns 200 with ok:true on valid payload', async () => {
    const res = await request(app)
      .patch('/subscribers/me')
      .set('Authorization', 'Bearer token')
      .send({ stage: 'Building', goal: 'Validate my idea', constraint: 'Time' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('accepts partial payload', async () => {
    const res = await request(app)
      .patch('/subscribers/me')
      .set('Authorization', 'Bearer token')
      .send({ stage: 'Idea' });

    expect(res.status).toBe(200);
  });
});
