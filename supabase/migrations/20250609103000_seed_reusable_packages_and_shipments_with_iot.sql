-- Seed Reusable Packages and Shipments with IoT Data

-- Ensure the uuid-ossp extension is available for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    -- Placeholder User ID for seeding
    seed_user_id UUID := '00000000-0000-0000-0000-000000000001';

    -- Reusable Package IDs (UUIDs)
    package1_uuid UUID := uuid_generate_v4();
    package2_uuid UUID := uuid_generate_v4();
    package3_uuid UUID := uuid_generate_v4();
    package4_uuid UUID := uuid_generate_v4();

    -- IoT Sensor IDs
    pkg1_iot_sensor_id TEXT := 'IOT-PKG-S001';
    pkg2_iot_sensor_id TEXT := 'IOT-PKG-R002';
    pkg4_iot_sensor_id TEXT := 'IOT-PKG-M004';

    shipment1_iot_sensor_id TEXT := 'IOT-SHP-001';
    shipment2_iot_sensor_id TEXT := 'IOT-SHP-002';
    shipment3_iot_sensor_id TEXT := 'IOT-SHP-003';
    shipment4_iot_sensor_id TEXT := 'IOT-SHP-004';

    -- Timestamps for consistent data
    current_ts TIMESTAMPTZ := NOW();
    shipping_date1 TIMESTAMPTZ := current_ts - INTERVAL '10 days';
    shipping_date2 TIMESTAMPTZ := current_ts - INTERVAL '5 days';
    shipping_date3 TIMESTAMPTZ := current_ts - INTERVAL '3 days';
    shipping_date4 TIMESTAMPTZ := current_ts - INTERVAL '1 day';
BEGIN

    -- Seed Reusable Packages
    INSERT INTO public.reusable_packages (
        id, package_id, name, description, dimensions, weight_capacity, material, reuse_count, status, location_id, metadata, created_at, updated_at, iot_sensor_id
    ) VALUES
    (
        package1_uuid, 'RPK-STD-0001', 'Standard Reusable Box Alpha', 'Durable cardboard box for general goods, IoT enabled.',
        '{"length": 50, "width": 30, "height": 25, "unit": "cm"}', 20.0, 'Reinforced Cardboard', 5, 'available', NULL,
        '{
            "manufacturer": "EcoPack Solutions", "purchase_date": "2024-01-15T00:00:00Z", "expected_lifetime_reuses": 50, 
            "iot_data": {"sensor_type": "basic_tracker", "battery_level": 85, "last_maintenance": "2025-05-01T00:00:00Z"}
        }',
        current_ts - INTERVAL '150 days', current_ts, pkg1_iot_sensor_id
    ),
    (
        package2_uuid, 'RPK-INS-0002', 'Insulated Reusable Container Beta', 'EPS foam container for temperature-sensitive items, IoT enabled.',
        '{"length": 60, "width": 40, "height": 40, "unit": "cm"}', 15.0, 'EPS Foam with Hard Shell', 2, 'in_use', NULL,
        '{
            "manufacturer": "ColdChain Secure", "purchase_date": "2024-03-10T00:00:00Z", "expected_lifetime_reuses": 75,
            "iot_data": {"sensor_type": "temp_humidity_tracker", "battery_level": 92, "last_maintenance": "2025-05-15T00:00:00Z"}
        }',
        current_ts - INTERVAL '90 days', current_ts, pkg2_iot_sensor_id
    ),
    (
        package3_uuid, 'RPK-PLT-0003', 'Small Plastic Tote Gamma', 'Small HDPE plastic tote for components.',
        '{"length": 30, "width": 20, "height": 15, "unit": "cm"}', 10.0, 'HDPE Plastic', 12, 'available', NULL,
        '{
            "manufacturer": "DuraTotes Inc.", "purchase_date": "2023-11-20T00:00:00Z", "expected_lifetime_reuses": 100
        }',
        current_ts - INTERVAL '200 days', current_ts, NULL -- No dedicated IoT sensor for this package
    ),
    (
        package4_uuid, 'RPK-MED-0004', 'Medium Reusable Crate Delta', 'Medium crate for pharmaceuticals, IoT enabled.',
        '{"length": 45, "width": 35, "height": 30, "unit": "cm"}', 18.0, 'Medical Grade Polymer', 0, 'available', NULL,
        '{
            "manufacturer": "PharmaSecure", "purchase_date": "2025-04-01T00:00:00Z", "expected_lifetime_reuses": 60,
            "iot_data": {"sensor_type": "advanced_pharma_tracker", "battery_level": 98, "last_maintenance": "2025-06-01T00:00:00Z"}
        }',
        current_ts - INTERVAL '70 days', current_ts, pkg4_iot_sensor_id
    );

    -- Seed Shipments
    -- Shipment 1: Normal transit, uses Package 1
    INSERT INTO public.shipping (
        id, user_id, tracking_number, status, origin_address, destination_address, shipping_date, estimated_delivery, actual_delivery, carrier, service_level, package_ids, weight, dimensions, shipping_cost, currency, notes, public_id, iot_sensor_id, iot_data, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), seed_user_id, 'FDX100000001', 'delivered',
        '{"name": "Warehouse A", "street": "123 Origin Dr", "city": "Originville", "state": "CA", "zip": "90001", "country": "US"}',
        '{"name": "Customer X", "street": "456 Destination Rd", "city": "Destinburg", "state": "NY", "zip": "10001", "country": "US"}',
        shipping_date1, shipping_date1 + INTERVAL '5 days', shipping_date1 + INTERVAL '4 days' + INTERVAL '8 hours', 'FedEx', 'Standard',
        jsonb_build_array(package1_uuid), 21.5, '{"length": 52, "width": 32, "height": 27, "unit": "cm"}', 25.50, 'USD', 'Standard delivery of electronics.',
        SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 8), shipment1_iot_sensor_id,
        '{
            "device_id": "' || shipment1_iot_sensor_id || '",
            "sensor_type": "multi_sensor_v1",
            "is_refrigerated": false,
            "location_tracking": [
                {"timestamp": "' || (shipping_date1)::text || '", "latitude": 34.0522, "longitude": -118.2437, "accuracy": 10, "facility_type": "origin_warehouse"},
                {"timestamp": "' || (shipping_date1 + INTERVAL '1 day')::text || '", "latitude": 34.5514, "longitude": -117.2930, "accuracy": 50, "facility_type": "transit_hub_barstow"},
                {"timestamp": "' || (shipping_date1 + INTERVAL '3 days')::text || '", "latitude": 39.7392, "longitude": -104.9903, "accuracy": 20, "facility_type": "transit_hub_denver"},
                {"timestamp": "' || (shipping_date1 + INTERVAL '4 days' + INTERVAL '8 hours')::text || '", "latitude": 40.7128, "longitude": -74.0060, "accuracy": 5, "facility_type": "destination_customer"}
            ],
            "sensor_readings": [
                {"timestamp": "' || (shipping_date1 + INTERVAL '6 hours')::text || '", "temperature": {"value": 22.5, "unit": "C"}, "humidity": {"value": 45.0, "unit": "%"}, "pressure": {"value": 1012, "unit": "hPa"}, "shock": {"value": 0.5, "unit": "G"}, "light": {"value": 10, "unit": "lux"}, "battery": {"value": 98, "unit": "%"}},
                {"timestamp": "' || (shipping_date1 + INTERVAL '2 days')::text || '", "temperature": {"value": 18.0, "unit": "C"}, "humidity": {"value": 50.0, "unit": "%"}, "pressure": {"value": 1005, "unit": "hPa"}, "shock": {"value": 0.2, "unit": "G"}, "light": {"value": 5, "unit": "lux"}, "battery": {"value": 95, "unit": "%"}}
            ],
            "alerts": []
        }',
        shipping_date1, current_ts
    );

    -- Shipment 2: Refrigerated, temperature alert, uses Package 2
    INSERT INTO public.shipping (
        id, user_id, tracking_number, status, origin_address, destination_address, shipping_date, estimated_delivery, actual_delivery, carrier, service_level, package_ids, weight, dimensions, shipping_cost, currency, notes, public_id, iot_sensor_id, iot_data, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), seed_user_id, 'UPS200000002', 'in_transit',
        '{"name": "Pharma Cold Storage", "street": "789 Cold St", "city": "Frostville", "state": "IL", "zip": "60607", "country": "US"}',
        '{"name": "City Hospital", "street": "101 Health Ave", "city": "Welltown", "state": "FL", "zip": "33101", "country": "US"}',
        shipping_date2, shipping_date2 + INTERVAL '3 days', NULL, 'UPS', 'Priority ColdChain',
        jsonb_build_array(package2_uuid), 16.0, '{"length": 62, "width": 42, "height": 42, "unit": "cm"}', 120.75, 'USD', 'Urgent medical supplies, requires 2-8°C.',
        SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 8), shipment2_iot_sensor_id,
        '{
            "device_id": "' || shipment2_iot_sensor_id || '",
            "sensor_type": "pharma_temp_logger_v3",
            "is_refrigerated": true,
            "location_tracking": [
                {"timestamp": "' || (shipping_date2)::text || '", "latitude": 41.8781, "longitude": -87.6298, "accuracy": 8, "facility_type": "origin_cold_storage"},
                {"timestamp": "' || (shipping_date2 + INTERVAL '12 hours')::text || '", "latitude": 39.9526, "longitude": -75.1652, "accuracy": 15, "facility_type": "airport_transfer_phl"},
                {"timestamp": "' || (shipping_date2 + INTERVAL '1 day' + INTERVAL '18 hours')::text || '", "latitude": 25.7617, "longitude": -80.1918, "accuracy": 10, "facility_type": "destination_airport_mia"}
            ],
            "sensor_readings": [
                {"timestamp": "' || (shipping_date2 + INTERVAL '2 hours')::text || '", "temperature": {"value": 4.5, "unit": "C"}, "humidity": {"value": 60.0, "unit": "%"}, "pressure": {"value": 1010, "unit": "hPa"}, "shock": {"value": 0.1, "unit": "G"}, "light": {"value": 0, "unit": "lux"}, "battery": {"value": 99, "unit": "%"}},
                {"timestamp": "' || (shipping_date2 + INTERVAL '1 day')::text || '", "temperature": {"value": 9.2, "unit": "C"}, "humidity": {"value": 65.0, "unit": "%"}, "pressure": {"value": 1015, "unit": "hPa"}, "shock": {"value": 0.3, "unit": "G"}, "light": {"value": 0, "unit": "lux"}, "battery": {"value": 96, "unit": "%"}},
                {"timestamp": "' || (shipping_date2 + INTERVAL '2 days')::text || '", "temperature": {"value": 5.1, "unit": "C"}, "humidity": {"value": 62.0, "unit": "%"}, "pressure": {"value": 1012, "unit": "hPa"}, "shock": {"value": 0.1, "unit": "G"}, "light": {"value": 0, "unit": "lux"}, "battery": {"value": 93, "unit": "%"}}
            ],
            "alerts": [
                {"type": "temperature_high", "severity": "critical", "timestamp": "' || (shipping_date2 + INTERVAL '1 day')::text || '", "message": "Temperature exceeded 8°C threshold, reached 9.2°C.", "threshold": 8.0, "value": 9.2}
            ]
        }',
        shipping_date2, current_ts
    );

    -- Shipment 3: Delayed, shock alert, uses Package 1 (again) and Package 3
    INSERT INTO public.shipping (
        id, user_id, tracking_number, status, origin_address, destination_address, shipping_date, estimated_delivery, actual_delivery, carrier, service_level, package_ids, weight, dimensions, shipping_cost, currency, notes, public_id, iot_sensor_id, iot_data, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), seed_user_id, 'DHL300000003', 'delayed',
        '{"name": "Tech Supplier Inc.", "street": "246 Component Ave", "city": "Circuit City", "state": "TX", "zip": "75001", "country": "US"}',
        '{"name": "Assembly Plant Z", "street": "753 Factory Ln", "city": "Manufacturville", "state": "MI", "zip": "48001", "country": "US"}',
        shipping_date3, shipping_date3 + INTERVAL '4 days', NULL, 'DHL', 'Express',
        jsonb_build_array(package1_uuid, package3_uuid), 32.0, '{"length": 70, "width": 40, "height": 30, "unit": "cm"}', 75.20, 'USD', 'Fragile components. Handle with care. Shipment delayed due to weather.',
        SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 8), shipment3_iot_sensor_id,
        '{
            "device_id": "' || shipment3_iot_sensor_id || '",
            "sensor_type": "robust_tracker_v2",
            "is_refrigerated": false,
            "location_tracking": [
                {"timestamp": "' || (shipping_date3)::text || '", "latitude": 32.7767, "longitude": -96.7970, "accuracy": 12, "facility_type": "origin_supplier"},
                {"timestamp": "' || (shipping_date3 + INTERVAL '1 day')::text || '", "latitude": 35.2271, "longitude": -80.8431, "accuracy": 100, "facility_type": "weather_delay_charlotte_hub"}
            ],
            "sensor_readings": [
                {"timestamp": "' || (shipping_date3 + INTERVAL '8 hours')::text || '", "temperature": {"value": 25.0, "unit": "C"}, "humidity": {"value": 55.0, "unit": "%"}, "pressure": {"value": 1008, "unit": "hPa"}, "shock": {"value": 3.5, "unit": "G"}, "light": {"value": 20, "unit": "lux"}, "battery": {"value": 97, "unit": "%"}},
                {"timestamp": "' || (shipping_date3 + INTERVAL '1 day' + INTERVAL '4 hours')::text || '", "temperature": {"value": 20.2, "unit": "C"}, "humidity": {"value": 70.0, "unit": "%"}, "pressure": {"value": 995, "unit": "hPa"}, "shock": {"value": 8.1, "unit": "G"}, "light": {"value": 15, "unit": "lux"}, "battery": {"value": 94, "unit": "%"}}
            ],
            "alerts": [
                {"type": "shock_detected", "severity": "high", "timestamp": "' || (shipping_date3 + INTERVAL '1 day' + INTERVAL '4 hours')::text || '", "message": "High impact detected: 8.1G.", "threshold": 5.0, "value": 8.1}
            ]
        }',
        shipping_date3, current_ts
    );

    -- Shipment 4: Using Package 4, low battery alert
    INSERT INTO public.shipping (
        id, user_id, tracking_number, status, origin_address, destination_address, shipping_date, estimated_delivery, actual_delivery, carrier, service_level, package_ids, weight, dimensions, shipping_cost, currency, notes, public_id, iot_sensor_id, iot_data, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), seed_user_id, 'AMZL400000004', 'processing',
        '{"name": "Pharma Distribution EU", "street": "10 Biotech Park", "city": "Frankfurt", "state": "HE", "zip": "60306", "country": "DE"}',
        '{"name": "UK Research Lab", "street": "20 Science Crescent", "city": "Cambridge", "state": "CAM", "zip": "CB1", "country": "UK"}',
        shipping_date4, shipping_date4 + INTERVAL '2 days', NULL, 'Amazon Logistics', 'NextDay Pharma',
        jsonb_build_array(package4_uuid), 19.2, '{"length": 47, "width": 37, "height": 32, "unit": "cm"}', 95.00, 'EUR', 'Time-sensitive research samples. Refrigerated (1-5°C).',
        SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 8), shipment4_iot_sensor_id,
        '{
            "device_id": "' || shipment4_iot_sensor_id || '",
            "sensor_type": "precision_pharma_v4",
            "is_refrigerated": true,
            "location_tracking": [
                {"timestamp": "' || (shipping_date4)::text || '", "latitude": 50.1109, "longitude": 8.6821, "accuracy": 5, "facility_type": "origin_pharma_distro_de"}
            ],
            "sensor_readings": [
                {"timestamp": "' || (shipping_date4 + INTERVAL '1 hour')::text || '", "temperature": {"value": 3.5, "unit": "C"}, "humidity": {"value": 75.0, "unit": "%"}, "pressure": {"value": 1012, "unit": "hPa"}, "shock": {"value": 0.2, "unit": "G"}, "light": {"value": 0, "unit": "lux"}, "battery": {"value": 25, "unit": "%"}},
                {"timestamp": "' || (shipping_date4 + INTERVAL '6 hours')::text || '", "temperature": {"value": 3.8, "unit": "C"}, "humidity": {"value": 72.0, "unit": "%"}, "pressure": {"value": 1011, "unit": "hPa"}, "shock": {"value": 0.1, "unit": "G"}, "light": {"value": 0, "unit": "lux"}, "battery": {"value": 18, "unit": "%"}}
            ],
            "alerts": [
                 {"type": "low_battery", "severity": "warning", "timestamp": "' || (shipping_date4 + INTERVAL '6 hours')::text || '", "message": "IoT sensor battery critically low: 18%.", "threshold": 20.0, "value": 18}
            ]
        }',
        shipping_date4, current_ts
    );

END $$;
