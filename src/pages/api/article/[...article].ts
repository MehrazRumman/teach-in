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
    publishMode,
    content,
    userId,
  } = body;

  switch (method) {
    case 'POST':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const categoryDb = await createCategory(category);

      if (!categoryDb) return res.status(500).json({ message: 'Error' });

      //update article if non-exist:
      const articlePayload = {
        title,
        slug: slug(title),
        thumbnail,
        briefDescription,
        category: { connect: { id: categoryDb.id } },
        subCategory: category.subCategory,
        addedBy: { connect: { id: userId } },
        content,
        publishMode,
      };

      console.log(articlePayload);

      const article = await prisma.article.upsert({
        where: {
          title,
        },
        update: {
          ...articlePayload,
        },
        create: {
          ...articlePayload,
        },
      });

      return res.status(201).json({ message: 'success', article });
    case 'GET':
      const { article: articleParams } = query as { article: string[] };

      if (!Array.isArray(articleParams) && !articleParams[0]) throw new Error();

      const articlesResult = await prisma.article.findUnique({
        where: { title: articleParams[0] },
      });

      return res.status(200).json({ articlesResult: articlesResult });
    case 'DELETE':
      try {
        const { article: articleParams } = query as { article: string[] };

        const deletedArticle = await prisma.article.delete({
          where: { id: articleParams[0] },
        });

        return res.status(200).json({ message: 'success', deletedArticle });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to delete question' });
      }
    default:
      return res.status(404).json({ message: 'method invalidate' });
  }
};

export default article;
