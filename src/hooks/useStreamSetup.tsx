import { useRef } from "react";

export const useStreamSetup = () => {
  const setupStream = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ) => {
    const constraints = {
      video: recordingType === "camera" ? {
        deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
        width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
        height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 },
        facingMode: "user",
      } : {
        frameRate: { ideal: 30 }
      },
      audio: selectedAudioDeviceId ? {
        deviceId: { exact: selectedAudioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        autoGainControl: true,
      } : false
    };

    console.log('Requesting media with constraints:', constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Configure audio tracks for recording only
    stream.getAudioTracks().forEach(track => {
      track.enabled = true; // Enable for recording
      console.log('Audio track configured:', {
        id: track.id,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      });
    });
    
    console.log('Stream obtained successfully');
    return stream;
  };

  return { setupStream };
};