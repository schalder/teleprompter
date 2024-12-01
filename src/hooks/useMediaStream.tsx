import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait"
  ) => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
            facingMode: "user",
          },
          audio: true,
        });
      } else if (recordingType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            frameRate: { ideal: 30 }
          }
        });
      }

      if (stream) {
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          previewVideoRef.current.style.transform = "scaleX(-1)";
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start preview. Please check your permissions.",
        variant: "destructive",
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
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
  };
};