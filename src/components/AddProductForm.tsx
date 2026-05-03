"use client";

import { addProduct } from "@/actions/productActions";
import { compressImage } from "@/lib/compressImage";
import { uploadImageToCloud } from "@/lib/uploadImage";
import { useState, useTransition } from "react";

export default function AddProductForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Store the uploaded image URLs

  // ✅ Function to handle uploading multiple images
  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        // 1. Compress each image
        const compressed = await compressImage(files[i]);
        // 2. Upload it to save locally and get the link (/imag/...)
        const url = await uploadImageToCloud(compressed);
        uploadedUrls.push(url);
      }
      setImageUrls(uploadedUrls); // Save the URLs for display and submission
    } catch (error) {
      alert("An error occurred while uploading one of the images");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Add the uploaded URLs to FormData for the Server Action to receive
    imageUrls.forEach(url => formData.append("images", url));
    
    startTransition(async () => {
      await addProduct(formData);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Hidden field to pass seller ID */}
      <input type="hidden" name="sellerId" value={userId} />

      {/* Product name field */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
        <input 
          type="text" 
          name="title" 
          required 
          className="w-full border border-gray-300 p-2.5 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Example: iPhone 15 Pro"
        />
      </div>

      {/* Description field */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
        <textarea 
          name="description" 
          required
          rows={4}
          className="w-full border border-gray-300 p-2.5 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Write a detailed description of the product..."
        />
      </div>

      {/* Price and Stock field */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
          <input 
            type="number" 
            name="price" 
            step="0.01"
            required 
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="999.99"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Stock (Quantity)</label>
          <input 
            type="number" 
            name="stock" 
            required 
            defaultValue={1}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      </div>

      {/* ✅ New image upload field */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Product Images</label>
        <input 
          type="file" 
          accept="image/*"
          multiple
          onChange={handleImagesChange} 
          className="w-full border border-gray-300 p-2.5 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
          disabled={isUploadingImages}
        />
        {isUploadingImages && <p className="text-blue-600 text-xs mt-1 animate-pulse">Compressing and uploading images, please wait...</p>}
        
        {/* Preview of images that were uploaded and saved in the local folder */}
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {imageUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`product-${idx}`} className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button 
        type="submit" 
        disabled={isPending || isUploadingImages} // Prevent saving during upload
        className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
      >
        {isPending ? "Adding product..." : "Add Product 🚀"}
      </button>
    </form>
  );
}