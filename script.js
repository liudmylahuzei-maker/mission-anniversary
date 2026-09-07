// ============================================================
// MISSION ANNIVERSARY v2.0
// Personalize the CONTENT section below. The game logic can stay.
// ============================================================

const CONFIG = {
  password: '08092024',
  husband: 'Husband',
  years: 2,
  wife: 'Wife',
};

const memories = {
  'our-first-date': {
    title: 'Our First Date',
    text: 'REPLACE THIS with your first-date story: where you went, what happened, the funniest moment, and one tiny detail only the two of you remember.',
    images: [
      'images/6822-gk-park-montana-4.jpg',
      'images/hookah-with-fume-on-dark_392895-21378.jpg',
    ],
  },
  'our-first-trip': {
    title: 'Our First Trip',
    text: 'REPLACE THIS with the story of your first trip together — destination, inside jokes, chaos, and the moment you realized this was your favorite travel partner.',
    images: [
      'images/photo_2026-09-02 17.53.51.jpeg',
    ],
  },
  'favorite-memories': {
    title: 'Favorite Memories',
    text: 'REPLACE THIS with 3–5 short memories. Keep them specific. The more absurdly personal, the better.',
    images: [
      'images/photo_2026-09-02 17.55.29.jpeg',
      'images/photo_2026-09-02 17.55.30.jpeg',
      'images/photo_2026-09-02 17.55.31.jpeg',
    ],
  },
  'future-plans': {
    title: 'Future Plans',
    text: 'REPLACE THIS with the adventures still waiting in the backlog: places to visit, things to build, foods to try, dreams to deploy.',
    images: [
      'images/MyCollages-2023-02-20T165309.983.jpg',
      'images/photo_2026-09-02 17.57.21.jpeg',
      'images/IMMIGRATION-LAWYER-HELP-768x512.jpg',
    ],
  },
};


const foods = [
  { label: 'burger', emoji: '🍔', correct: true },
  { label: 'gorgonzola', emoji: '🧀', correct: false },
  { label: 'liver', emoji: '🥩', correct: false },
  { label: 'sushi', emoji: '🍣', correct: true },
  { label: 'cola', emoji: '🥤', correct: false },
  { label: 'pepsi', emoji: '🥤', correct: true },
];


let currentScreen = 'level-start';
let apiVisited = new Set();

const screens = [...document.querySelectorAll('.screen')];
const navDots = [...document.querySelectorAll('.nav-dot')];

const missionState = { wifeDiagnosticsUnlocked: false, giftRevealed: false, deployed: false };

function goTo(id) {
  // Hard-gate the final deployment: Level 05 must be completed first.
  if (id === 'level-deployed' && !missionState.giftRevealed) {
    id = 'level-wife';
  }
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  navDots.forEach((dot) => dot.classList.toggle('active', dot.dataset.target === id));
  currentScreen = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => goTo(`level-${button.dataset.go}`));
});

navDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    // Navigation is mainly decorative; only allow already-reached screens or the start screen.
    if (dot.dataset.target === 'level-start') goTo('level-start');
  });
});

// AUTH
const passwordInput = document.getElementById('passwordInput');
const authBtn = document.getElementById('authBtn');
const authMessage = document.getElementById('authMessage');

function authenticate() {
  const value = passwordInput.value.trim();
  if (value === CONFIG.password) {
    authMessage.className = 'message success';
    authMessage.innerHTML = '✅ Authentication successful.<br /><br />Welcome back, Husband.<br />Your mission begins now.';
    authBtn.disabled = true;
    setTimeout(() => {
      buildCaptcha();
      goTo('level-captcha');
    }, 1100);
  } else {
    authMessage.className = 'message error';
    authMessage.textContent = '⛔ ACCESS DENIED. Wrong password. Husband privileges temporarily revoked. Try again. 😤';
    passwordInput.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }
    ], { duration: 280 });
  }
}

authBtn.addEventListener('click', authenticate);
passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') authenticate(); });

// CAPTCHA
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildCaptcha() {
  const grid = document.getElementById('foodGrid');
  grid.innerHTML = '';
  shuffle(foods).forEach((food) => {
    const card = document.createElement('label');
    card.className = 'food-card';
    card.innerHTML = `<input type="checkbox" data-correct="${food.correct}" /><div class="emoji">${food.emoji}</div><div class="label">${food.label}</div>`;
    const checkbox = card.querySelector('input');
    checkbox.addEventListener('change', () => card.classList.toggle('selected', checkbox.checked));
    grid.appendChild(card);
  });
}

document.getElementById('captchaBtn').addEventListener('click', () => {
  const checks = [...document.querySelectorAll('#foodGrid input')];
  const passed = checks.every((check) => check.checked === (check.dataset.correct === 'true'));
  const message = document.getElementById('captchaMessage');
  if (passed) {
    message.className = 'message success';
    message.innerHTML = '🤖 Robot check passed.<br />Husband status confirmed.';
    setTimeout(() => {
      setupPostRequest();
      goTo('level-api');
    }, 900);
  } else {
    message.className = 'message error';
    message.textContent = '🤖 CAPTCHA failed. Apparently somebody does not know his own favorite food. Try again. 😈';
  }
});

// API
function setupPostRequest() {
  const body = {
    husband: CONFIG.husband,
    wife: CONFIG.wife,
    years: CONFIG.years,
  };
  document.getElementById('postRequest').textContent = `POST /marriage/love\n\n${JSON.stringify(body, null, 2)}`;
  showMemory('our-first-date');
}

document.getElementById('runPostBtn').addEventListener('click', () => {
  const response = document.getElementById('postResponse');
  response.classList.remove('hidden');
  response.textContent = JSON.stringify({
    status: 200,
    message: 'Still madly in love',
    love: '∞',
    happiness: '∞',
    bugs: 0,
    divorce: false,
  }, null, 2);
});

function showMemory(key) {
  const item = memories[key];
  apiVisited.add(key);
  document.querySelectorAll('.endpoint').forEach((button) => button.classList.toggle('active', button.dataset.endpoint === key));
  const card = document.getElementById('memoryCard');
  const photos = item.images?.length
    ? `<div class="memory-photos">${item.images.map((src, index) => `
        <figure class="memory-photo">
          <img src="${src}" alt="${item.title} photo ${index + 1}" loading="lazy" />
          <figcaption>PHOTO_${String(index + 1).padStart(2, '0')} // MEMORY DATA</figcaption>
        </figure>`).join('')}</div>`
    : '';

  card.innerHTML = `
    <div class="memory-meta">200 OK // GET /${key}</div>
    <div class="memory-title">${item.title}</div>
    <div class="memory-text">${item.text}</div>
    ${photos}
  `;
  const continueBtn = document.getElementById('apiContinueBtn');
  continueBtn.disabled = apiVisited.size < 4;
}


document.querySelectorAll('.endpoint').forEach((button) => {
  button.addEventListener('click', () => showMemory(button.dataset.endpoint));
});

document.getElementById('apiContinueBtn').addEventListener('click', () => goTo('level-final'));

document.getElementById('wifeDiagnosticsBtn').addEventListener('click', () => {
  missionState.wifeDiagnosticsUnlocked = true;
  goTo('level-wife');
});

// WIFE SYSTEM DIAGNOSTICS
const wifeAnswers = {
  1: ['B'],
  2: ['A', 'C'],
  3: ['A', 'B', 'C'],
};
const wifePassed = new Set();

function getSelected(question) {
  return [...document.querySelectorAll(`input[name=\"q${question}\"]:checked`)]
    .map((input) => input.value)
    .sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function runWifeAssertion(question) {
  const selected = getSelected(question);
  const expected = [...wifeAnswers[question]].sort();
  const message = document.getElementById(`q${question}Message`);

  if (arraysEqual(selected, expected)) {
    wifePassed.add(question);
    message.className = 'assertion-message passed';
    message.innerHTML = '✓ ASSERTION PASSED';
  } else {
    wifePassed.delete(question);
    message.className = 'assertion-message failed';
    message.innerHTML = '✗ WRONG ANSWER<br /><span>Expected: Husband should know this. 😄</span>';
  }

  document.getElementById('wifeProgress').textContent = `${wifePassed.size} / 3 ASSERTIONS PASSED`;
  document.getElementById('giftApiBtn').disabled = wifePassed.size !== 3;
}

document.querySelectorAll('.question-btn').forEach((button) => {
  button.addEventListener('click', () => runWifeAssertion(Number(button.dataset.question)));
});

const giftApiBtn = document.getElementById('giftApiBtn');
const giftApi = document.getElementById('giftApi');
const giftResponse = document.getElementById('giftResponse');
const clueBox = document.getElementById('clueBox');
const clueText = document.getElementById('clueText');
const nextClueBtn = document.getElementById('nextClueBtn');
const finalClue = document.getElementById('finalClue');
const giftReveal = document.getElementById('giftReveal');
const continueDeployBtn = document.getElementById('continueDeployBtn');
const clues = [
  'It happens above ground.',
  "You don't need an engine.",
  'You will have to trust someone else.',
];
let clueIndex = 0;

giftApiBtn.addEventListener('click', () => {
  giftApiBtn.disabled = true;
  giftApi.classList.remove('hidden');
  setTimeout(() => {
    giftResponse.classList.remove('hidden');
    giftResponse.textContent = JSON.stringify({
      status: 200,
      gift: '???',
      type: 'experience',
      duration: '???',
      location: '???',
      fear_level: 'HIGH',
      memories_generated: '∞',
    }, null, 2);
    setTimeout(() => {
      clueBox.classList.remove('hidden');
      showClue();
    }, 850);
  }, 1300);
});

function showClue() {
  clueText.textContent = clues[clueIndex];
  nextClueBtn.textContent = clueIndex === clues.length - 1 ? 'REVEAL FINAL CLUE →' : 'NEXT CLUE →';
}

nextClueBtn.addEventListener('click', () => {
  if (clueIndex < clues.length - 1) {
    clueIndex += 1;
    showClue();
  } else {
    clueBox.classList.add('hidden');
    finalClue.classList.remove('hidden');
    setTimeout(() => {
      finalClue.classList.add('hidden');
      giftReveal.classList.remove('hidden');
      missionState.giftRevealed = true;
    }, 1800);
  }
});

continueDeployBtn.addEventListener('click', () => {
  missionState.deployed = true;
  goTo('level-deployed');
});



// FINAL DEPLOYMENT
const deployBtn = document.getElementById('deployBtn');
const finalProgress = document.getElementById('finalProgress');
const deployLog = document.getElementById('deployLog');
const finalMessage = document.getElementById('finalMessage');

// Final deployment is triggered from Level 05 after the gift reveal.
