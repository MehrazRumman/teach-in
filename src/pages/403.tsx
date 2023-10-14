import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Custom403ErrorPage = () => {
  const router = useRouter();

  const { tran_id, bookId, courseId } = router.query;

  useEffect(() => {
    if (tran_id && bookId) {
      const newUrl = `/payment_success?tran_id=${tran_id}&bookId=${bookId}`;
      router.push(newUrl);
    }
    if (tran_id && courseId) {
      const newUrl = `/payment_success?tran_id=${tran_id}&courseId=${courseId}`;
      router.push(newUrl);
    }
  });
  return (
    <div className="h-full w-full items-center justify-center">
      <div className="felx m-5 flex-col items-center justify-center rounded bg-green-100 p-10">
        {' '}
        Your order is Completed.
        <Link href="/">
          <button className="mx-4 rounded bg-green-600 px-4 py-2 text-white">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Custom403ErrorPage;
