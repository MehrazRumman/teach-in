import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export type Section =
  | 'info'
  | 'followed-courses'
  | 'reminder'
  | 'message'
  | 'notifications'
  | 'payment-history'
  | 'book-order-track';

const sections: { value: Section; label: string }[] = [
  { value: 'info', label: 'Information' },
  { value: 'followed-courses', label: 'Courses' },
  { value: 'reminder', label: 'Learning Reminder' },
  { value: 'payment-history', label: 'Payment history' },
  { value: 'book-order-track', label: 'Track Book Order' },
];

function ProfileMenu() {
  const [section, setSection] = useState<Section>('info');
  const router = useRouter();

  const handleMenuClick = (section: Section) => {
    setSection(section);
    router.replace(
      { pathname: router.pathname, query: { section: section } },
      undefined,
      { shallow: true },
    );
  };

  useEffect(() => {
    setSection(String(router.query?.section || 'info') as Section);

    return () => {
      setSection('info');
    };
  }, [router]);

  useEffect(() => {
    console.log('router.query: ', router.query);
    const selectedSection = document.querySelector(`#${router.query.section}`);

    if (selectedSection) {
      selectedSection.scrollIntoView({ block: 'nearest', inline: 'start' });
    }
  }, [router]);

  return (
    <div className="flex w-full flex-col space-y-4 md:space-y-8 md:px-4">
      {sections.map((sectionElement) => (
        <button
          id={sectionElement.value}
          key={sectionElement.value}
          onClick={() => handleMenuClick(sectionElement.value)}
          className={`${
            section === sectionElement.value
              ? 'bg-purple-500 text-white'
              : 'bg-white hover:bg-stone-200 dark:bg-dark-background dark:hover:bg-white/20'
          } smooth-effect mb-4 w-full rounded p-4`}
        >
          {sectionElement.label}
        </button>
      ))}
    </div>
  );
}

function ProfileInfo() {
  const { data: auth } = useSession();

  return (
    <section className="flex w-full flex-col items-center space-y-4 px-4 md:w-[25%] md:min-w-[25%] lg:w-[20%] lg:min-w-[20%]">
      <figure className="relative h-36 w-36 rounded-full">
        <Image
          fill
          className="absolute rounded-full bg-cover bg-center bg-no-repeat"
          alt="user-avatar"
          src={auth?.user?.image || 'https://i.ibb.co/1qQJr6S/blank-user.png'}
        />
      </figure>

      <h1 className="text-3xl">{auth?.user?.name}</h1>
      <h2 className="mb-6 text-xl">{auth?.user?.email}</h2>

      <ProfileMenu />
    </section>
  );
}

export default memo(ProfileInfo);
