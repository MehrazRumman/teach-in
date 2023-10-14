import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { PATHS } from '~/constants';

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    thumbnail: string | null;
    briefDescription: string;
    addedBy: {
      name: string;
    };
  };
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="smooth-effect relative  rounded-2xl border-2 border-gray-600 bg-slate-100 hover:scale-[101%] dark:border-white/50 dark:bg-slate-900 ">
      <Link
        href={`/${PATHS.ARTICLE}/${article.slug}`}
        className="flex h-full flex-col overflow-hidden"
      >
        <figure>
          <Image
            alt={article.title}
            quality={50}
            src={article.thumbnail || '/images/logo.svg'}
            height={100}
            loading="lazy"
            width={100}
            className=" h-auto w-full rounded-tl-2xl rounded-tr-2xl bg-cover bg-center bg-no-repeat"
          />
        </figure>
        <h1 className="my-4 line-clamp-1 min-h-[1.8rem] overflow-hidden px-2 text-xl font-bold md:text-xl">
          {article.title}
        </h1>

        {article.briefDescription ? (
          <span className="my-1 mb-2 line-clamp-2 min-h-[1.6rem] overflow-hidden px-2 text-sm font-bold md:text-sm">
            {article.briefDescription}
          </span>
        ) : (
          <span className="my-1 mb-2 line-clamp-2 min-h-[1.6rem] overflow-hidden px-2 text-sm font-bold md:text-sm">
            {article.addedBy.name}
          </span>
        )}
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-3 aspect-w-4 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(ArticleCard);
