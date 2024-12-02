import React, { useRef, useState } from 'react';
import { SimpleVideoControls } from './SimpleVideoControls';
import { SimpleResizeControls } from './SimpleResizeControls';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleVideoEditorProps {
  videoUrl: string;
}

export const SimpleVideoEditor = ({ videoUrl }: SimpleVideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTrack, setAudioTrack] = useState<string | null>(null);

  const handleSeek = (time: number) => {
    if (videoRef.current && isFinite(time) && time >= 0 && time <= duration) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTrimStart = () => {
    if (!videoRef.current) return;
    const startTime = videoRef.current.currentTime;
    // Here you would implement the actual trimming logic
    toast({
      title: "Start Trimmed",
      description: `Removed first ${startTime.toFixed(1)} seconds of video`,
    });
  };

  const handleTrimEnd = () => {
    if (!videoRef.current) return;
    const endTime = videoRef.current.currentTime;
    // Here you would implement the actual trimming logic
    toast({
      title: "End Trimmed",
      description: `Removed video after ${endTime.toFixed(1)} seconds`,
    });
  };

  const handleAddAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioTrack(url);
  };

  const handleResize = (dimensions: { width: number; height: number }) => {
    // Here you would store the new dimensions for export
    console.log('New dimensions:', dimensions);
  };

  const handleExport = () => {
    toast({
      title: "Exporting Video",
      description: "Your video is being processed...",
    });
    // Here you would implement the actual export logic
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative inline-block">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full rounded-lg"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          controls
        />
        {audioTrack && (
          <audio src={audioTrack} className="hidden" />
        )}
        <SimpleResizeControls
          videoRef={videoRef}
          onResize={handleResize}
        />
      </div>

      <SimpleVideoControls
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
        onTrimStart={handleTrimStart}
        onTrimEnd={handleTrimEnd}
        onAddAudio={handleAddAudio}
      />

      <Button onClick={handleExport} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Export Video
      </Button>
    </div>
  );
};