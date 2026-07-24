-- Allow 'na' (ไม่มี/ไม่เกี่ยวข้อง) as an inspection item status.
-- Run manually, or hit POST /api/admin/migrate (idempotent) as HOD.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inspection_items_status_check'
      AND conrelid = 'inspection_items'::regclass
      AND pg_get_constraintdef(oid) NOT LIKE '%''na''%'
  ) THEN
    ALTER TABLE inspection_items DROP CONSTRAINT inspection_items_status_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inspection_items_status_check'
      AND conrelid = 'inspection_items'::regclass
  ) THEN
    ALTER TABLE inspection_items
      ADD CONSTRAINT inspection_items_status_check
      CHECK (status IN ('normal', 'abnormal', 'fixed', 'na'));
  END IF;
END$$;
