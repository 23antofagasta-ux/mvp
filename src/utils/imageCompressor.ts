/**
 * Image compression utility to prevent localStorage QuotaExceededError
 * Resizes large user-uploaded photos (often 2MB - 12MB) down to crisp,
 * optimized thumbnail dimensions (max 320x320 px, ~15KB - 35KB).
 */

export interface CompressResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  format: string;
}

export const compressImageFile = async (
  file: File,
  maxDimension = 320,
  quality = 0.82
): Promise<CompressResult> => {
  return new Promise((resolve, reject) => {
    // If it's a small animated GIF (< 150KB), preserve animation without canvas flattening
    if (file.type === 'image/gif' && file.size <= 150 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          sizeKb: Math.round(file.size / 1024),
          width: 0,
          height: 0,
          format: 'image/gif'
        });
      };
      reader.onerror = () => reject(new Error('Gagal membaca file GIF.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
      img.onload = () => {
        try {
          let targetWidth = img.width;
          let targetHeight = img.height;

          // Calculate aspect ratio scale
          if (targetWidth > targetHeight) {
            if (targetWidth > maxDimension) {
              targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
              targetWidth = maxDimension;
            }
          } else {
            if (targetHeight > maxDimension) {
              targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
              targetHeight = maxDimension;
            }
          }

          // Ensure minimum 1px
          targetWidth = Math.max(1, targetWidth);
          targetHeight = Math.max(1, targetHeight);

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback if canvas 2D is unavailable
            resolve({
              dataUrl: rawDataUrl,
              sizeKb: Math.round(rawDataUrl.length / 1370),
              width: img.width,
              height: img.height,
              format: file.type || 'image/png'
            });
            return;
          }

          // Smooth resampling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Preserve transparent PNG / WebP background
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Prefer WebP or JPEG for massive space savings; use PNG if transparent
          let exportFormat = 'image/jpeg';
          if (file.type === 'image/png' || file.type === 'image/webp') {
            // Test if canvas supports webp
            exportFormat = 'image/webp';
          }

          let compressedDataUrl = canvas.toDataURL(exportFormat, quality);

          // If webp fallback reverted to png and is too big, fall back to high-quality jpeg
          if (compressedDataUrl.length > 100 * 1024 && exportFormat !== 'image/jpeg') {
            // Fill background with white before JPEG to avoid black transparent box
            const jpegCanvas = document.createElement('canvas');
            jpegCanvas.width = targetWidth;
            jpegCanvas.height = targetHeight;
            const jctx = jpegCanvas.getContext('2d');
            if (jctx) {
              jctx.fillStyle = '#ffffff';
              jctx.fillRect(0, 0, targetWidth, targetHeight);
              jctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              compressedDataUrl = jpegCanvas.toDataURL('image/jpeg', quality);
              exportFormat = 'image/jpeg';
            }
          }

          const approxKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl: compressedDataUrl,
            sizeKb: approxKb,
            width: targetWidth,
            height: targetHeight,
            format: exportFormat
          });
        } catch (err: any) {
          reject(new Error('Gagal mengompresi gambar: ' + (err?.message || 'Error internal')));
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
};
