import type { Student, User } from '@prisma/client';
import Link from 'next/link';
import { SiGoogleclassroom } from 'react-icons/si';
import { Else, If, Then } from 'react-if';
import Loading from '~/components/buttons/Loading';
import { PATHS } from '~/constants';
import Image from 'next/image';
import { BsBookshelf } from 'react-icons/bs';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface MyBooksProps {
  status: 'error' | 'success' | 'loading';
  data:
    | (Student & {
        books: {
          author: string;
          id: string;
          name: string;
          slug: string;
          thumbnail: string | null;
        }[];
      })
    | null
    | undefined;
}

export default function MyBooks({ data, status }: MyBooksProps) {
  return (
    <div className="min-h-screen w-full pt-[7rem] md:pt-[5rem]">
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        <h1 className="flex space-x-4 text-3xl">
          <BookOpenIcon className="h-8 w-8" />{' '}
          <span className="font-bold">Read Your Notes</span>
        </h1>

        {status === 'loading' ? (
          <div className="absolute-center min-h-[10rem] w-full">
            <Loading />
          </div>
        ) : (
          <If condition={data?.books && data.books.length > 0}>
            <Then>
              <ul className="mt-4 grid w-full grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-4">
                {data &&
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  data.books.map((book) => {
                    return (
                      <>
                        <div className="smooth-effect relative w-fit rounded-2xl border-2 border-gray-600 bg-slate-100 hover:scale-[101%] dark:border-white/50 dark:bg-slate-900">
                          <Link
                            href={`/reading/${book.id}`}
                            className="flex h-full w-fit  flex-col overflow-hidden  rounded-2xl"
                          >
                            <figure className="rounded-2xl ">
                              <Image
                                alt="book-thumbnail"
                                src={book.thumbnail || ''}
                                height={100}
                                width={100}
                                className="h-auto w-full lg:h-72 lg:w-72"
                              />
                            </figure>
                            <h1 className="my-4 line-clamp-1 overflow-hidden px-2 text-xl font-bold md:text-2xl">
                              {book.name}
                            </h1>
                            <h2 className="line-clamp-1 px-2 text-lg font-light dark:text-white/80 md:text-xl">
                              {book.author}
                            </h2>
                            <h2 className="line-clamp-1 px-2 text-lg font-light dark:text-white/80 md:text-xl">
                              {book.pages} pages
                            </h2>
                          </Link>
                        </div>
                      </>
                    );
                  })}
              </ul>
            </Then>

            <Else>
              <div className="absolute-center min-h-[5rem] w-full">
                <h2 className="text-center">
                  You have not bought any books yet.
                </h2>
              </div>
            </Else>
          </If>
        )}
      </div>
    </div>
  );
}
