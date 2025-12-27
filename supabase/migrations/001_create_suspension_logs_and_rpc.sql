-- Migration: Create suspension_logs table and perform_moderation_action RPC

-- Table: suspension_logs
CREATE TABLE IF NOT EXISTS public.suspension_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_id uuid,
  action_type text NOT NULL CHECK (action_type IN ('suspend', 'ban', 'revoke')),
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS suspension_logs_user_idx ON public.suspension_logs (user_id);
CREATE INDEX IF NOT EXISTS suspension_logs_admin_idx ON public.suspension_logs (admin_id);

-- RPC: perform_moderation_action
-- Inputs: target_user_id uuid, action_type text, reason text, duration_hours int
-- Behavior: updates profiles.account_status and inserts a suspension_logs record within a transaction

CREATE OR REPLACE FUNCTION public.perform_moderation_action(
  target_user_id uuid,
  action_type text,
  reason text DEFAULT NULL,
  duration_hours int DEFAULT NULL,
  admin_id uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Validate action_type
  IF action_type NOT IN ('suspend', 'ban', 'revoke') THEN
    RAISE EXCEPTION 'invalid action_type: %', action_type;
  END IF;

  -- Compute new account_status and expires_at
  IF action_type = 'suspend' THEN
    -- suspended for a duration; if duration_hours IS NULL default to 24
    UPDATE public.profiles
    SET account_status = 'suspended'
    WHERE id = target_user_id;

    INSERT INTO public.suspension_logs (user_id, admin_id, action_type, reason, expires_at)
    VALUES (
      target_user_id,
      admin_id,
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
    VALUES (target_user_id, admin_id, 'ban', reason, NULL);

  ELSIF action_type = 'revoke' THEN
    UPDATE public.profiles
    SET account_status = 'active'
    WHERE id = target_user_id;

    INSERT INTO public.suspension_logs (user_id, admin_id, action_type, reason, expires_at)
    VALUES (target_user_id, admin_id, 'revoke', reason, NULL);
  END IF;

  RETURN;
END;
$$;

-- Grant execution privileges to admin role if you have one, e.g. `auth_admin`.
-- GRANT EXECUTE ON FUNCTION public.perform_moderation_action(uuid, text, text, int, uuid) TO auth_admin;
