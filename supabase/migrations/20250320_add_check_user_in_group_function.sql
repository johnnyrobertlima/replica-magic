
-- Create a function to check if a user is in a specific group by name
-- This avoids the RLS issues with direct table queries
CREATE OR REPLACE FUNCTION public.check_user_in_group(user_id uuid, group_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_groups ug
    JOIN public.groups g ON ug.group_id = g.id
    WHERE ug.user_id = check_user_in_group.user_id
    AND g.name = check_user_in_group.group_name
  );
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.check_user_in_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_in_group TO anon;
GRANT EXECUTE ON FUNCTION public.check_user_in_group TO service_role;
