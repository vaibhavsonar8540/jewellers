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

-- 6. PURITY TABLE (Master Gold / Metal Purity & Pricing Reference)
CREATE TABLE IF NOT EXISTS purity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carat TEXT NOT NULL UNIQUE,           -- Carat / Purity (e.g. '14K', '18K', '22K', '24K')
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Rate / Price for this purity level (e.g. 4500.00, 5800.00)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COLORS TABLE (Master Color Reference & Purity Link)
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,            -- e.g. 'Yellow Gold', 'Rose Gold', 'White Gold'
    slug TEXT NOT NULL UNIQUE,
    hex_code TEXT NOT NULL,               -- e.g. '#B76E79', '#FFD700', '#E5E4E2'
    purity_id UUID REFERENCES purity(id) ON DELETE SET NULL, -- References Purity table
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRODUCTS TABLE (Stores References to Collection, Category, Sub-Category, and Diamond Shape)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,             -- Mandatory Alphanumeric SKU (e.g. 'JW-RING-001')
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,            -- SEO-Friendly URL Slug
    description TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'unisex')) DEFAULT NULL, -- Gender Target ('male', 'female', 'unisex', or NULL)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,  -- Active Status Indicator (default: true)
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- Original / Base Price
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Discount Percentage (e.g. 15.00 for 15% OFF)
    stock INT NOT NULL DEFAULT 0,
    length TEXT,                          -- Product Length (e.g. '18 inches', '45 cm')
    size TEXT,                            -- Product Size (e.g. '7', 'US 6.5', 'Medium')
    meta_title TEXT,                      -- SEO Meta Title
    meta_description TEXT,                -- SEO Meta Description
    meta_keywords TEXT,                   -- SEO Meta Keywords
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
    diamond_shape_id UUID REFERENCES diamond_shapes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEDIA MAPPING TABLE (Maps Media & Color to Product)
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

-- 10. RING SIZES TABLE (Master Ring Sizes Reference)
CREATE TABLE IF NOT EXISTS ring_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,            -- e.g. '14 mm', '16.5 mm', '18 mm', 'Size 7 (17.3 mm)'
    size_in_mm NUMERIC(5, 2) NOT NULL,    -- Ring size value in MM (e.g. 14.00, 16.50, 18.00)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRODUCT VARIATIONS TABLE (Color + Purity Specific Product Variations)
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    purity_id UUID NOT NULL REFERENCES purity(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,                                     -- Variation SKU (e.g. 'JW-RING-001-YG18')
    price NUMERIC(10, 2),                                -- Variation price override
    stock INT NOT NULL DEFAULT 0,                        -- Variation stock level
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_variation UNIQUE (product_id, color_id, purity_id)
);
```

<!-- RPC Functions -->

### Supabase RPC Function: `insert_product_with_variation`

```sql
CREATE OR REPLACE FUNCTION insert_product_with_variation(
    p_name TEXT,
    p_sku TEXT,
    p_slug TEXT,
    p_description TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_price NUMERIC(10, 2) DEFAULT 0.00,
    p_discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    p_stock INT DEFAULT 0,
    p_length TEXT DEFAULT NULL,
    p_size TEXT DEFAULT NULL,
    p_meta_title TEXT DEFAULT NULL,
    p_meta_description TEXT DEFAULT NULL,
    p_meta_keywords TEXT DEFAULT NULL,
    p_collection_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_sub_category_id UUID DEFAULT NULL,
    p_diamond_shape_id UUID DEFAULT NULL,
    p_variations JSONB DEFAULT '[]'::jsonb,
    p_media_mappings JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_product_id UUID;
    v_product_record RECORD;
    v_var_elem JSONB;
    v_media_elem JSONB;
    v_variation_id UUID;
    v_media_id UUID;
    v_inserted_variations JSONB := '[]'::jsonb;
    v_inserted_media JSONB := '[]'::jsonb;
    v_result JSONB;
BEGIN
    -- 1. Authorization Check:
    -- Verify admin role if executed within an authenticated user session (auth.uid() is not null)
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_user_role
        FROM profiles
        WHERE id = auth.uid();

        IF v_user_role IS NULL OR v_user_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can execute product insertion.';
        END IF;
    END IF;

    -- 2. Insert Main Product Record
    INSERT INTO products (
        name,
        sku,
        slug,
        description,
        gender,
        is_active,
        price,
        discount_percentage,
        stock,
        length,
        size,
        meta_title,
        meta_description,
        meta_keywords,
        collection_id,
        category_id,
        sub_category_id,
        diamond_shape_id
    ) VALUES (
        p_name,
        p_sku,
        p_slug,
        p_description,
        p_gender,
        COALESCE(p_is_active, TRUE),
        COALESCE(p_price, 0.00),
        COALESCE(p_discount_percentage, 0.00),
        COALESCE(p_stock, 0),
        p_length,
        p_size,
        p_meta_title,
        p_meta_description,
        p_meta_keywords,
        p_collection_id,
        p_category_id,
        p_sub_category_id,
        p_diamond_shape_id
    )
    RETURNING * INTO v_product_record;

    v_product_id := v_product_record.id;

    -- 3. Insert Product Variations (Color + Purity combinations)
    IF p_variations IS NOT NULL AND jsonb_typeof(p_variations) = 'array' AND jsonb_array_length(p_variations) > 0 THEN
        FOR v_var_elem IN SELECT * FROM jsonb_array_elements(p_variations) LOOP
            IF (v_var_elem->>'color_id') IS NOT NULL AND (v_var_elem->>'purity_id') IS NOT NULL THEN
                INSERT INTO product_variations (
                    product_id,
                    color_id,
                    purity_id,
                    sku,
                    price,
                    stock
                ) VALUES (
                    v_product_id,
                    (v_var_elem->>'color_id')::UUID,
                    (v_var_elem->>'purity_id')::UUID,
                    v_var_elem->>'sku',
                    CASE 
                        WHEN (v_var_elem->>'price') IS NOT NULL AND (v_var_elem->>'price') != '' 
                        THEN (v_var_elem->>'price')::NUMERIC 
                        ELSE COALESCE(p_price, 0.00) 
                    END,
                    CASE 
                        WHEN (v_var_elem->>'stock') IS NOT NULL AND (v_var_elem->>'stock') != '' 
                        THEN (v_var_elem->>'stock')::INT 
                        ELSE 0 
                    END
                )
                RETURNING id INTO v_variation_id;

                v_inserted_variations := v_inserted_variations || jsonb_build_object(
                    'id', v_variation_id,
                    'color_id', v_var_elem->>'color_id',
                    'purity_id', v_var_elem->>'purity_id',
                    'sku', v_var_elem->>'sku',
                    'price', CASE WHEN (v_var_elem->>'price') IS NOT NULL AND (v_var_elem->>'price') != '' THEN (v_var_elem->>'price')::NUMERIC ELSE COALESCE(p_price, 0.00) END,
                    'stock', CASE WHEN (v_var_elem->>'stock') IS NOT NULL AND (v_var_elem->>'stock') != '' THEN (v_var_elem->>'stock')::INT ELSE 0 END
                );
            END IF;
        END LOOP;
    END IF;

    -- 4. Insert Media Mappings per Color
    IF p_media_mappings IS NOT NULL AND jsonb_typeof(p_media_mappings) = 'array' AND jsonb_array_length(p_media_mappings) > 0 THEN
        FOR v_media_elem IN SELECT * FROM jsonb_array_elements(p_media_mappings) LOOP
            IF (v_media_elem->>'color_id') IS NOT NULL THEN
                INSERT INTO media_mapping (
                    product_id,
                    color_id,
                    thumbnail,
                    images,
                    video_url
                ) VALUES (
                    v_product_id,
                    (v_media_elem->>'color_id')::UUID,
                    COALESCE(v_media_elem->>'thumbnail', ''),
                    CASE 
                        WHEN jsonb_typeof(v_media_elem->'images') = 'array' 
                        THEN ARRAY(SELECT jsonb_array_elements_text(v_media_elem->'images')) 
                        ELSE '{}'::text[] 
                    END,
                    v_media_elem->>'video_url'
                )
                RETURNING id INTO v_media_id;

                v_inserted_media := v_inserted_media || jsonb_build_object(
                    'id', v_media_id,
                    'color_id', v_media_elem->>'color_id',
                    'thumbnail', COALESCE(v_media_elem->>'thumbnail', ''),
                    'images', COALESCE(v_media_elem->'images', '[]'::jsonb),
                    'video_url', v_media_elem->>'video_url'
                );
            END IF;
        END LOOP;
    END IF;

    -- 5. Construct and Return Structured JSON Response
    v_result := jsonb_build_object(
        'success', true,
        'product_id', v_product_id,
        'product', to_jsonb(v_product_record),
        'variations', v_inserted_variations,
        'media_mappings', v_inserted_media
    );

    RETURN v_result;
END;
$$;

### Supabase RPC Function: `update_product_with_variation`

```sql
CREATE OR REPLACE FUNCTION update_product_with_variation(
    p_product_id UUID,
    p_name TEXT DEFAULT NULL,
    p_sku TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL,
    p_price NUMERIC(10, 2) DEFAULT NULL,
    p_discount_percentage NUMERIC(5, 2) DEFAULT NULL,
    p_stock INT DEFAULT NULL,
    p_length TEXT DEFAULT NULL,
    p_size TEXT DEFAULT NULL,
    p_meta_title TEXT DEFAULT NULL,
    p_meta_description TEXT DEFAULT NULL,
    p_meta_keywords TEXT DEFAULT NULL,
    p_collection_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_sub_category_id UUID DEFAULT NULL,
    p_diamond_shape_id UUID DEFAULT NULL,
    p_variations JSONB DEFAULT NULL,
    p_media_mappings JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_product_record RECORD;
    v_var_elem JSONB;
    v_media_elem JSONB;
    v_variation_id UUID;
    v_media_id UUID;
    v_updated_variations JSONB := '[]'::jsonb;
    v_updated_media JSONB := '[]'::jsonb;
    v_result JSONB;
BEGIN
    -- 1. Authorization Check (Verify admin role if executed within an authenticated user session)
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_user_role
        FROM profiles
        WHERE id = auth.uid();

        IF v_user_role IS NULL OR v_user_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can update products.';
        END IF;
    END IF;

    -- 2. Verify product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
    END IF;

    -- 3. Update Main Product Record
    UPDATE products
    SET 
        name = COALESCE(p_name, name),
        sku = COALESCE(p_sku, sku),
        slug = COALESCE(p_slug, slug),
        description = COALESCE(p_description, description),
        gender = COALESCE(p_gender, gender),
        is_active = COALESCE(p_is_active, is_active),
        price = COALESCE(p_price, price),
        discount_percentage = COALESCE(p_discount_percentage, discount_percentage),
        stock = COALESCE(p_stock, stock),
        length = COALESCE(p_length, length),
        size = COALESCE(p_size, size),
        meta_title = COALESCE(p_meta_title, meta_title),
        meta_description = COALESCE(p_meta_description, meta_description),
        meta_keywords = COALESCE(p_meta_keywords, meta_keywords),
        collection_id = COALESCE(p_collection_id, collection_id),
        category_id = COALESCE(p_category_id, category_id),
        sub_category_id = COALESCE(p_sub_category_id, sub_category_id),
        diamond_shape_id = COALESCE(p_diamond_shape_id, diamond_shape_id),
        updated_at = NOW()
    WHERE id = p_product_id
    RETURNING * INTO v_product_record;

    -- 4. Update Product Variations (if variations JSON array is provided)
    IF p_variations IS NOT NULL THEN
        DELETE FROM product_variations WHERE product_id = p_product_id;

        IF jsonb_typeof(p_variations) = 'array' AND jsonb_array_length(p_variations) > 0 THEN
            FOR v_var_elem IN SELECT * FROM jsonb_array_elements(p_variations) LOOP
                IF (v_var_elem->>'color_id') IS NOT NULL AND (v_var_elem->>'purity_id') IS NOT NULL THEN
                    INSERT INTO product_variations (
                        product_id,
                        color_id,
                        purity_id,
                        sku,
                        price,
                        stock
                    ) VALUES (
                        p_product_id,
                        (v_var_elem->>'color_id')::UUID,
                        (v_var_elem->>'purity_id')::UUID,
                        v_var_elem->>'sku',
                        CASE 
                            WHEN (v_var_elem->>'price') IS NOT NULL AND (v_var_elem->>'price') != '' 
                            THEN (v_var_elem->>'price')::NUMERIC 
                            ELSE COALESCE(v_product_record.price, 0.00) 
                        END,
                        CASE 
                            WHEN (v_var_elem->>'stock') IS NOT NULL AND (v_var_elem->>'stock') != '' 
                            THEN (v_var_elem->>'stock')::INT 
                            ELSE 0 
                        END
                    )
                    RETURNING id INTO v_variation_id;

                    v_updated_variations := v_updated_variations || jsonb_build_object(
                        'id', v_variation_id,
                        'color_id', v_var_elem->>'color_id',
                        'purity_id', v_var_elem->>'purity_id',
                        'sku', v_var_elem->>'sku',
                        'price', CASE WHEN (v_var_elem->>'price') IS NOT NULL AND (v_var_elem->>'price') != '' THEN (v_var_elem->>'price')::NUMERIC ELSE v_product_record.price END,
                        'stock', CASE WHEN (v_var_elem->>'stock') IS NOT NULL AND (v_var_elem->>'stock') != '' THEN (v_var_elem->>'stock')::INT ELSE 0 END
                    );
                END IF;
            END LOOP;
        END IF;
    END IF;

    -- 5. Update Media Mappings per Color (if media_mappings JSON array is provided)
    IF p_media_mappings IS NOT NULL THEN
        DELETE FROM media_mapping WHERE product_id = p_product_id;

        IF jsonb_typeof(p_media_mappings) = 'array' AND jsonb_array_length(p_media_mappings) > 0 THEN
            FOR v_media_elem IN SELECT * FROM jsonb_array_elements(p_media_mappings) LOOP
                IF (v_media_elem->>'color_id') IS NOT NULL THEN
                    INSERT INTO media_mapping (
                        product_id,
                        color_id,
                        thumbnail,
                        images,
                        video_url
                    ) VALUES (
                        p_product_id,
                        (v_media_elem->>'color_id')::UUID,
                        COALESCE(v_media_elem->>'thumbnail', ''),
                        CASE 
                            WHEN jsonb_typeof(v_media_elem->'images') = 'array' 
                            THEN ARRAY(SELECT jsonb_array_elements_text(v_media_elem->'images')) 
                            ELSE '{}'::text[] 
                        END,
                        v_media_elem->>'video_url'
                    )
                    RETURNING id INTO v_media_id;

                    v_updated_media := v_updated_media || jsonb_build_object(
                        'id', v_media_id,
                        'color_id', v_media_elem->>'color_id',
                        'thumbnail', COALESCE(v_media_elem->>'thumbnail', ''),
                        'images', COALESCE(v_media_elem->'images', '[]'::jsonb),
                        'video_url', v_media_elem->>'video_url'
                    );
                END IF;
            END LOOP;
        END IF;
    END IF;

    -- 6. Return Structured JSON Response
    v_result := jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'product', to_jsonb(v_product_record),
        'variations', v_updated_variations,
        'media_mappings', v_updated_media
    );

    RETURN v_result;
END;
### Supabase RPC Function: `delete_product_with_media`

```sql
CREATE OR REPLACE FUNCTION delete_product_with_media(
    p_product_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_media_urls JSONB := '[]'::jsonb;
    v_rec RECORD;
    v_img TEXT;
    v_deleted_count INT := 0;
    v_result JSONB;
BEGIN
    -- 1. Authorization Check (Verify admin role if executed within an authenticated user session)
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_user_role
        FROM profiles
        WHERE id = auth.uid();

        IF v_user_role IS NULL OR v_user_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can delete products.';
        END IF;
    END IF;

    -- 2. Verify product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
    END IF;

    -- 3. Collect media URLs associated with this product prior to deletion
    FOR v_rec IN SELECT thumbnail, images, video_url FROM media_mapping WHERE product_id = p_product_id LOOP
        IF v_rec.thumbnail IS NOT NULL AND v_rec.thumbnail != '' THEN
            v_media_urls := v_media_urls || to_jsonb(v_rec.thumbnail);
        END IF;
        
        IF v_rec.images IS NOT NULL THEN
            FOREACH v_img IN ARRAY v_rec.images LOOP
                IF v_img IS NOT NULL AND v_img != '' THEN
                    v_media_urls := v_media_urls || to_jsonb(v_img);
                END IF;
            END LOOP;
        END IF;

        IF v_rec.video_url IS NOT NULL AND v_rec.video_url != '' THEN
            v_media_urls := v_media_urls || to_jsonb(v_rec.video_url);
        END IF;
    END LOOP;

    -- 4. Delete child records (media_mapping & product_variations)
    DELETE FROM media_mapping WHERE product_id = p_product_id;
    DELETE FROM product_variations WHERE product_id = p_product_id;

    -- 5. Delete parent product record
    DELETE FROM products WHERE id = p_product_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- 6. Construct and Return Response
    v_result := jsonb_build_object(
        'success', true,
        'deleted_product_id', p_product_id,
        'deleted_count', v_deleted_count,
        'media_urls', v_media_urls
    );

    RETURN v_result;
END;
$$;
```

### Supabase RPC Function: `get_latest_products_by_collection`

```sql
CREATE OR REPLACE FUNCTION get_latest_products_by_collection(
    p_collection_name TEXT DEFAULT NULL,
    p_limit INT DEFAULT 8
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    sku TEXT,
    description TEXT,
    gender TEXT,
    is_active BOOLEAN,
    price NUMERIC(10, 2),
    discount_percentage NUMERIC(5, 2),
    stock INT,
    collection_id UUID,
    collection_name TEXT,
    collection_slug TEXT,
    category_id UUID,
    category_name TEXT,
    category_slug TEXT,
    sub_category_id UUID,
    sub_category_name TEXT,
    sub_category_slug TEXT,
    image TEXT,
    colors JSONB,
    color_image_map JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_collection_id UUID := NULL;
BEGIN
    -- Resolve collection_id if p_collection_name is supplied and not 'all'
    IF p_collection_name IS NOT NULL AND LOWER(TRIM(p_collection_name)) != 'all' AND TRIM(p_collection_name) != '' THEN
        SELECT c.id INTO v_collection_id
        FROM collections c
        WHERE LOWER(c.name) = LOWER(TRIM(p_collection_name))
           OR LOWER(c.slug) = LOWER(TRIM(p_collection_name))
           OR c.id::TEXT = TRIM(p_collection_name)
        LIMIT 1;
    END IF;

    RETURN QUERY
    WITH prod_list AS (
        SELECT p.*
        FROM products p
        WHERE p.is_active = TRUE
          AND (
            v_collection_id IS NULL 
            OR p.collection_id = v_collection_id
            OR (p_collection_name IS NOT NULL AND LOWER(TRIM(p_collection_name)) != 'all' AND (
                EXISTS (
                    SELECT 1 FROM collections c 
                    WHERE c.id = p.collection_id 
                    AND (LOWER(c.name) LIKE '%' || LOWER(TRIM(p_collection_name)) || '%' OR LOWER(c.slug) LIKE '%' || LOWER(TRIM(p_collection_name)) || '%')
                )
            ))
          )
        ORDER BY p.created_at DESC
        LIMIT COALESCE(p_limit, 8)
    )
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.gender,
        p.is_active,
        p.price,
        p.discount_percentage,
        p.stock,
        p.collection_id,
        col.name AS collection_name,
        col.slug AS collection_slug,
        p.category_id,
        cat.name AS category_name,
        cat.slug AS category_slug,
        p.sub_category_id,
        sub.name AS sub_category_name,
        sub.slug AS sub_category_slug,
        COALESCE(
            (SELECT mm.thumbnail FROM media_mapping mm WHERE mm.product_id = p.id AND mm.thumbnail IS NOT NULL AND mm.thumbnail != '' LIMIT 1),
            ''
        ) AS image,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object('id', cl.id, 'name', cl.name, 'slug', cl.slug, 'hex_code', cl.hex_code))
                FROM (
                    SELECT DISTINCT ON (c.id) c.id, c.name, c.slug, c.hex_code
                    FROM media_mapping mm
                    JOIN colors c ON c.id = mm.color_id
                    WHERE mm.product_id = p.id
                ) cl
            ),
            '[]'::jsonb
        ) AS colors,
        COALESCE(
            (
                SELECT jsonb_object_agg(mm.color_id::text, mm.thumbnail)
                FROM media_mapping mm
                WHERE mm.product_id = p.id AND mm.thumbnail IS NOT NULL AND mm.thumbnail != ''
            ),
            '{}'::jsonb
        ) AS color_image_map,
        p.created_at
    FROM prod_list p
    LEFT JOIN collections col ON col.id = p.collection_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN sub_categories sub ON sub.id = p.sub_category_id
    ORDER BY p.created_at DESC;
END;
$$;
```

