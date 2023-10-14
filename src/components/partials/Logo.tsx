import Link from 'next/link';
import Image from 'next/image';
interface LogoProps {
  customStyles?: string;
}
export default function Logo({ customStyles }: LogoProps) {
  return (
    <div
      className={`${customStyles} relative min-h-[2.6rem] min-w-[8rem]  md:min-w-[10rem]`}
    >
      <Link href={'/'} className={``}>
        <div className="flex items-center justify-center">
          <Image src="/images/logo.svg" alt="logo" width="30" height="30" />
          <div className="mt-6 flex flex-col">
            <div className=" pl-1 text-3xl font-bold text-gray-700 dark:text-primary md:text-4xl">
              each-In
            </div>
            <span className="text-sm font-bold">Upgrade Yourself</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
