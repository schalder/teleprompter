import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
}

const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  isPreviewing,
  onTogglePreview,
}: RecordingControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {isRecording ? (
          <Button
            onClick={onStopRecording}
            variant="destructive"
            className="w-full"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={onTogglePreview}
              variant="outline"
              className="w-full text-gray-700 hover:text-gray-900"
            >
              {isPreviewing ? "Stop Preview" : "Preview Scroll"}
            </Button>
            <Button
              onClick={onStartRecording}
              variant="default"
              className="w-full"
            >
              Start Recording
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;