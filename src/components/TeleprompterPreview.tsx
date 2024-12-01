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

    if (isScrolling) {
      // Reset position first
      container.style.transform = 'translateY(0)';
      
      // Calculate total scroll distance and duration
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const duration = (scrollHeight * (100 - speed)) / 25; // Adjusted speed factor
      const startTime = performance.now();

      // Animate scroll
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        const currentScroll = progress * scrollHeight;
        container.style.transform = `translateY(-${currentScroll}px)`;

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Reset position when not scrolling
      container.style.transform = 'translateY(0)';
    }

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      container.style.transform = 'translateY(0)';
    };
  }, [isScrolling, speed, text]);

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg overflow-hidden h-[400px] relative">
      <div
        ref={containerRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          transition: 'none', // Remove CSS transition to use RAF
        }}
      >
        {text || "Your text will appear here..."}
      </div>
    </div>
  );
};

export default TeleprompterPreview;