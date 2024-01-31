import Tesseract, { createWorker }from'tesseract.js';
import React, { useState } from 'react'

async function runOCR(imagePath: string): Promise<string> {
 const [whitelist, setWhitelist] = useState<string | "">("")
 const worker = await createWorker();

 await worker.load();
 await worker.load('eng');
 await worker.reinitialize('eng');
 await worker.setParameters({
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
 });
 //await worker.(setWhitelist('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')};

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