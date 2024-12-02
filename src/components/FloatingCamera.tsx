import React, { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
  cameraResolution: "landscape" | "portrait";
}

const FloatingCamera = ({ videoRef, isVisible, cameraResolution }: FloatingCameraProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current && videoRef.current.srcObject) {
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
          toast({
            variant: "destructive",
            title: "Camera Preview Error",
            description: "Failed to display camera preview. Please check your camera settings."
          });
        }
      } else {
        console.log('No video source available for floating camera');
      }
    };

    if (isVisible) {
      playVideo();
    }
  }, [videoRef.current?.srcObject, isVisible, toast]);

  if (!isVisible) {
    return null;
  }

  // Adjust dimensions based on resolution
  const containerClasses = cameraResolution === "portrait"
    ? "w-[135px] h-[240px]"  // Portrait dimensions (9:16 ratio)
    : "w-[240px] h-[135px]"; // Landscape dimensions (16:9 ratio)

  return (
    <div 
      className={`fixed bottom-4 right-4 z-[100] ${containerClasses} rounded-2xl overflow-hidden bg-black/10`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover [transform:scaleX(-1)]"
      />
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default FloatingCamera;