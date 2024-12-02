import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDeviceManagement } from "./useDeviceManagement";
import { useStreamSetup } from "./useStreamSetup";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCaptureStream = useRef<MediaStream | null>(null);
  
  const { 
    checkDeviceAvailability, 
    hasPermission,
    permissionRequested,
    deviceCheckAttempts 
  } = useDeviceManagement();
  
  const { setupStream } = useStreamSetup();

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    try {
      // Stop any existing streams
      if (previewStream) {
        previewStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        stream = await setupStream(
          recordingType,
          cameraResolution,
          selectedVideoDeviceId,
          selectedAudioDeviceId
        );
      } else if (recordingType === "screen") {
        if (!screenCaptureStream.current) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              frameRate: { ideal: 30 }
            },
            audio: true
          });
          screenCaptureStream.current = stream;
        } else {
          stream = screenCaptureStream.current;
        }
      }

      if (stream) {
        // Create a video-only stream for preview
        const videoOnlyStream = new MediaStream(
          stream.getVideoTracks()
        );
        
        setPreviewStream(stream); // Keep full stream for recording
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = videoOnlyStream;
          previewVideoRef.current.muted = true;
          await previewVideoRef.current.play();
          console.log('Preview started successfully');
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
      
      if (!permissionRequested.current) {
        let errorMessage = "Please grant camera and microphone permissions when prompted.";
        
        if (error instanceof Error) {
          if (error.name === "NotFoundError") {
            errorMessage = "No camera found. Please ensure your device has a camera.";
          } else if (error.name === "NotReadableError" || error.name === "AbortError") {
            errorMessage = "Camera is in use by another app. Please close other camera apps.";
          } else if (error.name === "NotAllowedError") {
            errorMessage = "Camera access denied. Please check your browser settings and try again.";
          }
        }

        toast({
          variant: "destructive",
          title: "Camera Access Required",
          description: errorMessage,
        });
      }
      
      hasPermission.current = false;
      permissionRequested.current = true;
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    if (screenCaptureStream.current) {
      screenCaptureStream.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      screenCaptureStream.current = null;
    }
    permissionRequested.current = false;
    deviceCheckAttempts.current = 0;
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
    screenCaptureStream: screenCaptureStream.current
  };
};