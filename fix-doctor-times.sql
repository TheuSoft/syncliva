-- Script para corrigir horários de médicos que foram salvos em UTC
-- Execute este script no seu banco de dados para converter os horários de volta para horário local do Brasil

-- Verificar os horários atuais dos médicos
SELECT 
    id, 
    name, 
    "availableFromTime", 
    "availableToTime",
    -- Converter de UTC para horário local do Brasil (UTC-3)
    ("availableFromTime"::time - interval '3 hours') as "corrected_from_time",
    ("availableToTime"::time - interval '3 hours') as "corrected_to_time"
FROM doctors;

-- Atualizar os horários para horário local do Brasil (descomente as linhas abaixo para executar)
-- UPDATE doctors 
-- SET 
--     "availableFromTime" = ("availableFromTime"::time - interval '3 hours')::time,
--     "availableToTime" = ("availableToTime"::time - interval '3 hours')::time
-- WHERE 
--     -- Apenas médicos que provavelmente têm horários em UTC (exemplo: horários > 20:00)
--     "availableToTime" > '20:00:00';
