# Supabase Database Reference Schema

```sql
-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE (Stores collection_id to identify which collection category belongs to)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUB-CATEGORIES TABLE (Stores category_id to identify which category subcategory belongs to)
CREATE TABLE IF NOT EXISTS sub_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DIAMOND SHAPES TABLE (Master Diamond Shapes Reference)
CREATE TABLE IF NOT EXISTS diamond_shapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,            -- e.g. 'Round', 'Princess', 'Emerald', 'Oval', 'Cushion', 'Pear'
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,                       -- Icon / Image representation of the shape
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COLORS TABLE (Master Color Reference)
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,            -- e.g. 'Yellow Gold', 'Rose Gold', 'White Gold'
    slug TEXT NOT NULL UNIQUE,
    hex_code TEXT NOT NULL,               -- e.g. '#B76E79', '#FFD700', '#E5E4E2'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCTS TABLE (Stores References to Collection, Category, Sub-Category, and Diamond Shape)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,             -- Mandatory Alphanumeric SKU (e.g. 'JW-RING-001')
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- Original / Base Price
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Discount Percentage (e.g. 15.00 for 15% OFF)
    stock INT NOT NULL DEFAULT 0,
    length TEXT,                          -- Product Length (e.g. '18 inches', '45 cm')
    size TEXT,                            -- Product Size (e.g. '7', 'US 6.5', 'Medium')
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
    diamond_shape_id UUID REFERENCES diamond_shapes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEDIA MAPPING TABLE (Maps Media & Color to Product)
CREATE TABLE IF NOT EXISTS media_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    thumbnail TEXT NOT NULL,              -- Main thumbnail image URL for this color
    images TEXT[] NOT NULL DEFAULT '{}',  -- Array of detail image URLs
    video_url TEXT,                       -- Video URL for this color media
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_color_media UNIQUE (product_id, color_id) -- One media mapping per color for a product
);
```
