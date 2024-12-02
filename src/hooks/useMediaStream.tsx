import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasPermission = useRef<boolean>(false);
  const permissionRequested = useRef<boolean>(false);
  const deviceCheckAttempts = useRef<number>(0);
  const MAX_DEVICE_CHECK_ATTEMPTS = 3;

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      console.log('Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length
      });

      return {
        hasVideo: videoDevices.length > 0,
        hasAudio: audioDevices.length > 0
      };
    } catch (error) {
      console.error('Error checking devices:', error);
      return { hasVideo: false, hasAudio: false };
    }
  };

  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const { hasVideo, hasAudio } = await checkDeviceAvailability();
        
        if (!hasVideo || !hasAudio) {
          console.log('Missing required devices');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: isMobile ? 1080 : 1920 },
            height: { ideal: isMobile ? 1920 : 1080 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        console.log('Initial permission check successful');
        stream.getTracks().forEach(track => track.stop());
        hasPermission.current = true;
        deviceCheckAttempts.current = 0;
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
        const effectiveResolution = isMobile ? "portrait" : cameraResolution;
        
        // Retry device check if needed
        const checkDevices = async () => {
          const { hasVideo, hasAudio } = await checkDeviceAvailability();
          if (!hasVideo || !hasAudio) {
            if (deviceCheckAttempts.current < MAX_DEVICE_CHECK_ATTEMPTS) {
              deviceCheckAttempts.current++;
              console.log(`Retrying device check, attempt ${deviceCheckAttempts.current}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return checkDevices();
            }
            throw new Error(!hasVideo ? "No camera found" : "No microphone found");
          }
          return true;
        };

        await checkDevices();

        const constraints = {
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
        };

        console.log('Requesting media with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Stream obtained successfully');
        hasPermission.current = true;
        deviceCheckAttempts.current = 0;
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
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    permissionRequested.current = false;
    deviceCheckAttempts.current = 0;
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};