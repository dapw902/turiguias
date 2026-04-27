--  -----------------------------------------------------------------
--  TuriGuías — Esquema de la BBDD
--
--  RESETEO para las pruebas 
--  -----------------------------------------------------------------
-- Tumba la base de datos si existe para recrearla
DROP DATABASE IF EXISTS turiguias;
CREATE DATABASE turiguias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE turiguias;

--  -----------------------------------------------------------------
--  USERS
--  Tabla de todos los usuarios de la app: guías y admins
--  -----------------------------------------------------------------
CREATE TABLE users (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL UNIQUE,
  password   VARCHAR(255)    NOT NULL,
  role       ENUM('admin', 'guide') NOT NULL,
  phone      VARCHAR(30)     DEFAULT NULL,
  notes      TEXT            DEFAULT NULL,
  must_change_password  BOOLEAN         NOT NULL DEFAULT TRUE,
  photo      VARCHAR(255)    DEFAULT NULL,
  PRIMARY KEY (id)
);

--  -----------------------------------------------------------------
--  SERVICES
--  Se sincronizan desde TuriTop (sólo los productos propios de tipo tour).
--  Y sólo se guardan datos útiles para la asignación: nombre y duración
--  -----------------------------------------------------------------
CREATE TABLE services (
  id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  turitop_product_id  VARCHAR(20)   NOT NULL UNIQUE,
  name                VARCHAR(150)  NOT NULL,
  duration            INT UNSIGNED  NOT NULL DEFAULT 0,
  timezone            VARCHAR(50)   NOT NULL DEFAULT 'UTC',
  `active`            TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
);

--  -----------------------------------------------------------------
--  GUIDE_SERVICES
--  Guarda qué guías pueden llevar qué actividades
--  Y su capacidad (PAX) por servicio
--  -----------------------------------------------------------------
CREATE TABLE guide_services (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  service_id  INT UNSIGNED  NOT NULL,
  capacity    INT UNSIGNED  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_guide_service (user_id, service_id),
  CONSTRAINT fk_gs_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_gs_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

--  -----------------------------------------------------------------
--  GUIDE_AVAILABILITY
--  Intervalos de fecha y hora en los que un guía está disponible para trabajar.
--  Una fila por cada franja de disponibilidad. Se permiten varias filas.
--  -----------------------------------------------------------------
CREATE TABLE guide_availability (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  start_time  TIME          NOT NULL,
  end_time    TIME          NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_ga_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

--  -----------------------------------------------------------------
--  EVENTS
--  Se sincronizan desde TuriTop (a una semana vista).
--  Identificado por servicio + fecha y hora
--  El nombre se copia del servicio en el momento de la sincronización.
--  -----------------------------------------------------------------
CREATE TABLE events (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  service_id  INT UNSIGNED    NOT NULL,
  event_time  BIGINT UNSIGNED NOT NULL,
  duration    INT UNSIGNED    NOT NULL DEFAULT 0,
  capacity    INT UNSIGNED    NOT NULL DEFAULT 0,
  status      VARCHAR(20)     NOT NULL DEFAULT 'open',
  PRIMARY KEY (id),
  UNIQUE KEY uq_event (service_id, event_time),
  CONSTRAINT fk_ev_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

--  -----------------------------------------------------------------
--  GROUPS
--  Grupo de reservas asignadas a un guía para un evento.
--  user_id puede estar null: el grupo puede existir antes de que se asigne el guía.
--  confirmed es false hasta que el administrador confirme la asignación (sistema de auto-asignación)
--  -----------------------------------------------------------------
CREATE TABLE groups (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  event_id    INT UNSIGNED  NOT NULL,
  user_id     INT UNSIGNED  DEFAULT NULL,
  confirmed   BOOLEAN       NOT NULL DEFAULT FALSE,
  needs_attention TINYINT(1) NOT NULL DEFAULT 0,
  capacity    INT UNSIGNED  DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_gr_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_gr_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE SET NULL
);

--  -----------------------------------------------------------------
--  BOOKINGS
--  Caché sincronizada desde Turitop
--  pax = número total de participantes (suma de count y seats de ticket_type_count).
--  ket_type_count = listado de los tickets
--  status = status de la reserva para el guía
--  client_data = JSON sin procesar procedente de TuriTop (todos los campos del formulario).
--  group_id puede ser null hasta que la reserva se asigne a un grupo.
--  -----------------------------------------------------------------
CREATE TABLE bookings (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  turitop_booking_id  VARCHAR(50)     NOT NULL UNIQUE,
  event_id            INT UNSIGNED    NOT NULL,
  pax                 INT UNSIGNED    NOT NULL DEFAULT 0,
  client_data         JSON            NOT NULL,
  ticket_type_count   JSON            NOT NULL,
  status              VARCHAR(20)     NOT NULL DEFAULT 'confirmed',
  notes               TEXT            NULL,
  group_id            INT UNSIGNED    NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_bk_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_bk_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE SET NULL
);
