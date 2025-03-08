
/**
 * Format an ISO time string to a readable format
 */
export const formatTime = (isoTime: string) => {
  if (!isoTime) return "Not available";
  try {
    const date = new Date(isoTime);
    return date.toLocaleString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "Invalid date";
  }
};

/**
 * Calculate and format the remaining time until a deadline
 */
export const calculateTimeRemaining = (endTime: string) => {
  if (!endTime) return "Time not set";
  
  try {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Trading closed";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  } catch (e) {
    console.error("Error calculating time remaining:", e);
    return "Time calculation error";
  }
};
