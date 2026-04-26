-- Fix search_path on helper function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Seed categories
INSERT INTO public.pricing_categories (name, sort_order) VALUES
  ('Tiles', 1),
  ('Paint', 2),
  ('Cement', 3),
  ('Steel', 4),
  ('Sand', 5),
  ('Aggregate', 6),
  ('Labour', 7),
  ('Misc', 8)
ON CONFLICT (name) DO NOTHING;

-- Seed pricing items
INSERT INTO public.pricing_items (category_id, name, unit, rate, vendor, notes)
SELECT c.id, v.name, v.unit, v.rate, v.vendor, v.notes
FROM public.pricing_categories c
JOIN (VALUES
  ('Tiles', 'Vitrified Tiles 600x600', 'sqft', 100.00, 'Kajaria', 'Glossy finish'),
  ('Tiles', 'Ceramic Wall Tile', 'sqft', 55.00, 'Somany', 'Bathroom grade'),
  ('Tiles', 'Marble Italian', 'sqft', 320.00, 'Local', 'Premium'),
  ('Paint', 'JSW Primer', 'litre', 125.00, 'JSW Paints', 'Wall primer'),
  ('Paint', 'Asian Apex Ultima', 'litre', 480.00, 'Asian Paints', 'Exterior emulsion'),
  ('Paint', 'Berger Silk', 'litre', 360.00, 'Berger', 'Interior silk'),
  ('Cement', 'OPC 53 Grade Bag', 'bag', 380.00, 'UltraTech', '50 kg'),
  ('Cement', 'PPC Bag', 'bag', 360.00, 'ACC', '50 kg'),
  ('Steel', 'TMT Bar Fe550', 'kg', 62.00, 'JSW Steel', '8mm-32mm'),
  ('Sand', 'River Sand', 'cft', 65.00, 'Local Quarry', 'Fine grade'),
  ('Sand', 'M-Sand', 'cft', 45.00, 'Local Quarry', 'Manufactured'),
  ('Aggregate', '20mm Aggregate', 'cft', 55.00, 'Local Quarry', 'Crushed'),
  ('Aggregate', '10mm Aggregate', 'cft', 60.00, 'Local Quarry', 'Crushed'),
  ('Labour', 'Mason (Mistri)', 'day', 800.00, NULL, 'Skilled'),
  ('Labour', 'Helper (Beldar)', 'day', 550.00, NULL, 'Unskilled'),
  ('Labour', 'Tile Layer', 'day', 1000.00, NULL, 'Skilled'),
  ('Labour', 'Painter', 'day', 900.00, NULL, 'Skilled'),
  ('Labour', 'Bar Bender', 'day', 950.00, NULL, 'Skilled'),
  ('Misc', 'Waterproofing Compound', 'kg', 220.00, 'Dr Fixit', 'LW+')
) AS v(category, name, unit, rate, vendor, notes) ON v.category = c.name;

-- Seed projects
INSERT INTO public.projects (name, location, status, budget) VALUES
  ('Wavelength Residency MP', 'Indore, Madhya Pradesh', 'active', 25000000),
  ('Dholera Smart City Block A', 'Dholera, Gujarat', 'active', 48000000),
  ('Bhopal Commercial Tower', 'Bhopal, Madhya Pradesh', 'planning', 18000000)
ON CONFLICT DO NOTHING;