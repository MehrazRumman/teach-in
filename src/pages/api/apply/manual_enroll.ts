import { PrismaClient } from '@prisma/client';
import { sendSMS } from '~/utils/sendSMS';

const prisma = new PrismaClient();

export default async function handler(
  req: {
    method: string;
    body: {
      name: string;
      number: string;
      course_id: string;
      key: string;
      id: string;
      course_name: string;
      approve?: boolean;
    };
  },
  res: {
    status: (arg0: number) => {
      (): unknown;
      new (): unknown;
      end: { (): unknown; new (): unknown };
      json: { (arg0: { error: string }): void; new (): unknown };
    };
  },
) {
  if (req.method === 'POST') {
    const { name, number, course_id, key, course_name } = req.body;

    // Check if req is from a valid source
    if (key !== process.env.MANUAL_ENROLL_NUMBER) {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }

    try {
      // Check if the user exists in the database with the given number
      let user = await prisma.user.findUnique({ where: { number } });

      if (!user && name && number) {
        // Insert the user into the database
        user = await prisma.user.create({
          data: {
            name,
            number,
            Course: {
              connect: {
                id: course_id,
              },
            },
          },
        });
      } else {
        await prisma.student.upsert({
          where: { userId: user?.id },
          update: {
            courses: {
              connect: {
                id: course_id,
              },
            },
          },
          create: {
            userId: user?.id as string,
            courses: {
              connect: {
                id: course_id,
              },
            },
          },
        });

        await prisma.applyRequest.create({
          data: {
            user: {
              connect: {
                id: user?.id,
              },
            },
            course: {
              connect: {
                id: course_id,
              },
            },
            status: 'pending',
            comment: 'Enrolled by Admin',
            approved: true,
          },
        });

        sendSMS(
          number,
          `Hi ${name}! You have been enrolled in the course ${course_name} successfully by an Admin. Visit https://teach-in.com and log in with this number to get access`,
        );

        return res.status(200).json({ message: 'User enrolled successfully.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error enrolling user.' });
    }
  } else if (req.method === 'PUT') {
    // Approve apply request
    const { number, name, id, key, course_name, approve } = req.body;

    if (approve) {
      if (key !== process.env.MANUAL_ENROLL_NUMBER) {
        return res.status(403).json({ error: 'Unauthorized access.' });
      }

      const applyRequest = await prisma.applyRequest.findUnique({
        where: { id: id },
      });

      if (!applyRequest) {
        return res.status(500).json({ error: 'Not Found.' });
      }

      if (applyRequest?.userId && applyRequest.courseId) {
        await prisma.student.upsert({
          where: { userId: applyRequest?.userId },
          update: {
            courses: {
              connect: {
                id: applyRequest.courseId,
              },
            },
          },
          create: {
            userId: applyRequest?.userId as string,
            courses: {
              connect: {
                id: applyRequest.courseId,
              },
            },
          },
        });

        await prisma.applyRequest.update({
          where: { id: id },
          data: {
            approved: true,
            status: 'Approved',
          },
        });

        sendSMS(
          number,
          `Hi ${name}! Your course enrollment request has been approved for the course ${course_name}. Visit https://teach-in.com and log in with this number to get access`,
        );

        return res.status(200).json({ message: 'ApplyRequest approved.' });
      }
    } else {
      if (key !== process.env.MANUAL_ENROLL_NUMBER) {
        return res.status(403).json({ error: 'Unauthorized access.' });
      }

      const applyRequest = await prisma.applyRequest.findUnique({
        where: { id: id },
      });

      if (!applyRequest) {
        return res.status(500).json({ error: 'Not Found.' });
      }

      if (applyRequest?.userId && applyRequest.courseId) {
        await prisma.student.delete({
          where: { userId: applyRequest?.userId },
        });

        await prisma.applyRequest.update({
          where: { id: id },
          data: {
            approved: false,
            status: 'Rejected',
          },
        });

        sendSMS(
          number,
          `Hi ${name}! Your course enrollment request has been rejected for the course ${course_name}. Visit https://teach-in.com and retry.`,
        );

        return res.status(200).json({ message: 'ApplyRequest Rejected.' });
      }
    }

    return res.status(500).json({ error: 'Error in Apply Request.' });
  }
}
