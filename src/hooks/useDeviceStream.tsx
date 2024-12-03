import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "./use-mobile";

export const useDeviceStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const streamRef = useRef<MediaStream | null>(null);

  const getDeviceStream = async (
    videoDeviceId?: string,
    audioDeviceId?: string
  ) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 },
          facingMode: "user",
        },
        audio: {
          deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      };

      console.log('Requesting media with constraints:', constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained successfully');
      
      const videoTrack = newStream.getVideoTracks()[0];
      console.log('Video track settings:', videoTrack.getSettings());

      streamRef.current = newStream;
      setStream(newStream);
      return newStream;
    } catch (error) {
      console.error('Error getting device stream:', error);
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: "Failed to access camera. Please check permissions and try again.",
      });
      return null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  return {
    stream,
    getDeviceStream,
    stopStream,
  };
};