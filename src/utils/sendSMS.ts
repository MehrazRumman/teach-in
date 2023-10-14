import axios from 'axios';

const sendSMS = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    const response = await axios.post('http://bulksmsbd.net/api/smsapi', {
      api_key: '9QICt283fAaXmcaaxK8J',
      senderid: '8809617611759',
      number: phoneNumber,
      message: message,
    });

    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

export { sendSMS };
