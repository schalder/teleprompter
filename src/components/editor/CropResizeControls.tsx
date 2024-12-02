import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Crop, Maximize2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CropResizeControlsProps {
  onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
  onResizeChange: (dimensions: { width: number; height: number }) => void;
}

export const CropResizeControls = ({
  onCropChange,
  onResizeChange,
}: CropResizeControlsProps) => {
  const [cropValues, setCropValues] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  const handleCropChange = (type: keyof typeof cropValues, value: number[]) => {
    const newCropValues = { ...cropValues, [type]: value[0] };
    setCropValues(newCropValues);
    onCropChange(newCropValues);
    toast({
      title: "Crop Updated",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} set to ${value[0]}%`,
    });
  };

  const handleResizeChange = (type: keyof typeof dimensions, value: number[]) => {
    const newDimensions = { ...dimensions, [type]: value[0] };
    setDimensions(newDimensions);
    onResizeChange(newDimensions);
    toast({
      title: "Resize Updated",
      description: `${type} set to ${value[0]}px`,
    });
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Crop & Resize</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Crop className="w-4 h-4 mr-2" />
            Crop
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4 mr-2" />
            Resize
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Crop X (%)</label>
          <Slider
            value={[cropValues.x]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleCropChange('x', value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Crop Y (%)</label>
          <Slider
            value={[cropValues.y]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleCropChange('y', value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Crop Width (%)</label>
          <Slider
            value={[cropValues.width]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleCropChange('width', value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Crop Height (%)</label>
          <Slider
            value={[cropValues.height]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleCropChange('height', value)}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div>
            <label className="text-sm text-gray-400">Width (px)</label>
            <Slider
              value={[dimensions.width]}
              min={320}
              max={3840}
              step={16}
              onValueChange={(value) => handleResizeChange('width', value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Height (px)</label>
            <Slider
              value={[dimensions.height]}
              min={240}
              max={2160}
              step={16}
              onValueChange={(value) => handleResizeChange('height', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};