// src/utils/phoneUtils.js
export const formatPhoneNumber = (number, defaultNumber = "+92") => {
  if (!number) return defaultNumber;
  // Remove all non-digit characters
  const cleaned = number.toString().replace(/\D/g, '');
  // Ensure it starts with country code
  return cleaned.startsWith('92') ? `+${cleaned}` : `+92${cleaned}`;
};

export const getWhatsAppLink = (number) => {
  const safeNumber = formatPhoneNumber(number);
  return `https://wa.me/${safeNumber.replace('+', '')}`;
};