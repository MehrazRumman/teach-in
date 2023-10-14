import { memo } from 'react';
import Link from 'next/link';
import useCart from '~/contexts/CartContext';
import { PATHS } from '~/constants';
import { FaCartPlus } from 'react-icons/fa';

function Cart() {
  const cartCtx = useCart();

  return (
    <Link href={`/${PATHS.CART}`} className="relative flex h-full items-center">
      {cartCtx?.userWithCart?.cart && cartCtx?.userWithCart?.cart.length > 0 ? (
        <span className="absolute-center absolute -right-2 -top-2 h-6 w-6 rounded-full bg-sky-500 text-sm text-white">
          {cartCtx?.userWithCart?.cart.length}
        </span>
      ) : null}

      <FaCartPlus className="h-8 w-8 md:h-10 md:w-10" />
    </Link>
  );
}

export default memo(Cart);
