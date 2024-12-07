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
      console.log('Starting recording with:', {
        type: recordingType,
        resolution: cameraResolution,
        stream: existingStream,
        audioDevice: selectedAudioDeviceId
      });

      // Clear any existing chunks
      chunksRef.current = [];

      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 12000000, // 12 Mbps for higher quality
        audioBitsPerSecond: 128000
      };
      
      // Fallback if vp8 is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
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
          type: 'video/webm' 
        });
        
        console.log('Final blob size:', blob.size);
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: 'video/webm'
          } 
        });
      };

      // Request data more frequently for better quality
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