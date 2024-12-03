import { useEffect } from "react";
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

  // Force portrait mode on mobile
  useEffect(() => {
    if (isMobile) {
      setCameraResolution("portrait");
    }
  }, [isMobile, setCameraResolution]);

  // On mobile, don't render any options, just show current mode
  if (isMobile) {
    return (
      <div className="space-y-2">
        <Label className="text-lg font-medium">Camera Resolution</Label>
        <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700">
          <Label className="cursor-default">1080x1920 (Portrait)</Label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Camera Resolution</Label>
      <RadioGroup
        value={cameraResolution}
        onValueChange={(value: "landscape" | "portrait") => setCameraResolution(value)}
        className="grid grid-cols-1 gap-4"
      >
        <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
          <RadioGroupItem value="landscape" id="landscape" className="border-white text-white" />
          <Label htmlFor="landscape" className="cursor-pointer">1920x1080 (Landscape)</Label>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
          <RadioGroupItem value="portrait" id="portrait" className="border-white text-white" />
          <Label htmlFor="portrait" className="cursor-pointer">1080x1920 (Portrait)</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ResolutionSelector;