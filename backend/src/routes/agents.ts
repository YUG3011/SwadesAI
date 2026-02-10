import { Hono } from 'hono';
import { AgentKind } from '@prisma/client';

const agentCatalog = [
  {
    type: AgentKind.support,
    title: 'Support Agent',
    notes: ['FAQs', 'troubleshooting', 'general help'],
  },
  {
    type: AgentKind.order,
    title: 'Order Agent',
    notes: ['order status', 'tracking', 'cancellations'],
  },
  {
    type: AgentKind.billing,
    title: 'Billing Agent',
    notes: ['payments', 'refunds', 'invoices'],
  },
];

const agentBook = new Hono();

agentBook.get('/', (context) => context.json({ agents: agentCatalog }));

agentBook.get('/:type/capabilities', (context) => {
  const requestedType = context.req.param('type');
  const foundAgent = agentCatalog.find((item) => item.type === requestedType);

  if (!foundAgent) {
    return context.json({ error: 'Unknown agent type' }, 404);
  }

  return context.json({ agent: foundAgent });
});

export { agentBook };
