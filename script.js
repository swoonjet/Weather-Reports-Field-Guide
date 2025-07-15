/* script.js  —  data, filtering & modal logic
================================================*/

/* ---------------------- SPECIMEN DATA -------------------------------
Add up to 40 objects. Include new tags as needed; UI builds dynamically.
*/
document.getElementById('storyModal').hidden = true;

const specimens = [
  {
    id: 1,
    title: "Iridescent Shadows",
    tags: ["mystery", "short", "sci-fi"],
    excerpt: "Colossal spires blot out the stars…",
    fullText: `Full story text placeholder 1.
    
Write or paste the complete story here.`
  },
  {
    id: 2,
    title: "The Metallic Breeze",
    tags: ["thriller", "medium", "first-person"],
    excerpt: "A faint taste of iron lingers on the wind…",
    fullText: `Full story text placeholder 2.`
  },
  {
    id: 3,
    title: "Hum of the Unknown",
    tags: ["speculative", "long", "multi-perspective"],
    excerpt: "A lilting hum slides from high to low…",
    fullText: `Full story text placeholder 3.`
  }
];

/* ---------------------- DOM REFERENCES ------------------------------*/
const gridEl   = document.getElementById('specimenGrid');
const filterEl = document.getElementById('filterForm');
const modal    = document.getElementById('storyModal');
const modalContent = modal.querySelector('.modal__content');
const titleEl  = document.getElementById('storyTitle');
const bodyEl   = document.getElementById('storyBody');
const closeBtn = modal.querySelector('.modal__close');

/* ---------------------- RENDER FILTERS ------------------------------*/
const allTags = [...new Set(specimens.flatMap(s => s.tags))].slice(0,20); // cap at 20
function renderFilters() {
  allTags.forEach(tag => {
    const id = `tag-${tag}`;
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" id="${id}" name="tag" value="${tag}"> ${tag}`;
    filterEl.appendChild(label);
  });
  filterEl.addEventListener('change', applyFilters);
}

/* ---------------------- RENDER GRID ---------------------------------*/
function renderGrid(items) {
  gridEl.innerHTML = '';
  items.forEach(specimen => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.setAttribute('aria-pressed','false');
    card.innerHTML = `
      <h3 class="card__title">${specimen.title}</h3>
      <p class="card__excerpt">${specimen.excerpt}</p>
    `;
    card.addEventListener('click', () => openModal(specimen));
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(specimen);
    });
    gridEl.appendChild(card);
  });
}

/* ---------------------- FILTERING LOGIC -----------------------------*/
function getActiveTags() {
  return [...filterEl.elements]
    .filter(el => el.checked)
    .map(el => el.value);
}
function applyFilters() {
  const active = getActiveTags();
  const filtered = active.length
      ? specimens.filter(s => active.every(t => s.tags.includes(t)))
      : specimens;
  renderGrid(filtered);
}

/* ---------------------- MODAL LOGIC --------------------------------*/
let lastFocused = null;
function openModal(specimen) {
  lastFocused = document.activeElement;
  titleEl.textContent = specimen.title;
  bodyEl.textContent  = specimen.fullText;
  modal.hidden = false;
  modalContent.focus();
  document.body.style.overflow = 'hidden'; // prevent background scroll
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal(); // click outside content
});
document.addEventListener('keydown', e => {
  if (!modal.hidden && e.key === 'Escape') closeModal();
  // rudimentary focus trap
  if (!modal.hidden && e.key === 'Tab') {
    const focusables = modal.querySelectorAll('button, [tabindex="0"]');
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey ? document.activeElement === first
                   : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }
});

/* ---------------------- INIT ---------------------------------------*/
renderFilters();
renderGrid(specimens);
