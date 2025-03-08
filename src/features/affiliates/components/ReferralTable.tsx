import { format } from 'date-fns';
import type { ReferredUser } from '../types';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ReferralTableProps {
  users: ReferredUser[];
  isLoading?: boolean;
}

export function ReferralTable({ users, isLoading = false }: ReferralTableProps) {
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading referred users data...</p>
      </div>
    );
  }

  // Calculate the total earnings for all users
  const totalEarnings = users.reduce((sum, user) => sum + user.earnings, 0);
  
  // Only show limited items
  const visibleUsers = users.slice(0, visibleLimit);
  const hasMoreItems = users.length > visibleLimit;
  
  const renderMobileView = () => (
    <div className="space-y-4">
      {visibleUsers.map((user, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined:</span>
              <span>{format(new Date(user.joinedAt), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance:</span>
              <span>${user.balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Earnings:</span>
              <span className="font-semibold text-green-600">${user.earnings.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
      
      {visibleUsers.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Earnings</span>
            <span className="font-bold text-green-600">${totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Email</th>
            <th className="text-right p-2">Current Balance</th>
            <th className="text-right p-2">Date & Time Joined</th>
            <th className="text-right p-2">Your Earnings</th>
          </tr>
        </thead>
        <tbody>
          {visibleUsers.map((user, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{user.email}</td>
              <td className="text-right p-2">${user.balance.toFixed(2)}</td>
              <td className="text-right p-2">
                {format(new Date(user.joinedAt), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="text-right p-2 font-semibold text-green-600">
                ${user.earnings.toFixed(2)}
              </td>
            </tr>
          ))}
          {visibleUsers.length > 0 && (
            <tr className="border-b bg-muted/50">
              <td colSpan={3} className="p-2 font-bold text-right">Total</td>
              <td className="text-right p-2 font-bold text-green-600">${totalEarnings.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div>
      {users.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          No referred users found
        </div>
      ) : (
        <>
          {isMobile ? renderMobileView() : renderDesktopView()}
          
          {hasMoreItems && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline"
                onClick={() => setVisibleLimit(prev => prev + 10)}
                className="flex items-center gap-2"
              >
                Show More
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
