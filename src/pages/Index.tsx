import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TeleprompterControls from "@/components/TeleprompterControls";
import TeleprompterPreview from "@/components/TeleprompterPreview";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useRecording } from "@/hooks/useRecording";
import DeviceSelector from "@/components/DeviceSelector";
import ResolutionSelector from "@/components/ResolutionSelector";
import RecordingTypeSelector from "@/components/RecordingTypeSelector";
import PreviewManager from "@/components/PreviewManager";
import { useDeviceManagement } from "@/hooks/useDeviceManagement";
import { Square } from "lucide-react";

const Index = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [speed, setSpeed] = useState(8);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingType, setRecordingType] = useState<"camera" | "screen">("camera");
  const [cameraResolution, setCameraResolution] = useState<"landscape" | "portrait">("landscape");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  const { 
    previewStream, 
    previewVideoRef, 
    startPreview, 
    stopPreview,
    screenCaptureStream 
  } = useMediaStream();

  const { 
    startRecording, 
    stopRecording 
  } = useRecording();

  const {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    updateDevices,
    hasPermissions
  } = useDeviceManagement(selectedAudioDevice, setSelectedAudioDevice);

  useEffect(() => {
    updateDevices();
    navigator.mediaDevices.addEventListener('devicechange', updateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
    };
  }, [hasPermissions]);

  useEffect(() => {
    if (isPreviewing) {
      startPreview(recordingType, cameraResolution);
    }
  }, [recordingType, isPreviewing, cameraResolution]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePreview = () => {
    scrollToTop();
    setIsPreviewing(!isPreviewing);
    if (!isPreviewing) {
      startPreview(recordingType, cameraResolution);
    } else {
      stopPreview();
    }
  };

  const handleStartRecording = async () => {
    scrollToTop();
    const success = await startRecording(
      recordingType, 
      cameraResolution,
      recordingType === "screen" ? screenCaptureStream : null,
      selectedAudioDevice
    );
    if (success) {
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (stopRecording()) {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Teleprompter For Digital Creators</h1>
        
        {/* Recording Controls */}
        <div className="fixed top-4 right-4 z-50">
          {isRecording && (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              className="py-6 text-lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Device Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg">
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
        </div>

        {/* Preview */}
        <div className="relative w-full overflow-hidden rounded-lg bg-gray-800">
          <PreviewManager
            isPreviewActive={isPreviewing}
            recordingType={recordingType}
            hasPermissions={hasPermissions}
            selectedVideoDevice={selectedVideoDevice}
            selectedAudioDevice={selectedAudioDevice}
            cameraResolution={cameraResolution}
            previewVideoRef={previewVideoRef}
          />
          <TeleprompterPreview
            text={text}
            fontSize={fontSize}
            speed={speed}
            isScrolling={isPreviewing || isRecording}
          />
        </div>
        
        <div className="space-y-4 bg-gray-800 p-4 sm:p-6 rounded-lg">
          <TeleprompterControls
            fontSize={fontSize}
            setFontSize={setFontSize}
            speed={speed}
            setSpeed={setSpeed}
          />

          {!isRecording && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={togglePreview}
                variant="secondary"
                className="w-full py-6 text-lg"
              >
                {isPreviewing ? "Stop Preview" : "Preview Scroll"}
              </Button>
              <Button
                onClick={handleStartRecording}
                variant="default"
                className="w-full py-6 text-lg"
              >
                Start Recording
              </Button>
            </div>
          )}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your script here..."
          className="h-40 bg-gray-800 border-gray-700 text-base sm:text-lg"
        />
      </div>
    </div>
  );
};

export default Index;