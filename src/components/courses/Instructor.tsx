import { useAutoAnimate } from '@formkit/auto-animate/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon, UsersIcon } from '@heroicons/react/24/solid';
import { Disclosure, useDisclosureState } from 'ariakit/disclosure';
import Image from 'next/image';
import { memo, useEffect, useMemo, useState } from 'react';
import { GiAchievement } from 'react-icons/gi';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { PATHS } from '~/constants';

interface InstructorProps {
  instructorId?: string;
}

function Instructor({ instructorId }: InstructorProps) {
  const disclosure = useDisclosureState();
  const [isOverflow, setIsOverflow] = useState(false);
  const [parent] = useAutoAnimate<HTMLParagraphElement>();

  const { data: instructor } = trpc.user.findInstructor.useQuery(
    { userId: instructorId as string },
    { enabled: !!instructorId },
  );

  useEffect(() => {
    parent.current && setIsOverflow(parent.current?.clientHeight > 50);
  }, [instructor?.bio?.bioDescription]);

  const totalStudents = useMemo(() => {
    if (!instructor) return 0;

    return instructor.Course.reduce((acc, course) => {
      return acc + course.students.length;
    }, 0);
  }, [instructor]);

  const totalReviews = useMemo(() => {
    if (!instructor) return 0;

    return instructor.Course.reduce((acc, course) => {
      return acc + course.reviews.length;
    }, 0);
  }, [instructor]);

  return (
    <div className="mx-4 flex w-full flex-col space-y-4 rounded-lg border-2 p-4 shadow-md md:mx-8">
      <div className="mt-4 flex flex-col space-x-4">
        <Link href={`/${PATHS.USER}/${instructor?.id}`}>
          <figure className="relative h-auto w-full overflow-hidden rounded-2xl  ">
            <Image
              src={instructor?.image || '/images/logo.svg'}
              alt="user-avatar"
              width={100}
              height={100}
              className=""
            />
          </figure>
        </Link>

        <Link href={`/${PATHS.USER}/${instructor?.id}`}>
          <h1 className="line-clamp-2 py-4 text-3xl font-bold  md:text-4xl">
            {instructor?.name}
          </h1>
        </Link>

        <div className="flex flex-col justify-center space-y-2 text-xl md:text-2xl">
          <div className="flex flex-row items-center space-x-4">
            <GiAchievement className="h-6 w-6" />
            <div>{totalReviews} Reviews</div>
          </div>
          <div className="flex flex-row items-center space-x-4">
            <UsersIcon className="h-6 w-6" />
            <div>{totalStudents} Students</div>
          </div>
          <div className="flex flex-row items-center space-x-4">
            <BookOpenIcon className="h-6 w-6" />
            <div>{instructor?.Course.length} Courses</div>
          </div>
        </div>
      </div>

      <article
        ref={parent}
        className={`prose-xl prose ${
          disclosure.open && isOverflow ? 'h-auto' : 'h-[10rem]'
        } overflow-hidden overflow-x-hidden text-gray-600 prose-img:max-w-[60vw] prose-img:rounded-2xl dark:text-white/80`}
        dangerouslySetInnerHTML={{
          __html: instructor?.bio?.bioDescription || '',
        }}
      ></article>

      {isOverflow && (
        <Disclosure
          className="absolute-center flex w-full flex-col"
          state={disclosure}
        >
          <span>{disclosure.open ? 'See more' : 'Collapse'}</span>
          <ChevronUpIcon
            className={`smooth-effect h-6 w-6 transform ${
              disclosure.open ? 'rotate-180' : ''
            }`}
          />
        </Disclosure>
      )}
    </div>
  );
}
export default memo(Instructor);
