
CREATE OR REPLACE FUNCTION has_function_exists(function_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_proc
    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    WHERE pg_proc.proname = function_name
    AND pg_namespace.nspname = 'public'
  );
END;
$$;
