import { type NextPage } from 'next';
import { PATHS } from '~/constants';
import Link from 'next/link';
import Head from '~/components/shared/Head';
import { BiError } from 'react-icons/bi';

const PaymentFailed: NextPage = () => {
  return (
    <>
      <Head title="Payment Status- Teach-In" />

      <div className="mx-auto min-h-screen w-full pt-24 md:max-w-[720px] lg:max-w-[1200px]">
        <div className="absolute-center mt-auto w-full flex-col space-y-8">
          <BiError className="h-20 w-20" />
          <h1 className="text-3xl font-bold md:text-4xl">Payment Failed!</h1>
          <button className="btn-follow-theme btn-lg btn">
            <Link href={`/${PATHS.CART}`}>Go to Cart</Link>
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
