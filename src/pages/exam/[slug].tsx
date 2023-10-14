import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Loading from '~/components/buttons/Loading';
import ExamQuestions from '~/components/features/teaching/ExamQuestions';
import Head from '~/components/shared/Head';
import type { TestType } from '~/types';

import { trpc } from '~/utils/trpc';

export default function TestCreation() {
  const { data: session } = useSession();

  const router = useRouter();

  const { data: test } = trpc.test.findTestBySlug.useQuery(
    { slug: router.query.slug as string, userId: session?.user?.id },
    { enabled: !!router.query?.slug },
  );

  return (
    <>
      <Head title="Exam - Teach-In" />

      {test ? (
        <div className="m-6 ">
          <ExamQuestions test={test as TestType} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      )}
    </>
  );
}
