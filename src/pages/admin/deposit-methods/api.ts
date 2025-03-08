
import { supabase } from '@/integrations/supabase/client';
import { DepositMethod } from '@/types/deposit-methods';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Create a new deposit method
export const createDepositMethod = async (formData: FormData): Promise<DepositMethod> => {
  try {
    const crypto = formData.get('crypto') as string;
    const network = formData.get('network') as string;
    const depositAddress = formData.get('depositAddress') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const depositGroupId = formData.get('depositGroupId') as string;
    const qrCodeFile = formData.get('qrCode') as File;
    
    let qrCodeUrl = null;
    
    // Upload QR code if provided
    if (qrCodeFile) {
      const fileExt = qrCodeFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      // Ensure the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'deposit-qr-codes');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('deposit-qr-codes', {
          public: true
        });
      }
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('deposit-qr-codes')
        .upload(fileName, qrCodeFile, {
          contentType: qrCodeFile.type,
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading QR code:', error);
        throw error;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('deposit-qr-codes')
        .getPublicUrl(fileName);
      
      qrCodeUrl = publicUrl.publicUrl;
    }
    
    // Create deposit method in database
    const { data, error } = await supabase
      .from('deposit_methods')
      .insert([
        {
          crypto,
          network,
          deposit_address: depositAddress,
          display_order: displayOrder,
          is_active: true,
          qr_code_url: qrCodeUrl,
          deposit_group_id: depositGroupId
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating deposit method:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createDepositMethod:', error);
    throw error;
  }
};

// Update an existing deposit method
export const updateDepositMethod = async (id: string, formData: FormData): Promise<DepositMethod> => {
  try {
    const crypto = formData.get('crypto') as string;
    const network = formData.get('network') as string;
    const depositAddress = formData.get('depositAddress') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const depositGroupId = formData.get('depositGroupId') as string;
    const qrCodeFile = formData.get('qrCode') as File;
    
    // Get current deposit method
    const { data: currentMethod, error: fetchError } = await supabase
      .from('deposit_methods')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current deposit method:', fetchError);
      throw fetchError;
    }
    
    let qrCodeUrl = currentMethod.qr_code_url;
    
    // Upload new QR code if provided
    if (qrCodeFile) {
      const fileExt = qrCodeFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('deposit-qr-codes')
        .upload(fileName, qrCodeFile, {
          contentType: qrCodeFile.type,
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading QR code:', error);
        throw error;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('deposit-qr-codes')
        .getPublicUrl(fileName);
      
      qrCodeUrl = publicUrl.publicUrl;
    }
    
    // Update deposit method in database
    const { data, error } = await supabase
      .from('deposit_methods')
      .update({
        crypto,
        network,
        deposit_address: depositAddress,
        display_order: displayOrder,
        qr_code_url: qrCodeUrl,
        deposit_group_id: depositGroupId
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating deposit method:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateDepositMethod:', error);
    throw error;
  }
};

// Delete a deposit method
export const deleteDepositMethod = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('deposit_methods')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting deposit method:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDepositMethod:', error);
    throw error;
  }
};

// Delete all deposit methods in a group
export const deleteDepositMethodGroup = async (depositGroupId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('deposit_methods')
      .delete()
      .eq('deposit_group_id', depositGroupId);
    
    if (error) {
      console.error('Error deleting deposit method group:', error);
      throw error;
    }
    
    toast.success('Deleted deposit method group successfully');
  } catch (error) {
    console.error('Error in deleteDepositMethodGroup:', error);
    throw error;
  }
};
