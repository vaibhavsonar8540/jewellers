# Supabase Database Reference Schema & RPC Functions

## 1. Database Table Schemas

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

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUB-CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS sub_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COLORS TABLE
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. KARATS TABLE
CREATE TABLE IF NOT EXISTS karats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. DIAMOND SHAPES TABLE
CREATE TABLE IF NOT EXISTS diamond_shapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GOLD COLOR + GOLD KARAT RELATIONSHIP (color_karats TABLE)
CREATE TABLE IF NOT EXISTS color_karats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    karat_id UUID NOT NULL REFERENCES karats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_color_karat UNIQUE (color_id, karat_id)
);

CREATE INDEX IF NOT EXISTS idx_color_karats_color_id ON color_karats(color_id);
CREATE INDEX IF NOT EXISTS idx_color_karats_karat_id ON color_karats(karat_id);

-- 9. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'unisex', 'kids')) DEFAULT NULL,
    base_price NUMERIC(10, 2) DEFAULT 0.00,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    net_weight NUMERIC(10, 3),
    gross_weight NUMERIC(10, 3),
    diamond_weight NUMERIC(10, 3),
    diamond_shape_id UUID REFERENCES diamond_shapes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    variation_combo JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_products_diamond_shape ON products(diamond_shape_id);

-- 10. PRODUCT VARIATIONS TABLE
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    karat_id UUID NOT NULL REFERENCES karats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_color_karat UNIQUE (product_id, color_id, karat_id)
);

CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_color_id ON product_variations(color_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_karat_id ON product_variations(karat_id);

-- 11. MEDIA MAPPING TABLE (Per Product Variation)
CREATE TABLE IF NOT EXISTS media_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}'::TEXT[],
    video TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_max_5_images CHECK (cardinality(images) <= 5)
);

CREATE INDEX IF NOT EXISTS idx_media_mapping_variation_id ON media_mapping(product_variation_id);

-- 12. CART ITEMS TABLE (User-Scoped Shopping Bag)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    sku TEXT,
    variation_combo JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_cart_item UNIQUE (user_id, item_key)
);
```

---

## 2. Relationships Architecture

```text
products
   │
   ├── product_variations (product_id)
   │       │
   │       ├── colors (color_id)
   │       │
   │       ├── karats (karat_id)
   │       │
   │       └── media_mapping (product_variation_id)
   │
   ├── diamond_shapes (diamond_shape_id)
   │
   └── variation_combo (JSONB snapshot)

colors
   │
   └── color_karats
          │
          └── karats
```

* The final variation is always **Gold Color + Gold Karat** (e.g., `Yellow Gold + 14K = 14K Yellow Gold`).
* `color_karats` defines which Karats are available for each Gold Color.
* `product_variations` links a product to its selected Gold Color + Gold Karat combinations.
* `media_mapping` links to `product_variation_id` and holds `thumbnail` (1 image path), `images` (array max 5), and `video` (1 video path).
* `variation_combo` in `products` acts as a fast JSONB snapshot for frontend consumption while relational tables remain the source of truth.

---

## 3. Storage Structure

Bucket Name: `luxora`

Recommended storage hierarchy:

```text
luxora/
  products/
    {product_id}/
      variations/
        {variation_id}/
          thumbnail/
          images/
          video/
```

Example:

```text
luxora/
  products/
    a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/
      variations/
        v1v2v3v4-v5v6-v7v8-v9v0-v1v2v3v4v5v6/
          thumbnail/yellow-14k-thumb.jpg
          images/yellow-14k-1.jpg
          images/yellow-14k-2.jpg
          video/yellow-14k-video.mp4
```

---

## 4. Product Save Operation RPC Function (`save_product_with_variations`)

This atomic function handles complete product creation/update with variation matrix and media mappings in a single secure transaction:

```sql
CREATE OR REPLACE FUNCTION save_product_with_variations(
    p_product_id UUID DEFAULT NULL,
    p_sku TEXT DEFAULT NULL,
    p_name TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_collection_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_sub_category_id UUID DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_base_price NUMERIC DEFAULT 0.00,
    p_discount_percentage NUMERIC DEFAULT 0.00,
    p_stock INT DEFAULT 0,
    p_net_weight NUMERIC DEFAULT NULL,
    p_gross_weight NUMERIC DEFAULT NULL,
    p_diamond_weight NUMERIC DEFAULT NULL,
    p_diamond_shape_id UUID DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_is_featured BOOLEAN DEFAULT FALSE,
    p_variations_media JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_prod_id UUID;
    v_prod_record RECORD;
    v_item JSONB;
    v_color_id UUID;
    v_karat_id UUID;
    v_var_id UUID;
    v_media_id UUID;
    v_thumb TEXT;
    v_imgs TEXT[];
    v_vid TEXT;
    v_color_name TEXT;
    v_karat_name TEXT;
    v_combo_snapshot JSONB := '[]'::jsonb;
    v_result JSONB;
BEGIN
    -- 1. Admin Authorization Check
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
        IF v_user_role IS NULL OR v_user_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can save products.';
        END IF;
    END IF;

    -- 2. Insert or Update Base Product Record
    IF p_product_id IS NOT NULL AND EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        UPDATE products
        SET sku = COALESCE(p_sku, sku),
            name = COALESCE(p_name, name),
            slug = COALESCE(p_slug, slug),
            description = COALESCE(p_description, description),
            collection_id = COALESCE(p_collection_id, collection_id),
            category_id = COALESCE(p_category_id, category_id),
            sub_category_id = COALESCE(p_sub_category_id, sub_category_id),
            gender = COALESCE(p_gender, gender),
            base_price = COALESCE(p_base_price, base_price),
            discount_percentage = COALESCE(p_discount_percentage, discount_percentage),
            stock = COALESCE(p_stock, stock),
            net_weight = COALESCE(p_net_weight, net_weight),
            gross_weight = COALESCE(p_gross_weight, gross_weight),
            diamond_weight = COALESCE(p_diamond_weight, diamond_weight),
            diamond_shape_id = COALESCE(p_diamond_shape_id, diamond_shape_id),
            is_active = COALESCE(p_is_active, is_active),
            is_featured = COALESCE(p_is_featured, is_featured),
            updated_at = NOW()
        WHERE id = p_product_id
        RETURNING * INTO v_prod_record;
        
        v_prod_id := p_product_id;
    ELSE
        INSERT INTO products (
            sku, name, slug, description, collection_id, category_id, sub_category_id,
            gender, base_price, discount_percentage, stock, net_weight, gross_weight,
            diamond_weight, diamond_shape_id, is_active, is_featured
        ) VALUES (
            p_sku, p_name, p_slug, p_description, p_collection_id, p_category_id, p_sub_category_id,
            p_gender, COALESCE(p_base_price, 0.00), COALESCE(p_discount_percentage, 0.00), COALESCE(p_stock, 0),
            p_net_weight, p_gross_weight, p_diamond_weight, p_diamond_shape_id,
            COALESCE(p_is_active, TRUE), COALESCE(p_is_featured, FALSE)
        )
        RETURNING * INTO v_prod_record;
        
        v_prod_id := v_prod_record.id;
    END IF;

    -- 3. Process Variations and Media Mappings if provided
    IF p_variations_media IS NOT NULL AND jsonb_typeof(p_variations_media) = 'array' AND jsonb_array_length(p_variations_media) > 0 THEN
        -- Delete existing product variations (cascade deletes media_mapping)
        DELETE FROM product_variations WHERE product_id = v_prod_id;

        FOR v_item IN SELECT * FROM jsonb_array_elements(p_variations_media) LOOP
            v_color_id := (v_item->>'color_id')::UUID;
            v_karat_id := (v_item->>'karat_id')::UUID;

            IF v_color_id IS NOT NULL AND v_karat_id IS NOT NULL THEN
                -- Insert product variation
                INSERT INTO product_variations (
                    product_id, color_id, karat_id
                ) VALUES (
                    v_prod_id, v_color_id, v_karat_id
                )
                ON CONFLICT (product_id, color_id, karat_id) DO UPDATE SET updated_at = NOW()
                RETURNING id INTO v_var_id;

                -- Extract Media details
                v_thumb := v_item->'media_mapping'->>'thumbnail';
                v_vid := v_item->'media_mapping'->>'video';
                
                IF jsonb_typeof(v_item->'media_mapping'->'images') = 'array' THEN
                    SELECT ARRAY(
                        SELECT jsonb_array_elements_text(v_item->'media_mapping'->'images')
                        LIMIT 5
                    ) INTO v_imgs;
                ELSE
                    v_imgs := '{}'::TEXT[];
                END IF;

                -- Insert Media Mapping
                INSERT INTO media_mapping (
                    product_variation_id, thumbnail, images, video
                ) VALUES (
                    v_var_id, v_thumb, COALESCE(v_imgs, '{}'::TEXT[]), v_vid
                )
                RETURNING id INTO v_media_id;

                -- Get Color & Karat Names for JSONB snapshot
                SELECT name INTO v_color_name FROM colors WHERE id = v_color_id;
                SELECT name INTO v_karat_name FROM karats WHERE id = v_karat_id;

                -- Build JSONB snapshot entry
                v_combo_snapshot := v_combo_snapshot || jsonb_build_object(
                    'color_id', v_color_id,
                    'karat_id', v_karat_id,
                    'gold_color', COALESCE(v_color_name, ''),
                    'gold_karat', COALESCE(v_karat_name, ''),
                    'product_variation_id', v_var_id,
                    'media_mapping_id', v_media_id,
                    'media_mapping', jsonb_build_object(
                        'thumbnail', COALESCE(v_thumb, ''),
                        'images', to_jsonb(COALESCE(v_imgs, '{}'::TEXT[])),
                        'video', COALESCE(v_vid, '')
                    )
                );
            END IF;
        END LOOP;

        -- 4. Synchronize products.variation_combo with generated snapshot
        UPDATE products
        SET variation_combo = v_combo_snapshot,
            updated_at = NOW()
        WHERE id = v_prod_id;
    END IF;

    -- Return full result
    SELECT * INTO v_prod_record FROM products WHERE id = v_prod_id;

    RETURN jsonb_build_object(
        'success', true,
        'product_id', v_prod_id,
        'product', to_jsonb(v_prod_record),
        'variation_combo', v_prod_record.variation_combo
    );
END;
$$;
```

---

## 5. Product Retrieval Function (`get_latest_products_by_collection`)

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
    base_price NUMERIC,
    discount_percentage NUMERIC,
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
    diamond_shape_name TEXT,
    image TEXT,
    carats JSONB,
    colors JSONB,
    variation_combo JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_collection_id UUID := NULL;
BEGIN
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
        p.base_price,
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
        ds.name AS diamond_shape_name,
        COALESCE(
            (
                SELECT mm.thumbnail 
                FROM product_variations pv 
                JOIN media_mapping mm ON mm.product_variation_id = pv.id 
                WHERE pv.product_id = p.id AND mm.thumbnail IS NOT NULL AND mm.thumbnail != '' 
                LIMIT 1
            ),
            ''
        ) AS image,
        COALESCE(
            (
                SELECT jsonb_agg(DISTINCT k.name)
                FROM product_variations pv
                JOIN karats k ON k.id = pv.karat_id
                WHERE pv.product_id = p.id
            ),
            '[]'::jsonb
        ) AS carats,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object('id', cl.id, 'name', cl.name, 'hex_code', cl.hex_code))
                FROM (
                    SELECT DISTINCT ON (c.id) c.id, c.name, c.hex_code
                    FROM product_variations pv
                    JOIN colors c ON c.id = pv.color_id
                    WHERE pv.product_id = p.id
                ) cl
            ),
            '[]'::jsonb
        ) AS colors,
        p.variation_combo,
        p.created_at
    FROM prod_list p
    LEFT JOIN collections col ON col.id = p.collection_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN sub_categories sub ON sub.id = p.sub_category_id
    LEFT JOIN diamond_shapes ds ON ds.id = p.diamond_shape_id
    ORDER BY p.created_at DESC;
END;
$$;
```

---

## 6. Cart Synchronization Function (`sync_user_cart`)

```sql
CREATE OR REPLACE FUNCTION sync_user_cart(
    p_user_id UUID,
    p_cart_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_item_key TEXT;
    v_prod_id UUID;
    v_qty INT;
    v_stock INT;
    v_sync_result JSONB := '[]'::jsonb;
BEGIN
    -- 1. User Authorization Check
    IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized cart sync for user %', p_user_id;
    END IF;

    -- 2. Clear existing database cart items for user
    DELETE FROM cart_items WHERE user_id = p_user_id;

    -- 3. Loop and validate stock for incoming cart items
    IF p_cart_items IS NOT NULL AND jsonb_typeof(p_cart_items) = 'array' AND jsonb_array_length(p_cart_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items) LOOP
            v_prod_id := (v_item->>'id')::UUID;
            v_item_key := COALESCE(v_item->>'key', (v_item->>'id'));
            v_qty := COALESCE((v_item->>'quantity')::INT, 1);

            -- Validate available product stock
            SELECT stock INTO v_stock FROM products WHERE id = v_prod_id;
            IF v_stock IS NOT NULL AND v_stock >= 0 THEN
                v_qty := LEAST(v_qty, v_stock);
            END IF;

            IF v_qty > 0 THEN
                INSERT INTO cart_items (
                    user_id, product_id, item_key, quantity, sku, variation_combo
                ) VALUES (
                    p_user_id,
                    v_prod_id,
                    v_item_key,
                    v_qty,
                    v_item->>'sku',
                    COALESCE(v_item->'variation_combo', v_item->'variationCombo', '{}'::jsonb)
                );

                v_sync_result := v_sync_result || jsonb_build_object(
                    'key', v_item_key,
                    'id', v_prod_id,
                    'quantity', v_qty,
                    'stock', COALESCE(v_stock, 999)
                );
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'synced_items', v_sync_result
    );
END;
$$;
```

---

## 7. Orders Table & Secure Payment Verification Flow

```sql
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    shipping_address JSONB NOT NULL DEFAULT '{}'::JSONB,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'razorpay',
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned')),
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

-- Row Level Security (RLS) Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users cannot insert orders directly"
ON orders FOR INSERT
WITH CHECK (false);

CREATE POLICY "Users cannot update orders directly"
ON orders FOR UPDATE
USING (false);
```

```sql
CREATE OR REPLACE FUNCTION verify_order_payment_and_reduce_stock(
    p_order_id UUID,
    p_razorpay_payment_id TEXT,
    p_razorpay_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item JSONB;
    v_prod_id UUID;
    v_qty INT;
BEGIN
    -- 1. Lock order row for update
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found.');
    END IF;

    IF v_order.payment_status = 'Paid' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Order is already marked as Paid.');
    END IF;

    -- 2. Update order payment and order status
    UPDATE orders
    SET payment_status = 'Paid',
        order_status = 'Confirmed',
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_signature = p_razorpay_signature,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 3. Reduce stock for each product in items snapshot
    IF v_order.items IS NOT NULL AND jsonb_typeof(v_order.items) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items) LOOP
            v_prod_id := (v_item->>'product_id')::UUID;
            v_qty := (v_item->>'quantity')::INT;

            IF v_prod_id IS NOT NULL AND v_qty > 0 THEN
                UPDATE products
                SET stock = GREATEST(0, stock - v_qty),
                    updated_at = NOW()
                WHERE id = v_prod_id;
            END IF;
        END LOOP;
    END IF;

    -- 4. Clear user's cart
    DELETE FROM cart_items WHERE user_id = v_order.user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Order payment verified, stock deducted, and cart cleared.'
    );
END;
$$;
```

---

## 8. Admin Product Creation Flow

1. **Step 1 — Product Information**:
   - SKU, Name, Slug, Description
   - Collection, Category, Subcategory
   - Gender, Base Price, Discount Percentage, Stock
   - Net Weight, Gross Weight, Diamond Weight, Diamond Shape
2. **Step 2 — Select Gold Colors**:
   - Display gold colors from `colors` table (Yellow Gold, Rose Gold, White Gold, etc.).
3. **Step 3 — Fetch Available Karats**:
   - For each selected color, fetch available Karats from `color_karats` (e.g. 14K, 18K, 22K).
4. **Step 4 — Generate Variations**:
   - Generate valid `Gold Karat + Gold Color` combinations selected by admin (e.g., `14K Yellow Gold`, `18K Yellow Gold`, `14K Rose Gold`).
5. **Media Upload per Variation**:
   - Upload Thumbnail (1 image path)
   - Upload Detail Images (array max 5 images)
   - Upload Video (optional video path)
6. **Product Save Operation**:
   - Calls Supabase `save_product_with_variations` RPC function.
   - Inserts product in `products`, variations in `product_variations`, media paths in `media_mapping`, builds `variation_combo` snapshot, and commits safely in a single transaction.
