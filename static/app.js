/**
 * Past Papers - Frontend Application
 */

let papersData = { subjects: [] };
let currentSubjects = []; // Current view (filtered or full)

const AD_INTERVAL_MS = 60 * 1000; // 1 minute between ads
const AD_STORAGE_KEY = 'pastpapers_last_ad';

// DOM Elements
const subjectsGrid = document.getElementById('subjects-grid');
const papersList = document.getElementById('papers-list');
const papersHeader = document.getElementById('papers-header');
const selectedSubjectEl = document.getElementById('selected-subject');
const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search');
const subjectCountEl = document.getElementById('subject-count');
const paperCountEl = document.getElementById('paper-count');

// Load data
async function loadData() {
  try {
    const res = await fetch('/api/papers');
    papersData = await res.json();
    currentSubjects = papersData.subjects;
    renderSubjects(currentSubjects);
    updateStats();
  } catch (err) {
    console.error('Failed to load papers:', err);
    subjectsGrid.innerHTML = '<p class="empty-state">Failed to load papers. Run the scraper first.</p>';
  }
}

function updateStats() {
  const totalPapers = papersData.subjects.reduce((sum, s) => sum + s.papers.length, 0);
  subjectCountEl.textContent = papersData.subjects.length;
  paperCountEl.textContent = totalPapers;
}

function renderSubjects(subjects) {
  if (!subjects || subjects.length === 0) {
    subjectsGrid.innerHTML = '<p class="empty-state">No subjects found.</p>';
    return;
  }

  subjectsGrid.innerHTML = subjects.map(subject => `
    <div class="subject-card" data-subject="${escapeSubjectName(subject.name)}">
      <div class="name">${escapeHtml(subject.name)}</div>
      <div class="count">${subject.papers.length} papers</div>
    </div>
  `).join('');

  subjectsGrid.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const subjectKey = card.dataset.subject;
      showAdModal(() => showSubject(subjectKey));
    });
  });
}

// Paper link click: show ad modal (if 1 min passed) then open link
function initPaperLinks() {
  papersList.addEventListener('click', (e) => {
    const link = e.target.closest('.paper-link');
    if (!link) return;
    e.preventDefault();
    const url = link.href || link.dataset.paperUrl;
    showAdModal(() => {
      if (url) window.open(url, '_blank', 'noopener');
    });
  });
}

function escapeSubjectName(name) {
  return encodeURIComponent(name);
}

function showSubject(subjectKey) {
  const subjectName = decodeURIComponent(subjectKey);
  const subject = currentSubjects.find(s => s.name === subjectName);
  if (!subject) return;

  selectedSubjectEl.textContent = subject.name;
  papersHeader.style.display = 'flex';
  papersList.innerHTML = '';

  subject.papers.forEach(paper => {
    const item = document.createElement('div');
    item.className = 'paper-item';
    item.innerHTML = `
      <div class="paper-info">
        <div class="paper-title">${escapeHtml(paper.title)}</div>
        <div class="paper-meta">
          ${paper.year ? `<span>${escapeHtml(paper.year)}</span>` : ''}
          ${paper.type ? `<span>${escapeHtml(paper.type)}</span>` : ''}
          ${paper.format ? `<span>${escapeHtml(paper.format)}</span>` : ''}
        </div>
      </div>
      <a href="${escapeHtml(paper.url)}" target="_blank" rel="noopener" 
         class="paper-download ${paper.format === 'PDF' ? 'pdf' : ''} paper-link"
         data-paper-url="${escapeHtml(paper.url)}">
        ${paper.format === 'PDF' ? 'View PDF' : 'View'}
      </a>
    `;
    papersList.appendChild(item);
  });

  document.getElementById('papers').scrollIntoView({ behavior: 'smooth' });
}

// Ad modal: show only if 1 min passed since last ad
function shouldShowAd() {
  try {
    const last = sessionStorage.getItem(AD_STORAGE_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) >= AD_INTERVAL_MS;
  } catch {
    return true;
  }
}

function markAdShown() {
  try {
    sessionStorage.setItem(AD_STORAGE_KEY, String(Date.now()));
  } catch {}
}

function showAdModal(onClose) {
  const modal = document.getElementById('ad-modal');
  const config = window.ADSENSE_CONFIG || {};
  const hasAdConfig = config.client && config.slotModal;
  if (!hasAdConfig || !shouldShowAd()) {
    if (onClose) onClose();
    return;
  }
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  markAdShown();
  requestAnimationFrame(() => {
    if (window.adsbygoogle) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    }
  });
  const closeModal = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (onClose) onClose();
  };
  modal.querySelector('.ad-modal-close').onclick = closeModal;
  modal.querySelector('.ad-modal-backdrop').onclick = closeModal;
  modal._closeCallback = closeModal;
}

function filterSubjects(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    currentSubjects = papersData.subjects;
    renderSubjects(currentSubjects);
    return;
  }

  const filtered = papersData.subjects
    .map(subject => {
      const matchingPapers = subject.papers.filter(p =>
        p.title.toLowerCase().includes(q) ||
        subject.name.toLowerCase().includes(q)
      );
      if (matchingPapers.length > 0) {
        return { ...subject, papers: matchingPapers };
      }
      return null;
    })
    .filter(Boolean);

  currentSubjects = filtered;
  renderSubjects(filtered);

  if (filtered.length === 1 && filtered[0].papers.length <= 10) {
    showSubject(escapeSubjectName(filtered[0].name));
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Theme toggle (dark/light mode)
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else {
    setTheme(prefersDark.matches ? 'dark' : 'light');
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();

// Event listeners
backBtn.addEventListener('click', () => {
  papersHeader.style.display = 'none';
  papersList.innerHTML = '';
  currentSubjects = papersData.subjects;
  renderSubjects(currentSubjects);
  document.getElementById('subjects').scrollIntoView({ behavior: 'smooth' });
});

searchInput.addEventListener('input', (e) => {
  filterSubjects(e.target.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    filterSubjects('');
    searchInput.blur();
  }
});

// Check URL hash for direct subject link (after data loads)
window.addEventListener('load', async () => {
  await loadData();
  initPaperLinks();
  const hash = window.location.hash.slice(1);
  if (hash) {
    const subject = papersData.subjects.find(s =>
      escapeSubjectName(s.name) === hash
    );
    if (subject) showSubject(hash);
  }
});
