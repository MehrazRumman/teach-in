import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';
import createCategory from '~/server/helper/createCategory';
import slug from 'slug';
import cleanTargetsAndRequirements from '~/server/helper/cleanTargetsAndRequirements';
import type { Book } from '@prisma/client';

const book = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body, query } = req;

  const {
    category,
    name,
    thumbnail,
    briefDescription,
    publishMode,
    bookPrice,
    detailDescription,
    userId,
    features,
    stock,
    edition,
    pages,
    author,
    publisher,
    topics,
    fileLink,
    pdfFileLink,
    isPdfAvailable,
    isFreePdf,
    published,
  } = body as Book;

  switch (method) {
    case 'POST':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore

      const categoryDb = await createCategory(category);

      if (!categoryDb) return res.status(500).json({ message: 'Error' });

      // Clean everything before making new ones.
      await Promise.allSettled([await cleanTargetsAndRequirements(slug(name))]);

      //update book if non-exist:
      const bookPayload = {
        name,
        thumbnail,
        slug: slug(name),
        fileLink,
        pdfFileLink,
        briefDescription,
        category: { connect: { id: categoryDb.id } },
        subCategory: category?.subCategory,
        addedBy: { connect: { id: userId } },
        features,
        stock: Number(stock),
        edition,
        pages: Number(pages),
        author,
        publisher,
        isPdfAvailable,
        isFreePdf,
        topics,
        detailDescription,
        publishMode,
        bookPrice: Number(bookPrice),
        published,
      };

      const book = await prisma.book.upsert({
        where: {
          name,
        },
        update: {
          ...bookPayload,
        },
        create: {
          ...bookPayload,
        },
      });

      return res.status(201).json({ message: 'success', book });
    case 'GET':
      const { book: bookParams } = query as { book: string[] };

      if (!Array.isArray(bookParams) && !bookParams[0]) throw new Error();

      const booksResult = await prisma.book.findUnique({
        where: { name: bookParams[0] },
      });

      return res.status(200).json({ booksResult: booksResult });

    default:
      return res.status(404).json({ message: 'method invalidate' });
  }
};

export default book;
