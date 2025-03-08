import { useState } from 'react';
import { useIsMobile } from './use-mobile';

export const useTradeBuilderVisibility = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); // Start closed on mobile
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(isMobile); // Start minimized on mobile
  const [showTradeNotification, setShowTradeNotification] = useState(false);

  const handleClose = () => {
    setIsSidebarMinimized(true);
  };

  const handleMinimize = () => {
    setIsSidebarMinimized(true);
    // Show notification when minimizing with trades
    setShowTradeNotification(true);
  };

  const handleMaximize = () => {
    setIsSidebarMinimized(false);
    setIsSidebarOpen(true);
    setShowTradeNotification(false);
  };

  return {
    isSidebarOpen,
    isSidebarMinimized,
    showTradeNotification,
    setShowTradeNotification,
    handleClose,
    handleMinimize,
    handleMaximize
  };
};
