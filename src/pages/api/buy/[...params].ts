//
//
import { nanoid } from 'nanoid';
import { PATHS } from '~/constants';

import { prisma } from '../../../server/db/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import qs from 'qs';
import handlePaymentSuccessBook from '~/server/helper/handlePaymentSuccessBook';
import { sendSMS } from '~/utils/sendSMS';
const payment = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;
    const { params } = query;

    let bookOrderId = '';

    const requiredConfigs = [
      'store_id',
      'store_passwd',
      'api_url',
      'success_url',
      'fail_url',
      'cancel_url',
    ];

    if (method === 'POST' && params && params[0] === 'create') {
      const {
        bookIds,
        userId,
        orderDescription,
        nameUser,
        amount,
        address,
        number,
        district,
        division,
        comment,
        upazila,
        type,
      } = body;

      if (!userId) {
        return res.status(400).json({
          error: 'userId is missing',
          message: 'userId is required',
        });
      }

      if (!bookIds || !Array.isArray(bookIds)) {
        //console.log('Book is Null');
        return res.status(400).json({
          error: 'bookIds is missing or not an array',
          message: 'book id are required',
        });
      }

      //console.log(bookIds);
      // console.log(userId);

      if (type === 'hard_copy') {
        const createdOrder = await prisma.bookOrder.create({
          data: {
            name: nameUser,
            number: number,
            address: address,
            district,
            status: 'PENDING',
            division,
            amount: amount,
            upazila,
            type,
            comment,
            user: { connect: { id: userId } },
            book: {
              connect: {
                id: bookIds[0],
              },
            },
          },
        });

        bookOrderId = createdOrder.id;
      } else {
        bookOrderId = bookIds[0];
      }

      const SSLCOMMERZ_CONFIGS = JSON.parse(
        String(process.env.SSLCOMMERZ_CONFIGS),
      );

      for (const config of requiredConfigs) {
        if (!SSLCOMMERZ_CONFIGS[config]) {
          return res.status(500).json({
            message: `${config} is missing in SSLCommerz configs`,
          });
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          payments: {
            create: bookIds.map((bookId) => ({
              status: 'PENDING',
              book: { connect: { id: bookId } },
              paymentGId: orderDescription,
            })),
          },
        },
      });

      const storeId = SSLCOMMERZ_CONFIGS.store_id;
      const storePasswd = SSLCOMMERZ_CONFIGS.store_passwd;
      const sslUrl = SSLCOMMERZ_CONFIGS.api_url;
      const successUrl = SSLCOMMERZ_CONFIGS.success_url_buy;
      const failUrl = SSLCOMMERZ_CONFIGS.fail_url_buy;
      const cancelUrl = SSLCOMMERZ_CONFIGS.cancel_url_buy;

      const orderId = nanoid();
      const currency = 'BDT';

      const postData = {
        store_id: storeId,
        store_passwd: storePasswd,
        total_amount: amount,
        currency: currency,
        tran_id: orderId,
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: '',
        product_name: orderDescription,
        product_category: 'Notes',
        product_profile: 'general',
        value_a: orderDescription,
        cus_phone: number,
        value_b: userId,
        value_c: `${bookOrderId} - ${type}`,
        value_d: `${number} - ${bookIds[0]}`,
        multi_card_name: '',
        allowed_bin: '',
      };

      const config = {
        method: 'post',
        url: sslUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
      };

      axios(config)
        .then(function (response: {
          data: { status: string; GatewayPageURL: any; message: any };
        }) {
          //console.log('SSLCommerz: ', response.data);
          if (response.data.status === 'SUCCESS') {
            // console.log('SSLCommerz SUCCESS: ', response.data.GatewayPageURL);
            const gatewayUrl = response.data.GatewayPageURL;
            return res.status(200).json({ gatewayUrl, postData });
          } else {
            return res.status(500).json({ error: response.data.message });
          }
        })
        .catch(function (error: any) {
          console.error('SSLCommerz ERROR: ', error);
          return res.status(500).json({
            error: 'Error occurred while communicating with SSLCommerz',
          });
        });
    }

    if (method === 'POST' && params && params[0] === 'sslcommerz_return') {
      const { status, value_a, value_c, value_d, tran_id, amount, val_id } =
        req.body;
      if (status === 'FAILED') {
        return res.redirect(`/payment_failed?tran_id=${tran_id}`);
      } else if (status === 'VALID') {
        const [bookOrderId, type] = value_c.split(' - ');
        const [number, bookId] = value_d.split(' - ');
        // console.log('PAYMENT IS VALID');

        const config = {
          method: 'get',
          //url: 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
          url: ' 	https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          params: {
            val_id: val_id,
            // store_id: 'mpbia644d088d85303',
            // store_passwd: 'mpbia644d088d85303@ssl',
            store_id: 'mpbianlive',
            store_passwd: '64B900EF239B316556',
          },
        };
        // console.log('config');
        // console.log(config);
        //mpbia644d088d85303
        //mpbia644d088d85303@ssl

        //mpbianlive
        //64B900EF239B316556
        axios(config)
          .then(async function (des) {
            //console.log('Validation Api Returned: ');
            //console.log(des.data);
            if (des.data.status === 'VALID' || 'VALIDATED') {
              await handlePaymentSuccessBook({
                paymentGId: value_a,
                orderId: tran_id,
                amount,
                bookOrderId: bookOrderId,
                type,
              });

              if (type === 'hard_copy') {
                await sendSMS(
                  number,
                  `Your payment ${amount} tk has been successfully recieved. We will ship your book as soon as possible. Track your order: https://teach-in.com/track_order/${bookOrderId} `,
                );

                await sendSMS(
                  '01320820854',
                  `New Order: https://teach-in.com/track_order/${bookOrderId}. All Orders: https://teach-in.com/book_orders}  `,
                );
              } else {
                await sendSMS(
                  number,
                  `Your payment ${amount} tk has been successfully recieved. Read your book online at: https://teach-in.com/reading/${bookId} `,
                );
              }

              // return res.status(200).json({
              //   gatewayUrl: `/payment_success?tran_id=${tran_id}&bookId=${bookOrderId}&id=${bookId}`,
              // });

              return res.redirect(
                302,
                `/payment_success?tran_id=${tran_id}&bookId=${bookOrderId}&id=${bookId}`,
              );
            } else {
              return res.status(500).json({ error: des.data.message });
            }
          })
          .catch(function (error: any) {
            console.error('SSLCommerz ERROR: ', error);
            return res.status(500).json({
              error: 'Error occurred while communicating with SSLCommerz',
            });
          });
      } else {
        return res.redirect(`/${PATHS.CART}`);
      }
    }
  } catch (error) {
    console.error('PAYMENT ERROR: ', error);
    return res
      .status(500)
      .json({ error: 'Error occurred while processing payment' });
  }
};

export default payment;
