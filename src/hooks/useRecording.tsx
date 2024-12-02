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
          width: { exact: cameraResolution === "landscape" ? 1920 : 1080 },
          height: { exact: cameraResolution === "landscape" ? 1080 : 1920 },
          frameRate: { ideal: 30 },
          facingMode: "user"
        };

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

      // Improved MediaRecorder options for better mobile compatibility
      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 2500000, // Reduced for better mobile handling
        audioBitsPerSecond: 128000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
      
      console.log('Creating MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect data more frequently on mobile
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('Received chunk of size:', event.data.size);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        
        // Ensure all chunks are collected before creating blob
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'video/webm' 
        });
        
        console.log('Final blob size:', blob.size);
        
        // Clean up the stream
        finalStream.getTracks().forEach(track => track.stop());
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: mediaRecorder.mimeType 
          } 
        });
      };

      // Collect chunks more frequently (every 500ms instead of 1000ms)
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