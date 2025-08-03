#!/bin/bash

echo "FlexJobs Scraping Setup and Test"
echo "================================"
echo ""

echo "Installing required dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Running setup validation tests..."
node scripts/test-scraping-setup.js
if [ $? -ne 0 ]; then
    echo ""
    echo "SETUP INCOMPLETE: Please fix the issues above"
    exit 1
fi

echo ""
echo "================================"
echo "Setup completed successfully!"
echo "================================"
echo ""
echo "Available scraping commands:"
echo "  npm run scrape:jobs     - Full comprehensive scraping"
echo "  npm run scrape:basic    - Basic scraping (no API keys needed)"
echo "  npm run scrape:schedule - Start scheduled scraping service"
echo ""
echo "To run your first scraping session:"
echo "  npm run scrape:jobs"
echo ""
