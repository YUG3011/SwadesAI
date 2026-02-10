import { describe, it, expect, vi } from 'vitest';

// Mock services that would otherwise touch the database or agents so tests are deterministic
vi.mock('../src/services/conversation.service', () => ({
  addMessage: vi.fn(),
  dropConversation: vi.fn(),
  grabConversationById: async () => ({ messages: [] }),
  grabConversationList: async () => [],
  makeConversation: async () => ({ id: 'c-test', subject: 'New chat' }),
}));

vi.mock('../src/agents/router.agent', () => ({
  sendToAgent: async () => ({ agentType: 'support', reply: 'ok' }),
}));

import { chatBook } from '../src/routes/chat';

// We test validation behavior only so tests remain fast and DB-free.
describe('Chat route validation', () => {
  it('returns 400 for empty content (validation)', async () => {
    const request = new Request('http://localhost/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });

    const response = await chatBook.fetch(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error');
  });

  it('returns 400 for missing content field', async () => {
    const request = new Request('http://localhost/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await chatBook.fetch(request);
    expect(response.status).toBe(400);
  });
});
