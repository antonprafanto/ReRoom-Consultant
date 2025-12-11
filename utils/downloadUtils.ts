
/**
 * Triggers a download of a base64 image string.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Generates a side-by-side collage of the original and generated images.
   * Returns a Promise that resolves to the base64 data URL of the collage.
   */
  export const createComparisonCollage = async (
    originalSrc: string,
    generatedSrc: string,
    styleName: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img1 = new Image();
      const img2 = new Image();
      
      // Enable cross-origin for canvas manipulation if images are from external URLs
      img1.crossOrigin = "Anonymous";
      img2.crossOrigin = "Anonymous";
  
      let loadedCount = 0;
      const onLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          drawCollage();
        }
      };
  
      img1.onload = onLoad;
      img2.onload = onLoad;
      img1.onerror = reject;
      img2.onerror = reject;
  
      img1.src = originalSrc;
      img2.src = generatedSrc;
  
      const drawCollage = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
  
        // Config
        const gap = 20;
        const padding = 40;
        const labelHeight = 60;
        const footerHeight = 40;
        
        // Calculate dimensions (Standardize height to the tallest image, usually they match)
        const contentHeight = Math.max(img1.height, img2.height);
        
        // We'll scale images to be reasonably sized for the collage if they are massive
        // Or keep original resolution. Let's keep original for quality, but ensure matching heights.
        const scale1 = contentHeight / img1.height;
        const scale2 = contentHeight / img2.height;
        
        const w1 = img1.width * scale1;
        const w2 = img2.width * scale2;
  
        canvas.width = w1 + w2 + gap + (padding * 2);
        canvas.height = contentHeight + labelHeight + footerHeight + (padding * 2);
  
        // Draw Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        // Draw Text Styles
        ctx.fillStyle = '#111827'; // Gray-900
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
  
        // Draw Images
        const imgY = padding + labelHeight;
        ctx.drawImage(img1, padding, imgY, w1, contentHeight);
        ctx.drawImage(img2, padding + w1 + gap, imgY, w2, contentHeight);
  
        // Draw Labels
        ctx.fillText("Original Room", padding, padding + 40);
        ctx.fillText(`Reimagined (${styleName})`, padding + w1 + gap, padding + 40);
  
        // Draw Footer (Branding)
        ctx.fillStyle = '#6366F1'; // Indigo-500
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText("Designed with LuminaAI", canvas.width - padding, canvas.height - padding + 10);
  
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
    });
  };
