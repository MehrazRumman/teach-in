import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  const { paymentId, newState } = req.body;

  try {
    const updatedOrder = await prisma.payment.update({
      where: { id: paymentId },
      data: { state: newState },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating payment status.' });
  }
}
