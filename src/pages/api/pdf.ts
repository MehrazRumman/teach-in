import type { NextApiHandler, NextApiRequest } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = (
  req: NextApiRequest,
  saveLocally?: boolean,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), '/public/pdf/uploads');
    options.filename = (name, ext, path, form) => {
      return Date.now().toString() + '_' + path.originalFilename;
    };
  }
  options.maxFileSize = 200 * 1024 * 1024; // 100MB
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const handler: NextApiHandler = async (req, res) => {
  try {
    await fs.readdir(path.join(process.cwd() + '/public', '/pdf', '/uploads'));
  } catch (error) {
    await fs.mkdir(path.join(process.cwd() + '/public', '/pdf', '/uploads'));
  }

  const { files } = await readFile(req, true);
  const uploadedFile = Object.values(files)[0]; // Assuming only one file is uploaded

  const downloadUrl = `${process.env.NEXTAUTH_URL}/api/view/${uploadedFile?.newFilename}`;

  res.json({ downloadUrl });
};

export default handler;
