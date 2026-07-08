// ---------- Lesson accordions ----------
document.querySelectorAll('[data-lesson]').forEach((lesson, i) => {
  const head = lesson.querySelector('[data-toggle]');
  head.addEventListener('click', () => {
    lesson.classList.toggle('open');
  });
  if (i === 0) lesson.classList.add('open'); // Hour 1 starts open
});

// ---------- Copy-to-clipboard for terminal blocks ----------
document.querySelectorAll('.term').forEach(block => {
  const btn = block.querySelector('.copy-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const text = block.textContent.replace('Copy', '').trim();
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1400);
    });
  });
});

// ---------- Platform tabs (iOS / Windows toggle) ----------
document.querySelectorAll('[data-platform-tabs]').forEach(group => {
  const buttons = group.querySelectorAll('.platform-tab');
  const panels = group.querySelectorAll('.platform-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
    });
  });
});

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- EN / DE toggle ----------
// German NFL fans mostly keep the English football vocabulary (Quarterback,
// Touchdown, Linebacker are just... the same words in German), so only the
// site's own UI chrome gets translated — names, positions, and blurbs stay put.
const I18N = {
  en: {
    searchPlaceholder: "Search a name, e.g. 'Kelce' or 'Hurts'...",
    chipAll: "All",
    chipLegends: "Legends",
    chipModern: "Modern Era",
    shuffle: "🏈 Surprise Me",
    empty: "No matches. Try a different search, or hit Surprise Me.",
  },
  de: {
    searchPlaceholder: "Namen suchen, z. B. 'Kelce' oder 'Hurts'...",
    chipAll: "Alle",
    chipLegends: "Legenden",
    chipModern: "Moderne Ära",
    shuffle: "🏈 Überrasche mich",
    empty: "Keine Treffer. Versuch eine andere Suche oder klick auf Überraschung.",
  },
};
let currentLang = localStorage.getItem('iggles-lang') || 'en';

function applyLangText() {
  const t = I18N[currentLang];
  searchInputEl.placeholder = t.searchPlaceholder;
  document.querySelector('[data-filter="all"]').textContent = t.chipAll;
  document.querySelector('[data-filter="legends"]').textContent = t.chipLegends;
  document.querySelector('[data-filter="modern"]').textContent = t.chipModern;
  shuffleBtnEl.textContent = t.shuffle;
  emptyMsgEl.textContent = t.empty;
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  document.documentElement.lang = currentLang === 'de' ? 'de' : 'en';
}

// ---------- Card Vault Finder ----------
const grid = document.getElementById('finderGrid');
const emptyMsgEl = document.getElementById('finderEmpty');
const searchInputEl = document.getElementById('finderSearch');
const chips = document.querySelectorAll('.chip');
const shuffleBtnEl = document.getElementById('shuffleBtn');
const langButtons = document.querySelectorAll('[data-lang]');

let activeFilter = 'all';

function cardHTML(entry) {
  const typeClass = entry.deck === 'modern' ? 'card-type modern' : 'card-type';
  return `
    <div class="card">
      <div class="card-top">
        <div>
          <span class="${typeClass}">${entry.position}</span><br/>
          <span class="card-name">${entry.name}</span>
        </div>
        <span class="card-hp">${entry.tier.toUpperCase()}</span>
      </div>
      <span class="card-sport">${entry.years}</span>
      <p class="card-blurb">${entry.blurb}</p>
    </div>`;
}

function render(list) {
  if (!list.length) {
    grid.innerHTML = '';
    emptyMsgEl.style.display = 'block';
    return;
  }
  emptyMsgEl.style.display = 'none';
  grid.innerHTML = list.map(cardHTML).join('');
}

function applyFilters() {
  const q = searchInputEl.value.trim().toLowerCase();
  let list = EAGLES_CARDS.filter(e => activeFilter === 'all' || e.deck === activeFilter);
  if (q) {
    list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.blurb.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.years.toLowerCase().includes(q)
    );
  }
  render(list);
}

searchInputEl.addEventListener('input', applyFilters);

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    applyFilters();
  });
});

shuffleBtnEl.addEventListener('click', () => {
  const pool = EAGLES_CARDS.filter(e => activeFilter === 'all' || e.deck === activeFilter);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  searchInputEl.value = '';
  render([pick]);
});

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    localStorage.setItem('iggles-lang', currentLang);
    applyLangText();
  });
});

applyLangText();
applyFilters();
