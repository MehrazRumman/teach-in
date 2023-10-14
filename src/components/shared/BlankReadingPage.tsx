import React from 'react';
import usePreviousRoute from '~/contexts/HistoryRouteContext';
import Link from 'next/link';
import { PATHS } from '~/constants';
import { useRouter } from 'next/router';
import { BiBookAlt, BiError } from 'react-icons/bi';

export default function BlankPage() {

  return (
    <div className="absolute-center min-h-screen flex-col space-y-4">
      <h1 className="text-center text-3xl font-bold md:text-4xl">
        Book pdf does not exist or you are not registered or logged in
      </h1>
      <BiBookAlt className="h-32 w-32" />

      <p className="italic">
        if you have not bought then buy it . please make sure you are logged in
        successfully
      </p>

      <div className="flex space-x-4">
        <button className="smooth-effect rounded-xl bg-yellow-300 p-3 text-black hover:bg-yellow-200">
          <Link href={`/`}>Go to Home</Link>
        </button>
        <button className="smooth-effect rounded-xl border border-yellow-300 p-3 hover:border-yellow-200">
          <Link href={'/login'}>Login </Link>
        </button>
      </div>
    </div>
  );
}
