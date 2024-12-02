import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { useVideoControls } from '@/hooks/useVideoControls';
import { useVideoEffects } from '@/hooks/useVideoEffects';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { Layer, TimelineClip } from '@/types/editor';

const VideoEditor = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [undoStack, setUndoStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);

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

  const handleDeleteClip = (clipId: string) => {
    const currentLayer = layers.find(l => l.type === 'video');
    if (!currentLayer) return;

    // Save current state for undo
    setUndoStack(prev => [...prev, currentLayer.clips]);
    setRedoStack([]); // Clear redo stack on new action

    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.type !== 'video') return layer;
        return {
          ...layer,
          clips: layer.clips.filter(clip => clip.id !== clipId)
        };
      })
    );

    toast({
      title: "Clip Deleted",
      description: `Clip has been removed`,
    });
  };

  const handleDeleteRange = (start: number, end: number) => {
    if (!videoRef.current) return;

    const currentLayer = layers.find(l => l.type === 'video');
    if (!currentLayer) return;

    // Save current state for undo
    setUndoStack(prev => [...prev, currentLayer.clips]);
    setRedoStack([]); // Clear redo stack on new action

    setLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.type !== 'video') return layer;

        const newClips = layer.clips.filter(clip => 
          clip.startTime >= end || clip.endTime <= start
        );

        return {
          ...layer,
          clips: newClips
        };
      });
    });

    toast({
      title: "Range Deleted",
      description: `Deleted video range from ${start.toFixed(2)}s to ${end.toFixed(2)}s`,
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousClips = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    // Save current state for redo
    const currentLayer = layers.find(l => l.type === 'video');
    if (currentLayer) {
      setRedoStack(prev => [...prev, currentLayer.clips]);
    }

    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.type === 'video' 
          ? { ...layer, clips: previousClips }
          : layer
      )
    );
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextClips = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    // Save current state for undo
    const currentLayer = layers.find(l => l.type === 'video');
    if (currentLayer) {
      setUndoStack(prev => [...prev, currentLayer.clips]);
    }

    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.type === 'video' 
          ? { ...layer, clips: nextClips }
          : layer
      )
    );
  };

  const handleSplitAtCurrentTime = () => {
    if (!videoRef.current) return;
    const splitTime = videoRef.current.currentTime;

    // Save current state for undo
    const currentLayer = layers.find(l => l.type === 'video');
    if (currentLayer) {
      setUndoStack(prev => [...prev, currentLayer.clips]);
      setRedoStack([]); // Clear redo stack on new action
    }

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <KeyboardShortcuts
        onPlayPause={togglePlayPause}
        onSplit={handleSplitAtCurrentTime}
        onUndo={handleUndo}
        onRedo={handleRedo}
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
        onDeleteRange={handleDeleteRange}
        onDeleteClip={handleDeleteClip}
        onReorder={(startIndex, endIndex) => {
          const currentLayer = layers.find(l => l.type === 'video');
          if (currentLayer) {
            const newClips = [...currentLayer.clips];
            const [removed] = newClips.splice(startIndex, 1);
            newClips.splice(endIndex, 0, removed);
            setLayers(prevLayers =>
              prevLayers.map(layer =>
                layer.type === 'video' ? { ...layer, clips: newClips } : layer
              )
            );
          }
        }}
        onPreviewClip={handlePreviewClip}
        clips={layers.find(l => l.type === 'video')?.clips || []}
      />
    </div>
  );
};

export default VideoEditor;