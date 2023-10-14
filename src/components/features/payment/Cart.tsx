import { useEffect, useRef, useState } from 'react';
import { Else, If, Then } from 'react-if';
import { useIntersectionObserver } from 'usehooks-ts';
import Loading from '~/components/buttons/Loading';
import useCart from '~/contexts/CartContext';

import {
  CurrencyBangladeshiIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import CartItem from './CartItem';
import CheckoutOnly from './CheckoutOnly';
import Modal from '../../partials/Modal';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  FaAddressBook,
  FaBook,
  FaBookOpen,
  FaComment,
  FaFacebook,
  FaFilePdf,
  FaPhoneAlt,
  FaUserAlt,
} from 'react-icons/fa';
import { divisions } from '~/utils/divisions';
import { districts } from '~/utils/districts';
import { upazilas } from '~/utils/upazilas';
import { useSession } from 'next-auth/react';
import { break_point, c_cost, c_cost_more } from '~/contexts/constant';
import checkPhoneNumber from '~/utils/number_checker';
import { GiIndiaGate, GiIndianPalace, GiRead } from 'react-icons/gi';
import { trpc } from '~/utils/trpc';
import { BiCategory } from 'react-icons/bi';
import { HiCurrencyBangladeshi } from 'react-icons/hi';
import { BsGoogle } from 'react-icons/bs';

export default function Cart() {
  const refBtnCheckout = useRef<HTMLButtonElement | null>(null);
  const entry = useIntersectionObserver(refBtnCheckout, {});
  const cartCtx = useCart();
  const { data: session } = useSession();

  const [country, setCountry] = useState('Bangladesh');

  const { data: user } = trpc.user.findUserAddressById.useQuery();

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [name, setName] = useState(session?.user?.name);
  const [number, setNumber] = useState('');

  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [buyMethod, setBuyMethod] = useState('hard_copy');

  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };
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

  const handleOpenModal = () => {
    if (cartCtx?.userWithCart?.cart[0]?.bookId) {
      if (name === null || name === '') {
        return toast.error('Enter your name correctly');
      }

      const result = checkPhoneNumber(number);

      if (result !== true) {
        toast.error(result);
        return;
      }

      if (buyMethod === 'pdf') {
        return setShowModal(true);
      }

      if (address === null || address === '') {
        return toast.error('Enter the address correctly');
      }
      if (
        selectedDistrict === '' ||
        selectedDivision === '' ||
        selectedUpazila === ''
      ) {
        return toast.error(
          'Enter your Division, District and Upazila correctly',
        );
      }
    } else {
      const result = checkPhoneNumber(number);

      if (result !== true) {
        toast.error(result);
        return;
      }

      if (country === 'India') {
        if (!number.startsWith('+91')) {
          return toast.error(
            'Please use a valid Indian number starts with +91',
          );
        }
      }

      // check if number is indian
    }
    setShowModal(true);
  };

  const handleCheckout = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions.');
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
      await cartCtx?.handleCheckoutBook(bookData);
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
        await cartCtx?.handleCheckoutBook(bookData);
      } else {
        const course = cartCtx?.userWithCart?.cart[0]?.course;
        const courseData = {
          number,
          name: session?.user?.name,
          course_name: course?.name,
          fb_link: course
            ? `${course.facebookGroupLink} - ${course.slug}`
            : 'i - j',
        };
        await cartCtx?.handleCheckout(courseData);
      }
    } else {
      toast.error('Fill the information correctly to purchase');
    }
  };

  const handlePaymentChange = (event) => {
    setBuyMethod(event.target.value);
  };

  const book = cartCtx?.userWithCart?.cart[0]?.book;
  return (
    <>
      {showModal && (
        <Modal onClose={handleCloseModal} title={'Are you agree?'}>
          <div className="p-4 text-center">
            <h2 className="mb-4 text-2xl text-black dark:text-white md:text-xl lg:text-2xl">
              Please read the terms and conditions below before proceeding.
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
                Buy
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
          <h1 className="text-4xl font-semibold capitalize">Cart</h1>
          <h2 className="text-2xl font-semibold">
            {cartCtx?.userWithCart && cartCtx?.userWithCart.cart
              ? cartCtx?.userWithCart.cart.length
              : 0}{' '}
            course or book
          </h2>
        </div>

        <div className=" flex flex-col space-y-8  md:flex-row md:space-y-0">
          <div className="flex w-full flex-col md:w-[50%] lg:m-4">
            <If
              condition={
                cartCtx?.status === 'loading' ||
                cartCtx?.addCourseToCartStatus === 'loading'
              }
            >
              <Then>
                <div className="mt-10 flex h-full items-center justify-center">
                  <Loading />
                </div>
              </Then>
              <Else>
                <ul className="my-6 w-full space-y-8">
                  {cartCtx?.userWithCart?.cart?.length > 0 &&
                    cartCtx?.userWithCart?.cart.map((item) => (
                      <CartItem
                        courseId={item?.courseId || null}
                        bookId={item?.bookId || null}
                        wishlistId={
                          item.bookId
                            ? cartCtx?.userWithCart?.wishlist.find(
                                (elem) => elem.bookId === item.bookId,
                              )?.id || null
                            : cartCtx?.userWithCart?.wishlist.find(
                                (elem) => elem.courseId === item.courseId,
                              )?.id || null
                        }
                        isFavorite={
                          item.bookId
                            ? cartCtx?.userWithCart?.wishlist.some(
                                (elem) => elem.bookId === item.bookId,
                              )
                            : cartCtx?.userWithCart?.wishlist.some(
                                (elem) => elem.courseId === item.courseId,
                              )
                        }
                        cartId={item.id}
                        key={item.id}
                        course={item?.course}
                        book={item?.book}
                        refetchData={cartCtx.refetchData}
                      />
                    ))}
                </ul>
              </Else>
            </If>
          </div>

          <div className="mb-8 flex flex-1 flex-col space-x-2 space-y-6 rounded-xl shadow-none md:mb-0 md:space-y-8">
            {cartCtx?.userWithCart?.cart?.length > 0 &&
              cartCtx?.userWithCart?.cart[0]?.bookId && (
                <>
                  <div className=" mb-12 w-full  space-x-2 space-y-4 rounded-xl bg-white p-6 dark:bg-slate-800 md:mx-3 lg:mt-10">
                    <div className="flex flex-row items-center justify-center">
                      To buy the book fill the below information correctly
                    </div>

                    <div className="flex items-center space-x-2">
                      <GiRead size={24} className="text-gray-500" />
                      <label htmlFor="payment" className=" font-semibold">
                        How to buy?
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
                          Hard copy or original book [book will be sent to your
                          address]
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
                            PDF copy [Book can be read on our website]
                          </span>
                        </label>
                      )}

                      {book?.isPdfAvailable && book?.isFreePdf && (
                        <Link href={'/reading/' + book.id}>
                          <span
                            className={`mx-4 my-3 ml-2 flex flex-row  items-center rounded-xl border-2 border-solid border-purple-800 bg-purple-500  px-6 py-3 text-lg font-bold text-white dark:bg-purple-950 `}
                          >
                            <FaBookOpen className="mr-3" />
                            Read the book online for free
                          </span>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaPhoneAlt size={24} className="text-gray-500" />
                      <label htmlFor="phone" className="font-semibold">
                        Your mobile number:
                      </label>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      name="phone"
                      className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter your number correctly"
                    />

                    {buyMethod === 'hard_copy' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <FaUserAlt size={24} className="text-gray-500" />
                          <label htmlFor="name" className="font-semibold">
                            Your Name:
                          </label>
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          id="name"
                          name="name"
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter your name correctly"
                        />
                        <div className="flex items-center space-x-2">
                          <label htmlFor="phone" className="font-semibold">
                            Category:
                          </label>
                        </div>
                        <select
                          id="division"
                          name="division"
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          value={selectedDivision}
                          onChange={(e) => setSelectedDivision(e.target.value)}
                        >
                          <option value="">Select category</option>
                          {divisions.map((division) => (
                            <option key={division.id} value={division.id}>
                              {division.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center space-x-2">
                          <label htmlFor="phone" className="font-semibold">
                            District:
                          </label>
                        </div>
                        <select
                          id="district"
                          name="district"
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          disabled={!selectedDivision}
                        >
                          <option value="">Select district</option>
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
                            Upazila:
                          </label>
                        </div>
                        <select
                          id="upazila"
                          name="upazila"
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          value={selectedUpazila}
                          onChange={(e) => setSelectedUpazila(e.target.value)}
                          disabled={!selectedDistrict}
                        >
                          <option value="">Select upazila</option>
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
                          <FaAddressBook size={24} className="text-gray-500" />
                          <label htmlFor="address" className="font-semibold">
                            Full address:
                          </label>
                        </div>
                        <textarea
                          id="address"
                          name="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          style={{ height: '100px' }} // Adjust the height value as needed
                          placeholder="(House Name, Road No., House No.,
                            Building No., Apartment No., etc.)"
                        />
                        <div className="flex items-center space-x-2">
                          <FaComment size={24} className="text-gray-500" />
                          <label htmlFor="address" className="font-semibold">
                            If any comments write: (Optional)
                          </label>
                        </div>
                        <textarea
                          id="comment"
                          name="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                          style={{ height: '100px' }} // Adjust the height value as needed
                          placeholder="Write your opinion if you have any"
                        />
                      </>
                    )}
                  </div>
                </>
              )}

            {cartCtx?.userWithCart?.cart?.length > 0 &&
              cartCtx?.userWithCart?.cart[0]?.courseId && (
                <>
                  <div className=" w-full space-y-4 rounded-xl bg-white p-6  dark:bg-slate-800 lg:mt-10">
                    <div className="my-4 mb-12 flex flex-row items-center justify-center">
                      Your mobile number and Facebook account to buy the course
                      Fill the name correctly
                    </div>

                    <div className="flex items-center space-x-2">
                      <BiCategory size={24} className="text-gray-500" />
                      <label htmlFor="country" className=" font-semibold">
                        Which country do you want to buy from?
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
                          <CurrencyBangladeshiIcon className={`text-white`} />
                        </span>
                        <span
                          className={`mx-4 my-3 ml-2 flex flex-row items-center px-6 py-3  text-2xl ${
                            country === 'Bangladesh'
                              ? 'rounded-xl border-2 border-solid border-green-500 bg-green-100 font-bold  dark:bg-green-900 '
                              : ''
                          }`}
                        >
                          <HiCurrencyBangladeshi className="mr-3" />
                          Bangladesh
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
                          India
                        </span>
                      </label>
                    </div>

                    {country === 'India' ? (
                      <div className="flex items-center justify-center">
                        <BsGoogle className="mr-4 h-10 w-10" />
                        Google from India Use your Indian account to purchase
                        the course “Buy” by inputting the number and Facebook
                        name. Click the button
                        <br />
                      </div>
                    ) : (
                      <></>
                    )}

                    <div className="flex items-center space-x-2">
                      <FaPhoneAlt size={24} className="text-gray-500" />
                      <label htmlFor="phone" className="font-semibold">
                        Your mobile number:
                      </label>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      name="phone"
                      className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                      placeholder={
                        country === 'India'
                          ? 'Enter your Indian number with your +91'
                          : 'Enter your 11 digit number'
                      }
                    />

                    <div className="flex items-center space-x-2">
                      <FaFacebook size={24} className="text-gray-500" />
                      <label htmlFor="name" className="font-semibold">
                        Your Facebook Profile Name:
                      </label>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="name"
                      name="name"
                      className="w-full rounded-xl border p-2 focus:border-blue-500 focus:outline-none"
                      placeholder="your facebook name"
                    />
                  </div>
                </>
              )}

            <div className="flex flex-row items-center justify-between text-3xl font-bold">
              <div>Price</div>

              <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

              <div className="text-red">
                {new Intl.NumberFormat('bn-BD', {
                  style: 'currency',
                  currency: 'BDT',
                  minimumFractionDigits: 0,
                }).format(cartCtx?.totalAmount || 0)}
              </div>
            </div>

            {cartCtx?.userWithCart?.cart?.length > 0 &&
              cartCtx?.userWithCart?.cart[0]?.bookId && (
                <>
                  {buyMethod === 'hard_copy' && (
                    <div className="flex  flex-row items-center justify-between text-3xl font-bold">
                      <div>Courier cost</div>
                      <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

                      <div className="text-red">
                        {new Intl.NumberFormat('bn-BD', {
                          style: 'currency',
                          currency: 'BDT',
                          minimumFractionDigits: 0,
                        }).format(
                          cartCtx?.totalAmount > break_point
                            ? c_cost
                            : c_cost_more || 0,
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex  flex-row items-center justify-between text-3xl font-bold text-red-700">
                    <div>Total</div>
                    <hr className="mx-3 h-0.5 w-full border-t border-dashed border-gray-500" />

                    <div className="text-red">
                      {new Intl.NumberFormat('bn-BD', {
                        style: 'currency',
                        currency: 'BDT',
                        minimumFractionDigits: 0,
                      }).format(
                        cartCtx?.totalAmount +
                          (buyMethod === 'pdf'
                            ? 0
                            : cartCtx?.totalAmount > break_point
                            ? c_cost
                            : c_cost_more),
                      )}
                    </div>
                  </div>
                </>
              )}

            {cartCtx?.totalAmount && cartCtx?.totalAmount !== 0 && (
              <button
                onClick={handleOpenModal}
                ref={refBtnCheckout}
                disabled={cartCtx?.checkoutState === 'loading'}
                className="absolute-center min-h-[4.4rem] w-full rounded-lg bg-purple-600 text-white md:mx-3"
              >
                {cartCtx?.checkoutState === 'loading' ? <Loading /> : 'Buy'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
