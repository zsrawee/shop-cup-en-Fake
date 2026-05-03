import imageCompression from 'browser-image-compression';

export async function compressImage(imageFile: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Maximum image size after compression (1 MB)
    maxWidthOrHeight: 1920, // Maximum width or height (shrinks large images)
    useWebWorker: true, // Uses a web worker to prevent browser freezing
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    console.error("Error while compressing image:", error);
    return imageFile; // If compression fails, return the original image
  }
}