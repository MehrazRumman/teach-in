import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { memo, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BiCategoryAlt } from 'react-icons/bi';
import { FiTrash } from 'react-icons/fi';
import { GiArcheryTarget } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import { MdDriveFileRenameOutline, MdOutlineDraw } from 'react-icons/md';
import { useIsFirstRender } from 'usehooks-ts';
import Editor from '~/components/shared/RichEditor';
import {
  categories_detail,
  LEVELS_LABEL,
  MAPPING_LEVEL_LANGUAGE,
  PATHS,
  QUESTION_LEVEL,
  uploader,
} from '~/constants';
import useQuestion from '~/contexts/QuestionContext';
import Image from 'next/image';

import {
  CheckIcon,
  LinkIcon,
  PhotoIcon,
  ArrowUpOnSquareIcon,
} from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

import type QuillComponent from 'react-quill';
import type { QuestionType } from '~/types';
export interface IFormInput {
  briefQuestion: string;
  questionTags: string[];
  questionLevel: string;
  questionBoardExams: string[];
  category: string;
  subCategory: string;
  category_details: string;
}

interface QuestionCreationInfoProps {
  question?: QuestionType | null;
}

function QuestionCreationInfo({ question }: QuestionCreationInfoProps) {
  const { data: session } = useSession();
  const questionCtx = useQuestion();
  const router = useRouter();
  const isFirst = useIsFirstRender();

  const editorRef = useRef<QuillComponent | null>(null);

  const [imageURL, setImageURL] = useState(() => {
    if (question?.image) return question.image;
    return '';
  });

  const {
    reset,
    getValues,
    control,
    register,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      briefQuestion: question?.question || '',
    },
  });

  useEffect(() => {
    if (question) {
      reset({
        briefQuestion: question.question,
        category: question.category.name,
        questionBoardExams:
          question.boardExams.length > 0
            ? question.boardExams.map(
                (target) => target.name + ' ' + target.year,
              )
            : [' '],

        questionTags:
          question.tags.length > 0
            ? question.tags.map((target) => target.content)
            : [' '],

        questionLevel: Object.keys(QUESTION_LEVEL).find(
          (key) => MAPPING_LEVEL_LANGUAGE[key] === question.questionLevel,
        ),
      });
    }
  }, [question]);

  const {
    fields: questionTargetsFields,
    append: questionTargetsAppend,
    remove: questionTargetsRemove,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    name: 'questionTargets',
  });

  const {
    fields: questionRequirementsFields,
    append: questionRequirementsAppend,
    remove: questionRequirementsRemove,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    name: 'questionRequirements',
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-4 flex flex-col"
    >
      <h1 className="text-3xl">Basic information</h1>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <h2 className="flex items-center space-x-3">
            <BiCategoryAlt className="h-8 w-8" /> <span>Category Question</span>
          </h2>
        </div>

        <select
          {...register('category')}
          className="my-4 max-w-md rounded-xl p-4"
        >
          <option disabled defaultValue="Category:">
            Category:
          </option>
          {categories_detail.map((category) => {
            return (
              <option value={category.title} key={category.title}>
                {category.title}
              </option>
            );
          })}
        </select>

        {watch('category') && (
          <select
            {...register('category_details')}
            className="my-4 max-w-md rounded-xl p-4"
          >
            <option disabled defaultValue="Category chi tiết">
              Category detail:
            </option>
            {categories_detail
              .find((e) => e.title === watch('category'))
              ?.fields.map((category_details) => {
                return (
                  <option value={category_details} key={category_details}>
                    {category_details}
                  </option>
                );
              })}
          </select>
        )}
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" /> <span>Short description</span>
          </h2>
          <span className="text-xl italic">(Up to 500 characters)</span>
        </div>

        <input
          {...register('briefQuestion', { maxLength: 500 })}
          type="text"
          placeholder="Question..."
          className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" /> <span>Question....</span>
          </h2>
          <span className="text-xl italic">(Up to 5000 characters)</span>
        </div>

        <Editor
          contents={question?.question || ''}
          styles="lg:max-w-[70%] px-0 my-2"
          getInstance={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <PhotoIcon className="h-8 w-8" /> <span>Question avatar</span>
          </h2>
          <span className="text-xl italic">
            Required when releasing the question
          </span>
        </div>

        {imageURL && (
          <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl  md:max-w-3xl">
            <figure className="aspect-w-16 aspect-h-9 relative">
              <Image
                alt="question-thumbnail"
                src={imageURL}
                className="absolute inset-0 object-cover object-center"
                fill
              />
            </figure>
          </div>
        )}
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GiArcheryTarget className="h-8 w-8" /> <span>Question Tags</span>
          </h2>
          <span className="text-xl italic">
            (Tag like Force, Newtons Law, gravitational constants...)
          </span>
        </div>

        {questionTargetsFields.map((item, index) => {
          return (
            <input
              {...register(`questionTags.${index}` as const)}
              key={item.id}
              type="text"
              className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
            />
          );
        })}

        <div className="flex items-center justify-between md:w-1/2">
          <button
            onClick={() => questionTargetsAppend(' ', { shouldFocus: false })}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <PlusIcon className="h-8 w-8" /> <span>Add Tag</span>{' '}
          </button>

          <button
            onClick={() => questionTargetsRemove(1)}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <FiTrash className="h-8 w-8" /> <span>Delete</span>{' '}
          </button>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <CheckIcon className="h-8 w-8 dark:fill-white" /> <span>Exams</span>
          </h2>
          <span className="text-xl italic md:w-3/4">
            (Where this question was appeared before)
          </span>
        </div>

        {questionRequirementsFields.map((item, index) => {
          return (
            <div key={index}>
              <input
                {...register(`questionBoardExams.${index}` as const)}
                key={item.id}
                type="text"
                className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
              />

              <input
                {...register(`questionBoardExams.${index}` as const)}
                key={item.id}
                type="number"
                className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
              />
            </div>
          );
        })}

        <div className="flex items-center justify-between md:w-1/2">
          <button
            onClick={() =>
              questionRequirementsAppend(' ', { shouldFocus: false })
            }
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <PlusIcon className="h-8 w-8" /> <span>More request</span>{' '}
          </button>

          <button
            onClick={() => questionRequirementsRemove(1)}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <FiTrash className="h-8 w-8" /> <span>Delete</span>{' '}
          </button>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GrUserExpert className="h-8 w-8" /> <span>Difficulty Level?</span>
          </h2>
          <span className="text-xl italic">
            (Difficulty can be Easy, Medium, Hard and Advanced!)
          </span>
        </div>

        <select
          {...register('questionLevel')}
          className="my-4 max-w-md rounded-xl p-4"
        >
          <option disabled defaultValue={'Object:'}>
            Object:
          </option>
          {LEVELS_LABEL.map((level) => {
            return (
              <option value={level} key={level}>
                {level}
              </option>
            );
          })}
        </select>
      </div>
    </form>
  );
}

export default memo(QuestionCreationInfo);
