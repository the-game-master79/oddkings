
-- First check if the function already exists
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If the deposit is being approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Update user balance
        UPDATE user_balances
        SET total_usd_value = total_usd_value + NEW.total_usd_value
        WHERE user_id = NEW.user_id;

        -- Record the transaction (if not already recorded)
        IF NOT EXISTS (
            SELECT 1 FROM transactions 
            WHERE user_id = NEW.user_id 
            AND amount = NEW.total_usd_value 
            AND type = 'deposit'
            AND description LIKE CONCAT(NEW.crypto_type, ' Deposit%')
        ) THEN
            INSERT INTO transactions (
                user_id,
                amount,
                type,
                description
            ) VALUES (
                NEW.user_id,
                NEW.total_usd_value,
                'deposit',
                format('%s Deposit (%s %s)', NEW.crypto_type, NEW.amount, NEW.crypto_type)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Check if the trigger already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_deposit_approval'
    ) THEN
        CREATE TRIGGER on_deposit_approval
        AFTER UPDATE ON public.deposits
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_deposit_approval();
    END IF;
END
$$;
