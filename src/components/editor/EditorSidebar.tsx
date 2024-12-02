import { VideoEffects } from '../VideoEffects';
import { VideoLayers } from '../VideoLayers';
import { ExportOptions } from '../ExportOptions';
import { Layer } from '@/types/editor';

interface EditorSidebarProps {
  layers: Layer[];
  onToggleLayer: (id: string) => void;
  onEffectChange: (effect: string, value: number) => void;
  onExport: (format: string, quality: string) => void;
  onAddLayer: (type: 'video' | 'audio') => void;
  onVolumeChange: (layerId: string, volume: number) => void;
  onMuteToggle: (layerId: string) => void;
}

export const EditorSidebar = ({
  layers,
  onToggleLayer,
  onEffectChange,
  onExport,
  onAddLayer,
  onVolumeChange,
  onMuteToggle,
}: EditorSidebarProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <ExportOptions onExport={onExport} />
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