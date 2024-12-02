import { useToast } from '@/hooks/use-toast';

export const useVideoEffects = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const { toast } = useToast();

  const handleCropChange = (crop: { x: number; y: number; width: number; height: number }) => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.style.objectPosition = `-${crop.x}% -${crop.y}%`;
      video.style.width = `${crop.width}%`;
      video.style.height = `${crop.height}%`;
    }
  };

  const handleResizeChange = (dimensions: { width: number; height: number }) => {
    if (videoRef.current) {
      videoRef.current.style.maxWidth = `${dimensions.width}px`;
      videoRef.current.style.maxHeight = `${dimensions.height}px`;
    }
  };

  const handleEffectChange = (effect: string, value: number) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    switch (effect) {
      case 'brightness':
        video.style.filter = `brightness(${value}%)`;
        break;
      case 'contrast':
        video.style.filter = `contrast(${value}%)`;
        break;
      case 'filter':
        // Handle filter changes
        break;
    }

    toast({
      title: "Effect Applied",
      description: `${effect} set to ${value}`,
    });
  };

  const handleExport = (format: string, quality: string) => {
    toast({
      title: "Export Started",
      description: `Exporting video as ${format.toUpperCase()} (${quality} quality)`,
    });
  };

  return {
    handleCropChange,
    handleResizeChange,
    handleEffectChange,
    handleExport,
  };
};