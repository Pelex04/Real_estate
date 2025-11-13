/*
  # Real Estate Properties Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text) - Property title
      - `description` (text) - Full property description
      - `price` (numeric) - Property price
      - `type` (text) - Property type (sale/rent)
      - `category` (text) - Property category (house/apartment/land/commercial)
      - `bedrooms` (integer) - Number of bedrooms
      - `bathrooms` (integer) - Number of bathrooms
      - `area_sqm` (numeric) - Property area in square meters
      - `location` (text) - Property location/address
      - `city` (text) - City name
      - `latitude` (numeric) - GPS latitude for map
      - `longitude` (numeric) - GPS longitude for map
      - `featured` (boolean) - Whether property is featured
      - `status` (text) - available/sold/rented
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `property_images`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `image_url` (text) - Image URL
      - `is_primary` (boolean) - Primary display image
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)

    - `contact_inquiries`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `name` (text) - Inquirer name
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `message` (text) - Inquiry message
      - `status` (text) - new/contacted/closed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for properties and images
    - Authenticated users can submit contact inquiries
    - Only authenticated users can manage properties
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('sale', 'rent')),
  category text NOT NULL CHECK (category IN ('house', 'apartment', 'land', 'commercial')),
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area_sqm numeric NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  latitude numeric,
  longitude numeric,
  featured boolean DEFAULT false,
  status text DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available properties"
  ON properties FOR SELECT
  USING (status = 'available' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage property images"
  ON property_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can submit contact inquiries"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all inquiries"
  ON contact_inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update inquiry status"
  ON contact_inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_property_id ON contact_inquiries(property_id);