import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDeviceStream } from "./useDeviceStream";
import { useScreenStream } from "./useScreenStream";

export const useMediaStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const { stream: deviceStream, getDeviceStream } = useDeviceStream();
  const { screenStream, getScreenStream } = useScreenStream();

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    try {
      // Stop any existing streams
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      let newStream: MediaStream | null = null;

      if (recordingType === "camera") {
        console.log('Starting camera preview with:', {
          videoDevice: selectedVideoDeviceId,
          audioDevice: selectedAudioDeviceId,
          resolution: cameraResolution
        });

        newStream = await getDeviceStream(
          selectedVideoDeviceId || '',
          selectedAudioDeviceId || '',
          cameraResolution
        );
      } else {
        newStream = await getScreenStream();
      }

      if (newStream) {
        setPreviewStream(newStream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = newStream;
          await previewVideoRef.current.play();
          console.log('Preview started with stream:', newStream.id);
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: "Failed to start preview. Please check device permissions.",
      });
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
    screenStream
  };
};