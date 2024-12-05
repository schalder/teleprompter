import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResolutionSelectorProps {
  cameraResolution: "landscape" | "portrait";
  setCameraResolution: (resolution: "landscape" | "portrait") => void;
}

const ResolutionSelector = ({
  cameraResolution,
  setCameraResolution,
}: ResolutionSelectorProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Aspect Ratio</Label>
      <RadioGroup
        defaultValue="portrait"
        value={cameraResolution}
        onValueChange={(value: "landscape" | "portrait") => setCameraResolution(value)}
        className="grid grid-cols-1 gap-4"
      >
        <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
          <RadioGroupItem value="portrait" id="portrait" className="border-white text-white" />
          <Label htmlFor="portrait" className="cursor-pointer">9:16 (Portrait)</Label>
        </div>
        {!isMobile && (
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
            <RadioGroupItem value="landscape" id="landscape" className="border-white text-white" />
            <Label htmlFor="landscape" className="cursor-pointer">16:9 (Landscape)</Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

export default ResolutionSelector;