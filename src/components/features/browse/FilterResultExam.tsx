import { useRouter } from 'next/router';
import { Else, If, Then } from 'react-if';
import { useMediaQuery } from 'usehooks-ts';
import { trpc } from '~/utils/trpc';

import Pagination from '~/components/features/browse/Pagination';
import TestCard, { CardSkeleton } from '~/components/shared/TestCard';
import { useSession } from 'next-auth/react';

export default function FilterExam() {
  const matchesMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const numberSkeleton = matchesMobile ? 4 : 15;

  const { data: session } = useSession();

  const { data, status } = trpc.test.findTestsByFilters.useQuery({
    limit: 15,
    userId: session?.user?.id,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    page: router.query?.page ? router.query.page : '1',
    ...router.query,
  });

  return (
    <div className="mt-10 w-full ">
      <If condition={status === 'loading'}>
        <Then>
          {Array.from(new Array(numberSkeleton).keys()).map((e) => {
            return <CardSkeleton key={e} />;
          })}
        </Then>
        <Else>
          {data?.tests && data.tests.length > 0 ? (
            data.tests.map((test, i) => {
              return (
                <TestCard
                  key={test.id}
                  test={test}
                  index={
                    i +
                    1 +
                    (router.query?.page == undefined
                      ? 0
                      : (Number(router.query?.page) - 1) * 15)
                  }
                />
              );
            })
          ) : (
            <h4 className="col-span-2 w-full text-center text-2xl md:col-span-4 lg:col-span-6">
              The test you are looking for is not available yet!
            </h4>
          )}
        </Else>
      </If>
      {data?.totalPages ? <Pagination totalPages={data?.totalPages} /> : null}
    </div>
  );
}
