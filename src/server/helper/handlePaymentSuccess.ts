import { prisma } from '../db/client';

interface handlePaymentSuccessParams {
  paymentGId: string;
  orderId: string;
  amount: number;
  number: string;
  card_no: string;
  currency: string;
  tran_date: string;
  store_amount: number;
  course_id: string;
  card_type: string;
  cus_name: string;
  course_name: string;
  code: number;
}

export default async function handlePaymentSuccess({
  paymentGId,
  orderId,
  amount,
  number,
  card_no,
  currency,
  tran_date,
  store_amount,
  card_type,
  cus_name,
  course_name,
  code,
}: handlePaymentSuccessParams) {
  //update & find payment table:
  //console.log('paymentGId', paymentGId);
  //console.log('orderId', orderId);
  const [paymentsWithResult] = await Promise.allSettled([
    await prisma.payment.findMany({
      where: { paymentGId },
      include: { course: { include: { instructor: true } } },
    }),
    await prisma.payment.updateMany({
      where: { paymentGId },
      data: {
        orderId,
        status: 'SUCCESS',
        amount,
        number,
        code,
        card_no,
        currency,
        type: 'COURSE',
        cus_name,
        course_name,
        tran_date,
        store_amount,
        card_type,
        state: 'REQUESTED',
      },
    }),
  ]);

  const payments = paymentsWithResult?.value;
  const userId = payments[0].userId;

  // delete all records of cart & enroll course;
  await Promise.allSettled([
    await prisma.student.upsert({
      where: { userId: payments[0].userId },
      update: {
        courses: {
          connect: {
            id: payments[0].courseId,
          },
        },
      },
      create: {
        userId: payments[0].userId,
        courses: {
          connect: {
            id: payments[0].courseId,
          },
        },
      },
    }),
    await prisma.cart.deleteMany({ where: { userId } }),
  ]);

  // create revenues for instructors:
  await Promise.all(
    payments.map(async (payment) => {
      await prisma.revenue.create({
        data: {
          type: 'COURSE',
          amount: BigInt(payment.course.coursePrice),
          user: { connect: { id: payment.course.instructor.id } },
        },
      });
    }),
  );
}
