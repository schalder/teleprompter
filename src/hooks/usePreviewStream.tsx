import { useState, useRef } from "react";
import { useDeviceStream } from "./useDeviceStream";

export const usePreviewStream = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const { getDeviceStream } = useDeviceStream();

  const startPreview = async (
    videoDeviceId: string,
    audioDeviceId: string,
    isPortrait: boolean
  ) => {
    try {
      // Stop any existing streams
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      // Get video stream with correct aspect ratio
      const aspectRatio = isPortrait ? 9/16 : 16/9;
      const videoStream = await getDeviceStream(videoDeviceId, aspectRatio);
      
      if (!videoStream) return false;

      // Get audio stream
      const audioStream = await getDeviceStream(audioDeviceId, 0, true);
      
      if (!audioStream) {
        videoStream.getTracks().forEach(track => track.stop());
        return false;
      }

      // Combine streams
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      setPreviewStream(combinedStream);

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = combinedStream;
        await previewVideoRef.current.play();
        console.log('Preview started successfully');
      }

      return true;
    } catch (error) {
      console.error("Preview error:", error);
      return false;
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
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
    stopPreview
  };
};