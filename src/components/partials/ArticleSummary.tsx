import { useSession } from 'next-auth/react';
import router, { useRouter } from 'next/router';
import { Else, If, Then } from 'react-if';
import { trpc } from '~/utils/trpc';

import Loading from '../buttons/Loading';

import type { ReactNode } from 'react';
import type { VerifiedStateType } from '~/types';
import { PATHS } from '~/constants';
export default function ArticleCreation() {
  return (
    <div className="flex min-h-screen flex-col space-y-14 pb-[5rem] pt-[7rem] md:pt-[5rem]">
      <ArticleList verified={'APPROVED'}>
        <h1 className="flex space-x-4 text-3xl">
          <span className="font-bold">Articles you have added</span>
        </h1>
      </ArticleList>
    </div>
  );
}

function ArticleList({
  children,
}: {
  children: ReactNode;
  verified: VerifiedStateType;
}) {
  const { data: session } = useSession();

  const { data: articles, isLoading } =
    trpc.article.findArticlesByOwner.useQuery({
      userId: session?.user?.id as string,
    });

  if (Array.isArray(articles) && articles.length === 0) {
    return (
      <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
        {children}
        <h4 className="my-4 italic">No Article yet</h4>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[90%] flex-col md:w-[80%]">
      <div className="mx-auto flex h-[10rem] w-[95%] items-center justify-between rounded border border-dashed border-gray-600 px-6 py-4 dark:border-white md:w-[80%] lg:w-[60%]">
        <p className="italic">Share your awesome Article</p>
        <button
          onClick={() => router.push(`${PATHS.CREATE_ARTICLE}`)}
          className="smooth-effect w-fit min-w-fit rounded-xl bg-yellow-100 p-4 text-yellow-800 shadow-xl hover:scale-110 dark:text-gray-700"
        >
          Create a Article
        </button>
      </div>

      {children}
      <If condition={isLoading || !articles}>
        <Then>
          <div className="full-size absolute-center min-h-[25rem]">
            <Loading />
          </div>
        </Then>
        <Else>
          {articles?.articles.map((item, k) => {
            return (
              <div className="flex w-full flex-row" key={k}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`${PATHS.EDIT_ARTICLE}?slug=${item.slug}`);
                  }}
                  className="smooth-effect my-2 flex w-full cursor-pointer flex-row justify-between rounded-2xl  px-6 py-4 odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400"
                >
                  <div className="mx-3 px-4">{k + 1}</div>
                  <div className="mx-3 w-6/12 pl-4">
                    {/* dengerously hrml */}
                    <div dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Else>
      </If>
    </div>
  );
}
