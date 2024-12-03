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
  const screenCaptureStream = useRef<MediaStream | null>(null);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput' && device.deviceId);
      const audioDevices = devices.filter(device => device.kind === 'audioinput' && device.deviceId);

      console.log('Available devices:', {
        video: videoDevices.map(d => ({ id: d.deviceId, label: d.label })),
        audio: audioDevices.map(d => ({ id: d.deviceId, label: d.label }))
      });

      return {
        hasVideo: videoDevices.length > 0,
        hasAudio: audioDevices.length > 0,
        videoDevices,
        audioDevices
      };
    } catch (error) {
      console.error('Error checking devices:', error);
      return { hasVideo: false, hasAudio: false, videoDevices: [], audioDevices: [] };
    }
  };

  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const { hasVideo, hasAudio, videoDevices } = await checkDeviceAvailability();
        
        if (!hasVideo || !hasAudio) {
          console.log('Missing required devices');
          return;
        }

        // Request permissions with the first available device explicitly
        if (videoDevices.length > 0) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: videoDevices[0].deviceId },
              facingMode: 'user',
              width: { ideal: isMobile ? 1080 : 1920 },
              height: { ideal: isMobile ? 1920 : 1080 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });

          console.log('Initial permission check successful with device:', videoDevices[0].label);
          stream.getTracks().forEach(track => track.stop());
          hasPermission.current = true;
          deviceCheckAttempts.current = 0;
        }
      } catch (error) {
        console.log('Initial permission check failed:', error);
        hasPermission.current = false;
      }
    };

    checkInitialPermissions();
  }, [isMobile]);

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
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
          const { hasVideo, hasAudio, videoDevices } = await checkDeviceAvailability();
          if (!hasVideo || !hasAudio) {
            if (deviceCheckAttempts.current < MAX_DEVICE_CHECK_ATTEMPTS) {
              deviceCheckAttempts.current++;
              console.log(`Retrying device check, attempt ${deviceCheckAttempts.current}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return checkDevices();
            }
            throw new Error(!hasVideo ? "No camera found" : "No microphone found");
          }

          // If no device is selected, use the first available device
          const effectiveVideoDeviceId = selectedVideoDeviceId || 
            (videoDevices.length > 0 ? videoDevices[0].deviceId : undefined);

          return effectiveVideoDeviceId;
        };

        const videoDeviceId = await checkDevices();

        const constraints = {
          video: {
            deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
            width: { ideal: effectiveResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: effectiveResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
            facingMode: "user",
          },
          audio: {
            deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
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
        // For screen recording, get a new stream if we don't have one
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
    if (screenCaptureStream.current) {
      screenCaptureStream.current.getTracks().forEach((track) => track.stop());
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
