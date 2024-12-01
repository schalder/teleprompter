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
      <div className="flex flex-col sm:flex-row gap-3">
        {isRecording ? (
          <Button
            onClick={onStopRecording}
            variant="destructive"
            className="w-full py-6 text-lg"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={onTogglePreview}
              variant="outline"
              className="w-full py-6 text-lg text-gray-300 hover:text-white"
            >
              {isPreviewing ? "Stop Preview" : "Preview Scroll"}
            </Button>
            <Button
              onClick={onStartRecording}
              variant="default"
              className="w-full py-6 text-lg"
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