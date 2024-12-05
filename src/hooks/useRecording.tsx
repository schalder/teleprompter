import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getVideoConstraints } from "@/utils/videoUtils";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startRecording = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    existingStream?: MediaStream | null,
    selectedAudioDeviceId?: string
  ) => {
    try {
      let finalStream: MediaStream;

      const videoConstraints = getVideoConstraints(cameraResolution);
      console.log('Using video constraints:', videoConstraints);

      const audioConstraints = {
        deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

      console.log('Starting recording with audio device:', selectedAudioDeviceId);

      // Clean up existing streams
      const existingVideoElement = document.querySelector('video');
      if (existingVideoElement?.srcObject instanceof MediaStream) {
        existingVideoElement.srcObject.getTracks().forEach(track => track.stop());
      }

      if (recordingType === "camera") {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });

        const videoTrack = finalStream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Active video track settings:', settings);
        }
      } else {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: audioConstraints
        });
      }

      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 8000000,
        audioBitsPerSecond: 128000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
      
      console.log('Creating MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'video/webm' 
        });
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: mediaRecorder.mimeType 
          } 
        });
      };

      mediaRecorder.start(1000);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast({
          title: "Permission Required",
          description: "Please grant camera and microphone permissions to start recording.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
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