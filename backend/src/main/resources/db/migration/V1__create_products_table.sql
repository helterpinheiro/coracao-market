CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    stock INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT chk_products_price_non_negative
        CHECK (price >= 0),

    CONSTRAINT chk_products_stock_non_negative
        CHECK (stock >= 0)
);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_products_name
    ON products(name);