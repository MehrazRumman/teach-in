import { MdPeopleOutline, MdQuestionMark } from 'react-icons/md';
import { SiGoogleclassroom } from 'react-icons/si';
import { CountUp } from 'use-count-up';
import { BiBook, BiNote, BiTestTube } from 'react-icons/bi';

interface AchievementProps {
  totalCourses: number;
  totalTests: number;
  totalQuestions: number;
  totalStudents: number;
  totalBooks: number;
  totalArticles: number;
}

export default function Achievement({
  totalCourses,
  totalTests,
  totalQuestions,
  totalStudents,
  totalBooks,
  totalArticles,
}: AchievementProps) {
  return (
    <div className=" mx-6">
      <div className="container mx-auto grid grid-cols-2 gap-8 md:grid-cols-3">
        <div className="flex items-center space-x-4 rounded-lg bg-blue-800 p-8 text-white">
          <SiGoogleclassroom className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalCourses) ? totalCourses : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Courses</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-lg bg-cyan-800 p-8 text-white">
          <BiTestTube className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalTests) ? totalTests : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Model Tests</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-lg bg-indigo-800 p-8 text-white">
          <MdPeopleOutline className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalStudents) ? totalStudents : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Students</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-lg bg-slate-700 p-8 text-white">
          <MdQuestionMark className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalQuestions) ? totalQuestions : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Questions</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-lg bg-emerald-900 p-8 text-white">
          <BiBook className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalBooks) ? totalBooks : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Notes</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-lg bg-blue-800 p-8 text-white">
          <BiNote className="h-12 w-12" />
          <div>
            <div className="text-5xl font-bold">
              <CountUp
                isCounting
                end={Number.isFinite(totalArticles) ? totalArticles : 0}
                duration={1.5}
              />
            </div>
            <p className="text-xl">Articles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
