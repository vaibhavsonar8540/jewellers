import Image from 'next/image'

const CustomImg = ({srcAttr, altAttr, className, titleAttr, width, height, containerClassName = ""}) => {
  if (!srcAttr) return null;

  const imageProps = {
    src: srcAttr,
    alt: altAttr || "",
    title: titleAttr,
    className: className,
  };

  if (width !== undefined) imageProps.width = width;
  if (height !== undefined) imageProps.height = height;

  return (
    <div className={containerClassName}>
      <Image {...imageProps} />
    </div>
  );
};

export default CustomImg;