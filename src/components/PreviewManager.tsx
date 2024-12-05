import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoPreview from "./VideoPreview";
import { getVideoConstraints } from "@/utils/videoUtils";

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

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        console.log('Updating preview with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice,
          aspectRatio: cameraResolution === 'landscape' ? '16:9' : '9:16'
        });

        const videoConstraints = getVideoConstraints(cameraResolution);
        console.log('Using video constraints:', videoConstraints);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? {
            deviceId: { exact: selectedVideoDevice },
            ...videoConstraints
          } : videoConstraints,
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play();
          console.log('Preview updated with new devices and constraints');
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        if (error instanceof Error && error.name === "NotAllowedError") {
          toast({
            variant: "destructive",
            title: "Camera Access Required",
            description: "Please grant camera permissions to continue.",
          });
        }
      }
    };

    updatePreview();
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