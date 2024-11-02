import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../utils/logger.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Make cron script executable
execSync(`chmod +x ${path.join(projectRoot, 'cron-script.sh')}`);

// Create log file with proper permissions
execSync(`touch ${path.join(projectRoot, 'resy.log')}`);
execSync(`chmod 644 ${path.join(projectRoot, 'resy.log')}`);

// Setup cron job
const cronCommand = `*/5 14-17 * * * ${path.join(projectRoot, 'cron-script.sh')}`;
try {
    const existingCron = execSync('crontab -l').toString();
    if (!existingCron.includes('cron-script.sh')) {
        execSync(`(crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`);
        log('✅ Cron job installed successfully');
    } else {
        log('ℹ️ Cron job already exists');
    }
} catch (error) {
    execSync(`echo "${cronCommand}" | crontab -`);
    log('✅ Cron job installed successfully');
} 