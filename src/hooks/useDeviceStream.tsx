// src/hooks/useDeviceStream.tsx

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDeviceStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  /**
   * Acquires a MediaStream from the user's camera and microphone with resolution fallback.
   *
   * @param videoDeviceId - (Optional) Specific video device ID to use.
   * @param audioDeviceId - (Optional) Specific audio device ID to use.
   * @param aspectRatio - Desired aspect ratio ('landscape' or 'portrait').
   * @returns Promise<MediaStream | null> - The acquired MediaStream or null if failed.
   */
  const getDeviceStream = async (
    videoDeviceId: string,
    audioDeviceId: string,
    aspectRatio: "landscape" | "portrait"
  ): Promise<MediaStream | null> => {
    // Define desired resolutions based on aspect ratio
    const desiredResolutions: { width: number; height: number }[] =
      aspectRatio === "portrait"
        ? [
            { width: 1080, height: 1920 }, // 1080p Portrait
            { width: 720, height: 1280 },  // 720p Portrait
          ]
        : [
            { width: 1920, height: 1080 }, // 1080p Landscape
            { width: 1280, height: 720 },  // 720p Landscape
          ];

    for (const resolution of desiredResolutions) {
      try {
        // Stop and clear any existing stream to prevent conflicts
        if (stream) {
          console.log('Stopping existing stream:', stream.id);
          stream.getTracks().forEach((track) => {
            console.log(`Stopping track: ${track.kind} - ${track.label}`);
            track.stop();
          });
        }

        // Define video constraints
        const videoConstraints: MediaTrackConstraints = {
          deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          width: { exact: resolution.width },
          height: { exact: resolution.height },
          frameRate: { ideal: 30 }, // Ensures smooth video playback
          facingMode: "user", // Front-facing camera
        };

        // Define audio constraints
        const audioConstraints: MediaTrackConstraints = {
          deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000, // Higher sample rate for better audio quality
        };

        // Combine video and audio constraints
        const constraints: MediaStreamConstraints = {
          video: videoConstraints,
          audio: audioConstraints,
        };

        console.log('Requesting media with constraints:', constraints);
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Stream obtained with tracks:', newStream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
        
        setStream(newStream);
        console.log(`Successfully acquired stream at ${resolution.width}x${resolution.height}`);
        return newStream;
      } catch (error) {
        console.warn(`Failed to acquire stream at ${resolution.width}x${resolution.height}:`, error);
        // Continue to try the next lower resolution
      }
    }

    // If all attempts fail, notify the user
    toast({
      variant: "destructive",
      title: "Device Error",
      description: "Failed to access camera or microphone at desired resolutions. Please check permissions and device capabilities.",
    });

    return null;
  };

  return { stream, getDeviceStream };
};
