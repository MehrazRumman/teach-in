import Image from 'next/image';
import Head from '~/components/shared/Head';

export default function AboutUS() {
  return (
    <div>
      <Head>
        <title>About Us</title>
      </Head>
      <div className="flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full lg:w-4/5">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="py-8 text-2xl">
            Teach-In{"'"}s mission is to improve lives through learning. We
            enable anyone, anywhere to access educational content and learn. We
            consider our marketplace model the best way to offer valuable
            educational content to our users. These Terms apply to all your
            activities on the Teach-In.com website, the mobile applications, our
            TV applications, our APIs, and other related services.
          </p>
          <p className="font-bold">Trade license No: 104308</p>
        </div>
      </div>
    </div>
  );
}
