
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ResolvedQuestionItem {
  id: string;
  question: string;
  category: string;
  resolved_at: string;
  status: string;
}

export default function ResolvedQuestionStats() {
  const [questions, setQuestions] = useState<ResolvedQuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the resolved status from query parameters
  const queryParams = new URLSearchParams(location.search);
  const resolvedStatus = queryParams.get('status') || 'all';
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // Construct the query based on the status parameter
        let query = supabase
          .from('questions')
          .select('*')
          .not('resolved_at', 'is', null);
        
        // Filter by resolved status if not 'all'
        if (resolvedStatus !== 'all') {
          if (resolvedStatus === 'yes') {
            query = query.eq('status', 'resolved_yes');
          } else if (resolvedStatus === 'no') {
            query = query.eq('status', 'resolved_no');
          }
        }
        
        const { data, error } = await query.order('resolved_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setQuestions(data || []);
      } catch (err: any) {
        console.error('Error fetching resolved questions:', err);
        setError(err.message || 'Failed to load resolved questions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [resolvedStatus]);
  
  const getResolvedStatusBadge = (status: string) => {
    if (status === 'resolved_yes') return 'Yes';
    if (status === 'resolved_no') return 'No';
    return 'Unknown';
  };
  
  const columns = [
    {
      key: 'question',
      label: 'Question',
      sortable: true,
      filterable: true,
    },
    {
      key: 'resolved_at',
      label: 'Date & Time',
      sortable: true,
      render: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : 'N/A',
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
    },
    {
      key: 'status',
      label: 'Resolved Status',
      sortable: true,
      filterable: true,
      render: (value: string) => getResolvedStatusBadge(value),
    },
  ];
  
  const title = resolvedStatus === 'all' 
    ? 'All Resolved Questions' 
    : `Questions Resolved as ${resolvedStatus === 'yes' ? 'Yes' : 'No'}`;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable 
          data={questions} 
          columns={columns}
          defaultSort={{ key: 'resolved_at', direction: 'desc' }} 
        />
      )}
    </div>
  );
}
