#!/bin/bash

# Get absolute path to project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Make cron script executable
chmod +x "$PROJECT_DIR/cron-script.sh"

# Create log file with proper permissions
touch "$PROJECT_DIR/resy.log"
chmod 644 "$PROJECT_DIR/resy.log"

# Remove existing cron job if it exists and setup new one
# CRON_CMD="*/5 14-18 * * * $PROJECT_DIR/cron-script.sh"
CRON_CMD="* * * * * $PROJECT_DIR/cron-script.sh"
# Save current crontab without the cron-script.sh line
current_crontab=$(crontab -l 2>/dev/null | grep -v "cron-script.sh") || true

# Install new cron job
(echo "$current_crontab" | grep . ; echo "$CRON_CMD") | crontab -
echo "✅ Cron job updated successfully"

# Stream the log file
# echo "📝 Streaming logs from resy.log..."
# tail -f "$PROJECT_DIR/resy.log"