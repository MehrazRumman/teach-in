import type { Category, Question, User, Result } from '@prisma/client';
import Link from 'next/link';
import { memo } from 'react';
import {
  FaAngleDoubleRight,
  FaQuestionCircle,
  FaUserCheck,
} from 'react-icons/fa';
import { PATHS } from '~/constants';

interface TestCardSmallProps {
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
  };
}

function TestCardSmall({ test }: TestCardSmallProps) {
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
          </div>
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

export default memo(TestCardSmall);
