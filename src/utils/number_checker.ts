function checkPhoneNumber(number: string) {
  // Define the regular expressions for Indian and Bangladeshi phone numbers
  const indianRegex = /^\+91\d{10}$/;
  const bdRegex1 = /^01\d{9}$/;
  const bdRegex2 = /^\+8801\d{9}$/;

  // If the input is empty
  if (number === '') {
    return 'Phone number cannot be empty.';
  }

  // Check if the number is an Indian number
  if (indianRegex.test(number)) {
    return true;
  }

  // Check if the number is a Bangladeshi number (either format)
  if (bdRegex1.test(number) || bdRegex2.test(number)) {
    return true;
  }

  if (!number) {
    return 'Enter your phone number to continue.';
  }

  // Check for common mistakes and return more specific error messages
  if (number.startsWith('+91') && !indianRegex.test(number)) {
    return 'Invalid Indian number. Make sure it has exactly 10 digits after +91.';
  }

  if (number.startsWith('01') && !bdRegex1.test(number)) {
    return 'Invalid Bangladeshi number. Make sure it has exactly 9 digits after 01.';
  }

  if (number.startsWith('+8801') && !bdRegex2.test(number)) {
    return 'Invalid Bangladeshi number. Make sure it has exactly 9 digits after +8801.';
  }

  // General error message
  return 'Invalid number. Please provide a valid Indian or Bangladeshi number.';
}

export default checkPhoneNumber;
