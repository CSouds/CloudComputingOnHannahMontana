-- Store only credential hashes so database records cannot be used directly as agent tokens.
CREATE TABLE device_credentials (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id),
    token_hash VARCHAR(255) NOT NULL UNIQUE CHECK (length(trim(token_hash)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ
);

-- Keep credential lookup by device efficient for revocation and future rotation.
CREATE INDEX device_credentials_device_id_idx ON device_credentials(device_id);
