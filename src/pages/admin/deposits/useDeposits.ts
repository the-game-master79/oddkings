
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Deposit } from './types';

export const useDeposits = () => {
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  const { data: deposits, isLoading, refetch } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deposit[];
    }
  });

  const handleApprove = async (id: string) => {
    setProcessingIds(prev => [...prev, id]);
    
    try {
      console.log('Approving deposit with ID:', id);
      
      // First get the deposit information to log it for debugging
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching deposit details:', fetchError);
        throw fetchError;
      }
      
      console.log('Deposit details before approval:', depositData);
      
      // Update deposit status
      const { error } = await supabase
        .from('deposits')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating deposit status:', error);
        throw error;
      }
      
      console.log('Deposit status updated successfully');
      
      // Wait a bit for database triggers to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Deposit approved successfully');
      await refetch();
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast.error('Failed to approve deposit. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleReject = async (id: string) => {
    setProcessingIds(prev => [...prev, id]);
    
    try {
      console.log('Rejecting deposit with ID:', id);
      
      const { error } = await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating deposit status:', error);
        throw error;
      }
      
      console.log('Deposit status updated successfully');
      toast.success('Deposit rejected successfully');
      await refetch();
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      toast.error('Failed to reject deposit. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  return {
    deposits,
    isLoading,
    processingIds,
    handleApprove,
    handleReject,
  };
};
