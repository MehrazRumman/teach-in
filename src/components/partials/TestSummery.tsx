import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { RiDraftLine } from 'react-icons/ri';

import { PATHS } from '~/constants';

import TestsDraft from './TestsDraft';

export default function TestSummery() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col space-y-14 pt-[7rem] pb-[5rem] md:pt-[5rem]">
      <div className="mx-auto flex h-[10rem] w-[95%] items-center justify-between rounded border border-dashed border-gray-600 px-6 py-4 dark:border-white md:w-[80%] lg:w-[60%]">
        <p className="italic">Share your awesome Model Test</p>
        <button
          onClick={() => router.push(`${PATHS.CREATE_TEST}`)}
          className="smooth-effect w-fit min-w-fit rounded-xl bg-yellow-100 p-4 text-yellow-800 shadow-xl hover:scale-110 dark:text-gray-700"
        >
          Create a Model Test
        </button>
      </div>

      <div className="mx-auto flex w-[90%] flex-col overflow-x-scroll md:w-[80%]">
        <h1 className="flex space-x-4 text-3xl">
          <RiDraftLine className="h-8 w-8" />
          <span className="font-bold">Compose Model Test</span>
        </h1>
        <TestsDraft />
      </div>

      {/* <TestList verified={'PENDING'}>
        <h1 className="flex space-x-4 text-3xl">
          <VscTasklist className="h-8 w-8" />{' '}
          <span className="font-bold">Awaiting for Approvalt</span>
        </h1>
      </TestList> */}
    </div>
  );
}
