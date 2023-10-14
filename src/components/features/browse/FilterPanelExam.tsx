import { useEffect, useMemo } from 'react';
import Filter from './Filter';
import { categories_detail, MathSection, QUERY_FILTERS } from '~/constants';
import { useRouter } from 'next/router';
import { PATHS } from '~/constants';
import { isEmptyObject } from '~/utils/ObjectHandler';
import { FaTimesCircle } from 'react-icons/fa';

export default function FilterPanelExam() {
  const router = useRouter();

  const subCategory = useMemo(() => {
    const subCategories = categories_detail.find(
      (c) => c.title === router.query?.category,
    )?.fields;

    if (subCategories) return subCategories;

    return ['All'];
  }, [router.query?.category]);

  return (
    <div className="flex h-fit w-full gap-8 overflow-x-scroll px-2 md:px-0 lg:flex-wrap">
      <div className="flex w-full flex-col justify-between lg:flex-row">
        <Filter
          label="Sorted by"
          queryParams={QUERY_FILTERS.SORT}
          options={['Popular', 'Questions', 'Participants'].map((e) => ({
            label: e,
            value: e,
          }))}
        />
        <Filter
          label="Class"
          queryParams={QUERY_FILTERS.CATEGORY}
          options={[{ label: 'All', value: 'All' }].concat(
            categories_detail.map((e) => ({
              value: e.title,
              label: e.title,
            })),
          )}
        />
        <Filter
          label="Subject"
          queryParams={QUERY_FILTERS.SUB_CATEGORY}
          options={[{ label: 'All', value: 'All' }].concat(
            subCategory.map((e) => ({ label: e, value: e })),
          )}
        />

        <Filter
          label="Section"
          queryParams={QUERY_FILTERS.SECTION}
          options={
            router.query?.subCategory === 'গণিত'
              ? MathSection.sections.map((e) => ({ label: e, value: e }))
              : [{ label: 'All', value: 'All' }]
          }
        />

        {!isEmptyObject(router.query) && (
          <div className="items-center justify-center p-3">
            <button
              onClick={() => {
                router.replace(`/${PATHS.BROWSE_EXAM}`);
              }}
              className={`h-24 w-24 justify-center`}
            >
              <FaTimesCircle className="text-2xl" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
