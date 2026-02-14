"""
e-thaksalawa Past Papers Scraper
Scrapes G.C.E. O/L past papers from https://e-thaksalawa.moe.gov.lk/lcms/course/view.php?id=872
"""

import json
import re
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://e-thaksalawa.moe.gov.lk/lcms"
COURSE_URL = f"{BASE_URL}/course/view.php?id=872"

# Sections to skip (navigation, announcements, etc.)
SKIP_SECTIONS = {"General", "Online Papers"}


def extract_year_from_title(title: str) -> str | None:
    """Extract year from paper title. E.g. '2022(2023)' or '2019' or '2024(2025)'"""
    # Match patterns like 2022(2023), 2024(2025), 2019, 2020
    match = re.search(r"20\d{2}(?:\(20\d{2}\))?", title)
    return match.group(0) if match else None


def extract_paper_type(title: str) -> str:
    """Extract paper type: 'Paper', 'Marking Scheme', 'Quiz', etc."""
    title_lower = title.lower()
    if "marking scheme" in title_lower:
        return "Marking Scheme"
    if "quiz" in title_lower:
        return "Quiz"
    if "paper" in title_lower or "pp" in title_lower or "i/ii" in title_lower:
        return "Past Paper"
    return "Resource"


def scrape_course() -> dict:
    """
    Scrape the e-thaksalawa Past Papers course page.
    Returns structured data: { subjects: [ { name, papers: [...] } ] }
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    response = requests.get(COURSE_URL, headers=headers, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    subjects = []

    # Find all section headers (Moodle uses div.section or li.section)
    sections = soup.find_all("div", class_="section") or soup.find_all("li", class_="section")

    for section in sections:
        section_title_el = section.find("h3", class_="sectionname") or section.find("span", class_="sectionname")
        if not section_title_el:
            continue

        section_name = section_title_el.get_text(strip=True)
        if section_name in SKIP_SECTIONS:
            continue

        papers = []

        # Find all activity links (resources and quizzes)
        for link in section.find_all("a", href=True):
            href = link.get("href", "")
            if "mod/resource/view" not in href and "mod/quiz/view" not in href:
                continue

            title = link.get_text(strip=True)
            if not title:
                continue

            # Build full URL
            full_url = urljoin(BASE_URL, href) if not href.startswith("http") else href

            # Check if it's PDF (some have PDF badge)
            parent = link.find_parent("div", class_="activity") or link.find_parent("li", class_="activity")
            parent_text = parent.get_text() if parent else ""
            is_pdf = "PDF" in parent_text

            paper = {
                "title": title,
                "url": full_url,
                "year": extract_year_from_title(title),
                "type": extract_paper_type(title),
                "format": "PDF" if is_pdf else "File",
            }
            papers.append(paper)

        if papers:
            subjects.append({"name": section_name, "papers": papers})

    return {"source": COURSE_URL, "subjects": subjects}


def scrape_and_save(output_path: str | Path = "data/papers.json") -> dict:
    """Scrape the course and save to JSON file."""
    data = scrape_course()

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data


if __name__ == "__main__":
    import sys

    output = sys.argv[1] if len(sys.argv) > 1 else "data/papers.json"
    data = scrape_and_save(output)
    print(f"Scraped {len(data['subjects'])} subjects")
    total_papers = sum(len(s["papers"]) for s in data["subjects"])
    print(f"Total papers: {total_papers}")
    print(f"Saved to {output}")
