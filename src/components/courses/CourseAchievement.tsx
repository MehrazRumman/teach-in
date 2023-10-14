import { CheckIcon } from '@heroicons/react/24/outline';

interface CourseAchievementProps {
  targets: { id: string; content: string }[];
}

export default function CourseAchievement({ targets }: CourseAchievementProps) {
  return (
    <section className=" flex w-[90%]  flex-col space-y-4">
      <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
        আপনি যা শিখতে পারবেনঃ
      </h1>

      <ul className="grid grid-cols-1 gap-4 gap-y-4 md:grid-cols-2">
        {targets?.length > 0 &&
          targets.map((target, index) => {
            return (
              <li key={index} className=" my-3 flex gap-y-4">
                <span className="mr-2 h-fit w-fit rounded-full bg-purple-200 p-2">
                  <CheckIcon className="h-5 w-5 font-bold text-purple-700" />
                </span>
                <p>{target.content}</p>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
