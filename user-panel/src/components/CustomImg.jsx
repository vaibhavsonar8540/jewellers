"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80";

const CustomImg = ({
  srcAttr,
  src,
  altAttr,
  alt,
  className,
  titleAttr,
  width,
  height,
  containerClassName = "",
  priority,
  unoptimized,
}) => {
  const [error, setError] = useState(false);

  const rawSrc = srcAttr || src;
  const rawAlt = altAttr || alt || "Jewellery Product";

  if (!rawSrc || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2 ${containerClassName || "w-full h-full"}`}>
        <Package className="w-6 h-6 stroke-1 text-gray-300" />
        <span className="text-[9px] font-mono mt-0.5 text-gray-400">Jewellery</span>
      </div>
    );
  }

  const isExternal = typeof rawSrc === "string" && (rawSrc.startsWith("http://") || rawSrc.startsWith("https://"));

  const imageProps = {
    src: rawSrc,
    alt: rawAlt,
    title: titleAttr,
    className: className,
    onError: () => setError(true),
  };

  if (width !== undefined) imageProps.width = width;
  if (height !== undefined) imageProps.height = height;
  if (priority !== undefined) imageProps.priority = priority;
  if (unoptimized !== undefined || isExternal) imageProps.unoptimized = true;

  return (
    <div className={containerClassName}>
      <Image {...imageProps} />
    </div>
  );
};

export default CustomImg;