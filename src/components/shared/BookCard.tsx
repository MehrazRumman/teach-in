import Image from 'next/image';
import Link from 'next/link';
import { memo, useState } from 'react';
import { PATHS } from '~/constants';

import type { User } from '@prisma/client';

interface BookCardProps {
  book: {
    addedBy: User;
    name: string;
    slug: string;
    author: string;
    thumbnail: string | null;
    bookPrice: number | null;
    fileLink: string | null;
    briefDescription: string | null;
  };
}

function BookCard({ book }: BookCardProps) {
  return (
    <div className="smooth-effect relative  rounded-2xl border-2 border-gray-600 bg-slate-100 hover:scale-[101%]  dark:border-white/50 dark:bg-slate-900">
      <Link
        href={`/${PATHS.BOOK}/${book.slug}`}
        className="flex h-full flex-col overflow-hidden"
      >
        <figure>
          <Image
            quality={40}
            alt="course-thumbnail"
            src={book.thumbnail || '/images/logo.svg'}
            height={100}
            width={100}
            className=" h-auto w-full rounded-tl-2xl rounded-tr-2xl bg-cover bg-center bg-no-repeat"
          />
        </figure>

        <h1 className="my-2 line-clamp-1 min-h-[1.8rem]  overflow-hidden px-2 text-xl font-bold md:text-2xl">
          {book.name}
        </h1>

        <h2 className="line-clamp-1 px-2 text-lg  font-light text-purple-400 dark:text-white/80 md:text-xl">
          {book.author}
        </h2>

        <div className="flex w-full items-center px-2">
          <h3 className="mb-2 text-xl font-bold text-rose-400 md:text-3xl">
            {Number(book.bookPrice) > 0
              ? new Intl.NumberFormat('bn-BD', {
                  style: 'currency',
                  currency: 'BDT',
                  minimumFractionDigits: 0,
                }).format(Number(book.bookPrice))
              : 'Free'}
          </h3>
        </div>
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-h-3 aspect-w-3 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-700"></div>
  );
}

export default memo(BookCard);
