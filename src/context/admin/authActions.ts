
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (!data?.user) {
    throw new Error('No user data returned');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Access denied: Admin privileges required');
  }

  return data;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}
