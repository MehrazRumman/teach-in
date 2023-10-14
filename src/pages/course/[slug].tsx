import { useSession } from 'next-auth/react';
// import RelatedCourses from '~/components/courses/RelatedCourses';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useIsClient } from 'usehooks-ts';
import CourseAchievement from '~/components/courses/CourseAchievement';
import CourseContent from '~/components/courses/CourseContent';
import CourseDescription from '~/components/courses/CourseDescription';
import CourseFooter from '~/components/courses/CourseFooter';
import CourseRequirements from '~/components/courses/CourseRequirements';
import CourseSidebar from '~/components/courses/CourseSidebar';
import BuyOnly from '~/components/partials/BuyOnly';
import ConfirmCoursePassword from '~/components/partials/ConfirmCoursePassword';
import CommentModal from '~/components/shared/CommentModal';
import useCourse from '~/contexts/CourseContext';
import usePreviousRoute from '~/contexts/HistoryRouteContext';
import { prisma } from '~/server/db/client';
import { trpc } from '~/utils/trpc';
import BlankCoursePage from '~/components/shared/BlankCoursePage';
import Head from '~/components/shared/Head';

import type { CourseType } from '~/types';
import type { GetServerSideProps, NextPage } from 'next';
import { PATHS } from '~/constants';
import Loading from '~/components/buttons/Loading';
import { StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BsStarFill } from 'react-icons/bs';
import { If, Then, Else } from 'react-if';
import Breadcrumbs from '~/components/shared/Breadcrumbs';
import useCart from '~/contexts/CartContext';
import useIsAddToCart from '~/hooks/useIsAddToCart';
import useIsEnrolled from '~/hooks/useIsEnrolled';

import Image from 'next/image';

interface CoursePageProps {
  courseHasPassword?: boolean;
  courseImage?: string;
  courseName?: string;
  description?: string;
}

const CoursePage: NextPage = ({
  courseHasPassword,
  courseImage,
  courseName,
  description,
}: CoursePageProps) => {
  const courseCtx = useCourse();
  const router = useRouter();

  const { status } = useSession();

  const [isUnlocked, setIsUnlocked] = useState(!courseHasPassword);

  const { data: course, refetch } = trpc.course.findCourseBySlug.useQuery(
    { slug: router.query.slug as string },
    { enabled: !!router.query.slug && isUnlocked },
  );

  const { mutate: addWishCourse, status: addWishCourseStatus } =
    trpc.user.addWishCourse.useMutation();

  const { mutate: deleteWishCourse, status: deleteWishCourseStatus } =
    trpc.user.deleteWishCourse.useMutation();

  useEffect(() => {
    if (deleteWishCourseStatus === 'success') {
      toast.success('Removed from favorites');
      return;
    }
  }, [deleteWishCourseStatus]);

  useEffect(() => {
    if (addWishCourseStatus === 'success') {
      toast.success('Added to favorites');
      return;
    }
  }, [addWishCourseStatus]);

  // useEffect(() => {
  //   if (
  //     addWishCourseStatus === 'success' ||
  //     deleteWishCourseStatus === 'success'
  //   ) {
  //     refetchWishlist();
  //   }

  //   if (addWishCourseStatus === 'error' || deleteWishCourseStatus === 'error') {
  //     toast.error('An error occurred, try again later!');
  //   }
  // }, [addWishCourseStatus, deleteWishCourseStatus]);

  const cartCtx = useCart();
  const isAddToCart = useIsAddToCart({ course });

  const isEnrolled = useIsEnrolled({ course });

  const { status: sessionStatus } = useSession();

  // const wishlistItem = useMemo(() => {
  //   if (course && wishlist) {
  //     return wishlist.find((fvCourse) => fvCourse.courseId === course?.id);
  //   }

  //   return null;
  // }, [course, wishlist]);

  const handleAddCourseToCart = () => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/direct_buy?slug=${course?.slug}&courseId=${course?.id}`);
      return;
    }

    if (
      course ||
      cartCtx?.userWithCart ||
      cartCtx?.addCourseToCartStatus !== 'loading'
    ) {
      cartCtx?.addCourseToCart(course?.id as string);
      router.push(`/${PATHS.CART}`);
      return;
    }
  };

  useEffect(() => {
    if (courseCtx?.enrollStatus === 'success') {
      refetch();
    }
  }, [courseCtx?.enrollStatus]);

  const handleAddWishCourse = () => {
    if (status === 'loading' || status === 'unauthenticated') {
      router.push(`/${PATHS.REGISTER}`);
      return;
    }

    if (!course || !course?.id) {
      toast.error('Oops! An error occurred, try again later!');
      return;
    }

    addWishCourse({ courseId: course.id });
  };

  const handleDeleteWishCourse = (wishlistId: string) => {
    // deleteWishCourse({ wishlistId });
  };

  const refetchCourse = () => {
    refetch();
  };

  const ratingValue = useMemo(() => {
    if (!course && !course?.reviews) return 0;

    return Math.floor(
      course?.reviews.reduce((point, review) => {
        if (review.rating) {
          return point + review.rating;
        }

        return point + 0;
      }, 0) / (course?.reviews.length > 0 ? course?.reviews.length : 1),
    );
  }, [course]);

  const totalVideoDuration = useMemo(() => {
    if (course) {
      return course?.chapters.reduce((prev, curr) => {
        return (
          prev +
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          curr.lectures?.reduce((time, lecture) => {
            return (
              time +
              lecture.resources.reduce((videoDur, rsc) => {
                if (rsc.type === 'youtube' && !isNaN(videoDur)) {
                  return videoDur + Number(rsc.videoDuration);
                }
                return videoDur + 0;
              }, 0)
            );
          }, 0)
        );
      }, 0);
    }

    return 0;
  }, [course]);

  const totalLectures = useMemo(() => {
    if (course) {
      return course.chapters.reduce((nChapter, chapter) => {
        if (chapter.lectures) {
          return nChapter + chapter.lectures?.length;
        }

        return nChapter;
      }, 0);
    }
  }, [course]);

  if (courseHasPassword && !isUnlocked) {
    return <ConfirmCoursePassword setIsUnlocked={setIsUnlocked} />;
  }

  return (
    <>
      {courseName ? (
        <>
          <Head
            title={`${courseName} - Teach-In Course`}
            image={courseImage}
            description={description}
          />

          <div>
            <div className="relative w-full bg-white py-10 text-gray-600 dark:bg-dark-background dark:text-white/60 lg:px-6 lg:py-6">
              <div className="mx-auto flex w-full flex-col items-center  md:max-w-[720px] lg:max-w-[1200px] lg:flex-row lg:items-start lg:justify-center">
                <div className="my-auto flex flex-col items-center space-y-3 overflow-hidden md:max-w-[80%] lg:max-h-[110vh] lg:min-w-[70rem] lg:max-w-[60%] lg:items-start">
                  <div className=" my-auto flex flex-col items-center space-y-3 md:max-w-[80%] lg:ml-6 lg:min-w-[70rem] lg:max-w-[70%] lg:items-start lg:overflow-auto">
                    {course ? (
                      <Breadcrumbs
                        category={course?.category?.name}
                        subCategory={course?.subCategory as string}
                      />
                    ) : (
                      <div className="h-[3rem] w-3/4 animate-pulse rounded-2xl bg-gray-300 dark:bg-gray-700"></div>
                    )}

                    {/* demo thumbnail  */}
                    <div className="w-[90%] lg:hidden">
                      <div
                        className={`relative overflow-hidden rounded-2xl  pb-[56.25%] ${
                          !course &&
                          'animate-pulse bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        {course && (
                          <Image
                            className="absolute inset-0 bg-center bg-no-repeat"
                            fill
                            alt="course-thumbnail"
                            src={course?.thumbnail as string}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex  w-[90%] flex-col space-y-6">
                      {course ? (
                        <h1 className="text-4xl font-black lg:text-5xl">
                          {course?.name}
                        </h1>
                      ) : (
                        <div className="h-[5rem] w-full animate-pulse rounded-2xl bg-gray-300 dark:bg-gray-700"></div>
                      )}

                      {course ? (
                        <h2 className="text-2xl lg:text-3xl">
                          {course?.briefDescription}
                        </h2>
                      ) : (
                        <div className="mx-auto h-[10rem] w-[w-90%] animate-pulse rounded-2xl bg-gray-300 dark:bg-gray-700 lg:mx-0"></div>
                      )}

                      {course ? (
                        <h1 className="text-3xl font-bold lg:hidden">
                          <span>Price: </span>
                          <span className=" px-3  text-2xl text-gray-800 line-through dark:text-gray-100">
                            {course.fakePrice &&
                              new Intl.NumberFormat('bn-BD', {
                                style: 'currency',
                                currency: 'BDT',
                                minimumFractionDigits: 0,
                              }).format(course.fakePrice as number)}
                          </span>
                          <span className="text-3xl text-rose-600">
                            {course?.coursePrice === 0
                              ? 'Free'
                              : new Intl.NumberFormat('bn-BD', {
                                  style: 'currency',
                                  currency: 'BDT',
                                  minimumFractionDigits: 0,
                                }).format(course.coursePrice as number)}
                          </span>

                          {course?.fakePrice && (
                            <span className="mx-3 text-xl text-gray-900 dark:text-white">
                              (Limited offer)
                            </span>
                          )}
                        </h1>
                      ) : (
                        <div className="ml-6 h-[4rem] w-2/3 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                      )}

                      {course &&
                        Number(course?.coursePrice) > 0 &&
                        !isEnrolled && (
                          <button
                            onClick={handleAddCourseToCart}
                            disabled={!course}
                            className=" grow scroll-smooth rounded-md bg-green-500 py-2  font-extrabold text-white shadow-md shadow-green-200 animate-out hover:bg-green-800 hover:text-white dark:bg-green-600  dark:shadow-green-900 lg:hidden"
                          >
                            <If
                              condition={
                                cartCtx?.addCourseToCartStatus === 'loading'
                              }
                            >
                              <Then>
                                <Loading />
                              </Then>
                              <Else>Buy this Course</Else>
                            </If>
                          </button>
                        )}
                    </div>

                    <CourseDescription
                      description={course?.detailDescription || ''}
                    />

                    <CourseAchievement
                      targets={course?.courseTargets.map((target) => ({
                        id: target.id,
                        content: target.content,
                      }))}
                    />
                    <CourseContent
                      course={course as CourseType}
                      totalLectures={totalLectures || 0}
                      totalVideoDuration={totalVideoDuration}
                    />

                    <CourseRequirements
                      requirements={course?.courseRequirements.map((rq) => ({
                        id: rq.id,
                        content: rq.content,
                      }))}
                    />

                    <CourseFooter
                      course={course as CourseType}
                      refetchCourse={refetchCourse}
                    />

                    <CommentModal courseId={course?.id} />

                    <BuyOnly
                      course={course as CourseType}
                      ratingValue={ratingValue}
                    />

                    <div className="flex flex-col items-start md:flex-row md:items-center md:space-x-4">
                      <div className="flex items-center space-x-4">
                        <span className="inline-block">{ratingValue}</span>

                        <div className="flex space-x-2">
                          {Array.from(new Array(ratingValue).keys()).map(
                            (elem) => {
                              return (
                                <BsStarFill
                                  key={elem}
                                  className="h-5 w-5 text-yellow-500"
                                />
                              );
                            },
                          )}
                          {Array.from(new Array(5 - ratingValue).keys()).map(
                            (elem) => {
                              return (
                                <StarIcon
                                  key={elem}
                                  className="h-5 w-5 text-gray-500 dark:text-white"
                                />
                              );
                            },
                          )}
                        </div>
                      </div>

                      <div className="flex">
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        <span>({course?.reviews.length} Rate)</span>
                        <span className="mx-2">|</span>
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        <span>{course?.students.length} Student</span>
                      </div>
                    </div>

                    <h5 className="flex items-center space-x-2">
                      <ClockIcon className="h-6 w-6" />{' '}
                      <span className="flex">
                        Last update:{' '}
                        {course &&
                          new Date(course?.updatedAt).toLocaleDateString(
                            'bn-BD',
                          )}
                      </span>
                      {!course && (
                        <div className="h-[2rem] w-1/2 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                      )}
                    </h5>
                  </div>
                </div>

                <CourseSidebar
                  handleDeleteWishCourse={handleDeleteWishCourse}
                  isLoading={
                    addWishCourseStatus === 'loading' ||
                    deleteWishCourseStatus === 'loading'
                  }
                  wishlist={[]}
                  handleAddWishCourse={handleAddWishCourse}
                  course={course as CourseType}
                  totalVideoDuration={totalVideoDuration}
                  totalLectures={totalLectures || 0}
                />
              </div>
            </div>

            {/* <CourseHeader
              wishlist={wishList || []}
              isLoading={
                addWishCourseStatus === 'loading' ||
                deleteWishCourseStatus === 'loading'
              }
              handleDeleteWishCourse={handleDeleteWishCourse}
              handleAddWishCourse={handleAddWishCourse}
              course={course as CourseType}
              ratingValue={ratingValue}
            >
             
            </CourseHeader> */}

            {/* {course ? (
              <>
                <CourseBody>
                  <CourseAchievement
                    targets={course?.courseTargets.map((target) => ({
                      id: target.id,
                      content: target.content,
                    }))}
                  />
                  <CourseContent
                    course={course as CourseType}
                    totalLectures={totalLectures || 0}
                    totalVideoDuration={totalVideoDuration}
                  />

                  <CourseDescription
                    description={course?.detailDescription || ''}
                  />

                  <CourseRequirements
                    requirements={course?.courseRequirements.map((rq) => ({
                      id: rq.id,
                      content: rq.content,
                    }))}
                  />
                </CourseBody>

                <CourseFooter
                  course={course as CourseType}
                  refetchCourse={refetchCourse}
                />

              

                <CommentModal courseId={course?.id} />

                <BuyOnly
                  course={course as CourseType}
                  ratingValue={ratingValue}
                />
              </>
            ) : null} */}
          </div>
        </>
      ) : (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-2 ">
          <Loading />
          Loading...
        </div>
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// middleware check course has a password
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { slug } = query;

  const course = await prisma?.course.findUnique({
    where: { slug: slug as string },
    select: {
      password: true,
      thumbnail: true,
      name: true,
      briefDescription: true,
    },
  });

  const courseHasPassword = course?.password !== null;

  return {
    props: {
      courseHasPassword,
      courseImage: course?.thumbnail,
      courseName: course?.name,
      description: course?.briefDescription,
    },
  };
};

export default CoursePage;
