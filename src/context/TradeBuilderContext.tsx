import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Trade {
  questionId: string;
  question: string;
  category: string;
  option: 'yes' | 'no';
  amount?: number;
  payout: number; // Add payout percentage
  teams?: {
    team1: string;
    team2: string;
  };
}

interface TradeBuilderContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  removeTrade: (questionId: string) => void;
  clearTrades: () => void;
  updateTradeAmount: (questionId: string, amount: number) => void;
}

const TradeBuilderContext = createContext<TradeBuilderContextType | undefined>(undefined);

const TRADES_STORAGE_KEY = 'oddkings_pending_trades';

export function TradeBuilderProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const savedTrades = localStorage.getItem(TRADES_STORAGE_KEY);
    return savedTrades ? JSON.parse(savedTrades) : [];
  });

  useEffect(() => {
    localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade: Trade) => {
    setTrades(prev => {
      const exists = prev.find(t => t.questionId === trade.questionId);
      if (exists) {
        return prev.map(t => t.questionId === trade.questionId ? trade : t);
      }
      return [...prev, trade];
    });
  };

  const removeTrade = (questionId: string) => {
    setTrades(prev => prev.filter(t => t.questionId !== questionId));
  };

  const clearTrades = () => {
    setTrades([]);
    localStorage.removeItem(TRADES_STORAGE_KEY);
  };

  const updateTradeAmount = (questionId: string, amount: number) => {
    setTrades(prev => prev.map(t => 
      t.questionId === questionId ? { ...t, amount } : t
    ));
  };

  return (
    <TradeBuilderContext.Provider value={{ 
      trades, 
      addTrade, 
      removeTrade, 
      clearTrades,
      updateTradeAmount 
    }}>
      {children}
    </TradeBuilderContext.Provider>
  );
}

export const useTradeBuilder = () => {
  const context = useContext(TradeBuilderContext);
  if (!context) {
    throw new Error('useTradeBuilder must be used within a TradeBuilderProvider');
  }
  return context;
};
