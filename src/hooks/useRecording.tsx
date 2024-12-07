import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type RecordingType = "camera" | "screen";
type CameraResolution = "landscape" | "portrait";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Selects the best supported MIME type for MediaRecorder.
   * Prefers 'video/webm;codecs=vp9,opus' for higher quality if supported.
   * Falls back to 'video/webm;codecs=vp8,opus' or 'video/webm' as needed.
   */
  const getSupportedMimeType = (): string => {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    // Default MIME type if none of the above are supported
    return 'video/webm';
  };

  /**
   * Starts recording the media stream.
   *
   * @param recordingType - Type of recording ('camera' or 'screen').
   * @param cameraResolution - Desired camera resolution ('landscape' or 'portrait').
   * @param existingStream - The MediaStream to record.
   * @param selectedAudioDeviceId - (Optional) Specific audio device ID to use.
   * @returns Promise<boolean> indicating success or failure.
   */
  const startRecording = async (
    recordingType: RecordingType,
    cameraResolution: CameraResolution,
    existingStream: MediaStream,
    selectedAudioDeviceId?: string
  ): Promise<boolean> => {
    try {
      console.log('Starting recording with stream:', {
        id: existingStream.id,
        tracks: existingStream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          settings: t.getSettings()
        }))
      });

      // If a specific audio device is selected, adjust the audio tracks
      if (selectedAudioDeviceId) {
        const audioDevices = await navigator.mediaDevices.enumerateDevices();
        const selectedDevice = audioDevices.find(
          device => device.deviceId === selectedAudioDeviceId && device.kind === 'audioinput'
        );

        if (!selectedDevice) {
          throw new Error('Selected audio device not found.');
        }

        // Stop existing audio tracks
        const audioTracks = existingStream.getAudioTracks();
        audioTracks.forEach(track => {
          console.log(`Stopping audio track: ${track.label}`);
          track.stop();
        });

        // Acquire a new audio track from the selected device
        const audioConstraints = {
          audio: { deviceId: { exact: selectedAudioDeviceId } },
          video: false,
        };
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        if (audioStream.getAudioTracks().length === 0) {
          throw new Error('Failed to acquire audio track from the selected device.');
        }

        const newAudioTrack = audioStream.getAudioTracks()[0];
        existingStream.addTrack(newAudioTrack);
        console.log('Added selected audio track:', newAudioTrack.label);
      }

      // Verify that the stream has audio tracks
      const hasAudio = existingStream.getAudioTracks().length > 0;
      if (!hasAudio) {
        throw new Error('No audio tracks available in the stream.');
      }

      // Clear any existing chunks
      chunksRef.current = [];

      // Determine supported MIME type
      const mimeType = getSupportedMimeType();
      console.log('Using MIME type:', mimeType);

      // Adjust video bitrate based on resolution for better quality
      // Example: 12 Mbps for portrait (1080p), 24 Mbps for landscape (1920x1080)
      const videoBitsPerSecond = cameraResolution === "portrait" ? 12000000 : 24000000;

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond, // Higher bitrate for better quality
        audioBitsPerSecond: 256000, // Increased for better audio quality
      };

      // Combine video and audio tracks into a new MediaStream
      const combinedStream = new MediaStream([
        ...existingStream.getVideoTracks(),
        ...existingStream.getAudioTracks(),
      ]);

      // Initialize MediaRecorder with the combined stream and options
      mediaRecorderRef.current = new MediaRecorder(combinedStream, options);
      console.log('MediaRecorder initialized:', mediaRecorderRef.current);

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data.size);
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop event
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

        // Create a Blob from the recorded chunks
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Final blob size:', blob.size);

        // Navigate to the preview page with the recorded video URL
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType,
          } 
        });

        // Stop all tracks to release resources
        existingStream.getTracks().forEach(track => track.stop());
      };

      // Start recording, requesting data every 250ms
      mediaRecorderRef.current.start(250);
      console.log('Recording started');

      // Notify the user that recording has started
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);

      // Enhanced error handling with specific messages
      let description = "Failed to start recording. Please try again.";

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            description = "Permission denied. Please allow access to your camera and microphone.";
            break;
          case 'NotFoundError':
            description = "Required media device not found. Please ensure your camera and microphone are connected.";
            break;
          case 'NotReadableError':
            description = "Media device is currently in use. Please close other applications that might be using it.";
            break;
          case 'OverconstrainedError':
            description = "The specified constraints are not supported by your device.";
            break;
          default:
            description = error.message;
        }
      } else if (error instanceof Error) {
        description = error.message;
      }

      // Display the error to the user
      toast({
        title: "Recording Error",
        description,
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Stops the ongoing recording.
   *
   * @returns boolean indicating whether a recording was stopped.
   */
  const stopRecording = (): boolean => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped by user');
      return true;
    }
    console.warn('No active recording to stop');
    return false;
  };

  return {
    startRecording,
    stopRecording,
  };
};
