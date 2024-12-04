import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useDevicePermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const { toast } = useToast();

  const checkPermissions = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast({
          variant: "destructive",
          title: "Permission Required",
          description: "Please grant camera and microphone access to continue.",
        });
      }
      setHasPermissions(false);
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return { hasPermissions, checkPermissions };
};