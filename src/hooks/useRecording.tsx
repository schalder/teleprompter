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

      const audioConstraints: MediaTrackConstraints = selectedAudioDeviceId 
        ? {
            deviceId: { exact: selectedAudioDeviceId },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
            channelCount: 2
          } 
        : true;

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

      console.log('Starting recording...');
      mediaRecorder.start(1000);
      
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