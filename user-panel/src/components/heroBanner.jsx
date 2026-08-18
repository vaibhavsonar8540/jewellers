import React from "react";
import { LinkButton } from "./Buttons";
import CustomImg from "./CustomImg";


const HeroBanner = ({
  title = "",
  desc = "",
  titleClass = "",
  descClass = "",
  btnText = "",
  className = "",
  btnClassName = "",
  href = "",
  src = "",
  srcAttr = "",
  mobileSrc = "",
  altAttr = "",
  titleAttr = "",
  contentClass = "",
  variant = "",
}) => {
  const desktopSrc = srcAttr || src;

  return (
    <div className={`relative ${className}`}>
      {desktopSrc && (
        <CustomImg
          srcAttr={desktopSrc}
          altAttr={altAttr}
          titleAttr={titleAttr}
          containerClassName={mobileSrc ? "hidden lg:block w-full h-full" : "w-full h-full"}
          className="w-full h-full object-cover"
        />
      )}

      {mobileSrc && (
        <CustomImg
          srcAttr={mobileSrc}
          altAttr={altAttr}
          titleAttr={titleAttr}
          containerClassName="block lg:hidden w-full h-full"
          className="w-full h-full object-cover"
        />
      )}

      <div className={`${contentClass}`}>
        <h1 className={`${titleClass}`}>{title}</h1>

        <p className={`${descClass}`}>{desc}</p>

        {btnText && (
          <LinkButton className={btnClassName} href={href} variant={variant}>
            {btnText}
          </LinkButton>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
