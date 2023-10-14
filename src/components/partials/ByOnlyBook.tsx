import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { BsStarFill } from 'react-icons/bs';
import { Else, If, Then } from 'react-if';
import { courseSidebarInViewport } from '~/atoms/courseSidebarAtom';
import { PATHS } from '~/constants';
import useCourse from '~/contexts/CourseContext';
import useIsEnrolled from '~/hooks/useIsEnrolled';

import { StarIcon } from '@heroicons/react/24/outline';

import Loading from '../buttons/Loading';

import type { CourseType } from '~/types';
import useIsAddToCart from '~/hooks/useIsAddToCart';
import useCart from '~/contexts/CartContext';
import type { Book } from '@prisma/client';
import { toast } from 'react-hot-toast';
import useBook from '~/contexts/BookContext';
interface BuyOnlyProps {
  course?: CourseType;
  book?: Book;
  ratingValue: number;
}

export default function BuyOnlyBook({ book, ratingValue }: BuyOnlyProps) {
  const sidebarInViewport = useAtomValue(courseSidebarInViewport);
  const bookCtx = useBook();
  const cartCtx = useCart();

  const router = useRouter();

  const isEnrolled = useIsEnrolled({ book });
  const isAddToCart = useIsAddToCart({ book });

  const handleEnrollBook = () => {
    if (isEnrolled && book?.bookPrice) {
      toast.success('You are already Bought this book once');
    }

    if (!isAddToCart && book && Number(book.bookPrice) > 0) {
      router.push(`/${PATHS.CART}`);
      cartCtx?.addBookToCart(book.id);
      return;
    }

    if (!isEnrolled && isAddToCart) {
      router.push(`/${PATHS.CART}`);
      return;
    }

    if (book?.slug) {
      bookCtx?.enrollBook(book?.slug);
    }
  };

  return (
    <div
      className={`smooth-effect fixed bottom-0 left-0 z-50 flex h-[7rem] w-screen justify-between bg-dark-background px-4 py-2 text-white/80 animate-in fade-in zoom-in dark:bg-white dark:text-gray-600 ${
        sidebarInViewport ? 'lg:hidden ' : ''
      }`}
    >
      <>
        <div className={`hidden max-w-[70%] flex-col py-2 md:flex`}>
          <h1 className="line-clamp-1 font-bold">{book?.name}</h1>

          <div className="flex w-full items-center space-x-2">
            <span className="mr-4">{ratingValue}</span>
            {Array.from(new Array(ratingValue).keys()).map((elem) => {
              return (
                <BsStarFill key={elem} className="h-5 w-5 text-yellow-500" />
              );
            })}
            {Array.from(new Array(5 - ratingValue).keys()).map((elem) => {
              return (
                <StarIcon
                  key={elem}
                  className="h-5 w-5 text-white dark:text-gray-500"
                />
              );
            })}
          </div>
        </div>

        <div className="flex w-full items-center space-x-6 px-4 md:w-[30%] lg:w-[25%]">
          {!isEnrolled && (
            <h1 className="text-2xl font-bold">
              {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT',
                minimumFractionDigits: 0,
              }).format(Number(book?.bookPrice || 0))}
            </h1>
          )}

          <button
            onClick={handleEnrollBook}
            disabled={bookCtx?.enrollStatus === 'loading' || !book}
            className="absolute-center btn-primary btn-lg btn flex-1"
          >
            Buy now
          </button>
        </div>
      </>
    </div>
  );
}
