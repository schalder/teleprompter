import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecordingTypeSelectorProps {
  recordingType: "camera" | "screen";
  setRecordingType: (type: "camera" | "screen") => void;
}

const RecordingTypeSelector = ({
  recordingType,
  setRecordingType,
}: RecordingTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Recording Type</Label>
      <Select value={recordingType} onValueChange={(value: "camera" | "screen") => setRecordingType(value)}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Select recording type" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="camera" className="text-white hover:bg-gray-700">Camera Recording</SelectItem>
          <SelectItem value="screen" className="text-white hover:bg-gray-700">Screen Recording</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RecordingTypeSelector;