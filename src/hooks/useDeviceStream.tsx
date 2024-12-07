import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDeviceStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const getDeviceStream = async (
    videoDeviceId: string,
    audioDeviceId: string,
    aspectRatio: "landscape" | "portrait"
  ) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 },
          aspectRatio: aspectRatio === "landscape" ? 16/9 : 9/16,
          facingMode: "user",
          frameRate: { min: 24, ideal: 30 }
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
      console.log('Stream obtained with tracks:', newStream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
      
      setStream(newStream);
      return newStream;
    } catch (error) {
      console.error('Error getting device stream:', error);
      toast({
        variant: "destructive",
        title: "Device Error",
        description: "Failed to access camera or microphone. Please check permissions.",
      });
      return null;
    }
  };

  return { stream, getDeviceStream };
};