/**
 * High quality smart image compressor
 * Target size: ~70KB
 * Preserves visual quality using WebP format, adaptive canvas scaling, and quality optimization.
 */

export async function compressImageToTargetSize(
  file: File,
  targetSizeKB: number = 70
): Promise<File> {
  // If file is already smaller than target size and is a small image, return directly
  const maxSizeBytes = targetSizeKB * 1024;
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Capping initial max dimension to 1400px for crispness on high DPI screens
      const maxDim = 1400;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const drawToCanvas = (w: number, h: number) => {
        canvas.width = w;
        canvas.height = h;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
        }
      };

      const getBlob = (quality: number, mimeType: string = 'image/webp'): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((b) => res(b), mimeType, quality);
        });
      };

      const runCompressionLoop = async () => {
        let currentWidth = width;
        let currentHeight = height;
        let currentQuality = 0.85; // Start with high quality
        let bestBlob: Blob | null = null;

        drawToCanvas(currentWidth, currentHeight);

        // Try webp first, fallback to jpeg if canvas webp unsupported
        let mimeType = 'image/webp';
        let testBlob = await getBlob(0.8, 'image/webp');
        if (!testBlob || testBlob.type !== 'image/webp') {
          mimeType = 'image/jpeg';
        }

        for (let iteration = 0; iteration < 8; iteration++) {
          drawToCanvas(currentWidth, currentHeight);
          const blob = await getBlob(currentQuality, mimeType);

          if (blob) {
            bestBlob = blob;
            if (blob.size <= maxSizeBytes) {
              // Target size reached while maintaining quality!
              break;
            }
          }

          // Step down quality
          if (currentQuality > 0.60) {
            currentQuality -= 0.08;
          } else {
            // Scale dimensions down slightly (15% reduction) if quality alone isn't enough
            currentWidth = Math.round(currentWidth * 0.85);
            currentHeight = Math.round(currentHeight * 0.85);
            currentQuality = 0.72; // Reset to decent quality for smaller resolution
          }

          // Safety min dimensions (e.g. 400px width/height)
          if (currentWidth < 350 || currentHeight < 350) {
            break;
          }
        }

        if (bestBlob) {
          const extension = mimeType === 'image/webp' ? '.webp' : '.jpg';
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + extension;
          const compressedFile = new File([bestBlob], newFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original
        }
      };

      runCompressionLoop();
    };

    img.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
