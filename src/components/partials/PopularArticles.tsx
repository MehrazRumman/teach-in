import 'swiper/css';
import 'swiper/css/pagination';

import { memo, useRef } from 'react';
import { FreeMode, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import ArticleCard, { CardSkeleton } from '~/components/shared/ArticleCard';
import { swiperBreakPoints } from '~/constants';
import { If, Then, Else } from 'react-if';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { Swiper as SwiperCore } from 'swiper/types';
import { trpc } from '~/utils/trpc';
function PopularArticles() {
  // use navigate without useSwiper hook https://github.com/nolimits4web/swiper/issues/3855#issuecomment-1287871054
  const swiperRef = useRef<SwiperCore>();

  const { data, status } = trpc.article.findArticlesByFilters.useQuery({
    limit: 10,
    page: '1',
    sortBy: '',
  });

  return (
    <div className="my-6 h-fit w-full text-gray-800 dark:text-white">
      <div className="absolute-center w-full space-x-4">
        <button
          onClick={() => {
            swiperRef.current?.slidePrev();
          }}
          className="absolute-center smooth-effect hover:scale-[120%]"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <h1 className="center text-3xl font-bold capitalize md:text-4xl">
          Popular Articles
        </h1>
        <button
          onClick={() => {
            swiperRef.current?.slideNext();
          }}
          className="absolute-center"
        >
          <ChevronRightIcon className="smooth-effect h-8 w-8 hover:scale-[120%]" />
        </button>
      </div>

      <div className="mx-auto my-4 w-full px-3 md:px-6">
        <If condition={status === 'loading'}>
          <Then>
            <Swiper
              loop={data && data?.articles?.length > 7}
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
              loop={data && data?.articles?.length > 7}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              breakpoints={swiperBreakPoints}
              modules={[Pagination, FreeMode]}
            >
              {data &&
                data?.articles.length > 0 &&
                data?.articles.map((article) => {
                  return (
                    <SwiperSlide key={article.id}>
                      <ArticleCard article={article} />
                    </SwiperSlide>
                  );
                })}
            </Swiper>
          </Else>
        </If>
      </div>
    </div>
  );
}
//Student
export default memo(PopularArticles);
