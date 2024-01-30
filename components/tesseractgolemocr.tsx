import * as fs from "fs";
import { TesseractOcrOnGolem } from "tesseract-ocr-golem";

/**
 * Utility used to write down results
 *
 * @param text The resulting text if any present
 */
const writeTextToResultFile = (text?: string) => {
  if (text) {
    fs.writeFileSync(`./examples/out/results.txt`, text, { flag: "a" });
  }
};

(async () => {
  const ocr = new TesseractOcrOnGolem({
    service: {
      market: {
        rentHours: 0.5,
        priceGlmPerHour: 1.0,
      },
      deploy: {
        maxReplicas: 4,
        resources: {
          minCpu: 1,
        },
        downscaleIntervalSec: 60,
      },
      initTimeoutSec: 90,
      requestStartTimeoutSec: 30,
    },
    args: {
      lang: "eng",
    },
  });

  try {
    // Power-on the OCR, get the resources on Golem Network
    // This will wait until the resources are found and the OCR is ready to use
    await ocr.init();

    // Do your work
    console.log("Starting work for my customers...");
    const texts = await Promise.all([
      ocr.convertImageToText("./examples/data/img.png"),
      ocr.convertImageToText("./examples/data/5W40s.png"),
      ocr.convertImageToText("./examples/data/msword_text_rendering.png"),
      ocr.convertImageToText("./examples/data/poem.png"),
    ]);

    texts.forEach(writeTextToResultFile);

    console.log("Work done, going to bill my customers...");
    // TODO: Bill your customers ;)
  } catch (err) {
    console.error(err, "Failed to run the OCR on Golem");
  } finally {
    await ocr.shutdown();
  }
})().catch((err) => console.error(err, "Error in main"));