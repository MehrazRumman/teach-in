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

function EnrolledCourseCard({ course }: CourseCardProps) {
  return (
    <div className="smooth-effect relative rounded-2xl border-2 border-gray-600 bg-slate-100  hover:scale-[101%] dark:border-white/50 dark:bg-slate-900">
      <Link
        href={`/${PATHS.LEARNING}/${course.slug}/${course.slug}_1_1`}
        className="flex h-full flex-col overflow-hidden"
      >
        <figure>
          <Image
            quality={60}
            alt={course.name}
            src={course.thumbnail || ''}
            height={200}
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
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-3 aspect-w-4 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(EnrolledCourseCard);
