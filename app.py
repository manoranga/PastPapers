"""
Past Papers Web Application
Flask backend serving scraped papers from e-thaksalawa
"""

import json
from pathlib import Path

from flask import Flask, jsonify, render_template

app = Flask(__name__, static_folder="static", template_folder="templates")

DATA_FILE = Path(__file__).parent / "data" / "papers.json"


def load_papers():
    """Load papers data from JSON file."""
    if not DATA_FILE.exists():
        return {"source": "", "subjects": []}
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def index():
    """Home page."""
    return render_template("index.html")


@app.route("/api/papers")
def api_papers():
    """API endpoint for papers data."""
    data = load_papers()
    return jsonify(data)


@app.route("/api/subjects")
def api_subjects():
    """API endpoint for subject list."""
    data = load_papers()
    subjects = [{"name": s["name"], "count": len(s["papers"])} for s in data["subjects"]]
    return jsonify({"subjects": subjects})


@app.route("/api/subject/<subject_name>")
def api_subject(subject_name):
    """API endpoint for papers by subject."""
    data = load_papers()
    for subject in data["subjects"]:
        if subject["name"].lower().replace(" ", "-") == subject_name.lower().replace(" ", "-"):
            return jsonify(subject)
        if subject["name"] == subject_name:
            return jsonify(subject)
    return jsonify({"error": "Subject not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
