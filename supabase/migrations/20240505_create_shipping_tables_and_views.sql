-- Create function to create reusable_packages table if it doesn't exist
CREATE OR REPLACE FUNCTION create_reusable_packages_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reusable_packages') THEN
    CREATE TABLE public.reusable_packages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      material TEXT,
      dimensions JSONB,
      weight_capacity FLOAT,
      status TEXT DEFAULT 'available',
      purchase_date TIMESTAMP WITH TIME ZONE,
      reuse_count INTEGER DEFAULT 0,
      expected_lifetime INTEGER,
      last_used TIMESTAMP WITH TIME ZONE,
      iot_enabled BOOLEAN DEFAULT FALSE,
      iot_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE public.reusable_packages ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow all authenticated users to view packages
    CREATE POLICY "Allow all authenticated users to view packages" 
      ON public.reusable_packages FOR SELECT 
      USING (auth.role() = 'authenticated');
      
    -- Create policy to allow all authenticated users to insert packages
    CREATE POLICY "Allow all authenticated users to insert packages" 
      ON public.reusable_packages FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      
    -- Create policy to allow all authenticated users to update packages
    CREATE POLICY "Allow all authenticated users to update packages" 
      ON public.reusable_packages FOR UPDATE 
      USING (auth.role() = 'authenticated');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to create shipping table if it doesn't exist
CREATE OR REPLACE FUNCTION create_shipping_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shipping') THEN
    CREATE TABLE public.shipping (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tracking_number TEXT,
      status TEXT,
      carrier TEXT,
      weight FLOAT,
      dimensions JSONB,
      shipping_cost FLOAT,
      currency TEXT DEFAULT 'USD',
      shipping_date TIMESTAMP WITH TIME ZONE,
      estimated_delivery TIMESTAMP WITH TIME ZONE,
      actual_delivery TIMESTAMP WITH TIME ZONE,
      origin_address JSONB,
      destination_address JSONB,
      package_ids TEXT[],
      iot_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE public.shipping ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow all authenticated users to view shipments
    CREATE POLICY "Allow all authenticated users to view shipments" 
      ON public.shipping FOR SELECT 
      USING (auth.role() = 'authenticated');
      
    -- Create policy to allow all authenticated users to insert shipments
    CREATE POLICY "Allow all authenticated users to insert shipments" 
      ON public.shipping FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      
    -- Create policy to allow all authenticated users to update shipments
    CREATE POLICY "Allow all authenticated users to update shipments" 
      ON public.shipping FOR UPDATE 
      USING (auth.role() = 'authenticated');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to create shipping analytics views
CREATE OR REPLACE FUNCTION create_shipping_analytics_views()
RETURNS void AS $$
BEGIN
  -- Drop views if they exist
  DROP VIEW IF EXISTS public.shipping_analytics;
  DROP VIEW IF EXISTS public.package_utilization;
  
  -- Create shipping_analytics view
  CREATE VIEW public.shipping_analytics AS
  SELECT 
    date_trunc('day', shipping_date) AS day,
    COUNT(*) AS total_shipments,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
    SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) AS in_transit,
    SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) AS delayed,
    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
    SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned,
    AVG(weight) AS avg_weight,
    AVG(shipping_cost) AS avg_cost
  FROM 
    public.shipping
  GROUP BY 
    date_trunc('day', shipping_date)
  ORDER BY 
    day DESC;
  
  -- Create package_utilization view
  CREATE VIEW public.package_utilization AS
  SELECT 
    rp.id,
    rp.name,
    rp.material,
    rp.reuse_count,
    rp.expected_lifetime,
    COUNT(s.id) AS shipment_count,
    MAX(s.shipping_date) AS last_used_date,
    CASE 
      WHEN rp.expected_lifetime > 0 THEN 
        (rp.reuse_count::float / rp.expected_lifetime::float) * 100 
      ELSE 0 
    END AS utilization_percentage,
    CASE 
      WHEN rp.purchase_date IS NOT NULL THEN 
        EXTRACT(DAY FROM NOW() - rp.purchase_date) 
      ELSE 0 
    END AS days_since_purchase,
    CASE 
      WHEN rp.reuse_count > 0 AND EXTRACT(DAY FROM NOW() - rp.purchase_date) > 0 THEN 
        rp.reuse_count / (EXTRACT(DAY FROM NOW() - rp.purchase_date) / 30) 
      ELSE 0 
    END AS reuses_per_month
  FROM 
    public.reusable_packages rp
  LEFT JOIN 
    public.shipping s ON rp.id = ANY(s.package_ids)
  GROUP BY 
    rp.id, rp.name, rp.material, rp.reuse_count, rp.expected_lifetime, rp.purchase_date;
  
  -- Grant permissions
  GRANT SELECT ON public.shipping_analytics TO authenticated;
  GRANT SELECT ON public.package_utilization TO authenticated;
END;
$$ LANGUAGE plpgsql;
