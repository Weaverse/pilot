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
  rollAsNeeded?: boolean;
}
const ANIMATION_SPEED = 100;
export function Marquee({
  children,
  gap = 0,
  speed = ANIMATION_SPEED,
  rollAsNeeded,
}: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (contentRef.current) {
      const { width } = contentRef.current.getBoundingClientRect();
      if (rollAsNeeded) {
        if (width < window.innerWidth) {
          setContentWidth(0);
        } else {
          setContentWidth(width);
        }
      } else {
        setContentWidth(width);
      }
    }
  }, []);
  const maxAnimationTime = 400000; // 100 seconds - slowest speed 0% - 0 speed
  const minAnimationTime = 1000; // 1 second - fastest speed 100% - 100 speed
  const animationTime =
    ((100 - speed) * (maxAnimationTime - minAnimationTime)) / 100 +
    minAnimationTime;
  return (
    <div
      className="flex items-center w-full"
      style={
        {
          "--animation-speed": `${animationTime}ms`,
          "--gap": `${gap}px`,
        } as CSSProperties
      }
    >
      {contentWidth === 0 ? (
        <div ref={contentRef} className="mx-auto">
          {children}
        </div>
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
    } else {
      // setContentRepeat(3);
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
