import { VideoEffects } from '../VideoEffects';
import { VideoLayers } from '../VideoLayers';
import { ExportOptions } from '../ExportOptions';
import { Layer } from '@/types/editor';

interface EditorSidebarProps {
  layers: Layer[];
  onToggleLayer: (id: string) => void;
  onEffectChange: (effect: string, value: number) => void;
  onExport: (format: string, quality: string) => void;
}

export const EditorSidebar = ({
  layers,
  onToggleLayer,
  onEffectChange,
  onExport,
}: EditorSidebarProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <ExportOptions onExport={onExport} />
      <VideoEffects onEffectChange={onEffectChange} />
      <VideoLayers
        layers={layers}
        onToggleLayer={onToggleLayer}
      />
    </div>
  );
};