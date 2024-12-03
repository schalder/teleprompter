import React, { useEffect } from "react";

interface VideoPreviewProps {
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  cameraResolution: "landscape" | "portrait";
}

const VideoPreview = ({ previewVideoRef, cameraResolution }: VideoPreviewProps) => {
  useEffect(() => {
    const videoElement = previewVideoRef.current;
    if (!videoElement) return;

    const handleSuccess = () => {
      console.log('Video preview started successfully');
    };

    videoElement.addEventListener('playing', handleSuccess);

    return () => {
      videoElement.removeEventListener('playing', handleSuccess);
    };
  }, [previewVideoRef]);

  return (
    <div className={`relative ${cameraResolution === "portrait" ? "w-[240px] h-[427px]" : "w-full aspect-video"} mx-auto bg-gray-800 rounded-lg overflow-hidden`}>
      <video
        ref={previewVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover [transform:scaleX(-1)]"
      />
    </div>
  );
};

export default VideoPreview;