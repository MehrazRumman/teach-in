import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';
import createCategory from '~/server/helper/createCategory';
import slug from 'slug';

const article = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body, query } = req;

  const {
    category,
    thumbnail,
    title,
    briefDescription,