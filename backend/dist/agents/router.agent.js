import pkg from '@prisma/client';
const { AgentKind, PrismaClient } = pkg; // destructure what you need
import { runSupportAgent } from './support.agent.js';
import { runOrderAgent } from './order.agent.js';
import { runBillingAgent } from './billing.agent.js';
const senseIntent = (userWords) => {
    const lowerWords = userWords.toLowerCase();
    if (lowerWords.match(/order|track|shipping|delivery|package/)) {
        return AgentKind.order;
    }
    if (lowerWords.match(/bill|invoice|payment|refund|charge/)) {
        return AgentKind.billing;
    }
    return AgentKind.support;
};
const sendToAgent = async (userWords, storyTrail) => {
    const chosenAgent = senseIntent(userWords);
    if (chosenAgent === AgentKind.order) {
        const outcome = await runOrderAgent(userWords);
        return { agentType: AgentKind.order, reply: outcome.reply };
    }
    if (chosenAgent === AgentKind.billing) {
        const outcome = await runBillingAgent(userWords);
        return { agentType: AgentKind.billing, reply: outcome.reply };
    }
    const supportReply = runSupportAgent(userWords, storyTrail);
    return { agentType: AgentKind.support, reply: supportReply };
};
export { sendToAgent, senseIntent };
