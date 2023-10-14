import type { Book } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useToggle } from 'usehooks-ts';
import { PATHS } from '~/constants';
import { trpc } from '~/utils/trpc';

import type { ReactNode } from 'react';

export interface BookType extends Omit<Book, 'id' | 'categoryId'> {
  category?: { name: string; subCategory: string };
}

interface BookContextValues {
  enrollStatus: 'error' | 'success' | 'idle' | 'loading';
  updateBookStatus: 'error' | 'success' | 'idle' | 'loading';
  book: BookType | null;
  dispatchUpdate: boolean;
  dispatch: () => void;
  enrollBook: (bookSlug: string) => void;
  updateBook: (book: Partial<BookType>) => void;
  resetBook: () => void;
}

interface BookContextProps {
  children: ReactNode;
}

const BookContext = createContext<BookContextValues | null>(null);

export const BookContextProvider = ({ children }: BookContextProps) => {
  const router = useRouter();
  const [dispatchUpdate, toggle] = useToggle();
  const [book, setBook] = useState<BookType | null>(null);

  const { data: session } = useSession();

  const [updateBookStatus, setUpdateBookStatus] = useState<
    'error' | 'success' | 'idle' | 'loading'
  >('idle');

  // console.log('book updating:: ', book);

  const { mutate: enrollBookMutate, status: enrollStatus } =
    trpc.book.enrollBook.useMutation();

  const updateBook = (bookParam: Partial<BookType>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore

    setBook((prevState) => {
      return { ...prevState, ...bookParam };
    });
  };

  const enrollBook = (bookSlug: string) => {
    if (!session?.user?.id) {
      router.push(`/${PATHS.REGISTER}`);
      return;
    }

    enrollBookMutate({ slug: bookSlug, userId: session?.user?.id });
  };

  // effect notify toast enroll
  useEffect(() => {
    if (enrollStatus === 'success') {
      toast.success('Book registration successful!');
    }

    if (enrollStatus === 'error') {
      //toast.error('Book registration failed! Try later!');
    }
  }, [enrollStatus]);

  // effect create/update book
  useEffect(() => {
    if (book?.name) {
      setUpdateBookStatus('loading');

      (async function () {
        try {
          if (!session?.user?.id) throw new Error();

          await axios.post('/api/book/update', {
            ...book,
            userId: session?.user?.id,
          });

          setUpdateBookStatus('success');
        } catch (error) {
          setUpdateBookStatus('error');
        }
      })();
    }
  }, [book, session?.user?.id]);

  const resetBook = () => {
    setBook(null);
  };

  return (
    <BookContext.Provider
      value={{
        updateBookStatus,
        enrollStatus,
        dispatchUpdate,
        enrollBook,
        dispatch: toggle,
        book,
        updateBook,
        resetBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export default function useBook() {
  return useContext(BookContext);
}
