import type { Discussion } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PublicLinkProfile from '~/components/shared/PublicLinkProfile';
import useDiscussion from '~/contexts/DiscussionContext';
import { trpc } from '~/utils/trpc';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

import DiscussStandalone from './DiscussStandalone';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface CommentItemProps {
  originalDiscussionId: string;
  discussion: Discussion & {
    author: {
      id: string | null;
      name: string | null;
      image: string | null;
    };
    replies: (Discussion & {
      author: {
        id: string | null;
        name: string | null;
        image: string | null;
      };
    })[];
  };
}

function CommentItem({ discussion, originalDiscussionId }: CommentItemProps) {
  const { data: session } = useSession();
  const discussionCtx = useDiscussion();
  const [openEditor, setOpenEditor] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);

  const { mutate: deleteDiscussion, status: deleteDiscussionStatus } =
    trpc.user.deleteDiscussion.useMutation();

  const handleDeleteDiscussion = () => {
    const confirm = window.confirm('Confirm deletion?');

    if (confirm) {
      deleteDiscussion({ discussionId: discussion.id });
    }
  };

  useEffect(() => {
    if (deleteDiscussionStatus === 'success') {
      discussionCtx?.refetch();
      toast.success('Delete discussion successful!');
      return;
    }

    if (deleteDiscussionStatus === 'error') {
      toast.error('Delete failed, try again later!');
    }
  }, [deleteDiscussionStatus]);

  return (
    <div className="flex w-full space-x-4 py-2 md:space-x-0">
      {!openEditComment ? (
        <div className="flex w-[15%] justify-center md:w-[10%]">
          <PublicLinkProfile userId={String(discussion.author.id)}>
            <figure className="relative h-16 w-16 overflow-hidden rounded-full md:h-20 md:min-h-[5rem] md:w-20 md:min-w-[5rem]">
              <Image
                fill
                className="absolute rounded-full bg-cover bg-center bg-no-repeat"
                alt="user-avatar"
                src={discussion.author?.image || ''}
              />
            </figure>
          </PublicLinkProfile>
        </div>
      ) : (
        <div className="flex h-fit flex-1 flex-col space-y-2">
          <DiscussStandalone
            discussionId={discussion.id}
            authorId={discussion.author.id}
            handleCancel={() => setOpenEditComment(false)}
            inputType="editDiscuss"
            prevContent={discussion.content}
            originalDiscussionId={originalDiscussionId}
            refetch={() => {
              setOpenEditComment(false);
              discussionCtx?.refetch();
            }}
          />
        </div>
      )}

      {!openEditComment && (
        <MathJaxContext>
          <div className="flex h-fit flex-1 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <PublicLinkProfile userId={String(discussion.author.id)}>
                <h1 className="font-bold">{discussion.author.name}</h1>
              </PublicLinkProfile>

              {session && session?.user?.id === discussion.author.id && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDeleteDiscussion()}
                    className="smooth-effect p-3 hover:text-rose-500"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setOpenEditComment(true)}
                    className="smooth-effect p-3 hover:text-green-500"
                  >
                    <PencilIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
            <MathJax>
              <article
                className={`prose-lg prose min-h-fit min-w-full overflow-x-hidden rounded-xl bg-white p-4 text-gray-600 lg:prose-xl prose-img:rounded-2xl dark:bg-dark-background  dark:text-white/80`}
                dangerouslySetInnerHTML={{ __html: discussion.content }}
              ></article>
            </MathJax>

            <div className="flex space-x-4">
              <button
                onClick={() => setOpenEditor((prev) => !prev)}
                className="smooth-effect w-fit hover:text-yellow-500"
              >
                Reply
              </button>
              <span>·</span>
              <span className="select-none font-light italic text-gray-400 dark:text-white/50">
                {new Date(discussion.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>

            {openEditor && (
              <DiscussStandalone
                inputType="reply"
                authorId={discussion.author.id}
                originalDiscussionId={originalDiscussionId}
                refetch={() => {
                  setOpenEditor(false);
                  discussionCtx?.refetch();
                }}
              />
            )}
          </div>
        </MathJaxContext>
      )}
    </div>
  );
}

export default memo(CommentItem);
