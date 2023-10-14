import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BiCopy } from 'react-icons/bi';
import { BsQuestionLg } from 'react-icons/bs';
import { FiBookOpen, FiFilter } from 'react-icons/fi';
import { MdCastForEducation } from 'react-icons/md';
import { RiArticleLine } from 'react-icons/ri';
import FilterArticle from '~/components/features/browse/FilterArticle';
import FilterBook from '~/components/features/browse/FilterBook';
import FilterPanelExam from '~/components/features/browse/FilterPanelExam';
import FilterResult from '~/components/features/browse/FilterResult';
import FilterExam from '~/components/features/browse/FilterResultExam';
import Head from '~/components/shared/Head';
import Search from '~/components/shared/Search';

const BrowsePageExam: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;

  if (type === '101') {
    router.push('/course/math-101');
  }
  function capitalizeFirstLetter(str: string) {
    if (!str) return 'loading...';
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const [showFilter, setShowFilter] = useState(false);

  return (
    <>
      <Head
        title={
          type
            ? capitalizeFirstLetter(type as string) + ' - Teach-In'
            : 'loading..'
        }
      />

      <div className="relative z-40 mx-auto mt-4 h-fit w-[95%] md:hidden">
        <Search />
      </div>

      <div className="mx-auto min-h-screen w-full px-4 md:max-w-[720px] lg:max-w-[1200px]">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold capitalize">All {type}</h1>
          <div className="flex flex-row gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex flex-row items-center rounded-md bg-blue-500 px-2  py-2 text-sm font-bold text-white md:text-lg"
            >
              <FiFilter className="mx-1" />
              Filter
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                // copy the current url to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Copied to clipboard');
              }}
              className="flex flex-row items-center rounded-md bg-emerald-700 px-2 py-2 text-sm font-bold text-white md:text-lg"
            >
              <BiCopy className="mx-1" />
              Copy
            </button>
          </div>
        </div>

        {showFilter && <FilterPanelExam />}

        <div className="flex w-full flex-row">
          <div className="drak:text:gray-200 flex w-full space-x-4 rounded-md bg-gray-200 p-2 dark:bg-slate-900 dark:text-white md:rounded-2xl">
            <label
              className={`flex-1 cursor-pointer  rounded-md py-2 text-center text-2xl  text-gray-950 md:rounded-2xl md:py-4 ${
                type === 'courses' ? 'bg-purple-700 text-white ' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={type === 'courses'}
                onChange={() => {
                  //setActiveIndex(1);
                  router.push('/courses');
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-center dark:text-white">
                <MdCastForEducation /> Course
              </div>
            </label>
            <label
              className={`flex-1 cursor-pointer  rounded-md py-2 text-center text-2xl  text-gray-950 md:rounded-2xl md:py-4 ${
                type === 'exams' ? 'bg-purple-700 text-white' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={type === 'exams'}
                onChange={() => {
                  router.push('/exams');
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-center dark:text-white ">
                <BsQuestionLg /> Exam
              </div>
            </label>
            <label
              className={`flex-1 cursor-pointer  rounded-md py-2 text-center text-2xl  text-gray-950 md:rounded-2xl md:py-4 ${
                type === 'articles' ? 'bg-purple-700 text-white shadow-lg' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={type === 'articles'}
                onChange={() => {
                  router.push('/articles');
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-center dark:text-white">
                <RiArticleLine /> Article
              </div>
            </label>
            <label
              className={`flex-1 cursor-pointer  rounded-md py-2 text-center text-2xl  text-gray-950 md:rounded-2xl md:py-4 ${
                type === 'books' ? 'bg-purple-700 text-white' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={type === 'books'}
                onChange={() => {
                  router.push('/books');
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-center dark:text-white">
                <FiBookOpen /> Book
              </div>
            </label>
          </div>
        </div>

        {type == 'courses' && <FilterResult />}
        {type == 'exams' && <FilterExam />}
        {type == 'articles' && <FilterArticle />}
        {type == 'books' && <FilterBook />}
      </div>
    </>
  );
};

export default BrowsePageExam;
