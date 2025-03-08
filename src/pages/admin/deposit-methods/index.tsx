
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DepositMethodsList } from './DepositMethodsList';
import { ManageDepositMethodsForm } from './ManageDepositMethodsForm';
import { DepositMethod } from '@/types/deposit-methods';
import { supabase } from '@/integrations/supabase/client';

export default function ManageDepositMethods() {
  const [activeMethod, setActiveMethod] = useState<DepositMethod | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditMethod = (method: DepositMethod) => {
    setActiveMethod(method);
    setIsAddingMethod(false);
    setActiveTab('manage');
  };

  const handleAddNewMethod = () => {
    setActiveMethod(null);
    setIsAddingMethod(true);
    setActiveTab('manage');
  };

  const handleSave = async (methodData: Partial<DepositMethod>) => {
    setIsUpdating(true);
    try {
      let result;
      
      if (isAddingMethod) {
        // Creating a new method
        result = await supabase
          .from('deposit_methods')
          .insert({
            crypto: methodData.crypto!,
            network: methodData.network!,
            deposit_address: methodData.deposit_address!,
            qr_code_url: methodData.qr_code_url || null,
            is_active: methodData.is_active !== undefined ? methodData.is_active : true
          });
      } else if (activeMethod?.id) {
        // Updating existing method
        result = await supabase
          .from('deposit_methods')
          .update({
            crypto: methodData.crypto!,
            network: methodData.network!,
            deposit_address: methodData.deposit_address!,
            qr_code_url: methodData.qr_code_url,
            is_active: methodData.is_active
          })
          .eq('id', activeMethod.id);
      }

      if (result?.error) {
        throw result.error;
      }

      toast.success(isAddingMethod ? 'Deposit method added successfully!' : 'Deposit method updated successfully!');
      setActiveTab('list');
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh of the list
    } catch (error) {
      console.error('Error saving deposit method:', error);
      toast.error('Failed to save deposit method');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setActiveTab('list');
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Deposit Methods</CardTitle>
          <CardDescription>Manage cryptocurrency deposit methods</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">All Methods</TabsTrigger>
              <TabsTrigger value="manage" disabled={!isAddingMethod && !activeMethod}>
                {isAddingMethod ? 'Add New Method' : 'Edit Method'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddNewMethod}>Add New Method</Button>
              </div>
              <DepositMethodsList 
                onEdit={handleEditMethod} 
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            
            <TabsContent value="manage">
              <ManageDepositMethodsForm
                method={activeMethod}
                isAdding={isAddingMethod}
                onSave={handleSave}
                onCancel={handleCancel}
                isUpdating={isUpdating}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
