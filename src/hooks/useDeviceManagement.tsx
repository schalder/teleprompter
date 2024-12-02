import { useRef } from "react";

export const useDeviceManagement = () => {
  const hasPermission = useRef<boolean>(false);
  const permissionRequested = useRef<boolean>(false);
  const deviceCheckAttempts = useRef<number>(0);
  const MAX_DEVICE_CHECK_ATTEMPTS = 3;

  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput' && device.deviceId);
      const audioDevices = devices.filter(device => device.kind === 'audioinput' && device.deviceId);

      console.log('Available devices:', {
        video: videoDevices.map(d => ({ id: d.deviceId, label: d.label })),
        audio: audioDevices.map(d => ({ id: d.deviceId, label: d.label }))
      });

      return {
        hasVideo: videoDevices.length > 0,
        hasAudio: audioDevices.length > 0,
        videoDevices,
        audioDevices
      };
    } catch (error) {
      console.error('Error checking devices:', error);
      return { hasVideo: false, hasAudio: false, videoDevices: [], audioDevices: [] };
    }
  };

  return {
    checkDeviceAvailability,
    hasPermission,
    permissionRequested,
    deviceCheckAttempts,
    MAX_DEVICE_CHECK_ATTEMPTS
  };
};