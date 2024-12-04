import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface ResolutionSelectorProps {
  cameraResolution: "landscape" | "portrait";
  setCameraResolution: (resolution: "landscape" | "portrait") => void;
}

const ResolutionSelector = ({
  cameraResolution,
  setCameraResolution,
}: ResolutionSelectorProps) => {
  const isMobile = useIsMobile();

  // Force portrait mode on mobile devices
  useEffect(() => {
    if (isMobile && cameraResolution !== "portrait") {
      setCameraResolution("portrait");
    }
  }, [isMobile, cameraResolution, setCameraResolution]);

  if (isMobile) {
    return (
      <div className="space-y-2">
        <Label className="text-lg font-medium">Camera Resolution</Label>
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          <p className="text-white">1080x1920 (Portrait)</p>
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
