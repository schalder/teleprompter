interface VideoConstraints {
  aspectRatio: number;
  width?: { min: number; ideal: number; max: number };
  height?: { min: number; ideal: number; max: number };
}

export const getVideoConstraints = (resolution: "landscape" | "portrait"): VideoConstraints => {
  const isLandscape = resolution === "landscape";
  const aspectRatio = isLandscape ? 16/9 : 9/16;
  
  // Base constraints on aspect ratio
  const constraints: VideoConstraints = {
    aspectRatio: aspectRatio,
  };

  // Add flexible resolution constraints
  if (isLandscape) {
    constraints.width = {
      min: 1280,
      ideal: 1920,
      max: 3840
    };
  } else {
    constraints.height = {
      min: 1280,
      ideal: 1920,
      max: 3840
    };
  }

  return constraints;
};

export const calculateDimensions = (width: number, height: number, targetResolution: "landscape" | "portrait"): { width: number; height: number } => {
  const currentAspectRatio = width / height;
  const targetAspectRatio = targetResolution === "landscape" ? 16/9 : 9/16;

  if (Math.abs(currentAspectRatio - targetAspectRatio) < 0.1) {
    return { width, height };
  }

  if (targetResolution === "landscape") {
    return {
      width: Math.max(width, height * (16/9)),
      height: Math.min(height, width * (9/16))
    };
  } else {
    return {
      width: Math.min(width, height * (9/16)),
      height: Math.max(height, width * (16/9))
    };
  }
};