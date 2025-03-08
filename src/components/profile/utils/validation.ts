
export const validateAddress = (value: string) => {
  const addressRegex = /^[a-zA-Z0-9\s,/&]+$/;
  return addressRegex.test(value) || "Only letters, numbers, spaces, commas, & and / are allowed";
};

export const validateDate = (value: string): boolean => {
  if (!value) return false;
  
  const [day, month, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return false;
  
  // Check if the date is valid
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return false;
  }
  
  // Check minimum age (16 years)
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  return age >= 16;
};
