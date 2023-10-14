import Image from 'next/image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Editor from '~/components/shared/RichEditor';

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useLecture from '~/contexts/LearningContext';
import { trpc } from '~/utils/trpc';
import Loading from '~/components/buttons/Loading';

interface DiscussStandaloneProps {
  inputType: 'announcement' | 'discuss' | 'reply' | 'editDiscuss';
  customStatus?: string;
  prevContent?: string;
  discussionId?: string;
  originalDiscussionId?: string;
  authorId?: string | null;
  customSubmit?: (content: string) => void;
  refetch?: () => void;
  handleCancel?: () => void;
}

function DiscussStandalone({
  inputType,
  discussionId,
  prevContent,
  handleCancel,
  originalDiscussionId,
  customStatus,
  refetch,
  authorId,
  customSubmit,
}: DiscussStandaloneProps) {
  const [text, setText] = useState('');

  const handleDetailDescription = useCallback((value: string) => {
    setText(value);
  }, []);

  const { data: session } = useSession();
  const lectureCtx = useLecture();
  const router = useRouter();

  const {
    mutate: createAnnouncement,
    isSuccess: isCreateAnnouncementSuccess,
    isError: isCreateAnnouncementError,
    isLoading: isCreateAnnouncementLoading,
  } = trpc.course.createAnnouncement.useMutation();

  const { mutate: addDiscussion, status: addDiscussionStatus } =
    trpc.user.addDiscussion.useMutation();

  const { mutate: updateDiscussion, status: updateDiscussionStatus } =
    trpc.user.updateDiscussion.useMutation();

  const handleSubmitContent = async () => {
    try {
      if (inputType === 'announcement') {
        const payload = {
          content: text as string,
          courseId: (lectureCtx?.course && lectureCtx?.course.id) || '',
        };

        if (!payload.content || !payload.courseId) {
          toast.error('Oops! Error, try again later!');
          return;
        }

        createAnnouncement({ content: payload.content, id: payload.courseId });
        return;
      }

      if (inputType === 'discuss') {
        const payload = {
          content: text as string,
          courseId: lectureCtx?.currentLecture?.id,
        };

        if (!payload.content || !lectureCtx?.currentLecture?.id) {
          toast.error('Oops! Error, try again later!');
          return;
        }

        addDiscussion({
          content: payload.content,
          lectureId: lectureCtx?.currentLecture?.id,
        });
        await axios.post(`/api/notification`, {
          location: router.asPath,
          userId: lectureCtx?.course?.instructor.id,
          content: `Have Student discuss your Course ${lectureCtx.course?.name}`,
        });
        return;
      }

      if (inputType === 'reply') {
        const payload = {
          content: text as string,
          courseId: lectureCtx?.currentLecture?.id,
          originalDiscussionId,
        };

        if (!payload.content || !lectureCtx?.currentLecture?.id) {
          toast.error('Oops! Error, try again later!');
          return;
        }

        addDiscussion({
          content: payload.content,
          lectureId: lectureCtx?.currentLecture?.id,
          replyId: payload.originalDiscussionId,
        });
        await axios.post(`/api/notification`, {
          location: router.asPath,
          userId: authorId,
          content: `Someone replied to discuss on you Course ${lectureCtx.course?.name}`,
        });
        return;
      }

      if (inputType === 'editDiscuss' && discussionId) {
        const payload = {
          content: text as string,
          id: discussionId,
        };

        if (prevContent === text && refetch && typeof refetch === 'function') {
          refetch();
          return;
        }

        updateDiscussion({ content: payload.content, id: payload.id });

        return;
      }
    } catch (error) {
      toast.error('Oops! Error, try again later!');
    }
  };

  useEffect(() => {
    if (
      updateDiscussionStatus === 'success' &&
      refetch &&
      typeof refetch === 'function'
    ) {
      refetch();
    }

    if (updateDiscussionStatus === 'error') {
      toast.error('Oops! Error, try again later!');
    }
  }, [updateDiscussionStatus]);

  useEffect(() => {
    if (
      addDiscussionStatus === 'success' &&
      refetch &&
      typeof refetch === 'function'
    ) {
      refetch();
    }

    if (addDiscussionStatus === 'error') {
      toast.error('Oops! Error, try again later!');
    }
  }, [addDiscussionStatus]);

  useEffect(() => {
    if (isCreateAnnouncementSuccess && inputType === 'announcement') {
      toast.success('Posted');
      if (refetch && typeof refetch === 'function') {
        refetch();
      }
    }

    if (isCreateAnnouncementError) {
      toast.error('Oops! Error, try again later!');
    }
  }, [isCreateAnnouncementSuccess, isCreateAnnouncementError]);

  return (
    <div className="flex">
      <div className="flex w-[15%] sm:w-[10%] md:w-[8%]">
        <figure className="relative h-20 w-20 overflow-hidden rounded-full">
          <Image
            fill
            className="absolute rounded-full bg-cover bg-center bg-no-repeat"
            alt="user-avatar"
            src={session?.user?.image || ''}
          />
        </figure>
      </div>

      <Editor contents={text || ''} onEditorChange={handleDetailDescription} />

      <button
        onClick={() => {
          if (customSubmit && typeof customSubmit === 'function') {
            customSubmit(text as string);
            return;
          }
          handleSubmitContent();
        }}
        className="absolute-center mx-2 h-[4rem] w-[5rem] rounded-xl bg-white px-4 py-3 text-gray-600 shadow-lg"
      >
        {isCreateAnnouncementLoading ||
        customStatus === 'loading' ||
        addDiscussionStatus === 'loading' ||
        updateDiscussionStatus === 'loading' ? (
          <Loading />
        ) : (
          <span>Save</span>
        )}
      </button>
    </div>
  );
}

export default memo(DiscussStandalone);
