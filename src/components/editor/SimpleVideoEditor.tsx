import React, { useRef, useState, useEffect } from 'react';
import { SimpleVideoControls } from './SimpleVideoControls';
import { SimpleResizeControls } from './SimpleResizeControls';
import { TimelineTrack } from './TimelineTrack';
import { LayerTrack } from './LayerTrack';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleVideoEditorProps {
  videoUrl: string;
}

export const SimpleVideoEditor = ({ videoUrl }: SimpleVideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTrack, setAudioTrack] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioMuted, setAudioMuted] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setTrimEnd(video.duration);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Handle case where metadata is already loaded
      if (video.readyState >= 2) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      audioRef.current.volume = audioVolume;
      audioRef.current.muted = audioMuted;
      if (!videoRef.current.paused) {
        audioRef.current.play();
      }
    }
  }, [audioTrack, audioVolume, audioMuted]);

  const handleSeek = (time: number) => {
    if (videoRef.current && isFinite(time) && time >= 0 && time <= duration) {
      // Only seek within trim points
      const seekTime = Math.max(trimStart, Math.min(time, trimEnd));
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
      }
    }
  };

  const handleTrimStart = () => {
    if (!videoRef.current) return;
    const startTime = videoRef.current.currentTime;
    setTrimStart(startTime);
    videoRef.current.currentTime = startTime;
    
    toast({
      title: "Start Trimmed",
      description: `Removed first ${startTime.toFixed(1)} seconds of video`,
    });
  };

  const handleTrimEnd = () => {
    if (!videoRef.current) return;
    const endTime = videoRef.current.currentTime;
    setTrimEnd(endTime);
    videoRef.current.currentTime = Math.min(currentTime, endTime);
    
    toast({
      title: "End Trimmed",
      description: `Removed video after ${endTime.toFixed(1)} seconds`,
    });
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentVideoTime = video.currentTime;

      // Enforce trim points during playback
      if (currentVideoTime < trimStart) {
        video.currentTime = trimStart;
      } else if (currentVideoTime > trimEnd) {
        video.currentTime = trimStart;
      } else {
        setCurrentTime(currentVideoTime);
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = video.currentTime;
      }
    }
  };

  const handleAddAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioTrack(url);
    toast({
      title: "Audio Added",
      description: "Background music has been added",
    });
  };

  const handleResize = (dimensions: { width: number; height: number }) => {
    if (videoRef.current) {
      videoRef.current.style.width = `${dimensions.width}px`;
      videoRef.current.style.height = `${dimensions.height}px`;
    }
  };

  const handleExport = async () => {
    if (!videoRef.current) return;

    toast({
      title: "Starting Export",
      description: "Preparing your edited video...",
    });

    try {
      const stream = videoRef.current.captureStream?.() || 
                    videoRef.current.mozCaptureStream?.();
                    
      if (!stream) {
        throw new Error('Video capture not supported in this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited-video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Complete",
          description: "Your video has been exported successfully!",
        });
      };

      videoRef.current.currentTime = trimStart;
      mediaRecorder.start();

      videoRef.current.addEventListener('timeupdate', function handler() {
        if (videoRef.current?.currentTime >= trimEnd) {
          mediaRecorder.stop();
          videoRef.current.removeEventListener('timeupdate', handler);
        }
      });

      videoRef.current.play();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your video.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative inline-block">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full rounded-lg"
          onTimeUpdate={handleVideoTimeUpdate}
          controls
        />
        {audioTrack && (
          <audio
            ref={audioRef}
            src={audioTrack}
            loop
          />
        )}
        <SimpleResizeControls
          videoRef={videoRef}
          onResize={handleResize}
        />
      </div>

      <div className="space-y-4">
        <TimelineTrack
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        <div className="space-y-2">
          <LayerTrack
            name="Video Track"
            type="video"
            duration={duration}
          />
          {audioTrack && (
            <LayerTrack
              name="Audio Track"
              type="audio"
              duration={duration}
              volume={audioVolume}
              isMuted={audioMuted}
              onVolumeChange={setAudioVolume}
              onMuteToggle={() => setAudioMuted(!audioMuted)}
            />
          )}
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
    </div>
  );
};
