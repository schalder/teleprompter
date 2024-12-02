import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useVideoControls = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVolumeChangeArray = (values: number[]) => {
    setVolume(values[0]);
    if (videoRef.current) {
      videoRef.current.volume = values[0];
    }
  };

  const handlePreviewClip = (startTime: number) => {
    if (!videoRef.current || !isFinite(startTime)) return;
    
    try {
      const validTime = Math.max(0, Math.min(startTime, duration));
      videoRef.current.currentTime = validTime;
      setCurrentTime(validTime);
      if (!isPlaying) {
        togglePlayPause();
      }
    } catch (error) {
      console.error('Error setting video time:', error);
      toast({
        title: "Error",
        description: "Failed to preview clip at the specified time.",
        variant: "destructive",
      });
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    setDuration,
    volume,
    isMuted,
    setIsMuted,
    togglePlayPause,
    handleReset,
    handleTimeUpdate,
    handleVolumeChangeArray,
    handlePreviewClip,
  };
};