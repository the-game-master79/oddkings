import { useState, useEffect } from 'react';
import { useTradeBuilderVisibility } from './useTradeBuilderVisibility';

export const useTradeBuilderWidth = () => {
  const [tradeBuilderWidth, setTradeBuilderWidth] = useState(0);
  const { isSidebarOpen, isSidebarMinimized } = useTradeBuilderVisibility();

  useEffect(() => {
    const updateWidth = () => {
      if (!isSidebarOpen || isSidebarMinimized) {
        setTradeBuilderWidth(0);
        return;
      }
      
      // Default trade builder width is 300px as per MultiTradeSidebar
      setTradeBuilderWidth(300);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [isSidebarOpen, isSidebarMinimized]);

  return tradeBuilderWidth;
};
