import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layer } from '@/types/editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoLayersProps {
  layers: Layer[];
  onToggleLayer: (id: string) => void;
  onAddLayer: (type: 'video' | 'audio') => void;
  onVolumeChange: (layerId: string, volume: number) => void;
  onMuteToggle: (layerId: string) => void;
}

export const VideoLayers = ({
  layers,
  onToggleLayer,
  onAddLayer,
  onVolumeChange,
  onMuteToggle,
}: VideoLayersProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Layers</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Layer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAddLayer('video')}>
              Video Layer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddLayer('audio')}>
              Audio Layer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="h-[200px]">
        {layers.map((layer) => (
          <div key={layer.id} className="mb-2">
            {layer.type === 'audio' ? (
              <div className="p-2 bg-gray-700 rounded flex justify-between items-center">
                <span>{layer.name}</span>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={layer.volume * 100} 
                    onChange={(e) => onVolumeChange(layer.id, Number(e.target.value) / 100)}
                  />
                  <button onClick={() => onMuteToggle(layer.id)}>
                    {layer.muted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-gray-700 rounded flex justify-between items-center">
                <span>{layer.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleLayer(layer.id)}
                >
                  {layer.visible ? 'Hide' : 'Show'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};