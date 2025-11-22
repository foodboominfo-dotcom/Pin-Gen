
import JSZip from 'jszip';
import { GeneratedPin } from '../types';

export const getPinFilename = (keyword: string) => {
  return `pin-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
};

export const createPinsZip = async (pins: GeneratedPin[]): Promise<Blob> => {
  const zip = new JSZip();
  
  // Add images to zip
  for (const pin of pins) {
    if (pin.finalImageBase64) {
      const filename = getPinFilename(pin.keyword);
      // Remove header data:image/jpeg;base64,
      const data = pin.finalImageBase64.split(',')[1];
      zip.file(filename, data, { base64: true });
    }
  }
  
  return await zip.generateAsync({ type: 'blob' });
};
