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
      let start = window.innerHeight;
      const animateScroll = () => {
        start -= speed;
        if (start <= -scrollHeight) {
          start = window.innerHeight;
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
