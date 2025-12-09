
/**
 * Compresses an image file to be under a specified size in MB.
 * It uses HTML Canvas to resize (if too large) and adjust JPEG quality.
 * 
 * @param file - The input image File object
 * @param maxSizeMB - Target maximum size in Megabytes (default: 2)
 * @returns Promise<File> - The compressed file
 */
export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
    const MAX_SIZE_BYTES = maxSizeMB * 1024 * 1024; // 2MB

    // If already smaller, return as is
    if (file.size <= MAX_SIZE_BYTES) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl); // Clean up memory

            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // 1. Initial Limit: Cap dimensions to avoid massive canvas memory usage
            // A 4k image is usually fine, but let's limit to 1920x1920 for profile pics/logos to be safe & fast
            const MAX_DIMENSION = 1920;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const scalingFactor = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                width *= scalingFactor;
                height *= scalingFactor;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 2. Iterative Compression
            // Start at 0.9 quality and step down until file fits
            let quality = 0.9;
            const minQuality = 0.1; // Don't go below 10%

            const attemptCompression = () => {
                // Always convert to JPEG for compression (PNGs don't support quality param effectively)
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }

                        if (blob.size <= MAX_SIZE_BYTES || quality <= minQuality) {
                            // Success or gave up (gave up = return best effort)
                            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            // Try again with lower quality
                            quality -= 0.1;
                            attemptCompression();
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            attemptCompression();
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(objectUrl);
            reject(error);
        };
    });
}
