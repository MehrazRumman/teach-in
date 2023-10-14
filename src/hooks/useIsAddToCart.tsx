import type { Book } from '@prisma/client';
import { useEffect, useState } from 'react';
import useCart from '~/contexts/CartContext';

import type { CourseType } from '~/types';

export default function useIsAddToCart({
  course,
  book,
}: {
  course?: CourseType;
  book?: Book;
}) {
  const cartCtx = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (book) {
      if (
        cartCtx?.userWithCart?.cart &&
        book &&
        Array.isArray(cartCtx?.userWithCart?.cart)
      ) {
        setIsAdded(
          cartCtx?.userWithCart?.cart.some((el) => el.bookId === book.id),
        );
      }

      return () => {
        setIsAdded(false);
      };
    } else if (course) {
      if (
        cartCtx?.userWithCart?.cart &&
        course &&
        Array.isArray(cartCtx?.userWithCart?.cart)
      ) {
        setIsAdded(
          cartCtx?.userWithCart?.cart.some((el) => el.courseId === course.id),
        );
      }

      return () => {
        setIsAdded(false);
      };
    }
  }, [cartCtx?.userWithCart?.cart, course, book]);

  return isAdded;
}
