import type { Category, Question, User, Result } from '@prisma/client';
import Link from 'next/link';
import { memo, useEffect, useState } from 'react';
import { BiTime } from 'react-icons/bi';
import {
  FaAngleDoubleRight,
  FaQuestionCircle,
  FaUserCheck,
} from 'react-icons/fa';
import { PATHS } from '~/constants';

interface ContestCardSmallProps {
  test: {
    addedBy: User;
    name: string;
    slug: string;
    category: Category;
    subCategory: string;
    questions: Question[];
    results: Result[];
    price: number | null;
    section: string;
    contestMode: boolean;
    contestStart: Date | null;
    contestEnd: Date | null;
    contestDuration: number | null;
  };
}

function ContestCardSmall({ test }: ContestCardSmallProps) {
  const currentDateTime = new Date();
  const contestStartTime = test?.contestStart;
  const contestEndTime = test?.contestEnd;
  const timeDiff = contestStartTime?.getTime() - currentDateTime?.getTime();
  const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
  );
  const secondsRemaining = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const [remainingTime, setRemainingTime] = useState({
    hours: hoursRemaining,
    minutes: minutesRemaining,
    seconds: secondsRemaining,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainingTime.seconds > 0) {
        setRemainingTime((prevTime) => ({
          ...prevTime,
          seconds: prevTime.seconds - 1,
        }));
      } else if (remainingTime.minutes > 0) {
        setRemainingTime((prevTime) => ({
          hours: prevTime.hours,
          minutes: prevTime.minutes - 1,
          seconds: 59,
        }));
      } else if (remainingTime.hours > 0) {
        setRemainingTime({
          hours: remainingTime.hours - 1,
          minutes: 59,
          seconds: 59,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const buttonContent =
    currentDateTime < contestStartTime
      ? `Starting in ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`
      : currentDateTime > contestEndTime
      ? `Ended ${hoursRemaining}h ${minutesRemaining}m ago`
      : `Participate`;

  return (
    <div className="smooth-effect relative mb-4 flex flex-row justify-between rounded-2xl border-2 border-gray-600 bg-slate-100 p-2 hover:scale-[101%] dark:border-white/50 dark:bg-slate-900 ">
      <Link
        href={`/${PATHS.EXAM}/${test.slug}`}
        className="flex h-fit flex-col overflow-hidden px-2 py-3"
      >
        <div className="flex h-full flex-col justify-between">
          <h2 className="max-w-24 line-clamp-1 overflow-hidden px-2 text-xl font-bold md:text-2xl">
            {test.name}
          </h2>
          <div className="flex w-full flex-1 items-center space-x-2 px-2">
            <h4 className="font md:text-md py-2 text-lg text-purple-400">
              <div>{test.category.name}</div>
            </h4>
          </div>

          <div className="md:text-md mx-2 line-clamp-1 flex flex-row  items-center text-lg">
            <div className="flex items-center">
              <FaQuestionCircle className="mr-2" />
              {test.questions.length}{' '}
            </div>
            <div className="ml-4 flex items-center">
              <FaUserCheck className="mr-2" />
              {test.results.length}{' '}
            </div>
            <div className="ml-4 flex items-center">
              <BiTime className="mr-2" />
              {test.contestDuration}
              {' mins'}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center ">
          {test.contestStart &&
            test.contestEnd &&
            currentDateTime < test.contestEnd && (
              <Link
                href={`/${PATHS.EXAM}/${test.slug}`}
                className="flex h-fit w-full flex-col overflow-hidden px-2 py-2"
              >
                <button
                  className={`flex flex-row items-center justify-center rounded-xl
                  ${
                    test.results[0]?.totalMarks
                      ? 'bg-blue-700 hover:bg-blue-900'
                      : 'bg-purple-700 hover:bg-purple-900'
                  } px-2 py-2 text-base font-bold
                  text-white sm:text-lg lg:text-2xl`}
                >
                  <FaAngleDoubleRight className="mr-2" />
                  <p className="lg:text-md text-sm sm:text-sm">
                    {buttonContent}
                  </p>
                </button>
              </Link>
            )}
        </div>
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-8 aspect-w-16 mb-4 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(ContestCardSmall);
