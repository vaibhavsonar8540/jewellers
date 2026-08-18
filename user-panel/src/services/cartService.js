import { supabase } from "@/lib/db";

/**
 * Service handling all Supabase database & local storage operations for user cart.
 */
export const cartService = {
  /**
   * Helper to determine active cart storage key.
   */
  getStorageKey(userId) {
    return userId ? `jewellers_cart_${userId}` : "jewellers_cart_guest";
  },

  /**
   * Reads cart from local storage cache.
   */
  getLocalCart(userId) {
    try {
      const key = this.getStorageKey(userId);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading local cart:", e);
      return [];
    }
  },

  /**
   * Saves cart to local storage cache.
   */
  setLocalCart(userId, cartItems) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Error saving local cart:", e);
    }
  },

  /**
   * Fetches user-scoped cart items from Supabase `cart_items` table.
   */
  async fetchUserCartFromDb(userId) {
    if (!userId || !supabase) return [];

    const { data: dbCart, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id, name, price, stock, sku,
          media_mapping (thumbnail)
        )
      `)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (!Array.isArray(dbCart) || dbCart.length === 0) {
      return [];
    }

    return dbCart.map((row) => {
      const combo = row.variation_combo || {};
      return {
        key: row.item_key,
        id: row.product_id,
        name: row.products?.name || "Jewelry Item",
        image:
          row.products?.media_mapping?.[0]?.thumbnail ||
          row.products?.image ||
          row.products?.thumbnail ||
          (Array.isArray(row.products?.images) ? row.products?.images[0] : "") ||
          row.image ||
          "",
        purity: combo.purity || row.purity || "",
        ringSize: combo.ring_size || combo.ringSize || row.ring_size || "",
        sku: row.sku || row.products?.sku || "",
        diamondType: combo.diamond_type || combo.diamondType || row.diamond_type || "",
        diamondShape: combo.diamond_shape || combo.diamondShape || row.diamond_shape || "",
        diamondQuality: combo.diamond_quality || combo.diamondQuality || row.diamond_quality || "",
        variation_combo: combo,
        stock: typeof row.products?.stock === "number" ? row.products.stock : 999,
        quantity: row.quantity || 1,
      };
    });
  },

  /**
   * Syncs user cart with Supabase `sync_user_cart` RPC function.
   */
  async syncUserCartToDb(userId, cartItems) {
    if (!userId || !supabase) return null;

    const formattedPayload = cartItems.map((item) => ({
      key: item.key,
      id: item.id,
      quantity: item.quantity,
      sku: item.sku,
      variation_combo: item.variation_combo || {
        color: item.color || "",
        purity: item.purity || "",
        ring_size: item.ringSize || item.ring_size || "",
        diamond_type: item.diamondType || item.diamond_type || "",
        diamond_shape: item.diamondShape || item.diamond_shape || "",
        diamond_quality: item.diamondQuality || item.diamond_quality || "",
      },
    }));

    const { data, error } = await supabase.rpc("sync_user_cart", {
      p_user_id: userId,
      p_cart_items: formattedPayload,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Merges guest local storage items into user cart when user logs in.
   */
  mergeGuestCartIntoUserCart(dbItems) {
    let finalItems = [...dbItems];
    try {
      const guestCart = localStorage.getItem("jewellers_cart_guest");
      if (guestCart) {
        const guestItems = JSON.parse(guestCart);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          guestItems.forEach((gItem) => {
            const idx = finalItems.findIndex((i) => i.key === gItem.key);
            if (idx > -1) {
              finalItems[idx].quantity += gItem.quantity;
            } else {
              finalItems.push(gItem);
            }
          });
          localStorage.removeItem("jewellers_cart_guest");
        }
      }
    } catch (e) {
      console.error("Error merging guest cart:", e);
    }
    return finalItems;
  }
};
