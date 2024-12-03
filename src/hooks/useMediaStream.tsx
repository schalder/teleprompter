import { useState } from "react";
import { useDeviceStream } from "./useDeviceStream";
import { useScreenStream } from "./useScreenStream";

export const useMediaStream = () => {
  const [permissionRequested, setPermissionRequested] = useState(false);
  const { 
    previewStream, 
    previewVideoRef, 
    startDeviceStream,
    isMobile 
  } = useDeviceStream();
  
  const { 
    screenCaptureStream,
    startScreenStream,
    stopScreenStream 
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
        stream = await startDeviceStream(selectedVideoDeviceId, selectedAudioDeviceId);
      } else {
        stream = await startScreenStream();
      }

      setPermissionRequested(true);
      return stream !== null;
    } catch (error) {
      console.error("Preview error:", error);
      setPermissionRequested(true);
      return false;
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    stopScreenStream();
    setPermissionRequested(false);
  };

  return {
    previewStream,
    previewVideoRef,
    startPreview,
    stopPreview,
    screenCaptureStream,
    isMobile
  };
};