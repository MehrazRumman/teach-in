import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const question = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body, query } = req;

  const { question: questionParams } = query as { question: string[] };

  switch (method) {
    case 'PUT':
      try {
        const updatedQuestion = await prisma.question.update({
          where: { id: questionParams[0] },
          data: body,
        });
        return res.status(200).json(updatedQuestion);
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: 'Failed to update question ' + JSON.stringify(error),
        });
      }
    default:
      return res.status(404).json({ message: 'Invalid method' });

    case 'DELETE':
      try {
        const deletedQuestion = await prisma.question.delete({
          where: { id: questionParams[0] },
        });
        return res.status(200).json(deletedQuestion);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to delete question' });
      }
  }
};

export default question;
