export async function uploadImageToCloudinary(file: File, cloudName?: string, uploadPreset?: string): Promise<string> {
  const cName = cloudName || (typeof process !== 'undefined' ? process.env.CLOUDINARY_CLOUD_NAME : '') || (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const cPreset = uploadPreset || (typeof process !== 'undefined' ? process.env.CLOUDINARY_UPLOAD_PRESET : '') || (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cName && cPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      }
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    } catch (err) {
      console.warn('Cloudinary upload error, falling back to data URL:', err);
    }
  }

  // Fallback if Cloudinary credentials are not configured or request failed
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
