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
    if (containerRef.current && isScrolling) {
      const scrollHeight = containerRef.current.scrollHeight;
      const duration = (scrollHeight * (100 - speed)) / 50;
      
      containerRef.current.style.transition = `transform ${duration}s linear`;
      containerRef.current.style.transform = `translateY(-${scrollHeight}px)`;
    } else if (containerRef.current) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = 'translateY(0)';
    }
  }, [isScrolling, speed, text]); // Added text dependency to reset scroll when text changes

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