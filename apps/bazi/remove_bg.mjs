import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('./public/cats');

async function processImages() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const imgPath = path.join(inputDir, file);
    console.log(`Processing ${file}...`);
    try {
      const blob = await removeBackground(imgPath);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(imgPath, buffer);
      console.log(`Successfully removed background for ${file}`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}

processImages().catch(console.error);
