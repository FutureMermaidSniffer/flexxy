#!/bin/bash
# Script to find and kill processes using port 3003 on Linux

echo "Scanning for processes using port 3003..."

# Find process using port 3003
PORT_PROCESSES=$(sudo lsof -i:3003 -t)

if [ -z "$PORT_PROCESSES" ]; then
  echo "No processes found using port 3003"
  exit 0
else
  echo "Found the following processes using port 3003:"
  sudo lsof -i:3003
  
  echo "Killing processes..."
  for PID in $PORT_PROCESSES; do
    PROCESS_NAME=$(ps -p $PID -o comm=)
    echo "Killing $PROCESS_NAME (PID: $PID)"
    sudo kill -9 $PID
    if [ $? -eq 0 ]; then
      echo "✓ Process $PID terminated successfully"
    else
      echo "✗ Failed to terminate process $PID"
    fi
  done
fi

# Verify port is free now
echo "Verifying port 3003 is free..."
REMAINING=$(sudo lsof -i:3003 -t)
if [ -z "$REMAINING" ]; then
  echo "✓ Port 3003 is now free"
else
  echo "✗ There are still processes using port 3003"
  sudo lsof -i:3003
fi
