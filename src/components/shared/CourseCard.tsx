import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { PATHS } from '~/constants';

import type { User } from '@prisma/client';

interface CourseCardProps {
  course: {
    instructor: User;
    name: string;
    slug: string;
    thumbnail: string | null;
    coursePrice: number | null;
    fakePrice: number | null;
  };
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="smooth-effect relative rounded-2xl border-2 border-gray-600 bg-slate-100  hover:scale-[101%] dark:border-white/50 dark:bg-slate-900">
      <Link
        href={`/${PATHS.COURSE}/${course.slug}`}
        className="flex h-full flex-col overflow-hidden"
      >
        <figure>
          <Image
            quality={60}
            alt={course.name}
            src={course.thumbnail || ''}
            height={100}
            width={200}
            className=" h-auto w-full rounded-tl-2xl rounded-tr-2xl bg-cover bg-center bg-no-repeat"
          />
        </figure>
        <h1 className="line-clamp-1 min-h-[1.8rem] px-2  py-2 text-xl font-bold md:text-2xl">
          {course.name}
        </h1>
        <h2 className="  px-2 text-lg font-light dark:text-white/80 md:text-2xl">
          {course.instructor.name}
        </h2>

        <div className="mb-2 flex w-full items-center px-2">
          <span className="pr-2 text-xl line-through">
            {course.fakePrice &&
              new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT',
                minimumFractionDigits: 0,
              }).format(Number(course.fakePrice))}
          </span>{' '}
          <h3 className="text-xl font-bold text-rose-400 md:text-2xl">
            {Number(course.coursePrice) > 0
              ? new Intl.NumberFormat('bn-BD', {
                  style: 'currency',
                  currency: 'BDT',
                  minimumFractionDigits: 0,
                }).format(Number(course.coursePrice))
              : 'Free'}
          </h3>
        </div>
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-2 aspect-w-4 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(CourseCard);
