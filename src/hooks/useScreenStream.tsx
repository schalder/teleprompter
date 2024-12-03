import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useScreenStream = () => {
  const screenCaptureStream = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startScreenStream = async () => {
    try {
      if (!screenCaptureStream.current) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30 }
          },
          audio: true
        });
        screenCaptureStream.current = stream;
      }
      return screenCaptureStream.current;
    } catch (error) {
      console.error('Screen capture error:', error);
      toast({
        variant: "destructive",
        title: "Screen Capture Error",
        description: "Failed to start screen capture. Please try again.",
      });
      return null;
    }
  };

  const stopScreenStream = () => {
    if (screenCaptureStream.current) {
      screenCaptureStream.current.getTracks().forEach((track) => track.stop());
      screenCaptureStream.current = null;
    }
  };

  return {
    screenCaptureStream: screenCaptureStream.current,
    startScreenStream,
    stopScreenStream
  };
};