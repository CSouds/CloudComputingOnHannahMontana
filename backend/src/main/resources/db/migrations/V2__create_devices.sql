-- A stable device identity survives address changes and belongs to exactly one group.
CREATE TABLE devices (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id),
    display_name VARCHAR(255) NOT NULL CHECK (length(trim(display_name)) > 0),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ
);

-- Group device listings should not require scanning registrations in other groups.
CREATE INDEX devices_group_id_idx ON devices(group_id);
