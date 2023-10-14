import { atom } from 'jotai';

export const questionContents = atom<
  {
    question: string;
    explanation: string;
    order: number;

    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    correctOptionIndex: number;

    boardExams: {
      year: number;
      exam: string;
    }[];
    tags: {
      name: string;
    }[];
    image: string;
  }[]
>([]);
