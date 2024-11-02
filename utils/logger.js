import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, '..', 'resy.log');

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `${timestamp}: ${message}\n`;
  
  // // Log to file
  fs.appendFileSync(logFile, logMessage);
}

export { log }; 