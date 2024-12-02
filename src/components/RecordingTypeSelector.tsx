import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Camera, Monitor } from "lucide-react";

interface RecordingTypeSelectorProps {
  recordingType: "camera" | "screen";
  setRecordingType: (type: "camera" | "screen") => void;
}

const RecordingTypeSelector = ({
  recordingType,
  setRecordingType,
}: RecordingTypeSelectorProps) => {
  return (
    <RadioGroup
      value={recordingType}
      onValueChange={(value: "camera" | "screen") => setRecordingType(value)}
      className="grid grid-cols-1 gap-4"
    >
      <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
        <RadioGroupItem value="camera" id="camera" className="border-white text-white" />
        <Label htmlFor="camera" className="flex items-center space-x-3 cursor-pointer">
          <Camera className="w-5 h-5" />
          <div>
            <div className="font-medium">Camera Only</div>
            <div className="text-sm text-gray-400">Record yourself using your webcam</div>
          </div>
        </Label>
      </div>

      <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
        <RadioGroupItem value="screen" id="screen" className="border-white text-white" />
        <Label htmlFor="screen" className="flex items-center space-x-3 cursor-pointer">
          <Monitor className="w-5 h-5" />
          <div>
            <div className="font-medium">Screen Only</div>
            <div className="text-sm text-gray-400">Record your screen</div>
          </div>
        </Label>
      </div>
    </RadioGroup>
  );
};

export default RecordingTypeSelector;