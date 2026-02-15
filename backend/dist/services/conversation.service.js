import { dataBridge } from '../db/client.js';
const grabConversationList = () => dataBridge.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
});
const grabConversationById = (conversationId) => dataBridge.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
});
const makeConversation = (subject) => dataBridge.conversation.create({
    data: { subject },
});
const dropConversation = (conversationId) => dataBridge.conversation.delete({ where: { id: conversationId } });
const addMessage = (conversationId, role, content, agentType) => dataBridge.message.create({
    data: { conversationId, role, content, agentType },
});
export { grabConversationList, grabConversationById, makeConversation, dropConversation, addMessage, };
