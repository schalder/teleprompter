import React, { useEffect } from "react";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
  cameraResolution: "landscape" | "portrait";
}

const FloatingCamera = ({ videoRef, isVisible, cameraResolution }: FloatingCameraProps) => {
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log('Attempting to play floating camera');
        try {
          await videoRef.current.play();
          console.log('Floating camera playing successfully');
        } catch (error) {
          console.error('Error playing floating camera:', error);
        }
      }
    };

    playVideo();
  }, [videoRef.current?.srcObject]);

  if (!isVisible) {
    console.log('Floating camera not visible');
    return null;
  }

  // Adjust dimensions based on resolution
  const containerClasses = cameraResolution === "portrait"
    ? "w-[135px] h-[240px]"  // Portrait dimensions (9:16 ratio)
    : "w-[240px] h-[135px]"; // Landscape dimensions (16:9 ratio)

  // Video classes with proper sizing and positioning
  const videoClasses = cameraResolution === "portrait"
    ? "absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]"
    : "absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]";

  console.log('Floating camera rendering with resolution:', cameraResolution);
  console.log('Container classes:', containerClasses);
  console.log('Stream object:', videoRef.current?.srcObject ? 'Present' : 'Missing');
  console.log('Video classes:', videoClasses);

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 ${containerClasses} bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700 relative`}
    >
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