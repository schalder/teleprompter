import React, { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface VideoPreviewProps {
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  cameraResolution: "landscape" | "portrait";
}

const VideoPreview = ({ previewVideoRef, cameraResolution }: VideoPreviewProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const videoElement = previewVideoRef.current;
    if (!videoElement) return;

    const handleError = () => {
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: "Failed to play video preview. Please check your camera permissions.",
      });
    };

    const handleSuccess = () => {
      console.log('Video preview started successfully');
    };

    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('playing', handleSuccess);

    return () => {
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('playing', handleSuccess);
    };
  }, [previewVideoRef, toast]);

  const aspectRatioClass = cameraResolution === "portrait" 
    ? "aspect-[9/16] max-w-[240px]" 
    : "aspect-[16/9] max-w-full";

  return (
    <div className={`relative ${aspectRatioClass} mx-auto bg-gray-800 rounded-lg overflow-hidden`}>
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