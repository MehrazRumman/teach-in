import { prisma } from '../../server/db/client';

// need to clean up test 1-n targets because Prisma doesn't support upsetting many:
// https://stackoverflow.com/questions/70821501/how-to-upsert-many-fields-in-prisma-orm
export default async function cleanQuestionsByTest(testSlug: string) {
  try {
    await Promise.allSettled([
      await prisma.question.deleteMany({ where: { testSlug } }),
    ]);

    return true;
  } catch (error) {
    console.error('cleanTargets error: ', error);
    return false;
  }
}
