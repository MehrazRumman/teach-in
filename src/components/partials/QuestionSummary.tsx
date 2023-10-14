import { useSession } from 'next-auth/react';
import router, { useRouter } from 'next/router';
import { SiGoogleclassroom } from 'react-icons/si';
import { Else, If, Then } from 'react-if';
import { trpc } from '~/utils/trpc';

import Loading from '../buttons/Loading';

import { useState, type ReactNode } from 'react';
import type { VerifiedStateType } from '~/types';
import { PATHS } from '~/constants';
import { FaSearch } from 'react-icons/fa';
export default function QuestionCreation() {
  const [searchInput, setSearchInput] = useState(''); // State variable for input value
  const [name, setName] = useState(''); // State variable for input value

  return (
    <div className="flex min-h-screen flex-col space-y-14 pb-[5rem] pt-[7rem] md:pt-[5rem]">
      <QuestionList verified={'APPROVED'} name={name}>
        <h1 className="flex space-x-4 text-3xl">
          <span className="font-bold">Questions you have added</span>
        </h1>
        <div className="my-3 flex w-full items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-l-md border p-2 focus:border-blue-300 focus:outline-none focus:ring"
          />
          <button
            onClick={(e) => {
              setName(searchInput);
            }}
            className="rounded-r-md bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            Search
          </button>
          <div className="ml-2"></div>
        </div>
      </QuestionList>
    </div>
  );
}

function QuestionList({
  children,
  name,
}: {
  children: ReactNode;
  verified: VerifiedStateType;
  name: string;
}) {
  const { data: session } = useSession();

  const { data: questions, isLoading } =
    trpc.question.findquestionsByOwner.useQuery({
      userId: session?.user?.id as string,
      name: name,
    });

  if (Array.isArray(questions) && questions.length === 0) {
    return (
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        {children}
        <h4 className="my-4 italic">No Question yet</h4>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
      {children}
      <If condition={isLoading || !questions}>
        <Then>
          <div className="full-size absolute-center min-h-[25rem]">
            <Loading />
          </div>
        </Then>
        <Else>
          {questions?.questions.map((item, k) => {
            return (
              <div className="flex w-full flex-row" key={k}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`${PATHS.EDIT_QUESTION}?slug=${item.slug}`);
                  }}
                  className="smooth-effect my-2 flex w-full cursor-pointer flex-row justify-between rounded-2xl  px-6 py-4 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400"
                >
                  <div className="mx-3 px-4">{k + 1}</div>
                  <div className="mx-3 w-6/12 pl-4">
                    {/* dengerously hrml */}
                    <div dangerouslySetInnerHTML={{ __html: item.question }} />
                  </div>

                  <div className="mx-3 pl-4 ">{item?.subCategory}</div>
                  <div className="mx-3 w-4/12  pr-4">{item?.testSlug}</div>
                </div>
              </div>
            );
          })}
        </Else>
      </If>
    </div>
  );
}
