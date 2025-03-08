-- Add function to handle news trade resolution
CREATE OR REPLACE FUNCTION public.resolve_news_trade_and_update_balance(
    p_trade_id UUID,
    p_user_id UUID,
    p_amount NUMERIC,
    p_is_winner BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update trade status
    UPDATE news_trades
    SET status = CASE WHEN p_is_winner THEN 'completed' ELSE 'failed' END
    WHERE id = p_trade_id;

    -- If winner, update user balance
    IF p_is_winner THEN
        UPDATE user_balances
        SET total_usd_value = total_usd_value + p_amount
        WHERE user_id = p_user_id;

        -- Create winning transaction record
        INSERT INTO transactions (
            user_id,
            amount,
            type,
            description,
            trade_id,
            status
        ) VALUES (
            p_user_id,
            p_amount,
            'trade_payout',
            'News trade winning payout',
            p_trade_id,
            'completed'
        );
    END IF;

    -- Update the original trade placement transaction
    UPDATE transactions
    SET status = CASE WHEN p_is_winner THEN 'completed' ELSE 'failed' END,
        description = CASE 
            WHEN p_is_winner THEN 'WON: News trade placement'
            ELSE 'LOST: News trade placement'
        END
    WHERE trade_id = p_trade_id
    AND type = 'trade_placement';
END;
$$;
