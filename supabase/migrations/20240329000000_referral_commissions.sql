-- Function to handle referral commissions
CREATE OR REPLACE FUNCTION handle_referral_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If the deposit is being approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Find referrer if exists
        WITH referral AS (
            SELECT referrer_id 
            FROM referral_relationships 
            WHERE referred_id = NEW.user_id
            LIMIT 1
        )
        INSERT INTO transactions (
            user_id,
            amount,
            type,
            description
        )
        SELECT 
            r.referrer_id,
            NEW.total_usd_value * 0.05, -- 5% commission
            'referral_commission',
            format('Referral commission from deposit by %s', NEW.user_id)
        FROM referral r
        WHERE r.referrer_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for referral commissions
DROP TRIGGER IF EXISTS on_deposit_referral_commission ON public.deposits;
CREATE TRIGGER on_deposit_referral_commission
    AFTER UPDATE ON public.deposits
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_commission();

-- Add index for faster referral queries
CREATE INDEX IF NOT EXISTS idx_deposits_user_id_status ON public.deposits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_type ON public.transactions(user_id, type);
