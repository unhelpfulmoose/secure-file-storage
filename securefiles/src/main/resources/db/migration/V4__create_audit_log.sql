CREATE TABLE audit_log (
    id         BIGSERIAL    PRIMARY KEY,
    action     VARCHAR(50)  NOT NULL,
    username   VARCHAR(50),
    details    VARCHAR(500),
    ip         VARCHAR(50),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
