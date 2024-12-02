import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { TimelineClip } from '@/types/editor';
import { useToast } from '@/hooks/use-toast';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { VideoPreview } from '@/components/editor/VideoPreview';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { TimelineSection } from '@/components/editor/TimelineSection';

const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [layers, setLayers] = useState([
    { id: '1', name: 'Main Video', visible: true },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (!videoUrl) {
      navigate('/');
    }
  }, [videoUrl, navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setClips([{
        id: '1',
        startTime: 0,
        endTime: video.duration
      }]);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

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

  const handleSplitAtCurrentTime = () => {
    if (!videoRef.current) return;

    const splitTime = videoRef.current.currentTime;
    setClips(prevClips => {
      const affectedClipIndex = prevClips.findIndex(
        clip => splitTime > clip.startTime && splitTime < clip.endTime
      );

      if (affectedClipIndex === -1) {
        toast({
          title: "Cannot split here",
          description: "Please select a valid position within a clip to split.",
          variant: "destructive",
        });
        return prevClips;
      }

      const affectedClip = prevClips[affectedClipIndex];
      const newClips = [...prevClips];
      
      newClips.splice(affectedClipIndex, 1, 
        {
          id: `${affectedClip.id}-1`,
          startTime: affectedClip.startTime,
          endTime: splitTime
        },
        {
          id: `${affectedClip.id}-2`,
          startTime: splitTime,
          endTime: affectedClip.endTime
        }
      );

      toast({
        title: "Clip split successfully",
        description: `Split at ${splitTime.toFixed(2)} seconds`,
      });

      return newClips;
    });
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current && typeof value[0] === 'number') {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleToggleLayer = (id: string) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
    toast({
      title: "Layer visibility toggled",
      description: `Layer ${id} visibility updated`,
    });
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
    // Implement actual export logic here
  };

  const handleClipReorder = (startIndex: number, endIndex: number) => {
    setClips(prevClips => {
      const newClips = [...prevClips];
      const [removed] = newClips.splice(startIndex, 1);
      newClips.splice(endIndex, 0, removed);
      return newClips;
    });
  };

  const handlePreviewClip = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onSplit={handleSplitAtCurrentTime}
        onUndo={() => {}}
        onRedo={() => {}}
      />
      
      <ResizablePanelGroup direction="vertical" className="min-h-screen">
        <ResizablePanel defaultSize={60}>
          <div className="p-4">
            <EditorHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <VideoPreview
                videoRef={videoRef}
                videoUrl={videoUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                volume={volume}
                isMuted={isMuted}
                onPlayPause={togglePlayPause}
                onReset={handleReset}
                onSplit={handleSplitAtCurrentTime}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
              />

              <EditorSidebar
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onEffectChange={handleEffectChange}
                onExport={handleExport}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40}>
          <TimelineSection
            currentTime={currentTime}
            duration={duration}
            clips={clips}
            onSeek={value => handlePreviewClip(value[0])}
            onReorder={handleClipReorder}
            onPreviewClip={handlePreviewClip}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default VideoEditor;