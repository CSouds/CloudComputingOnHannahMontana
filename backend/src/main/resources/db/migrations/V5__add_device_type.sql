-- Record what kind of machine a device is so clients can show a fitting icon.
-- Nullable because registration does not send a type yet; NULL means unknown.
ALTER TABLE devices
    ADD COLUMN device_type VARCHAR(20) CHECK (device_type IN ('laptop', 'desktop', 'server'));
