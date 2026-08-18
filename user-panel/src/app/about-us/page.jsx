import HeroBanner from "@/components/heroBanner";
import React from "react";
import aboutUs from "@/assets/about-us/about-us.webp";
import aboutUsMobile from "@/assets/about-us/about-us-small.webp";
import aboutUsZigZag1 from "@/assets/about-us/aboutUs1.webp";
import aboutUsZigZag2 from "@/assets/about-us/aboutUs2.webp";
import aboutUsZigZag3 from "@/assets/about-us/aboutUs3.webp";
import aboutUsZigCollection1 from "@/assets/about-us/aboutUsCollection1.webp";
import aboutUsZigCollection2 from "@/assets/about-us/aboutUsCollection2.webp";
import Zigzag from "@/components/zigzag";
import AboutCollectionAccordion from "@/components/AboutCollectionAccordion";

export const metadata = {
  title: "About Us | Luxora Jewellers",
  description:
    "Learn about our heritage, craft, and passion for fine handmade jewelry.",
};

const aboutUsContent = {
  section1: {
    title: "Luxury with Integrity",
    description: [
      "At Luxora, we believe true luxury should be as responsible as it is beautiful. Our promise begins with how we source and continues through every stage of craftsmanship. Each piece is crafted using lab-grown diamonds that are chemically and visually identical to mined ones, yet have a significantly lighter environmental impact. By choosing sustainable and conscious materials, we embrace a vision of beauty that honors not only the wearer but also the world we share.",
      "Our jewelry is designed to make you feel confident, proud, and connected to your values. With uncompromising attention to detail, artistry, and design, every Luxora creation reflects refined taste and modern responsibility. To us, luxury is not just about brilliance it’s about meaning. That is why our definition of luxury is thoughtful, ethical, and timeless in its beauty.",
    ],
    img: aboutUsZigZag1,
    position: "right",
  },
  section2: {
    title: "Our Beginning",
    description: [
      "Luxora began with a simple belief: luxury can be both beautiful and responsible. Frustrated by the compromises often found in traditional fine jewelry, we set out to create a brand where ethics and elegance go hand in hand. Inspired by the possibilities of lab-grown diamonds, we envisioned a new kind of luxury one that aligns with modern values without sacrificing quality or style.",
      "What started as a vision has grown into a collection of timeless pieces made for those who care about what they wear and how it's made. Every Luxora design is a reflection of our journey rooted in craftsmanship, shaped by innovation, and driven by purpose. We’re proud to offer jewelry that feels as good as it looks because doing good is always in style.",
    ],
    img: aboutUsZigZag2,
    position: "left",
  },
  section3: {
    title: "Our Value",
    list: [
      "Ethical Sourcing : We exclusively use lab-grown diamonds, offering the same brilliance as mined stones without the environmental or ethical cost.",
      "Conscious Luxury : Our designs combine timeless elegance with modern responsibility. Sustainability isn’t a trend, it’s our foundation.",
      "True Craftsmanship : Every piece is carefully crafted by skilled artisans, with attention to detail, quality, and durability that lasts.",
      "Meaningful Design : We create jewelry that tells your story elevated, intentional, and made to celebrate who you are.",
      "Timeless Over Trend : Luxora is not about fast fashion. We design pieces that transcend seasons and stay with you for life.",
    ],
    img: aboutUsZigZag3,
    position: "right",
  },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* Hero Banner */}
      <HeroBanner
        src={aboutUs}
        mobileSrc={aboutUsMobile}
        title="About Us"
        desc="Discover our rich heritage, master craftsmanship, and unwavering commitment to timeless luxury jewelry."
        contentClass="absolute inset-0 flex flex-col justify-end items-center text-center p-4 sm:p-8 md:p-12 lg:p-16 text-black space-y-2 sm:space-y-3 pb-6 sm:pb-10 md:pb-14 lg:pb-16"
        titleClass="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black text-center"
        descClass="text-xs sm:text-base lg:text-lg font-medium max-w-2xl text-black/80 text-center px-2"
      />

      {/* Intro Text Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 2xl:py-20">
        <div className="flex flex-col gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
          <p className="text-gray-700 text-sm sm:text-base md:text-lg 2xl:text-xl leading-relaxed">
            Welcome to <strong>Luxora</strong>—a world where timeless elegance
            meets modern values. Born from a desire to offer beauty without
            compromise, Luxora is committed to crafting high-end jewelry that
            reflects both style and purpose. We believe luxury should feel
            personal, responsible, and lasting.
          </p>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg 2xl:text-xl leading-relaxed">
            Our pieces are designed using premium lab-grown diamonds, offering
            brilliance and sparkle without an ethical or environmental toll.
            Each creation is brought to life by skilled artisans who ensure
            every detail is perfection.
          </p>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg 2xl:text-xl leading-relaxed">
            At Luxora, jewelry is part of your story. Whether celebrating a
            milestone or treating yourself, every piece feels as meaningful as
            it looks—luxury that is beautiful inside and out.
          </p>
        </div>
      </section>

      {/* Zigzag Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20 space-y-12 lg:space-y-20">
        {Object.values(aboutUsContent).map((section, index) => (
          <Zigzag key={index} {...section} />
        ))}
      </section>

      {/* Accordion Collection Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16">
        <AboutCollectionAccordion
          img1={aboutUsZigCollection1}
          img2={aboutUsZigCollection2}
        />
      </section>
    </div>
  );
}
