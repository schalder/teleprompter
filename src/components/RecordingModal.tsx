import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Camera, Monitor, MonitorSmartphone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingType: "camera" | "screen" | "both";
  setRecordingType: (type: "camera" | "screen" | "both") => void;
  onStartRecording: () => void;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  isPreviewActive: boolean;
  cameraResolution: "landscape" | "portrait";
  setCameraResolution: (resolution: "landscape" | "portrait") => void;
}

const RecordingModal = ({
  isOpen,
  onClose,
  recordingType,
  setRecordingType,
  onStartRecording,
  previewVideoRef,
  isPreviewActive,
  cameraResolution,
  setCameraResolution,
}: RecordingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white max-h-[90vh] overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Start Recording</h2>
              <p className="text-gray-400">Choose what you want to record</p>
            </div>

            <RadioGroup
              value={recordingType}
              onValueChange={(value: "camera" | "screen" | "both") => setRecordingType(value)}
              className="grid grid-cols-1 gap-4"
            >
              <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="camera" id="camera" />
                <Label htmlFor="camera" className="flex items-center space-x-3 cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Camera Only</div>
                    <div className="text-sm text-gray-400">Record yourself using your webcam</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="screen" id="screen" />
                <Label htmlFor="screen" className="flex items-center space-x-3 cursor-pointer">
                  <Monitor className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Screen Only</div>
                    <div className="text-sm text-gray-400">Record your screen</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center space-x-3 cursor-pointer">
                  <MonitorSmartphone className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Screen & Camera</div>
                    <div className="text-sm text-gray-400">Record your screen with camera overlay</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {(recordingType === "camera") && (
              <div className="space-y-2">
                <Label className="text-lg font-medium">Camera Resolution</Label>
                <RadioGroup
                  value={cameraResolution}
                  onValueChange={(value: "landscape" | "portrait") => setCameraResolution(value)}
                  className="grid grid-cols-1 gap-4"
                >
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="landscape" id="landscape" />
                    <Label htmlFor="landscape" className="cursor-pointer">1920x1080 (Landscape)</Label>
                  </div>
                  <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <Label htmlFor="portrait" className="cursor-pointer">1080x1920 (Portrait)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {isPreviewActive && (
              <div className={`aspect-video bg-gray-800 rounded-lg overflow-hidden ${cameraResolution === "portrait" ? "aspect-[9/16]" : ""}`}>
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover [transform:scaleX(-1)]"
                />
              </div>
            )}

            <Button
              onClick={onStartRecording}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg"
            >
              Start Recording
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;