import Link from 'next/link';
import { memo } from 'react';

interface TopicCardSmallProps {
  topic: {
    name: string;
    img: string;
    link: string;
    color: string;
  };
}

function TopicCardSmall({ topic }: TopicCardSmallProps) {
  return (
    <div
      className={` smooth-effect relative mb-4 w-1/3 flex-col items-center justify-center  rounded-2xl border-2 border-gray-600 p-4 transition-transform duration-300 ease-in-out hover:scale-[101%] dark:border-white/50 dark:bg-slate-900`}
    >
      <Link href={topic.link}>
        <div className="flex h-full flex-col justify-center  rounded-lg p-4 transition-all duration-300 ease-in-out hover:bg-opacity-50">
          <img
            src={topic.img}
            alt={topic.name}
            className="h-48 w-auto lg:h-64"
          />

          <h2 className="mt-3 w-full justify-center overflow-hidden text-center text-xl font-bold md:text-2xl">
            {topic.name}
          </h2>
        </div>
      </Link>
    </div>
  );
}

export default memo(TopicCardSmall);
