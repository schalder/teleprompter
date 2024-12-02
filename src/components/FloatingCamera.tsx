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

  useEffect(() => {
    const playVideo = async () => {
      if (!videoRef.current) return;

      try {
        const stream = videoRef.current.srcObject as MediaStream;
        if (!stream) {
          console.error('No stream available for floating camera');
          return;
        }

        // Reset play attempt when stream changes
        if (hasAttemptedPlay.current && videoRef.current.srcObject !== stream) {
          hasAttemptedPlay.current = false;
        }

        if (!hasAttemptedPlay.current) {
          hasAttemptedPlay.current = true;
          
          // Ensure video is muted in multiple ways
          videoRef.current.muted = true;
          videoRef.current.volume = 0;
          
          // Mute all audio tracks in the stream
          stream.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
          
          // Wait for metadata to load first
          if (videoRef.current.readyState === 0) {
            await new Promise<void>((resolve) => {
              videoRef.current!.addEventListener('loadedmetadata', () => resolve(), { once: true });
            });
          }

          // Then wait for enough data to play
          if (videoRef.current.readyState < 2) {
            await new Promise<void>((resolve) => {
              videoRef.current!.addEventListener('loadeddata', () => resolve(), { once: true });
            });
          }

          await videoRef.current.play();
          console.log('Floating camera playing successfully', {
            readyState: videoRef.current.readyState,
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            muted: videoRef.current.muted,
            volume: videoRef.current.volume,
            audioTracks: stream.getAudioTracks().map(track => ({
              enabled: track.enabled,
              muted: track.muted
            }))
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
      if (videoRef.current) {
        videoRef.current.pause();
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
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          defaultMuted={true}
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