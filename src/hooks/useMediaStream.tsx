import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasPermission = useRef<boolean>(false);
  const permissionRequested = useRef<boolean>(false);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    // Check initial permission state
    const checkInitialPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        hasPermission.current = true;
      } catch (error) {
        hasPermission.current = false;
      }
    };

    checkInitialPermissions();
  }, []);

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
        // Use portrait by default on mobile
        const effectiveResolution = isMobile ? "portrait" : cameraResolution;
        
        // Only request permissions if we haven't already
        if (!hasPermission.current && !permissionRequested.current) {
          permissionRequested.current = true;
          
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: effectiveResolution === "landscape" ? 1920 : 1080 },
              height: { ideal: effectiveResolution === "landscape" ? 1080 : 1920 },
              frameRate: { ideal: 30 },
              facingMode: "user",
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000,
            },
          });
          
          hasPermission.current = true;
        } else if (hasPermission.current) {
          // If we already have permission, just get the stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: effectiveResolution === "landscape" ? 1920 : 1080 },
              height: { ideal: effectiveResolution === "landscape" ? 1080 : 1920 },
              frameRate: { ideal: 30 },
              facingMode: "user",
            },
            audio: true
          });
        }
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
          await previewVideoRef.current.play();
          console.log('Preview started successfully');
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
      
      // Only show error if we haven't shown it before
      if (!permissionRequested.current) {
        let errorMessage = "Please grant camera and microphone permissions when prompted.";
        
        if (error instanceof Error) {
          if (error.name === "NotFoundError") {
            errorMessage = "No camera found. Please ensure your device has a camera.";
          } else if (error.name === "NotReadableError" || error.name === "AbortError") {
            errorMessage = "Camera is in use by another app. Please close other camera apps.";
          }
        }

        toast({
          variant: "destructive",
          title: "Camera Access Required",
          description: errorMessage,
        });
      }
      
      // Reset permission state on error
      hasPermission.current = false;
      permissionRequested.current = true;
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
    // Only reset permission requested flag when stopping preview
    permissionRequested.current = false;
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};