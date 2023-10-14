import { memo, useState } from 'react';
import { BsDot } from 'react-icons/bs';
import type { CourseType } from '~/types';

import ChapterDisclosure from '../shared/ChapterDisclosure';
import PreviewLectureModal from './PreviewLectureModal';

interface CourseContentProps {
  course?: CourseType;
  totalVideoDuration: number;
  totalLectures: number;
}

function CourseContent({
  course,
  totalLectures,
  totalVideoDuration,
}: CourseContentProps) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <>
      <PreviewLectureModal />

      <section className="w-[90%]">
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
          কোর্সে যা যা থাকছে:
        </h1>

        <div className="my-2 flex flex-wrap justify-between space-y-2 md:flex-nowrap">
          <div className="flex items-center space-x-4 text-xl md:text-2xl">
            <div className="flex flex-row justify-center">
              <h3>
                <span className="font-semibold">{course?.chapters.length}</span>{' '}
                Chapters
              </h3>

              <span className="absolute-center">
                <BsDot />
              </span>

              <h3>
                <span className="font-semibold">{totalLectures}</span> lesson
              </h3>

              <span className="absolute-center">
                <BsDot />
              </span>

              <h3>
                Time{' '}
                <span className="font-semibold">
                  {Math.floor(totalVideoDuration / 3600)} Hour{' '}
                  {Math.ceil((totalVideoDuration % 3600) / 60)} Minute
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              setExpandAll((prevState) => !prevState);
            }}
            className="smooth-effect rounded-2xl text-green-700 hover:text-green-500"
          >
            {expandAll ? 'Zoom Out' : 'Expand'}
          </button>
        </div>

        <div className="flex flex-col  space-y-4">
          {course?.chapters &&
            course.chapters.length > 0 &&
            course.chapters.map((chapter) => {
              return (
                <ChapterDisclosure
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  key={chapter.id}
                  expand={expandAll}
                  chapter={chapter}
                />
              );
            })}
        </div>
      </section>
    </>
  );
}

export default memo(CourseContent);
