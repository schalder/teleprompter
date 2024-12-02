import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCaptureStream = useRef<MediaStream | null>(null);

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
        // Define base constraints with exact values for mobile
        const videoConstraints: MediaTrackConstraints = {
          deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
          frameRate: { exact: 30 }
        };

        // Force exact dimensions based on orientation
        if (cameraResolution === "landscape") {
          videoConstraints.width = { exact: 1920 };
          videoConstraints.height = { exact: 1080 };
          videoConstraints.aspectRatio = { exact: 16/9 };
        } else {
          videoConstraints.width = { exact: 1080 };
          videoConstraints.height = { exact: 1920 };
          videoConstraints.aspectRatio = { exact: 9/16 };
        }

        const audioConstraints: MediaTrackConstraints = {
          deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        };

        console.log('Starting preview with constraints:', {
          video: videoConstraints,
          audio: audioConstraints
        });

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        
        // Verify device settings
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Active video track settings:', settings);
          
          // Verify if orientation matches requested
          if (cameraResolution === "portrait" && settings.width && settings.height) {
            if (settings.width > settings.height) {
              console.warn('Warning: Video track orientation mismatch');
              toast({
                title: "Orientation Warning",
                description: "Camera orientation may not match selected mode",
                variant: "destructive",
              });
            }
          }
        }
        
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          console.log('Active audio track settings:', settings);
          
          if (selectedAudioDeviceId && settings.deviceId !== selectedAudioDeviceId) {
            console.warn('Warning: Active audio device differs from selected device');
            toast({
              title: "Audio Device Warning",
              description: "Could not use the selected microphone. Using default device instead.",
              variant: "destructive",
            });
          }
        }
      } else {
        const audioConstraints: MediaTrackConstraints = {
          deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        };

        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30 }
          },
          audio: audioConstraints
        });
        screenCaptureStream.current = stream;
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
      toast({
        variant: "destructive",
        title: "Device Error",
        description: error instanceof Error ? error.message : "Failed to access media devices",
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
    if (screenCaptureStream.current) {
      screenCaptureStream.current.getTracks().forEach((track) => track.stop());
      screenCaptureStream.current = null;
    }
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
    screenCaptureStream: screenCaptureStream.current
  };
};