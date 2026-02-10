import { dataBridge } from '../db/client';

const findInvoiceNumber = (userWords: string) => {
  const numberPick = userWords.match(/INV-\d+/i);
  return numberPick ? numberPick[0].toUpperCase() : null;
};

const runBillingAgent = async (userWords: string) => {
  const invoiceNumber = findInvoiceNumber(userWords);

  if (!invoiceNumber) {
    return {
      reply: 'I can help with billing. Share your invoice number (like INV-9001) or describe the issue.',
    };
  }

  const invoiceRecord = await dataBridge.invoice.findUnique({
    where: { invoiceNumber },
    include: { refund: true, order: true },
  });

  if (!invoiceRecord) {
    return {
      reply: `I could not find ${invoiceNumber}. Please double-check the invoice number.`,
    };
  }

  const refundNote = invoiceRecord.refund
    ? `Refund status: ${invoiceRecord.refund.status} (reason: ${invoiceRecord.refund.reason}).`
    : 'No refund request on this invoice.';

  return {
    reply: `Invoice ${invoiceRecord.invoiceNumber} for order ${invoiceRecord.order.orderNumber} is ${invoiceRecord.paid ? 'paid' : 'unpaid'}. Amount: ${invoiceRecord.amountCents / 100} ${invoiceRecord.currency}. ${refundNote}`,
  };
};

export { runBillingAgent };
