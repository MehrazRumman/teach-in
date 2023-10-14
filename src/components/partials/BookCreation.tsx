import { PencilIcon } from '@heroicons/react/24/outline';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import { PATHS } from '~/constants';
import useBook from '~/contexts/BookContext';
import BookCreationInfo from '../features/teaching/BookCreationInfo';
import BookPublishing from '../features/teaching/BookPublishing';
import { trpc } from '~/utils/trpc';
import Loading from '../buttons/Loading';
import { useSession } from 'next-auth/react';
import { GrOrderedList } from 'react-icons/gr';

export default function BookCreation() {
  const { data: session } = useSession();

  const bookCtx = useBook();
  const router = useRouter();

  const { data: book, isLoading } = trpc.book.findBookBySlug.useQuery(
    { slug: router.query?.slug as string, userId: session?.user?.id },
    { enabled: !!router.query?.slug },
  );

  return (
    <>
      <div className="flex min-h-screen flex-col space-y-14 pb-[10rem] pt-[7rem] md:pb-[7rem] md:pt-[5rem]">
        <div className="md:w-[80% mx-auto flex w-[90%] flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="mb-10 flex items-center space-x-4 text-3xl">
              <PencilIcon className="h-8 w-8" />{' '}
              <span className="font-bold">Design a Book</span>
            </h1>
            <button
              onClick={() => {
                router.push(`/book_orders/`);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-green-400 px-4 py-3 text-gray-600"
            >
              <span>Orders</span>
              <GrOrderedList className="h-8 w-8" />
            </button>
            <button
              onClick={() => {
                router.push(`/${PATHS.TEACHING}/${PATHS.BOOK}`);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-yellow-400 px-4 py-3 text-gray-600"
            >
              <span>Return</span>
              <ArrowUturnLeftIcon className="h-8 w-8" />
            </button>
          </div>

          {isLoading && router.query?.slug ? (
            <div className="absolute-center overflow-hidden">
              <Loading styles="w-10 h-10" />
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BookCreationInfo book={book} />

              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <BookPublishing book={book} />
            </>
          )}
        </div>

        <div className="fixed bottom-10 right-10 z-[350] flex items-center space-x-4">
          <button
            onClick={() => {
              bookCtx?.dispatch();
            }}
            className="smooth-effect group flex items-center space-x-4 rounded-xl border border-gray-600 bg-yellow-200 p-4 hover:scale-110 dark:border-white dark:text-red-400 dark:hover:text-red-500"
          >
            <HiOutlineSpeakerphone className="smooth-effect h-8 w-8 group-hover:scale-125" />
            <span>Publish</span>
          </button>
        </div>
      </div>
    </>
  );
}
