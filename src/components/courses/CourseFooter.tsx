import { memo } from 'react';
import type { CourseType } from '~/types';
import CourseComments from './CourseComments';
import Instructor from './Instructor';
import CourseRating from './CourseRating';
import { useSession } from 'next-auth/react';

interface CourseFooterProps {
  course?: CourseType;
  refetchCourse: () => void;
}

function CourseFooter({ course, refetchCourse }: CourseFooterProps) {
  const { data: session } = useSession();

  return (
    <div className="my-16 w-[90%] text-gray-600 dark:text-white/80">
      <div className="w-full flex-col md:max-w-[720px] lg:max-w-[1200px]">
        <h1 className="mb-6 text-3xl font-semibold md:text-4xl">Instructor</h1>
        <Instructor instructorId={course?.instructor.id || ''} />

        <CourseComments reviews={course?.reviews} />

        {course &&
          course?.students.some(
            (student) => student.userId === session?.user?.id,
          ) && (
            <CourseRating courseId={course?.id} refetchCourse={refetchCourse} />
          )}
      </div>
    </div>
  );
}

export default memo(CourseFooter);
