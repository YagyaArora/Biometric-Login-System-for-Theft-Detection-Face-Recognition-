import { writeFile, mkdir, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const modelsDir = join(process.cwd(), 'public', 'models');
const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-shard2',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filePath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      // Delete the file async if there's an error
      import('fs').then(fs => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  });
}

async function downloadModel(fileName) {
  const url = `${MODEL_URL}/${fileName}`;
  const filePath = join(modelsDir, fileName);
  
  console.log(`Downloading ${fileName}...`);
  
  try {
    await downloadFile(url, filePath);
    console.log(`Downloaded ${fileName} successfully`);
  } catch (error) {
    console.error(`Error downloading ${fileName}:`, error.message);
  }
}

async function main() {
  // Create models directory if it doesn't exist
  try {
    await access(modelsDir);
  } catch {
    await mkdir(modelsDir, { recursive: true });
  }
  
  // Download all models in parallel
  await Promise.all(MODELS.map(downloadModel));
  
  console.log('All models downloaded successfully!');
}

main().catch(console.error);
