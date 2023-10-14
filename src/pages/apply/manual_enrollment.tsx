import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import type { NextPage } from 'next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { env } from 'process';
import { ApplyRequest } from '@prisma/client';
const ManualEnroll: NextPage = () => {
  const { data: session } = useSession();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [userName, setUserName] = useState('');
  const [userMobile, setUserMobile] = useState('');

  const { data, isLoading } = trpc.user.findCourseData.useQuery({
    id: session?.user?.id as string,
  });

  if (isLoading || !data?.user) {
    return (
      <div className="absolute-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  if (data?.user && data?.user.role !== 'ADMIN') {
    return (
      <div className="m-6 flex w-full flex-col items-center justify-center">
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <span className="text-4xl text-red-600">
              {' '}
              Your are not the Admin
            </span>
          </div>
        </div>
      </div>
    );
  }

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

  const handleCourseChange = (e) => {
    const n = e.target.value;

    setSelectedCourseName(
      data?.courses?.find((c) => c.id === n)?.name as string,
    );
    setSelectedCourse(n);
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleMobileChange = (e) => {
    setUserMobile(e.target.value);
  };

  // const { mutate: enrollCourseMutate, status: enrollStatus } =
  //   trpc.course.enrollCourse.useMutation();

  const handleClick = () => {
    if (!userMobile || userMobile.length !== 11) {
      return toast.error('Please enter a valid mobile number');
    }

    if (!selectedCourse || !userName) {
      toast.error('Please fill up all the fields properly');
      return;
    }

    if (selectedCourse && userName && userMobile) {
      axios
        .post('/api/apply/manual_enroll', {
          course_id: selectedCourse,
          name: userName,
          number: userMobile,
          key: env.MANUAL_ENROLL_KEY,
          course_name: selectedCourseName,
        })
        .then(function (response) {
          console.log(response);
          toast.success('Enrollment Successful');
        })
        .catch(function (error) {
          console.log(error);
          toast.error('Enrollment Failed');
        });
    }
  };

  function approveApplyRequest(apply: ApplyRequest) {
    axios
      .put('/api/apply/manual_enroll', {
        approve: true,
        id: apply.id,
        key: env.MANUAL_ENROLL_KEY,
        course_name: apply?.course?.name,
        name: apply?.user?.name,
        number: apply?.user?.number,
      })
      .then(function (response) {
        console.log(response);
        toast.success('Enrollment Successful');
      })
      .catch(function (error) {
        console.log(error);
        toast.error('Enrollment Failed');
      });
  }

  function removeApplyRequest(apply: ApplyRequest) {
    axios
      .put('/api/apply/manual_enroll', {
        approve: false,
        id: apply?.id,
        key: env.MANUAL_ENROLL_KEY,
        name: apply?.user?.name,
        course_name: apply?.course?.name,
        number: apply?.user?.number,
      })
      .then(function (response) {
        console.log(response);
        toast.success('Removal Successful');
      })
      .catch(function (error) {
        console.log(error);
        toast.error('Removal Failed');
      });
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
        <div className="container mx-auto px-4 py-6 lg:py-12">
          <h1 className="mb-8 text-center text-4xl font-bold">
            Manual Enrollment
          </h1>

          <div className="grid grid-cols-1 items-center gap-4 text-center md:grid-cols-2 lg:grid-cols-4 lg:justify-between">
            <div>
              <label
                htmlFor="courseSelect"
                className="block font-bold text-gray-600"
              >
                Select a Course:
              </label>
              <select
                id="courseSelect"
                className="w-full rounded border p-2"
                value={selectedCourse}
                onChange={handleCourseChange}
              >
                <option>Select a Course</option>
                {data?.courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="userName"
                className="block font-bold text-gray-600"
              >
                Name of the User:
              </label>
              <input
                type="text"
                id="userName"
                className="w-full rounded border p-2"
                value={userName}
                onChange={handleNameChange}
              />
            </div>

            <div>
              <label
                htmlFor="userMobile"
                className="block font-bold text-gray-600"
              >
                User Mobile Number:
              </label>
              <input
                type="text"
                id="userMobile"
                className="w-full rounded border p-2"
                value={userMobile}
                onChange={handleMobileChange}
              />
            </div>

            <button
              className=" w-full rounded bg-blue-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700 md:mt-10"
              onClick={handleClick}
            >
              Submit
            </button>
          </div>

          <div className="mt-8">
            <table className="min-w-full rounded-lg border">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-800">
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">User Name</th>
                  <th className="px-6 py-3 text-left">User Number</th>
                  <th className="px-6 py-3 text-left">Course Name</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Action</th>
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
                      {!applyRequest.approved ? (
                        <button
                          className="rounded bg-green-400 px-4 py-2 text-white hover:bg-green-500"
                          onClick={() => approveApplyRequest(applyRequest)}
                        >
                          Approve Access
                        </button>
                      ) : (
                        <button
                          className="rounded bg-red-400 px-4 py-2 text-white hover:bg-red-500"
                          onClick={() => removeApplyRequest(applyRequest)}
                        >
                          Remove Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualEnroll;
