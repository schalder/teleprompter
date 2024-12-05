import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDeviceStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const hasPermission = useRef<boolean>(false);

  const getDeviceStream = async (
    deviceId: string,
    aspectRatio: number,
    isAudio: boolean = false
  ) => {
    try {
      const constraints = isAudio ? {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        }
      } : {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          aspectRatio: { exact: aspectRatio },
          frameRate: { ideal: 30 },
        }
      };

      console.log('Requesting media with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      hasPermission.current = true;
      return mediaStream;
    } catch (error) {
      console.error("Error getting device stream:", error);
      toast({
        variant: "destructive",
        title: `${isAudio ? "Microphone" : "Camera"} Access Required`,
        description: `Please grant ${isAudio ? "microphone" : "camera"} permissions to continue.`,
      });
      return null;
    }
  };

  return {
    stream,
    getDeviceStream,
    hasPermission: hasPermission.current
  };
};