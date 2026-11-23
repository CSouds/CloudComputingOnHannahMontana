-- Invitation hashes authorize enrollment into one group without storing usable invitation tokens.
CREATE TABLE registration_invitations (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id),
    token_hash VARCHAR(255) NOT NULL UNIQUE CHECK (length(trim(token_hash)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    CHECK (expires_at > created_at),
    CHECK (consumed_at IS NULL OR consumed_at BETWEEN created_at AND expires_at)
);

-- Group administrators can list invitations without scanning other groups.
CREATE INDEX registration_invitations_group_id_idx ON registration_invitations(group_id);
