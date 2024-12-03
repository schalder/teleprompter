import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoPreview from "./VideoPreview";

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
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        // Stop any existing streams
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => {
            track.stop();
            console.log(`Stopped track: ${track.kind}`);
          });
        }

        console.log('Updating preview with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice,
          isMobile,
          resolution: isMobile ? "portrait" : cameraResolution
        });

        // Always use portrait constraints for mobile
        const videoConstraints = isMobile ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { exact: 1080 },
          height: { exact: 1920 },
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
          } : true,
        });

        // Log stream information
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        console.log('Stream obtained successfully');
        if (videoTrack) {
          console.log('Video tracks:', stream.getVideoTracks().map(t => ({
            label: t.label,
            settings: t.getSettings()
          })));
        }
        if (audioTrack) {
          console.log('Audio tracks:', stream.getAudioTracks().map(t => ({
            label: t.label,
            settings: t.getSettings()
          })));
        }

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
          
          console.log('Preview updated with new devices');
          
          if (audioTrack) {
            const settings = audioTrack.getSettings();
            console.log('Preview audio track settings:', settings);
          }
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: isMobile 
            ? "Please check camera permissions in your mobile browser settings."
            : "Failed to update preview with selected devices.",
        });
      }
    };

    updatePreview();
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions]);

  if (!isPreviewActive) return null;

  return (
    <VideoPreview
      previewVideoRef={previewVideoRef}
      cameraResolution={isMobile ? "portrait" : cameraResolution}
    />
  );
};

export default PreviewManager;