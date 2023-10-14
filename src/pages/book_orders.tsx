import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import { toast } from 'react-hot-toast';

const statuses = [
  'PENDING',
  'COMPLETED',
  'SUBMITTED',
  'PICKED',
  'IN DELIVERY',
  'RECEIVED',
];

const OrderRow = ({ order, index }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.delivery_comment);
  const [updateText, setUpdateText] = useState(order.update);

  const { data: session } = useSession();

  const { data: userInfo, isLoading } = trpc.user.findUserInfoById.useQuery({
    id: session?.user?.id as string,
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

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    try {
      const response = await fetch('/api/order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id, // Replace with your actual field name
          newStatus: newStatus,
          updateText,
          name: order.name,
          number: order.number,
        }),
      });

      if (response.ok) {
        setSelectedStatus(newStatus);
        toast.success('Status updated successfully.');
      } else {
        console.log(response);
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
        order.type === 'cash' ? 'bg-orange-50' : 'bg-green-50'
      } items-center justify-between border-t border-gray-200 px-4 py-3 shadow-sm transition duration-300 ease-in-out hover:bg-red-200 md:flex-row`}
    >
      <div className="mb-2 flex items-center md:mb-0">
        <div className="mr-4 text-lg font-bold text-gray-700">{index + 1}.</div>
        <div className="flex flex-col">
          <div className="text-xl font-semibold text-gray-800">
            {order.name}
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-500">
            {order.number}
          </div>{' '}
          {/* Increased font-size for number */}
        </div>
      </div>
      <div className="mt-2 text-gray-700 md:ml-8 md:mt-0 md:w-1/4">
        <div className="text-2xl font-semibold">{order.address}</div>{' '}
        {/* Increased font-size for address */}
        <div className="mt-1">
          <span className="mr-1 text-xl font-semibold">{order.upazila},</span>{' '}
          {/* Increased font-size for upazila */}
          <span className="mr-1 text-xl font-semibold">
            {order.district},
          </span>{' '}
          {/* Increased font-size for district */}
          <span className="text-xl font-semibold">{order.division}</span>{' '}
          {/* Increased font-size for division */}
        </div>
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {order.book ? (
          order.book.name
        ) : (
          <span className="italic text-gray-500">No book selected</span>
        )}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {order.type}
      </div>

      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {order.status}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {order.amount}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {new Date(order.createdAt).toLocaleString('bn-BD')}
      </div>
      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        {order.comment}
      </div>

      <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
        <input
          className="rounded-md border border-gray-300 px-2 py-1 text-gray-700"
          value={updateText}
          onChange={(e) => {
            setUpdateText(e.target.value);
          }}
        ></input>
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

  const router = useRouter();
  const page = Number(router.query.page) || 1;

  const { data: orders, status } = trpc.book.findOrdersByBook.useQuery({
    page: page,
  });

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
    if (orders) {
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
      {status === 'loading' ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col lg:w-10/12 lg:px-12">
          {orders && (
            <div className="flex flex-col justify-center">
              <div className="mb-2 text-xl font-bold">Orders:</div>

              <div
                key={12}
                className={`flex flex-col  items-center  justify-between gap-2 border-t border-gray-200 px-4 py-3 shadow-sm transition duration-300 ease-in-out hover:bg-red-200 md:flex-row`}
              >
                <div className="mb-2 flex items-center md:mb-0">
                  <div className="mr-4 text-lg font-bold text-gray-700">i</div>
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-gray-800">
                      Name-Number
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-gray-700 md:ml-8 md:mt-0 md:w-1/4">
                  <div className="text-2xl font-semibold">Address</div>{' '}
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Book
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Type
                </div>

                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Payment Status
                </div>

                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Amount
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Date
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Comment
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Your Comment
                </div>
                <div className="mt-2 text-lg text-gray-700 md:mt-0 md:w-1/5">
                  Delivery Status
                </div>
              </div>

              {orders.orders.map((order, index) => (
                <OrderRow key={index} order={order} index={index} />
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
