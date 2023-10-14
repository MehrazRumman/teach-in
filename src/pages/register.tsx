import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { decrypt } from '~/utils/otpSecure';
import checkPhoneNumber from '~/utils/number_checker';

const Register: NextPage = () => {
  const [number, setNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(true);
  const [showNumberVerifyLayout, setShowNumberVerifyLayout] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [verificationCodeFromApi, setVerificationCodeFromApi] = useState('');
  const [verificationCodeFromUser, setVerificationCodeFromUser] = useState('');

  const [numberExists, setNumberExist] = useState(false);

  const router = useRouter();

  const { tran_id, bookId, courseId, phone } = router.query;

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
      setError('Enter your name to Register');
      setNumber(String(phone));
    }
  }, [tran_id, bookId, courseId, router, phone]);

  const handleNameChange = (event) => {
    const inputName = event.target.value;
    setName(inputName);
  };

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

  const handleRegistration = async () => {
    const result = checkPhoneNumber(number);

    if (result !== true) {
      setError(result);
      toast.error(result);
      return;
    }

    if (name === '') {
      toast.error('Please enter your name');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, number }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 409) {
        // User already exists
        toast.error('User already exists with this Number');
        setError('User already exists with this Number');
        setNumberExist(true);

        const newUrl = `/login?phone=${number}`;
        router.push(newUrl);

        return;
      }

      const data = await response.json();

      if (data.verificationCode) {
        setVerificationCodeFromApi(data.verificationCode);
        setShowNumberVerifyLayout(true);
      } else {
        setError('SMS not sent due to an error. Please try again.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
    }
  };

  const handleVerification = () => {
    if (verificationCodeFromUser === '') {
      return setError('Please enter a verification code');
    }
    if (decrypt(verificationCodeFromApi) === verificationCodeFromUser) {
      // Perform user registration with next-auth and redirect to the home page
      signIn('credentials', {
        name,
        number,
        callbackUrl: '/',
      });
    } else {
      toast.error('Invalid verification code. Please try again.');
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleNumberChange = (event: any) => {
    const inputNumber = event.target.value;
    setNumber(inputNumber);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ">
      {error && (
        <div className=" rounded-lg px-8 py-12 shadow-md">
          <div className="flex flex-col items-center justify-between">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      )}

      {showNumberVerifyLayout ? (
        <div className=" rounded-lg px-8 py-12 shadow-md">
          <div className="flex flex-col items-center justify-between">
            <p>
              We have sent a 4-digit verification code to your number. Enter it
              here:
            </p>

            <input
              type="number"
              className="w-36 rounded border border-gray-300 p-2 text-center dark:bg-gray-950"
              placeholder="0 0 0 0"
              value={verificationCodeFromUser}
              onChange={(e) => setVerificationCodeFromUser(e.target.value)}
            />
            <button
              onClick={handleVerification}
              className=" mt-6 rounded bg-purple-700 p-2 text-white"
              disabled={!verificationCodeFromUser}
            >
              <b>Verify</b>
            </button>
          </div>
        </div>
      ) : (
        <div className="my-10 w-10/12 rounded-lg bg-gray-100 px-8 py-12 shadow-md dark:bg-gray-900 lg:w-1/2">
          <h1 className="mb-6 text-center text-4xl font-bold">Register</h1>
          <h2 className="text-center text-2xl text-purple-700">Teach-In</h2>
          <div className="mt-8 space-y-4">
            <label className="block font-semibold">Name</label>
            <input
              type="name"
              className="block w-full rounded border border-gray-300 p-3 text-lg  focus:outline-none"
              placeholder="Enter your Name"
              value={name}
              onChange={handleNameChange}
            />

            <label className="block font-semibold">Phone Number</label>
            <input
              type="tel"
              className="block w-full rounded border border-gray-300 p-3 text-lg focus:outline-none"
              placeholder="Enter your phone number"
              value={number}
              onChange={handleNumberChange}
            />

            {!isValidNumber && (
              <p className="text-red-500">Please enter a valid phone number</p>
            )}
            {numberExists && (
              <p className="text-red-500">
                This number is already registed. try login with this number
              </p>
            )}

            <button
              className="text-bold  mt-8 block w-full rounded bg-purple-700 p-4  text-white hover:bg-purple-600"
              onClick={handleRegistration}
            >
              Register
            </button>

            <p className="text-bold mt-5 text-center">
              Already have an account?{' '}
              <span
                className="cursor-pointer text-purple-500 hover:text-purple-600"
                onClick={() => router.push('/login')}
              >
                <b>Log in</b>
              </span>
            </p>
          </div>
          <p className="mt-5 text-center">or</p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              className="flex items-center space-x-2 rounded bg-red-500 p-4 text-lg text-white hover:bg-red-600"
              onClick={handleSignInWithGoogle}
            >
              <FaGoogle className="h-6 w-6" />
              <span>Log in with Google</span>
            </button>
            {/* <button
              className="flex items-center space-x-2 rounded bg-blue-500 p-4 text-lg text-white hover:bg-blue-600"
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

export default Register;
