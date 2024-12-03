import { useIsMobile } from "./use-mobile";

export const useRecordingConstraints = () => {
  const isMobile = useIsMobile();

  const getVideoConstraints = (
    selectedVideoDevice: string,
    cameraResolution: "landscape" | "portrait"
  ) => {
    // Always use portrait on mobile
    const effectiveResolution = isMobile ? "portrait" : cameraResolution;

    return {
      deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
      width: { exact: effectiveResolution === "portrait" ? 1080 : 1920 },
      height: { exact: effectiveResolution === "portrait" ? 1920 : 1080 },
      frameRate: { ideal: 30 },
    };
  };

  const getAudioConstraints = (selectedAudioDevice: string) => {
    return {
      deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 48000,
    };
  };

  const getRecordingOptions = () => {
    return {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: isMobile ? 2500000 : 8000000,
      audioBitsPerSecond: 128000
    };
  };

  return {
    getVideoConstraints,
    getAudioConstraints,
    getRecordingOptions,
  };
};