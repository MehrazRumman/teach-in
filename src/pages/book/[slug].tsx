import { useSession } from 'next-auth/react';
// import RelatedBooks from '~/components/books/RelatedBooks';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useIsClient } from 'usehooks-ts';
import { prisma } from '~/server/db/client';
import type { GetServerSideProps, NextPage } from 'next';
import { PATHS } from '~/constants';
import usePreviousRoute from '~/contexts/HistoryRouteContext';
import { trpc } from '~/utils/trpc';
import BookHeader from '~/components/books/BookHeader';
import type { Book } from '@prisma/client';
import CourseBody from '~/components/courses/CourseBody';
import CourseDescription from '~/components/courses/CourseDescription';
import Head from 'next/head';
import useBook from '~/contexts/BookContext';
import BuyOnlyBook from '~/components/partials/ByOnlyBook';

interface BookPageProps {
  verified?: boolean;
  bookImage?: string;
  bookName?: string;
}

const BookPage: NextPage = ({
  verified,
  bookImage,
  bookName,
}: BookPageProps) => {
  const bookCtx = useBook();
  const router = useRouter();
  const prevRoute = usePreviousRoute();
  const isClient = useIsClient();

  const { status } = useSession();

  const { data: book, refetch } = trpc.book.findBookBySlug.useQuery(
    { slug: router.query.slug as string },
    { enabled: !!router.query.slug && verified },
  );

  const { data: wishList, refetch: refetchWishlist } =
    trpc.user.findWishlist.useQuery(
      { includeBook: false },
      {
        enabled: status === 'authenticated',
      },
    );

  const { mutate: addWishBook, status: addWishBookStatus } =
    trpc.user.addWishBook.useMutation();

  const { mutate: deleteWishBook, status: deleteWishBookStatus } =
    trpc.user.deleteWishBook.useMutation();

  const [festuresData, setFeaturesData] = useState(
    JSON.parse(book?.features || '["defr"]') || ['wdfegr'],
  );

  useEffect(() => {
    console.log('book?.features');
    console.log(book?.features);

    if (book?.features) {
      setFeaturesData(JSON.parse(book?.features || '["bhjnkl"]') || ['swdefv']);
    }
  }, [book?.features]);

  useEffect(() => {
    if (deleteWishBookStatus === 'success') {
      toast.success('Removed from favorites');
      return;
    }
  }, [deleteWishBookStatus]);

  useEffect(() => {
    if (addWishBookStatus === 'success') {
      toast.success('Added to favorites');
      return;
    }
  }, [addWishBookStatus]);

  useEffect(() => {
    if (addWishBookStatus === 'success' || deleteWishBookStatus === 'success') {
      refetchWishlist();
    }

    if (addWishBookStatus === 'error' || deleteWishBookStatus === 'error') {
      toast.error('An error occurred, try again later!');
    }
  }, [addWishBookStatus, deleteWishBookStatus]);

  useEffect(() => {
    if (bookCtx?.enrollStatus === 'success') {
      refetch();
    }
  }, [bookCtx?.enrollStatus]);

  const handleAddWishBook = () => {
    if (status === 'loading' || status === 'unauthenticated') {
      router.push(`/${PATHS.REGISTER}`);
      return;
    }

    if (!book || !book?.id) {
      toast.error('Oops! An error occurred, try again later!');
      return;
    }

    addWishBook({ bookId: book.id });
  };

  const handleDeleteWishBook = (wishlistId: string) => {
    deleteWishBook({ wishlistId });
  };

  const ratingValue = useMemo(() => {
    if (!book && !book?.reviews) return 0;

    return Math.floor(
      book.reviews.reduce((point, review) => {
        if (review.rating) {
          return point + review.rating;
        }
        return point + 0;
      }, 0) / (book.reviews.length > 0 ? book.reviews.length : 1),
    );
  }, [book]);

  if (book && book?.verified !== 'APPROVED' && !book?.published && isClient) {
    router.push(prevRoute?.url || '/');
    return null;
  }

  return (
    <>
      <Head
        title={bookName ? `${bookName} - Teach-In` : 'Book - Teach-In'}
        image={bookImage ? bookImage : undefined}
      />

      <div className="min-h-screen">
        <BookHeader
          wishlist={wishList || []}
          isLoading={
            addWishBookStatus === 'loading' ||
            deleteWishBookStatus === 'loading'
          }
          handleDeleteWishBook={handleDeleteWishBook}
          handleAddWishBook={handleAddWishBook}
          book={book as Book}
          ratingValue={ratingValue}
        >
          {/* <BookSidebar
            handleDeleteWishBook={handleDeleteWishBook}
            isLoading={
              addWishBookStatus === 'loading' ||
              deleteWishBookStatus === 'loading'
            }
            wishlist={wishList || []}
            handleAddWishBook={handleAddWishBook}
            book={book as BookType}
            totalVideoDuration={totalVideoDuration}
            totalLectures={totalLectures || 0}
          /> */}
        </BookHeader>

        {book ? (
          <>
            <CourseBody>
              <div className="smooth-effect mx-auto w-full lg:w-[70%]">
                <h1 className="my-4 text-2xl font-semibold md:text-3xl ">
                  Feature{' '}
                </h1>

                <div className={``}>
                  {festuresData &&
                    festuresData.map((e: string, i: number) => {
                      return (
                        <div
                          className="my-4  overflow-visible rounded-md border bg-purple-100 px-6 py-1 outline-1  fade-in-10"
                          key={i}
                        >
                          <span className="text-purple-900">
                            {i + 1}
                            {'.  '} {e}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <CourseDescription description={book.detailDescription || ''} />
            </CourseBody>
            <BuyOnlyBook book={book as Book} ratingValue={ratingValue} />
          </>
        ) : null}
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// middleware check book has a password
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { slug } = query;

  const book = await prisma?.book.findUnique({
    where: { slug: slug as string },
    select: { verified: true, thumbnail: true, name: true },
  });

  const verified = book?.verified === 'APPROVED';

  return {
    props: {
      verified,
      bookImage: book?.thumbnail,
      bookName: book?.name,
    },
  };
};

export default BookPage;
