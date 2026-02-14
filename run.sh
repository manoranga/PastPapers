#!/bin/bash
# Run the Past Papers web application
cd "$(dirname "$0")"

# Create venv if needed
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
python app.py
