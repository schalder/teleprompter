import React, { useEffect, useRef } from "react";

interface TeleprompterPreviewProps {
  text: string;
  fontSize: number;
  speed: number;
  isScrolling: boolean;
}

const TeleprompterPreview = ({ text, fontSize, speed, isScrolling }: TeleprompterPreviewProps) => {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isScrolling && textRef.current) {
      const scrollHeight = textRef.current.scrollHeight;
      // Start with text visible at the top of the screen (0 position)
      let start = 0;
      const animateScroll = () => {
        // Divide speed by 10 to make the scrolling slower
        start -= speed / 10;
        if (start <= -scrollHeight) {
          start = 0;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${start}px)`;
        }
        requestAnimationFrame(animateScroll);
      };
      animateScroll();
    }
  }, [isScrolling, speed]);

  return (
    <div className="overflow-hidden">
      <div
        ref={textRef}
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