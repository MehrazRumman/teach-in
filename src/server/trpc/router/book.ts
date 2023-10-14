import { z } from 'zod';
import {
  MAPPING_COURSE_STATE_LANGUAGE,
  MAPPING_LEVEL_LANGUAGE,
} from '~/constants';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { sql } from '@prisma/client';
import { I } from '@excalidraw/excalidraw/types/ga';

export const bookRouter = router({
  findAnalysisData: protectedProcedure.query(async ({ ctx }) => {
    const [
      numberBooks,
      numberStudents,
      numberResources,
      numberTests,
      numberQuestions,
      totalBooks,
      totalPaidBook,
      topPaidBook,
    ] = await ctx.prisma.$transaction([
      ctx.prisma.book.count(),
      ctx.prisma.student.count(),
      ctx.prisma.resource.count(),
      ctx.prisma.test.count(),
      ctx.prisma.question.count(),
      ctx.prisma.book.findMany({
        where: { students: { some: { id: { not: undefined } } } },
        select: {
          students: true,
          category: true,
        },
      }),
      ctx.prisma.book.findMany({
        where: { payments: { some: { id: { not: undefined } } } },
        select: {
          bookPrice: true,
          payments: {
            where: { status: 'SUCCESS' },
            select: { id: true, createdAt: true },
          },
        },
      }),
      ctx.prisma.book.findMany({
        where: { bookPrice: { not: 0 } },
        select: { id: true, name: true, payments: true },
        orderBy: { payments: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      numberBooks,
      numberStudents,
      numberResources,
      numberTests,
      numberQuestions,
      totalBooks,
      totalPaidBook,
      topPaidBook,
    };
  }),

  findAllReviews: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { bookId } = input;

      const reviews = await ctx.prisma.review.findMany({
        where: { bookId },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    }),

  findBooksByOwner: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      const books = await ctx.prisma.book.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          bookPrice: true,
          createdAt: true,
          updatedAt: true,
          slug: true,
          verified: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return { message: 'success', books };
    }),

  findWaitingListBooks: protectedProcedure
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

      const books = await ctx.prisma.book.findMany({
        where: conditions,
        include: {
          category: true,
          students: true,
          payments: true,
          name: true,
          description: true,
          bookPrice: true,
          thumbnail: true,
        },
        orderBy: { updatedAt: 'asc' },
      });

      return books;
    }),

  enrollBook: protectedProcedure
    .input(z.object({ slug: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, userId } = input;

      const student = await ctx.prisma.student.upsert({
        where: { userId },
        update: { books: { connect: [{ slug }] } },
        create: {
          userId,
          books: { connect: [{ slug }] },
        },
      });

      return student;
    }),

  publishBook: protectedProcedure
    .input(z.object({ published: z.boolean(), slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, published } = input;

      const book = await ctx.prisma.book.update({
        where: { slug },
        data: { published },
      });

      return book;
    }),

  findOrdersByBook: protectedProcedure
    .input(
      z.object({
        page: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page = 1 } = input;
      const resultsPerPage = 100;
      const skip = (page - 1) * resultsPerPage;

      const orders = await ctx.prisma.bookOrder.findMany({
        include: {
          book: true,
        },
        take: resultsPerPage, // Get only resultsPerPage records
        skip: skip, // Skip the records before the current page
        orderBy: {
          createdAt: 'desc', // Order the results by totalMarks in descending order
        },
      });

      return {
        orders,
      };
    }),

  findBookBySlug: publicProcedure
    .input(z.object({ slug: z.string(), userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { slug } = input;

      const book = await ctx.prisma.book.findUnique({
        where: { slug },
        include: {
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 4,
            include: { author: true },
          },
          students: true,
          addedBy: true,
          category: true,
          Wishlist: true,
          Cart: true,
          payments: true,
          promoCodes: true,
          _count: true,
        },
      });

      return book;
    }),

  findDirectBuyInfo: publicProcedure
    .input(
      z.object({
        bookSlug: z.string().optional(),
        courseSlug: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { bookSlug, userId, courseSlug } = input;

      let user;

      let book;

      let course;

      if (bookSlug) {
        book = await ctx.prisma.book.findUnique({
          where: { slug: bookSlug },
          include: {
            addedBy: true,
            category: true,
            Wishlist: true,
            Cart: true,
            payments: true,
            promoCodes: true,
            _count: true,
          },
        });
      }

      if (courseSlug) {
        course = await ctx.prisma.course.findUnique({
          where: { slug: courseSlug },
          include: {
            chapters: true,
            category: true,
            Wishlist: true,
            promoCodes: true,
          },
        });
      }

      if (userId) {
        user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            number: true,
            image: true,
            address: true,
            district: true,
            division: true,
            upazila: true,
          },
        });
      }

      return { book, user, course };
    }),

  findBookId: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { id, userId } = input;

      if (id && userId) {
        const data = await ctx.prisma.book.findMany({
          where: {
            id: id,
          },
          include: {
            students: {
              where: {
                userId: userId,
              },
            },
          },
        });

        const book = data[0];

        if (book?.isFreePdf) {
          return book;
        }

        if (book && book.students.length < 1) {
          return null;
        }

        if (
          book &&
          book.students &&
          book.students[0] &&
          book.students[0].userId === userId
        ) {
          return book;
        }

        return null;
      }
      return null;
    }),

  findBooksByName: publicProcedure
    .input(z.object({ name: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const { name, limit } = input;

      const books = await ctx.prisma.book.findMany({
        where: {
          name: {
            search: `*${name}*`,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          addedBy: true,
          thumbnail: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return books;
    }),
  findBooksByFilters: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subCategory: z.string().optional(),
        sortBy: z.string().optional(),
        object: z.string().optional(),
        price: z.string().optional(),
        bookState: z.string().optional(),
        limit: z.number(),
        page: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        category,
        bookState,
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

      if (bookState) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const _bookState = MAPPING_COURSE_STATE_LANGUAGE[bookState]; // -> mapping to english value
        whereConditions.set('bookState', _bookState);
      }

      if (object) {
        // -> mapping to english value:
        const _object = MAPPING_LEVEL_LANGUAGE[object]; // -> mapping to english value

        whereConditions.set('bookLevel', _object);
      }

      if (price) {
        const stringPrice = price.toLowerCase();

        if (stringPrice.toLowerCase() === 'Free') {
          whereConditions.set('BookPrice', 0);
        }
        if (stringPrice.toLowerCase() === 'Paid') {
          whereConditions.set('bookPrice', { gt: 0 });
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

      // ignore private book:
      whereConditions.set('publishMode', 'PUBLIC');
      // ignore pending apprev:
      whereConditions.set('verified', 'APPROVED');

      const [totalRecords, books] = await ctx.prisma.$transaction([
        ctx.prisma.book.count({ where: Object.fromEntries(whereConditions) }),
        ctx.prisma.book.findMany({
          where: Object.fromEntries(whereConditions),
          select: {
            id: true,
            name: true,
            slug: true,
            addedBy: true,
            author: true,
            showName: true,
            briefDescription: true,
            thumbnail: true,
            bookPrice: true,
          },
          orderBy: Object.fromEntries(sortCondition),
          take: limit,
          skip: (Number(page) - 1) * limit,
        }),
      ]);

      return { books, totalPages: Math.ceil(totalRecords / limit) };
    }),
});
