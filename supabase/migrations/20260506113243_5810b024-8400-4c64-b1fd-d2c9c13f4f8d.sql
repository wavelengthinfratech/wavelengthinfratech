
-- LEADS
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp_text text,
  lead_type text NOT NULL DEFAULT 'HOUSE_OWNER',
  mobile_no text NOT NULL,
  name text NOT NULL,
  village_address text,
  construction_area text,
  experience text,
  remark text,
  location_area text,
  assigned_to uuid,
  lead_status text NOT NULL DEFAULT 'NEW',
  call_count integer NOT NULL DEFAULT 0,
  last_call_date timestamptz,
  next_followup_date timestamptz,
  call_notes text,
  whatsapp_sent boolean NOT NULL DEFAULT false,
  whatsapp_template_used text,
  whatsapp_sent_at timestamptz,
  whatsapp_opted_out boolean NOT NULL DEFAULT false,
  whatsapp_last_sent timestamptz,
  whatsapp_total_sent integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'MANUAL',
  -- construction lead extras
  plot_length_ft numeric,
  plot_width_ft numeric,
  estimated_area_sqft numeric,
  floors_count integer,
  construction_type text,
  budget_min numeric,
  budget_max numeric,
  timeline_months integer,
  site_visit_done boolean DEFAULT false,
  site_visit_date date,
  soil_test_done boolean DEFAULT false,
  govt_approval_status text,
  assigned_engineer text,
  estimation_status text DEFAULT 'NOT_STARTED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_status ON public.leads(lead_status);
CREATE INDEX idx_leads_mobile ON public.leads(mobile_no);
CREATE TRIGGER leads_set_updated BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads viewable by auth" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage leads" ON public.leads FOR ALL TO authenticated
  USING (
    has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head')
    OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'telecaller_manager')
  )
  WITH CHECK (
    has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'construction_head')
    OR has_role(auth.uid(),'interior_head') OR has_role(auth.uid(),'telecaller_manager')
  );
CREATE POLICY "Telecaller updates own leads" ON public.leads FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

-- LEAD CALLS
CREATE TABLE public.lead_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  caller_id uuid NOT NULL,
  call_result text NOT NULL,
  duration_minutes integer DEFAULT 0,
  notes text,
  status_after text,
  next_followup_date timestamptz,
  whatsapp_sent boolean DEFAULT false,
  whatsapp_template text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_calls_lead ON public.lead_calls(lead_id);
CREATE INDEX idx_calls_caller ON public.lead_calls(caller_id);
ALTER TABLE public.lead_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caller views own calls" ON public.lead_calls FOR SELECT TO authenticated
  USING (
    caller_id = auth.uid() OR has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'telecaller_manager') OR has_role(auth.uid(),'construction_head')
    OR has_role(auth.uid(),'interior_head')
  );
CREATE POLICY "Caller logs own calls" ON public.lead_calls FOR INSERT TO authenticated
  WITH CHECK (caller_id = auth.uid());

-- DAILY TARGETS
CREATE TABLE public.daily_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_date date NOT NULL DEFAULT CURRENT_DATE,
  target_calls integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_date)
);
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Targets viewable by auth" ON public.daily_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage targets" ON public.daily_targets FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'telecaller_manager'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'telecaller_manager'));

-- ACTIVITY LOG
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_created ON public.activity_log(created_at DESC);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity viewable by auth" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert activity" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- APP SETTINGS
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings readable by auth" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages settings" ON public.app_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'material_manager'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'material_manager'));

INSERT INTO public.app_settings(key, value) VALUES
  ('BASE_RATE_RCC','1200'),
  ('BASE_RATE_LOAD_BEARING','900'),
  ('LABOUR_PCT','30'),
  ('OVERHEAD_PCT','10'),
  ('PROFIT_PCT','15');

-- ESTIMATIONS
CREATE TABLE public.lead_estimations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  project_id uuid,
  client_name text NOT NULL,
  area_sqft numeric NOT NULL,
  construction_type text NOT NULL DEFAULT 'RCC',
  civil_cost numeric NOT NULL,
  labour_cost numeric NOT NULL,
  material_cost numeric NOT NULL,
  overhead_cost numeric NOT NULL,
  profit_cost numeric NOT NULL,
  total_cost numeric NOT NULL,
  valid_until date,
  payload jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_estimations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estimations viewable by auth" ON public.lead_estimations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth creates estimations" ON public.lead_estimations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- WHATSAPP TEMPLATES
CREATE TABLE public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'UTILITY',
  body text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  meta_template_name text,
  status text NOT NULL DEFAULT 'DRAFT',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates viewable by auth" ON public.whatsapp_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage templates" ON public.whatsapp_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'telecaller_manager'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'telecaller_manager'));

INSERT INTO public.whatsapp_templates(name, category, body, variables, status) VALUES
  ('INTRO_MESSAGE','UTILITY','Namaskar {{1}} ji, main Wavelength Infratech se bol raha/rahi hoon. Aapka {{2}} ke baare mein enquiry aayi thi. Kya aap baat kar sakte hain?', '["name","lead_type"]', 'DRAFT'),
  ('FOLLOWUP_REMINDER','UTILITY','Namaskar {{1}} ji, aapka followup aaj scheduled hai. Humara team aapse {{2}} baje baat karega.', '["name","time"]', 'DRAFT'),
  ('RATE_CARD','UTILITY','{{1}} ji, aapke liye hamare latest construction material rates bhej rahe hain. Kisi bhi jankaari ke liye call karein - Wavelength Infratech', '["name"]', 'DRAFT'),
  ('VISIT_CONFIRMATION','UTILITY','{{1}} ji, aapki site visit {{2}} ko {{3}} baje confirm ho gayi hai. Pata: {{4}}. Shukriya - Wavelength Infratech', '["name","date","time","address"]', 'DRAFT');

-- WHATSAPP LOGS
CREATE TABLE public.whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  template_id uuid,
  sent_by uuid,
  status text NOT NULL DEFAULT 'QUEUED',
  message_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "WA logs viewable by auth" ON public.whatsapp_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth inserts wa logs" ON public.whatsapp_logs FOR INSERT TO authenticated
  WITH CHECK (sent_by = auth.uid());

-- SEED 5 sample leads (assigned in code after seeding telecallers — leave assigned_to NULL here)
INSERT INTO public.leads(timestamp_text, lead_type, mobile_no, name, village_address, construction_area, location_area, remark, source) VALUES
  ('22/08/2025','MISTRI_CARPENTER','9117487421','Chakalal mali','Pirjalar',NULL,'Pirjalar',NULL,'CSV_IMPORT'),
  ('21/08/2025','HOUSE_OWNER','7693095656','Devindarsing tomar','Pir jalar','2000','Pir jalar',NULL,'CSV_IMPORT'),
  ('23/08/2025','HOUSE_OWNER','9111163687','Ghaur patel','Bhumal was','8000','Bhumal was',NULL,'CSV_IMPORT'),
  ('26/08/2025','CONSTRUCTION_LEAD','8120045147','Radheshyam ji Rathod','Kharsodkala',NULL,'Kharsodkala','Do Makan banana hai','CSV_IMPORT'),
  ('26/08/2025','PLANNING','9009504258','Lokendra ji shaktawat','Gavdi devsi',NULL,'Gavdi devsi','30x40 ka Banavana hain','CSV_IMPORT');
