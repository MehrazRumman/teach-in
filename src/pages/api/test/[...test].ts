import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '../../../server/db/client';
import createCategory from '~/server/helper/createCategory';
import type { Question, Result } from '@prisma/client';
import cleanQuestionsByTest from '~/server/helper/cleanQuestionAndOption';
import slugConvert from 'slug';
import { toFloat } from 'radash';

const test = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body, query } = req;
  const {
    category,
    subCategory,
    name,
    showName,
    order,
    section,
    testId,
    thumbnail,
    publishMode,
    password,
    testPrice,
    questions,
    published,
    userId,
    markPerQuestion,
    markReducePerQuestion,
    timePerQuestion,
  } = body;

  switch (method) {
    case 'POST':
      // console.log('DDDDDAAAAAAAAAATTTTTTTTTTTTTTTTTTAAAAAAAAAAAAAAAAA');
      // console.log(showName);
      // console.log(subCategory);
      // console.log(section);
      // console.log(name);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore

      category.subCategory = subCategory;

      const categoryDb = await createCategory(category);

      if (!categoryDb) return res.status(500).json({ message: 'Error' });

      const slugName = slugConvert(name);

      await Promise.allSettled([await cleanQuestionsByTest(slugName)]);

      // Update test if non-existent:
      const testPayload = {
        name,
        showName,
        thumbnail,
        order: Number(order),
        slug: slugName,
        category: { connect: { id: categoryDb.id } },
        subCategory: subCategory,
        addedBy: { connect: { id: userId } },
        password,
        section: section,
        publishMode: publishMode.toUpperCase(),
        published,
        price: Number(testPrice || 0),
        markPerQuestion: toFloat(markPerQuestion),
        markReducePerQuestion: toFloat(markReducePerQuestion),
        timePerQuestion: toFloat(timePerQuestion),
      };

      const test = await prisma.test.upsert({
        where: {
          name,
        },
        update: {
          ...testPayload,
          addedBy: { connect: { id: userId } },
          questions: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            upsert: questions.map((question) => ({
              where: { id: `${slugName}_${question.order}` },
              update: {
                addedBy: { connect: { id: userId } },
                category: { connect: { id: categoryDb.id } },
                subCategory: subCategory,
                testSlug: slugName,
                question: question.question,
                order: question.order,
                group: Number(question.group) || 0,
                option1: question.option1,
                option2: question.option2,
                option3: question.option3,
                option4: question.option4,
                option5: question.option5,
                explanation: question.explanation,
                boardExams: question.boardExams || undefined,
                tags: question.tags || undefined,
                correctOptionIndex: question.correctOptionIndex,
                slug: `${slugName}_${question.order}`,
              },
              create: {
                addedBy: { connect: { id: userId } },
                category: { connect: { id: categoryDb.id } },
                subCategory: subCategory,
                testSlug: slugName,
                question: question.question,
                explanation: question.explanation,
                order: question.order,
                group: Number(question.group) || 0,
                id: `${slugName}_${question.order}`,
                option1: question.option1,
                option2: question.option2,
                option3: question.option3,
                option4: question.option4,
                option5: question.option5,
                boardExams: question.boardExams || undefined,
                tags: question.tags || undefined,
                correctOptionIndex: question.correctOptionIndex,
                slug: `${slugName}_${question.order}`,
              },
            })),
          },
        },
        create: {
          ...testPayload,
          questions: {
            create: questions.map((question: Question) => ({
              addedBy: { connect: { id: userId } },
              category: { connect: { id: categoryDb.id } },
              subCategory: subCategory,
              testSlug: slugName,
              question: question.question,
              explanation: question.explanation,
              order: question.order,
              group: Number(question.group) || 0,
              id: `${slugName}_${question.order}`,
              option1: question.option1,
              option2: question.option2,
              option3: question.option3,
              option4: question.option4,
              option5: question.option5,
              correctOptionIndex: question.correctOptionIndex,
              slug: `${slugName}_${question.order}`,
            })),
          },
        },
      });

      return res.status(201).json({ message: 'success', test });

    case 'GET':
      const { test: testParams } = query as { test: string[] };

      if (!Array.isArray(testParams) && !testParams[0]) throw new Error();

      const testsResult = await prisma.test.findUnique({
        where: { name: testParams[0] },
        include: {
          results: true, // Include test results
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      //const testsResultWithoutPassword = exclude(testsResult, ['password']);

      return res.status(200).json({ testsResult: testsResult });

    case 'PUT':
      const {
        totalQuestions,
        totalAttempted,
        totalCorrect,
        totalWrong,
        totalMarks,
        percentage,
        selectedOptionIndexes,
        slug,
        experience,
      } = body as Result;

      if (experience) {
        try {
          const updateResult = await prisma.result.update({
            where: {
              id: `${testId}_${userId}`,
            },
            data: {
              experience,
            },
          });
          return res
            .status(201)
            .json({ message: 'success', result: updateResult });
        } catch (error) {
          return res.status(500).json({ message: error?.message });
        }
      } else {
        try {
          const newResult = await prisma.result.upsert({
            where: {
              id: `${testId}_${userId}`,
            },
            update: {
              totalQuestions,
              totalAttempted,
              totalCorrect,
              totalWrong,
              totalMarks,
              percentage,
              slug,
              selectedOptionIndexes: JSON.stringify(selectedOptionIndexes),
            },
            create: {
              id: `${testId}_${userId}`,
              test: { connect: { id: testId } },
              user: { connect: { id: userId } },
              totalQuestions,
              totalAttempted,
              totalCorrect,
              totalWrong,
              totalMarks,
              percentage,
              slug,
              selectedOptionIndexes: JSON.stringify(selectedOptionIndexes),
            },
          });
          return res
            .status(201)
            .json({ message: 'success', result: newResult });
        } catch (error) {
          return res.status(500).json({ message: error?.message });
        }
      }

    case 'DELETE':
      try {
        const { test: testParams } = query as { test: string[] };

        const deletedResults = await prisma.result.deleteMany({
          where: {
            test: {
              id: testParams[0],
            },
          },
        });

        const deletedQuestions = await prisma.question.deleteMany({
          where: {
            testSlug: testParams[0],
          },
        });

        const deletedTest = await prisma.test.delete({
          where: { id: testParams[0] },
        });

        return res.status(200).json({
          message: 'success',
          deletedTest,
          deletedResults,
          deletedQuestions,
        });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to delete question' });
      }
  }
};

export default test;
