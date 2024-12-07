import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface TeleprompterControlsProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
}

const TeleprompterControls = ({
  fontSize,
  setFontSize,
  speed,
  setSpeed,
}: TeleprompterControlsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base sm:text-lg">Font Size: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
          min={16}
          max={72}
          step={1}
          className="w-full touch-none"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base sm:text-lg">Scroll Speed: {speed}%</Label>
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(value[0])}
          min={1}
          max={60}
          step={1}
          className="w-full touch-none"
        />
      </div>
    </div>
  );
};

export default TeleprompterControls;
