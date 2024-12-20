import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TeleprompterControls from "@/components/TeleprompterControls";
import RecordingModal from "@/components/RecordingModal";
import TeleprompterPreview from "@/components/TeleprompterPreview";
import RecordingControls from "@/components/RecordingControls";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useRecording } from "@/hooks/useRecording";

const Index = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [speed, setSpeed] = useState(8);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingType, setRecordingType] = useState<"camera" | "screen">("camera");
  const [cameraResolution, setCameraResolution] = useState<"landscape" | "portrait">("landscape");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  const { 
    previewStream, 
    previewVideoRef, 
    startPreview, 
    stopPreview,
    screenStream 
  } = useMediaStream();

  const { 
    startRecording, 
    stopRecording 
  } = useRecording();

  useEffect(() => {
    if (isModalOpen) {
      startPreview(recordingType, cameraResolution);
    }
  }, [recordingType, isModalOpen, cameraResolution]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePreview = () => {
    scrollToTop();
    setIsPreviewing(!isPreviewing);
  };

  const handleStartRecording = async () => {
    scrollToTop();
    console.log('Starting recording with:', {
      type: recordingType,
      resolution: cameraResolution,
      stream: recordingType === "camera" ? previewStream : screenStream,
      audioDevice: selectedAudioDevice
    });
    
    const streamToUse = recordingType === "camera" ? previewStream : screenStream;
    
    if (!streamToUse) {
      console.error('No stream available for recording');
      return;
    }

    const success = await startRecording(
      recordingType, 
      cameraResolution,
      streamToUse,
      selectedAudioDevice
    );
    
    if (success) {
      setIsRecording(true);
      setIsModalOpen(false);
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
        
        <div className="relative w-full overflow-hidden rounded-lg bg-gray-800">
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

          <RecordingControls
            isRecording={isRecording}
            onStartRecording={() => setIsModalOpen(true)}
            onStopRecording={handleStopRecording}
            isPreviewing={isPreviewing}
            onTogglePreview={togglePreview}
          />
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your script here..."
          className="h-40 bg-gray-800 border-gray-700 text-base sm:text-lg"
        />

        <RecordingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            stopPreview();
          }}
          recordingType={recordingType}
          setRecordingType={setRecordingType}
          onStartRecording={handleStartRecording}
          previewVideoRef={previewVideoRef}
          isPreviewActive={!!previewStream}
          cameraResolution={cameraResolution}
          setCameraResolution={setCameraResolution}
          selectedAudioDevice={selectedAudioDevice}
          setSelectedAudioDevice={setSelectedAudioDevice}
        />
      </div>
    </div>
  );
};

export default Index;