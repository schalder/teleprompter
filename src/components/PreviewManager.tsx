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
        // Stop any existing tracks
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          const tracks = previewVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          previewVideoRef.current.srcObject = null;
        }

        // Set dimensions based on resolution and device type
        const width = isMobile ? 
          (cameraResolution === "portrait" ? 1080 : 1920) : 
          (cameraResolution === "landscape" ? 1920 : 1080);
        const height = isMobile ? 
          (cameraResolution === "portrait" ? 1920 : 1080) : 
          (cameraResolution === "landscape" ? 1080 : 1920);

        console.log(`Requesting stream with dimensions: ${width}x${height}, device: ${selectedVideoDevice}`);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedVideoDevice },
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 30 },
          },
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : false,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play().catch(error => {
            console.error('Preview play error:', error);
          });
        }
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    };

    updatePreview();

    // Cleanup function to stop tracks when unmounting or updating
    return () => {
      if (previewVideoRef.current?.srcObject instanceof MediaStream) {
        const tracks = previewVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions, isMobile]);

  if (!isPreviewActive) return null;

  return (
    <VideoPreview
      previewVideoRef={previewVideoRef}
      cameraResolution={cameraResolution}
    />
  );
};

export default PreviewManager;