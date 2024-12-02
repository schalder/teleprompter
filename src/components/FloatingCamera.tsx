import React, { useEffect } from "react";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
  cameraResolution: "landscape" | "portrait";
}

const FloatingCamera = ({ videoRef, isVisible, cameraResolution }: FloatingCameraProps) => {
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

  // Adjust dimensions based on resolution
  const containerClasses = cameraResolution === "portrait"
    ? "w-[135px] h-[240px]"  // Portrait dimensions (swapped)
    : "w-[240px] h-[135px]"; // Landscape dimensions (original)

  const videoClasses = cameraResolution === "portrait"
    ? "w-full h-full object-cover [transform:scaleX(-1)]"
    : "w-full h-full object-cover [transform:scaleX(-1)]";

  console.log('Floating camera rendering with resolution:', cameraResolution);
  console.log('Container classes:', containerClasses);
  console.log('Video element classes:', videoClasses);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${containerClasses} bg-gray-900 rounded-lg overflow-hidden shadow-lg`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={videoClasses}
      />
    </div>
  );
};

export default FloatingCamera;