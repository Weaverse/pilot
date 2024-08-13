import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface MarqueeProps {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
}
const ANIMATION_SPEED = 100;
export function Marquee({
  children,
  gap = 0,
  speed = ANIMATION_SPEED,
}: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const animationTime = Math.floor(contentWidth / speed);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (contentRef.current && !contentWidth) {
      const { width } = contentRef.current.getBoundingClientRect();
      setContentWidth(width);
    }
  }, []);
  return (
    <div
      className="flex items-center"
      style={
        {
          "--animation-speed": `${animationTime}s`,
          "--gap": `${gap}px`,
        } as CSSProperties
      }
    >
      {contentWidth === 0 ? (
        <div ref={contentRef}>{children}</div>
      ) : (
        <OneView contentWidth={contentWidth} gap={gap}>
          {children}
        </OneView>
      )}
    </div>
  );
}

function OneView({
  children,
  contentWidth,
  gap,
}: {
  children: React.ReactNode;
  contentWidth: number;
  gap: number;
}) {
  const [contentRepeat, setContentRepeat] = useState(0);

  const calculateRepeat = useCallback(() => {
    if (contentWidth < window.innerWidth) {
      // if it is, set the contentRepeat to the number of times the text can fit on the screen
      const repeat = Math.ceil(window.innerWidth / (contentWidth + gap));
      setContentRepeat(repeat);
    }
  }, [contentWidth, gap]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    calculateRepeat();
    window.addEventListener("resize", calculateRepeat);
    return () => {
      window.removeEventListener("resize", calculateRepeat);
    };
  }, []);
  let oneView = (
    <div className="flex" style={{ paddingRight: gap, gap }}>
      {Array.from({ length: contentRepeat || 1 }).map((_, index) => (
        <div key={index} className="shrink-0">
          {children}
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex items-center">
      <div className="shrink-0 animate-marquee">{oneView}</div>
      <div className="shrink-0 animate-marquee">{oneView}</div>
    </div>
  );
}
