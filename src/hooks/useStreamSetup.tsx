import { useRef } from "react";

export const useStreamSetup = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const setupStream = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    const effectiveResolution = isMobile ? "portrait" : cameraResolution;

    const constraints = {
      video: {
        deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
        width: { ideal: effectiveResolution === "landscape" ? 1920 : 1080 },
        height: { ideal: effectiveResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 },
        facingMode: "user",
      },
      audio: selectedAudioDeviceId ? {
        deviceId: { exact: selectedAudioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
      } : false
    };

    console.log('Requesting media with constraints:', constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Stream obtained successfully');
    return stream;
  };

  return { setupStream };
};