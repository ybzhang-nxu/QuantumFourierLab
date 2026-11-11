import { initQuantumField } from './assets/quantum-field.js';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const contentRegions = [...document.querySelectorAll('main, footer')];
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  contentRegions.forEach(region => { region.inert = false; });
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
  contentRegions.forEach(region => { region.inert = !isOpen; });
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next]);
      tabs[next].focus();
    }
  });
});

const filters = [...document.querySelectorAll('[data-filter]')];
const publications = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  let count = 0;
  publications.forEach(publication => {
    publication.hidden = category !== 'all' && publication.dataset.category !== category;
    if (!publication.hidden) count++;
  });
  document.querySelector('#research-count').textContent = `Showing ${count} publications${category === 'all' ? '' : ` in ${button.textContent.trim()}`}`;
}));

const canvas = document.getElementById('quantum-field');
try {
  initQuantumField(canvas);
} catch (error) {
  console.warn('Quantum field visualization could not initialize.', error);
  canvas.hidden = true;
}
