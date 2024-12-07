// src/hooks/useRecording.tsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startRecording = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    existingStream: MediaStream,
    selectedAudioDeviceId?: string
  ) => {
    try {
      console.log('Starting recording with stream:', {
        id: existingStream.id,
        tracks: existingStream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          settings: t.getSettings()
        }))
      });

      // Clear any existing chunks
      chunksRef.current = [];

      // Define initial recording options for HD
      let options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 5000000, // 5 Mbps for 1080p HD
        audioBitsPerSecond: 128000
      };
      
      // Check if VP8 is supported; fallback to VP9 or H264
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/mp4;codecs=h264,opus';
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            // Fallback to default if none are supported
            options = {};
          }
        }
      }

      mediaRecorderRef.current = new MediaRecorder(existingStream, options);

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data.size);
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        
        if (chunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No data was recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'video/webm' 
        });
        
        console.log('Final blob size:', blob.size);
        
        // Navigate to preview with the recorded video URL
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: mediaRecorderRef.current?.mimeType || 'video/webm'
          } 
        });
      };

      // Start recording with timeslice for better handling on mobile
      mediaRecorderRef.current.start(250);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      return true;
    }
    return false;
  };

  return {
    startRecording,
    stopRecording,
  };
};
