import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCaptureStream = useRef<MediaStream | null>(null);
  const isMobile = useIsMobile();

  const startPreview = async (recordingType: "camera" | "screen", cameraResolution: "landscape" | "portrait") => {
    try {
      let stream: MediaStream;
      if (recordingType === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: cameraResolution === "landscape" ? { ideal: 1920 } : { ideal: 1080 },
            height: cameraResolution === "landscape" ? { ideal: 1080 } : { ideal: 1920 },
          },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }
      setPreviewStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        await previewVideoRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Error starting preview",
        description: "Could not start media stream.",
        variant: "destructive",
      });
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
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
