import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Modal } from '@react-pdf-viewer/core';
import { type NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaBook,
  FaFilePdf,
  FaBookOpen,
  FaPhoneAlt,
  FaUserAlt,
  FaAddressBook,
  FaComment,
  FaFacebook,
} from 'react-icons/fa';
import { GiIndiaGate, GiIndianPalace, GiRead } from 'react-icons/gi';
import { useIntersectionObserver } from 'usehooks-ts';
import Loading from '~/components/buttons/Loading';
import CartItem from '~/components/features/payment/CartItem';
import CheckoutOnly from '~/components/features/payment/CheckoutOnly';
import Head from '~/components/shared/Head';
import { break_point, c_cost, c_cost_more } from '~/contexts/constant';
import { districts } from '~/utils/districts';
import { divisions } from '~/utils/divisions';
import checkPhoneNumber from '~/utils/number_checker';
import { upazilas } from '~/utils/upazilas';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { decrypt } from '~/utils/otpSecure';
import { HiCurrencyBangladeshi } from 'react-icons/hi';
import { CurrencyBangladeshiIcon } from '@heroicons/react/20/solid';
import { BiCategory } from 'react-icons/bi';
import { BsGoogle } from 'react-icons/bs';

const DirectBuyPage: NextPage = () => {
  const router = useRouter();

  const slug = router.query.slug as string;
  const bookId = router.query.bookId as string;
  const courseId = router.query.courseId as string;

  const authStatus = router.query.authStatus as string;
  const copy = router.query.copy as string;
  const c = router.query.c as string;

  const { data: session } = useSession();

  const { data: data, status } = trpc.book.findDirectBuyInfo.useQuery({
    bookSlug: slug as string,
    userId: session?.user?.id,
    courseSlug: slug as string,
  });

  const refBtnCheckout = useRef<HTMLButtonElement | null>(null);
  const entry = useIntersectionObserver(refBtnCheckout, {});

  const [showNumberVerifyLayout, setShowNumberVerifyLayout] = useState(false);
  const [verificationCodeFromApi, setVerificationCodeFromApi] = useState('');
  const [verificationCodeFromUser, setVerificationCodeFromUser] = useState('');

  const book = data?.book;
  const course = data?.course;
  const user = data?.user;

  const [name, setName] = useState('');
  const [country, setCountry] = useState(c || 'Bangladesh');
  const [number, setNumber] = useState('');

  const [address, setAddress] = useState('');

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');

  useEffect(() => {
    if (user?.division) {
      setSelectedDivision(
        divisions.find((division) => division.name === user?.division)?.id ||
          '',
      );
    }
    if (user?.district) {
      setSelectedDistrict(
        districts.find((district) => district.name === user?.district)?.id ||
          '',
      );
    }
    if (user?.upazila) {
      setSelectedUpazila(
        upazilas.find((upazila) => upazila.name === user?.upazila)?.id || '',
      );
    }
    if (user?.address) {
      setAddress(user?.address);
    }
    if (user?.name) {
      setName(user?.name);
    }
    if (user?.number) {
      setNumber(user?.number);
    }
  }, [user]);

  const [comment, setComment] = useState('');
  const [buyMethod, setBuyMethod] = useState(copy || 'hard_copy');

  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const price: number = bookId
    ? book?.bookPrice || 0
    : course?.coursePrice || 0;

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [checkoutStatus, setCheckoutStatus] = useState<
    'error' | 'success' | 'loading' | 'idk' | 'init'
  >('init');

  const handleRegistration = async () => {
    try {
      toast.loading('আপনার নাম্বারে একটি OTP পাঠানো হচ্ছে...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          number,
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
          body: JSON.stringify({ number }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.status === 404) {
          router.push(`/register?phone=${number}`);
        }
        if (data.verificationCode) {
          toast.dismiss();
          setVerificationCodeFromApi(data.verificationCode);
          setShowNumberVerifyLayout(true);
          setCheckoutStatus('idk');
          setIsButtonDisabled(true);
          return;
        } else {
          setCheckoutStatus('error');

          toast.error('SMS not sent due to an error. Please try again.');
          return;
        }
      }

      const data = await response.json();

      if (data.verificationCode) {
        toast.dismiss();
        setVerificationCodeFromApi(data.verificationCode);
        setShowNumberVerifyLayout(true);
        setCheckoutStatus('idk');
        setIsButtonDisabled(true);
        return;
      } else {
        setCheckoutStatus('error');
        toast.error('SMS not sent due to an error. Please try again.');
      }
    } catch (error) {
      setCheckoutStatus('error');
      toast.error('SMS not sent due to an error. Please try again.');
      console.error('Registration Error:', error);
    }
  };

  const handleCheckoutBook = async (bookData: unknown) => {
    // show a confirmation modal and a checkbok to agree with terms and conditions, privacy policy, and refund policy before proceeding to payment

    setCheckoutStatus('loading');

    if (bookData && bookId) {
      try {
        const data = await axios.post(`/api/buy/create`, {
          amount:
            price +
            (buyMethod === 'pdf'
              ? 0
              : price > break_point
              ? c_cost
              : c_cost_more),
          orderDescription: nanoid(),
          bookIds: [bookId],
          userId: session?.user?.id,
          ...bookData,
        });

        setCheckoutStatus('success');
        // console.log('url: ' + data.data.gatewayUrl);
        router.push(data.data.gatewayUrl);
      } catch (error) {
        toast.error('Payment creation error!');
        setCheckoutStatus('error');
        console.error('error when create payment');
        console.error(error);
      }
    } else if (courseId) {
      handleCheckoutCourse();
    }
  };

  const handleCheckoutCourse = async () => {
    setCheckoutStatus('loading');

    if (courseId) {
      try {
        const data = await axios.post(`/api/payment/create`, {
          amount: price,
          number: number,
          course_name: course?.name,
          name: name,
          email: session?.user?.email,
          orderDescription: nanoid(),
          courseIds: [course?.id],
          userId: session?.user?.id,
          fb_link: course?.facebookGroupLink + ' - ' + course?.slug,
        });

        setCheckoutStatus('success');
        //console.log('url: ' + data.data.gatewayUrl);
        router.push(data.data.gatewayUrl);
      } catch (error) {
        // toast.error('Payment creation error! Try later');
        setCheckoutStatus('error');
        console.error('error when create payment');
        console.error(error);
      }
    } else {
      toast.error('Enter your name, number and address correctly');
      setCheckoutStatus('error');
    }
  };

  const handleOpenModal = () => {
    setCheckoutStatus('loading');

    if (country === 'India') {
      if (!session?.user) {
        toast.success('India হওয়ায় আপনাকে গুগল দিয়ে সাইন আপ করতে হবে');
        toast.loading('গুগল সাইন আপ পেজে নিয়ে যাওয়া হচ্ছে...');
        localStorage.setItem('state', 'processing');

        let url;

        if (courseId) {
          url = `/direct_buy?slug=${slug}&courseId=${courseId}`;
          url = url + '&authStatus=success&c=India';
        }

        signIn('google', {
          name,
          number,
          callbackUrl: url,
        });
        return;
      } else {
        buyFromIndia();
      }
    }

    if (bookId) {
      //console.log('bookId: ' + bookId);
      if (name === null || name === '') {
        setCheckoutStatus('error');
        return toast.error('আপনার নামটি সঠিকভাবে লিখুন');
      }

      const result = checkPhoneNumber(number as string);

      if (result !== true) {
        setCheckoutStatus('error');
        toast.error(result);
        return;
      }

      if (buyMethod === 'pdf') {
        handleCheckout();
      }

      if (address === null || address === '') {
        setCheckoutStatus('error');
        return toast.error('ঠিকানাটি সঠিকভাবে লিখুন');
      }
      if (
        selectedDistrict === '' ||
        selectedDivision === '' ||
        selectedUpazila === ''
      ) {
        setCheckoutStatus('error');
        return toast.error('আপনার বিভাগ, জেলা এবং উপজেলা সঠিকভাবে লিখুন');
      }
    } else {
      const result = checkPhoneNumber(number as string);

      if (result !== true) {
        setCheckoutStatus('error');

        toast.error(result);
        return;
      }

      if (name === null || name === '') {
        setCheckoutStatus('error');
        return toast.error('আপনার নামটি সঠিকভাবে লিখুন');
      }
    }
    handleCheckout();
  };

  const handleCheckout = async () => {
    if (!session?.user) {
      if (name && number) {
        handleRegistration();
      } else {
        setCheckoutStatus('error');
        return toast.error(
          'আপনার নামটি সঠিকভাবে লিখুন এবং আপনার মোবাইল নাম্বারটি সঠিকভাবে লিখুন',
        );
      }
      return;
    }

    if (
      name &&
      number &&
      address &&
      selectedDistrict &&
      selectedDivision &&
      selectedUpazila
    ) {
      const bookData = {
        nameUser: name,
        number: number,
        address: address,
        comment,
        district: districts.find((district) => district.id === selectedDistrict)
          ?.name,
        division: divisions.find((division) => division.id === selectedDivision)
          ?.name,
        upazila: upazilas.find((upazila) => upazila.id === selectedUpazila)
          ?.name,
        type: buyMethod,
      };

      if (!agreed) {
        setCheckoutStatus('error');

        toast.error('Please agree to the terms and conditions.');
        return;
      }

      await handleCheckoutBook(bookData);
    } else if (number) {
      if (buyMethod === 'pdf') {
        const bookData = {
          nameUser: name,
          number: number,
          address: '-',
          comment: '-',
          district: '-',
          division: '-',
          upazila: '-',
          type: buyMethod,
        };

        if (!agreed) {
          setCheckoutStatus('error');

          toast.error('Please agree to the terms and conditions.');
          return;
        }

        await handleCheckoutBook(bookData);
      } else {
        if (name && number && course?.name) {
          await handleCheckoutCourse();
        }
      }
    } else {
      setCheckoutStatus('error');

      toast.error('কেনার জন্য তথ্যগুলো সঠিকভাবে পূরণ করুন');
    }
  };

  const handlePaymentChange = (event) => {
    setBuyMethod(event.target.value);
  };
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleVerification = () => {
    if (verificationCodeFromUser === '') {
      setCheckoutStatus('error');
      return toast.error('Please enter a verification code');
    }
    if (decrypt(verificationCodeFromApi) === verificationCodeFromUser) {
      // Perform user registration with next-auth and redirect to the home page
      toast.success('OTP মিলেছে। আপনার নাম্বারটি যাচাই করা হয়েছে');
      toast.loading('আপনার একাউন্ট টি তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
      localStorage.setItem('state', 'processing');

      let url;

      if (courseId) {
        url = `/direct_buy?slug=${slug}&courseId=${courseId}`;
        url = url + '&authStatus=success';
      }

      if (bookId) {
        url = `/direct_buy?slug=${slug}&bookId=${bookId}`;
        url = url + '&authStatus=success' + '&copy=' + buyMethod;
      }

      signIn('credentials', {
        name,
        number,
        address: address,
        district: districts.find((district) => district.id === selectedDistrict)
          ?.name,
        division: divisions.find((division) => division.id === selectedDivision)
          ?.name,
        upazila: upazilas.find((upazila) => upazila.id === selectedUpazila)
          ?.name,
        callbackUrl: url,
      });
    } else {
      toast.dismiss();
      setCheckoutStatus('error');
      toast.error(
        'আপনার প্রদান করা OTP টি সঠিক নয়, অনুগ্রহ করে আবার চেষ্টা করুন',
      );
    }
  };

  const buyFromIndia = async () => {
    const data = await axios.post(`/api/payment/create`, {
      amount: price,
      number: number,
      email: session?.user?.email,
      course_name: course?.name,
      name: name,
      orderDescription: nanoid(),
      courseIds: [course?.id],
      userId: session?.user?.id,
      fb_link: course?.facebookGroupLink + ' - ' + course?.slug,
    });

    setCheckoutStatus('success');
    //console.log('url: ' + data.data.gatewayUrl);
    router.push(data.data.gatewayUrl);
  };

  useEffect(() => {
    const state = localStorage.getItem('state');
    if (
      c &&
      c === 'India' &&
      course?.name &&
      authStatus === 'success' &&
      session?.user
    ) {
      if (state === 'processing') {
        toast.success('আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে');
        toast.loading('পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে...');
        buyFromIndia();
        localStorage.setItem('state', 'done');
        return;
      }
    }

    if (
      authStatus === 'success' &&
      (book?.name || course?.name) &&
      user &&
      name &&
      number &&
      c !== 'India'
    ) {
      if (state === 'processing') {
        toast.success('আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে');
        toast.loading('পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে...');
        handleCheckout();
        localStorage.setItem('state', 'done');
      }
      //   delay 1 second to show the success toast
    }
  }, [
    authStatus,
    book?.name,
    course?.name,
    user,
    name,
    number,
    c,
    session?.user,
  ]);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60); // Initial countdown value in seconds

  useEffect(() => {
    let countdownInterval: string | number | NodeJS.Timeout | undefined;

    if (isButtonDisabled) {
      countdownInterval = setInterval(() => {
        if (countdown > 0) {
          setCountdown(countdown - 1);
        }
      }, 1000);
    } else {
      clearInterval(countdownInterval);
    }
    return () => {
      clearInterval(countdownInterval);
    };
  }, [isButtonDisabled, countdown]);

  return (
    <>
      <Head title="Direct Buy -Teach-In" />
      <div className="mx-auto min-h-screen w-full pt-6 md:max-w-[720px] lg:max-w-[1200px]">
        {status === 'loading' ? (
          <div className="flex h-screen items-center justify-center">
            অনুগ্রহ করে অপেক্ষা করুন...
            <Loading />
          </div>
        ) : (
          <>
            {showModal && (
              <Modal onClose={handleCloseModal} title={'Are you agree?'}>
                <div className="p-4 text-center">
                  <h2 className="mb-4 text-2xl text-black dark:text-white md:text-xl lg:text-2xl">
                    দয়া করে এগিয়ে যাওয়ার আগে নীচের শর্তাবলী গুলো পড়ে নিন।
                    <div className="my-3">
                      Click on the{' '}
                      <span className="text-semibold bg: rounded-md bg-purple-100 px-2 dark:bg-purple-900">
                        I Agree...
                      </span>{' '}
                      Checkbox to Continue Next
                    </div>
                  </h2>

                  <div className="flex flex-col items-center">
                    <label className="mb-4 inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-6 w-6 md:h-8 md:w-8"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <span className="ml-3 text-xl text-gray-900 dark:text-white">
                        I agree to the{' '}
                        <Link
                          className="text-violet-800 dark:text-purple-400 "
                          href="/terms_of_use"
                          target="_blank"
                        >
                          Terms and Conditions
                        </Link>
                        {', '}
                        <Link
                          className="text-violet-800 dark:text-purple-400 "
                          href="/privacy_policy"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link
                          className="text-violet-800 dark:text-purple-400 "
                          href="/refund_policy"
                          target="_blank"
                        >
                          Refund Policy
                        </Link>
                        .
                      </span>
                    </label>
                    <button
                      className="rounded-lg bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-violet-900 md:px-6 md:py-3 lg:px-8 lg:py-4"
                      onClick={handleCheckout}
                    >
                      কিনুন
                    </button>
                  </div>
                </div>
              </Modal>
            )}

            <div className="flex w-full flex-col p-4 md:p-6 lg:p-8">
              <CheckoutOnly
                shouldShow={
                  !Boolean(entry?.isIntersecting) && !!refBtnCheckout.current
                }
              />

              <div className="flex items-center space-x-4">
                <ShoppingCartIcon className="h-10 w-10" />
                <h1 className="text-4xl font-semibold capitalize">কার্ট</h1>
                <h2 className="text-2xl font-semibold">Direct Buy</h2>
              </div>

              <div className=" flex flex-col space-y-8  md:flex-row md:space-y-0">
                <div className="flex w-full flex-col md:w-[50%] lg:m-4">
                  <ul className="my-6 w-full space-y-8">
                    {book && (
                      <CartItem
                        courseId={''}
                        bookId={book?.id || ''}
                        wishlistId={null}
                        isFavorite={false}
                        cartId={book.id}
                        key={book.id}
                        book={book}
                      />
                    )}

                    {course && (
                      <CartItem
                        courseId={course?.id || null}
                        bookId={''}
                        wishlistId={null}
                        isFavorite={false}
                        cartId={course.id}
                        key={course.id}
                        course={course}
                      />
                    )}
                  </ul>
                </div>

                <div className="mb-8 flex flex-1 flex-col space-x-2 space-y-6 rounded-xl shadow-none md:mb-0 md:space-y-8">
                  {bookId && (
                    <>
                      <div className=" mb-12 w-full  space-x-2 space-y-4 rounded-xl bg-white p-6 dark:bg-slate-800 md:mx-3 lg:mt-10">
                        <div className="flex flex-row items-center justify-center">
                          বইটি কিনতে হলে নীচের তথ্যগুলো সঠিকভাবে পূরণ করুন
                        </div>

                        <div className="flex items-center space-x-2">
                          <GiRead size={24} className="text-gray-500" />
                          <label htmlFor="payment" className=" font-semibold">
                            কিভাবে কিনতে চান?
                          </label>
                        </div>
                        <div className="my-4 flex items-center gap-3 space-x-4 rounded-xl border px-3 outline-1 ">
                          <label
                            htmlFor="hard_copy"
                            className="flex cursor-pointer items-center"
                          >
                            <input
                              type="radio"
                              id="hard_copy"
                              name="payment"
                              value="hard_copy"
                              checked={buyMethod === 'hard_copy'}
                              onChange={handlePaymentChange}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-gray-300 ${
                                buyMethod === 'hard_copy' ? 'bg-blue-500' : ''
                              }`}
                            >
                              <FaBook className={`text-white`} />
                            </span>
                            <span
                              className={`mx-4 my-3 ml-2 flex flex-row items-center px-6 py-3 text-lg ${
                                buyMethod === 'hard_copy'
                                  ? 'rounded-xl border-2 border-solid border-blue-500 bg-blue-100 font-bold  dark:bg-blue-900 '
                                  : ''
                              }`}
                            >
                              <FaBook className="mr-3" />
                              হার্ড কপি বা মূল বই [আপনার ঠিকানায় বইটি পাঠানো
                              হবে]
                            </span>
                          </label>

                          {book?.isPdfAvailable && !book?.isFreePdf && (
                            <label
                              htmlFor="pdf"
                              className="flex cursor-pointer items-center"
                            >
                              <input
                                type="radio"
                                id="pdf"
                                name="payment"
                                value="pdf"
                                checked={buyMethod === 'pdf'}
                                onChange={handlePaymentChange}
                                className="sr-only"
                              />
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-xl border border-gray-300 ${
                                  buyMethod === 'pdf' ? 'bg-blue-500' : ''
                                }`}
                              >
                                <FaFilePdf className={`text-white`} />
                              </span>
                              <span
                                className={`mx-4 my-3 ml-2 flex flex-row  items-center px-6 py-3 text-lg ${
                                  buyMethod === 'pdf'
                                    ? 'rounded-xl border-2 border-solid border-blue-500 bg-blue-100 font-bold dark:bg-blue-900 '
                                    : ''
                                }`}
                              >
                                <FaFilePdf className="mr-3" />
                                PDF কপি [বইটি আমাদের ওয়েবসাইটেই পড়তে পারবেন]
                              </span>
                            </label>
                          )}

                          {book?.isPdfAvailable && book?.isFreePdf && (
                            <Link href={'/reading/' + book.id}>
                              <span
                                className={`mx-4 my-3 ml-2 flex flex-row  items-center rounded-xl border-2 border-solid border-purple-800 bg-purple-500  px-6 py-3 text-lg font-bold text-white dark:bg-purple-950 `}
                              >
                                <FaBookOpen className="mr-3" />
                                বইটির অনলাইনে ফ্রীতে পড়ুন
                              </span>
                            </Link>
                          )}
                        </div>

                        {!session?.user && (
                          <>
                            <div className="flex items-center space-x-2">
                              <FaUserAlt size={24} className="text-gray-500" />
                              <label htmlFor="name" className="font-semibold">
                                আপনার নামঃ
                              </label>
                            </div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              id="name"
                              name="name"
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              placeholder="আপনার নামটি সঠিকভাবে লিখুন"
                            />
                          </>
                        )}

                        <div className="flex items-center space-x-2">
                          <FaPhoneAlt size={24} className="text-gray-500" />
                          <label htmlFor="phone" className="font-semibold">
                            আপনার মোবাইল নম্বরঃ
                          </label>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          name="phone"
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          placeholder="আপনার নাম্বারটি সঠিকভাবে লিখুন"
                        />

                        {buyMethod === 'hard_copy' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <label htmlFor="phone" className="font-semibold">
                                বিভাগ:
                              </label>
                            </div>
                            <select
                              id="division"
                              name="division"
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              value={selectedDivision}
                              onChange={(e) =>
                                setSelectedDivision(e.target.value)
                              }
                            >
                              <option value="">বিভাগ নির্বাচন করুন</option>
                              {divisions.map((division) => (
                                <option key={division.id} value={division.id}>
                                  {division.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center space-x-2">
                              <label htmlFor="phone" className="font-semibold">
                                জেলা:
                              </label>
                            </div>
                            <select
                              id="district"
                              name="district"
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              value={selectedDistrict}
                              onChange={(e) =>
                                setSelectedDistrict(e.target.value)
                              }
                              disabled={!selectedDivision}
                            >
                              <option value="">জেলা সিলেক্ট করুন </option>
                              {districts
                                .filter(
                                  (district) =>
                                    district.division_id === selectedDivision,
                                )
                                .map((district) => (
                                  <option key={district.id} value={district.id}>
                                    {district.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex items-center space-x-2">
                              <label htmlFor="phone" className="font-semibold">
                                উপজেলা:
                              </label>
                            </div>
                            <select
                              id="upazila"
                              name="upazila"
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              value={selectedUpazila}
                              onChange={(e) =>
                                setSelectedUpazila(e.target.value)
                              }
                              disabled={!selectedDistrict}
                            >
                              <option value="">উপজেলা সিলেক্ট করুন</option>
                              {upazilas
                                .filter(
                                  (upazila) =>
                                    upazila.district_id === selectedDistrict,
                                )
                                .map((upazila) => (
                                  <option key={upazila.id} value={upazila.id}>
                                    {upazila.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex items-center space-x-2">
                              <FaAddressBook
                                size={24}
                                className="text-gray-500"
                              />
                              <label
                                htmlFor="address"
                                className="font-semibold"
                              >
                                পূর্ণাঙ্গ ঠিকানাঃ
                              </label>
                            </div>
                            <textarea
                              id="address"
                              name="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              style={{ height: '100px' }} // Adjust the height value as needed
                              placeholder="(বাসার নাম, রোড নং, বাড়ি নং,
                                      বিল্ডিং নং, এপার্টমেন্ট নং, ইত্যাদি)"
                            />
                            <div className="flex items-center space-x-2">
                              <FaComment size={24} className="text-gray-500" />
                              <label
                                htmlFor="address"
                                className="font-semibold"
                              >
                                কোন মতামত থাকলে লিখুনঃ (অপশনাল)
                              </label>
                            </div>
                            <textarea
                              id="comment"
                              name="comment"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                              style={{ height: '100px' }} // Adjust the height value as needed
                              placeholder="আপনার মতামত থেকে থাকলে লিখুন"
                            />
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {courseId && (
                    <>
                      <div className=" w-full space-y-4 rounded-xl bg-white p-6  dark:bg-slate-800 lg:mt-10">
                        <div className="my-4 mb-12 flex flex-row items-center justify-center">
                          কোর্সটি কিনতে আপনার মোবাইল নাম্বার ও ফেসবুক একাউন্টের
                          নামটি সঠিকভাবে পূরণ করুন
                        </div>

                        <div className="flex items-center space-x-2">
                          <BiCategory size={24} className="text-gray-500" />
                          <label htmlFor="country" className=" font-semibold">
                            আপনি কোন দেশ থেকে কিনতে চান?
                          </label>
                        </div>
                        <div className="my-4 flex items-center gap-3 space-x-4 rounded-xl border px-3 outline-1 ">
                          <label
                            htmlFor="Bangladesh"
                            className="flex cursor-pointer items-center"
                          >
                            <input
                              type="radio"
                              id="Bangladesh"
                              name="country"
                              value="Bangladesh"
                              checked={country === 'Bangladesh'}
                              onChange={handleCountryChange}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-gray-300 ${
                                country === 'Bangladesh' ? 'bg-green-500' : ''
                              }`}
                            >
                              <CurrencyBangladeshiIcon
                                className={`text-white`}
                              />
                            </span>
                            <span
                              className={`mx-4 my-3 ml-2 flex flex-row items-center px-6 py-3  text-2xl ${
                                country === 'Bangladesh'
                                  ? 'rounded-xl border-2 border-solid border-green-500 bg-green-100 font-bold  dark:bg-green-900 '
                                  : ''
                              }`}
                            >
                              <HiCurrencyBangladeshi className="mr-3" />
                              বংলাদেশ
                            </span>
                          </label>

                          <label
                            htmlFor="India"
                            className="flex cursor-pointer items-center"
                          >
                            <input
                              type="radio"
                              id="India"
                              name="country"
                              value="India"
                              checked={country === 'India'}
                              onChange={handleCountryChange}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-gray-300 ${
                                country === 'India' ? 'bg-orange-500' : ''
                              }`}
                            >
                              <GiIndianPalace className={`text-white`} />
                            </span>
                            <span
                              className={`mx-4 my-3 ml-2 flex flex-row items-center  px-6 py-3  text-2xl ${
                                country === 'India'
                                  ? 'rounded-xl border-2 border-solid border-orange-500 bg-orange-100 font-bold dark:bg-orange-900 '
                                  : ''
                              }`}
                            >
                              <GiIndiaGate className="mr-3" />
                              ভারত
                            </span>
                          </label>
                        </div>

                        {country === 'India' ? (
                          <div className="flex items-center justify-center">
                            <BsGoogle className="mr-4 h-10 w-10" /> ভারত থেকে
                            গুগল একাউন্ট ব্যবহার করে <br /> কোর্সটি কিনতে
                            &ldquo;কিনুন&rdquo; বাটনে ক্লিক করুন <br />
                          </div>
                        ) : (
                          <></>
                        )}

                        <>
                          {' '}
                          <div className="flex items-center space-x-2">
                            <FaPhoneAlt size={24} className="text-gray-500" />
                            <label htmlFor="phone" className="font-semibold">
                              আপনার মোবাইল নম্বরঃ
                            </label>
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            name="phone"
                            className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                            placeholder="আপনার নাম্বার"
                          />
                          <div className="flex items-center space-x-2">
                            <FaFacebook size={24} className="text-gray-500" />
                            <label htmlFor="name" className="font-semibold">
                              আপনার ফেসবুক প্রোফাইলের নামঃ
                            </label>
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            id="name"
                            name="name"
                            className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                            placeholder="আপনার ফেসবুকের নাম"
                          />
                        </>
                      </div>
                    </>
                  )}

                  <div className="flex flex-row items-center justify-between text-3xl font-bold">
                    <div>দাম</div>

                    <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

                    <div className="text-red">
                      {new Intl.NumberFormat('bn-BD', {
                        style: 'currency',
                        currency: 'BDT',
                        minimumFractionDigits: 0,
                      }).format(price || 0)}
                    </div>
                  </div>

                  {book && (
                    <>
                      {buyMethod === 'hard_copy' && (
                        <div className="flex  flex-row items-center justify-between text-3xl font-bold">
                          <div>কুরিয়ার খরচ</div>
                          <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

                          <div className="text-red">
                            {new Intl.NumberFormat('bn-BD', {
                              style: 'currency',
                              currency: 'BDT',
                              minimumFractionDigits: 0,
                            }).format(
                              price > break_point ? c_cost : c_cost_more,
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex  flex-row items-center justify-between text-3xl font-bold text-red-700">
                        <div>সর্বমোট</div>
                        <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

                        <div className="text-red">
                          {new Intl.NumberFormat('bn-BD', {
                            style: 'currency',
                            currency: 'BDT',
                            minimumFractionDigits: 0,
                          }).format(
                            price +
                              (buyMethod === 'pdf'
                                ? 0
                                : price > break_point
                                ? c_cost
                                : c_cost_more),
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {showNumberVerifyLayout && (
                    <div className="flex flex-col items-center justify-between bg-yellow-100 p-6">
                      <p>
                        আপনার মোবাইল নাম্বারে কিছুক্ষণের মধ্যে একটি চার ডিজিটের
                        কোড পাঠানো হবে। কোডটি নিচের বক্সে লিখে ভেরিফাই বাটনে
                        ক্লিক করুন।
                      </p>

                      <input
                        type="number"
                        className="w-48 rounded border border-gray-300 p-2 text-center dark:bg-gray-950"
                        placeholder=" 0 0 0 0 "
                        value={verificationCodeFromUser}
                        onChange={(e) =>
                          setVerificationCodeFromUser(e.target.value)
                        }
                      />
                      {isButtonDisabled && (
                        <p className=" text-base text-purple-600 ">
                          {' '}
                          {countdown} সেকেন্ড পর
                        </p>
                      )}
                      <button
                        className=" pb-3 text-base italic text-purple-600 underline"
                        onClick={handleOpenModal}
                      >
                        পুনরায় কোডটি পাঠান
                      </button>
                    </div>
                  )}

                  {price > 0 && (
                    <button
                      onClick={
                        showNumberVerifyLayout
                          ? handleVerification
                          : handleOpenModal
                      }
                      ref={refBtnCheckout}
                      disabled={checkoutStatus === 'loading'}
                      className="absolute-center min-h-[4.4rem] w-full rounded-lg bg-purple-600 text-white md:mx-3"
                    >
                      {checkoutStatus === 'loading' ? (
                        <Loading />
                      ) : showNumberVerifyLayout ? (
                        'ভেরিফাই করুন ও কিনুন'
                      ) : (
                        'কিনুন'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DirectBuyPage;
