import React, { useEffect } from "react";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
}

const FloatingCamera = ({ videoRef, isVisible }: FloatingCameraProps) => {
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log('Attempting to play floating camera');
      videoRef.current.play().catch(error => {
        console.error('Error playing floating camera:', error);
      });
    }
  }, [videoRef.current?.srcObject]);

  if (!isVisible) {
    console.log('Floating camera not visible');
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[240px] h-[135px] bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover [transform:scaleX(-1)]"
      />
    </div>
  );
};

export default FloatingCamera;