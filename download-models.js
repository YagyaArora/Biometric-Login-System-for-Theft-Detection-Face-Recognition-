const fs = require('fs');
const path = require('path');
const https = require('https');

const models = [
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard2',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json',
  'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1',
  'https://github.com/justadudewhoksh/face-api.js/raw/master/weights/face_recognition_model-shard2'
];

const modelsDir = path.join(__dirname, 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Download function
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file async if there's an error
      reject(err);
    });
  });
}

// Download all models
async function downloadModels() {
  console.log('Starting to download models...');
  
  for (const modelUrl of models) {
    const fileName = modelUrl.split('/').pop();
    const filePath = path.join(modelsDir, fileName);
    
    console.log(`Downloading ${fileName}...`);
    await downloadFile(modelUrl, filePath);
    console.log(`✓ ${fileName} downloaded`);
  }
  
  console.log('\nAll models downloaded successfully!');
}

// Run the download
downloadModels().catch(console.error);
