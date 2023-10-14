import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { download } = req.query;
  const filePath = `public/images/uploads/${download}`;

  try {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
};

export default handler;
