-- Migration to normalize ai_agents tools column to use simple string arrays
-- This converts all three methods to method 2 (simple string array)

-- Backup the current tools data (optional but recommended)
CREATE TABLE IF NOT EXISTS ai_agents_tools_backup AS
SELECT id, tools, updated_at FROM ai_agents WHERE tools IS NOT NULL;

-- Improved function with comprehensive type checking to handle NULL, non-arrays, and all edge cases
-- Function to extract tool names from various formats
CREATE OR REPLACE FUNCTION extract_tool_names(tools_json jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  tool_item jsonb;
  tool_name text;
BEGIN
  -- Handle null
  IF tools_json IS NULL THEN
    RETURN result;
  END IF;

  -- Handle non-array types (return empty array)
  IF jsonb_typeof(tools_json) != 'array' THEN
    RETURN result;
  END IF;

  -- Handle empty array
  IF jsonb_array_length(tools_json) = 0 THEN
    RETURN result;
  END IF;

  -- Iterate through each tool in the array
  FOR tool_item IN SELECT * FROM jsonb_array_elements(tools_json)
  LOOP
    -- Method 1: Object with "name" property
    IF jsonb_typeof(tool_item) = 'object' AND tool_item ? 'name' THEN
      tool_name := tool_item->>'name';
      IF tool_name IS NOT NULL AND tool_name != '' AND tool_name != 'undefined' THEN
        result := result || jsonb_build_array(tool_name);
      END IF;
    
    -- Method 2: Simple string (already correct format)
    ELSIF jsonb_typeof(tool_item) = 'string' THEN
      tool_name := tool_item#>>'{}';
      IF tool_name IS NOT NULL AND tool_name != '' AND tool_name != 'undefined' THEN
        result := result || jsonb_build_array(tool_name);
      END IF;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- Update all ai_agents records to use simple string array format
UPDATE ai_agents
SET 
  tools = extract_tool_names(tools::jsonb),
  updated_at = NOW()
WHERE tools IS NOT NULL;

-- Add comment to table documenting the tools format
COMMENT ON COLUMN ai_agents.tools IS 'Array of tool name strings. Example: ["query_database", "analyze_data", "web_search"]';

-- Verify the migration
DO $$
DECLARE
  invalid_count integer;
BEGIN
  -- Count records with non-string array elements
  SELECT COUNT(*) INTO invalid_count
  FROM ai_agents
  WHERE tools IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(tools::jsonb) AS elem
      WHERE jsonb_typeof(elem) != 'string'
    );

  IF invalid_count > 0 THEN
    RAISE NOTICE 'Warning: % records still have non-string tool formats', invalid_count;
  ELSE
    RAISE NOTICE 'Success: All ai_agents tools normalized to string array format';
  END IF;
END $$;

-- Optional: Clean up the extraction function if you don't need it anymore
-- DROP FUNCTION IF EXISTS extract_tool_names(jsonb);
