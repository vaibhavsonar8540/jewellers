"use client";

import React, { useEffect } from "react";

/**
 * SmoothScroll Component
 * Wraps application children and enables smooth scrolling behavior
 */
const SmoothScroll = ({ children }) => {
  useEffect(() => {
    // Enable CSS smooth scrolling on html element
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;