import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDeviceStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const startDeviceStream = async (
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      console.log('Starting device stream with:', {
        videoDevice: selectedVideoDeviceId,
        audioDevice: selectedAudioDeviceId,
        isMobile
      });

      const constraints = {
        video: {
          deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
          width: { ideal: isMobile ? 1080 : 1920 },
          height: { ideal: isMobile ? 1920 : 1080 },
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

      console.log('Requesting media with constraints:', JSON.stringify(constraints));
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Stream obtained successfully');
      console.log('Video tracks:', stream.getVideoTracks().map(t => ({ 
        label: t.label, 
        settings: t.getSettings() 
      })));
      console.log('Audio tracks:', stream.getAudioTracks().map(t => ({ 
        label: t.label, 
        settings: t.getSettings() 
      })));

      setPreviewStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        await previewVideoRef.current.play();
      }

      return stream;
    } catch (error) {
      console.error('Device stream error:', error);
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: isMobile 
          ? "Please ensure camera permissions are granted in your mobile browser settings."
          : "Failed to access camera. Please check your permissions.",
      });
      return null;
    }
  };

  return {
    previewStream,
    previewVideoRef,
    startDeviceStream,
    isMobile
  };
};