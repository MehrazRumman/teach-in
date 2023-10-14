import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Case, Default, Switch } from 'react-if';
import Instructions from '~/components/features/teaching/Instructions';
import MyWallet from '~/components/features/teaching/MyWallet';
import TeachingDashboard from '~/components/features/teaching/TeachingDashboard';
import TeachingSidebar from '~/components/features/teaching/TeachingSidebar';
import MainLayout from '~/components/layouts/MainLayout';
import CourseCreation from '~/components/partials/CourseCreation';
import CourseSummary from '~/components/partials/CourseSummary';
import QuestionSummary from '~/components/partials/QuestionSummary';
import { PATHS } from '~/constants';
import { trpc } from '~/utils/trpc';
import Head from '~/components/shared/Head';
import QuestionCreation from '~/components/partials/QuestionEdit';
import TestCreation from '~/components/partials/TestCreation';
import TestSummery from '~/components/partials/TestSummery';
import BookCreation from '~/components/partials/BookCreation';
import ArticleCreation from '~/components/partials/ArticleCreation';
import ArticleSummary from '~/components/partials/ArticleSummary';
import BookSummary from '~/components/partials/BookSummary';

const TeachingDashboardPage: NextPage = () => {
  const router = useRouter();

  const { data: courses, status } =
    trpc.user.findCoursesByInstructor.useQuery();

  return (
    <>
      <Head title="Resource Management- Teach-In" />

      <div className="relative min-h-screen text-gray-600 dark:text-white md:pl-[16rem]">
        <TeachingSidebar />

        <Switch>
          <Case
            condition={
              router.asPath.includes(PATHS.CREATE_BOOK) ||
              router.asPath.includes(PATHS.EDIT_BOOK)
            }
          >
            <BookCreation />
          </Case>

          <Case condition={router.asPath.includes(PATHS.COURSE)}>
            <CourseSummary />
          </Case>

          <Case condition={router.asPath.includes(PATHS.QUESTIONS)}>
            <QuestionSummary />
          </Case>
          <Case
            condition={
              router.asPath.includes(PATHS.CREATE_TEST) ||
              router.asPath.includes(PATHS.EDIT_TEST)
            }
          >
            <TestCreation />
          </Case>
          <Case condition={router.asPath.includes(PATHS.BOOK)}>
            <BookSummary />
          </Case>

          <Case condition={router.asPath.includes(PATHS.EDIT_QUESTION)}>
            <QuestionCreation />
          </Case>
          <Case
            condition={
              router.asPath.includes(PATHS.CREATE_ARTICLE) ||
              router.asPath.includes(PATHS.EDIT_ARTICLE)
            }
          >
            <ArticleCreation />
          </Case>

          <Case
            condition={
              router.asPath.includes(PATHS.CREATE_COURSE) ||
              router.asPath.includes(PATHS.EDIT_COURSE)
            }
          >
            <CourseCreation />
          </Case>

          <Case condition={router.asPath.includes(PATHS.ARTICLE)}>
            <ArticleSummary />
          </Case>

          <Case condition={router.asPath.includes(PATHS.TEST)}>
            <TestSummery />
          </Case>

          <Case condition={router.asPath.includes(PATHS.DASHBOARD)}>
            <TeachingDashboard courses={courses} status={status} />
          </Case>

          <Case condition={router.asPath.includes(PATHS.MY_WALLET)}>
            <MyWallet />
          </Case>

          <Case condition={router.asPath.includes(PATHS.INSTRUCTIONS)}>
            <Instructions />
          </Case>

          <Default>
            <TestSummery />
          </Default>
        </Switch>
      </div>
    </>
  );
};

TeachingDashboardPage.getLayout = (page: ReactNode) => {
  return <MainLayout>{page}</MainLayout>;
};

export default TeachingDashboardPage;
