-- Seed utility types
INSERT INTO utility_types (code, name_th, name_en, unit, icon, color) VALUES
  ('ELECTRICITY', 'ค่าไฟฟ้า', 'Electricity', 'หน่วย (kWh)', 'zap', 'chart-1'),
  ('WATER', 'ค่าน้ำประปา', 'Water Supply', 'ลูกบาศก์เมตร', 'droplet', 'chart-2'),
  ('PHONE', 'ค่าโทรศัพท์', 'Telephone', 'นาที', 'phone', 'chart-3'),
  ('INTERNET', 'ค่าอินเทอร์เน็ต', 'Internet', 'เดือน', 'wifi', 'chart-4'),
  ('FUEL', 'ค่าน้ำมันเชื้อเพลิง', 'Fuel', 'ลิตร', 'fuel', 'chart-5'),
  ('POSTAL', 'ค่าไปรษณีย์', 'Postal', 'ชิ้น', 'mail', 'chart-1')
ON CONFLICT (code) DO NOTHING;

-- Seed default users (passwords are bcrypt hashes of the plain passwords below)
-- admin@fisheries.go.th / admin123
-- staff@fisheries.go.th / staff123
-- user@fisheries.go.th  / user123
INSERT INTO users (email, password_hash, full_name, department, role) VALUES
  ('admin@fisheries.go.th', '$2b$10$2L947vvhtpn4nXwJtv5GFOOjTU3HyXmDOCC9/acrTRKamYy2i5rwG', 'ผู้ดูแลระบบ', 'สำนักบริหารทั่วไป', 'ADMIN'),
  ('staff@fisheries.go.th', '$2b$10$bWrpjl.oCts1GVgVLJR5U.1vMz0V.4dMM.PSStQj5wDff7DXOZxzO', 'สมชาย ใจดี', 'กลุ่มงานการเงินและบัญชี', 'STAFF'),
  ('user@fisheries.go.th', '$2b$10$P497bVwGROrW7S7258FUd.8lSMtD6rhNfBsZAlt2cbv1Q7dLxwA0O', 'สมหญิง ขยันงาน', 'กลุ่มงานพัสดุ', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Seed sample utility bills for the last 12 months
DO $$
DECLARE
  utility_rec RECORD;
  m INTEGER;
  y INTEGER;
  base_amount NUMERIC;
  admin_id INTEGER;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@fisheries.go.th';

  FOR utility_rec IN SELECT id, code FROM utility_types LOOP
    FOR m IN 1..12 LOOP
      y := 2025;
      base_amount := CASE utility_rec.code
        WHEN 'ELECTRICITY' THEN 45000 + (random() * 20000)
        WHEN 'WATER' THEN 8500 + (random() * 3000)
        WHEN 'PHONE' THEN 3200 + (random() * 800)
        WHEN 'INTERNET' THEN 2500 + (random() * 500)
        WHEN 'FUEL' THEN 18000 + (random() * 7000)
        WHEN 'POSTAL' THEN 1500 + (random() * 800)
      END;

      INSERT INTO utility_bills (utility_type_id, billing_year, billing_month, amount, usage, location, reference_no, created_by)
      VALUES (
        utility_rec.id,
        y,
        m,
        ROUND(base_amount::numeric, 2),
        ROUND((base_amount / 5)::numeric, 2),
        'สำนักงานกรมประมง กรุงเทพฯ',
        'REF-' || y || '-' || LPAD(m::text, 2, '0') || '-' || utility_rec.code,
        admin_id
      );
    END LOOP;
  END LOOP;
END $$;
