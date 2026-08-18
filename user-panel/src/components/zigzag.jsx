import React from "react";
import CustomImg from "./CustomImg";

const Zigzag = ({
  title = "",
  description = [],
  img = "",
  list = [],
  position = "left",
  imageClassName = "",
  contentClassName = "",
  titleClassName = "",
  descClassName = "",
  altAttr = "",
  titleAttr = "",
  className = "",
}) => {
  const isRight = position === "right";

  const descList = Array.isArray(description)
    ? description
    : description
      ? [description]
      : [];

  return (
    <div
      className={`flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto ${
        isRight ? "lg:flex-row-reverse" : "lg:flex-row"
      } ${className}`}
    >
      {/* Image Column */}
      {img && (
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className={`w-full${imageClassName}`}>
            <CustomImg
              srcAttr={img}
              altAttr={altAttr || title}
              titleAttr={titleAttr || title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content Column */}
      <div
        className={`w-full ${
          img ? "lg:w-1/2" : "w-full"
        } space-y-3 sm:space-y-4 ${contentClassName}`}
      >
        {title && (
          <h2
            className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight ${titleClassName}`}
          >
            {title}
          </h2>
        )}

        {descList.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {descList.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className={`text-gray-600 text-sm sm:text-base 3xl:text-lg leading-relaxed ${descClassName}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {list && list.length > 0 && (
          <ol className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
            {list.map((listItem, lIdx) => {
              const parts =
                typeof listItem === "string" ? listItem.split(":") : [listItem];
              const hasTitle = parts.length > 1;

              return (
                <li
                  key={lIdx}
                  className="flex items-start gap-2.5 sm:gap-3 text-sm sm:text-base 3xl:text-lg text-gray-600 leading-relaxed"
                >
                  <span className="font-semibold text-gray-900 shrink-0 min-w-5">
                    {lIdx + 1}.
                  </span>
                  <div>
                    {hasTitle ? (
                      <>
                        <strong className="font-semibold text-gray-900">
                          {parts[0].trim()}
                        </strong>
                        {" : "}
                        {parts.slice(1).join(":").trim()}
                      </>
                    ) : (
                      listItem
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Zigzag;
