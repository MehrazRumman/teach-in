import Link from 'next/link';
import { memo } from 'react';

const FeatureCard = ({ title, description }) => (
  <div className="rounded-lg  p-6 text-gray-800 shadow-md dark:text-white">
    <h2 className="mb-4 text-xl font-semibold">{title}</h2>
    <p>{description}</p>
  </div>
);
function Banner() {
  const features = [
    {
      title: 'Mentors and Teachers Functionality',
      description:
        'Mentors and teachers play a crucial role in guiding and instructing students. They can create and manage courses, upload lecture materials, set assignments, and interact with students through discussions, messaging, or live sessions. They might also have tools for tracking student progress, providing feedback, and assessing student performance.',
    },
    {
      title: 'Student Functionality',
      description:
        'Students can create accounts on the platform and enroll in courses of their choice. They can access course materials such as lectures, videos, reading materials, and assignments. Interact with mentors, teachers, and fellow students through discussion forums, messaging, or virtual classrooms. Take exams or quizzes related to their courses, with the platform providing a way to assess and grade their performance. Track their progress and access their learning history.',
    },
    {
      title: 'Course Enrollment',
      description:
        "Students can browse and search for available courses, view course details, and enroll in the ones they're interested in. Enrollment might be free or require payment, depending on the platform's business model.",
    },
    {
      title: 'Reading and Exam Features',
      description:
        'The platform likely offers a way for students to read or view course materials, which could include text, videos, and other resources. Exams and quizzes may be conducted online, with features for setting up and taking exams, including time limits and scoring.',
    },
    {
      title: 'Discussion and Interaction',
      description:
        'Discussion forums, chat features, and live sessions might be available for students to interact with instructors and peers, ask questions, and participate in discussions related to the course content.',
    },
    {
      title: 'Progress Tracking',
      description:
        'Students and instructors can monitor progress, which may include tracking completed assignments, assessments, and overall course completion status.',
    },
  ];

  return (
    <div className="my-6 h-fit w-full text-gray-800 dark:text-white">
      <div className="mx-auto flex h-full max-w-[1300px] flex-col md:flex-row">
        <div className="m-8 flex w-full flex-row items-center justify-center md:hidden lg:hidden">
          <Link href="/courses">
            <div className="h-55 w-70 m-2 mr-12 flex flex-col items-center justify-center rounded-xl bg-gradient-to-r from-yellow-200 to-purple-200 p-4">
              <h6 className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text p-3 text-4xl font-extrabold text-transparent">
                কোর্স
              </h6>
            </div>
          </Link>
          <Link href="/exams">
            <div className="h-55 w-70 m-2 ml-12 flex flex-col items-center justify-center rounded-xl bg-gradient-to-r from-purple-200 to-green-200 p-4">
              <h4 className="items-center justify-center bg-gradient-to-r from-violet-500 to-green-600 bg-clip-text p-3 text-4xl font-extrabold text-transparent">
                পরীক্ষা
              </h4>
            </div>
          </Link>
        </div>

        <aside className="absolute-center flex-1 px-10 py-7">
          <div className="full-size flex flex-col items-center justify-center space-y-3">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default memo(Banner);
