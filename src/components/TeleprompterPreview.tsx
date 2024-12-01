import React, { useEffect, useRef } from "react";

interface TeleprompterPreviewProps {
  text: string;
  fontSize: number;
  speed: number;
  isScrolling: boolean;
}

const TeleprompterPreview = ({ text, fontSize, speed, isScrolling }: TeleprompterPreviewProps) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isScrolling && textRef.current) {
      const scrollHeight = textRef.current.scrollHeight;
      let start = 0;

      const animateScroll = () => {
        start -= speed / 50; // Reduced speed factor for smoother scrolling
        if (start <= -scrollHeight) {
          start = 0;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${start}px)`;
        }
        animationFrameRef.current = requestAnimationFrame(animateScroll);
      };

      animationFrameRef.current = requestAnimationFrame(animateScroll);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          if (textRef.current) {
            textRef.current.style.transform = `translateY(0px)`;
          }
        }
      };
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