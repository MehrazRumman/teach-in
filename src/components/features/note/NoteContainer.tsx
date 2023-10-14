import { memo, useRef, useEffect, useCallback, useState } from 'react';
import Editor from '~/components/shared/RichEditor';
import CurrentTimeBtn from './CurrentTimeBtn';
import ClientOnly from '~/components/shared/ClientOnly';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import { useSetAtom } from 'jotai';
import { listNoteModalState } from '~/atoms/listNoteModal';
import type QuillComponent from 'react-quill';
import useLecture from '~/contexts/LearningContext';
import { videoCurrentTime } from '~/atoms/videoCurrentTime';
import { useAtomValue } from 'jotai';
import { trpc } from '~/utils/trpc';
import toast from 'react-hot-toast';
import Loading from '~/components/buttons/Loading';

function NoteContainer() {
  const videoCurrentTimeValue = useAtomValue(videoCurrentTime);
  const editorRef = useRef<QuillComponent | null>(null);
  const lectureCtx = useLecture();
  const [text, setText] = useState('');

  const handleDetailDescription = useCallback((value: string) => {
    setText(value);
  }, []);

  const openListNoteModal = useSetAtom(listNoteModalState);

  const {
    mutate: addNote,
    isSuccess,
    isError,
    isLoading,
  } = trpc.user.addNote.useMutation();

  const handleSubmitNote = () => {
    const payload = {
      content: text,
      chapterId: lectureCtx?.currentLecture?.chapterId,
      lectureId: lectureCtx?.currentLecture?.id,
      notchedAt: videoCurrentTimeValue,
    };

    for (const key in payload) {
      if (
        payload[key] === '' ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        toast.error('Oops! An error occurred, try again later!');
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    addNote(payload);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Add successful note');
    }
    if (isError) {
      toast.error('Oops! An error occurred, try again later!');
    }
  }, [isSuccess, isError]);

  return (
    <>
      <div className="flex w-full items-center space-x-4 px-2">
        <div className="my-6 flex h-fit w-fit items-center space-x-4 rounded-xl bg-white p-4 text-base text-gray-600 shadow-lg md:text-xl">
          <span>Note at</span> <CurrentTimeBtn />
        </div>

        <button
          onClick={() => openListNoteModal(true)}
          className="btn-follow-theme btn flex items-center space-x-2 md:btn-lg"
        >
          <ListBulletIcon className="h-8 w-8" />
          <span>List of notes</span>
        </button>
      </div>

      <ClientOnly>
        <Editor
          contents={text || ''}
          onEditorChange={handleDetailDescription}
        />

        <button
          onClick={() => {
            handleSubmitNote();
          }}
          className="absolute-center mx-2 h-[4rem] w-[5rem] rounded-xl bg-white px-4 py-3 text-gray-600 shadow-lg"
        >
          {isLoading ? <Loading /> : <span>Save</span>}
        </button>
      </ClientOnly>
    </>
  );
}

export default memo(NoteContainer);
