import {
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { BiLocationPlus } from 'react-icons/bi';
import { FaLocationArrow } from 'react-icons/fa';

const OrderComponent = ({ order }) => {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-dark-background md:flex-row md:items-stretch md:space-x-6 md:space-y-0">
      {/* Book Thumbnail */}

      <div className="w-full overflow-hidden rounded-lg md:w-1/4 md:rounded-xl">
        <time className="flex items-center space-x-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
          <ClockIcon className="h-4 w-4" />
          <span>{new Date(order.createdAt).toLocaleString('bn-BD')}</span>
        </time>
        <h4 className="font-semibold text-rose-400 dark:text-rose-300">
          {new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
          }).format(order.book.bookPrice as number)}
        </h4>
        <img
          className="h-full w-full object-cover"
          alt="order.book-thumbnail"
          src={order.book.thumbnail}
        />
      </div>

      {/* Book Details */}
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white md:text-2xl">
          {order.book.name}
        </h2>
        <h3 className="text-base text-gray-600 dark:text-gray-400 md:text-lg">
          by {order.book.addedBy.name}
        </h3>

        {/* Personal Information */}
        <div className="space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center">
            <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="ml-2 font-semibold text-gray-600 dark:text-gray-400">
              {order.name}
            </span>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-400">
              <div>
                <span className="flex items-center">
                  <PhoneIcon className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-semibold">Number:</span> {order.number}
                </span>
              </div>

              <div>
                <span className="flex items-center">
                  <FaLocationArrow className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-semibold">Address:</span>{' '}
                  {order.address}
                </span>
              </div>

              <div className="mx-3 my-2 bg-green-100 px-4 py-2">
                <span className="flex items-center">
                  <CreditCardIcon className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-semibold">Payment Status:- </span>{' '}
                  <div className="mx-2 rounded bg-violet-100  p-2 px-4 font-bold text-gray-900">
                    {order.status}
                  </div>
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <BiLocationPlus className="mr-1 h-4 w-4 text-gray-500" />{' '}
                <div>
                  {order.upazila} -{order.district} - {order.division}
                </div>
              </div>
              <div>
                <span className="flex items-center">
                  <ChatBubbleLeftIcon className="mr-1 h-4 w-4 text-gray-500" />
                  {order.comment}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-2 rounded-lg bg-purple-100 p-4 dark:bg-purple-800">
          <div className="flex items-center">
            <InformationCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="ml-2 font-semibold text-gray-600 dark:text-gray-400">
              Delivery Information
            </span>
          </div>
          <div className="mt-4 space-y-2 rounded-lg bg-purple-100 p-4 dark:bg-purple-800">
            <div>
              <span className="font-semibold">Delivery Status:</span>{' '}
              <span className="mx-2 rounded bg-red-100  p-2 px-4 font-bold text-gray-900">
                {order.delivery_comment}
              </span>
            </div>
            <div>
              <span className="font-semibold">Comment from Teach-In:</span>{' '}
              <div className="mx-2 rounded bg-gray-200  p-2 px-4 font-bold text-gray-900">
                <pre>{order.update} </pre>
              </div>
            </div>
            <div>
              <span>Last Updated: </span>
              <span>{new Date(order.updatedAt).toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderComponent;
