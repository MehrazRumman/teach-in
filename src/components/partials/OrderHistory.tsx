import { WalletIcon } from '@heroicons/react/24/outline';
import Loading from '../buttons/Loading';
import { trpc } from '~/utils/trpc';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import OrderComponent from '../books/Order';

export default function OrderHistory() {
  const { data: orders, status } = trpc.user.findOrders.useQuery();

  return (
    <section className="mt-4 flex w-full flex-col space-y-6 px-2 md:px-14 lg:px-20">
      <h1 className="flex space-x-2 text-3xl">
        <WalletIcon className="h-10 w-10" /> <span>Track Your Order:</span>
      </h1>

      {status === 'loading' ? (
        <div className="absolute-center min-h-[10rem] w-full">
          <Loading />
        </div>
      ) : (
        <ul className="flex flex-col space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              return <OrderItem key={order.id} order={order} />;
            })
          ) : (
            <li>You have no order yet</li>
          )}
        </ul>
      )}
    </section>
  );
}

function OrderItem({ order }: { order: any }) {
  return <li>{order.book && <OrderComponent order={order} />}</li>;
}
