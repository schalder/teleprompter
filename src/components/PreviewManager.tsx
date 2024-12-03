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
      if (!isPreviewActive || recordingType !== "camera") return;

      try {
        // Stop any existing tracks
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        console.log('Requesting media with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice
        });

        // Force portrait mode constraints for mobile
        const videoConstraints = isMobile ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 },
        } : {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
          height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
          frameRate: { ideal: 30 },
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : false,
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
          description: "Failed to update preview with selected devices. Please check permissions.",
        });
      }
    };

    updatePreview();
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions, isMobile, toast]);

  if (!isPreviewActive) return null;

  return (
    <VideoPreview
      previewVideoRef={previewVideoRef}
      cameraResolution={isMobile ? "portrait" : cameraResolution}
    />
  );
};

export default PreviewManager;