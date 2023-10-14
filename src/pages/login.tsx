import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { decrypt } from '~/utils/otpSecure';
import checkPhoneNumber from '~/utils/number_checker';

const LogIn: NextPage = () => {
  const [number, setNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(true);
  const [showNumberVerifyLayout, setShowNumberVerifyLayout] = useState(false);

  const [error, setError] = useState('');
  const [verificationCodeFromApi, setVerificationCodeFromApi] = useState('');
  const [verificationCodeFromUser, setVerificationCodeFromUser] = useState('');

  const router = useRouter();
  const { tran_id, bookId, courseId, phone } = router.query;

  const handleLogin = async () => {
    const result = checkPhoneNumber(number);

    if (result !== true) {
      toast.error(result);
      setError(result);
      return;
    }
    try {
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
        setError('');
        setVerificationCodeFromApi(data.verificationCode);
        setShowNumberVerifyLayout(true);
      } else {
        toast.error('SMS not sent due to an error. Please try again.');
        setError('SMS not sent due to an error. Please try again.');
      }
    } catch (error) {
      toast.error('SMS not sent due to an error. Please try again.');
      console.error('Registration Error:', error);
    }
  };

  useEffect(() => {
    if (tran_id && bookId) {
      const newUrl = `/payment_success?tran_id=${tran_id}&bookId=${bookId}`;
      router.push(newUrl);
    }
    if (tran_id && courseId) {
      const newUrl = `/payment_success?tran_id=${tran_id}&courseId=${courseId}`;
      router.push(newUrl);
    }

    if (phone && phone.length == 11) {
      // toast.loading(
      //   'We are automatically sending you the otp verification code, Please wait...',
      // );
      setNumber(String(phone));
      // handleLogin();
    }
  }, [tran_id, bookId, courseId, router, phone]);

  useEffect(() => {
    // if sessionstatus is authenticated, redirect to home page
    if (router.query.session_id) {
      router.push('/');
    }
  }, [router]);

  const handleSignInWithGoogle = () => {
    signIn('google', {
      callbackUrl: '/',
    });
  };

  const handleSignInWithFacebook = () => {
    signIn('facebook', {
      callbackUrl: '/',
    });
  };

  const handleNumberChange = (event: any) => {
    const inputNumber = event.target.value;
    setNumber(inputNumber);
  };

  const handleVerification = () => {
    if (verificationCodeFromUser === '') {
      return setError('Please enter a verification code');
    }
    if (decrypt(verificationCodeFromApi) === verificationCodeFromUser) {
      // Perform user registration with next-auth and redirect to the home page
      signIn('credentials', {
        number,
        callbackUrl: '/',
      });
    } else {
      toast.error('Invalid verification code. Please try again.');
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      {error && <p className="mx-8  my-5 text-red-500">{error}</p>}

      {showNumberVerifyLayout ? (
        <div className="my-6 w-4/6 rounded-lg bg-gray-100 px-8 py-12 shadow-md dark:bg-gray-900">
          <div className="flex flex-col items-center justify-between">
            <p>
              We have sent a 4-digit verification code to your number. Enter it
              here:
            </p>

            <input
              type="number"
              className="mx-24 mt-6  w-full rounded border border-gray-300 p-2 text-center dark:bg-gray-950"
              placeholder="0 0 0 0"
              value={verificationCodeFromUser}
              onChange={(e) => setVerificationCodeFromUser(e.target.value)}
            />
            <button
              onClick={handleVerification}
              className=" mt-6 w-full rounded bg-purple-700 p-2 text-white "
              disabled={!verificationCodeFromUser}
            >
              <b>Verify</b>
            </button>
          </div>
        </div>
      ) : (
        <div className="my-10 max-w-xl rounded-lg bg-white px-8 py-12 shadow-md dark:bg-gray-900">
          <h1 className="mb-6 text-center text-4xl font-bold">Log in</h1>
          <h2 className="text-center text-2xl text-purple-500">Teach-In</h2>
          <div className="mt-8 space-y-4">
            <p>
              If you already have an account here, then type your 11 digits
              mobile number:{' '}
            </p>
            <input
              type="tel"
              className="block w-full rounded border border-gray-300 p-3 focus:outline-none"
              placeholder="Enter your mobile number"
              value={number}
              onChange={handleNumberChange}
            />
            {!isValidNumber && (
              <p className="text-red-500">Please enter a valid phone number</p>
            )}
            <button
              className="block w-full rounded bg-purple-700 p-4 text-white hover:bg-purple-600"
              onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              Verify
            </button>

            <p className="mt-5 text-center">
              Dont have an account? {'  '}
              <span
                className="text-bold cursor-pointer text-purple-500 hover:text-purple-600"
                onClick={() => router.push('/register')}
              >
                Register Here
              </span>
            </p>
          </div>
          <p className=" mt-5 text-center">or</p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              className="flex items-center space-x-2 rounded bg-red-500 p-4 text-white hover:bg-red-600"
              onClick={handleSignInWithGoogle}
              disabled={!isValidNumber}
            >
              <FaGoogle className="h-6 w-6" />
              <span>Log in with Google</span>
            </button>
            {/* <button
              className="flex items-center space-x-2 rounded bg-blue-500 p-4 text-white hover:bg-blue-600"
              onClick={handleSignInWithFacebook}
              disabled={!isValidNumber}
            >
              <FaFacebook className="h-6 w-6" />
              <span>Log in with Facebook</span>
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};
export default LogIn;
