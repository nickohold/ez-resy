#!/bin/bash

# Navigate to project directory
cd /change/this/to/your/project/directory

# Set NYC timezone for date commands
export TZ=America/New_York # Change this to your desired timezone

# Get current date and hour in NYC time
CURRENT_DATE=$(date +%Y-%m-%d)
VENUE_ZONE_TIME=$(date +%H:%M) # e.g. 09:00
VENUE_ZONE_HOUR=$(date +%H) # e.g. 09

# Set local timezone for logging local time
TIME_LOCAL=$(date -u "+%Y-%m-%d %H:%M:%S %Z" -d 'TZ="'"$(cat /etc/timezone)"'"')

# Enhance logging with timestamps and timezones
echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Starting cron job. Venue Time: $CURRENT_DATE $VENUE_ZONE_TIME, Local Time: $TIME_LOCAL" >> ./resy.log 2>&1

# Read target date from .env file
TARGET_DATE=$(grep DATE .env | cut -d '=' -f2)
# Check if current date is past target date
if [[ "$CURRENT_DATE" > "$TARGET_DATE" ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Target date $TARGET_DATE has passed. Removing cron job..." >> ./resy.log 2>&1
    crontab -l | grep -v "$(basename "$0")" | crontab -
    exit 0
fi

# Only run at 8 AM NYC time
# if [ "$HOUR_NY" -eq 08 ]; then
if [ 1 -eq 1 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Running reservation check at Venue Time $VENUE_ZONE_TIME." >> ./resy.log 2>&1

    # Load environment variables
    source ~/.bash_profile  # Adjust this if your env variables are in a different file

    # Run the script and capture output
    OUTPUT=$(npm run start --silent 2>&1)
    echo "$OUTPUT" >> ./resy.log 2>&1

    # Check if reservation was successful
    if echo "$OUTPUT" | grep -q "You've got a reservation!"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Reservation successful! Removing cron job..." >> ./resy.log 2>&1
        crontab -l | grep -v "$(basename "$0")" | crontab -
        exit 0
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Not 8 AM Venue Time yet. Current Venue Time: $VENUE_ZONE_TIME. Waiting..." >> ./resy.log 2>&1
fi 
