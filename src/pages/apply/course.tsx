import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Loading from '~/components/buttons/Loading';
import { trpc } from '~/utils/trpc';
import type { NextPage } from 'next';
import axios from 'axios';
import toast from 'react-hot-toast';
import checkPhoneNumber from '~/utils/number_checker';
import { env } from 'process';
import router from 'next/router';
import { decrypt } from '~/utils/otpSecure';
const ApplyCourse: NextPage = () => {
  const { data: session } = useSession();

  const [userName, setUserName] = useState(session?.user?.name);
  const [userMobile, setUserMobile] = useState('');
  const [comment, setComment] = useState('');

  const [showNumberVerifyLayout, setShowNumberVerifyLayout] = useState(false);
  const [verificationCodeFromApi, setVerificationCodeFromApi] = useState('');
  const [verificationCodeFromUser, setVerificationCodeFromUser] = useState('');

  const { data, isLoading } = trpc.course.findAllCourse.useQuery({
    id: session?.user?.id as string,
  });

  const [selectedCourse, setSelectedCourse] = useState(data?.courses[0]?.name);
  const [selectedCourseId, setSelectedCourseId] = useState(
    data?.courses[0]?.id,
  );

  if (isLoading) {
    return (
      <div className="absolute-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSelectedCourseId(e.target.value);

    console.log(e.target.value);
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleMobileChange = (e) => {
    setUserMobile(e.target.value);
  };

  const handleRegistration = async () => {
    try {
      toast.loading('আপনার নাম্বারে একটি OTP পাঠানো হচ্ছে...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userName,
          number: userMobile,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 409) {
        // User already exists
        //toast.error('User already exists with this Number');

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ userMobile }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.status === 404) {
          router.push(`/register?number=${userMobile}`);
        }
        if (data.verificationCode) {
          toast.dismiss();
          setVerificationCodeFromApi(data.verificationCode);
          setShowNumberVerifyLayout(true);
          return;
        } else {
          toast.error('SMS not sent due to an error. Please try again.');
          return;
        }
      }

      const data = await response.json();

      if (data.verificationCode) {
        toast.dismiss();
        setVerificationCodeFromApi(data.verificationCode);
        setShowNumberVerifyLayout(true);
        return;
      } else {
        toast.error('SMS not sent due to an error. Please try again.');
      }
    } catch (error) {
      toast.error('SMS not sent due to an error. Please try again.');
      console.error('Registration Error:', error);
    }
  };

  const handleClick = async () => {
    if (!selectedCourse) {
      toast.error('Please fill up all the fields properly');
      return;
    }

    if (!session?.user) {
      const result = checkPhoneNumber(userMobile as string);

      if (result !== true) {
        toast.error(result);
        return;
      }

      if (!userName) {
        toast.error('Write your name');
        return;
      }

      handleRegistration();
    } else {
      await axios
        .post('/api/apply/request_course', {
          course_id: selectedCourseId,
          name: userName,
          number: userMobile,
          user_id: session.user.id,
          key: env.MANUAL_ENROLL_KEY,
          comment: comment,
        })
        .then(function (response) {
          toast.success('Enrollment Request Successful');
          router.push('/apply/pending');
        })
        .catch(function (error) {
          toast.error('Enrollment Failed');
        });
    }
  };

  const handleVerification = async () => {
    if (verificationCodeFromUser === '') {
      return toast.error('Please enter a verification code');
    }
    if (decrypt(verificationCodeFromApi) === verificationCodeFromUser) {
      toast.loading('কোর্সের Access এর জন্য রিকোয়েস্ট করা হচ্ছে...');

      await axios
        .post('/api/apply/request_course', {
          course_id: selectedCourseId,
          name: userName,
          number: userMobile,
          key: env.MANUAL_ENROLL_KEY,
          comment,
        })
        .then(function (response) {
          toast.success('Enrollment Successful');
          signIn('credentials', {
            name: userName,
            number: userMobile,
            course_id: selectedCourseId,
            callbackUrl: '/apply/pending',
          });
        })
        .catch(function (error) {
          toast.error('Enrollment Failed');
        });
    } else {
      toast.dismiss();
      toast.error(
        'আপনার প্রদান করা OTP টি সঠিক নয়, অনুগ্রহ করে আবার চেষ্টা করুন',
      );
    }
  };

  return (
    <div className="m-6 flex w-full flex-col items-center justify-center">
      {status === 'loading' ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col pt-7 lg:w-10/12 lg:px-12">
          <h1 className=" w-full text-center text-4xl font-bold ">
            Apply for Course Enrollment
          </h1>

          <div className="p-4 px-8">
            <div className="mb-4">
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

            {session?.user ? (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="block font-bold text-gray-600"
                  >
                    Reason for Apply Request: (your comment)
                  </label>
                  <input
                    type="text"
                    id="comment"
                    className="w-full rounded border p-2"
                    value={comment}
                    onChange={handleCommentChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="userName"
                    className="block font-bold text-gray-600"
                  >
                    Your Name:
                  </label>
                  <input
                    type="text"
                    id="userName"
                    className="w-full rounded border p-2"
                    value={userName as string}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="userMobile"
                    className="block font-bold text-gray-600"
                  >
                    Your Mobile Number:
                  </label>
                  <input
                    type="text"
                    id="userMobile"
                    className="w-full rounded border p-2"
                    value={userMobile}
                    onChange={handleMobileChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="block font-bold text-gray-600"
                  >
                    Reason for Requesting: (your comment)
                  </label>
                  <input
                    type="text"
                    id="comment"
                    className="w-full rounded border p-2"
                    value={comment}
                    onChange={handleCommentChange}
                  />
                </div>
              </>
            )}

            {showNumberVerifyLayout && (
              <div className="flex flex-col items-center justify-between bg-yellow-100 p-6">
                <p>
                  আপনার মোবাইল নাম্বারে কিছুক্ষণের মধ্যে একটি চার ডিজিটের কোড
                  পাঠানো হবে। কোডটি নিচের বক্সে লিখে ভেরিফাই বাটনে ক্লিক করুন।
                </p>

                <input
                  type="number"
                  className="w-48 rounded border border-gray-300 p-2 text-center dark:bg-gray-950"
                  placeholder=" 0 0 0 0 "
                  value={verificationCodeFromUser}
                  onChange={(e) => setVerificationCodeFromUser(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn-success w-full rounded bg-blue-500 px-4 py-2 font-bold text-white shadow-xl hover:bg-blue-700"
              onClick={
                showNumberVerifyLayout ? handleVerification : handleClick
              }
            >
              {showNumberVerifyLayout && 'Verify and '} Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyCourse;
