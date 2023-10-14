import type {
  Chapter,
  Course,
  Question,
  Lecture,
  Review,
  Resource,
  VERIFIED_STATE,
  Student,
  Discussion,
  User,
  Announcement,
  Test,
  Result,
} from '@prisma/client';

import type { Server as NetServer, Socket } from 'net';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface Progress {
  id: string;
  title: string;
  description: string;
  isPreview: boolean;
  order: number;
  chapterId: string;
}

export type StudentProgressType =
  | (Student & {
      progress: LearningProgress &
        {
          Lecture: Lecture[];
        }[];
    })
  | null
  | undefined;

export type VerifiedStateType = VERIFIED_STATE;

export type LearningOptions =
  | 'note'
  | 'discuss'
  | 'tools'
  | 'test'
  | 'resources'
  | 'announce';

export type ResourceType = Omit<Resource, 'lectureId' | 'courseSlug'>;

export interface LectureType extends Lecture {
  resources: ResourceType[];
  discussions: Discussion[];
}
export interface OptionType extends Option {
  option: string | undefined;
  shouldShowInput: boolean;
  order: number;
  isAnswer: boolean;
}
export interface ChapterType extends Omit<Chapter, 'id' | 'courseId'> {
  lectures?: LectureType[];
}

export interface CourseType extends Course {
  chapters: ChapterType[];
  reviews: Review[];
  students: Student[];
  instructor: User;
  announcements: Announcement[];
  category: { id: string; name: string };
  courseTargets: {
    id: string;
    content: string;
    courseSlug: string;
    courseId: string;
  }[];
  courseRequirements: {
    id: string;
    content: string;
    courseSlug: string;
    courseId: string;
  }[];
}

export interface QuestionType extends Question {
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;

  correctOptionIndex: number;
  boardExams: string[];
  tags: string[];
  order: number;
  addedBy: User;
  subCategory: string;
  explanation: string | undefined;
  category: { id: string; name: string };
}
export interface TestType extends Test {
  [x: string]: string;
  testLevel: string | undefined;
  addedBy: User;
  password: string | undefined;
  price: number | undefined;
  questions: QuestionType[];
  subCategory: string;
  results: Result[];
  category: { id: string; name: string };
}
