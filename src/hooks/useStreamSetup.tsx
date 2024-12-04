import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const useStreamSetup = () => {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const setupVideoConstraints = (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string
  ) => {
    if (recordingType === "screen") {
      return {
        frameRate: { ideal: 30 }
      };
    }

    // Force portrait mode on mobile regardless of selection
    const width = isMobile ? 1080 : (cameraResolution === "landscape" ? 1920 : 1080);
    const height = isMobile ? 1920 : (cameraResolution === "landscape" ? 1080 : 1920);

    return {
      deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
      width: { ideal: width },
      height: { ideal: height },
      frameRate: { ideal: 30 },
      facingMode: "user"
    };
  };

  const setupAudioConstraints = (selectedAudioDeviceId?: string) => {
    return {
      deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 48000
    };
  };

  return {
    previewStream,
    setPreviewStream,
    setupVideoConstraints,
    setupAudioConstraints
  };
};