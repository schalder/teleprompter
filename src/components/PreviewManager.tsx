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

        console.log('Updating preview with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice,
          isMobile,
          resolution: cameraResolution
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? {
            deviceId: { exact: selectedVideoDevice },
            width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
            facingMode: isMobile ? "environment" : "user"
          } : true,
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
          
          console.log('Preview updated successfully');
          
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          
          if (videoTrack) {
            console.log('Video track settings:', videoTrack.getSettings());
          }
          
          if (audioTrack) {
            console.log('Audio track settings:', audioTrack.getSettings());
          }
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: isMobile 
            ? "Failed to access camera. Please ensure camera permissions are granted and try again."
            : "Failed to update preview with selected devices.",
        });
      }
    };

    updatePreview();
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