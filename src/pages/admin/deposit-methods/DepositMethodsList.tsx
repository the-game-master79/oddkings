import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Edit, Check, X, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DepositMethod } from '@/types/deposit-methods';
import { toast } from 'sonner';

export interface DepositMethodsListProps {
  onEdit: (method: DepositMethod) => void;
  refreshTrigger: number;
  activeMethodId?: string;
}

export function DepositMethodsList({ onEdit, refreshTrigger, activeMethodId }: DepositMethodsListProps) {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepositMethods = async () => {
      setLoading(true);
      try {
        // First fetch deposit methods
        const { data: methodsData, error: methodsError } = await supabase
          .from('deposit_methods')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (methodsError) throw methodsError;

        // Then fetch addresses for these methods
        const { data: addressesData, error: addressesError } = await supabase
          .from('deposit_addresses')
          .select('*')
          .in('method_id', methodsData.map(m => m.id));

        if (addressesError) throw addressesError;

        // Combine the data
        const transformedData = methodsData.map(method => ({
          ...method,
          deposit_address: addressesData
            ?.find(addr => addr.method_id === method.id)
            ?.address || '',
          addresses: addressesData
            ?.filter(addr => addr.method_id === method.id)
            .map(addr => ({
              id: addr.id,
              address: addr.address,
              created_at: addr.created_at,
              label: addr.label || '',
              method_id: method.id
            })) || []
        }));
        
        setMethods(transformedData);
      } catch (error) {
        console.error('Error fetching deposit methods:', error);
        toast.error('Failed to load deposit methods');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepositMethods();
  }, [refreshTrigger]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deposit method?')) {
      return;
    }
    
    setActionInProgress(id);
    try {
      const { error } = await supabase
        .from('deposit_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMethods(methods.filter(method => method.id !== id));
      toast.success('Deposit method deleted successfully');
    } catch (error) {
      console.error('Error deleting deposit method:', error);
      toast.error('Failed to delete deposit method');
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setActionInProgress(id);
    try {
      const { error } = await supabase
        .from('deposit_methods')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setMethods(methods.map(method => 
        method.id === id 
          ? { ...method, is_active: !currentStatus }
          : method
      ));
      
      toast.success(`Deposit method ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating deposit method status:', error);
      toast.error('Failed to update deposit method status');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading deposit methods...
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No deposit methods found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Crypto</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Deposit Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods.map(method => (
            <TableRow 
              key={method.id}
              className={method.id === activeMethodId ? 'bg-muted/50' : ''}
            >
              <TableCell>{method.crypto}</TableCell>
              <TableCell>{method.network}</TableCell>
              <TableCell className="max-w-xs truncate">
                <div className="flex items-center gap-2">
                  <span className="truncate">{method.deposit_address}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={actionInProgress === method.id} 
                    onClick={() => copyToClipboard(method.deposit_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${method.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'}`}
                >
                  {method.is_active ? 'Active' : 'Inactive'}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={actionInProgress === method.id}
                    onClick={() => toggleActive(method.id, method.is_active)}
                  >
                    {actionInProgress === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : method.is_active ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={actionInProgress === method.id}
                    onClick={() => onEdit(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={actionInProgress === method.id}
                    onClick={() => deleteMethod(method.id)}
                  >
                    {actionInProgress === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DepositMethodsList;
