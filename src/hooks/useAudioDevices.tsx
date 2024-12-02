import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useAudioDevices = () => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const { toast } = useToast();

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput' && device.deviceId);
      
      console.log('Available audio devices:', audioInputs.map(d => ({
        id: d.deviceId,
        label: d.label
      })));
      
      setAudioDevices(audioInputs);
      return audioInputs;
    } catch (error) {
      console.error('Error getting audio devices:', error);
      toast({
        variant: "destructive",
        title: "Audio Device Error",
        description: "Failed to get audio devices. Please check permissions.",
      });
      return [];
    }
  };

  useEffect(() => {
    getAudioDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      getAudioDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return {
    audioDevices,
    getAudioDevices,
  };
};