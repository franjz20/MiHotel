CREATE TABLE habitaciones (
    id               BIGSERIAL PRIMARY KEY,
    alojamiento_id   BIGINT NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
    nombre           VARCHAR(150) NOT NULL,
    descripcion      TEXT,
    capacidad        INT NOT NULL,
    cantidad         INT NOT NULL,
    precio_por_noche DECIMAL(12,2) NOT NULL,
    activa           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_habitaciones_alojamiento ON habitaciones(alojamiento_id);

CREATE TABLE habitacion_fotos (
    id            BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    url           TEXT NOT NULL,
    orden         INT NOT NULL DEFAULT 0
);

CREATE TABLE temporadas (
    id               BIGSERIAL PRIMARY KEY,
    habitacion_id    BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    nombre           VARCHAR(100) NOT NULL,
    fecha_inicio     DATE NOT NULL,
    fecha_fin        DATE NOT NULL,
    precio_por_noche DECIMAL(12,2) NOT NULL,
    CHECK (fecha_inicio < fecha_fin)
);

CREATE TABLE habitacion_bloqueos (
    id            BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    fecha_inicio  DATE NOT NULL,
    fecha_fin     DATE NOT NULL,
    motivo        VARCHAR(255),
    CHECK (fecha_inicio < fecha_fin)
);
