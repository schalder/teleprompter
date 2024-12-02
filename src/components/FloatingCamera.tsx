import React, { useEffect } from "react";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
}

const FloatingCamera = ({ videoRef, isVisible }: FloatingCameraProps) => {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Error playing floating camera:', error);
      });
    }
  }, [videoRef.current?.srcObject]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg overflow-hidden shadow-lg animate-fade-in">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-[240px] h-[135px] object-cover [transform:scaleX(-1)]"
      />
    </div>
  );
};

export default FloatingCamera;