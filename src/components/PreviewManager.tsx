import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoPreview from "./VideoPreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecordingConstraints } from "@/hooks/useRecordingConstraints";

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
  const isMobile = useIsMobile();
  const { getVideoConstraints, getAudioConstraints } = useRecordingConstraints();

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        const videoConstraints = getVideoConstraints(selectedVideoDevice, cameraResolution);
        const audioConstraints = getAudioConstraints(selectedAudioDevice);

        console.log('Updating preview with constraints:', videoConstraints);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
            toast({
              variant: "destructive",
              title: "Preview Error",
              description: "Failed to play video preview. Please check your camera permissions.",
            });
          });
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "Failed to update preview with selected devices.",
        });
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