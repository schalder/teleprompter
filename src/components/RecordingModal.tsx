import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import DeviceSelector from "./DeviceSelector";
import ResolutionSelector from "./ResolutionSelector";
import { useToast } from "./ui/use-toast";
import VideoPreview from "./VideoPreview";
import RecordingTypeSelector from "./RecordingTypeSelector";
import { useDevicePermissions } from "@/hooks/useDevicePermissions";

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
  selectedAudioDevice: string;
  setSelectedAudioDevice: (deviceId: string) => void;
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
}: RecordingModalProps) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const { toast } = useToast();
  const { hasPermissions, checkPermissions } = useDevicePermissions();

  const updateDevices = async () => {
    try {
      if (!hasPermissions) {
        const granted = await checkPermissions();
        if (!granted) return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoInputs = devices.filter(device => device.kind === 'videoinput' && device.deviceId);
      const audioInputs = devices.filter(device => device.kind === 'audioinput' && device.deviceId);
      
      console.log('Available devices in modal:', {
        video: videoInputs.map(d => ({ id: d.deviceId, label: d.label })),
        audio: audioInputs.map(d => ({ id: d.deviceId, label: d.label }))
      });

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      
      if (!selectedVideoDevice && videoInputs.length > 0) {
        const defaultDevice = videoInputs[0];
        console.log('Setting default video device:', defaultDevice.label);
        setSelectedVideoDevice(defaultDevice.deviceId);
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
      updateDevices();
      navigator.mediaDevices.addEventListener('devicechange', updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
      };
    }
  }, [isOpen, hasPermissions]);

  useEffect(() => {
    const updatePreview = async () => {
      if (!isPreviewActive || recordingType !== "camera" || !hasPermissions) return;

      try {
        if (previewVideoRef.current?.srcObject instanceof MediaStream) {
          previewVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        console.log('Updating preview with devices:', {
          video: selectedVideoDevice,
          audio: selectedAudioDevice
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? {
            deviceId: { exact: selectedVideoDevice },
            width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
            height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
            frameRate: { ideal: 30 },
          } : true,
          audio: selectedAudioDevice ? {
            deviceId: { exact: selectedAudioDevice },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true,
        });

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          await previewVideoRef.current.play();
          
          console.log('Preview updated with new devices');
          
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) {
            const settings = audioTrack.getSettings();
            console.log('Preview audio track settings:', settings);
          }
        }
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    };

    updatePreview();
  }, [selectedVideoDevice, selectedAudioDevice, isPreviewActive, recordingType, cameraResolution, hasPermissions]);

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

              {isPreviewActive && (
                <VideoPreview
                  previewVideoRef={previewVideoRef}
                  cameraResolution={cameraResolution}
                />
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