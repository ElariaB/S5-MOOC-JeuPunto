// ── Helpers ────────────────────────────────────
function setValue(i, j, value) {
  const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
  if (cell) cell.textContent = value;
}

function getValue(i, j) {
  const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
  return cell ? (cell.textContent || null) : null;
}

function setColor(i, j, color) {
  const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
  if (cell) {
    cell.className = `cell ${color}`;
    cell.classList.add('placed');
    setTimeout(() => cell.classList.remove('placed'), 200);
  }
}

function getColor(i, j) {
  const cell = document.querySelector(`td[data-row="${i}"][data-col="${j}"]`);
  if (!cell) return null;
  const classes = cell.className.split(' ');
  return classes.find(cls => ['red', 'green', 'yellow', 'blue'].includes(cls)) || null;
}

function isEmpty(i, j) {
  return getValue(i, j) === null || getValue(i, j) === '';
}

// ── Game State ─────────────────────────────────
let currentColor = 'red';
let currentNumber;
let currentPlayer = 0;
const players = ['red', 'green', 'yellow', 'blue'];
const playerNames = { red: 'Rouge', green: 'Vert', yellow: 'Jaune', blue: 'Bleu' };
const playerEmojis = { red: '🔴', green: '🟢', yellow: '🟡', blue: '🔵' };
let isGameOver = false;

const red_list    = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const green_list  = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const yellow_list = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];
const blue_list   = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9];

function getAndRemoveRandomCard(list) {
  if (list.length === 0) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list.splice(idx, 1)[0];
}

// ── UI Updates ────────────────────────────────
function updateUI() {
  // Update active badge
  players.forEach(p => {
    const badge = document.getElementById('badge-' + p);
    if (badge) badge.classList.toggle('active', p === currentColor);
  });

  // Update current card display
  const el = document.getElementById('carteActuelle');
  if (el) {
    el.textContent = currentNumber !== null ? `${playerEmojis[currentColor]} ${playerNames[currentColor]} — carte ${currentNumber}` : '—';
    el.style.color = getColorHex(currentColor);
  }
}

function getColorHex(color) {
  const map = { red: '#ff6b6b', green: '#69db7c', yellow: '#ffd43b', blue: '#74c0fc' };
  return map[color] || '#fff';
}

function showOverlay(emoji, title, sub) {
  document.getElementById('overlay-emoji').textContent = emoji;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-sub').textContent   = sub;
  document.getElementById('overlay').classList.add('show');
}

// ── Game Logic ────────────────────────────────
function setListeners() {
  const cells = document.querySelectorAll('td');
  cells.forEach(cell => cell.addEventListener('click', () => clickedOnCell(cell)));
}

function clickedOnCell(cell) {
  if (isGameOver) return;
  const i = parseInt(cell.dataset.row);
  const j = parseInt(cell.dataset.col);

  if (isWithinLimits(i, j) && isCorrectPlacement(i, j, currentNumber)) {
    setValue(i, j, currentNumber);
    setColor(i, j, currentColor);

    if (hasWin(currentColor)) {
      isGameOver = true;
      showOverlay('🎉', `${playerNames[currentColor]} gagne !`, `Bravo au joueur ${playerNames[currentColor]} !`);
      return;
    }
    nextPlayer();
  } else {
    // Flash red briefly
    cell.style.outline = '2px solid rgba(255,80,80,0.8)';
    setTimeout(() => cell.style.outline = '', 400);
  }
}

function nextPlayer() {
  currentPlayer = (currentPlayer + 1) % players.length;
  currentColor  = players[currentPlayer];

  let list;
  switch (currentColor) {
    case 'red':    list = red_list;    break;
    case 'green':  list = green_list;  break;
    case 'yellow': list = yellow_list; break;
    case 'blue':   list = blue_list;   break;
  }

  currentNumber = getAndRemoveRandomCard(list);

  if (currentNumber === null) {
    showOverlay('🤝', 'Égalité !', 'Plus de cartes disponibles.');
    isGameOver = true;
    return;
  }

  updateUI();
}

function isCorrectAdjacency(i, j) {
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  return dirs.some(([di, dj]) => !isEmpty(i + di, j + dj));
}

function isCorrectPlacement(i, j, value) {
  if (isEmpty(i, j)) {
    const hasAny = document.querySelectorAll('td.red, td.green, td.yellow, td.blue').length > 0;
    if (!hasAny) return i === 5 && j === 5;
    return isCorrectAdjacency(i, j);
  }
  return value > parseInt(getValue(i, j));
}

function isWithinLimits(i, j) {
  if (i < 0 || i >= 11 || j < 0 || j >= 11) return false;
  let minI = 11, maxI = -1, minJ = 11, maxJ = -1;
  let hasCell = false;
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      if (!isEmpty(r, c)) {
        hasCell = true;
        minI = Math.min(minI, r); maxI = Math.max(maxI, r);
        minJ = Math.min(minJ, c); maxJ = Math.max(maxJ, c);
      }
    }
  }
  if (!hasCell) return i === 5 && j === 5;
  return (Math.max(maxI, i) - Math.min(minI, i) <= 5) &&
         (Math.max(maxJ, j) - Math.min(minJ, j) <= 5);
}

function hasWin(color) {
  // Horizontal
  for (let i = 0; i < 11; i++)
    for (let j = 0; j <= 7; j++) {
      let n = 0;
      for (let k = 0; k < 4; k++) if (getColor(i, j+k) === color) n++;
      if (n === 4) return true;
    }
  // Vertical
  for (let i = 0; i <= 7; i++)
    for (let j = 0; j < 11; j++) {
      let n = 0;
      for (let k = 0; k < 4; k++) if (getColor(i+k, j) === color) n++;
      if (n === 4) return true;
    }
  // Diagonal ↘
  for (let i = 0; i <= 7; i++)
    for (let j = 0; j <= 7; j++) {
      let n = 0;
      for (let k = 0; k < 4; k++) if (getColor(i+k, j+k) === color) n++;
      if (n === 4) return true;
    }
  // Diagonal ↙
  for (let i = 3; i < 11; i++)
    for (let j = 0; j <= 7; j++) {
      let n = 0;
      for (let k = 0; k < 4; k++) if (getColor(i-k, j+k) === color) n++;
      if (n === 4) return true;
    }
  return false;
}

// ── Init ──────────────────────────────────────
function main() {
  setListeners();
  // First card for red
  currentColor  = 'red';
  currentPlayer = 0;
  currentNumber = getAndRemoveRandomCard(red_list);
  updateUI();
}

document.addEventListener('DOMContentLoaded', main);
