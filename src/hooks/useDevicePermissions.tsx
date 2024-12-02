import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useDevicePermissions = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const { toast } = useToast();

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      toast({
        variant: "destructive",
        title: "Permission Error",
        description: "Please grant camera and microphone permissions to use this feature.",
      });
      setHasPermissions(false);
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return { hasPermissions, checkPermissions };
};