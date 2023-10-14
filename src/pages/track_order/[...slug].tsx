import OrderComponent from '~/components/books/Order';
import Loading from '~/components/buttons/Loading';
import Head from '~/components/shared/Head';
import type { GetServerSideProps, NextPage } from 'next';
import { prisma } from '~/server/db/client';
import { useRouter } from 'next/router';
import { MdDone } from 'react-icons/md';

interface OrderPageProps {
  order?: any;
}

const BookOrderPage: NextPage = ({ order }: OrderPageProps) => {
  console.log(order);
  const router = useRouter();

  const status = router.query.status;

  return (
    <>
      <Head title="Track Order - Teach-In" />

      {order ? (
        <div className="m-6 ">
          {status && (
            <div className="text-bold mx-1 my-4 flex flex-row items-center justify-center rounded-lg bg-green-200 px-8 py-4 text-4xl text-green-700">
              <MdDone />
              Order Successfull.
            </div>
          )}
          <OrderComponent order={order} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="full-size absolute-center min-h-[50rem]">
            <Loading />
          </div>
        </div>
      )}
    </>
  );
};
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { slug } = query;

  console.log(slug?.at(0));

  const order = await prisma?.bookOrder.findUnique({
    where: { id: slug?.at(0) as string }, // Remove the square brackets around slug
    include: {
      book: {
        select: {
          name: true,
          slug: true,
          addedBy: true,
          thumbnail: true,
          bookPrice: true,
        },
      },
    },
  });

  const createdAtString = order?.createdAt.toISOString();
  const updatedAtString = order?.createdAt.toISOString();

  const serializableOrder = {
    ...order,
    createdAt: createdAtString,
    updatedAt: updatedAtString,
  };

  console.log(serializableOrder);

  return {
    props: {
      order: serializableOrder,
    },
  };
};
export default BookOrderPage;
