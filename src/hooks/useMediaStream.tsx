import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait"
  ) => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        // Check permissions first
        try {
          const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log('Camera permission status:', permissions.state);
          
          if (permissions.state === 'denied') {
            throw new Error('Camera access is blocked. Please enable it in your browser settings.');
          }
        } catch (permError) {
          console.log('Permission check error:', permError);
          // Continue anyway as some mobile browsers don't support permissions API
        }

        // Request the stream with specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
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
      let errorMessage = "Failed to start preview. ";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage += "Camera access was denied. Please grant camera and microphone permissions and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage += "No camera found. Please ensure your device has a camera and try again.";
        } else if (error.name === "NotReadableError" || error.name === "AbortError") {
          errorMessage += "Your camera might be in use by another application. Please close other apps using the camera and try again.";
        } else {
          errorMessage += error.message || "Please ensure camera and microphone permissions are granted and try again.";
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
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
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};