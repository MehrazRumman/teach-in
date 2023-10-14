import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: {
    method: string;
    body: {
      name: string;
      number: string;
      course_id: string;
      key: string;
      user_id: string;
      comment: string;
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
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, number, course_id, key, user_id, comment } = req.body;

  //   check if req is from a valid source
  if (key !== process.env.MANUAL_ENROLL_NUMBER) {
    return res.status(403).json({ error: 'Unauthorized access.' });
  }

  if (user_id) {
    await prisma.applyRequest.create({
      data: {
        user: {
          connect: {
            id: user_id,
          },
        },
        course: {
          connect: {
            id: course_id,
          },
        },
        status: 'pending',
        comment: comment,
        approved: false,
      },
    });

    return res.status(200).json({ message: 'User enrolled successfully.' });
  }

  try {
    //  check if the user exists in the database with the given number
    let user = await prisma.user.findUnique({ where: { number } });
    if (!user) {
      //   insert the user into the database
      user = await prisma.user.create({
        data: {
          name,
          number,
        },
      });
    } else {
      await prisma.applyRequest.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          course: {
            connect: {
              id: course_id,
            },
          },
          comment: comment,
          status: 'pending',
          approved: false,
        },
      });

      return res.status(200).json({ message: 'User enrolled successfully.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error Enrolling user.' });
  }
}
