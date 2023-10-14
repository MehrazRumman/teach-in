import DashBoardSidebar from '~/components/partials/DashBoardSidebar';

import {
  BookOpenIcon,
  ChartBarIcon,
  InformationCircleIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import {
  AiOutlineFundProjectionScreen,
  AiOutlineQuestion,
} from 'react-icons/ai';
import { PATHS } from '~/constants';
import { SiVitest } from 'react-icons/si';
import { BiNote } from 'react-icons/bi';

export default function TeachingSidebar() {
  const router = useRouter();

  return (
    <DashBoardSidebar>
      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.COURSE}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.COURSE &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <AiOutlineFundProjectionScreen className="h-10 w-10" />
        <span>Course</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.TEST}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.TEST &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <SiVitest className="h-10 w-10" />
        <span>Model Test</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.QUESTIONS}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.QUESTIONS &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <AiOutlineQuestion className="h-10 w-10" />
        <span>Question</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.BOOK}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.BOOK &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <BookOpenIcon className="h-10 w-10" />
        <span>Book</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.ARTICLE}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.ARTICLE &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <BiNote className="h-10 w-10" />
        <span>Article</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.DASHBOARD}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.DASHBOARD &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <ChartBarIcon className="h-10 w-10" />
        <span>Analysis</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.MY_WALLET}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.MY_WALLET &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <WalletIcon className="h-10 w-10" />
        <span>My wallet</span>
      </button>

      <button
        onClick={() => {
          router.replace(`/${PATHS.TEACHING}/${PATHS.INSTRUCTIONS}`);
        }}
        className={`smooth-effect flex flex-col items-center space-y-2 rounded-2xl p-4 hover:bg-slate-200 hover:dark:bg-background_dark ${
          router.query?.params &&
          router.query.params[0] === PATHS.INSTRUCTIONS &&
          'bg-slate-200 dark:bg-background_dark'
        }`}
      >
        <InformationCircleIcon className="h-10 w-10" />
        <span>Rules</span>
      </button>
    </DashBoardSidebar>
  );
}
