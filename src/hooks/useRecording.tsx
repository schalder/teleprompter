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
          frameRate: { exact: 30 },
          facingMode: "user"
        };

        // Force exact dimensions based on orientation
        if (cameraResolution === "landscape") {
          videoConstraints.width = { exact: 1920 };
          videoConstraints.height = { exact: 1080 };
          videoConstraints.aspectRatio = { exact: 16/9 };
        } else {
          videoConstraints.width = { exact: 1080 };
          videoConstraints.height = { exact: 1920 };
          videoConstraints.aspectRatio = { exact: 9/16 };
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
          
          // Verify if orientation matches requested
          if (cameraResolution === "portrait" && settings.width && settings.height) {
            if (settings.width > settings.height) {
              console.warn('Warning: Video track orientation mismatch');
              toast({
                title: "Orientation Warning",
                description: "Camera orientation may not match selected mode",
                variant: "destructive",
              });
            }
          }
        }
        
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          console.log('Recording audio track settings:', settings);
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
        mimeType: 'video/webm;codecs=vp8,opus',
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
          type: 'video/webm'
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