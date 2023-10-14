import { router } from '../trpc';
import { authRouter } from './auth';
import { courseRouter } from './course';
import { questionRouter } from './question';
import { userRouter } from './user';
import { lectureRouter } from './lecture';
import { chatRouter } from './chat';
import { testRouter } from './test';
import { bookRouter } from './book';
import { articleRouter } from './article';

export const appRouter = router({
  auth: authRouter,
  course: courseRouter,
  lecture: lectureRouter,
  user: userRouter,
  chat: chatRouter,
  question: questionRouter,
  test: testRouter,
  book: bookRouter,
  article: articleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
