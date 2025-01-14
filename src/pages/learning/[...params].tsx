import type { NextPage } from 'next';
import dateFormat from 'dateformat';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import CourseContentCollapse from '~/components/features/learning/CourseContentCollapse';
import CourseContentsBar from '~/components/features/learning/CourseContentsBar';
import LearningBody from '~/components/features/learning/LearningBody';
import LearningHeader from '~/components/features/learning/LearningHeader';
import ListNoteModal from '~/components/features/note/ListNoteModal';
import MainLayout from '~/components/layouts/MainLayout';
import BlankLearningPage from '~/components/shared/BlankLearningPage';
import Head from '~/components/shared/Head';
import { PATHS } from '~/constants';
import { LearningContextProvider } from '~/contexts/LearningContext';
import useSocket from '~/contexts/SocketContext';
import { prisma } from '~/server/db/client';
import { trpc } from '~/utils/trpc';

import type { ReactNode } from 'react';
import type { CourseType, Progress } from '~/types';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import Modal from '~/components/partials/Modal';
import { MdNotificationsPaused } from 'react-icons/md';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface LearningPageProps {
  studentsEnrolled: { id: string; userId: string }[];
}

const LearningPage: NextPage<LearningPageProps> = ({ studentsEnrolled }) => {
  const router = useRouter();
  const socketCtx = useSocket();
  const isClient = useIsClient();
  const { data: session } = useSession();
  const isEmitted = useRef(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const courseSlug = useMemo(() => {
    if (router.query.params?.length) {
      return router.query.params[0];
    }

    return '';
  }, [router.query]);

  const { data: course, isSuccess } = trpc.course.findCourseBySlug.useQuery(
    {
      slug: courseSlug as string,
    },
    {
      enabled: studentsEnrolled.some(
        (student) => student.userId === session?.user?.id,
      ),
    },
  );

  const {
    mutate: updateProgress,
    isSuccess: isSuccessUpdateProgress,
    isLoading: isLoadingUpdateProgress,
  } = trpc.lecture.updateProgress.useMutation();

  const {
    data: studentProgress,
    isLoading: isLoadingProgress,
    refetch: refetchProgress,
  } = trpc.lecture.findProgressByStudent.useQuery(
    {
      userId: session?.user?.id as string,
      courseSlug: router.query.params ? String(router.query.params[0]) : '',
    },
    { enabled: !!session?.user?.id },
  );

  const progressByCourse = useMemo<Progress[]>(() => {
    if (router.query.params && router.query.params.length > 0) {
      const courseSlug = router.query.params[0];
      const progressBCourse = studentProgress?.progress.find(
        (course) => course.courseSlug === courseSlug,
      );

      if (progressBCourse) return progressBCourse.Lecture;
    }
    return [];
  }, [studentProgress]);

  // This value serves to determine the next lecture to be unlocked
  const allLecturesByChapters = useMemo(() => {
    if (course?.chapters) {
      return course.chapters.reduce((acc, chapter) => {
        return acc.concat(
          chapter.lectures.reduce((acc, lecture) => {
            return acc.concat(lecture);
          }, []),
        );
      }, []);
    }
    return [];
  }, [course]);

  const isValidLecture = useMemo(() => {
    if (
      router.query.params &&
      router.query.params.length > 1 &&
      router.query.params[1]
    ) {
      const lectureId = router.query.params[1];

      const currentIdx = allLecturesByChapters.findIndex(
        (lc) => lc.id === lectureId,
      );

      if (currentIdx && currentIdx !== 0) {
        const prevLecture = allLecturesByChapters[currentIdx - 1];

        if (
          prevLecture &&
          !studentProgress?.progress[0]?.Lecture.some(
            (lc) => lc.id === prevLecture?.id,
          )
        ) {
          return false;
        }
      }

      return true;
    }
  }, [allLecturesByChapters, studentProgress, router.query]);

  useEffect(() => {
    if (socketCtx?.connected && session?.user?.id && !isEmitted.current) {
      socketCtx.socket.emit('start learning', {
        userId: session?.user?.id,
        date: dateFormat(new Date(), 'yyyy-mm-dd'),
      });

      isEmitted.current = true;
    }

    return () => {
      if (socketCtx?.connected && session?.user?.id && isEmitted.current) {
        socketCtx.socket.emit('stop learning', {
          userId: session?.user?.id,
          date: dateFormat(new Date(), 'yyyy-mm-dd'),
        });
      }
    };
  }, [socketCtx?.connected, session]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    if (
      router.query.params &&
      router.query.params.length > 1 &&
      studentProgress?.id
    ) {
      const courseSlug = router.query.params[0];
      const lectureId = router.query.params[1];
      if (!courseSlug || !lectureId || !isValidLecture) return;

      updateProgress({
        userId,
        courseSlug,
        lectureId,
        studentId: studentProgress?.id,
      });
    }
  }, [router.query, session?.user, studentProgress, isValidLecture]);

  useEffect(() => {
    if (isSuccessUpdateProgress) {
      refetchProgress();
    }
  }, [isSuccessUpdateProgress]);

  const handleNavigateLecture = useCallback(
    (lectureId: string) => {
      if (!course?.slug) return;

      router.replace(
        `/${PATHS.LEARNING}/${course.slug}/${lectureId}`,
        undefined,
        { shallow: true },
      );
    },
    [progressByCourse, course],
  );

  if (!course && isClient && isSuccess) {
    router.push('/404');
    return null;
  }

  // check user cheat on lecture path or not enroll yet
  if (
    (session?.user &&
      !studentsEnrolled.some(
        (student) => student.userId === session?.user?.id,
      )) ||
    (!isValidLecture && (!isLoadingProgress || !isLoadingUpdateProgress))
  ) {
    return <BlankLearningPage />;
  }

  function joinZoomClass() {
    toast.error('লাইভ ক্লাস এখনো শুরু হয়নি');
  }

  return (
    <>
      <Head title="Study- Teach-In" />
      <MathJaxContext>
        <LearningContextProvider
          course={course}
          allLecturesByChapters={allLecturesByChapters}
        >
          <ListNoteModal />
          <div className="flex min-h-screen flex-col text-gray-600 dark:text-white/60">
            {course && (
              <>
                <CourseContentsBar>
                  {course?.chapters &&
                    course?.chapters.length > 0 &&
                    course?.chapters.map((chapter) => {
                      return (
                        <CourseContentCollapse
                          handleNavigateLecture={handleNavigateLecture}
                          allLecturesByChapters={allLecturesByChapters}
                          isLoadingProgress={isLoadingProgress}
                          progressByCourse={progressByCourse}
                          key={chapter.id}
                          chapter={chapter}
                        />
                      );
                    })}
                </CourseContentsBar>

                <LearningHeader
                  courseName={course?.name}
                  courseSlug={course?.slug}
                  facebookPage={course?.facebookGroupLink}
                  learningPercentage={Math.trunc(
                    Number(
                      progressByCourse.length / allLecturesByChapters.length,
                    ) * 100,
                  )}
                />

                <div className="mt-4 flex flex-row justify-center">
                  <button
                    onClick={(e) => {
                      setNoticeOpen(true);
                    }}
                    className="justify-cente mx-4 flex w-fit flex-row items-center rounded-full bg-purple-200 px-4 py-2 font-bold text-purple-700"
                  >
                    <MdNotificationsPaused className="h-12 w-12 px-2" /> সর্বশেষ
                    নোটিশ
                  </button>

                  <button
                    onClick={(e) => {
                      joinZoomClass(true);
                    }}
                    className="justify-cente mx-4 flex w-fit flex-row items-center rounded-full bg-blue-200 px-4  py-2 font-bold text-blue-700  "
                  >
                    <Image
                      className="h-12 w-12 px-2"
                      src="/images/zoom.svg"
                      width={15}
                      height={15}
                      alt="zoom"
                    />{' '}
                    জুম লাইভ ক্লাসে জয়েন করুন
                  </button>
                </div>

                {noticeOpen && (
                  <Modal
                    onClose={(e) => {
                      setNoticeOpen(false);
                    }}
                    title={'Notice'}
                  >
                    <div className="overflow-hidden ">
                      <div className="overflow-auto">
                        <MathJax>
                          <article
                            className={` min-h-fit min-w-full overflow-x-hidden rounded-xl bg-white p-4 text-gray-600 lg:prose-xl prose-img:rounded-2xl dark:bg-dark-background  dark:text-white/80`}
                            dangerouslySetInnerHTML={{
                              __html: course?.notice || 'কোনো নোটিশ নেই',
                            }}
                          ></article>
                        </MathJax>
                      </div>
                    </div>
                  </Modal>
                )}

                <LearningBody course={course as CourseType} />
              </>
            )}
          </div>
        </LearningContextProvider>
      </MathJaxContext>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// middleware check student enrolled
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { params } = query;

  if (!params || params.length === 0) return { notFound: true };

  const courseSlug = params[0];

  const courseWithStudents = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { students: true },
  });

  return {
    props: { studentsEnrolled: courseWithStudents?.students || [] },
  };
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// -> There is no need for a header & a footer.
LearningPage.getLayout = (page: ReactNode) => {
  return <MainLayout>{page}</MainLayout>;
};

export default LearningPage;
