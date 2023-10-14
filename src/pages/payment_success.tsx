import { type NextPage } from 'next';
import { GiPartyPopper } from 'react-icons/gi';
import { PATHS } from '~/constants';
import Link from 'next/link';
import Head from '~/components/shared/Head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { trpc } from '~/utils/trpc';
import Image from 'next/image';
import { FaFacebook } from 'react-icons/fa';
import Loading from '~/components/buttons/Loading';
import { MdOutlineCastForEducation } from 'react-icons/md';
const PaymentSuccess: NextPage = () => {
  const router = useRouter();
  const { tran_id, bookId, courseId, id, c } = router.query;

  const [bookYes, setBookYes] = useState(false);
  const [courseYes, setCourseYes] = useState(false);

  const { data: course } = trpc.course.findCourseById.useQuery({
    id: courseId as string,
  });

  useEffect(() => {
    if (tran_id && bookId) {
      setBookYes(true);
    }
    if (tran_id && courseId) {
      setCourseYes(true);
    }
  }, [tran_id, bookId, courseId, router]);

  const handleCallClick = () => {
    // Replace this with the actual phone number you want to call
    const phoneNumber = '01320820854';

    // Initiate the phone call using the tel: link
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <>
      <Head title="Payment Success- Teach-In" />

      <div className="mx-auto min-h-screen w-full pt-10 md:max-w-[720px] lg:max-w-[1200px]">
        <div className="absolute-center mt-auto w-full flex-col space-y-8">
          {bookYes && (
            <div className="mx-10 w-full items-center justify-center px-8">
              <p className="mx-6 text-4xl">
                Your Book has been purchased successfully. Check your SMS to get
                tracking link.
                <GiPartyPopper className="text-green h-20 w-full" />
                <h1 className="text-green text-3xl font-bold md:text-4xl">
                  Payment success!
                </h1>
              </p>
              {id && (
                <button className="btn-primary  btn-lg btn m-4 my-6 w-full justify-center ">
                  <Link href={`/reading/${id}`}>Read your book online</Link>
                </button>
              )}
              <button className="btn-primary btn m-4 w-full justify-center ">
                <Link href={`/track_order/${bookId}`}>Track Your Order</Link>
              </button>
            </div>
          )}

          {courseYes && (
            <div className="mx-3 rounded-lg bg-gradient-to-br from-purple-500 via-pink-600 to-purple-600 p-4 shadow-lg">
              <div className="mb-4 text-center text-2xl font-bold text-white">
                Congratulations! Your Course has been purchased successfully.
                <GiPartyPopper className="h-20 w-full text-white" />
                <h1 className="text-3xl font-bold text-white md:text-4xl">
                  Payment success!
                </h1>
              </div>

              {/* A nice text view to show 4-digit code in a stylish UI */}
              <div className=" mb-4 rounded-lg bg-white bg-opacity-30 p-4 text-center text-3xl text-white shadow-lg  backdrop-blur-2xl">
                Your Group ID:{' '}
                <span className=" font-black text-white ">{c}</span>
              </div>

              {!course ? (
                <div className="w-fu flex flex-row items-center justify-center p-4 text-center text-2xl text-white">
                  Loading Course Information... <Loading />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-between rounded-lg bg-white bg-opacity-30 p-6 shadow-md md:flex-row">
                  <div className="md:w-1/3">
                    <Image
                      src={course.thumbnail || ''}
                      alt="course-thumbnail"
                      width={160}
                      quality={100}
                      height={80}
                      className="h-auto w-full rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="ml-4 md:w-1/3">
                    <h1 className="mb-2 mt-4 text-5xl font-bold text-white md:text-5xl">
                      {course.name}
                    </h1>
                    <h2 className="mb-4 text-3xl  text-white md:text-4xl">
                      {course.instructor.name}
                    </h2>
                  </div>
                  <div className="mt-4 text-center text-white md:mt-0">
                    ফেসবুক গ্রুপে অবশ্যই জয়েন করুন
                    <a
                      href={course.facebookGroupLink as string}
                      className="my-2 flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-mono text-white shadow-lg shadow-blue-400 transition-transform hover:scale-105 hover:bg-blue-600"
                    >
                      <FaFacebook className="mr-2" />
                      Go to Facebook Group
                    </a>
                    <a
                      href={
                        '/learning/' + course.slug + '/' + course.slug + '_1_1'
                      }
                      className=" hover:scale-101  my-2 mt-8 flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-thin text-white transition-transform hover:bg-purple-600"
                    >
                      <MdOutlineCastForEducation className="mr-2" />
                      Go to Teach-In Course Page
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* <button className="btn-primary btn-lg btn m-1">
                <Link
                  href={'/learning/' + course.slug + '/' + course.slug + '_1_1'}
                >
                  Start Study
                </Link>
              </button>
              <button className="btn-primary btn-lg btn mt-36">
                <Link href={`/${PATHS.MY_LEARNING}/${PATHS.COURSE}`}>
                  Go to My Courses
                </Link>
              </button> */}

          {/* <div className="absolute-center flex w-full flex-col space-x-6">
            <button className="btn-follow-theme btn-lg btn">
              <Link
                href={`/${PATHS.USER}/${PATHS.USER_PROFILE}?section=payment-history`}
              >
                Review payment history
              </Link>
            </button>
          </div> */}

          {bookId && (
            <div className="absolute-center w-full space-x-6">
              <button
                className="btn-follow-theme btn-lg btn"
                onClick={handleCallClick}
              >
                Call US
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
