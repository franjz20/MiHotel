-- Fase 9/10: confirmacion de email, notificaciones in-app y auditoria

ALTER TABLE usuarios ADD COLUMN email_confirmado BOOLEAN NOT NULL DEFAULT FALSE;
-- Las cuentas ya existentes quedan confirmadas para no romper usuarios de prueba
UPDATE usuarios SET email_confirmado = TRUE;

CREATE TABLE confirmacion_tokens (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token      VARCHAR(64) NOT NULL UNIQUE,
    expira_en  TIMESTAMP   NOT NULL,
    usado      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE notificaciones (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo       VARCHAR(50)  NOT NULL,
    titulo     VARCHAR(200) NOT NULL,
    mensaje    TEXT         NOT NULL,
    leida      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

CREATE TABLE auditoria (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    BIGINT REFERENCES usuarios(id),
    actor_email VARCHAR(255),
    accion      VARCHAR(100) NOT NULL,
    entidad     VARCHAR(50),
    entidad_id  BIGINT,
    detalle     TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at DESC);
