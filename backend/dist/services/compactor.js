import { MessageRole } from '@prisma/client';
const defaultSettings = {
    maxMessages: 18,
    preserveRecent: 8,
    snippetLength: 160,
};
const shorten = (text, limit) => {
    if (text.length <= limit) {
        return text;
    }
    return `${text.slice(0, limit - 3)}...`;
};
const roleLabel = {
    user: 'Customer',
    agent: 'Agent',
    system: 'System',
};
const summarizeMessages = (messages, snippetLength) => {
    const lines = messages.map((message) => {
        const label = roleLabel[message.role];
        return `${label}: ${shorten(message.content.replace(/\s+/g, ' ').trim(), snippetLength)}`;
    });
    if (!lines.length) {
        return 'Earlier context was empty.';
    }
    return `Earlier context summary — ${lines.join(' | ')}`;
};
const compactHistory = (messages, options) => {
    const settings = { ...defaultSettings, ...options };
    if (messages.length <= settings.maxMessages) {
        return messages;
    }
    const preserveCount = Math.min(settings.preserveRecent, settings.maxMessages);
    const recentSlice = messages.slice(-preserveCount);
    const historySlice = messages.slice(0, messages.length - recentSlice.length);
    const summaryContent = summarizeMessages(historySlice, settings.snippetLength);
    const conversationId = messages[0]?.conversationId ?? 'virtual';
    const summaryMessage = {
        id: `summary-${conversationId}-${Date.now()}`,
        conversationId,
        role: MessageRole.system,
        content: summaryContent,
        agentType: null,
        createdAt: historySlice.at(-1)?.createdAt ?? new Date(),
    };
    return [summaryMessage, ...recentSlice];
};
export { compactHistory };
