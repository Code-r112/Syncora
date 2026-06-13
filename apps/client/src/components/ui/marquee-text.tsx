import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export const MarqueeText = ({ children, className, speed = 15 }: MarqueeTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    
    checkOverflow();
    // Re-check on resize or when content changes
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  return (
    <div ref={containerRef} className={cn("overflow-hidden whitespace-nowrap w-full relative", className)}>
      <div 
        className={cn(
          "inline-block",
          isOverflowing && "animate-marquee w-max"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        <span ref={textRef} className={cn("inline-block", isOverflowing && "pr-8")}>
          {children}
        </span>
        {isOverflowing && (
          <span className="inline-block pr-8" aria-hidden="true">
            {children}
          </span>
        )}
      </div>
    </div>
  );
};
