import { useSetAtom } from 'jotai';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useRef } from 'react';
import { BiInfinite } from 'react-icons/bi';
import { Else, If, Then } from 'react-if';
import { useIntersectionObserver } from 'usehooks-ts';
import { courseSidebarInViewport } from '~/atoms/courseSidebarAtom';
import { PATHS } from '~/constants';
import useCourse from '~/contexts/CourseContext';
import useIsEnrolled from '~/hooks/useIsEnrolled';

import {
  BookOpenIcon,
  FolderArrowDownIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

import Loading from '../buttons/Loading';

import type { Wishlist } from '@prisma/client';

import useCart from '~/contexts/CartContext';
import useIsAddToCart from '~/hooks/useIsAddToCart';
import type { CourseType } from '~/types';
import { useSession } from 'next-auth/react';
interface CourseSidebarProps {
  course?: CourseType;
  totalVideoDuration: number;
  totalLectures: number;

  isLoading?: boolean;
  handleAddWishCourse: () => void;
  handleDeleteWishCourse: (wishlistId: string) => void;
  wishlist: Wishlist[];
}

function CourseSidebar({
  course,
  totalVideoDuration,
  totalLectures,
}: CourseSidebarProps) {
  const refBtn = useRef<HTMLButtonElement | null>(null);
  const setSidebarState = useSetAtom(courseSidebarInViewport);
  const entry = useIntersectionObserver(refBtn, {});
  const router = useRouter();

  const courseCtx = useCourse();
  const cartCtx = useCart();

  const isEnrolled = useIsEnrolled({ course });
  const isAddToCart = useIsAddToCart({ course });

  const { status: sessionStatus } = useSession();

  useEffect(() => {
    setSidebarState(!!entry?.isIntersecting);
  }, [entry?.isIntersecting]);

  // const wishlistItem = useMemo(() => {
  //   if (course && wishlist) {
  //     return wishlist.find((fvCourse) => fvCourse.courseId === course?.id);
  //   }

  //   return null;
  // }, [course, wishlist]);

  const totalDownloadableResource = useMemo(() => {
    if (course) {
      return course.chapters.reduce((prev, curr) => {
        return (
          prev +
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          curr.lectures?.reduce((time, lecture) => {
            return (
              time +
              lecture.resources.reduce((videoDur, rsc) => {
                if (rsc.type === 'document') {
                  return videoDur + 1;
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

  const handleEnrollCourse = () => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/direct_buy?slug=${course?.slug}&courseId=${course?.id}`);
      return;
    }

    if (
      isEnrolled &&
      course?.chapters &&
      course?.chapters.length > 0 &&
      course?.chapters[0]?.lectures
    ) {
      router.push(
        `/${PATHS.LEARNING}/${course?.slug}/${course?.chapters[0]?.lectures[0]?.id}`,
      );
      return;
    }

    if (!isAddToCart && course && Number(course.coursePrice) > 0) {
      router.push(`/${PATHS.CART}`);
      cartCtx?.addCourseToCart(course.id);
      return;
    }

    if (!isEnrolled && isAddToCart) {
      router.push(`/${PATHS.CART}`);
      return;
    }

    if (course?.slug) {
      courseCtx?.enrollCourse(course.slug);
    }
  };

  // const handleAddCourseToCart = () => {
  //   if (sessionStatus === 'unauthenticated') {
  //     router.push(`/direct_buy?slug=${course?.slug}&courseId=${course?.id}`);
  //     return;
  //   }

  //   if (
  //     !course ||
  //     !cartCtx?.userWithCart ||
  //     cartCtx?.addCourseToCartStatus === 'loading'
  //   ) {
  //     return;
  //   }

  //   if (isAddToCart) {
  //     router.push(`/${PATHS.CART}`);
  //     return;
  //   }

  //   cartCtx?.addCourseToCart(course.id, course.slug as string);
  // };

  return (
    <aside
      className={`glass hidden h-[100vh] max-w-[40rem] flex-1 space-y-8 overflow-hidden rounded-2xl text-gray-600 dark:text-white/60 lg:block`}
    >
      <div className="w-full">
        <div
          className={`relative overflow-hidden rounded-2xl  pb-[56.25%] ${
            !course && 'm-2 animate-pulse bg-gray-300 dark:bg-gray-700'
          }`}
        >
          {course && (
            <Image
              className="absolute inset-0 bg-center bg-no-repeat"
              fill
              alt="course-thumbnail"
              src={course.thumbnail || ''}
            />
          )}
        </div>
      </div>
      <h1 className=" pl-6 text-4xl font-bold">{course?.name}</h1>
      <h1 className=" pl-6 text-2xl">{course?.briefDescription}</h1>
      {!isEnrolled && (
        <>
          {course ? (
            <h1 className="pl-6 text-3xl font-bold text-rose-600">
              <span className=" pr-3 text-2xl text-gray-800 line-through dark:text-gray-100">
                {course.fakePrice &&
                  new Intl.NumberFormat('bn-BD', {
                    style: 'currency',
                    currency: 'BDT',
                    minimumFractionDigits: 0,
                  }).format(course.fakePrice as number)}
              </span>
              {course.coursePrice === 0
                ? 'Free'
                : new Intl.NumberFormat('bn-BD', {
                    style: 'currency',
                    currency: 'BDT',
                    minimumFractionDigits: 0,
                  }).format(course.coursePrice as number)}
            </h1>
          ) : (
            <div className="ml-6 h-[4rem] w-2/3 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700"></div>
          )}
        </>
      )}

      {/* <div className="flex w-full space-x-4 px-4">
        {course && Number(course.coursePrice) > 0 && !isEnrolled && (
          <button
            onClick={handleAddCourseToCart}
            disabled={!course}
            className="absolute-center btn-primary btn-lg btn w-[70%]"
          >
            <If condition={cartCtx?.addCourseToCartStatus === 'loading'}>
              <Then>
                <Loading />
              </Then>
              <Else>{isAddToCart ? 'Go to cart' : 'Add to cart'}</Else>
            </If>
          </button>
        )}
        <button
          disabled={!course}
          onClick={() => {
            if (isLoading) return; //bc btn styles :b

            if (!wishlistItem) {
              handleAddWishCourse();
            } else {
              handleDeleteWishCourse(wishlistItem.id);
            }
          }}
          className="btn-active btn-ghost btn-lg btn flex-1 text-gray-600 dark:text-white/60"
        >
          <If condition={isLoading}>
            <Then>
              <Loading />
            </Then>
            <Else>
              {!!wishlistItem ? (
                <HeartIconSolid className="h-8 w-8 text-rose-500 animate-in zoom-in" />
              ) : (
                <HeartIcon className="h-8 w-8 animate-in zoom-in" />
              )}
            </Else>
          </If>
        </button>
      </div> */}

      <div className="flex w-full space-x-4 px-4">
        <button
          disabled={courseCtx?.enrollStatus === 'loading' || !course}
          onClick={handleEnrollCourse}
          ref={refBtn}
          className="smooth-effect absolute-center min-h-[4rem] w-full  grow scroll-smooth   rounded-md   border  border-gray-600 bg-green-500  p-3 py-2 font-extrabold uppercase text-white  shadow-md shadow-green-200 animate-out hover:bg-green-800 hover:text-white dark:border-white/60 dark:bg-green-600 dark:shadow-green-900  dark:hover:bg-dark-background"
        >
          <If condition={!isEnrolled}>
            <Then>
              {courseCtx?.enrollStatus === 'loading' ? (
                <Loading />
              ) : course && Number(course.coursePrice) > 0 ? (
                'Buy Now'
              ) : (
                'Register for Course'
              )}
            </Then>
            <Else>{'Learn now'}</Else>
          </If>
        </button>
      </div>

      <div className="flex w-full flex-col space-y-2 px-4">
        <h1 className="text-2xl font-semibold">This course includes:</h1>
        <ul className="flex flex-col space-y-4">
          <li className="flex items-center space-x-2">
            {course ? (
              <>
                <PlayCircleIcon className="h-6 w-6" />{' '}
                <span>
                  {Math.floor(totalVideoDuration / 3600) > 0
                    ? `${Math.floor(totalVideoDuration / 3600)} Hour video`
                    : `${Math.ceil(totalVideoDuration / 60)} Minute video`}
                </span>
              </>
            ) : (
              <div className="h-[2rem] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
            )}
          </li>
          <li className="flex items-center space-x-2">
            {course ? (
              <>
                <BookOpenIcon className="h-6 w-6" />{' '}
                <span>{totalLectures} lesson</span>
              </>
            ) : (
              <div className="h-[2rem] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
            )}
          </li>
          <li className="flex items-center space-x-2">
            {course ? (
              <>
                <FolderArrowDownIcon className="h-6 w-6" />
                <span>{totalDownloadableResource} download resources</span>
              </>
            ) : (
              <div className="h-[2rem] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
            )}
          </li>
          <li className="flex items-center space-x-2">
            <BiInfinite className="h-6 w-6" />
            <span>2 years of access</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default memo(CourseSidebar);
