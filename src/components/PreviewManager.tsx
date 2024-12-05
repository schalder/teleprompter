import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoPreview from "./VideoPreview";
import { usePreviewStream } from "@/hooks/usePreviewStream";

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
  const { toast } = useToast();
  const { startPreview, stopPreview } = usePreviewStream();

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        // Stop any existing preview
        stopPreview();

        console.log('Updating preview with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice,
          aspectRatio: cameraResolution === 'landscape' ? '16:9' : '9:16'
        });

        const success = await startPreview(
          selectedVideoDevice,
          selectedAudioDevice,
          cameraResolution === 'portrait'
        );

        if (!success) {
          toast({
            variant: "destructive",
            title: "Preview Error",
            description: "Failed to start preview. Please check your device permissions.",
          });
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "An unexpected error occurred while starting the preview.",
        });
      }
    };

    updatePreview();

    return () => {
      stopPreview();
    };
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions]);

  if (!isPreviewActive) return null;

  return (
    <VideoPreview
      previewVideoRef={previewVideoRef}
      cameraResolution={cameraResolution}
    />
  );
};

export default PreviewManager;