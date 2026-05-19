export const hashFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error(`FILE_ERROR: Failed to convert ${file.name} to base64 format.`));
      }
    };
    reader.onerror = () => reject(new Error(`FILE_ERROR: Error reading ${file.name}. The file might be corrupted.`));
  });
};

export const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error(`FILE_ERROR: Failed to extract text from ${file.name}.`));
      }
    };
    reader.onerror = () => reject(new Error(`FILE_ERROR: Error reading ${file.name}. The file might be corrupted.`));
  });
};
