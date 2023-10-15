import { type NextPage } from 'next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BiCopy } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import FilterArticle from '~/components/features/browse/FilterArticle';
import FilterPanelExam from '~/components/features/browse/FilterPanelExam';
import Head from '~/components/shared/Head';

const BrowsePageExam: NextPage = () => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <>
      <Head /> 
          <button
            onClick={(e) => {
              e.preventDefault();
              // copy the current url to clipboard
              navigator.clipboard.writeText(window.location.href);
              toast.success('Copied to clipboard');
            }}
            className="flex flex-row items-center rounded-md bg-emerald-700 px-4 py-2 font-bold text-white "
          >
            <BiCopy className="mr-2" />
            Copy
          </button>
        </div>
      </div>

      <div className="mx-auto min-h-screen w-full items-center justify-center px-4 pt-10 md:max-w-[720px] lg:max-w-[1200px]">
        {showFilter && <FilterPanelExam />}
        <FilterArticle />
      </div>
    </>
  );
};

export default BrowsePageExam;
