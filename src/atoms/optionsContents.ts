import { atom } from 'jotai';

export const optionsContents = atom<
  {
    option: string;
    isAnswer: boolean;
    questionOrder: number;
    order: number;
  }[]
>([]);
