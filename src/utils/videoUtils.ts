interface VideoConstraints {
  aspectRatio: number;
  width?: { min?: number; ideal?: number; max?: number };
  height?: { min?: number; ideal?: number; max?: number };
}

export const getVideoConstraints = (resolution: "landscape" | "portrait"): VideoConstraints => {
  const isLandscape = resolution === "landscape";
  
  return {
    aspectRatio: isLandscape ? 16/9 : 9/16,
    // Set minimum dimensions to ensure decent quality
    ...(isLandscape ? {
      width: { min: 640, ideal: 1280 },
      height: { min: 360, ideal: 720 }
    } : {
      width: { min: 360, ideal: 720 },
      height: { min: 640, ideal: 1280 }
    })
  };
};