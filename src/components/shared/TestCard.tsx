import Link from 'next/link';
import { memo } from 'react';
import { PATHS } from '~/constants';

import type { Category, Question, User, Result } from '@prisma/client';
import {
  FaAngleDoubleRight,
  FaQuestionCircle,
  FaUserCheck,
} from 'react-icons/fa';

interface TestCardProps {
  test: {
    addedBy: User;
    name: string;
    slug: string;
    category: Category;
    subCategory: string;
    questions: Question[];
    results: Result[];
    price: number | null;
  };
  index: number;
}

function TestCard({ test, index }: TestCardProps) {
  return (
    <div
      className={`smooth-effect relative mb-4 flex max-h-36 flex-row justify-between rounded-2xl border-2 border-gray-600 p-4 hover:scale-[101%] ${
        test?.results[0]?.totalMarks
          ? 'bg-blue-200 dark:bg-blue-900'
          : 'bg-slate-100 dark:bg-slate-900'
      }`}
    >
      <div className="flex h-full w-4/12 flex-col justify-between">
        <h2 className=" px-2 text-xl font-bold  md:text-2xl">
          {index + ' - ' + test.name}
        </h2>
        <div className="flex w-full flex-1 items-center space-x-2 px-2">
          <h4 className="font py-2 text-lg text-rose-500 md:text-2xl">
            <div>
              {test.category.name} {' / '} {test.subCategory}
            </div>
          </h4>
        </div>
        <h2 className="px-2  text-lg  font-light dark:text-white/80 md:text-xl">
          {test.addedBy.name}
        </h2>
      </div>
      <div className="flex flex-row gap-6">
        <div className="flex flex-col items-center justify-center text-lg md:text-2xl">
          <div className="flex items-center">
            <FaQuestionCircle className="mr-2" />
            {test.questions.length}{' '}
          </div>
          <div className="flex items-center">
            {test?.results[0]?.totalMarks
              ? 'Mark: ' +
                test.results[0]?.totalMarks +
                '(' +
                Math.trunc(test.results[0]?.percentage || 0) +
                '%)'
              : 'Not Participated yet'}
          </div>
        </div>
        <div className="flex flex-row items-center p-2 lg:p-4">
          <Link
            href={`/${PATHS.EXAM}/${test.slug}`}
            className="flex h-fit flex-col overflow-hidden px-2 py-3"
          >
            <button
              className={`flex flex-row items-center justify-center rounded-full ${
                test.results[0]?.totalMarks
                  ? 'bg-blue-700 hover:bg-blue-900'
                  : 'bg-purple-700 hover:bg-purple-900'
              } px-4 py-2 font-bold text-white `}
            >
              <FaAngleDoubleRight className="mr-2" />
              <p className="text-lg md:text-2xl">
                {test?.results[0]?.totalMarks ? 'Re-Exam' : 'Participate'}
              </p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-1 aspect-w-16 mb-4 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(TestCard);
