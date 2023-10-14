import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const testRouter = router({
  findTestsByOwner: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      const tests = await ctx.prisma.test.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          slug: true,
          verified: true,
          category: true,
          publishMode: true,
          order: true,
          isRunning: true,
          subCategory: true,
          questions: {
            select: {
              id: true,
            },
          },
        },

        orderBy: {
          order: 'asc',
        },
      });
      const testsWithQuestionCounts = tests.map((test) => ({
        ...test,
        questionCount: test.questions.length,
      }));

      return { message: 'success', tests: testsWithQuestionCounts };
    }),

  findWaitingListTests: protectedProcedure
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

      const tests = await ctx.prisma.test.findMany({
        where: conditions,
        include: {
          questions: {},
          testsParticipated: true,
          addedBy: true,
          category: true,
        },
        orderBy: { updatedAt: 'asc' },
      });

      return tests;
    }),

  deleteTest: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { testId } = input;

      await ctx.prisma.test.delete({
        where: { id: testId },
      });

      return 'success';
    }),

  verifyTest: protectedProcedure
    .input(
      z.object({
        verified: z.union([
          z.literal('APPROVED'),
          z.literal('PENDING'),
          z.literal('REJECT'),
        ]),
        tests: z.array(
          z.object({ testId: z.string(), instructorId: z.string() }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { tests, verified } = input;

      // create student for self instructor if non-exist:
      await ctx.prisma.$transaction(
        tests.map((c) => {
          return ctx.prisma.student.upsert({
            where: { userId: c.instructorId },
            update: { userId: c.instructorId },
            create: { userId: c.instructorId },
          });
        }),
      );

      const [testsRes] = await ctx.prisma.$transaction([
        ...tests.map((c) => {
          return ctx.prisma.test.update({
            where: { id: c.testId },
            data: {
              verified,
              testsParticipated: {
                connect: { userId: c.instructorId },
              },
            },
          });
        }),

        //update user role -> instructor
        // ...tests.map((c) => {
        //   return ctx.prisma.user.update({
        //     where: { id: c.instructorId },
        //     data: {
        //       role: 'INSTRUCTOR',
        //     },
        //   });
        // }),
      ]);

      return testsRes;
    }),

  enrollTest: protectedProcedure
    .input(z.object({ slug: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, userId } = input;

      const student = await ctx.prisma.student.upsert({
        where: { userId },
        update: { testsParticipated: { connect: [{ slug }] } },
        create: {
          userId,
          testsParticipated: { connect: [{ slug }] },
        },
      });

      return student;
    }),

  publishTest: protectedProcedure
    .input(z.object({ published: z.boolean(), slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, published } = input;

      const test = await ctx.prisma.test.update({
        where: { slug },
        data: { published },
      });

      return test;
    }),

  findTestBySlug: publicProcedure
    .input(z.object({ slug: z.string(), userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { slug, userId } = input;

      if (userId) {
        const test = await ctx.prisma.test.findUnique({
          where: { slug },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            questions: {
              orderBy: {
                order: 'asc', // Specify 'asc' for ascending order or 'desc' for descending order
              },
              select: {
                id: true,
                question: true,
                option1: true,
                option2: true,
                option3: true,
                option4: true,
                order: true,
                group: true,
                slug: true,
                correctOptionIndex: true,
                boardExams: true,
                tags: true,
                explanation: true,
              },
            },
            results: {
              where: { userId },
            },
          },
        });

        return test;
      } else {
        const test = await ctx.prisma.test.findUnique({
          where: { slug },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            questions: {
              orderBy: {
                order: 'asc', // Specify 'asc' for ascending order or 'desc' for descending order
              },
              select: {
                id: true,
                question: true,
                option1: true,
                option2: true,
                option3: true,
                option4: true,
                order: true,
                group: true,
                slug: true,
                correctOptionIndex: true,
                boardExams: true,
                tags: true,
                explanation: true,
              },
            },
          },
        });

        return test;
      }
    }),

  findTestResultsBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        userId: z.string().optional(),
        page: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { slug, page = 1 } = input;
      const resultsPerPage = 500;
      const skip = (page - 1) * resultsPerPage;

      const results = await ctx.prisma.result.findMany({
        where: {
          test: {
            slug,
          },
        },
        include: {
          user: true,
        },

        take: resultsPerPage, // Get only resultsPerPage records
        skip: skip, // Skip the records before the current page
        orderBy: [
          {
            totalMarks: 'desc',
          },
          {
            createdAt: 'asc',
          },
        ],
      });

      const test = await ctx.prisma.test.findUnique({
        where: { slug },
        select: {
          name: true,
        },
      });

      console.log(test);

      return {
        results,
        test,
      };
    }),
  findTestsByName: publicProcedure
    .input(z.object({ name: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const { name, limit } = input;

      const tests = await ctx.prisma.test.findMany({
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

      return tests;
    }),
  findTestsByFilters: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subCategory: z.string().optional(),
        section: z.string().optional(),
        sortBy: z.string().optional(),
        object: z.string().optional(),
        price: z.string().optional(),
        testState: z.string().optional(),
        userId: z.string().optional(),
        limit: z.number(),
        page: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        category,
        sortBy,
        price,
        limit,
        page,
        subCategory,
        section,
        userId,
      } = input;

      const whereConditions = new Map();
      const sortCondition = new Map();

      if (subCategory && subCategory !== 'All') {
        whereConditions.set('subCategory', subCategory);
      }

      if (category && category !== 'All')
        whereConditions.set('category', { name: category });

      if (category && category && section !== 'All') {
        whereConditions.set('section', section);
      }
      //TODO
      //Only Geomatry is Allowed
      // whereConditions.set('section', "জ্যামিতি");

      if (price) {
        const stringPrice = price.toLowerCase();

        if (stringPrice.toLowerCase() === 'free') {
          whereConditions.set('price', 0);
        }
        if (stringPrice.toLowerCase() === 'paid') {
          whereConditions.set('price', { gt: 0 });
        }
      }

      if (sortBy) {
        const sort_by = sortBy.toLowerCase();
        if (sort_by === 'Popular') {
          sortCondition.set('createdAt', 'desc');
        }

        if (sort_by === 'Questions') {
          sortCondition.set('questions', { _count: 'desc' });
          whereConditions.set('questions', {
            some: { id: { not: undefined } },
          });
        }

        if (sort_by === 'Parcipants') {
          sortCondition.set('results', { _count: 'desc' });
          whereConditions.set('results', { some: { id: { not: undefined } } });
        }
      } else {
        sortCondition.set('order', 'asc');
      }

      // ignore private test:
      whereConditions.set('publishMode', 'PUBLIC');
      // ignore pending apprev:
      // whereConditions.set('verified', 'APPROVED');

      const [totalRecords, tests] = await ctx.prisma.$transaction([
        ctx.prisma.test.count({ where: Object.fromEntries(whereConditions) }),
        ctx.prisma.test.findMany({
          where: Object.fromEntries(whereConditions),
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
              },
            },
            subCategory: true,
            section: true,
            //question count
            questions: {
              select: {
                id: true,
              },
            },
            //participant count

            results: {
              where: { userId: userId },
              select: {
                totalMarks: true,
                percentage: true,
                createdAt: true,
                totalQuestions: true,
              },
            },

            addedBy: {
              select: {
                id: true,
                name: true,
              },
            },
            price: true,
          },
          orderBy: Object.fromEntries(sortCondition),
          take: limit,
          skip: (Number(page) - 1) * limit,
        }),
      ]);

      return { tests, totalPages: Math.ceil(totalRecords / limit) };
    }),

  findContestsByFilters: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subCategory: z.string().optional(),
        section: z.string().optional(),
        sortBy: z.string().optional(),
        object: z.string().optional(),
        price: z.string().optional(),
        testState: z.string().optional(),
        userId: z.string().optional(),
        limit: z.number(),
        page: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        category,
        sortBy,
        price,
        limit,
        page,
        subCategory,
        section,
        userId,
      } = input;

      const whereConditions = new Map();
      const sortCondition = new Map();

      if (subCategory && subCategory !== 'All') {
        whereConditions.set('subCategory', subCategory);
      }

      if (category && category !== 'All')
        whereConditions.set('category', { name: category });

      if (category && category && section !== 'All') {
        whereConditions.set('section', section);
      }
      //TODO
      //Only Geomatry is Allowed
      // whereConditions.set('section', "জ্যামিতি");

      if (price) {
        const stringPrice = price.toLowerCase();

        if (stringPrice.toLowerCase() === 'free') {
          whereConditions.set('price', 0);
        }
        if (stringPrice.toLowerCase() === 'paid') {
          whereConditions.set('price', { gt: 0 });
        }
      }

      if (sortBy) {
        const sort_by = sortBy.toLowerCase();
        if (sort_by === 'Popular') {
          sortCondition.set('createdAt', 'desc');
        }

        if (sort_by === 'Questions') {
          sortCondition.set('questions', { _count: 'desc' });
          whereConditions.set('questions', {
            some: { id: { not: undefined } },
          });
        }

        if (sort_by === 'Parcipants') {
          sortCondition.set('results', { _count: 'desc' });
          whereConditions.set('results', { some: { id: { not: undefined } } });
        }
      } else {
        sortCondition.set('order', 'asc');
      }

      // ignore private test:
      whereConditions.set('publishMode', 'PUBLIC');
      whereConditions.set('contestMode', true);
      // ignore pending apprev:
      // whereConditions.set('verified', 'APPROVED');

      const [totalRecords, tests] = await ctx.prisma.$transaction([
        ctx.prisma.test.count({ where: Object.fromEntries(whereConditions) }),
        ctx.prisma.test.findMany({
          where: Object.fromEntries(whereConditions),
          select: {
            id: true,
            name: true,
            slug: true,
            contestMode: true,
            contestDuration: true,
            contestStart: true,
            contestEnd: true,
            category: {
              select: {
                name: true,
              },
            },
            subCategory: true,
            section: true,
            //question count
            questions: {
              select: {
                id: true,
              },
            },
            //participant count

            results: {
              where: { userId: userId },
              select: {
                totalMarks: true,
                percentage: true,
                createdAt: true,
                totalQuestions: true,
              },
            },

            addedBy: {
              select: {
                id: true,
                name: true,
              },
            },
            price: true,
          },
          orderBy: Object.fromEntries(sortCondition),
          take: limit,
          skip: (Number(page) - 1) * limit,
        }),
      ]);

      return { tests, totalPages: Math.ceil(totalRecords / limit) };
    }),
});
