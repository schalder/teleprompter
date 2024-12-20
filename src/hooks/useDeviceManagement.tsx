import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDevicePermissions } from "@/hooks/useDevicePermissions";

export const useDeviceManagement = (
  selectedAudioDevice: string,
  setSelectedAudioDevice: (deviceId: string) => void
) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const { toast } = useToast();
  const { hasPermissions, checkPermissions } = useDevicePermissions();

  const updateDevices = async () => {
    try {
      if (!hasPermissions) {
        const granted = await checkPermissions();
        if (!granted) return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoInputs = devices.filter(device => device.kind === 'videoinput' && device.deviceId);
      const audioInputs = devices.filter(device => device.kind === 'audioinput' && device.deviceId);
      
      console.log('Available devices:', {
        video: videoInputs.map(d => ({ id: d.deviceId, label: d.label })),
        audio: audioInputs.map(d => ({ id: d.deviceId, label: d.label }))
      });

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      
      if (!selectedVideoDevice && videoInputs.length > 0) {
        const defaultDevice = videoInputs[0];
        console.log('Setting default video device:', defaultDevice.label);
        setSelectedVideoDevice(defaultDevice.deviceId);
      }

      if (!selectedAudioDevice && audioInputs.length > 0) {
        const defaultAudioDevice = audioInputs[0];
        console.log('Setting default audio device:', defaultAudioDevice.label);
        setSelectedAudioDevice(defaultAudioDevice.deviceId);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        variant: "destructive",
        title: "Device Error",
        description: "Failed to access media devices. Please check permissions.",
      });
    }
  };

  return {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    updateDevices,
    hasPermissions
  };
};