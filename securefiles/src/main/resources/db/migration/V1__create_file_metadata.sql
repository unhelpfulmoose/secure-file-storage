CREATE TABLE IF NOT EXISTS file_metadata (
    id             BIGSERIAL    PRIMARY KEY,
    file_name      VARCHAR(255),
    file_type      VARCHAR(255),
    storage_path   VARCHAR(255),
    upload_at      TIMESTAMP,
    encryption_key TEXT
);
