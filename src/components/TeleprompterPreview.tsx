import { useEffect, useRef } from "react";

interface TeleprompterPreviewProps {
  text: string;
  fontSize: number;
  speed: number;
  isScrolling: boolean;
}

const TeleprompterPreview = ({ text, fontSize, speed, isScrolling }: TeleprompterPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset position when text changes or scrolling stops
    if (!isScrolling) {
      container.style.transition = 'none';
      container.style.transform = 'translateY(0)';
      return;
    }

    // Calculate scroll duration based on content height and speed
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const duration = (scrollHeight * (100 - speed)) / 50;

    // Start scrolling animation
    requestAnimationFrame(() => {
      container.style.transition = `transform ${duration}s linear`;
      container.style.transform = `translateY(-${scrollHeight}px)`;
    });

    // Cleanup function
    return () => {
      container.style.transition = 'none';
      container.style.transform = 'translateY(0)';
    };
  }, [isScrolling, speed, text]); // Dependencies to reset scroll

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg overflow-hidden h-[400px] relative">
      <div
        ref={containerRef}
        className="transition-transform"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {text || "Your text will appear here..."}
      </div>
    </div>
  );
};

export default TeleprompterPreview;