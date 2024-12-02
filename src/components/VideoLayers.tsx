import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

interface VideoLayersProps {
  layers: Layer[];
  onToggleLayer: (id: string) => void;
}

export const VideoLayers = ({ layers, onToggleLayer }: VideoLayersProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Layers</h3>
        <Button variant="ghost" size="sm">
          <Layers className="w-4 h-4 mr-2" />
          Add Layer
        </Button>
      </div>
      <ScrollArea className="h-[200px]">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="p-2 mb-2 bg-gray-700 rounded flex justify-between items-center"
          >
            <span>{layer.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLayer(layer.id)}
            >
              {layer.visible ? 'Hide' : 'Show'}
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};