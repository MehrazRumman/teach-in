import { PrismaClient } from '@prisma/client';
import { sendSMS } from '~/utils/sendSMS';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  const { orderId, newStatus, updateText, number, name } = req.body;

  try {
    const updatedOrder = await prisma.bookOrder.update({
      where: { id: orderId },
      data: { delivery_comment: newStatus, update: updateText },
    });

    await sendSMS(
      number,
      `Dear ${name}, Your Order state changed to - ${newStatus}. Message for You: ${updateText}. Track your order: https://teach-in.com/track_order/${orderId} `,
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status.' });
  }
}
