
-- Fix for withdrawal approval to prevent duplicate entries
CREATE OR REPLACE FUNCTION public.handle_withdrawal_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If the withdrawal is being approved
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Deduct from user balance
        UPDATE user_balances
        SET total_usd_value = total_usd_value - NEW.amount
        WHERE user_id = NEW.user_id;

        -- Record the transaction (if not already recorded for this withdrawal)
        IF NOT EXISTS (
            SELECT 1 FROM transactions 
            WHERE user_id = NEW.user_id 
            AND amount = NEW.amount 
            AND type = 'withdrawal'
            AND description LIKE format('Withdrawal of %s %s via %s', NEW.amount, NEW.token, NEW.network)
        ) THEN
            INSERT INTO transactions (
                user_id,
                amount,
                type,
                description
            ) VALUES (
                NEW.user_id,
                NEW.amount,
                'withdrawal',
                format('Withdrawal of %s %s via %s', NEW.amount, NEW.token, NEW.network)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
