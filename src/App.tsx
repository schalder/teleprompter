import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Preview from "./pages/Preview";

const App: React.FC = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<"camera" | "screen">("camera");
  const [cameraResolution, setCameraResolution] = useState<"landscape" | "portrait">("portrait");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);

  const handleStartRecording = () => {
    console.log("Starting recording...");
    return true; // Return true to indicate success
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Index
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                recordingType={recordingType}
                setRecordingType={setRecordingType}
                onStartRecording={handleStartRecording}
                previewVideoRef={previewVideoRef}
                isPreviewActive={true}
                cameraResolution={cameraResolution}
                setCameraResolution={setCameraResolution}
                selectedAudioDevice={selectedAudioDevice}
                setSelectedAudioDevice={setSelectedAudioDevice}
                setIsRecording={setIsRecording}
                setIsModalOpen={setIsModalOpen}
              />
            } />
            <Route path="/preview" element={<Preview />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;