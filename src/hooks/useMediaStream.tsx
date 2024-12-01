import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasAttemptedPermission = useRef(false);

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait"
  ) => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      // Reset permission attempt flag when starting new preview
      hasAttemptedPermission.current = false;

      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        // Detect if running on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Set default resolution based on device type
        const defaultResolution = isMobile ? "portrait" : cameraResolution;
        
        // Request the stream with specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: defaultResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: defaultResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });

        console.log('Camera stream obtained:', stream.getVideoTracks()[0].getSettings());
      } else if (recordingType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            frameRate: { ideal: 30 }
          },
          audio: true
        });
      }

      if (stream) {
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          try {
            await previewVideoRef.current.play();
            hasAttemptedPermission.current = true;
            toast({
              title: "Preview started",
              description: "Your camera preview is now active.",
            });
          } catch (playError) {
            console.error("Preview play error:", playError);
            throw new Error("Failed to start video preview. Please check your device settings.");
          }
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
      
      // Only show error toast if we haven't already attempted to get permissions
      if (!hasAttemptedPermission.current) {
        let errorMessage = "Failed to start preview. ";
        
        if (error instanceof Error) {
          if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            errorMessage = "Please grant camera and microphone permissions when prompted.";
          } else if (error.name === "NotFoundError") {
            errorMessage = "No camera found. Please ensure your device has a camera.";
          } else if (error.name === "NotReadableError" || error.name === "AbortError") {
            errorMessage = "Camera is in use by another app. Please close other camera apps.";
          } else {
            errorMessage = error.message || "Please check your camera permissions and try again.";
          }
        }

        toast({
          variant: "destructive",
          title: "Camera Access Required",
          description: errorMessage,
        });
        
        hasAttemptedPermission.current = true;
      }
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    // Reset permission attempt flag when stopping preview
    hasAttemptedPermission.current = false;
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};