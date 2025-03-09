export const getLiveStatus = (liveStartTime: string, tradeEndTime: string) => {
  const now = new Date();
  const liveStart = new Date(liveStartTime);
  const tradeEnd = new Date(tradeEndTime);
  
  if (now < liveStart) {
    return {
      text: "Upcoming",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-200"
    };
  } else if (now >= liveStart && now <= tradeEnd) {
    return {
      text: "Live Now",
      className: "bg-green-500/10 text-green-600 border-green-200"
    };
  } else {
    return {
      text: "Ended",
      className: "bg-gray-100/80 text-gray-500 border-gray-200"
    };
  }
};
