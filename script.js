/* -------------------------------------------------------
   script.js – loads specimens.json + markdown on demand
------------------------------------------------------- */

let specimens = [];
const gridEl   = document.getElementById('specimenGrid');
const filterEl = document.getElementById('filterForm');
const modal    = document.getElementById('storyModal');
const modalContent = modal.querySelector('.modal__content');
const titleEl  = document.getElementById('storyTitle');
const bodyEl   = document.getElementById('storyBody');
const closeBtn = modal.querySelector('.modal__close');

/* ---------- fetch metadata then build UI ------------ */
fetch('specimens.json')
  .then(r => r.json())
  .then(data => {
    specimens = data;
    renderFilters();
    renderGrid(specimens);
  });

/* ---------- filters -------------------------------- */
function renderFilters() {
  const tagSet = new Set(specimens.flatMap(s => s.tags));
  [...tagSet].slice(0, 20).forEach(tag => {
    const id = `tag-${tag}`;
    filterEl.insertAdjacentHTML(
      'beforeend',
      `<label><input type="checkbox" value="${tag}"> ${tag.replace(/-/g, ' ')}</label>`
    );
  });
  filterEl.addEventListener('change', applyFilters);
}
function getActiveTags() {
  return [...filterEl.elements].filter(c => c.checked).map(c => c.value);
}
function applyFilters() {
  const active = getActiveTags();
  const rows = active.length
    ? specimens.filter(s => active.every(t => s.tags.includes(t)))
    : specimens;
  renderGrid(rows);
}

/* ---------- grid + modal --------------------------- */
function renderGrid(items) {
  gridEl.innerHTML = '';
  items.forEach(s => {
    gridEl.insertAdjacentHTML(
      'beforeend',
      `<article class="card" tabindex="0" role="button">
         <h3 class="card__title">${s.title}</h3>
         <p class="card__excerpt">${s.excerpt}</p>
       </article>`
    );
    const card = gridEl.lastElementChild;
    card.addEventListener('click', () => openModal(s));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(s);
    });
  });
}
let lastFocused = null;
function openModal(specimen) {
  lastFocused = document.activeElement;
  titleEl.textContent = specimen.title;
  bodyEl.innerHTML = '<p><em>Loading…</em></p>';

  fetch(`stories/${specimen.slug}.md`)
    .then(r => r.text())
    .then(md => { bodyEl.innerHTML = marked.parse(md); });

  modal.hidden = false;
  modalContent.focus();
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (!modal.hidden && e.key === 'Escape') closeModal();
  if (!modal.hidden && e.key === 'Tab') {
    const focusables = modal.querySelectorAll('button,[tabindex="0"]');
    const [first, last] = [focusables[0], focusables[focusables.length - 1]];
    if (e.shiftKey ? document.activeElement === first
                   : document.activeElement === last) {
      e.preventDefault(); (e.shiftKey ? last : first).focus();
    }
  }
});
