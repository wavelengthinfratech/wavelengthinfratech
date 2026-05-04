-- Step B: Remap users from old roles to new 9-role system, update functions & policies

-- 1. Remap existing user_roles
UPDATE public.user_roles SET role = 'super_admin'      WHERE role = 'main_admin';
UPDATE public.user_roles SET role = 'construction_head' WHERE role = 'contractor';
UPDATE public.user_roles SET role = 'field_manager'    WHERE role = 'subcontractor';
UPDATE public.user_roles SET role = 'site_supervisor'  WHERE role = 'mistri';
UPDATE public.user_roles SET role = 'viewer'           WHERE role = 'labour';

-- 2. Update get_primary_role priority for 9 roles
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'construction_head' THEN 2
    WHEN 'interior_head' THEN 3
    WHEN 'accounts_manager' THEN 4
    WHEN 'material_manager' THEN 5
    WHEN 'hr_manager' THEN 6
    WHEN 'field_manager' THEN 7
    WHEN 'site_supervisor' THEN 8
    WHEN 'viewer' THEN 9
    -- legacy fallback
    WHEN 'main_admin' THEN 10
    WHEN 'contractor' THEN 11
    WHEN 'subcontractor' THEN 12
    WHEN 'mistri' THEN 13
    WHEN 'labour' THEN 14
  END
  LIMIT 1;
$function$;

-- 3. Update handle_new_user: first user = super_admin, rest = viewer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INT;
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := 'viewer';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$function$;

-- 4. Update RLS policies that reference the old 'main_admin' role to use 'super_admin'

-- estimates
DROP POLICY IF EXISTS "Users delete own estimates" ON public.estimates;
CREATE POLICY "Users delete own estimates" ON public.estimates
  FOR DELETE TO authenticated
  USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users view own estimates" ON public.estimates;
CREATE POLICY "Users view own estimates" ON public.estimates
  FOR SELECT TO authenticated
  USING (
    (auth.uid() = created_by)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'accounts_manager'::app_role)
  );

-- pricing_audit_log
DROP POLICY IF EXISTS "Admin views audit log" ON public.pricing_audit_log;
CREATE POLICY "Admin views audit log" ON public.pricing_audit_log
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'material_manager'::app_role)
    OR has_role(auth.uid(), 'accounts_manager'::app_role)
  );

-- pricing_categories — material_manager can also manage
DROP POLICY IF EXISTS "Admin manages categories" ON public.pricing_categories;
CREATE POLICY "Admin manages categories" ON public.pricing_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'material_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'material_manager'::app_role));

-- pricing_items — material_manager can also manage
DROP POLICY IF EXISTS "Admin manages pricing items" ON public.pricing_items;
CREATE POLICY "Admin manages pricing items" ON public.pricing_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'material_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'material_manager'::app_role));

-- profiles
DROP POLICY IF EXISTS "Admin updates any profile" ON public.profiles;
CREATE POLICY "Admin updates any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- projects
DROP POLICY IF EXISTS "Admin manages projects" ON public.projects;
CREATE POLICY "Admin manages projects" ON public.projects
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'construction_head'::app_role)
    OR has_role(auth.uid(), 'interior_head'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'construction_head'::app_role)
    OR has_role(auth.uid(), 'interior_head'::app_role)
  );

-- user_roles — super_admin or hr_manager
DROP POLICY IF EXISTS "Admin manages roles" ON public.user_roles;
CREATE POLICY "Admin manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));