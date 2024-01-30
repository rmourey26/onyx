import { createWorker } from 'tesseract.js';
import React from 'react'

async function runOCR(imagePath: string): Promise<string> 
  const worker = createWorker();

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  });
  await worker.setWhitelist('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');

  const { data: { text } } = await worker.recognize(imagePath);
  await worker.terminate();

  return text;
}

runOCR('path/to/image.jpg')
  .then((result) => {
    console.log('OCR Result:', result);
  })
  .catch((error) => {
    console.error('OCR Error:', error);
  });