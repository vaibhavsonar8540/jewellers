import dynamic from "next/dynamic";

export const DynamicSmoothScroll = dynamic(
  () => import("@/components/smoothScroll"),
  { ssr: false }
);

export const DynamicHeroCarousel = dynamic(
  () => import("@/components/heroCarousel"),
  { ssr: false }
);
