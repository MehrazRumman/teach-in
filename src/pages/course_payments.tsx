import React, { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import { toast } from 'react-hot-toast';
import type { Payment } from '@prisma/client';

const statuses = ['REQUESTED', 'APPORVED', 'REJECTED'];
interface PaymentRowProps {
  payment: Payment;
  index: number;
}
const PaymentRow: React.FC<PaymentRowProps> = ({ payment, index }) => {
  const [selectedStatus, setSelectedStatus] = useState(payment.state);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    try {
      const response = await fetch('/api/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment.id, // Replace with your actual field name
          newState: newStatus,
        }),
      });

      if (response.ok) {
        setSelectedStatus(newStatus);
        toast.success('State updated successfully.');
      } else {
        toast.error('Error updating status. ');
      }
    } catch (error) {
      toast.error('Error: ' + error);
    }
  };

  return (
    <div
      key={index}
      className={`flex flex-col gap-2 ${
        selectedStatus === 'APPORVED' ? 'bg-green-100' : 'bg-red-100'
      } items-center justify-between border-t border-gray-200 px-4 py-3 shadow-sm transition duration-300 ease-in-out hover:bg-purple-200 md:flex-row`}
    >
      <div className="mb-2 flex items-center md:mb-0">
        <div className="mr-4 text-lg font-bold text-gray-700">{index + 1}.</div>
      </div>

      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {payment.course_name || 'N/A'}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {payment.cus_name || 'N/A'}
      </div>

      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {payment.number || 'N/A'}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {payment.code}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {new Date(payment.createdAt).toLocaleString('bn-BD')}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {payment.card_no} - {payment.card_type}
      </div>

      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        <select
          className="rounded-md border border-gray-300 px-2 py-1 text-gray-700"
          value={selectedStatus}
          onChange={handleStatusChange}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const TestCreation = () => {
  const { data: session } = useSession();

  const { data: userInfo, isLoading } = trpc.user.findUserInfoById.useQuery({
    id: session?.user?.id as string,
  });

  const router = useRouter();
  const page = Number(router.query.page) || 1;

  const [searchText, setSearchText] = useState('');
  const { data: payments, status } = trpc.course.findPaymentsByCourse.useQuery({
    page: page,
    search: Number(searchText),
  });

  if (isLoading || !userInfo) {
    return (
      <div className="absolute-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  if (userInfo && userInfo.role !== 'ADMIN') {
    return (
      <div className="flex w-full flex-row items-center justify-center">
        <span className="text-4xl text-red-600"> Your are not the Admin</span>
      </div>
    );
  }

  // useEffect(() => {
  //   if (orders && orders.length > 0) {
  //     testCtx?.resetTest();
  //   }
  // }, [orders, testCtx]);

  const goToPreviousPage = () => {
    if (page > 1) {
      router.push({ query: { ...router.query, page: page - 1 } });
    }
  };

  const goToNextPage = () => {
    if (payments) {
      router.push({ query: { ...router.query, page: page + 1 } });
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="m-6 flex w-full flex-col items-center justify-center">
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            You have no permission to enter this page. Please go back
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-6 flex w-full flex-col items-center justify-center">
      <div className="flex w-full flex-row justify-center">
        <div className="my-3  flex flex-col items-center justify-center md:flex-row md:justify-between">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-lg font-semibold">Search by Code : </label>
              <input
                className="rounded-md border border-gray-300 px-2 py-1 text-gray-700"
                type="number"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col lg:w-10/12 lg:px-12">
          {payments && (
            <div className="flex flex-col justify-center">
              <div className="mb-2 text-xl font-bold">Payments:</div>

              {/* A search box */}

              <div
                key={12}
                className={`flex flex-col  items-center  justify-between gap-2 border-t border-gray-200 px-4 py-3 shadow-sm transition duration-300 ease-in-out hover:bg-red-200 md:flex-row`}
              >
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Course
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  User Name
                </div>

                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Number
                </div>

                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Code
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Date
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Payment Method
                </div>

                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  State
                </div>
              </div>

              {payments.payments.map((payment, index) => (
                <PaymentRow key={index} payment={payment} index={index} />
              ))}

              <div className="mt-4 flex flex-col justify-between md:flex-row">
                <button
                  className="mb-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-900 md:mb-0 md:mr-2"
                  disabled={page === 1}
                  onClick={goToPreviousPage}
                >
                  Previous Page
                </button>
                <button
                  className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-900"
                  onClick={goToNextPage}
                >
                  Next Page
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCreation;
