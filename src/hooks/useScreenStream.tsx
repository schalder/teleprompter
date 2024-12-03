import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useScreenStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const getScreenStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = newStream;
      setStream(newStream);
      return newStream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      toast({
        variant: "destructive",
        title: "Screen Capture Error",
        description: "Failed to start screen capture. Please try again.",
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
    getScreenStream,
    stopStream,
  };
};