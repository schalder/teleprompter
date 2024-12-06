import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useScreenStream = () => {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const getScreenStream = async () => {
    try {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setScreenStream(newStream);
      return newStream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      toast({
        variant: "destructive",
        title: "Screen Capture Error",
        description: "Failed to capture screen. Please try again.",
      });
      return null;
    }
  };

  return { screenStream, getScreenStream };
};