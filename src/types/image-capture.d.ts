interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(): Promise<Blob>;
  getPhotoCapabilities(): Promise<PhotoCapabilities>;
  getPhotoSettings(): Promise<PhotoSettings>;
  track: MediaStreamTrack;
}

interface PhotoCapabilities {
  redEyeReduction: RedEyeReduction;
  imageHeight: MediaSettingsRange;
  imageWidth: MediaSettingsRange;
  fillLightMode: FillLightMode[];
}

interface PhotoSettings {
  fillLightMode: FillLightMode;
  imageHeight: number;
  imageWidth: number;
  redEyeReduction: boolean;
}

type RedEyeReduction = "never" | "always" | "controllable";
type FillLightMode = "auto" | "off" | "flash";

interface MediaSettingsRange {
  max: number;
  min: number;
  step: number;
}

declare var ImageCapture: {
  prototype: ImageCapture;
  new(track: MediaStreamTrack): ImageCapture;
};