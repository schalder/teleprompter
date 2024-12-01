import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, Monitor, MonitorSmartphone } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  recordingType: "camera" | "screen" | "both";
  setRecordingType: (type: "camera" | "screen" | "both") => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls = ({
  isRecording,
  recordingType,
  setRecordingType,
  onStartRecording,
  onStopRecording,
}: RecordingControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Recording Type</Label>
        <RadioGroup
          value={recordingType}
          onValueChange={(value: "camera" | "screen" | "both") => setRecordingType(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="camera" id="camera" />
            <Label htmlFor="camera" className="flex items-center space-x-1">
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="screen" id="screen" />
            <Label htmlFor="screen" className="flex items-center space-x-1">
              <Monitor className="w-4 h-4" />
              <span>Screen</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both" className="flex items-center space-x-1">
              <MonitorSmartphone className="w-4 h-4" />
              <span>Both</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={isRecording ? onStopRecording : onStartRecording}
        variant={isRecording ? "destructive" : "default"}
        className="w-full"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
};

export default RecordingControls;