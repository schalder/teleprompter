import React, { useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface SimpleResizeControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onResize: (dimensions: { width: number; height: number }) => void;
}

export const SimpleResizeControls = ({ videoRef, onResize }: SimpleResizeControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (!videoRef.current || !containerRef.current) return;

    const video = videoRef.current;
    const container = containerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      isResizing.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      currentSize.current = {
        width: video.clientWidth,
        height: video.clientHeight
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      const newWidth = Math.max(200, currentSize.current.width + deltaX);
      const newHeight = Math.max(200, currentSize.current.height + deltaY);

      video.style.width = `${newWidth}px`;
      video.style.height = `${newHeight}px`;
      onResize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        toast({
          title: "Video Resized",
          description: "New dimensions applied to video",
        });
      }
      isResizing.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [videoRef, onResize]);

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize bg-primary/20 rounded-bl"
      title="Drag to resize video"
    />
  );
};