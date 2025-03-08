-- First ensure deposit_methods table has proper structure
CREATE TABLE IF NOT EXISTS public.deposit_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    crypto TEXT NOT NULL,
    network TEXT NOT NULL,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Then create deposit_addresses table
CREATE TABLE IF NOT EXISTS public.deposit_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    method_id UUID NOT NULL REFERENCES public.deposit_methods(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_method_id ON public.deposit_addresses(method_id);

-- Add RLS policies
ALTER TABLE public.deposit_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to admins"
    ON public.deposit_addresses
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
