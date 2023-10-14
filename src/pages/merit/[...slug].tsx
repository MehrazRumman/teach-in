import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import ResultRow from '~/components/features/ResultRow';

const TestCreation = () => {
  const { data: session } = useSession();

  const router = useRouter();
  const page = Number(router.query.page) || 1;
  let slug = router.query.slug;

  // if slug is an array, use the first value
  if (Array.isArray(slug)) {
    slug = slug[0];
  }

  const {
    data: results,

    status,
  } = trpc.test.findTestResultsBySlug.useQuery(
    {
      slug: slug as string,
      userId: session?.user?.id,
      page: page,
    },
    { enabled: !!router.query?.slug },
  );

  // useEffect(() => {
  //   if (results && results.length > 0) {
  //     testCtx?.resetTest();
  //   }
  // }, [results, testCtx]);

  const goToPreviousPage = () => {
    if (page > 1) {
      router.push({ query: { ...router.query, page: page - 1 } });
    }
  };

  const goToNextPage = () => {
    if (results) {
      router.push({ query: { ...router.query, page: page + 1 } });
    }
  };

  return (
    <div className="m-6 flex w-full flex-col items-center justify-center">
      {status === 'loading' ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col lg:w-7/12 lg:px-12">
          {results && (
            <div className="flex flex-col justify-center">
              <div className="mb-2 text-4xl font-bold">
                Merit List of: {results?.test?.name}
              </div>
              {results.results.map((result, index) => (
                <ResultRow
                  id={result.user.id}
                  key={index}
                  result={result}
                  index={(page - 1) * 100 + index + 1}
                />
              ))}

              <div className="mt-4 flex flex-col justify-between md:flex-row">
                <button
                  className="mb-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-900 md:mb-0 md:mr-2"
                  disabled={page === 1}
                  onClick={goToPreviousPage}
                >
                  Previous Page
                </button>
                <button
                  className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-900"
                  onClick={goToNextPage}
                >
                  Next Page
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCreation;
