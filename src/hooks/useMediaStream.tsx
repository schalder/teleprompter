import { useRef } from "react";
import { useStreamSetup } from "./useStreamSetup";
import { useDevicePermissions } from "./useDevicePermissions";

export const useMediaStream = () => {
  const {
    previewStream,
    setPreviewStream,
    setupVideoConstraints,
    setupAudioConstraints
  } = useStreamSetup();
  
  const { checkPermissions } = useDevicePermissions();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCaptureStream = useRef<MediaStream | null>(null);

  const startPreview = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    try {
      // Check permissions for the specific device if provided
      if (selectedVideoDeviceId) {
        const hasPermission = await checkPermissions(selectedVideoDeviceId);
        if (!hasPermission) return;
      }

      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera") {
        const constraints = {
          video: setupVideoConstraints(recordingType, cameraResolution, selectedVideoDeviceId),
          audio: setupAudioConstraints(selectedAudioDeviceId)
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Stream obtained successfully');
      } else {
        if (!screenCaptureStream.current) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: setupVideoConstraints(recordingType, cameraResolution),
            audio: true
          });
          screenCaptureStream.current = stream;
        } else {
          stream = screenCaptureStream.current;
        }
      }

      if (stream) {
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play();
          console.log('Preview started successfully');
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
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
    if (screenCaptureStream.current) {
      screenCaptureStream.current.getTracks().forEach((track) => track.stop());
      screenCaptureStream.current = null;
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