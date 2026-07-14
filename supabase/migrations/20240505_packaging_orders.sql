-- Create packaging_orders table
CREATE TABLE IF NOT EXISTS public.packaging_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('standard', 'custom')),
  material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('pp_woven', 'pp_nonwoven', 'laminated_rubber', 'other')),
  dimensions JSONB,
  quantity INTEGER NOT NULL,
  has_iot_sensors BOOLEAN DEFAULT false,
  iot_sensor_count INTEGER DEFAULT 0,
  special_instructions TEXT,
  design_data JSONB,
  design_files JSONB[],
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.packaging_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own packaging orders"
  ON public.packaging_orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packaging orders"
  ON public.packaging_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packaging orders"
  ON public.packaging_orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create packaging_order_items table for tracking individual items in an order
CREATE TABLE IF NOT EXISTS public.packaging_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.packaging_orders(id) ON DELETE CASCADE,
  package_type VARCHAR(100) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  dimensions JSONB,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  has_iot_sensors BOOLEAN DEFAULT false,
  iot_sensor_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for order items
ALTER TABLE public.packaging_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own packaging order items"
  ON public.packaging_order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.packaging_orders
    WHERE public.packaging_orders.id = public.packaging_order_items.order_id
    AND public.packaging_orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own packaging order items"
  ON public.packaging_order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.packaging_orders
    WHERE public.packaging_orders.id = public.packaging_order_items.order_id
    AND public.packaging_orders.user_id = auth.uid()
  ));

-- Create relationship between packaging orders and reusable packages
ALTER TABLE public.reusable_packages
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.packaging_orders(id) ON DELETE SET NULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER update_packaging_orders_updated_at
BEFORE UPDATE ON public.packaging_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create view for order analytics
CREATE OR REPLACE VIEW packaging_order_analytics AS
SELECT
  date_trunc('month', created_at) as order_month,
  order_type,
  material_type,
  COUNT(*) as order_count,
  SUM(quantity) as total_quantity,
  SUM(total_price) as total_revenue,
  COUNT(CASE WHEN has_iot_sensors THEN 1 END) as orders_with_iot,
  SUM(iot_sensor_count) as total_iot_sensors
FROM
  public.packaging_orders
GROUP BY
  date_trunc('month', created_at),
  order_type,
  material_type;
