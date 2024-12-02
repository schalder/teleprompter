import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useVideoDevices = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const { toast } = useToast();

  const getVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput' && device.deviceId);
      
      console.log('Available video devices:', videoInputs.map(d => ({
        id: d.deviceId,
        label: d.label
      })));
      
      setVideoDevices(videoInputs);
      return videoInputs;
    } catch (error) {
      console.error('Error getting video devices:', error);
      toast({
        variant: "destructive",
        title: "Video Device Error",
        description: "Failed to get video devices. Please check permissions.",
      });
      return [];
    }
  };

  useEffect(() => {
    getVideoDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      getVideoDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return {
    videoDevices,
    getVideoDevices,
  };
};