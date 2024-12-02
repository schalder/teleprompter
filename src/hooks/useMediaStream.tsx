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
        // Fix resolution settings based on orientation
        const videoConstraints: MediaTrackConstraints = {
          deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
          width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
          height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
          frameRate: { ideal: 30 },
        };

        const audioConstraints: MediaTrackConstraints = selectedAudioDeviceId 
          ? {
              deviceId: { exact: selectedAudioDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000,
            }
          : true;

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
        }
        
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          console.log('Active audio track settings:', settings);
          
          // Verify if we got the requested audio device
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
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30 }
          },
          audio: selectedAudioDeviceId ? {
            deviceId: { exact: selectedAudioDeviceId },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true
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