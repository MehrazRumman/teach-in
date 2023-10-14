import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BiCategoryAlt } from 'react-icons/bi';
import { FiTrash } from 'react-icons/fi';
import { GiArcheryTarget } from 'react-icons/gi';
import { GrUserExpert } from 'react-icons/gr';
import { MdDriveFileRenameOutline, MdOutlineDraw } from 'react-icons/md';
import { useIsFirstRender } from 'usehooks-ts';
import {
  categories_detail,
  LEVELS_LABEL,
  MAPPING_LEVEL_LANGUAGE,
  PATHS,
} from '~/constants';
import useCourse from '~/contexts/CourseContext';
import Image from 'next/image';

import { CheckIcon, LinkIcon, PhotoIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

import type { CourseType } from '~/types';

import type { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import RichEditor from '~/components/shared/RichEditor';
import { RiNotificationLine } from 'react-icons/ri';
import { FaFacebook } from 'react-icons/fa';

export interface IFormInput {
  courseName: string;
  detailsDescription: string;
  courseTargets: string[];
  courseRequirements: string[];
  courseLevel: string;
  briefDescCourse: string;
  meetingPlatform: string;
  facebookGroupLink: string;
  facebookGroupName: string;
  category: string;
  category_details: string;
}

interface CourseCreationInfoProps {
  course?: CourseType | null;
  dirs?: string[];
}

function CourseCreationInfo({ course, dirs }: CourseCreationInfoProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();

  const [detailsDescription, setDetailsDescription] = useState<string>(
    course?.detailDescription || '',
  );

  const [notice, setNotice] = useState<string>(course?.notice || '');

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('myImage', selectedFile);
      formData.append('source', 'Primary');
      const { data } = await axios.post('/api/image', formData);
      setImageURL(data.downloadUrl);
      toast.success('Image uploaded successfully');
    } catch (error: unknown) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const { data: session } = useSession();
  const courseCtx = useCourse();
  const router = useRouter();
  const isFirst = useIsFirstRender();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageURL, setImageURL] = useState(() => {
    if (course?.thumbnail) return course.thumbnail;

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
      courseName: course?.name || '',
      courseTargets: ['', '', '', ''],
      courseRequirements: [' '],
    },
  });

  useEffect(() => {
    if (course) {
      reset({
        courseName: course.name,
        category: course.category.name,
        category_details: course.subCategory || undefined,
        briefDescCourse: course.briefDescription || undefined,
        detailsDescription: course.detailDescription || undefined,
        meetingPlatform: course.meetingPlatform || undefined,
        facebookGroupLink: course.facebookGroupLink || undefined,
        facebookGroupName: course.facebookGroupName || undefined,
        courseTargets:
          course.courseTargets?.length > 0
            ? course.courseTargets.map((target) => target.content)
            : [' '],
        courseRequirements:
          course.courseRequirements.length > 0
            ? course.courseRequirements.map((target) => target.content)
            : [' '],
        courseLevel: Object.keys(MAPPING_LEVEL_LANGUAGE).find(
          (key) => MAPPING_LEVEL_LANGUAGE[key] === course.courseLevel,
        ),
      });
    }
  }, [course, reset]);

  const {
    fields: courseTargetsFields,
    append: courseTargetsAppend,
    remove: courseTargetsRemove,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    name: 'courseTargets',
  });

  const {
    fields: courseRequirementsFields,
    append: courseRequirementsAppend,
    remove: courseRequirementsRemove,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    name: 'courseRequirements',
  });

  const handleDetailDescription = useCallback((value: string) => {
    setDetailsDescription(value);
  }, []);

  const handleDetailNotice = useCallback((value: string) => {
    setNotice(value);
  }, []);

  // update form value to context:
  useEffect(() => {
    const {
      courseName,
      category,
      category_details,
      briefDescCourse,
      meetingPlatform,
      facebookGroupLink,
      facebookGroupName,
      courseTargets,
      courseRequirements,
      courseLevel,
    } = getValues();

    //validate course name
    if (!courseName && !isFirst) {
      setError(
        'courseName',
        {
          type: 'required',
          message: 'Course name is required first!',
        },
        { shouldFocus: true },
      );

      toast.error('Save failed, please review the fields!');

      return;
    }

    //validate meeting platform
    if (
      meetingPlatform &&
      !meetingPlatform?.includes('meet.google.com') &&
      !meetingPlatform?.includes('zoom.us') &&
      !meetingPlatform?.includes('teams.microsoft')
    ) {
      setError(
        'meetingPlatform',
        {
          type: 'pattern',
          message: 'Not the right support platform',
        },
        { shouldFocus: true },
      );
      toast.error('Save failed, please review the fields!');
      return;
    }

    if (courseName && !isFirst) {
      (async function () {
        try {
          // check duplicate name if create mode
          if (router.asPath.includes(PATHS.CREATE_COURSE)) {
            const { data } = await axios.get(`/api/course/${courseName}`);

            if (
              data?.coursesResult &&
              data?.coursesResult.userId !== session?.user?.id
            ) {
              toast.error('Course name already exists!');
              return;
            }
          }

          courseCtx?.updateCourse({
            name: courseName,
            thumbnail: imageURL,
            category: { name: category, subCategory: category_details },
            briefDescription: briefDescCourse.trim(),
            detailDescription: detailsDescription,
            notice: notice,
            meetingPlatform,
            facebookGroupLink,
            courseTargets: courseTargets.map((elem) => elem.trim()),
            courseRequirements: courseRequirements.map((elem) => elem.trim()),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            courseLevel: MAPPING_LEVEL_LANGUAGE[courseLevel],
          });

          toast.success('Save progress successfully!');
        } catch (error) {}
      })();
    }
  }, [courseCtx?.dispatchUpdate]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-4 flex flex-col"
    >
      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdDriveFileRenameOutline className="h-8 w-8" />{' '}
            <span>Course name</span>
          </h2>
          <span className="text-xl italic">(Up to 60 characters)</span>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.courseName?.message}
        </span>
        <input
          onClick={() => {
            clearErrors('courseName');
          }}
          {...register('courseName', { maxLength: 60, required: true })}
          type="text"
          placeholder="Course from hero to zero..."
          className={`my-2 rounded-xl ${
            errors?.courseName ? 'border border-rose-500' : ''
          } p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <PhotoIcon className="h-8 w-8" /> <span>Course avatar</span>
          </h2>
          <span className="text-xl italic">Required</span>
        </div>

        <label>
          <input
            type="file"
            hidden
            accept="image/png, image/gif, image/jpeg"
            onChange={({ target }) => {
              if (target.files) {
                const file = target.files[0];
                setSelectedImage(URL.createObjectURL(file));
                setSelectedFile(file);
              }
            }}
          />

          {selectedImage || imageURL ? (
            // eslint-disable-next-line @next/next/no-img-element

            <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl  md:max-w-3xl">
              <Image
                alt="course-thumbnail"
                src={selectedImage || imageURL}
                height={330}
                width={500}
              />
            </div>
          ) : (
            <div className="my-4 max-h-[25rem] overflow-hidden rounded-xl  md:max-w-3xl">
              <Image
                alt="course-thumbnail"
                src={'/images/placeholder.png'}
                height={350}
                width={500}
              />
            </div>
          )}
        </label>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ opacity: uploading ? '.5' : '1' }}
          className="w-96 rounded-full bg-purple-600 p-3 text-center text-white"
        >
          {uploading ? 'Uploading..' : 'Upload'}
        </button>
        <div className="mt-20 flex flex-col space-y-3">
          {dirs?.map((item) => (
            <Link key={item} href={'/images/' + item}>
              <a className="text-blue-500 hover:underline">{item}</a>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <h2 className="flex items-center space-x-3">
            <BiCategoryAlt className="h-8 w-8" /> <span>Category Course</span>
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
          {...register('briefDescCourse', { maxLength: 500 })}
          type="text"
          placeholder="Course offers you..."
          className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <MdOutlineDraw className="h-8 w-8" />{' '}
            <span>Detail description</span>
          </h2>
          <span className="text-xl italic">(Up to 5000 characters)</span>
        </div>

        <RichEditor
          contents={detailsDescription || ''}
          onEditorChange={handleDetailDescription}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <RiNotificationLine className="h-8 w-8" /> <span>Notice</span>
          </h2>
          <span className="text-xl italic">
            Notice for the enrolled students. (Up to 5000 characters)
          </span>
        </div>

        <RichEditor
          contents={notice || ''}
          onEditorChange={handleDetailNotice}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <LinkIcon className="h-8 w-8" />{' '}
            <span>Link to the online meeting platform</span>
          </h2>
          <span className="text-xl italic">
            (Google Meet, Zoom, Microsoft Teams)
          </span>
        </div>

        <span className="my-2 italic text-rose-400">
          {errors?.meetingPlatform?.message}
        </span>

        <input
          {...register('meetingPlatform')}
          onClick={() => {
            clearErrors('meetingPlatform');
          }}
          type="text"
          placeholder="meet.google.com/abc-degf-xyz"
          className={`${
            errors.meetingPlatform ? 'border border-rose-500' : ''
          } my-2 max-w-md rounded-xl p-4 focus:ring-1 focus:ring-gray-200`}
        />

        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <LinkIcon className="h-8 w-8" /> <span>Facebook Group Link</span>
          </h2>
        </div>

        <input
          {...register('facebookGroupLink')}
          onClick={() => {
            clearErrors('facebookGroupLink');
          }}
          type="text"
          placeholder="facebook.com/groups/abc-degf-xyz"
          className={`${
            errors.facebookGroupLink ? 'border border-rose-500' : ''
          } my-2 max-w-md rounded-xl p-4 focus:ring-1 focus:ring-gray-200`}
        />

        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <FaFacebook className="h-8 w-8" /> <span>Facebook Group Name</span>
          </h2>
        </div>

        <input
          {...register('facebookGroupName')}
          onClick={() => {
            clearErrors('facebookGroupName');
          }}
          type="text"
          placeholder="Facebook Group Name"
          className={`${
            errors.facebookGroupName ? 'border border-rose-500' : ''
          } my-2 max-w-md rounded-xl p-4 focus:ring-1 focus:ring-gray-200`}
        />
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GiArcheryTarget className="h-8 w-8" />{' '}
            <span>Course Objectives</span>
          </h2>
          <span className="text-xl italic">
            (Need to provide at least 4 goals)
          </span>
        </div>

        {courseTargetsFields.map((item, index) => {
          return (
            <input
              {...register(`courseTargets.${index}` as const)}
              key={item.id}
              type="text"
              className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
            />
          );
        })}

        <div className="flex items-center justify-between md:w-1/2">
          <button
            onClick={() => courseTargetsAppend(' ', { shouldFocus: false })}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <PlusIcon className="h-8 w-8" /> <span>Add target</span>{' '}
          </button>

          <button
            onClick={() => courseTargetsRemove(1)}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <FiTrash className="h-8 w-8" /> <span>Delete</span>{' '}
          </button>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <CheckIcon className="h-8 w-8 dark:fill-white" />{' '}
            <span>Course Requirements</span>
          </h2>
          <span className="text-xl italic md:w-3/4">
            (List of tools, equipment, experience,... required learners need
            Have. If not, leave it blank to widen the audience!)
          </span>
        </div>

        {courseRequirementsFields.map((item, index) => {
          return (
            <input
              {...register(`courseRequirements.${index}` as const)}
              key={item.id}
              type="text"
              className="my-2 rounded-xl p-4 focus:ring-1 focus:ring-gray-200 md:w-1/2"
            />
          );
        })}

        <div className="flex items-center justify-between md:w-1/2">
          <button
            onClick={() =>
              courseRequirementsAppend(' ', { shouldFocus: false })
            }
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <PlusIcon className="h-8 w-8" /> <span>More request</span>{' '}
          </button>

          <button
            onClick={() => courseRequirementsRemove(1)}
            className="smooth-effect my-4 flex w-fit items-center space-x-2 hover:text-primary"
          >
            <FiTrash className="h-8 w-8" /> <span>Delete</span>{' '}
          </button>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col px-6">
        <div className="flex flex-col">
          <h2 className="flex items-center space-x-3">
            <GrUserExpert className="h-8 w-8" />{' '}
            <span>Who is the Course for?</span>
          </h2>
          <span className="text-xl italic">
            (The range of learners you want to target!)
          </span>
        </div>

        <select
          {...register('courseLevel')}
          className="my-4 max-w-md rounded-xl p-4"
        >
          <option disabled defaultValue={'Đối tượng:'}>
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

export const getServerSideProps: GetServerSideProps = async () => {
  const props = { dirs: [] };
  try {
    const dirs = await fs.promises.readdir(
      path.join(process.cwd(), '/public/images'),
    );
    props.dirs = dirs as never[];
    return { props };
  } catch (error) {
    return { props };
  }
};

export default memo(CourseCreationInfo);
