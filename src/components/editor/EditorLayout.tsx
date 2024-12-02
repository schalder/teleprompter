import React from 'react';
import { EditorHeader } from './EditorHeader';
import { VideoPreview } from './VideoPreview';
import { TimelineSection } from './TimelineSection';
import { EditorSidebar } from './EditorSidebar';
import { VideoSplitControls } from './VideoSplitControls';
import { Layer, TimelineClip } from '@/types/editor';

interface EditorLayoutProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string | undefined;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  layers: Layer[];
  onPlayPause: () => void;
  onReset: () => void;
  onSplit: () => void;
  onTimeUpdate: () => void;
  onVolumeChange: (values: number[]) => void;
  onMuteToggle: () => void;
  onToggleLayer: (id: string) => void;
  onEffectChange: (effect: string, value: number) => void;
  onExport: (format: string, quality: string) => void;
  onAddLayer: (type: 'video' | 'audio') => void;
  onLayerVolumeChange: (layerId: string, volume: number) => void;
  onLayerMuteToggle: (layerId: string) => void;
  onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
  onResizeChange: (dimensions: { width: number; height: number }) => void;
  onSeek: (value: number[]) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreviewClip: (startTime: number) => void;
  clips: TimelineClip[];
}

export const EditorLayout = ({
  videoRef,
  videoUrl,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  layers,
  onPlayPause,
  onReset,
  onSplit,
  onTimeUpdate,
  onVolumeChange,
  onMuteToggle,
  onToggleLayer,
  onEffectChange,
  onExport,
  onAddLayer,
  onLayerVolumeChange,
  onLayerMuteToggle,
  onCropChange,
  onResizeChange,
  onSeek,
  onReorder,
  onPreviewClip,
  clips,
}: EditorLayoutProps) => {
  return (
    <div className="p-4">
      <EditorHeader />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Preview and Timeline Section - Takes up 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          <VideoPreview
            videoRef={videoRef}
            videoUrl={videoUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            volume={volume}
            isMuted={isMuted}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onSplit={onSplit}
            onTimeUpdate={onTimeUpdate}
            onEnded={() => !onPlayPause()}
            onVolumeChange={onVolumeChange}
            onMuteToggle={onMuteToggle}
          />

          <TimelineSection
            currentTime={currentTime}
            duration={duration}
            clips={clips}
            onSeek={onSeek}
            onReorder={onReorder}
            onPreviewClip={onPreviewClip}
          />

          <div className="mt-4">
            <VideoSplitControls
              onSplit={onSplit}
              currentTime={currentTime}
            />
          </div>
        </div>

        {/* Sidebar - Takes up 1 column */}
        <div className="lg:col-span-1">
          <EditorSidebar
            layers={layers}
            onToggleLayer={onToggleLayer}
            onEffectChange={onEffectChange}
            onExport={onExport}
            onAddLayer={onAddLayer}
            onVolumeChange={onLayerVolumeChange}
            onMuteToggle={onLayerMuteToggle}
            onCropChange={onCropChange}
            onResizeChange={onResizeChange}
          />
        </div>
      </div>
    </div>
  );
};