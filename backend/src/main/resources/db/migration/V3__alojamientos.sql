CREATE TABLE alojamientos (
    id             BIGSERIAL PRIMARY KEY,
    dueno_id       BIGINT NOT NULL REFERENCES usuarios(id),
    nombre         VARCHAR(150) NOT NULL,
    tipo           VARCHAR(30) NOT NULL,
    descripcion    TEXT,
    direccion      VARCHAR(255) NOT NULL,
    ciudad         VARCHAR(100) NOT NULL,
    provincia      VARCHAR(100),
    pais           VARCHAR(100) NOT NULL DEFAULT 'Argentina',
    latitud        DECIMAL(9,6),
    longitud       DECIMAL(9,6),
    telefono       VARCHAR(50),
    email_contacto VARCHAR(255),
    estado         VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                   CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO','SUSPENDIDO')),
    motivo_rechazo TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_alojamientos_ciudad_estado ON alojamientos(ciudad, estado);
CREATE INDEX idx_alojamientos_dueno ON alojamientos(dueno_id);

CREATE TABLE servicios (
    id     BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO servicios (nombre) VALUES
    ('WiFi'),('Pileta'),('Desayuno'),('Estacionamiento'),('Aire acondicionado'),
    ('TV'),('Mascotas permitidas'),('Gimnasio'),('Spa'),('Restaurante'),('Recepcion 24hs');

CREATE TABLE alojamiento_servicios (
    alojamiento_id BIGINT NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
    servicio_id    BIGINT NOT NULL REFERENCES servicios(id),
    PRIMARY KEY (alojamiento_id, servicio_id)
);

CREATE TABLE alojamiento_fotos (
    id             BIGSERIAL PRIMARY KEY,
    alojamiento_id BIGINT NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
    url            TEXT NOT NULL,
    orden          INT NOT NULL DEFAULT 0,
    es_portada     BOOLEAN NOT NULL DEFAULT FALSE
);
