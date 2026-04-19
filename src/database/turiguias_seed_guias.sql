USE turiguias;

-- ============================================================
--  GUIDE_SERVICES
--  IDs de servicios después de sincronizar desde TuriTop sandbox:
--    1 = P2  Excursión Anaga         (Atlantic/Canary)
--    2 = P9  Excursión Los Gigantes  (Atlantic/Canary)
--    3 = P3  Excursión Orotava       (Atlantic/Canary)
--    4 = P7  Excursión sin duración  (Atlantic/Canary) ← duration 0, no asignar
--    5 = P1  Excursión Teide         (Atlantic/Canary)
--    6 = P5  Visita Guiada Madrid    (Europe/Madrid)
--    7 = P4  Visita guiada Sta. Cruz (Atlantic/Canary)
-- ============================================================
INSERT INTO guide_services (user_id, service_id, capacity) VALUES
-- Carlos: Teide y Anaga (Atlantic/Canary)
(2, 5, 15),
(2, 1, 12),
-- Laura: Los Gigantes y Orotava (Atlantic/Canary)
(3, 2, 12),
(3, 3, 10),
-- Pedro: Sta. Cruz y Anaga (Atlantic/Canary)
(4, 7, 20),
(4, 1, 15),
-- Ana: Teide y Orotava (Atlantic/Canary)
(5, 5, 10),
(5, 3, 8);

-- ============================================================
--  GUIDE_AVAILABILITY
--  Almacenadas en UTC (Atlantic/Canary en abril = UTC+1)
-- ============================================================
INSERT INTO guide_availability (user_id, start_date, end_date, start_time, end_time) VALUES
-- Carlos: toda la semana del 14 al 20
(2, '2026-04-14', '2026-04-20', '07:00', '16:00'),
-- Laura: lunes a viernes
(3, '2026-04-14', '2026-04-18', '08:00', '15:00'),
-- Pedro: toda la semana, horario de tarde
(4, '2026-04-14', '2026-04-20', '10:00', '18:00'),
-- Ana: toda la semana, horario amplio
(5, '2026-04-14', '2026-04-20', '07:00', '17:00');