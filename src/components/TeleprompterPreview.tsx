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

    let animationFrameId: number;
    const scrollContainer = container.parentElement;
    if (!scrollContainer) return;

    if (isScrolling) {
      // Reset scroll position
      scrollContainer.scrollTop = 0;
      
      // Calculate total scroll distance and duration
      const totalScrollHeight = container.scrollHeight - scrollContainer.clientHeight;
      
      // Adjusted speed calculation to make it even slower
      // Now speed of 1 is extremely slow, and 100 is moderately fast
      const scrollDuration = (totalScrollHeight * (400 - speed * 2)) / 5; // Doubled base duration for slower scrolling
      const startTime = performance.now();

      // Animate scroll
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        
        if (progress < 1) {
          scrollContainer.scrollTop = progress * totalScrollHeight;
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      // Start animation
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Reset scroll position when not scrolling
      scrollContainer.scrollTop = 0;
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      scrollContainer.scrollTop = 0;
    };
  }, [isScrolling, speed, text]);

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg overflow-y-auto h-[400px] relative">
      <div
        ref={containerRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text || "Your text will appear here..."}
      </div>
    </div>
  );
};

export default TeleprompterPreview;