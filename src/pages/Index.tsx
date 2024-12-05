import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import DeviceSelector from "@/components/DeviceSelector";
import ResolutionSelector from "@/components/ResolutionSelector";
import RecordingTypeSelector from "@/components/RecordingTypeSelector";
import PreviewManager from "@/components/PreviewManager";
import { useDeviceManagement } from "@/hooks/useDeviceManagement";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingType: "camera" | "screen";
  setRecordingType: (type: "camera" | "screen") => void;
  onStartRecording: () => boolean;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  isPreviewActive: boolean;
  cameraResolution: "landscape" | "portrait";
  setCameraResolution: (resolution: "landscape" | "portrait") => void;
  selectedAudioDevice: string;
  setSelectedAudioDevice: (deviceId: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
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
  selectedAudioDevice,
  setSelectedAudioDevice,
  setIsRecording,
  setIsModalOpen
}: RecordingModalProps) => {
  const {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    updateDevices,
    hasPermissions
  } = useDeviceManagement(selectedAudioDevice, setSelectedAudioDevice);

  useEffect(() => {
    if (isOpen) {
      updateDevices();
      // Set portrait as default on mobile
      if (window.innerWidth <= 768 && cameraResolution !== "portrait") {
        setCameraResolution("portrait");
      }
      navigator.mediaDevices.addEventListener('devicechange', updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
      };
    }
  }, [isOpen, hasPermissions]);

  const handleStartRecording = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const success = onStartRecording();
    if (success) {
      setIsRecording(true);
      setIsModalOpen(false);
    }
    return success;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white flex flex-col h-[90vh]">
        <DialogTitle className="text-2xl font-bold text-center">Start Recording</DialogTitle>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              <p className="text-gray-400 text-center">Choose what you want to record</p>

              <RecordingTypeSelector
                recordingType={recordingType}
                setRecordingType={setRecordingType}
              />

              {recordingType === "camera" && (
                <>
                  <DeviceSelector
                    label="Camera"
                    devices={videoDevices}
                    selectedDevice={selectedVideoDevice}
                    onDeviceChange={setSelectedVideoDevice}
                    placeholder="Select a camera"
                  />

                  <DeviceSelector
                    label="Microphone"
                    devices={audioDevices}
                    selectedDevice={selectedAudioDevice}
                    onDeviceChange={setSelectedAudioDevice}
                    placeholder="Select a microphone"
                  />

                  <ResolutionSelector
                    cameraResolution={cameraResolution}
                    setCameraResolution={setCameraResolution}
                  />
                </>
              )}

              <PreviewManager
                isPreviewActive={isPreviewActive}
                recordingType={recordingType}
                hasPermissions={hasPermissions}
                selectedVideoDevice={selectedVideoDevice}
                selectedAudioDevice={selectedAudioDevice}
                cameraResolution={cameraResolution}
                previewVideoRef={previewVideoRef}
              />
            </div>
          </ScrollArea>
        </div>
        
        <div className="p-6 border-t border-gray-800 mt-auto">
          <Button
            onClick={handleStartRecording}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg"
          >
            Start Recording
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;