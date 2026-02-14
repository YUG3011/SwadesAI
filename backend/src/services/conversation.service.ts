import { AgentKind, MessageRole } from '@prisma/client';
import { dataBridge } from '../db/client.js';

const grabConversationList = () =>
  dataBridge.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

const grabConversationById = (conversationId: string) =>
  dataBridge.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

const makeConversation = (subject: string) =>
  dataBridge.conversation.create({
    data: { subject },
  });

const dropConversation = (conversationId: string) =>
  dataBridge.conversation.delete({ where: { id: conversationId } });

const addMessage = (conversationId: string, role: MessageRole, content: string, agentType?: AgentKind) =>
  dataBridge.message.create({
    data: { conversationId, role, content, agentType },
  });

export {
  grabConversationList,
  grabConversationById,
  makeConversation,
  dropConversation,
  addMessage,
};
