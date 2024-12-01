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
        start -= speed / 50;
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
    <div className="overflow-hidden p-4 sm:p-6">
      <div
        ref={textRef}
        className="px-4 sm:px-6 py-8 sm:py-12"
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