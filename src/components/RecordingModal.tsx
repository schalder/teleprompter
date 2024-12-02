import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Camera, Monitor } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import DeviceSelector from "./DeviceSelector";
import ResolutionSelector from "./ResolutionSelector";
import { useToast } from "./ui/use-toast";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingType: "camera" | "screen";
  setRecordingType: (type: "camera" | "screen") => void;
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
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const { toast } = useToast();

  const updateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      
      // Only set default devices if none are selected
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        variant: "destructive",
        title: "Device Error",
        description: "Failed to access media devices. Please check permissions.",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Request initial permissions and enumerate devices
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(() => updateDevices())
        .catch((error) => {
          console.error('Error accessing media:', error);
          toast({
            variant: "destructive",
            title: "Permission Error",
            description: "Please grant camera and microphone permissions.",
          });
        });

      // Listen for device changes
      navigator.mediaDevices.addEventListener('devicechange', updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
      };
    }
  }, [isOpen]);

  // Effect to handle device selection changes
  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera") return;

      try {
        // Stop existing tracks
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        // Get new stream with selected devices
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? {
            deviceId: selectedVideoDevice,
            width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
          } : true,
          audio: selectedAudioDevice ? {
            deviceId: selectedAudioDevice,
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error updating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "Failed to update preview with selected devices.",
        });
      }
    };

    updatePreview();
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white flex flex-col h-[90vh]">
        <DialogTitle className="text-2xl font-bold text-center">Start Recording</DialogTitle>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              <p className="text-gray-400 text-center">Choose what you want to record</p>

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

              {isPreviewActive && (
                <div className={`relative ${cameraResolution === "portrait" ? "w-[240px] h-[427px]" : "w-full aspect-video"} mx-auto bg-gray-800 rounded-lg overflow-hidden`}>
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover [transform:scaleX(-1)]"
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="p-6 border-t border-gray-800 mt-auto">
          <Button
            onClick={onStartRecording}
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