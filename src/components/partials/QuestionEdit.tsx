import type { Question } from '@prisma/client';
import { useRouter } from 'next/router';
import Loading from '~/components/buttons/Loading';
import Head from '~/components/shared/Head';

import { trpc } from '~/utils/trpc';
import EditQuestion from '../features/teaching/EditQuestion';

export default function QuestionEdit() {
  const router = useRouter();

  const { data: question } = trpc.question.findQuestionBySlug.useQuery({
    slug: router.query.slug as string,
  });

  return (
    <>
      <Head title="Edit Question" />

      {question ? (
        <div className="m-6 ">
          <EditQuestion q={question as Question} />
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
