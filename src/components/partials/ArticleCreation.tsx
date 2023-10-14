import { PencilIcon } from '@heroicons/react/24/outline';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import { PATHS } from '~/constants';
import { trpc } from '~/utils/trpc';
import Loading from '../buttons/Loading';
import { useSession } from 'next-auth/react';
import ArticleCreationInfo from '../features/teaching/ArticleCreationInfo';
import useArticle from '~/contexts/ArticleContext';
import toast from 'react-hot-toast';
import { FiDelete } from 'react-icons/fi';
import axios from 'axios';

export default function ArticleCreation() {
  const { data: session } = useSession();

  const articleCtx = useArticle();
  const router = useRouter();

  const { data: article, isLoading } = trpc.article.findArticleBySlug.useQuery(
    { slug: router.query?.slug as string, userId: session?.user?.id },
    { enabled: !!router.query?.slug },
  );

  const deleteArticle = async (articleId: string) => {
    if (window.confirm('Are you sure to delete this article?')) {
      try {
        if (!articleId) throw new Error();
        await axios.delete(`/api/article/${articleId}`).then((res) => {
          window.history.back();
        });
      } catch (error) {
        // Handle the error here
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col space-y-14 pb-[10rem] pt-[7rem] md:pb-[7rem] md:pt-[5rem]">
        <div className="md:w-[80% mx-auto flex w-[90%] flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="mb-10 flex items-center space-x-4 text-3xl">
              <PencilIcon className="h-8 w-8" />{' '}
              <span className="font-bold">Design a Article</span>
            </h1>

            <button
              onClick={() => {
                router.push(`/${PATHS.TEACHING}/${PATHS.ARTICLE}`);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-yellow-400 px-4 py-3 text-gray-600"
            >
              <span>Return</span>
              <ArrowUturnLeftIcon className="h-8 w-8" />
            </button>

            <button
              onClick={() => {
                deleteArticle(article?.id);
              }}
              className="smooth-effect flex w-fit items-center space-x-2 rounded-xl bg-yellow-400 px-4 py-3 text-gray-600"
            >
              <span>Delete</span>
              <FiDelete className="h-8 w-8" />
            </button>
          </div>

          {isLoading && router.query?.slug ? (
            <div className="absolute-center overflow-hidden">
              <Loading styles="w-10 h-10" />
            </div>
          ) : (
            <>
              <ArticleCreationInfo article={article} />
            </>
          )}
        </div>

        <div className="fixed bottom-10 right-10 z-[350] flex items-center space-x-4">
          <button
            onClick={() => {
              toast.loading('Article is being released...');
              articleCtx?.dispatch();
            }}
            className="smooth-effect group flex items-center space-x-4 rounded-xl border border-gray-600 bg-yellow-200 p-4 dark:border-white dark:text-black"
          >
            <HiOutlineSpeakerphone className="smooth-effect h-8 w-8 group-hover:scale-125" />
            <span>Release</span>
          </button>
        </div>
      </div>
    </>
  );
}
