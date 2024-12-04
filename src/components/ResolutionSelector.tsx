import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <Label className="text-lg font-medium">Camera Resolution</Label>
      <Select 
        value={cameraResolution} 
        onValueChange={(value: "landscape" | "portrait") => setCameraResolution(value)}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Select resolution" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="landscape" className="text-white hover:bg-gray-700">
            1920x1080 (Landscape)
          </SelectItem>
          <SelectItem value="portrait" className="text-white hover:bg-gray-700">
            1080x1920 (Portrait)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ResolutionSelector;