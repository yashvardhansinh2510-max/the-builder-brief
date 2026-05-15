import { describe, it, expect, vi } from 'vitest';

vi.mock('@workspace/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      email: 'test@example.com',
      tier: 'pro',
      portalState: { ideaAgentUsageCount: 1, ideaAgentUsageMonth: '2026-05' },
    }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  subscribersTable: {},
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: '## SCORECARD\n' } }] };
            yield { choices: [{ delta: { content: 'Opportunity: 82\n' } }] };
          },
        }),
      },
    };
  },
}));

vi.mock('../../middleware/verifyUser', () => ({
  verifyUser: (req: any, _res: any, next: any) => {
    req.user = { id: 'user_123', email: 'test@example.com' };
    next();
  },
}));

import express from 'express';
import request from 'supertest';
import ideaAgentRouter from '../idea-agent';

const app = express();
app.use(express.json());
app.use('/', ideaAgentRouter);

describe('POST /idea-agent/analyze', () => {
  it('returns 400 if idea is missing', async () => {
    const res = await request(app)
      .post('/analyze')
      .set('Authorization', 'Bearer token')
      .send({});
    expect(res.status).toBe(400);
  });

  it('streams SSE response for valid idea', async () => {
    const res = await request(app)
      .post('/analyze')
      .set('Authorization', 'Bearer token')
      .send({ idea: 'An app that matches dog walkers with senior citizens' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  });
});
