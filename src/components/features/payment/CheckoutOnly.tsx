import React, { useState } from 'react';
import useCart from '~/contexts/CartContext';
import Loading from '~/components/buttons/Loading';
import toast from 'react-hot-toast';
import Modal from '../../partials/Modal';
import Link from 'next/link';

interface CheckoutOnlyProps {
  shouldShow?: boolean;
}

export default function CheckoutOnly({ shouldShow }: CheckoutOnlyProps) {
  const cartCtx = useCart();

  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCheckout = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    await cartCtx?.handleCheckout();
  };

  if (!cartCtx?.totalAmount || cartCtx?.totalAmount === 0) {
    return null;
  }

  return (
    <>
      {/* Confirmation Modal */}
      {showModal && (
        <Modal onClose={handleCloseModal} title={'Confirmation'}>
          <div className="text-center">
            <p className="mx-4 my-4  text-black dark:text-white">
              Please read and agree to the terms and conditions before
              proceeding
            </p>

            <div className='flex flex-col'>
            <label className="mx-4 my-4 inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-6 w-6 text-purple-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text ml-2 text-gray-900 dark:text-white">
                I agree to the{' '}
                <Link
                  className="text-violet-800"
                  href="/terms_of_use"
                  target="_blank"
                >
                  Terms and Conditions
                </Link>
                {', '}{' '}
                <Link
                  className="text-violet-800"
                  href="/privacy_policy"
                  target="_blank"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  className="text-violet-800"
                  href="/refund_policy"
                  target="_blank"
                >
                  Refund Policy
                </Link>
                .
              </span>
            </label>
            <button
              className="mx-5 my-5 rounded-lg bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
              onClick={handleCheckout}
              disabled={!agreed}
            >
              Proceed Payment
            </button>
            </div>
          </div>
        </Modal>
      )}

      <div
        className={`smooth-effect fixed bottom-0 left-0 z-50 flex h-[7rem] w-screen justify-between bg-dark-background px-4 py-2 text-white/80 animate-in fade-in zoom-in dark:bg-white dark:text-gray-600 ${
          shouldShow ? '' : 'hidden'
        }`}
      >
        <button
          onClick={handleOpenModal}
          disabled={cartCtx?.checkoutState === 'loading'}
          className="absolute-center m-auto h-fit w-[20rem] rounded-lg bg-purple-600 p-4 text-white md:w-[25rem]"
        >
          {cartCtx?.checkoutState === 'loading' ? <Loading /> : 'Pay'}
        </button>
      </div>
    </>
  );
}
