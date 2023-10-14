import 'swiper/css';
import 'swiper/css/pagination';

import { memo } from 'react';
import TopicCard from '../shared/TopicCard';

function PopularExamTopics() {
  const topics = [
    {
      name: 'চাকুরী প্রস্তুতি',
      img: '/images/job.svg',
      link: '/courses?category=চাকুরী প্রস্তুতি',
      color: '#456434',
    },
    {
      name: 'এসএসসি ও ক্লাস ১-৯',
      img: '/images/ssc.svg',
      link: '/courses?category=এস এস সি',
      color: '#454535',
    },
    {
      name: 'এইচএসসি ও এডমিশন',
      img: '/images/hsc.svg',
      link: '/courses?category=এইচ এস সি',
      color: '#4534535',
    },
  ];

  return (
    <div className="my-6 h-fit w-full text-gray-800 dark:text-white">
      <div className="mx-auto my-4 flex flex-row gap-3 px-3 md:px-6 lg:gap-7">
        {topics.map((topic) => {
          return <TopicCard key={topic.name} topic={topic} />;
        })}
      </div>
    </div>
  );
}
//Student
export default memo(PopularExamTopics);
