-- Migration: Harden RLS policies and secure perform_moderation_action RPC

-- Enable RLS on profiles and set policies that allow:
-- - any user to select public profiles
-- - users to update their own record
-- - admins to update any profile

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS profiles_select ON public.profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS profiles_update_self_or_admin ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR (
      EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin)
    )
  )
  WITH CHECK (
    auth.uid() = id OR (
      EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin)
    )
  );

-- Allow inserting into suspension_logs only by admins (or via the admin RPC)
ALTER TABLE IF EXISTS public.suspension_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS suspension_logs_insert_admin ON public.suspension_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- Add similar protection for kyc_documents and device related tables
ALTER TABLE IF EXISTS public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS kyc_documents_insert_auth ON public.kyc_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)));

ALTER TABLE IF EXISTS public.device_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS device_logs_insert ON public.device_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Replace perform_moderation_action with a secure version that verifies the caller is an admin.

CREATE OR REPLACE FUNCTION public.perform_moderation_action(
  target_user_id uuid,
  action_type text,
  reason text DEFAULT NULL,
  duration_hours int DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller uuid := auth.uid();
  caller_is_admin boolean := false;
BEGIN
  -- Check caller is an admin
  IF caller IS NULL THEN
    RAISE EXCEPTION 'only authenticated admins can perform moderation actions';
  END IF;

  SELECT is_admin INTO caller_is_admin FROM public.profiles WHERE id = caller;
  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'only admins can call perform_moderation_action';
  END IF;

  -- Validate action_type
  IF action_type NOT IN ('suspend', 'ban', 'revoke') THEN
    RAISE EXCEPTION 'invalid action_type: %', action_type;
  END IF;

  -- Perform action with admin caller as admin_id
  IF action_type = 'suspend' THEN
    UPDATE public.profiles
    SET account_status = 'suspended'
    WHERE id = target_user_id;

    INSERT INTO public.suspension_logs (user_id, admin_id, action_type, reason, expires_at)
    VALUES (
      target_user_id,
      caller,
      'suspend',
      reason,
      CASE WHEN duration_hours IS NULL THEN now() + interval '24 hours'
           ELSE now() + (duration_hours || ' hours')::interval END
    );

  ELSIF action_type = 'ban' THEN
    UPDATE public.profiles
    SET account_status = 'banned'
    WHERE id = target_user_id;

    INSERT INTO public.suspension_logs (user_id, admin_id, action_type, reason, expires_at)
    VALUES (target_user_id, caller, 'ban', reason, NULL);

  ELSIF action_type = 'revoke' THEN
    UPDATE public.profiles
    SET account_status = 'active'
    WHERE id = target_user_id;

    INSERT INTO public.suspension_logs (user_id, admin_id, action_type, reason, expires_at)
    VALUES (target_user_id, caller, 'revoke', reason, NULL);
  END IF;

  RETURN;
END;
$$;

-- Grant execute only to authenticated role (admin check prevents misuse)
GRANT EXECUTE ON FUNCTION public.perform_moderation_action(uuid, text, text, int) TO authenticated;
