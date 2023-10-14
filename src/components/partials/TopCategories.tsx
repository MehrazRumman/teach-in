import {
  AcademicCapIcon,
  FireIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { Category } from '@prisma/client';
import type { ReactNode } from 'react';
import { PATHS } from '~/constants';
import Link from 'next/link';

const palette_colors = ['#d2b6ff', '#abc5fe', '#ffbaaa', '#ffea9f'];
const icons = [AcademicCapIcon, LightBulbIcon, FireIcon, SparklesIcon];

const TopCategoryItem = ({
  label,
  children,
  backgroundColor,
}: {
  label: string;
  backgroundColor?: string;
  children: ReactNode;
}) => {
  return (
    <div
      style={{ backgroundColor }}
      className="aspect-h-1 aspect-w-2 rounded-2xl border-2 border-gray-600 text-gray-600 dark:border-primary"
    >
      <Link href={`/${PATHS.BROWSE}?category=${label}`}>
        <div className="full-size absolute-center">
          <h1 className="line-clamp-1 max-w-[80%] text-2xl font-semibold capitalize md:text-3xl">
            {label}
          </h1>
        </div>
        <span className="absolute left-1/2 top-[85%] h-16 w-16 -translate-x-1/2 rounded-full bg-primary p-2">
          {children}
        </span>
      </Link>
    </div>
  );
};

interface TopCategoriesProps {
  categories: Category[];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <div className="my-10 w-full space-y-4 text-gray-600 dark:text-white">
      <h1 className="text-center text-3xl font-bold md:text-4xl">
        Top Subject
      </h1>

      <div className="grid grid-cols-2 gap-x-6 gap-y-16 p-4 md:grid-cols-4">
        {categories?.length > 0 &&
          categories.map((category, idx) => {
            const Icon = icons[idx];

            return (
              <TopCategoryItem
                backgroundColor={palette_colors[idx]}
                label={category.name}
                key={category.id}
              >
                <Icon className="text-gray-600" />
              </TopCategoryItem>
            );
          })}
      </div>
    </div>
  );
}
