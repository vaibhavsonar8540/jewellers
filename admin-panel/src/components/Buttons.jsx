import Link from "next/link";

const getVariant = (variant) => {
  switch (variant) {
    case "primaryHover":
      return "bg-white border border-primary text-primary hover:bg-primary hover:text-white";

    case "secondaryHover":
      return "bg-secondary border border-secondary text-white hover:bg-white hover:text-secondary";

    case "whiteHover":
      return "bg-transparent border border-white text-white hover:bg-white hover:text-primary";

    default:
      return "bg-white border border-black text-black hover:bg-black hover:text-white";
  }
};

export const Button = ({
  children,
  className = "",
  variant = "",
  ...props
}) => {
  return (
    <button
      className={`${getVariant(variant)} px-5 py-2 rounded-sm transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const LinkButton = ({
  children,
  href = "",
  className = "",
  variant = "",
}) => {
  return (
    <Link
      href={href}
      className={`${getVariant(
        variant
      )} px-5 py-2 rounded-sm transition-all duration-300 inline-flex items-center justify-center ${className}`}
    >
      {children}
    </Link>
  );
};