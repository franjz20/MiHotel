CREATE TABLE reservas (
    id                BIGSERIAL PRIMARY KEY,
    habitacion_id     BIGINT NOT NULL REFERENCES habitaciones(id),
    cliente_id        BIGINT NOT NULL REFERENCES usuarios(id),
    check_in          DATE NOT NULL,
    check_out         DATE NOT NULL,
    cantidad_unidades INT NOT NULL DEFAULT 1,
    huesped_nombre    VARCHAR(150),
    huesped_telefono  VARCHAR(50),
    huesped_email     VARCHAR(255),
    precio_total      DECIMAL(12,2) NOT NULL,
    estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado IN ('PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','COMPLETADA')),
    motivo_rechazo    TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (check_in < check_out)
);
CREATE INDEX idx_reservas_habitacion ON reservas(habitacion_id);
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
