import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { streamText } from 'hono/streaming';
import pkg from '@prisma/client';
import {
  addMessage,
  dropConversation,
  grabConversationById,
  grabConversationList,
  makeConversation,
} from '../services/conversation.service.js';
import { sendToAgent } from '../agents/router.agent.js';
import { compactHistory } from '../services/compactor.js';

const { AgentKind } = pkg;

const messageShape = z.object({
  conversationId: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().min(1),
});

const chatBook = new Hono();


chatBook.get('/conversations', async (context) => {
  const rows = await grabConversationList();
  return context.json({ conversations: rows });
});



chatBook.get('/conversations/:id', async (context) => {
  const wantedId = context.req.param('id');
  const foundConversation = await grabConversationById(wantedId);

  if (!foundConversation) {
    return context.json({ error: 'Conversation not found' }, 404);
  }

  return context.json({ conversation: foundConversation });
});



chatBook.delete('/conversations/:id', async (context) => {
  const wantedId = context.req.param('id');
  await dropConversation(wantedId);
  return context.json({ removed: true });
});




chatBook.post('/messages', zValidator('json', messageShape), async (context) => {
  const body = context.req.valid('json');
  let activeConversationId = body.conversationId;

  if (!activeConversationId) {
    const subject = body.subject ?? 'New chat';
    const freshConversation = await makeConversation(subject);
    activeConversationId = freshConversation.id;
  }

  await addMessage(activeConversationId, 'user', body.content);

  const story = await grabConversationById(activeConversationId);
  const historyTrail = compactHistory(story?.messages ?? []);

  const agentOutcome = await sendToAgent(body.content, historyTrail);

  await addMessage(activeConversationId, 'agent', agentOutcome.reply, agentOutcome.agentType);

  const replyLines = agentOutcome.reply.split(/(?<=[.!?])\s+/);
  const thinkingNotes = ['thinking', 'searching', 'checking details'];

  return streamText(context, async (writer) => {
    await writer.write(
      JSON.stringify({ conversationId: activeConversationId, agentType: agentOutcome.agentType, thinking: thinkingNotes }),
    );
    for (const line of replyLines) {
      await writer.write('\n');
      await writer.write(line);
    }
  });
});

export { chatBook };
