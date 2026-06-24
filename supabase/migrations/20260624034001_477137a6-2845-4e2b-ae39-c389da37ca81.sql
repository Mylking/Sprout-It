
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description text,
  full_description text,
  material text,
  process text,
  use_case text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read published" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "products admin read all" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images public read" ON public.product_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published = true));
CREATE POLICY "product_images admin read" ON public.product_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "product_images admin write" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Inquiries
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_interest text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit inquiry" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Industrial Prototyping', 'industrial-prototyping', 'Functional prototypes engineered for real-world testing and validation.', 1),
  ('Precision Custom Parts & 3D Printing', '3d-printing', 'High-accuracy parts made with FDM, SLA, and SLS processes.', 2),
  ('Bespoke Gifts & Souvenirs', 'bespoke-gifts', 'Custom-crafted gifts and corporate souvenirs with a story.', 3),
  ('Idea-to-Design Consulting', 'consulting', 'From rough sketch to manufacture-ready CAD, engineered with you.', 4);

-- Seed products
WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (title, slug, category_id, short_description, full_description, material, process, use_case, is_featured, is_published, display_order)
VALUES
  ('Hydraulic Valve Housing Prototype', 'hydraulic-valve-housing', (SELECT id FROM c WHERE slug='industrial-prototyping'),
   'A pressure-tested valve housing prototype delivered in 9 days for a marine equipment client.',
   'Engineered from a hand sketch into a fully validated prototype. FEA-simulated to 200 bar before fabrication. Material chosen for thermal stability in saltwater environments.',
   'Aluminum 6061 + PETG Inserts', 'CNC Milling + FDM 3D Printing', 'Functional pre-production prototype', true, true, 1),
  ('Robotic Arm Gripper Assembly', 'robotic-arm-gripper', (SELECT id FROM c WHERE slug='industrial-prototyping'),
   'A modular end-effector for a research lab, iterated across three design sprints.',
   'Three printed variants tested for grip force and weight. Final assembly uses carbon-infused nylon for stiffness and steel pins for pivot longevity.',
   'Carbon-Filled Nylon, Steel Pins', 'SLS 3D Printing + Hand Assembly', 'Research & development', false, true, 2),
  ('Aerospace Bracket Replacement', 'aerospace-bracket', (SELECT id FROM c WHERE slug='3d-printing'),
   'A discontinued bracket reverse-engineered and 3D-printed to OEM tolerances.',
   'Original part scanned, mesh cleaned, and printed in flame-retardant nylon. Holes reamed to ±0.05mm and bracket weight reduced by 18%.',
   'Flame-Retardant PA12', 'SLS 3D Printing', 'Legacy replacement part', true, true, 3),
  ('Custom Drone Frame v3', 'custom-drone-frame', (SELECT id FROM c WHERE slug='3d-printing'),
   'A topology-optimized FPV drone frame printed in carbon-PA for an indie racing team.',
   'Stress paths visualized, mass cut by 22%, and stiffness improved at the motor mounts. Printed as a single piece with no fasteners required for the chassis.',
   'Carbon PA12', 'SLS 3D Printing', 'Hobby & racing', false, true, 4),
  ('Engraved Brass Desk Compass', 'brass-desk-compass', (SELECT id FROM c WHERE slug='bespoke-gifts'),
   'A weighted brass compass with hand-engraved compass rose, gifted to a retiring captain.',
   'Cast in solid brass, hand-polished, and rotary-engraved with custom initials and coordinates. Walnut base finished with hard wax oil.',
   'Solid Brass + Walnut', 'Sand Casting + CNC Engraving', 'Personal commemoration', true, true, 5),
  ('Architectural Model Set', 'architectural-model-set', (SELECT id FROM c WHERE slug='bespoke-gifts'),
   'A 1:200 scale set of nine heritage buildings, commissioned as a wedding gift.',
   'Each building printed individually, sanded, primed, and hand-painted in muted earth tones. Mounted on a laser-engraved cork base map.',
   'Resin + Painted Finish', 'SLA 3D Printing + Hand Finishing', 'Premium gift / commemoration', false, true, 6),
  ('Smart Beehive Sensor Mount', 'beehive-sensor-mount', (SELECT id FROM c WHERE slug='consulting'),
   'From idea to weather-sealed enclosure for a beekeeping startup\u2019s sensor platform.',
   'Co-designed across two workshops. Final enclosure is IP65, snap-fit, and field-replaceable without tools. Onboarded to a contract manufacturer.',
   'ASA + EPDM Gasket', 'FDM 3D Printing + Tooling Handoff', 'Pre-production consulting', true, true, 7),
  ('Pottery Wheel Foot Pedal', 'pottery-wheel-foot-pedal', (SELECT id FROM c WHERE slug='consulting'),
   'Re-engineered an artisan\u2019s decades-old wooden pedal into a quieter, sealed unit.',
   'Original ergonomics preserved. Internal mechanism reworked with sealed bearings and a magnetic position sensor. Cherry-wood shell maintains the heirloom feel.',
   'Cherry Wood + Stainless Steel', 'CNC Milling + Custom Electronics', 'Artisan tooling redesign', false, true, 8);
