import 'swiper/css';
import 'swiper/css/pagination';

import { memo, useRef } from 'react';
import { FreeMode, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CardSkeleton } from '~/components/shared/CourseCard';
import { swiperBreakPoints } from '~/constants';
import { If, Then, Else } from 'react-if';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { Swiper as SwiperCore } from 'swiper/types';
import { trpc } from '~/utils/trpc';
import EnrolledCourseCard from '../shared/EnrolledCourseCard';
function MyCourses() {
  // use navigate without useSwiper hook https://github.com/nolimits4web/swiper/issues/3855#issuecomment-1287871054
  const swiperRef = useRef<SwiperCore>();

  const { data, status } = trpc.user.findEnrolledCourses.useQuery();

  return (
    <>
      {data && data?.courses?.length > 0 && (
        <div className="my-6 h-fit w-full text-gray-800 dark:text-white">
          <h1 className=" center   px-3 text-3xl font-bold capitalize md:px-6 md:text-4xl">
            Your enrolled courses
          </h1>

          <div className="mx-auto my-4 w-full px-3 md:px-6">
            <If condition={status === 'loading'}>
              <Then>
                <Swiper
                  loop={data && data?.courses?.length > 7}
                  onBeforeInit={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  breakpoints={swiperBreakPoints}
                  modules={[Pagination, FreeMode]}
                >
                  {Array.from(new Array(15).keys()).map((e) => {
                    return (
                      <SwiperSlide key={e}>
                        <CardSkeleton />
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </Then>

              <Else>
                <Swiper
                  loop={data && data?.courses?.length > 7}
                  onBeforeInit={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  breakpoints={swiperBreakPoints}
                  modules={[Pagination, FreeMode]}
                >
                  {data &&
                    data?.courses.length > 0 &&
                    data?.courses.map((course) => {
                      return (
                        <SwiperSlide key={course.id}>
                          <EnrolledCourseCard course={course} />
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              </Else>
            </If>
          </div>
        </div>
      )}
    </>
  );
}
//Student
export default memo(MyCourses);
