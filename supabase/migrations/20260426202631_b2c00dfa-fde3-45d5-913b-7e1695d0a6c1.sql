-- Enums
CREATE TYPE public.app_role AS ENUM ('main_admin','contractor','subcontractor','mistri','labour');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  assigned_site TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles (separate table — never on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'main_admin' THEN 1
    WHEN 'contractor' THEN 2
    WHEN 'subcontractor' THEN 3
    WHEN 'mistri' THEN 4
    WHEN 'labour' THEN 5
  END
  LIMIT 1;
$$;

-- Auto profile + role on signup (first user = main_admin, rest = labour)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
    assigned_role := 'main_admin';
  ELSE
    assigned_role := 'labour';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles RLS
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin updates any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'main_admin'));

-- user_roles RLS
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'main_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'main_admin'));

-- Pricing categories
CREATE TABLE public.pricing_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by all auth" ON public.pricing_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages categories" ON public.pricing_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'main_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'main_admin'));

-- Pricing items
CREATE TABLE public.pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.pricing_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  vendor TEXT,
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pricing_items_updated_at BEFORE UPDATE ON public.pricing_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- Anyone (even anon) can view live rates so public calculators work
CREATE POLICY "Pricing viewable publicly" ON public.pricing_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages pricing items" ON public.pricing_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'main_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'main_admin'));

-- Pricing audit log
CREATE TABLE public.pricing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.pricing_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  old_rate NUMERIC(12,2),
  new_rate NUMERIC(12,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin views audit log" ON public.pricing_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'main_admin'));

CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.rate IS DISTINCT FROM OLD.rate) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.pricing_audit_log (item_id, item_name, old_rate, new_rate, changed_by)
    VALUES (NEW.id, NEW.name, CASE WHEN TG_OP='UPDATE' THEN OLD.rate ELSE NULL END, NEW.rate, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER pricing_items_audit
  AFTER INSERT OR UPDATE ON public.pricing_items
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change();

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  budget NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable by auth" ON public.projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'main_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'main_admin'));

-- Estimates
CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  estimate_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  total NUMERIC(14,2) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own estimates" ON public.estimates
  FOR SELECT TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'main_admin'));
CREATE POLICY "Auth users create estimates" ON public.estimates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users delete own estimates" ON public.estimates
  FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'main_admin'));