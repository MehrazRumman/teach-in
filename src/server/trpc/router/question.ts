import { z } from 'zod';
import exclude from '~/server/helper/excludeFields';

import { protectedProcedure, publicProcedure, router } from '../trpc';

export const questionRouter = router({
  findAnalysisData: protectedProcedure.query(async ({ ctx }) => {
    const [numberquestions, numberStudents, totalquestions] =
      await ctx.prisma.$transaction([
        ctx.prisma.question.count(),
        ctx.prisma.student.count(),

        ctx.prisma.question.findMany({
          select: {},
        }),
        ctx.prisma.question.findMany({
          take: 10,
        }),
      ]);

    return {
      numberquestions,
      numberStudents,
      totalquestions,
    };
  }),

  findquestionsByOwner: protectedProcedure
    .input(z.object({ userId: z.string(), name: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      const { name } = input;
      let x = {
        userId,
      };
      if (name) {
        x = {
          userId,
          question: {
            search: name,
          },
        };
      }
      const questions = await ctx.prisma.question.findMany({
        where: x,
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      return { message: 'success', questions };
    }),

  findQuestionBySlug: publicProcedure
    .input(z.object({ slug: z.string(), userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { slug } = input;

      const question = await ctx.prisma.question.findUnique({
        where: { slug },
      });
      return question;
    }),

  verifyquestion: protectedProcedure
    .input(
      z.object({
        verified: z.union([
          z.literal('APPROVED'),
          z.literal('PENDING'),
          z.literal('REJECT'),
        ]),},
            update: { userId: c.instructorId },
            create: { userId: c.instructorId },
          });
        }),
      );

      const [questionsRes] = await ctx.prisma.$transaction([
        ...questions.map((c) => {
          return ctx.prisma.question.update({
            where: { id: c.questionId },
            data: {
              verified,
            },
          });
        }),
      ]);

      return questionsRes;
    }),

  enrollQuestion: protectedProcedure
    .input(z.object({ slug: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, userId } = input;

      const student = await ctx.prisma.student.upsert({
        where: { userId },
        update: { questionAnswred: { connect: [{ slug }] } },
        create: {
          userId,
          questionAnswred: { connect: [{ slug }] },
        },
      });

      return student;
    }),

  publishQuestion: protectedProcedure
    .input(z.object({ published: z.boolean(), slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { slug, published } = input;

      const question = await ctx.prisma.question.update({
        where: { slug },
        data: { published },
      });

      return question;
    }),

      return question;
    }),
});
