import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  const { slug, publishMode, isRunning } = req.body;

  try {
    const updatedOrder = await prisma.test.update({
      where: { slug: slug },
      data: { publishMode: publishMode, isRunning: isRunning },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating test status.' });
  }
}
