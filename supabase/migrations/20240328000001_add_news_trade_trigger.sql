-- Create trigger for news trade resolution
CREATE OR REPLACE FUNCTION public.handle_news_trade_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When a question is resolved
    IF NEW.status IN ('resolved_yes', 'resolved_no') AND OLD.status = 'active' THEN
        -- Process all trades for this question
        FOR trade IN (
            SELECT nt.*, q.status as question_status
            FROM news_trades nt
            JOIN questions q ON q.id = nt.question_id
            WHERE nt.question_id = NEW.id
        ) LOOP
            -- Determine if trade is a winner
            IF (NEW.status = 'resolved_yes' AND trade.prediction = 'yes') OR
               (NEW.status = 'resolved_no' AND trade.prediction = 'no') THEN
                -- Call resolution function for winning trade
                PERFORM resolve_news_trade_and_update_balance(
                    trade.id,
                    trade.user_id,
                    trade.payout,
                    true
                );
            ELSE
                -- Call resolution function for losing trade
                PERFORM resolve_news_trade_and_update_balance(
                    trade.id,
                    trade.user_id,
                    trade.amount,
                    false
                );
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_news_question_resolution ON questions;
CREATE TRIGGER on_news_question_resolution
    AFTER UPDATE ON questions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_news_trade_resolution();
