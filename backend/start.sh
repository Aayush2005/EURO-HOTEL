#!/bin/bash

# Euro Hotel Backend Startup Script

echo "🏨 Starting Euro Hotel Authentication Backend..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run: python -m venv .venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."
uv pip install -e .

# Start the server
echo "🚀 Starting FastAPI server..."
python run.py