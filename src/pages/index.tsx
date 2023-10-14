import type { Category, Review } from '@prisma/client';
import type { GetStaticProps, NextPage } from 'next';
import Achievement from '~/components/partials/Achievement';
import Banner from '~/components/partials/Banner';
import PopularCourses from '~/components/partials/PopularCourses';
import TeacherBanner from '~/components/partials/TeacherBanner';
import TopCategories from '~/components/partials/TopCategories';
import Container from '~/components/shared/Container';
import { prisma } from '~/server/db/client';
import Head from '~/components/shared/Head';
import PopularTests from '~/components/partials/PopularTests';
import PopularBooks from '~/components/partials/PopularBooks';
import PopularArticles from '~/components/partials/PopularArticles';
import Search from '~/components/shared/Search';
import MyCourses from '~/components/partials/MyCourses';
import { useState } from 'react';
import Modal from '~/components/partials/Modal';
import { GiArtificialIntelligence } from 'react-icons/gi';
import { ChatBox } from '~/components/ai/chat-box';
import { RiArrowLeftRightFill } from 'react-icons/ri';
import UpcomingContests from '~/components/partials/UpcomingContests';

interface HomePageProps {
  topCategories: Category[];
  latestReviews: (Review & {
    Course: {
      slug: string;
    } | null;
  })[];
  totalCourses: number;
  totalTests: number;
  totalQuestions: number;
  totalStudents: number;
  totalInstructors: number;
  totalBooks: number;
  totalArticles: number;
}

const Home: NextPage<HomePageProps> = ({
  topCategories,
  totalCourses,
  totalTests,
  totalQuestions,
  totalStudents,
  totalBooks,
  totalArticles,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Head
        title={`Teach-In`}
        image={
          'https://teach-in.com/api/download/1696681328025_thumb%20(3)-min%20(1).jpg'
        }
        description={'Course, Tutors, Model Test, Articles in Teach-In '}
      />

      <div className="relative z-40 mx-auto mt-4 h-fit w-[95%] md:hidden">
        <Search />
      </div>

      <Container>
        <MyCourses />
      </Container>

      <Container>
        <PopularCourses />
      </Container>

      <Container>
        <UpcomingContests />
      </Container>

      <Container>
        <PopularTests />
      </Container>

      <Container>
        <PopularBooks />
      </Container>

      <Container>
        <PopularArticles />
      </Container>

      <Achievement
        totalCourses={totalCourses}
        totalTests={totalTests}
        totalQuestions={totalQuestions}
        totalStudents={totalStudents}
        totalBooks={totalBooks}
        totalArticles={totalArticles}
      />

      <Banner />

      <Container>
        <TeacherBanner />

        <TopCategories categories={topCategories} />

        {/* <Testimonial latestReviews={latestReviews} /> */}
      </Container>

      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="fixed bottom-8 right-8 flex flex-row items-center rounded-full bg-blue-500 px-6 py-4 text-4xl font-bold text-white shadow-2xl hover:bg-blue-800  "
      >
        <RiArrowLeftRightFill />

        <span>ASK AI</span>
      </button>

      {isOpen && (
        <Modal
          title={'Chat with Best AI Expert'}
          onClose={(e) => {
            setIsOpen(false);
          }}
        >
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <ChatBox />
          </div>
        </Modal>
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const getStaticProps: GetStaticProps = async () => {
  const [
    topCategories,
    totalCourses,
    totalTests,
    totalQuestions,
    totalStudents,
    totalBooks,
    totalArticles,
    latestReviews,
  ] = await prisma.$transaction([
    prisma.course.findMany({
      where: { students: { some: { id: { not: undefined } } } },
      select: {
        category: true,
      },
      distinct: ['categoryId'],
      take: 4,
      orderBy: { students: { _count: 'desc' } },
    }),
    prisma.course.count({
      where: { verified: 'APPROVED' },
    }),
    prisma.test.count(),
    prisma.question.count(),
    prisma.user.count(),
    prisma.book.count(),
    prisma.article.count(),
    prisma.review.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { Course: { select: { slug: true } }, author: true },
    }),
  ]);

  return {
    props: {
      topCategories: topCategories.map((e) => e.category),
      totalCourses,
      totalTests,
      totalQuestions,
      totalStudents,
      totalBooks,
      totalArticles,
      latestReviews: JSON.parse(JSON.stringify(latestReviews)),
    },
    revalidate: 60 * 60 * 6,
  };
};

export default Home;
