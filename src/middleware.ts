import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { PATHS } from '~/constants';
    req.nextUrl.pathname.includes(PATHS.LEARNING) ||
    req.nextUrl.pathname.includes(PATHS.ADMIN) ||
    req.nextUrl.pathname.includes(PATHS.CART) ||
    // req.nextUrl.pathname.includes(PATHS.EXAM) ||
    req.nextUrl.pathname.includes(PATHS.MY_LEARNING)
    // ||
    // req.nextUrl.pathname.includes(PATHS.PAYMENT_STATUS)
  ) {
    const session = await getToken({
      req,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

}
