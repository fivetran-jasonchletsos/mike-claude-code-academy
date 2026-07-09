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

// ---------- Mike / Natasha persona toggle ----------
// Natasha's view leans into Ostalgie (East German design nostalgia) --
// warm mustard/teal/brick colors and the Ampelmännchen pedestrian icon,
// no state symbols -- and switches the site's own chrome into German.
// The lesson content itself stays in English, since it's Mike's coding course.
const PERSONA_TEXT = {
  'hero-eyebrow': {
    mike: "Five one-hour lessons &middot; two bonus drives &middot; zero experience required",
    natasha: "Fünf einstündige Lektionen &middot; zwei Bonusrunden &middot; keine Vorkenntnisse nötig",
  },
  'hero-h1': {
    mike: "Fly, Code, Fly",
    natasha: "Flieg, Code, Flieg",
  },
  'hero-sub': {
    mike: `You used to hand-code your MySpace page — glitter text, a busted marquee tag, the whole Top 8.
    That instinct still counts. This is a hands-on, hour-by-hour crash course built for one
    student — Eagles die-hard, card collector, Windows laptop and an iPhone always within reach —
    to learn Claude Code from scratch, build a real tool, and get your card collection selling on eBay.`,
    natasha: `Ein Gruß auf Deutsch, mit einem Augenzwinkern zur Ostalgie — Ampelmännchen, Trabi-Charme
    und eine Prise DDR-Nostalgie, für Natasha. Nebenan, auf Englisch, lernt Mike gerade das
    Programmieren mit Claude Code und baut seine Eagles-Kartensammlung zu einem eBay-Geschäft aus.`,
  },
  'hero-credit': {
    mike: "Built by Jason &amp; Claude, for Mike (auf Deutsch: willkommen, for the German side of the house too)",
    natasha: "Gebaut von Jason &amp; Claude — für Natasha. Willkommen!",
  },
  'cta-lessons': {
    mike: "Start Hour 1",
    natasha: "Zu Stunde 1",
  },
  'cta-play': {
    mike: "Play the Card Vault",
    natasha: "Kartenarchiv entdecken",
  },
  'nav-roadmap': { mike: "Roadmap", natasha: "Übersicht" },
  'nav-lessons': { mike: "Lessons", natasha: "Lektionen" },
  'nav-bonus': { mike: "Bonus", natasha: "Bonus" },
  'nav-play': { mike: "Play", natasha: "Spielen" },
  'nav-cheatsheet': { mike: "Cheat Sheet", natasha: "Spickzettel" },
  'roadmap-tag': { mike: "The Path", natasha: "Der Weg" },
  'roadmap-title': { mike: "Five hours, two bonus drives", natasha: "Fünf Stunden, zwei Bonusrunden" },
  'roadmap-desc': {
    mike: "Each hour builds on the last. Do them in order, in one sitting or spread across a week — there's no clock but your own.",
    natasha: "Jede Stunde baut auf der letzten auf. Der Reihe nach, an einem Nachmittag oder über eine Woche verteilt — es gibt keine andere Uhr als deine eigene.",
  },
  'lessons-tag': { mike: "The Lessons", natasha: "Die Lektionen" },
  'lessons-title': { mike: "Tap a card to open it", natasha: "Tippe auf eine Karte" },
  'lessons-desc': {
    mike: "Every lesson is a full hour: a goal, exact steps, real commands to type, a checkpoint, and what to do if it breaks.",
    natasha: "Jede Lektion dauert eine volle Stunde: ein Ziel, genaue Schritte, echte Befehle zum Eintippen, ein Checkpunkt — und was zu tun ist, wenn etwas schiefgeht. (Die Lektionen selbst bleiben auf Englisch — sie sind für Mikes Coding-Abenteuer.)",
  },
  'play-tag': { mike: "Play", natasha: "Spielen" },
  'play-title': { mike: "The Iggles Card Vault", natasha: "Das Iggles-Kartenarchiv" },
  'play-desc': {
    mike: "This is the finished shape of the Hour 4 project — a live deck of Eagles legends and modern-era stars. Search it, filter it, or hit shuffle. Tiers are just fun collector flavor, not real appraisals.",
    natasha: "Das ist die fertige Form des Hour-4-Projekts — ein lebendiges Kartenarchiv mit Eagles-Legenden und aktuellen Stars. Suchen, filtern, oder einfach mischen. Die Stufen sind nur zum Spaß, keine echte Bewertung.",
  },
  'cheat-tag': { mike: "Reference", natasha: "Referenz" },
  'cheat-title': { mike: "The Cheat Sheet", natasha: "Der Spickzettel" },
  'cheat-desc': {
    mike: "Keep this open in a second tab during Hours 1-5.",
    natasha: "Halt das in einem zweiten Tab offen — für wenn Mike mal wieder feststeckt.",
  },
  'footer-1': {
    mike: 'Claude Code Academy &middot; a one-time gift, not a subscription &middot; source on <a href="https://github.com/fivetran-jasonchletsos/mike-claude-code-academy" target="_blank" rel="noopener">GitHub</a>',
    natasha: 'Claude Code Academy &middot; ein einmaliges Geschenk, kein Abo &middot; Quelltext auf <a href="https://github.com/fivetran-jasonchletsos/mike-claude-code-academy" target="_blank" rel="noopener">GitHub</a>',
  },
  'footer-2': {
    mike: "Built with Claude Code, for someone learning Claude Code. Mit ein bisschen Deutsch, für zuhause.",
    natasha: "Gebaut mit Claude Code — mit ganz viel Ostalgie, für Natasha.",
  },
};

function applyPersona(persona) {
  document.documentElement.classList.toggle('theme-natasha', persona === 'natasha');
  document.querySelectorAll('[data-persona]').forEach(el => {
    const entry = PERSONA_TEXT[el.dataset.persona];
    if (entry) el.innerHTML = entry[persona];
  });
  document.querySelectorAll('[data-persona-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.personaBtn === persona);
  });
  currentLang = persona === 'natasha' ? 'de' : 'en';
  localStorage.setItem('iggles-lang', currentLang);
  applyLangText();
}

document.querySelectorAll('[data-persona-btn]').forEach(btn => {
  btn.addEventListener('click', () => applyPersona(btn.dataset.personaBtn));
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

// ---------- Checkpoint progress + easter-egg clues ----------
(function () {
  var STORAGE_KEY = 'academyProgress';
  var progress = { boxes: {}, clues: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved && typeof saved === 'object') {
      progress.boxes = saved.boxes || {};
      progress.clues = saved.clues || {};
    }
  } catch (e) { /* localStorage unavailable or corrupt -- start fresh */ }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
  }

  function revealClue(block, instant) {
    block.hidden = false;
    if (!instant) block.classList.add('clue-reveal');
  }

  document.querySelectorAll('[data-lesson]').forEach(function (lesson, lessonIdx) {
    var checkpoints = lesson.querySelectorAll('.checkpoint');
    var clueBlock = lesson.querySelector('.clue-block');

    function lessonComplete() {
      return Array.prototype.some.call(checkpoints, function (cp) {
        var boxes = cp.querySelectorAll('input[type="checkbox"]');
        return boxes.length > 0 && Array.prototype.every.call(boxes, function (b) { return b.checked; });
      });
    }

    checkpoints.forEach(function (cp, cpIdx) {
      cp.querySelectorAll('input[type="checkbox"]').forEach(function (box, boxIdx) {
        var key = lessonIdx + '-' + cpIdx + '-' + boxIdx;
        if (progress.boxes[key]) box.checked = true;
        box.addEventListener('change', function () {
          progress.boxes[key] = box.checked;
          save();
          if (clueBlock && !progress.clues[lessonIdx] && lessonComplete()) {
            progress.clues[lessonIdx] = true;
            save();
            revealClue(clueBlock);
          }
        });
      });
    });

    if (clueBlock && progress.clues[lessonIdx]) revealClue(clueBlock, true);
  });
})();
