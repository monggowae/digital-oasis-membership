
CREATE OR REPLACE FUNCTION has_trigger_exists(trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_trigger
    JOIN pg_class ON pg_class.oid = pg_trigger.tgrelid
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_trigger.tgname = trigger_name
    AND pg_namespace.nspname = 'auth'
  );
END;
$$;
