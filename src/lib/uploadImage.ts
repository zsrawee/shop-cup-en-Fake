export async function uploadImageToCloud(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Send the image to the local API we created
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  
  if (!data.url) {
    throw new Error("Failed to upload image locally");
  }
  
  return data.url; // It will return a link like: /imag/123456-image.jpg
}