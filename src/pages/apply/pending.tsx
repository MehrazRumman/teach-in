import React from 'react';
import { useSession } from 'next-auth/react';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import type { NextPage } from 'next';
const Pending: NextPage = () => {
  const { data: session } = useSession();

  const { data, isLoading } = trpc.user.findPending.useQuery({
    id: session?.user?.id as string,
  });

  if (isLoading || !data?.user) {
    return (
      <div className="absolute-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="m-6 flex w-full flex-col items-center justify-center">
      <div className="flex w-full flex-col pt-7 lg:w-10/12 lg:px-12">
        <h1 className=" text-4xl font-bold ">Your Applied Requests</h1>

        <div className="mt-8">
          <table className="min-w-full rounded-lg border">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800">
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-left">User Name</th>
                <th className="px-6 py-3 text-left">User Number</th>
                <th className="px-6 py-3 text-left">Course Name</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Approved</th>
              </tr>
            </thead>
            <tbody className="bg-gray-200 dark:bg-gray-900">
              {data.apply_requests.map((applyRequest) => (
                <tr key={applyRequest.id} className="border-t">
                  <td className="whitespace-nowrap px-6 py-4">
                    {applyRequest?.createdAt.toLocaleDateString('bn')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {applyRequest.user.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {applyRequest.user.number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {applyRequest?.course?.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {applyRequest?.comment}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded px-2 py-1 `}>
                      {applyRequest.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 ${
                        applyRequest.approved
                          ? 'bg-green-400 text-white'
                          : 'bg-red-400 text-white'
                      }`}
                    >
                      {applyRequest.approved ? 'YES' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pending;
