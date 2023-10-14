import type { Chapter, Question, Lecture, Resource } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useToggle } from 'usehooks-ts';
import { PATHS } from '~/constants';
import { trpc } from '~/utils/trpc';

import type { ReactNode } from 'react';
type ResourceType = Omit<Resource, 'id' | 'createdAt' | 'lectureId'>;

interface LectureType extends Omit<Partial<Lecture>, 'id' | 'chapterId'> {
  resources: ResourceType[];
}

interface ChapterType extends Omit<Chapter, 'id' | 'courseId'> {
  lectures?: LectureType[];
}

export interface QuestionType extends Omit<Question, 'id' | 'categoryId'> {
  category?: { name: string; subCategory: string };
  chapters: ChapterType[];
}

interface QuestionContextValues {
  enrollStatus: 'error' | 'success' | 'idle' | 'loading';
  updateQuestionStatus: 'error' | 'success' | 'idle' | 'loading';
  question: QuestionType | null;
  dispatchUpdate: boolean;
  dispatch: () => void;
  enrollQuestion: (courseSlug: string) => void;
  updateQuestion: (question: Partial<QuestionType>) => void;
  resetQuestion: () => void;
}

interface QuestionContextProps {
  children: ReactNode;
}

const QuestionContext = createContext<QuestionContextValues | null>(null);

export const QuestionContextProvider = ({ children }: QuestionContextProps) => {
  const router = useRouter();
  const [dispatchUpdate, toggle] = useToggle();
  const [question, setQuestion] = useState<QuestionType | null>(null);

  const { data: session } = useSession();

  const [updateQuestionStatus, setUpdateQuestionStatus] = useState<
    'error' | 'success' | 'idle' | 'loading'
  >('idle');

  // console.log('question updating:: ', question);

  const { mutate: enrollQuestionMutate, status: enrollStatus } =
    trpc.question.enrollQuestion.useMutation();

  const updateQuestion = (courseParam: Partial<QuestionType>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore

    setQuestion((prevState) => {
      return { ...prevState, ...courseParam };
    });
  };

  const enrollQuestion = (courseSlug: string) => {
    if (!session?.user?.id) {
      router.push(`/${PATHS.REGISTER}`);
      return;
    }

    enrollQuestionMutate({ slug: courseSlug, userId: session?.user?.id });
  };

  // effect notify toast enroll
  useEffect(() => {
    if (enrollStatus === 'success') {
      toast.success('Question Attempted!');
    }

    if (enrollStatus === 'error') {
      toast.error('Question registration failed! Try later!');
    }
  }, [enrollStatus]);

  // effect create/update question
  useEffect(() => {
    if (question?.question) {
      setUpdateQuestionStatus('loading');

      (async function () {
        try {
          if (!session?.user?.id) throw new Error();

          await axios.post('/api/question/update', {
            ...question,
            userId: session?.user?.id,
          });

          setUpdateQuestionStatus('success');
        } catch (error) {
          setUpdateQuestionStatus('error');
        }
      })();
    }
  }, [question]);

  const resetQuestion = () => {
    setQuestion(null);
  };

  return (
    <QuestionContext.Provider
      value={{
        updateQuestionStatus,
        enrollStatus,
        dispatchUpdate,
        enrollQuestion,
        dispatch: toggle,
        question,
        updateQuestion,
        resetQuestion,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export default function useQuestion() {
  return useContext(QuestionContext);
}
