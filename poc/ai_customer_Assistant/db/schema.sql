CREATE TABLE customers (
  id UUID PRIMARY KEY,
  external_customer_id VARCHAR(64) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone_number ON customers(phone_number);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date TIMESTAMP NOT NULL,
  order_status VARCHAR(30) NOT NULL,
  payment_status VARCHAR(30) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  total_amount NUMERIC(12,2) NOT NULL,
  return_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_address_json JSONB,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  shipment_status VARCHAR(30) NOT NULL,
  courier_name VARCHAR(100),
  tracking_number VARCHAR(100),
  expected_delivery_date DATE,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  last_tracking_update_at TIMESTAMP,
  tracking_payload JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE return_requests (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  return_status VARCHAR(30) NOT NULL,
  eligible BOOLEAN NOT NULL DEFAULT FALSE,
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount NUMERIC(12,2),
  reason VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE call_sessions (
  id UUID PRIMARY KEY,
  retell_call_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES orders(id),
  caller_phone_number VARCHAR(20),
  call_status VARCHAR(30) NOT NULL,
  detected_intent VARCHAR(50),
  final_outcome VARCHAR(50),
  confidence_score NUMERIC(4,3),
  transcript_text TEXT,
  transcript_json JSONB,
  llm_trace_json JSONB,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE call_events (
  id UUID PRIMARY KEY,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id),
  event_type VARCHAR(50) NOT NULL,
  event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  payload JSONB
);

CREATE TABLE escalations (
  id UUID PRIMARY KEY,
  call_session_id UUID NOT NULL UNIQUE REFERENCES call_sessions(id),
  escalation_reason VARCHAR(255) NOT NULL,
  escalation_type VARCHAR(50) NOT NULL,
  transfer_target VARCHAR(100),
  transfer_status VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
