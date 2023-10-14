import { memo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useIsFirstRender } from 'usehooks-ts';
import {
  MAPPING_COURSE_STATE_LANGUAGE,
  MAPPING_PUBLISH_MODE_LANGUAGE,
} from '~/constants';
import useBook from '~/contexts/BookContext';

import type { Book } from '@prisma/client';
interface IFormInput {
  publishMode: string;
  bookState: string;
  bookPriceSelect: string;
  bookPrice: number;
}

interface BookPublishingProps {
  book?: Book | null;
}

function BookPublishing({ book }: BookPublishingProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const bookCtx = useBook();

  const isFirst = useIsFirstRender();

  const { getValues, register, reset } = useForm<IFormInput>({
    defaultValues: { bookPrice: 0 },
  });

  useEffect(() => {
    if (book) {
      reset({
        publishMode: Object.keys(MAPPING_PUBLISH_MODE_LANGUAGE).find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          (key) => MAPPING_PUBLISH_MODE_LANGUAGE[key] === book.publishMode,
        ),
        bookState: Object.keys(MAPPING_COURSE_STATE_LANGUAGE).find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          (key) => MAPPING_COURSE_STATE_LANGUAGE[key] === book.bookState,
        ),

        bookPriceSelect: book.bookPrice === 0 ? 'Free' : 'Paid',
        bookPrice: book.bookPrice || 0,
      });
    }
  }, [book]);

  useEffect(() => {
    const { publishMode, bookPrice } = getValues();

    if (!isFirst) {
      bookCtx?.updateBook({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        publishMode: MAPPING_PUBLISH_MODE_LANGUAGE[publishMode],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore

        bookPrice: bookPrice,
      });
    }
  }, [bookCtx?.dispatchUpdate]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-6 flex flex-col space-y-6"
    >
      <h1 ref={ref} className="text-3xl">
        3. Release book
      </h1>

      <h3>Private Mode</h3>

      <select
        {...register('publishMode')}
        className="my-4 max-w-md rounded-xl p-4"
      >
        <option value="Public" defaultValue={'Public'}>
          Public
        </option>
        <option value="Private">Private</option>
      </select>

      <h3>Price</h3>

      <div className="flex items-center space-x-4">
        <input
          {...register('bookPrice')}
          type="number"
          placeholder="10 000"
          className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
        />
        <span>Tk</span>
      </div>
    </form>
  );
}

export default memo(BookPublishing);
