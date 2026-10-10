CREATE TABLE password_reset_tokens (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token      VARCHAR(64) NOT NULL UNIQUE,
    expira_en  TIMESTAMP NOT NULL,
    usado      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
