# Past Papers - G.C.E. O/L Sri Lanka

A web application to browse and access G.C.E. O/L past papers, similar to [pastpapers.wiki](https://pastpapers.wiki/). Data is scraped from [e-thaksalawa](https://e-thaksalawa.moe.gov.lk/lcms/course/view.php?id=872) (Ministry of Education, Sri Lanka).

## Features

- **Browse by subject** – Mathematics, Science, English, History, ICT, and more
- **Search** – Find papers by subject or title
- **Direct links** – Papers link to e-thaksalawa (official source)
- **Scraper** – Python script to fetch latest papers from e-thaksalawa

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the scraper (optional)

The project includes sample data. To fetch the latest papers:

```bash
python scraper/ethaksalawa_scraper.py
```

Output is saved to `data/papers.json`.

### 3. Run the web app

```bash
python app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

```
Papers/
├── app.py              # Flask web application
├── requirements.txt
├── README.md
├── scraper/
│   └── ethaksalawa_scraper.py   # Scraper for e-thaksalawa
├── data/
│   └── papers.json     # Scraped papers (run scraper to update)
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── app.js
```

## Scraper

The scraper parses the e-thaksalawa Past Papers course page and extracts:

- Subject sections (Buddhism, Mathematics, Science, etc.)
- Paper titles, years, and types (Past Paper, Marking Scheme)
- Direct links to view/download papers

```bash
# Default output: data/papers.json
python scraper/ethaksalawa_scraper.py

# Custom output path
python scraper/ethaksalawa_scraper.py output/custom.json
```

## Ads (Google AdSense)

To enable ads, set these environment variables (e.g. in Render Dashboard → Environment):

| Variable | Description |
|----------|-------------|
| `ADSENSE_CLIENT_ID` | Your AdSense publisher ID (e.g. `ca-pub-XXXXXXXXXXXXXXXX`) |
| `ADSENSE_SLOT_BANNER` | Ad unit slot ID for the banner below hero |
| `ADSENSE_SLOT_RECTANGLE` | Ad unit slot ID for the rectangle ad |
| `ADSENSE_SLOT_MODAL` | Ad unit slot ID for the modal (shown on subject/paper click, max once per minute) |

Create ad units in [Google AdSense](https://www.google.com/adsense) and use the slot IDs. Without slot IDs, AdSense may use auto-placement.

## Disclaimer

This project is for educational use only. All content is sourced from e-thaksalawa. Copyrights remain with the original owners (Ministry of Education, Sri Lanka).
