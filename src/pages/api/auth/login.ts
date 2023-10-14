import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { sendSMS } from '~/utils/sendSMS';
import { encrypt } from '~/utils/otpSecure';

const prisma = new PrismaClient();

const generateVerificationCode = (): string => {
  // Generate a random 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
};


const loginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { number } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { number } });
      if (!existingUser) {
        res.status(404).json({ message: 'user_not_found' }); // User not found
        return;
      }

      const verificationCode = generateVerificationCode();

      await sendSMS(
        number,
        `Welcome back! Your mpbian login verification code is: ${verificationCode}`,
      );

      res.status(200).json({ verificationCode : encrypt(verificationCode)  });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};

export default loginHandler;
