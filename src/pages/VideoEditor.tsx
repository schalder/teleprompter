import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { useVideoControls } from '@/hooks/useVideoControls';
import { useVideoEffects } from '@/hooks/useVideoEffects';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const {
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
  } = useVideoControls(videoRef);

  const {
    handleCropChange,
    handleResizeChange,
    handleEffectChange,
    handleExport,
  } = useVideoEffects(videoRef);

  const {
    layers,
    setLayers,
    handleToggleLayer,
    handleAddLayer,
    handleVolumeChange,
    handleMuteToggle,
  } = useVideoEditor(videoRef);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onSplit={handleSplitAtCurrentTime}
        onUndo={() => {}}
        onRedo={() => {}}
      />
      
      <EditorLayout
        videoRef={videoRef}
        videoUrl={videoUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        layers={layers}
        onPlayPause={togglePlayPause}
        onReset={handleReset}
        onSplit={handleSplitAtCurrentTime}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleVolumeChangeArray}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onToggleLayer={handleToggleLayer}
        onEffectChange={handleEffectChange}
        onExport={handleExport}
        onAddLayer={handleAddLayer}
        onLayerVolumeChange={handleVolumeChange}
        onLayerMuteToggle={handleMuteToggle}
        onCropChange={handleCropChange}
        onResizeChange={handleResizeChange}
        onSeek={value => handlePreviewClip(value[0])}
        onReorder={handleClipReorder}
        onPreviewClip={handlePreviewClip}
        clips={layers.find(l => l.type === 'video')?.clips || []}
      />
    </div>
  );
};

export default VideoEditor;