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
    existingStream?: MediaStream | null,
    selectedAudioDeviceId?: string
  ) => {
    try {
      let finalStream: MediaStream;

      const audioConstraints: MediaTrackConstraints = {
        deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

      console.log('Starting recording with audio device:', selectedAudioDeviceId);
      console.log('Audio constraints:', audioConstraints);

      if (recordingType === "camera") {
        const videoConstraints: MediaTrackConstraints = {
          frameRate: { ideal: 30 },
          facingMode: "user"
        };

        // Set resolution based on orientation
        if (cameraResolution === "landscape") {
          videoConstraints.width = { exact: 1920 };
          videoConstraints.height = { exact: 1080 };
        } else {
          videoConstraints.width = { exact: 1080 };
          videoConstraints.height = { exact: 1920 };
        }

        console.log('Video constraints:', videoConstraints);

        finalStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });

        // Verify the selected devices
        const videoTrack = finalStream.getVideoTracks()[0];
        const audioTrack = finalStream.getAudioTracks()[0];
        
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Recording video track settings:', settings);
        }
        
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          console.log('Recording audio track settings:', settings);
          if (selectedAudioDeviceId && settings.deviceId !== selectedAudioDeviceId) {
            console.warn('Warning: Active recording audio device differs from selected device');
            toast({
              title: "Audio Device Warning",
              description: "Could not use the selected microphone. Using default device instead.",
              variant: "destructive",
            });
          }
        }
      } else {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30 }
          },
          audio: audioConstraints
        });
      }

      // Optimized MediaRecorder options for mobile
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus', // Changed to VP8 for better mobile support
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };
      
      // Fallback if the preferred codec isn't supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
      
      console.log('Creating MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('Received chunk of size:', event.data.size);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        
        const blob = new Blob(chunksRef.current, { 
          type: 'video/webm' // Force WebM format
        });
        
        console.log('Final blob size:', blob.size);
        
        finalStream.getTracks().forEach(track => track.stop());
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob),
            mimeType: 'video/webm'
          } 
        });
      };

      console.log('Starting recording with timeslice: 500ms');
      mediaRecorder.start(500);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please ensure camera and microphone permissions are granted and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
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