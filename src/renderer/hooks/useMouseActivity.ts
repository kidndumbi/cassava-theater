import { useState, useRef, useEffect } from "react";

export const useMouseActivity = () => {
  const [isMouseActive, setIsMouseActive] = useState(false);
  const mouseActivityTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      if (mouseActivityTimeout.current) {
        clearTimeout(mouseActivityTimeout.current);
      }
      mouseActivityTimeout.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 3000); // Hide actions bar after 3 seconds of inactivity
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (mouseActivityTimeout.current) {
        clearTimeout(mouseActivityTimeout.current);
      }
    };
  }, []);

  return isMouseActive;
};
