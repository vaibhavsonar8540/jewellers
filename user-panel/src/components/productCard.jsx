import React from "react";
import Link from "next/link";
import { FaRegHeart, FaHeart } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { addToCartAction, addToWishlistAction, removeFromWishlistAction } from "@/redux/action/commonAction";
import { setIsModelOpen, setFlashMessage } from "@/redux/slices/commonSlice";

import { getMediaUrl, DEFAULT_PLACEHOLDER_IMAGE } from "@/utils/imageUrl";
import { getImgAltTitle } from "@/utils/imgAltTitle";

const ProductCard = ({ data }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const productId = data._id || data.id || "";
  const title = data.productName || data.title || "Product";
  const { title: imgTitle, alt: imgAlt } = getImgAltTitle(title, "PRODUCT_CARD");

  const { cart, wishlist } = useSelector((state) => state.common);
  const isWishlisted = wishlist?.some((item) => {
    const id = item._id || item;
    return id.toString() === productId.toString();
  });
  
  // Resolve image source
  const imgUrl = getMediaUrl(data.thumbnail || data.image);

  const priceVal = data.discountPrice || data.price || 0;
  const discountTag = data.discountPrice && data.price && data.price > data.discountPrice
    ? Math.round(((data.price - data.discountPrice) / data.price) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      dispatch(setFlashMessage({ type: "error", message: "Invalid product details." }));
      return;
    }

    if (!isAuthenticated) {
      dispatch(setFlashMessage({ type: "info", message: "Please sign-in to purchase items." }));
      dispatch(setIsModelOpen(true));
      return;
    }

    const isAlreadyInCart = cart?.items?.some(
      (item) => (item.product?._id || item.product) === productId
    );

    if (isAlreadyInCart) {
      dispatch(setFlashMessage({ type: "warning", message: "Product is already in your cart!" }));
      return;
    }

    try {
      await dispatch(addToCartAction(productId, 1));
      dispatch(setFlashMessage({ type: "success", message: "Added to cart!" }));
    } catch (err) {
      dispatch(setFlashMessage({ type: "error", message: err?.response?.data?.message || "Error adding item to cart." }));
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      dispatch(setFlashMessage({ type: "error", message: "Invalid product details." }));
      return;
    }

    if (!isAuthenticated) {
      dispatch(setFlashMessage({ type: "info", message: "Please sign-in to save items to wishlist." }));
      dispatch(setIsModelOpen(true));
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlistAction(productId));
        dispatch(setFlashMessage({ type: "success", message: "Removed from wishlist!" }));
      } else {
        await dispatch(addToWishlistAction(productId));
        dispatch(setFlashMessage({ type: "success", message: "Added to wishlist!" }));
      }
    } catch (err) {
      dispatch(setFlashMessage({ type: "error", message: err?.response?.data?.message || "Error updating wishlist." }));
    }
  };

  return (
    <div className="group w-full relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 flex flex-col justify-between">
      
      {/* Discount Badge */}
      {discountTag && (
        <div className="absolute left-3 top-3 z-10 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
          {discountTag}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <div
        onClick={handleToggleWishlist}
        className={`absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm border border-gray-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white transition duration-300 ${
          isWishlisted ? "text-red-500 scale-105" : "text-gray-500 hover:text-red-500"
        }`}
      >
        {isWishlisted ? (
          <FaHeart className="text-xs text-red-500 scale-110" />
        ) : (
          <FaRegHeart className="text-xs transition-colors" />
        )}
      </div>

      {/* Product Image */}
      <Link
        href={productId ? `/product/${productId}` : "#"}
        className="flex items-center justify-center overflow-hidden bg-gray-50/40 aspect-4/3 p-4"
      >
        <img
          src={imgUrl}
          alt={imgAlt}
          title={imgTitle}
          className="h-full w-full object-contain"
          onError={(e) => {
            e.target.src = DEFAULT_PLACEHOLDER_IMAGE;
          }}
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 justify-between border-t border-gray-50/50">
        <div className="">
          <Link
            href={productId ? `/product/${productId}` : "#"}
            className="line-clamp-1 text-sm font-bold text-gray-800 hover:text-primary transition capitalize tracking-wide"
          >
            {title}
          </Link>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm font-extrabold text-primary">
              ₹{priceVal}
            </span>
            {data.discountPrice && data.price && data.price > data.discountPrice && (
              <span className="text-[10px] text-gray-400 font-semibold line-through">₹{data.price}</span>
            )}
          </div>
        </div>

        <div className="mt-3 min-h-9 flex items-center justify-center">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full text-xs font-bold py-2.5 px-3 sm:px-4 bg-black hover:bg-gray-900 text-white rounded-xl transition-all duration-300 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 cursor-pointer shadow-md"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;