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
        // First try to enumerate devices to see what's available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
        const hasAudioDevice = devices.some(device => device.kind === 'audioinput');

        if (!hasVideoDevice || !hasAudioDevice) {
          console.log('Missing required devices:', { hasVideoDevice, hasAudioDevice });
          return;
        }

        // Then try to get actual permissions
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: 'user',
            width: { ideal: isMobile ? 1080 : 1920 },
            height: { ideal: isMobile ? 1920 : 1080 }
          }, 
          audio: true 
        });
        
        console.log('Initial permission check successful');
        stream.getTracks().forEach(track => track.stop());
        hasPermission.current = true;
      } catch (error) {
        console.log('Initial permission check failed:', error);
        hasPermission.current = false;
      }
    };

    checkInitialPermissions();
  }, [isMobile]);

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
        
        // Check device availability first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
        const hasAudioDevice = devices.some(device => device.kind === 'audioinput');

        if (!hasVideoDevice || !hasAudioDevice) {
          throw new Error(
            !hasVideoDevice ? "No camera found" : "No microphone found"
          );
        }

        // Only request permissions if we haven't already
        if (!hasPermission.current && !permissionRequested.current) {
          permissionRequested.current = true;
          console.log('Requesting camera permissions...');
          
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
          
          console.log('Camera permissions granted');
          hasPermission.current = true;
        } else if (hasPermission.current) {
          console.log('Using existing permissions');
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
        console.log('Stream obtained successfully');
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
    // Reset permission requested flag when stopping preview
    permissionRequested.current = false;
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};