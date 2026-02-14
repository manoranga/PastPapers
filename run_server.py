"""
Production server entry point for Render and other platforms.
Uses Waitress (pure Python) - no compilation required.
"""
import os

from waitress import serve

from app import app

PORT = int(os.environ.get("PORT", 10000))
serve(app, host="0.0.0.0", port=PORT)
