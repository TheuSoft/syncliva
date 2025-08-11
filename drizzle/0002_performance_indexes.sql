-- Índices adicionais para melhorar buscas frequentes
-- Composite index para filtros por clínica + status + data
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status_date
  ON appointments (clinic_id, status, date);

-- Index para doctor em conjunto com data (usado em relatórios)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
  ON appointments (doctor_id, date);

-- Index para consultas por patient (caso futuro de listagem)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date
  ON appointments (patient_id, date);
