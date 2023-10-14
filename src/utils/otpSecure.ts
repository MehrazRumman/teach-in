function decrypt(encryptedData: string): string {
  const encryptedBuffer = Buffer.from(encryptedData, 'base64');
  const keyBuffer = Buffer.from('Jahangir+Sumiya', 'utf8');
  const decryptedData = encryptedBuffer
    .slice(keyBuffer.length)
    .toString('utf8');
  return decryptedData;
}

function encrypt(data: string): string {
  const keyBuffer = Buffer.from('Jahangir+Sumiya', 'utf8');
  const dataBuffer = Buffer.from(data, 'utf8');
  const encryptedData = Buffer.concat([keyBuffer, dataBuffer]).toString(
    'base64',
  );
  return encryptedData as string;
}

export { decrypt, encrypt };
