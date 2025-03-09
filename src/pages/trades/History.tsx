
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Trade {
  id: string;
  question: string;
  category: string;
  prediction: string;
  amount: number;
  payout: number;
  status: string;
  created_at: string;
}

export default function History() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchTradeHistory() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Fetch news trades
        const { data: newsTradesData, error: newsTradesError } = await supabase
          .from('news_trades')
          .select(`
            id,
            prediction,
            amount,
            payout,
            status,
            created_at,
            question_id,
            questions(question, category, status)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (newsTradesError) throw newsTradesError;

        // Fetch sport trades
        const { data: sportTradesData, error: sportTradesError } = await supabase
          .from('sport_trades')
          .select(`
            id,
            prediction,
            amount,
            payout,
            status,
            created_at,
            sport_question_id,
            sport_questions(question, category, status)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (sportTradesError) throw sportTradesError;

        // Transform news trades
        const transformedNewsTradesData = (newsTradesData || []).map(trade => {
          // Determine if trade won or lost based on question resolution
          let tradeStatus = trade.status;
          if (trade.questions?.status && trade.questions.status.startsWith('resolved_')) {
            const questionOutcome = trade.questions.status === 'resolved_yes' ? 'yes' : 'no';
            tradeStatus = trade.prediction === questionOutcome ? 'won' : 'lost';
          }
          
          return {
            id: trade.id,
            question: trade.questions?.question || "Unknown Question",
            category: trade.questions?.category || "News",
            prediction: trade.prediction,
            amount: trade.amount,
            payout: trade.payout,
            status: tradeStatus,
            created_at: trade.created_at
          };
        });

        // Transform sport trades
        const transformedSportTradesData = (sportTradesData || []).map(trade => {
          // Determine if trade won or lost based on question resolution
          let tradeStatus = trade.status;
          if (trade.sport_questions?.status && trade.sport_questions.status.startsWith('resolved_')) {
            const questionOutcome = trade.sport_questions.status === 'resolved_yes' ? 'yes' : 'no';
            tradeStatus = trade.prediction === questionOutcome ? 'won' : 'lost';
          }
          
          return {
            id: trade.id,
            question: trade.sport_questions?.question || "Unknown Question",
            category: trade.sport_questions?.category || "Sports",
            prediction: trade.prediction,
            amount: trade.amount,
            payout: trade.payout,
            status: tradeStatus,
            created_at: trade.created_at
          };
        });

        // Combine both types of trades and sort by created_at
        const combinedTrades = [
          ...transformedNewsTradesData,
          ...transformedSportTradesData
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setTrades(combinedTrades);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trade history:", error);
        setLoading(false);
      }
    }

    fetchTradeHistory();
  }, []);
  
  const visibleTrades = trades.slice(0, visibleLimit);
  const hasMoreItems = trades.length > visibleLimit;
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won':
        return <Badge className="bg-green-500">Won</Badge>;
      case 'lost':
        return <Badge className="bg-red-500">Lost</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderMobileView = () => (
    <div className="space-y-4">
      {visibleTrades.map((trade) => (
        <div 
          key={trade.id} 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <Badge variant="outline" className="capitalize">
              {trade.category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(trade.created_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-medium">{trade.question}</p>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Prediction:</span>
              <span className="capitalize">{trade.prediction}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</span>
              <span>${trade.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Payout:</span>
              <span className="font-semibold">${trade.payout.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
              <span>{getStatusBadge(trade.status)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderDesktopView = () => (
    <div className="rounded-md overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Your Prediction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleTrades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(trade.created_at), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {trade.category}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {trade.question}
              </TableCell>
              <TableCell className="capitalize">{trade.prediction}</TableCell>
              <TableCell>${trade.amount.toFixed(2)}</TableCell>
              <TableCell className="font-medium">${trade.payout.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(trade.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Trade History</h1>
        <p className="text-center py-10 text-muted-foreground">Loading trade history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Trade History</h1>
      
      {trades.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">You haven't made any trades yet.</p>
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
