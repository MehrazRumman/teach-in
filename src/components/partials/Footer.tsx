import Link from 'next/link';

import Logo from './Logo';
import { FaAddressBook } from 'react-icons/fa';
import {
  MdMarkEmailRead,
  MdPeople,
  MdPhone,
  MdPrivacyTip,
} from 'react-icons/md';
import { RiRefund2Fill } from 'react-icons/ri';
import { SiAboutdotme } from 'react-icons/si';
import { GiRuleBook } from 'react-icons/gi';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="mt-10 flex flex-col items-center rounded bg-[#efeae6] px-10 py-20 text-2xl text-gray-600 dark:bg-dark-background dark:text-white/50 md:text-3xl">
      <Logo />
      <small className="mt-2 text-sm font-semibold">
        Powered by <div className="text-blue-400">Quantum Guys</div>
      </small>
      <div className="mt-8 flex items-center space-x-6">
        <Link href="/privacy_policy">
          <div className="flex items-center text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
            <MdPrivacyTip className="mr-1" /> Privacy Policy
          </div>
        </Link>
        <Link href="/refund_policy">
          <div className="flex items-center text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
            <RiRefund2Fill className="mr-1" /> Refund Policy
          </div>
        </Link>
        <Link href="/about_us">
          <div className="flex items-center text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
            <SiAboutdotme className="mr-1" /> About Us
          </div>
        </Link>
        <Link href="/terms_of_use">
          <div className="flex items-center text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
            <GiRuleBook className="mr-1" /> Terms of Use
          </div>
        </Link>
      </div>
      <div className="m-8 text-gray-500 dark:text-white">
        <p className="flex flex-row justify-center py-4">Contact Us</p>
        <p>
          <FaAddressBook className="mr-2 inline-block" />
          Jagannath Univerty, Dhaka-1100
        </p>

        <p>
          <MdPeople className="mr-2 inline-block" />
          Jahangir, Farhan , Rumman
        </p>
      </div>
      We Accept:
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image
        quality={50}
        src={'/images/payment_banner.png'}
        width={600}
        height={200}
        alt="Payment Acceptance Banner"
        className="mx-auto mt-8 w-full  lg:w-6/12"
      />
    </footer>
  );
}
