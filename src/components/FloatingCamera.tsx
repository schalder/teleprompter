import React, { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

interface FloatingCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVisible: boolean;
  cameraResolution: "landscape" | "portrait";
}

const FloatingCamera = ({ videoRef, isVisible, cameraResolution }: FloatingCameraProps) => {
  const { toast } = useToast();
  const hasAttemptedPlay = useRef(false);
  const floatingVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVideo = async () => {
      if (!videoRef.current || !floatingVideoRef.current) return;

      try {
        const stream = videoRef.current.srcObject as MediaStream;
        if (!stream) {
          console.error('No stream available for floating camera');
          return;
        }

        // Create a new video-only stream for floating camera
        const videoOnlyStream = new MediaStream();
        stream.getVideoTracks().forEach(track => {
          videoOnlyStream.addTrack(track);
        });

        // Reset play attempt when stream changes
        if (hasAttemptedPlay.current && floatingVideoRef.current.srcObject !== videoOnlyStream) {
          hasAttemptedPlay.current = false;
        }

        if (!hasAttemptedPlay.current) {
          hasAttemptedPlay.current = true;
          
          floatingVideoRef.current.srcObject = videoOnlyStream;
          floatingVideoRef.current.muted = true;
          floatingVideoRef.current.volume = 0;
          
          // Wait for metadata to load first
          if (floatingVideoRef.current.readyState === 0) {
            await new Promise<void>((resolve) => {
              floatingVideoRef.current!.addEventListener('loadedmetadata', () => resolve(), { once: true });
            });
          }

          await floatingVideoRef.current.play();
          console.log('Floating camera playing successfully', {
            readyState: floatingVideoRef.current.readyState,
            videoWidth: floatingVideoRef.current.videoWidth,
            videoHeight: floatingVideoRef.current.videoHeight,
            muted: floatingVideoRef.current.muted,
            volume: floatingVideoRef.current.volume,
            videoTracks: videoOnlyStream.getVideoTracks().length,
            audioTracks: videoOnlyStream.getAudioTracks().length
          });
        }
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
      playVideo();
    }

    return () => {
      if (floatingVideoRef.current) {
        floatingVideoRef.current.pause();
        floatingVideoRef.current.srcObject = null;
      }
      hasAttemptedPlay.current = false;
    };
  }, [videoRef.current?.srcObject, isVisible, toast]);

  if (!isVisible) return null;

  const containerClasses = cameraResolution === "portrait"
    ? "w-[135px] h-[240px]"
    : "w-[240px] h-[135px]";

  return (
    <div className={`fixed bottom-4 right-4 z-[100] ${containerClasses} rounded-2xl overflow-hidden shadow-lg`}>
      <div className="relative w-full h-full">
        <video
          ref={floatingVideoRef}
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