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

const registerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { name, number, address, district, division, upazila } = req.body;

      // Check if the user already exists in the database
      const existingUser = await prisma.user.findUnique({ where: { number } });
      if (existingUser) {
        res.status(409).json({ message: 'user_exist' }); // User already exists
        return;
      }

      // Generate a verification code
      const verificationCode = generateVerificationCode();

      // Save the verification code to the database or session for later validation

      // Send SMS with the verification code to the provided phone number
      await sendSMS(
        number,
        `Hello ${name}, Welcome to Teach-In. Your mpbian verification code is: ${verificationCode}`,
      );

      // Return the verification code in the response
      res.status(200).json({ verificationCode: encrypt(verificationCode) });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};

export default registerHandler;
