export const formatUTCToLocal = (utcDateTime: string): string => {
  const date = new Date(utcDateTime);
  return date.toLocaleString(undefined, { 
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export const convertLocalToUTC = (localDateTime: string): string => {
  const date = new Date(localDateTime);
  return date.toISOString();
};
