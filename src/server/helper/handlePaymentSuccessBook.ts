import { prisma } from '../db/client';

interface handlePaymentSuccessBookParams {
  paymentGId: string;
  orderId: string;
  amount: number;
  bookOrderId: string;
  type: string;
}

export default async function handlePaymentSuccessBook({
  paymentGId,
  orderId,
  bookOrderId,
  type,
}: handlePaymentSuccessBookParams) {
  const [paymentsWithResult] = await Promise.allSettled([
    await prisma.payment.findMany({
      where: { paymentGId },
      include: { book: { include: { addedBy: true } } },
    }),
    await prisma.payment.updateMany({
      where: { paymentGId },
      data: { orderId, status: 'SUCCESS', type: 'BOOK' },
    }),
    (async () => {
      if (type === 'hard_copy') {
        await prisma.bookOrder.update({
          where: { id: bookOrderId },
          data: { status: 'SUCCESS', type: 'BOOK' },
        });
      }
    })(),
  ]);

  const payments = paymentsWithResult?.value;
  const userId = payments[0].userId;

  // delete all records of cart & enroll book;
  await Promise.allSettled([
    (async () => {
      if (type === 'pdf') {
        await prisma.student.upsert({
          where: { userId: payments[0].userId },
          update: {
            books: {
              connect: payments.map((payment: any) => ({ id: payment.bookId })),
            },
          },
          create: {
            userId: payments[0].userId,
            books: {
              connect: payments.map((payment: any) => ({ id: payment.bookId })),
            },
          },
        });
      }
    })(),
    prisma.cart.deleteMany({ where: { userId } }),
  ]);
}
