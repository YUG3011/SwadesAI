import { dataBridge } from '../db/client';

const findOrderNumber = (userWords: string) => {
  const numberPick = userWords.match(/ORD-\d+/i);
  return numberPick ? numberPick[0].toUpperCase() : null;
};


const runOrderAgent = async (userWords: string) => {
  const orderNumber = findOrderNumber(userWords);

  if (!orderNumber) {
    return {
      reply: 'I can help with orders. Please share your order number (like ORD-1001).',
    };
  }

  const orderRecord = await dataBridge.order.findUnique({ where: { orderNumber } });

  if (!orderRecord) {
    return {
      reply: `I could not find ${orderNumber}. Please confirm the number or share the name on the order.`,
    };
  }

  return {
    reply: `Order ${orderRecord.orderNumber} is ${orderRecord.status}. Delivery state: ${orderRecord.deliveryStatus}.`,
  };
};

export { runOrderAgent };
