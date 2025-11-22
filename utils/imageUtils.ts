
import { ColorTheme } from "../types";

/**
 * Loads a base64 string into an HTMLImageElement
 */
const loadImage = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
};

/**
 * Wraps text to fit within a maximum width
 */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

/**
 * Generates the final Pinterest composite image
 * Size: 1000x2000 (1:2 Ratio)
 */
export const createCompositePin = async (
  image1Base64: string,
  image2Base64: string,
  title: string,
  keyword: string,
  website: string,
  colors: ColorTheme
): Promise<string> => {
  const WIDTH = 1000;
  const HEIGHT = 2000;
  const HALF_HEIGHT = HEIGHT / 2;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  try {
    // Load Images
    const [img1, img2] = await Promise.all([
      loadImage(image1Base64),
      loadImage(image2Base64)
    ]);

    // Draw Image 1 (Top Half)
    ctx.drawImage(img1, 0, 0, WIDTH, HALF_HEIGHT);

    // Draw Image 2 (Bottom Half)
    ctx.drawImage(img2, 0, HALF_HEIGHT, WIDTH, HALF_HEIGHT);

    // --- Overlay Design: Bold Band ---
    
    const text = keyword.toUpperCase();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dynamic Font Sizing - Reduced starting size
    let fontSize = 90; 
    const maxTextWidth = WIDTH * 0.80; // More padding
    
    // Setup Font
    ctx.font = `700 ${fontSize}px 'Oswald', sans-serif`;
    let lines = wrapText(ctx, text, maxTextWidth);

    // Shrink font if too many lines
    while (lines.length > 3 && fontSize > 40) {
       fontSize -= 5;
       ctx.font = `700 ${fontSize}px 'Oswald', sans-serif`;
       lines = wrapText(ctx, text, maxTextWidth);
    }

    // Calculate Band Height
    const lineHeight = fontSize * 1.2;
    const textBlockHeight = lines.length * lineHeight;
    const paddingY = 50;
    const bottomAreaHeight = 60; 
    const boxHeight = textBlockHeight + (paddingY * 2) + bottomAreaHeight;
    
    const boxY = HALF_HEIGHT - (boxHeight / 2);
    
    // Draw Shadow for Depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 15;
    
    // Draw Band
    ctx.fillStyle = colors.band;
    ctx.fillRect(0, boxY, WIDTH, boxHeight);
    
    // Reset Shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // --- Draw Main Keyword Text ---
    ctx.fillStyle = colors.text;
    
    // Calculate start Y for text to be centered in the text area
    const textCenterY = boxY + paddingY + (textBlockHeight / 2);
    let currentTextY = textCenterY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach(line => {
       ctx.fillText(line, WIDTH / 2, currentTextY);
       currentTextY += lineHeight;
    });

    // --- Draw Divider Line ---
    const dividerY = boxY + boxHeight - bottomAreaHeight - 10;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo((WIDTH / 2) - 50, dividerY);
    ctx.lineTo((WIDTH / 2) + 50, dividerY);
    ctx.stroke();

    // --- Draw Website URL ---
    ctx.font = `400 26px 'Inter', sans-serif`;
    ctx.fillStyle = colors.url || colors.text; 
    const urlY = boxY + boxHeight - (bottomAreaHeight / 2) + 5;
    
    const displayUrl = website ? website.toUpperCase() : "WWW.YOURWEBSITE.COM";
    ctx.fillText(displayUrl, WIDTH / 2, urlY);

  } catch (e) {
    console.error("Compositing failed", e);
    throw e;
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};
