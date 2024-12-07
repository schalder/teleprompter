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

      // Set video constraints based on aspect ratio
      const videoConstraints = {
        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
        width: {
          min: aspectRatio === "landscape" ? 1280 : 720,
          ideal: aspectRatio === "landscape" ? 1920 : 1080,
        },
        height: {
          min: aspectRatio === "landscape" ? 720 : 1280,
          ideal: aspectRatio === "landscape" ? 1080 : 1920,
        },
        frameRate: { min: 24, ideal: 30 }
      };

      const constraints = {
        video: videoConstraints,
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