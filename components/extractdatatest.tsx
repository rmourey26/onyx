import { PDFDocument } from 'pdf-lib';
import { Worker } from 'tesseract.js';

async function extractDataFromFile(file: Express.Multer.File): Promise<any> {
  const MIME_TYPE_PDF = 'application/pdf';
  const MIME_TYPE_IMAGE = 'image/*';

  try {
    if (file.mimetype === MIME_TYPE_PDF) {
      // Extract data from PDF
      const pdfDoc = await PDFDocument.load(file.buffer);
      const parsedText = await pdfDoc.getPages();
      const extractedData = {
        // Extract relevant data from parsedText into 12 string columns and 2 arrays
        // Example:
        column1: parsedText.split('\n')[0],
        column2: parsedText.split('\n')[1],
        // ... (map remaining columns as needed)
        array1: [...],
        array2: [...],
      };
      return extractedData;
    } else if (file.mimetype.startsWith(MIME_TYPE_IMAGE)) {
      // Extract text from image using Tesseract.js
      const worker = new Worker(worker);
      await worker.load();
      await worker.loadLanguage('eng'); // Adjust language as needed
      const { data: { text } } = await worker.recognize(file.buffer);
      const extractedData = {
        // Extract relevant data from text into 12 string columns and 2 arrays
        // Adapt the structure as needed for image data
      };
      await worker.terminate();
      return extractedData;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting data:', error);
    throw error; // Re-throw to handle in the API route
  }
}
