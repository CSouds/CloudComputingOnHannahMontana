-- Store account profiles without choosing an authentication mechanism yet.
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL CHECK (length(trim(email)) > 0 AND email = trim(email)),
    display_name VARCHAR(255) NOT NULL CHECK (length(trim(display_name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prevent multiple accounts from using the same email with different capitalization.
CREATE UNIQUE INDEX users_email_unique_idx ON users (lower(email));
