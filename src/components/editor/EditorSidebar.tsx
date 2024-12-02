import { VideoEffects } from '../VideoEffects';
import { VideoLayers } from '../VideoLayers';
import { ExportOptions } from '../ExportOptions';
import { CropResizeControls } from './CropResizeControls';
import { Layer } from '@/types/editor';

interface EditorSidebarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  layers: Layer[];
  onToggleLayer: (id: string) => void;
  onEffectChange: (effect: string, value: number) => void;
  onExport: (format: string, quality: string) => void;
  onAddLayer: (type: 'video' | 'audio') => void;
  onVolumeChange: (layerId: string, volume: number) => void;
  onMuteToggle: (layerId: string) => void;
  onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
  onResizeChange: (dimensions: { width: number; height: number }) => void;
}

export const EditorSidebar = ({
  videoRef,
  layers,
  onToggleLayer,
  onEffectChange,
  onExport,
  onAddLayer,
  onVolumeChange,
  onMuteToggle,
  onCropChange,
  onResizeChange,
}: EditorSidebarProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <ExportOptions onExport={onExport} />
      <CropResizeControls
        videoRef={videoRef}
        onCropChange={onCropChange}
        onResizeChange={onResizeChange}
      />
      <VideoEffects onEffectChange={onEffectChange} />
      <VideoLayers
        layers={layers}
        onToggleLayer={onToggleLayer}
        onAddLayer={onAddLayer}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
      />
    </div>
  );
};