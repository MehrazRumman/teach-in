import { memo, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { useSession } from 'next-auth/react';
import Loading from '~/components/buttons/Loading';
import toast from 'react-hot-toast';
import { PATHS } from '~/constants';
import { useRouter } from 'next/router';

function TestsDraftItem({
  order,
  name,
  slug,
  updateAt,
  questionCount,
  category,
  subCategory,
  publishMode,
  isRunning,
}: {
  order: number;
  name: string;
  slug: string;
  createAt: Date;
  updateAt: Date;
  questionCount: number;
  category: string;
  subCategory: string;
  publishMode: string;
  isRunning: boolean;
}) {
  const router = useRouter();

  const statuses = ['PUBLIC', 'PRIVATE'];
  const statusesRunning = ['YES', 'NO'];

  const handleEditTest = () => {
    router.push(`${PATHS.EDIT_TEST}?slug=${slug}`);
  };

  const [publishModeData, setPublishModeData] = useState(publishMode);
  const [isRunningData, setIsRunningData] = useState(isRunning);

  const handleStatusChange = async (
    newStatus: string,
    newIsRunning: boolean,
  ) => {
    toast.loading('Updating State...');
    try {
      const response = await fetch('/api/update_test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: slug,
          publishMode: newStatus,
          isRunning: newIsRunning,
        }),
      });

      if (response.ok) {
        setIsRunningData(newIsRunning);
        setPublishModeData(newStatus);
        toast.dismiss();
        toast.success('Status updated successfully.');
      } else {
        toast.dismiss();
        toast.error('Error updating status. ');
      }
    } catch (error) {
      toast.error('Error: ' + error);
    }
  };

  return (
    <tr className="smooth-effect cursor-pointer   rounded-2xl odd:bg-slate-300 hover:text-sky-600 odd:dark:bg-dark-background hover:dark:text-sky-400">
      <th onClick={handleEditTest} className="px-1 text-purple-700">
        {order}
      </th>
      <td
        onClick={handleEditTest}
        className="max-w-[40rem] py-6 font-semibold text-purple-700 lg:min-w-min lg:py-4"
      >
        {name}
      </td>
      <td
        onClick={handleEditTest}
        className=" content-center items-center  justify-center  "
      >
        <span className="h-4 w-4 justify-center overflow-visible rounded-full border-2 border-purple-400 bg-purple-200 p-2 font-semibold text-purple-700   ">
          {questionCount}
        </span>
      </td>
      <td className="max-w-[30rem] py-6  lg:min-w-min lg:py-4">
        {category} - {subCategory}
      </td>
      <td className="max-w-[20rem] py-6 lg:min-w-min lg:py-4">
        <select
          className={` ${
            publishModeData === 'PUBLIC'
              ? 'border-green-300 bg-green-100 text-green-700'
              : ' border-red-300  bg-red-100 text-red-700  '
          } rounded-md border px-2
          py-1`}
          value={publishModeData}
          onChange={(e) => {
            handleStatusChange(e.target.value, isRunningData);
          }}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>

      <td className="max-w-[20rem] py-6 lg:min-w-min lg:py-4">
        <select
          className={` ${
            isRunningData
              ? 'border-green-300 bg-green-100 text-green-700'
              : ' border-red-300  bg-red-100 text-red-700  '
          } rounded-md border px-2
          py-1`}
          value={isRunningData ? 'YES' : 'NO'}
          onChange={(e) => {
            handleStatusChange(publishModeData, !isRunningData);
          }}
        >
          {statusesRunning.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </td>
      {/* <td className="text-center">{updateAt.toLocaleString('bn-BD')}</td> */}
    </tr>
  );
}

function TestsDraft() {
  const { data: session } = useSession();

  const { data, isLoading, isError } = trpc.test.findTestsByOwner.useQuery(
    { userId: session?.user?.id as string },
    { enabled: !!session?.user?.id },
  );

  if (isError) {
    toast.error('Error! Can not find the current test');
    return <div></div>;
  }

  if (isLoading) {
    return (
      <div className="absolute-center min-h-[25rem] w-full overflow-hidden">
        <Loading />
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <p className="my-4 italic">You havent composed any Test yet!</p>;
  }

  return (
    <table className="table-auto">
      <thead className="select-none">
        <tr>
          <th className="px-2">Test ID</th>
          <th className="max-w-[50rem] py-6 lg:min-w-min lg:py-4">
            Model Test Name
          </th>
          <th className="max-w-[10rem] py-6 lg:min-w-min lg:py-4">n</th>
          <th className="max-w-[10rem] py-6 lg:min-w-min lg:py-4">Topic</th>
          <th className="max-w-[10rem] py-6 lg:min-w-min lg:py-4">State</th>
          {/* <th className="text-center">Last Updated</th> */}
        </tr>
      </thead>
      <tbody className="rounded-xl">
        {data &&
          data.tests.length > 0 &&
          data.tests.map((test, order) => {
            return (
              <TestsDraftItem
                key={test.id}
                name={test.name}
                createAt={test.createdAt}
                questionCount={test.questionCount}
                category={test.category.name}
                subCategory={test?.subCategory || ''}
                order={test.order || order + 1}
                slug={test.slug || ''}
                updateAt={test.updatedAt}
                publishMode={test.publishMode}
                isRunning={test.isRunning}
              />
            );
          })}
      </tbody>
    </table>
  );
}

export default memo(TestsDraft);
