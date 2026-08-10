import Image from 'next/image'

const CustomImg = ({srcAttr, altAttr, className, titleAttr, width, height, containerClassName = "", priority, unoptimized}) => {
  if (!srcAttr) return null;

  const imageProps = {
    src: srcAttr,
    alt: altAttr || "",
    title: titleAttr,
    className: className,
  };

  if (width !== undefined) imageProps.width = width;
  if (height !== undefined) imageProps.height = height;
  if (priority !== undefined) imageProps.priority = priority;
  if (unoptimized !== undefined) imageProps.unoptimized = unoptimized;

  return (
    <div className={containerClassName}>
      <Image {...imageProps} />
    </div>
  );
};

export default CustomImg;