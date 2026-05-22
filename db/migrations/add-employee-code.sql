-- Add employee_code column to inspection_items table
-- This stores the employee ID/code entered by the inspector

ALTER TABLE inspection_items
ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50);

-- Add comment to explain the column
COMMENT ON COLUMN inspection_items.employee_code IS 'Employee ID/code entered by the inspector during inspection';
