import { z } from 'zod';
import {
  MAPPING_COURSE_STATE_LANGUAGE,
  MAPPING_LEVEL_LANGUAGE,
} from '~/constants';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const articleRouter = router({
  findAllReviews: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { articleId } = input;

      const reviews = await ctx.prisma.review.findMany({
        where: { articleId },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    }),

  findArticlesByOwner: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      const articles = await ctx.prisma.article.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          slug: true,
          verified: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return { message: 'success', articles };
    }),

  findWaitingListArticles: protectedProcedure
    .input(
      z.object({
        verified: z.union([
          z.literal('APPROVED'),
          z.literal('PENDING'),
          z.literal('REJECT'),
        ]),
        published: z.boolean(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { published, verified, userId } = input;

      const conditions = { published, verified };

      if (userId) {
        Object.assign(conditions, { ...conditions, userId });
      }

      const articles = await ctx.prisma.article.findMany({
        where: conditions,
        include: {
          category: true,
          title: true,
          shortDescription: true,
          thumbnile: true,
          content: true,
        },
        orderBy: { updatedAt: 'asc' },
      });

      return articles;
    }),

  publishArticle: protectedProcedure
    .input(z.object({ published: z.boolean(), slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, published } = input;

      const article = await ctx.prisma.article.update({
        where: { slug },
        data: { published },
      });

      return article;
    }),

  findArticleBySlug: publicProcedure
    .input(z.object({ slug: z.string(), userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { slug } = input;

      const article = await ctx.prisma.article.findUnique({
        where: { slug },
        select: {
          id: true,
          category: true,
          title: true,
          thumbnail: true,
          publishMode: true,
          subCategory: true,
          content: true,
        },
      });

      return article;
    }),

  findArticlesByName: publicProcedure
    .input(z.object({ name: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const { name, limit } = input;

      const articles = await ctx.prisma.article.findMany({
        where: {
          content: {
            search: `*${name}*`,
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          addedBy: true,
          content: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return articles;
    }),
  findArticlesByFilters: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subCategory: z.string().optional(),
        sortBy: z.string().optional(),
        object: z.string().optional(),
        price: z.string().optional(),
        articleState: z.string().optional(),
        limit: z.number(),
        page: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        category,
        articleState,
        sortBy,
        object,
        price,
        limit,
        page,
        subCategory,
      } = input;

      const whereConditions = new Map();
      const sortCondition = new Map();
      sortCondition.set('createdAt', 'desc');
      if (subCategory && subCategory !== 'All') {
        whereConditions.set('subCategory', subCategory);
      }

      if (category && category !== 'All')
        whereConditions.set('category', { name: category });

      if (articleState) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const _articleState = MAPPING_COURSE_STATE_LANGUAGE[articleState]; // -> mapping to english value
        whereConditions.set('articleState', _articleState);
      }

      if (object) {
        // -> mapping to english value:
        const _object = MAPPING_LEVEL_LANGUAGE[object]; // -> mapping to english value

        whereConditions.set('articleLevel', _object);
      }

      if (price) {
        const stringPrice = price.toLowerCase();

        if (stringPrice.toLowerCase() === 'Free') {
          whereConditions.set('ArticlePrice', 0);
        }
        if (stringPrice.toLowerCase() === 'Paid') {
          whereConditions.set('articlePrice', { gt: 0 });
        }
      }

      if (sortBy) {
        const sort_by = sortBy.toLowerCase();
        if (sort_by === 'Popular') {
          sortCondition.set('createdAt', 'desc');
        }

        if (sort_by === 'rating') {
          sortCondition.set('reviews', { _count: 'desc' });
          whereConditions.set('reviews', { some: { id: { not: undefined } } });
        }

        if (sort_by === 'sell') {
          sortCondition.set('payments', { _count: 'desc' });
          whereConditions.set('payments', { some: { id: { not: undefined } } });
        }

        if (sort_by === 'registered') {
          sortCondition.set('students', { _count: 'desc' });
          whereConditions.set('students', { some: { id: { not: undefined } } });
        }
      }

      // ignore private article:
      whereConditions.set('publishMode', 'PUBLIC');
      // ignore pending apprev:
      whereConditions.set('verified', 'APPROVED');

      const [totalRecords, articles] = await ctx.prisma.$transaction([
        ctx.prisma.article.count({
          where: Object.fromEntries(whereConditions),
        }),
        ctx.prisma.article.findMany({
          where: Object.fromEntries(whereConditions),
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            addedBy: true,

            briefDescription: true,
          },
          orderBy: Object.fromEntries(sortCondition),
          take: limit,
          skip: (Number(page) - 1) * limit,
        }),
      ]);

      return { articles, totalPages: Math.ceil(totalRecords / limit) };
    }),
});
