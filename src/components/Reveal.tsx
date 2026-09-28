import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    let observer: IntersectionObserver | undefined;
    const show = () => {
      setVisible(true);
      observer?.disconnect();
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
    const checkPosition = () => {
      if (element.getBoundingClientRect().top < window.innerHeight) show();
    };
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) show();
    }, { threshold: 0.12, rootMargin: "0px 0px 40px 0px" });
    observer.observe(element);
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition);
    requestAnimationFrame(checkPosition);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
