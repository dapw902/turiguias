USE turiguias;

INSERT INTO users (name, email, password, role, phone, notes, must_change_password, photo) VALUES
('Dafne Admin',   'admin@anaga.com',  '$2b$10$hke88O1CY3pjLGQgzgktvOoO/wlpqCXo9crtWj6uhzaEDl/8twpS6', 'admin', '+34600000001', NULL, FALSE, NULL),
('Carlos Mendez', 'carlos@anaga.com', '$2b$10$hke88O1CY3pjLGQgzgktvOoO/wlpqCXo9crtWj6uhzaEDl/8twpS6', 'guide', '+34600000002', 'Guía senior, inglés y español', TRUE, NULL),
('Laura Vega',    'laura@anaga.com',  '$2b$10$hke88O1CY3pjLGQgzgktvOoO/wlpqCXo9crtWj6uhzaEDl/8twpS6', 'guide', '+34600000003', 'Especialista en senderismo', TRUE, NULL),
('Pedro Suárez',  'pedro@anaga.com',  '$2b$10$hke88O1CY3pjLGQgzgktvOoO/wlpqCXo9crtWj6uhzaEDl/8twpS6', 'guide', '+34600000004', NULL, TRUE, NULL),
('Ana Martín',    'ana@anaga.com',    '$2b$10$hke88O1CY3pjLGQgzgktvOoO/wlpqCXo9crtWj6uhzaEDl/8twpS6', 'guide', '+34600000005', 'Guía acuática certificada', TRUE, NULL);