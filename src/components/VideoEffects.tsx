import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoEffectsProps {
  onEffectChange: (effect: string, value: number) => void;
}

export const VideoEffects = ({ onEffectChange }: VideoEffectsProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Effects</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Filter</label>
          <Select onValueChange={(value) => onEffectChange('filter', 1)}>
            <SelectTrigger>
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="sepia">Sepia</SelectItem>
              <SelectItem value="blur">Blur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Brightness</label>
          <Slider
            defaultValue={[100]}
            max={200}
            min={0}
            step={1}
            onValueChange={(value) => onEffectChange('brightness', value[0])}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Contrast</label>
          <Slider
            defaultValue={[100]}
            max={200}
            min={0}
            step={1}
            onValueChange={(value) => onEffectChange('contrast', value[0])}
          />
        </div>
      </div>
    </div>
  );
};