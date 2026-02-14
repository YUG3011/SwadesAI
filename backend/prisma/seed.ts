import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const dataKeeper = new PrismaClient();

async function fillDemo() {
  await dataKeeper.message.deleteMany();
  await dataKeeper.conversation.deleteMany();
  await dataKeeper.refund.deleteMany();
  await dataKeeper.invoice.deleteMany();
  await dataKeeper.order.deleteMany();

  const firstOrder = await dataKeeper.order.create({
    data: {
      orderNumber: 'ORD-1001',
      status: 'processing',
      deliveryStatus: 'on the way',
      customerName: 'Alex Rivers',
    },
  });

  const secondOrder = await dataKeeper.order.create({
    data: {
      orderNumber: 'ORD-1002',
      status: 'delivered',
      deliveryStatus: 'left at front door',
      customerName: 'Jamie Lake',
    },
  });

  const firstInvoice = await dataKeeper.invoice.create({
    data: {
      invoiceNumber: 'INV-9001',
      orderId: firstOrder.id,
      amountCents: 12900,
      currency: 'USD',
      paid: false,
    },
  });

  const secondInvoice = await dataKeeper.invoice.create({
    data: {
      invoiceNumber: 'INV-9002',
      orderId: secondOrder.id,
      amountCents: 7600,
      currency: 'USD',
      paid: true,
    },
  });

  await dataKeeper.refund.create({
    data: {
      invoiceId: secondInvoice.id,
      status: 'approved',
      reason: 'package damaged',
    },
  });

  const welcomeChat = await dataKeeper.conversation.create({
    data: {
      subject: 'Getting started help',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Hi, I need help with my order shipping time.',
          },
          {
            role: 'agent',
            content: 'Sure, I can check your order status. Do you have the order number?',
            agentType: 'support',
          },
        ],
      },
    },
    include: { messages: true },
  });

  console.log('Seeded demo data', { firstOrder, secondOrder, firstInvoice, secondInvoice, welcomeChat });
}

fillDemo()
  .catch((errorNote) => {
    console.error(errorNote);
    process.exit(1);
  })
  .finally(async () => {
    await dataKeeper.$disconnect();
  });
