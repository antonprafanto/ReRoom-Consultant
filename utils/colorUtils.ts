
export const extractPalette = async (imageSrc: string): Promise<string[]> => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Resize to small dimensions for faster processing
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(0, 0, 100, 100).data;
    const colorCounts: Record<string, number> = {};

    // Sample pixels
    for (let i = 0; i < imageData.length; i += 4 * 5) { // Sample every 5th pixel
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        if (a < 200) continue; // Ignore transparent/semi-transparent pixels

        // Quantize colors to group similar shades (Round to nearest 32)
        const q = 32;
        const rQ = Math.round(r / q) * q;
        const gQ = Math.round(g / q) * q;
        const bQ = Math.round(b / q) * q;
        
        const key = `${rQ},${gQ},${bQ}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    // Sort by frequency
    const sorted = Object.entries(colorCounts).sort(([, a], [, b]) => b - a);
    
    const palette: string[] = [];
    
    // Helper: Calculate Euclidean Color Distance
    const getDist = (hex1: string, hex2: string) => {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);
        
        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);
        
        return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
    }

    for (const [key] of sorted) {
        if (palette.length >= 5) break;
        
        const [r, g, b] = key.split(',').map(Number);
        // Ensure values are within 0-255 range
        const clamp = (v: number) => Math.max(0, Math.min(255, v));
        
        // Convert to Hex
        const hex = "#" + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
        
        // Check difference from existing selected colors to ensure variety
        let isDistinct = true;
        for (const existing of palette) {
            if (getDist(existing, hex) < 60) { // Threshold for "too similar"
                isDistinct = false;
                break;
            }
        }
        
        if (isDistinct) {
            palette.push(hex);
        }
    }
    
    return palette;
};
