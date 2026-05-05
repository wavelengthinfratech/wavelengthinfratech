
-- 1. Add telecaller roles to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'telecaller_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'telecaller';

-- 2. Extend projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'construction',
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS area_sqft numeric,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS assigned_thekedar text,
  ADD COLUMN IF NOT EXISTS assigned_supervisor text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS style_preference text,
  ADD COLUMN IF NOT EXISTS timeline_weeks integer,
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Project Stages
CREATE TABLE IF NOT EXISTS public.project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  progress integer NOT NULL DEFAULT 0,
  photo_url text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stages viewable by auth" ON public.project_stages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project managers manage stages" ON public.project_stages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager'));

CREATE TRIGGER trg_project_stages_updated BEFORE UPDATE ON public.project_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Project Rooms
CREATE TABLE IF NOT EXISTS public.project_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  length_ft numeric,
  height_ft numeric,
  width_ft numeric,
  doors integer DEFAULT 0,
  windows integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms viewable by auth" ON public.project_rooms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project managers manage rooms" ON public.project_rooms
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager'));

-- 5. Update projects updated_at trigger
DROP TRIGGER IF EXISTS trg_projects_updated ON public.projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Storage bucket for project photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read project photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-photos');
CREATE POLICY "Project managers upload photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-photos' AND (
    has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager')
  ));
CREATE POLICY "Project managers delete photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-photos' AND (
    has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head') OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'field_manager')
  ));
