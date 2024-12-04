import { useEffect } from "react";
import VideoPreview from "./VideoPreview";
import { useIsMobile } from "@/hooks/use-mobile";

interface PreviewManagerProps {
  isPreviewActive: boolean;
  recordingType: "camera" | "screen";
  hasPermissions: boolean;
  selectedVideoDevice: string;
  selectedAudioDevice: string;
  cameraResolution: "landscape" | "portrait";
  previewVideoRef: React.RefObject<HTMLVideoElement>;
}

const PreviewManager = ({
  isPreviewActive,
  recordingType,
  hasPermissions,
  selectedVideoDevice,
  selectedAudioDevice,
  cameraResolution,
  previewVideoRef
}: PreviewManagerProps) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        // Force portrait mode on mobile
        const width = isMobile ? 1080 : (cameraResolution === "landscape" ? 1920 : 1080);
        const height = isMobile ? 1920 : (cameraResolution === "landscape" ? 1080 : 1920);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? {
            deviceId: { exact: selectedVideoDevice },
            width: { exact: width },
            height: { exact: height },
            frameRate: { ideal: 30 },
          } : false,
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : false,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play();
        }
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    };

    updatePreview();
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions, isMobile]);

  if (!isPreviewActive) return null;

  return (
    <VideoPreview
      previewVideoRef={previewVideoRef}
      cameraResolution={isMobile ? "portrait" : cameraResolution}
    />
  );
};

export default PreviewManager;