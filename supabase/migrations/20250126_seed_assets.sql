-- Seed assets table with sample data for user 5f25847f-0509-496a-9a9b-9f07dad36ab2

-- Only insert if assets don't already exist for this user
DO $$
BEGIN
  -- Check if assets already exist for this user
  IF NOT EXISTS (
    SELECT 1 FROM assets WHERE user_id = '5f25847f-0509-496a-9a9b-9f07dad36ab2' LIMIT 1
  ) THEN
    -- Insert sample assets
    INSERT INTO assets (
      id,
      asset_id,
      name,
      description,
      asset_type,
      category,
      status,
      location_id,
      current_location,
      specifications,
      purchase_date,
      purchase_cost,
      depreciation_rate,
      current_value,
      maintenance_schedule,
      compliance_data,
      esg_metrics,
      iot_sensor_id,
      nfc_tag_id,
      qr_code,
      metadata,
      user_id,
      created_at,
      updated_at
    ) VALUES
    -- Equipment Assets
    (
      gen_random_uuid(),
      'AST-EQ-001',
      'Industrial Forklift FL-2000',
      'Heavy-duty electric forklift with 2-ton capacity, used in warehouse operations',
      'equipment',
      'Material Handling',
      'active',
      NULL, -- Set location_id to NULL to avoid foreign key constraint
      '{"building": "Warehouse A", "floor": 1, "zone": "Loading Bay", "coordinates": {"lat": 37.7749, "lng": -122.4194}}'::jsonb,
      '{"capacity": "2000kg", "lift_height": "5m", "power_type": "electric", "battery_capacity": "48V 500Ah", "weight": "3500kg", "iot_sensor_id": "IOT-FL-2000-001"}'::jsonb,
      '2023-01-15',
      45000.00,
      15.0,
      38250.00,
      '[{"type": "preventive", "frequency": "monthly", "last_service": "2025-01-10", "next_service": "2025-02-10"}]'::jsonb,
      '{"osha_compliant": true, "last_inspection": "2025-01-05", "certifications": ["ISO 9001", "CE"]}'::jsonb,
      '{"carbon_footprint": "low", "energy_efficiency": "A+", "recyclable_materials": 85}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL to avoid foreign key constraint, moved to specifications
      'NFC-FL-001',
      'QR-FL-2000-001',
      '{"manufacturer": "Toyota Material Handling", "model": "8FBE20U", "serial_number": "FL2000-2023-001", "warranty_expiry": "2026-01-15"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'AST-EQ-002',
      'CNC Milling Machine M-500',
      'Precision CNC milling machine for metal fabrication and prototyping',
      'equipment',
      'Manufacturing',
      'active',
      NULL, -- Set location_id to NULL
      '{"building": "Factory B", "floor": 2, "zone": "Production Line 3", "coordinates": {"lat": 37.7750, "lng": -122.4195}}'::jsonb,
      '{"work_area": "500x400x300mm", "spindle_speed": "12000rpm", "accuracy": "0.005mm", "power": "7.5kW", "iot_sensor_id": "IOT-CNC-500-001"}'::jsonb,
      '2022-06-20',
      125000.00,
      10.0,
      112500.00,
      '[{"type": "preventive", "frequency": "quarterly", "last_service": "2024-12-15", "next_service": "2025-03-15"}]'::jsonb,
      '{"iso_certified": true, "last_calibration": "2024-12-01", "certifications": ["ISO 9001", "CE", "UL"]}'::jsonb,
      '{"energy_consumption": "medium", "waste_reduction": 75, "recyclable_materials": 90}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      'NFC-CNC-001',
      'QR-CNC-500-001',
      '{"manufacturer": "Haas Automation", "model": "VF-2SS", "serial_number": "CNC500-2022-001", "warranty_expiry": "2025-06-20"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Vehicle Assets
    (
      gen_random_uuid(),
      'AST-VH-001',
      'Delivery Van - Ford Transit',
      'Commercial delivery van for last-mile logistics and customer deliveries',
      'vehicle',
      'Transportation',
      'active',
      NULL, -- Set location_id to NULL
      '{"building": "Fleet Yard", "parking_spot": "A-12", "coordinates": {"lat": 37.7751, "lng": -122.4196}}'::jsonb,
      '{"make": "Ford", "model": "Transit 350", "year": 2023, "capacity": "3500kg", "fuel_type": "diesel", "mileage": "45000km", "iot_sensor_id": "IOT-VH-TRANSIT-001"}'::jsonb,
      '2023-03-10',
      42000.00,
      20.0,
      33600.00,
      '[{"type": "oil_change", "frequency": "every_5000km", "last_service": "2025-01-08", "next_service_km": "50000"}]'::jsonb,
      '{"registration": "CA-ABC-1234", "insurance_expiry": "2025-12-31", "emissions_test": "passed", "last_inspection": "2025-01-01"}'::jsonb,
      '{"fuel_efficiency": "8.5L/100km", "co2_emissions": "225g/km", "euro_standard": "Euro 6"}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      'NFC-VH-001',
      'QR-VH-TRANSIT-001',
      '{"vin": "1FTBW3XM5PKA12345", "license_plate": "CA-ABC-1234", "insurance_provider": "State Farm", "policy_number": "SF-2023-12345"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Container Assets
    (
      gen_random_uuid(),
      'AST-CN-001',
      'Shipping Container 40ft HC',
      'High-cube 40-foot shipping container for international freight',
      'container',
      'Logistics',
      'active',
      NULL, -- Set location_id to NULL
      '{"terminal": "Port Terminal 5", "row": "C", "stack": 3, "coordinates": {"lat": 37.7752, "lng": -122.4197}}'::jsonb,
      '{"length": "40ft", "width": "8ft", "height": "9.6ft", "capacity": "76.3m3", "max_payload": "26700kg", "tare_weight": "3800kg", "iot_sensor_id": "IOT-CN-40HC-001"}'::jsonb,
      '2021-08-15',
      3500.00,
      5.0,
      3325.00,
      '[{"type": "inspection", "frequency": "annual", "last_inspection": "2024-08-10", "next_inspection": "2025-08-10"}]'::jsonb,
      '{"csc_plate": "valid", "last_inspection": "2024-08-10", "certifications": ["ISO 6346", "CSC"]}'::jsonb,
      '{"recyclable": true, "material": "corten_steel", "lifespan": "20_years"}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      'NFC-CN-001',
      'QR-CN-40HC-001',
      '{"container_number": "MSCU1234567", "owner": "Maersk", "type": "40HC", "build_year": 2021}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Device Assets
    (
      gen_random_uuid(),
      'AST-DV-001',
      'Industrial IoT Gateway',
      'Edge computing gateway for IoT sensor data aggregation and processing',
      'device',
      'IoT Infrastructure',
      'active',
      NULL, -- Set location_id to NULL
      '{"building": "Data Center 1", "rack": "R-15", "unit": "U-24", "coordinates": {"lat": 37.7753, "lng": -122.4198}}'::jsonb,
      '{"processor": "ARM Cortex-A72", "ram": "4GB", "storage": "64GB eMMC", "connectivity": ["Ethernet", "WiFi", "4G LTE", "LoRaWAN"], "power": "12V DC", "iot_sensor_id": "IOT-GW-001"}'::jsonb,
      '2023-09-01',
      850.00,
      25.0,
      637.50,
      '[{"type": "firmware_update", "frequency": "quarterly", "last_update": "2024-12-20", "next_update": "2025-03-20"}]'::jsonb,
      '{"fcc_certified": true, "ce_marked": true, "ip_rating": "IP65"}'::jsonb,
      '{"power_consumption": "5W", "recyclable_materials": 70, "rohs_compliant": true}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      'NFC-GW-001',
      'QR-GW-001',
      '{"manufacturer": "Advantech", "model": "UNO-2483G", "serial_number": "GW-2023-001", "firmware_version": "v2.4.1"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Infrastructure Assets
    (
      gen_random_uuid(),
      'AST-IN-001',
      'Solar Panel Array - Roof Installation',
      '100kW solar panel installation on warehouse roof for renewable energy generation',
      'infrastructure',
      'Renewable Energy',
      'active',
      NULL, -- Set location_id to NULL
      '{"building": "Warehouse A", "location": "Roof", "area": "500m2", "coordinates": {"lat": 37.7754, "lng": -122.4199}}'::jsonb,
      '{"capacity": "100kW", "panel_count": 300, "panel_type": "monocrystalline", "efficiency": "21%", "inverter": "SMA Sunny Tripower 100kW", "iot_sensor_id": "IOT-SOLAR-001"}'::jsonb,
      '2022-04-01',
      150000.00,
      3.0,
      145500.00,
      '[{"type": "cleaning", "frequency": "quarterly", "last_service": "2024-12-15", "next_service": "2025-03-15"}, {"type": "inspection", "frequency": "annual", "last_inspection": "2024-11-01", "next_inspection": "2025-11-01"}]'::jsonb,
      '{"grid_connected": true, "permits": ["building", "electrical"], "certifications": ["IEC 61215", "IEC 61730"]}'::jsonb,
      '{"annual_generation": "140000kWh", "co2_offset": "70_tons/year", "roi_period": "7_years"}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      NULL,
      'QR-SOLAR-001',
      '{"installer": "SunPower", "warranty": "25_years_performance", "monitoring_system": "SolarEdge", "grid_connection_date": "2022-05-15"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Inventory Assets
    (
      gen_random_uuid(),
      'AST-IV-001',
      'Pallet Racking System - Aisle 5',
      'Heavy-duty pallet racking system for warehouse storage optimization',
      'inventory',
      'Storage Systems',
      'active',
      NULL, -- Set location_id to NULL
      '{"building": "Warehouse A", "aisle": 5, "bays": 20, "coordinates": {"lat": 37.7755, "lng": -122.4200}}'::jsonb,
      '{"height": "8m", "bays": 20, "levels": 4, "capacity_per_level": "2000kg", "total_capacity": "160000kg"}'::jsonb,
      '2021-11-10',
      25000.00,
      10.0,
      22500.00,
      '[{"type": "safety_inspection", "frequency": "annual", "last_inspection": "2024-11-05", "next_inspection": "2025-11-05"}]'::jsonb,
      '{"load_tested": true, "last_test": "2024-11-05", "certifications": ["RMI", "SEMA"], "safety_compliant": true}'::jsonb,
      '{"material": "steel", "recyclable": true, "lifespan": "20_years"}'::jsonb,
      NULL,
      'NFC-RACK-001',
      'QR-RACK-001',
      '{"manufacturer": "Dexion", "model": "Speedlock", "installation_date": "2021-11-10", "color": "orange"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    ),

    -- Additional Equipment in Maintenance
    (
      gen_random_uuid(),
      'AST-EQ-003',
      'Air Compressor AC-750',
      'Industrial air compressor for pneumatic tools and equipment',
      'equipment',
      'Utilities',
      'maintenance',
      NULL, -- Set location_id to NULL
      '{"building": "Factory B", "floor": 1, "zone": "Utility Room", "coordinates": {"lat": 37.7756, "lng": -122.4201}}'::jsonb,
      '{"capacity": "750L/min", "pressure": "10bar", "power": "15kW", "tank_size": "500L", "type": "screw_compressor", "iot_sensor_id": "IOT-AC-750-001"}'::jsonb,
      '2020-02-20',
      18000.00,
      12.0,
      15840.00,
      '[{"type": "oil_change", "frequency": "every_2000h", "last_service": "2024-12-01", "next_service_hours": "10000"}]'::jsonb,
      '{"pressure_tested": true, "last_test": "2024-12-01", "certifications": ["ASME", "CE"]}'::jsonb,
      '{"energy_efficiency": "B", "noise_level": "75dB", "oil_free": false}'::jsonb,
      NULL, -- Set iot_sensor_id to NULL
      'NFC-AC-001',
      'QR-AC-750-001',
      '{"manufacturer": "Atlas Copco", "model": "GA 75", "serial_number": "AC750-2020-001", "maintenance_contract": "active"}'::jsonb,
      '5f25847f-0509-496a-9a9b-9f07dad36ab2',
      NOW(),
      NOW()
    );
  END IF;
END $$;
