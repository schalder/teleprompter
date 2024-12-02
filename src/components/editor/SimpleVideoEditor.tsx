import React, { useRef, useState, useEffect } from 'react';
import { SimpleVideoControls } from './SimpleVideoControls';
import { SimpleResizeControls } from './SimpleResizeControls';
import { TimelineTrack } from './TimelineTrack';
import { LayerTrack } from './LayerTrack';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Add type declaration for captureStream
declare global {
  interface HTMLVideoElement {
    captureStream(): MediaStream;
    mozCaptureStream(): MediaStream;
  }
}

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
  const [selectionStart, setSelectionStart] = useState<number | undefined>();
  const [selectionEnd, setSelectionEnd] = useState<number | undefined>();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        const videoDuration = videoRef.current?.duration || 0;
        setDuration(videoDuration);
        setTrimEnd(videoDuration);
      });
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
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
  };

  const handleTrimStart = () => {
    if (!videoRef.current) return;
    if (selectionStart !== undefined && selectionEnd !== undefined) {
      setTrimStart(selectionStart);
      setTrimEnd(selectionEnd);
      videoRef.current.currentTime = selectionStart;
      toast({
        title: "Selection Trimmed",
        description: `Removed section from ${selectionStart.toFixed(1)}s to ${selectionEnd.toFixed(1)}s`,
      });
    } else {
      const startTime = videoRef.current.currentTime;
      setTrimStart(startTime);
      videoRef.current.currentTime = startTime;
      toast({
        title: "Start Trimmed",
        description: `Removed first ${startTime.toFixed(1)} seconds of video`,
      });
    }
    setSelectionStart(undefined);
    setSelectionEnd(undefined);
  };

  const handleTrimEnd = () => {
    if (!videoRef.current) return;
    const endTime = videoRef.current.currentTime;
    setTrimEnd(endTime);
    toast({
      title: "End Trimmed",
      description: `Removed video after ${endTime.toFixed(1)} seconds`,
    });
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

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);

      if (currentVideoTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = currentVideoTime;
      }
    }
  };

  const handleVideoPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleVideoPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
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
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
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
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          onSelectionChange={(start, end) => {
            setSelectionStart(start);
            setSelectionEnd(end);
          }}
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
