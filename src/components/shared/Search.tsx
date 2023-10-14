import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useSearchModalState from '~/atoms/searchModalState';

export default function Search() {
  const [_, setIsOpen] = useSearchModalState();

  return (
    <div
      onClick={() => setIsOpen(true)}
      className="relative mx-auto flex w-full cursor-text space-x-2 rounded-2xl bg-white px-6 py-4 dark:bg-highlight md:w-[80%]"
    >
      <p className="w-full dark:text-gray-400">Search...</p>
      <MagnifyingGlassIcon className="inline-block h-8 w-8" />
    </div>
  );
}
