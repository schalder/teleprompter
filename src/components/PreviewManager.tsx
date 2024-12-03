import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        // Always use portrait constraints on mobile
        const effectiveResolution = isMobile ? "portrait" : cameraResolution;

        const videoConstraints = {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: effectiveResolution === "portrait" ? 1080 : 1920 },
          height: { ideal: effectiveResolution === "portrait" ? 1920 : 1080 },
          frameRate: { ideal: 30 },
        };

        console.log('Updating preview with constraints:', videoConstraints);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true,
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