import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { DepositMethodsList } from './deposit-methods/DepositMethodsList';
import { ManageDepositMethodsForm } from './deposit-methods/ManageDepositMethodsForm';
import { DepositMethod } from '@/types/deposit-methods';
import { supabase } from '@/integrations/supabase/client';

export default function ManageDepositMethods() {
  const [activeMethod, setActiveMethod] = useState<DepositMethod | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditMethod = (method: DepositMethod) => {
    setActiveMethod(method);
    setIsAddingMethod(false);
  };

  const handleAddNewMethod = () => {
    setActiveMethod(null);
    setIsAddingMethod(true);
  };

  const handleSave = async (methodData: Partial<DepositMethod>) => {
    setIsUpdating(true);
    try {
      if (isAddingMethod) {
        // Create new deposit method
        const { data: methodResult, error: methodError } = await supabase
          .from('deposit_methods')
          .insert({
            crypto: methodData.crypto!,
            network: methodData.network!,
            qr_code_url: methodData.qr_code_url || null,
            is_active: methodData.is_active !== undefined ? methodData.is_active : true
          })
          .select()
          .single();

        if (methodError) throw methodError;

        // Create deposit address if provided
        if (methodData.deposit_address) {
          const { error: addressError } = await supabase
            .from('deposit_address') // Ensure 'deposit_addresses' is a valid table name in your Supabase schema
            .insert({
              method_id: methodResult.id,
              address: methodData.deposit_address
            });

          if (addressError) throw addressError;
        }
      } else if (activeMethod?.id) {
        // Update deposit method
        const { error: methodError } = await supabase
          .from('deposit_methods')
          .update({
            crypto: methodData.crypto!,
            network: methodData.network!,
            qr_code_url: methodData.qr_code_url,
            is_active: methodData.is_active
          })
          .eq('id', activeMethod.id);

        if (methodError) throw methodError;

        // Handle deposit address update
        if (methodData.deposit_address) {
          // Check if address exists
          const { data: existingAddress } = await supabase
            .from('deposit_addresses')
            .select()
            .eq('method_id', activeMethod.id)
            .maybeSingle();

          if (existingAddress) {
            // Update existing address
            const { error: updateError } = await supabase
              .from('deposit_addresses')
              .update({ address: methodData.deposit_address })
              .eq('method_id', activeMethod.id);

            if (updateError) throw updateError;
          } else {
            // Create new address
            const { error: insertError } = await supabase
              .from('deposit_addresses')
              .insert({
                method_id: activeMethod.id,
                address: methodData.deposit_address
              });

            if (insertError) throw insertError;
          }
        }
      }

      toast.success(isAddingMethod ? 'Deposit method added successfully!' : 'Deposit method updated successfully!');
      setRefreshTrigger(prev => prev + 1);
      if (isAddingMethod) {
        setIsAddingMethod(false);
        setActiveMethod(null);
      }
    } catch (error: any) {
      console.error('Error saving deposit method:', error);
      toast.error(error.message || 'Failed to save deposit method');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setActiveMethod(null);
    setIsAddingMethod(false);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Deposit Methods</h1>
        <Button onClick={handleAddNewMethod} disabled={isAddingMethod}>Add New Method</Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* List Section */}
        <div className="col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>All Methods</CardTitle>
              <CardDescription>List of all available deposit methods</CardDescription>
            </CardHeader>
            <CardContent>
              <DepositMethodsList 
                onEdit={handleEditMethod} 
                refreshTrigger={refreshTrigger}
                activeMethodId={activeMethod?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Edit/Add Form Section */}
        <div className="col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>{isAddingMethod ? 'Add New Method' : activeMethod ? 'Edit Method' : 'Select a Method'}</CardTitle>
              <CardDescription>
                {isAddingMethod ? 'Create a new deposit method' : activeMethod 
                  ? 'Modify existing deposit method' 
                  : 'Select a method from the list to edit or click "Add New Method"'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(isAddingMethod || activeMethod) && (
                <ManageDepositMethodsForm
                  method={activeMethod}
                  isAdding={isAddingMethod}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
