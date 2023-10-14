import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { link } = req.query;
  const filePath = `public/pdf/uploads/${link}`;

  try {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'Pdf not found' });
  }
};

export default handler;
