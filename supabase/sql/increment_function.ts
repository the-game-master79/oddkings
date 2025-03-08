
// This is a placeholder file to document the SQL migration that needs to be applied
// The actual SQL will be provided in a separate <lov-sql> block

/**
 * SQL to create increment function:
 * 
 * CREATE OR REPLACE FUNCTION increment(x numeric)
 * RETURNS numeric
 * LANGUAGE sql IMMUTABLE STRICT
 * AS $$
 *   SELECT $1 + current_setting('session.user_balance_increment', true)::numeric;
 * $$;
 */
