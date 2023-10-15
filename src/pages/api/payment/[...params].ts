//
//
import { nanoid } from 'nanoid';
import { PATHS } from '~/constants';
import handlePaymentSuccess from '~/server/helper/handlePaymentSuccess';

import { prisma } from '../../../server/db/client';
import { render } from '@react-email/render';
import { sendEmail } from '~/server/libs/mail.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import qs from 'qs';
import { sendSMS } from '~/utils/sendSMS';
import ReminderCourseEmail from 'emails/ReminderCourseEmail';
import axios from 'axios';
const payment = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;
    const { params } = query;

    const SSLCOMMERZ_CONFIGS = JSON.parse(
      String(process.env.SSLCOMMERZ_CONFIGS),
    );

    const requiredConfigs = [
      'store_id',
      'store_passwd',
      'api_url',
      'success_url',
      'fail_url',
      'cancel_url',
    ];

    for (const config of requiredConfigs) {
      if (!SSLCOMMERZ_CONFIGS[config]) {
        return res.status(500).json({
          message: `${config} is missing in SSLCommerz configs`,
        });
      }
    }

    if (method === 'POST' && params && params[0] === 'create') {
      const {
        courseIds,
        userId,
        orderDescription,
        name,
        amount,
        number,
        email,
        course_name,
        fb_link,
      } = body;

      if (!orderDescription) {
        return res.status(400).json({
          error: 'orderDescription is missing',
          message: 'orderDescription is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: 'userId is missing',
          message: 'userId is required',
        });
      }

      if (!courseIds || !Array.isArray(courseIds)) {
        return res.status(400).json({
          error: 'courseIds is missing or not an array',
          message: 'courses id are required',