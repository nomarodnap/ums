-- ระบบรายงานค่าสาธารณูปโภค กรมประมง
-- Create tables for users, utility types, and utility bills

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'STAFF', 'USER')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Utility types (ไฟฟ้า, น้ำ, โทรศัพท์ ฯลฯ)
CREATE TABLE IF NOT EXISTS utility_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Utility bills (บันทึกค่าสาธารณูปโภครายเดือน)
CREATE TABLE IF NOT EXISTS utility_bills (
  id SERIAL PRIMARY KEY,
  utility_type_id INTEGER NOT NULL REFERENCES utility_types(id),
  billing_year INTEGER NOT NULL,
  billing_month INTEGER NOT NULL CHECK (billing_month BETWEEN 1 AND 12),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  usage NUMERIC(12, 2),
  location VARCHAR(255),
  reference_no VARCHAR(100),
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_year_month ON utility_bills(billing_year, billing_month);
CREATE INDEX IF NOT EXISTS idx_bills_type ON utility_bills(utility_type_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_by ON utility_bills(created_by);

-- Sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
