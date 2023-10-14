import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import Head from '~/components/shared/Head';
import { trpc } from '~/utils/trpc';
import Image from 'next/image';

import BlankReadingPage from '~/components/shared/BlankReadingPage';
import { BsBook } from 'react-icons/bs';

import { Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import SearchSidebarDefaultLayout from './SearchSidebarDefaultLayout';
import toast from 'react-hot-toast';

const LearningPage: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const courseSlug = useMemo(() => {
    if (router.query.params?.length) {
      return router.query.params[0];
    }

    return '';
  }, [router.query]);

  const { data: book } = trpc.book.findBookId.useQuery({
    id: courseSlug as string,
    userId: session?.user?.id as string,
  });

  // // check user cheat on lecture path or not enroll yet
  // if (!book || !book?.name || !book?.bookPrice) {
  //   return <BlankReadingPage />;
  // }

  return (
    <div>
      <Head title="Reading- Teach-In" />
      {/* Nav bar with having info about book - image , name , writterName, page */}
      <div className="mx-auto w-full md:max-w-[720px] lg:max-w-[1200px]">
        <div className=" mt-auto w-full flex-col overflow-clip rounded-tl-2xl rounded-tr-2xl bg-[#EEEEEE] dark:bg-[#292929] md:mx-10  ">
          <div className=" flex flex-row justify-between">
            <div
              className=" flex flex-row items-center space-x-4
          p-4"
            >
              <Image
                src={book?.thumbnail || '/images/logo.svg'}
                alt="book"
                height={40}
                width={40}
                className="h-12 w-12 rounded object-cover  md:h-20 md:w-20"
              />
              <div className="flex flex-col ">
                <h1 className="text-gray text font-bold md:text-4xl">
                  {book?.name}
                </h1>
                <h1 className="text-gray text-xl md:text-2xl">
                  {book?.author}
                </h1>
              </div>
            </div>

            <div
              className=" flex flex-row items-center space-x-4
          p-4"
            >
              <span>
                <BsBook className=" inline-block h-6 w-6" /> {book.pages} Pages
              </span>
            </div>
          </div>
        </div>

        <div className=" mt-auto w-full flex-col   md:mx-10 md:rounded-2xl ">
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.7.570/build/pdf.worker.js">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '120vh',
                  width: '100%',
                  margin: '0 auto',
                }}
              >
                {book?.pdfFileLink ? (
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <SearchSidebarDefaultLayout
                      fileUrl={book?.pdfFileLink}
                      keywords={[]}
                    />
                  </div>
                ) : (
                  <div className="my-10 h-48 items-center justify-center text-center text-3xl font-bold ">
                    This book doesnt have any pdf format yet
                  </div>
                )}
              </div>
            </Worker>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
