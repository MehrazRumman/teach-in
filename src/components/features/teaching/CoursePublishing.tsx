import { useSetAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntersectionObserver, useIsFirstRender } from 'usehooks-ts';
import { createCourseSteps } from '~/atoms/createCourseSteps';
import {
  MAPPING_COURSE_STATE_LANGUAGE,
  MAPPING_PUBLISH_MODE_LANGUAGE,
} from '~/constants';
import useCourse from '~/contexts/CourseContext';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import type { CourseType } from '~/types';

import type { UseFormRegister } from 'react-hook-form';
interface IFormInput {
  publishMode: string;
  courseState: string;
  password: string;
  coursePriceSelect: string;
  coursePrice: number;
  courseFakePrice: number;
}

interface CoursePublishingProps {
  course?: CourseType | null;
}

function PasswordInput({
  register,
}: {
  register: UseFormRegister<IFormInput>;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h3>Course password</h3>
      <div className="my-2 flex items-center">
        <input
          autoComplete="new-password"
          {...register('password')}
          className="rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
          type={showPassword ? 'text' : 'password'}
        />

        <button
          onClick={() => setShowPassword((prevState) => !prevState)}
          className="p-4"
        >
          {!showPassword ? (
            <EyeIcon className="h-8 w-8" />
          ) : (
            <EyeSlashIcon className="h-8 w-8" />
          )}
        </button>
      </div>
    </>
  );
}

function CoursePublishing({ course }: CoursePublishingProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const setStep = useSetAtom(createCourseSteps);

  const courseCtx = useCourse();

  const isFirst = useIsFirstRender();

  const { getValues, register, watch, reset } = useForm<IFormInput>({
    defaultValues: { coursePrice: 0, courseFakePrice: 0 },
  });

  useEffect(() => {
    if (course) {
      reset({
        publishMode: Object.keys(MAPPING_PUBLISH_MODE_LANGUAGE).find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          (key) => MAPPING_PUBLISH_MODE_LANGUAGE[key] === course.publishMode,
        ),
        courseState: Object.keys(MAPPING_COURSE_STATE_LANGUAGE).find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          (key) => MAPPING_COURSE_STATE_LANGUAGE[key] === course.courseState,
        ),
        password: course.password || '',
        coursePriceSelect: course.coursePrice === 0 ? 'Free' : 'Paid',
        coursePrice: course.coursePrice || 0,
        courseFakePrice: course.courseFakePrice || 0,
      });
    }
  }, [course]);

  useEffect(() => {
    if (!!entry?.isIntersecting) {
      setStep((prevStep) => ++prevStep);
    } else {
      setStep((prevStep) => (prevStep > 1 ? --prevStep : prevStep));
    }
  }, [entry]);

  useEffect(() => {
    const {
      publishMode,
      courseState,
      coursePriceSelect,
      coursePrice,
      courseFakePrice,
      password,
    } = getValues();

    if (!isFirst) {
      courseCtx?.updateCourse({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        publishMode: MAPPING_PUBLISH_MODE_LANGUAGE[publishMode],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        courseState: MAPPING_COURSE_STATE_LANGUAGE[courseState],
        coursePrice: coursePriceSelect === 'Free' ? 0 : coursePrice,
        courseFakePrice: coursePriceSelect === 'Free' ? 0 : courseFakePrice,
        password: publishMode === 'Public' ? null : password,
      });
    }
  }, [courseCtx?.dispatchUpdate]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-6 flex flex-col space-y-6"
    >
      <h1 ref={ref} className="text-3xl">
        3. Release course
      </h1>

      <h3>Private Mode</h3>

      <select
        {...register('publishMode')}
        className="my-4 max-w-md rounded-xl p-4"
      >
        <option value="Public" defaultValue={'Public'}>
          Public
        </option>
        <option value="Private">Private</option>
      </select>

      {watch('publishMode')?.toLowerCase() === 'private' && (
        <PasswordInput register={register} />
      )}

      <h3>Is it Free?</h3>
      <select
        {...register('coursePriceSelect')}
        className="my-4 max-w-md rounded-xl p-4"
      >
        <option defaultChecked>Free</option>
        <option>Paid</option>
      </select>

      {watch('coursePriceSelect')?.toLocaleLowerCase() === 'paid' && (
        <>
          <div className="flex items-center space-x-4 ">
            Course Price
            <input
              {...register('coursePrice')}
              type="number"
              placeholder="1000"
              className="ml-6 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
            />
            <span>Tk</span>
          </div>

          <div className="flex items-center space-x-4">
            Fake Price (Discounted Before Price)
            <input
              {...register('courseFakePrice')}
              type="number"
              placeholder="1200"
              className="ml-6 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-[40%]"
            />
            <span>Tk</span>
          </div>
        </>
      )}

      <h3>Course content in the form</h3>
      <select
        {...register('courseState')}
        className="my-4 max-w-md rounded-xl p-4"
      >
        <option defaultChecked>Complete</option>
        <option>Accumulate</option>
      </select>
    </form>
  );
}

export default memo(CoursePublishing);
