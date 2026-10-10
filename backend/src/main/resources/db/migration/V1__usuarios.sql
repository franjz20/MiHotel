CREATE TABLE usuarios (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    telefono      VARCHAR(50),
    rol           VARCHAR(20) NOT NULL CHECK (rol IN ('CLIENTE','DUENO','ADMIN')),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);
