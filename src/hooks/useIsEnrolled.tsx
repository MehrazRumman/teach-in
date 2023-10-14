import { useState, useEffect } from 'react';
import type { CourseType } from '~/types';
import { useSession } from 'next-auth/react';
import type { Book } from '@prisma/client';

export default function useIsEnrolled(
  { course, book }: { course?: CourseType; book?: Book },
) {
  const { data: session } = useSession();
  const [isEnroll, setIsEnroll] = useState(false);

  useEffect(() => {
    const userId = session?.user?.id;

    if (course) {
      if (
        course &&
        userId &&
        course.students.find((student) => student.userId === userId)
      ) {
        setIsEnroll(true);
      }
    } else if (book) {
      if (
        book &&
        userId &&
        book.students.find((student) => student.userId === userId)
      ) {
        setIsEnroll(true);
      }
    }
    return () => {
      setIsEnroll(false);
    };
  }, [course, book]);

  return isEnroll;
}
