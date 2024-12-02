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
          
          // Log video element dimensions and stream tracks
          const tracks = (videoRef.current.srcObject as MediaStream).getVideoTracks();
          console.log('Video tracks:', tracks.map(t => ({
            enabled: t.enabled,
            muted: t.muted,
            settings: t.getSettings()
          })));
          
          console.log('Video element dimensions:', {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
            clientWidth: videoRef.current.clientWidth,
            clientHeight: videoRef.current.clientHeight
          });
        } catch (error) {
          console.error('Error playing floating camera:', error);
        }
      } else {
        console.log('No video source available for floating camera');
      }
    };

    playVideo();
  }, [videoRef.current?.srcObject]);

  if (!isVisible) {
    return null;
  }

  // Adjust dimensions based on resolution
  const containerClasses = cameraResolution === "portrait"
    ? "w-[135px] h-[240px]"  // Portrait dimensions (9:16 ratio)
    : "w-[240px] h-[135px]"; // Landscape dimensions (16:9 ratio)

  console.log('Floating camera rendering with resolution:', cameraResolution);
  console.log('Container classes:', containerClasses);
  console.log('Stream object:', videoRef.current?.srcObject ? 'Present' : 'Missing');

  return (
    <div 
      className={`fixed bottom-4 right-4 z-[100] ${containerClasses} rounded-2xl overflow-hidden shadow-lg`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
      />
    </div>
  );
};

export default FloatingCamera;