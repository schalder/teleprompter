import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { useToast } from '@/hooks/use-toast';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { VideoPreview } from '@/components/editor/VideoPreview';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { TimelineSection } from '@/components/editor/TimelineSection';
import { VideoSplitControls } from '@/components/editor/VideoSplitControls';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { nanoid } from 'nanoid';

const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    layers,
    setLayers,
    handleToggleLayer,
    handleAddLayer,
    handleVolumeChange,
    handleMuteToggle,
  } = useVideoEditor(videoRef);

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
      setLayers(prevLayers => 
        prevLayers.map(layer => 
          layer.id === '1' 
            ? {
                ...layer,
                clips: [{
                  id: nanoid(),
                  startTime: 0,
                  endTime: video.duration
                }]
              }
            : layer
        )
      );
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [setDuration, setLayers]);

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
    setLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.type !== 'video') return layer;

        const newClips = layer.clips.flatMap(clip => {
          if (splitTime > clip.startTime && splitTime < clip.endTime) {
            return [
              {
                id: nanoid(),
                startTime: clip.startTime,
                endTime: splitTime
              },
              {
                id: nanoid(),
                startTime: splitTime,
                endTime: clip.endTime
              }
            ];
          }
          return [clip];
        });

        return {
          ...layer,
          clips: newClips
        };
      });
    });

    toast({
      title: "Clip Split",
      description: `Video split at ${splitTime.toFixed(2)} seconds`,
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
  };

  const handleClipReorder = (startIndex: number, endIndex: number) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        if (layer.type !== 'video') return layer;
        
        const newClips = [...layer.clips];
        const [removed] = newClips.splice(startIndex, 1);
        newClips.splice(endIndex, 0, removed);
        return { ...layer, clips: newClips };
      })
    );
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
                onVolumeChange={setVolume}
                onMuteToggle={() => setIsMuted(!isMuted)}
              />

              <EditorSidebar
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onEffectChange={handleEffectChange}
                onExport={handleExport}
                onAddLayer={handleAddLayer}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
              />
            </div>

            <div className="mt-4">
              <VideoSplitControls
                onSplit={handleSplitAtCurrentTime}
                currentTime={currentTime}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40}>
          <TimelineSection
            currentTime={currentTime}
            duration={duration}
            clips={layers.find(l => l.type === 'video')?.clips || []}
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