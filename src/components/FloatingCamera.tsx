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
      if (!videoRef.current) {
        console.log('Video ref not available');
        return;
      }

      try {
        // Check if we have a valid stream
        const stream = videoRef.current.srcObject as MediaStream;
        
        if (!stream) {
          console.log('No stream available for floating camera');
          return;
        }

        // Log stream details for debugging
        const videoTracks = stream.getVideoTracks();
        console.log('Stream video tracks:', videoTracks.map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          settings: track.getSettings()
        })));

        // Ensure video is ready to play
        if (videoRef.current.readyState >= 2) {
          await videoRef.current.play();
          console.log('Floating camera playing successfully');
        } else {
          console.log('Video not ready to play, waiting for loadeddata event');
          await new Promise((resolve) => {
            videoRef.current!.addEventListener('loadeddata', resolve, { once: true });
          });
          await videoRef.current.play();
        }

        // Log final video element state
        console.log('Video element state:', {
          readyState: videoRef.current.readyState,
          paused: videoRef.current.paused,
          currentTime: videoRef.current.currentTime,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight
        });

      } catch (error) {
        console.error('Error playing floating camera:', error);
        toast({
          variant: "destructive",
          title: "Camera Preview Error",
          description: "Failed to display camera preview. Please check your camera settings."
        });
      }
    };

    if (isVisible && videoRef.current?.srcObject) {
      // Give the DOM a moment to be ready
      requestAnimationFrame(() => {
        playVideo();
      });
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
    <div className={`fixed bottom-4 right-4 z-[100] ${containerClasses} rounded-2xl overflow-hidden shadow-lg`}>
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
        />
        <div 
          className="absolute inset-0 bg-black/10"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default FloatingCamera;