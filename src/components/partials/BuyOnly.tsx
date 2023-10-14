import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { BsStarFill } from 'react-icons/bs';
import { Else, If, Then } from 'react-if';
import { courseSidebarInViewport } from '~/atoms/courseSidebarAtom';
import { PATHS } from '~/constants';
import useCourse from '~/contexts/CourseContext';
import useIsEnrolled from '~/hooks/useIsEnrolled';

import { StarIcon } from '@heroicons/react/24/outline';

import Loading from '../buttons/Loading';

import type { CourseType } from '~/types';
import useIsAddToCart from '~/hooks/useIsAddToCart';
import useCart from '~/contexts/CartContext';
import type { Book } from '@prisma/client';
import { useSession } from 'next-auth/react';
interface BuyOnlyProps {
  course?: CourseType;
  book?: Book;
  ratingValue: number;
}

export default function BuyOnly({ course, ratingValue }: BuyOnlyProps) {
  const sidebarInViewport = useAtomValue(courseSidebarInViewport);
  const courseCtx = useCourse();
  const cartCtx = useCart();

  const router = useRouter();

  const session = useSession();

  const isEnrolled = useIsEnrolled({ course });
  const isAddToCart = useIsAddToCart({ course });

  const handleEnrollCourse = () => {
    if (!session.data?.user) {
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
      courseCtx?.enrollCourse(course?.slug);
    }
  };

  return (
    <div
      className={`smooth-effect } fixed bottom-0 left-0 z-50 flex h-[7rem] w-screen justify-between bg-purple-200 px-4 py-2 font-bold text-purple-900 animate-in fade-in zoom-in dark:bg-purple-950 dark:text-white  
      lg:hidden`}
    >
      <>
        <div className={`hidden max-w-[70%] flex-col py-2 md:flex`}>
          <h1 className="line-clamp-1 font-bold">{course?.name}</h1>

          <div className="text-md flex w-full items-center space-x-2 font-thin">
            {course?.briefDescription}
          </div>
        </div>

        <div className="flex w-full items-center space-x-6 px-4 md:w-[30%] lg:w-[25%]">
          {!isEnrolled && (
            <h1 className="text-2xl font-bold">
              <If condition={Number(course?.coursePrice) > 0}>
                <Then>
                  <div>
                    <div className=" pr-3 text-xl text-gray-800 line-through dark:text-gray-100">
                      {course?.fakePrice &&
                        new Intl.NumberFormat('bn-BD', {
                          style: 'currency',
                          currency: 'BDT',
                          minimumFractionDigits: 0,
                        }).format(course?.fakePrice as number)}
                    </div>
                    <div className="text-3xl text-rose-600">
                      {new Intl.NumberFormat('bn-BD', {
                        style: 'currency',
                        currency: 'BDT',
                        minimumFractionDigits: 0,
                      }).format(Number(course?.coursePrice || 0))}
                    </div>
                  </div>
                </Then>
                <Else>{'Free'}</Else>
              </If>
            </h1>
          )}

          <button
            onClick={handleEnrollCourse}
            disabled={courseCtx?.enrollStatus === 'loading' || !course}
            className="absolute-center btn-primary btn-lg btn flex-1"
          >
            <If condition={!isEnrolled}>
              <Then>
                {courseCtx?.enrollStatus === 'loading' ? (
                  <Loading />
                ) : Number(course?.coursePrice) > 0 ? (
                  'Buy now'
                ) : (
                  'Register now'
                )}
              </Then>
              <Else>{'Learn now'}</Else>
            </If>
          </button>
        </div>
      </>
    </div>
  );
}
