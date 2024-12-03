import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDeviceStream } from "./useDeviceStream";
import { useScreenStream } from "./useScreenStream";
import { useIsMobile } from "./use-mobile";

export const useMediaStream = () => {
  const { toast } = useToast();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    stream: deviceStream,
    getDeviceStream,
    stopStream: stopDeviceStream 
  } = useDeviceStream();
  
  const {
    stream: screenStream,
    getScreenStream,
    stopStream: stopScreenStream
  } = useScreenStream();

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    try {
      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        stream = await getDeviceStream(selectedVideoDeviceId, selectedAudioDeviceId);
      } else {
        stream = await getScreenStream();
      }

      if (stream && previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        await previewVideoRef.current.play();
        console.log('Preview started successfully');
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: "Failed to start preview. Please check permissions and try again.",
      });
    }
  };

  const stopPreview = () => {
    stopDeviceStream();
    stopScreenStream();
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };

  return {
    previewStream: deviceStream || screenStream,
    previewVideoRef,
    startPreview,
    stopPreview,
    screenCaptureStream: screenStream
  };
};