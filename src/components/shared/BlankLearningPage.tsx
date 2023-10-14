import React from 'react';
import { GiSchoolBag } from 'react-icons/gi';
import usePreviousRoute from '~/contexts/HistoryRouteContext';
import Link from 'next/link';
import { PATHS } from '~/constants';
import { useRouter } from 'next/router';
import { BiError } from 'react-icons/bi';

export default function BlankPage() {
  const router = useRouter();
  const prevRoute = usePreviousRoute();

  return (
    <div className="absolute-center min-h-screen flex-col space-y-4">
      <h1 className="text-center text-3xl font-bold md:text-4xl">
        Course does not exist or you are not registered or logged in
      </h1>
      <BiError className="h-32 w-32" />

      <p className="italic">
        if you have enrolled then please make sure you are logged in
        successfully
      </p>

      <div className="flex space-x-4">
        <button className="smooth-effect rounded-xl bg-yellow-300 p-3 text-black hover:bg-yellow-200">
          <Link
            href={`/${PATHS.COURSE}/${
              router.query.params && router.query.params?.length > 0
                ? router.query.params[0]
                : ''
            }`}
          >
            Login
          </Link>
        </button>
        <button className="smooth-effect rounded-xl border border-yellow-300 p-3 hover:border-yellow-200">
          <Link href={prevRoute?.url || '/'}>Return</Link>
        </button>
      </div>
    </div>
  );
}
