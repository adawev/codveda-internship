UPDATE products
SET version = 0
WHERE version IS NULL;

ALTER TABLE products
    ALTER COLUMN version SET DEFAULT 0;

ALTER TABLE products
    ALTER COLUMN version SET NOT NULL;
