(() => {
  const canvas = document.querySelector('#game-canvas');
  const startScreen = document.querySelector('#start-screen');
  const overlayCard = startScreen?.querySelector('.overlay-card');

  if (!canvas || !startScreen || !overlayCard) return;

  const ctx = canvas.getContext('2d');
  const eraLabel = document.querySelector('#era-label');
  const inventionCount = document.querySelector('#invention-count');
  const livesLabel = document.querySelector('#lives');
  const modeLabel = document.querySelector('#mode-label');
  const runTimeLabel = document.querySelector('#run-time');
  const musicToggle = document.querySelector('#music-toggle');
  const musicIcon = document.querySelector('#music-icon');
  const musicStatus = document.querySelector('#music-status');
  const musicTrackName = document.querySelector('#music-track-name');
  const musicVolume = document.querySelector('#music-volume');
  const eraToast = document.querySelector('#era-toast');
  const eraNumber = document.querySelector('#era-number');
  const eraTitle = document.querySelector('#era-title');
  const eraYears = document.querySelector('#era-years');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const STAGE_WIDTH = 5200;
  const GROUND_Y = 500;
  const GRAVITY = 1900;
  const MAIN_STAGE_COUNT = 4;
  const TOTAL_ITEMS = 12;
  const PORTAL = { x: 5035, y: 326, w: 105, h: 174 };
  const keys = { left: false, right: false, jump: false };
  const DEV_STAGE_SHORTCUTS = {
    KeyJ: 0,
    KeyK: 1,
    KeyL: 2,
    KeyM: 3,
    KeyN: 4,
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3,
    Digit5: 4,
    Numpad1: 0,
    Numpad2: 1,
    Numpad3: 2,
    Numpad4: 3,
    Numpad5: 4
  };
  const MUSIC_TRACKS = [
    'audios/fase-1-day.mp3',
    'audios/fase-2-pool.mp3',
    'audios/fase-3-night.mp3',
    'audios/fase-4-cerebrawl.mp3',
    'audios/fase-5-loonboon.mp3'
  ];
  const MENU_TRACK = 'audios/menu-main.mp3';
  const MUSIC_TRACK_NAMES = {
    [MENU_TRACK]: 'MAIN MENU',
    [MUSIC_TRACKS[0]]: 'DAY STAGE',
    [MUSIC_TRACKS[1]]: 'POOL STAGE',
    [MUSIC_TRACKS[2]]: 'NIGHT STAGE',
    [MUSIC_TRACKS[3]]: 'CEREBRAWL',
    [MUSIC_TRACKS[4]]: 'LOONBOON'
  };
  const soundtrack = new Audio();
  soundtrack.loop = true;
  soundtrack.preload = 'auto';
  soundtrack.volume = 0.42;
  const DIFFICULTIES = {
    normal: {
      label: 'NORMAL',
      lives: 3,
      enemySpeed: 1,
      obstacleSpeed: 1,
      description: 'A experiência original, com três vidas e dificuldade equilibrada.'
    },
    hardcore: {
      label: 'HARDCORE',
      lives: 1,
      enemySpeed: 1.4,
      obstacleSpeed: 1.3,
      description: 'Uma única vida, inimigos 40% mais rápidos e obstáculos móveis 30% mais velozes.'
    }
  };

  const richardSprite = new Image();
  richardSprite.src = 'fotos/richard-estados-v4.png';
  const SPRITE_FRAME_COUNT = 6;
  let spriteFrames = [];

  const richardRunSprite = new Image();
  richardRunSprite.src = 'fotos/richard-corrida-v4.png';
  let runFrames = [];

  const richardEmoteSprite = new Image();
  richardEmoteSprite.src = 'fotos/richard-emotes.png?v=2';
  let emoteFrames = [];

  const richardTPoseSprite = new Image();
  richardTPoseSprite.src = 'fotos/richard-tpose.png';
  let tPoseFrames = [];

  const RUN_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7];
  const IDLE_SEQUENCE = [0, 1, 2, 3, 2, 1];
  const EMOTE_FRAME_BY_KEY = {
    Digit1: 0,
    Numpad1: 0,
    Digit2: 1,
    Numpad2: 1,
    Digit3: 2,
    Numpad3: 2,
    Digit4: 3,
    Numpad4: 3
  };
  const ENEMY_PROFILES = {
    boar: { w: 58, h: 38, hover: 0 },
    'iron-guard': { w: 48, h: 58, hover: 0 },
    'steam-bot': { w: 54, h: 54, hover: 0 },
    drone: { w: 62, h: 32, hover: 58 }
  };

  const stages = [
    {
      name: 'ÉPOCA DA PEDRA',
      years: 'PRÉ-HISTÓRIA',
      difficulty: 0.85,
      skyTop: '#3b2742',
      skyBottom: '#d17454',
      ground: '#4b302b',
      accent: '#f5bb65',
      enemyKind: 'boar',
      platforms: [
        [330, 420, 180, 24], [640, 345, 170, 24], [1030, 405, 210, 24],
        [1340, 325, 180, 24], [1710, 410, 220, 24], [2010, 345, 175, 24],
        [2390, 285, 185, 24], [2700, 400, 220, 24], [3060, 330, 180, 24],
        [3420, 405, 200, 24], [3760, 300, 180, 24], [4110, 390, 230, 24],
        [4500, 325, 180, 24], [4770, 410, 170, 24]
      ],
      pits: [[850, 175], [2210, 195], [3630, 185]],
      obstacles: [
        ['spikes', 570, 76, 28], ['boulder', 1180, 58, 58, 1060, 1290, 82],
        ['fire', 1600, 62, 44], ['spikes', 2920, 92, 28],
        ['boulder', 3980, 58, 58, 3860, 4250, 96], ['fire', 4680, 62, 44]
      ],
      enemies: [
        [520, 470, 760, 72], [1120, 1030, 1300, 78], [1540, 1430, 1690, 82],
        [1950, 1830, 2150, 86], [2660, 2530, 2870, 90], [3280, 3150, 3490, 94],
        [4050, 3900, 4320, 98], [4680, 4520, 4900, 102]
      ],
      items: [
        [390, 360, 'PEDRA', 'stone'],
        [2445, 225, 'FOGO', 'fire'],
        [4570, 265, 'RODA', 'wheel']
      ]
    },
    {
      name: 'ÉPOCA DO FERRO',
      years: '1.200 a.C. – 500 d.C.',
      difficulty: 1,
      skyTop: '#3a2730',
      skyBottom: '#a65e43',
      ground: '#403331',
      accent: '#d9a35f',
      enemyKind: 'iron-guard',
      platforms: [
        [300, 405, 190, 24], [610, 330, 180, 24], [980, 400, 210, 24],
        [1310, 305, 185, 24], [1680, 405, 210, 24], [2020, 335, 180, 24],
        [2380, 395, 210, 24], [2730, 305, 180, 24], [3100, 390, 210, 24],
        [3460, 320, 190, 24], [3830, 405, 220, 24], [4180, 300, 180, 24],
        [4520, 390, 200, 24], [4780, 315, 170, 24]
      ],
      pits: [[810, 170], [2230, 180], [3690, 180]],
      obstacles: [
        ['fire', 530, 64, 46], ['spikes', 1210, 84, 28],
        ['hammer', 1860, 52, 82, 1790, 2000, 72], ['fire', 2610, 64, 46],
        ['spikes', 3330, 94, 28], ['hammer', 4320, 52, 82, 4250, 4470, 82]
      ],
      enemies: [
        [510, 450, 760, 78], [1050, 980, 1260, 84], [1540, 1430, 1680, 88],
        [2130, 2010, 2210, 92], [2850, 2730, 3040, 96], [3520, 3400, 3660, 100],
        [4090, 3920, 4230, 104], [4700, 4520, 4920, 108]
      ],
      items: [
        [365, 345, 'FERRO', 'iron'],
        [2780, 245, 'FORJA', 'forge'],
        [4580, 330, 'ESPADA', 'sword']
      ]
    },
    {
      name: 'REVOLUÇÃO INDUSTRIAL',
      years: 'SÉCULOS XVIII–XIX',
      difficulty: 1.2,
      skyTop: '#263849',
      skyBottom: '#71807f',
      ground: '#30383a',
      accent: '#e2a85a',
      enemyKind: 'steam-bot',
      platforms: [
        [300, 400, 190, 24], [620, 325, 180, 24], [990, 390, 210, 24],
        [1330, 305, 185, 24], [1690, 400, 220, 24], [2040, 330, 180, 24],
        [2410, 405, 210, 24], [2780, 315, 180, 24], [3150, 390, 220, 24],
        [3510, 300, 190, 24], [3880, 400, 220, 24], [4250, 320, 180, 24],
        [4580, 390, 200, 24], [4830, 310, 150, 24]
      ],
      pits: [[830, 170], [2250, 190], [3720, 190]],
      obstacles: [
        ['gear', 540, 56, 56, 500, 760, 96], ['steam', 1230, 52, 92],
        ['gear', 1940, 56, 56, 1900, 2180, 108], ['steam', 2670, 52, 92],
        ['gear', 3380, 56, 56, 3330, 3630, 116], ['steam', 4470, 52, 92]
      ],
      enemies: [
        [510, 450, 780, 80], [1060, 990, 1280, 86], [1560, 1440, 1680, 90],
        [2140, 2020, 2220, 94], [2860, 2730, 3060, 98], [3540, 3410, 3690, 102],
        [4120, 3950, 4250, 106], [4750, 4560, 4940, 110],
        [1390, 1340, 1470, 100, 305], [2835, 2790, 2920, 112, 315],
        [4310, 4260, 4400, 118, 320]
      ],
      items: [
        [365, 340, 'VAPOR', 'steam'],
        [2830, 255, 'LÂMPADA', 'bulb'],
        [4620, 330, 'TELÉGRAFO', 'telegraph']
      ]
    },
    {
      name: 'ATUALIDADE',
      years: 'SÉCULOS XX–XXI',
      difficulty: 1.4,
      skyTop: '#15183b',
      skyBottom: '#39448c',
      ground: '#202548',
      accent: '#6df3da',
      enemyKind: 'drone',
      platforms: [
        [310, 410, 185, 24], [630, 335, 180, 24], [1010, 395, 210, 24],
        [1360, 315, 180, 24], [1720, 405, 220, 24], [2070, 325, 180, 24],
        [2440, 390, 210, 24], [2810, 305, 180, 24], [3180, 395, 220, 24],
        [3550, 315, 190, 24], [3920, 400, 220, 24], [4280, 300, 180, 24],
        [4620, 390, 200, 24], [4860, 320, 140, 24]
      ],
      pits: [[850, 170], [2280, 190], [3750, 185]],
      obstacles: [
        ['laser', 540, 24, 105], ['electric', 1250, 62, 50],
        ['laser', 1970, 24, 118], ['electric', 2710, 62, 50],
        ['laser', 3450, 24, 125], ['electric', 4510, 62, 50]
      ],
      enemies: [
        [510, 450, 790, 92], [1070, 1000, 1300, 98], [1580, 1460, 1710, 104],
        [2180, 2050, 2250, 110], [2900, 2770, 3100, 116], [3580, 3450, 3720, 122],
        [4160, 3990, 4300, 126], [4780, 4580, 4960, 132],
        [685, 640, 760, 120, 335], [2490, 2450, 2580, 138, 390],
        [4330, 4290, 4430, 150, 300]
      ],
      items: [
        [375, 350, 'COMPUTADOR', 'computer'],
        [2860, 245, 'INTERNET', 'internet'],
        [4640, 330, 'IA', 'ai']
      ]
    },
    {
      name: 'ARENA DO FUTURO',
      years: 'CONFRONTO FINAL • EM BREVE',
      difficulty: 1.6,
      skyTop: '#090b1f',
      skyBottom: '#30214e',
      ground: '#17192e',
      accent: '#ff5370',
      enemyKind: 'drone',
      boss: true,
      platforms: [
        [390, 405, 210, 24], [780, 335, 190, 24], [1190, 405, 210, 24],
        [1600, 325, 190, 24], [2010, 405, 210, 24], [2420, 345, 190, 24],
        [2830, 405, 210, 24], [3240, 325, 190, 24], [3650, 405, 210, 24],
        [4060, 345, 190, 24], [4470, 405, 210, 24]
      ],
      pits: [[1020, 150], [2670, 140], [3900, 140]],
      obstacles: [['laser', 1450, 24, 120], ['electric', 2250, 62, 50], ['laser', 3490, 24, 130]],
      enemies: [],
      items: []
    }
  ];

  let platforms = [];
  let pits = [];
  let obstacles = [];
  let enemies = [];
  let collectibles = [];
  let player;
  let cameraX = 0;
  let renderCameraX = 0;
  let stageIndex = 0;
  let stageCollected = 0;
  let totalCollected = 0;
  let lives = 3;
  let selectedDifficulty = 'normal';
  let musicEnabled = true;
  let audioUnlocked = false;
  let currentTrack = '';
  let running = false;
  let lastTime = 0;
  let runStartedAt = 0;
  let runElapsed = 0;
  let eraToastTimer = 0;
  let portalPromptCooldown = 0;
  let transitioning = false;
  let transitionTimer = 0;

  function makePlayer() {
    return {
      x: 90,
      y: GROUND_Y - 72,
      w: 46,
      h: 72,
      vx: 0,
      vy: 0,
      grounded: true,
      facing: 1,
      invulnerable: 0,
      hurtPose: 0,
      checkpoint: 90,
      checkpointReached: false,
      step: 0,
      emoteFrame: null,
      emoteTimer: 0
    };
  }

  function loadStage(index) {
    const stage = stages[index];
    const stageDifficulty = stage.difficulty || 1;
    platforms = stage.platforms.map(([x, y, w, h]) => ({ x, y, w, h }));
    pits = (stage.pits || []).map(([x, w]) => ({ x, w }));
    obstacles = (stage.obstacles || []).map(([type, x, w, h, min = x, max = x, speed = 0], obstacleIndex) => ({
      type,
      x,
      w,
      h,
      min,
      max,
      speed: speed * DIFFICULTIES[selectedDifficulty].obstacleSpeed * stageDifficulty,
      direction: obstacleIndex % 2 ? -1 : 1,
      phase: obstacleIndex * 0.9,
      y: GROUND_Y - h
    }));
    enemies = stage.enemies.map(([x, min, max, speed, surfaceY = GROUND_Y], enemyIndex) => {
      const profile = ENEMY_PROFILES[stage.enemyKind];
      const baseY = surfaceY - profile.h - profile.hover;
      return {
        x,
        min,
        max,
        speed: speed * DIFFICULTIES[selectedDifficulty].enemySpeed * stageDifficulty,
        kind: stage.enemyKind,
        w: profile.w,
        h: profile.h,
        y: baseY,
        baseY,
        phase: enemyIndex * 0.8,
        alive: true,
        direction: enemyIndex % 2 ? -1 : 1
      };
    });
    collectibles = stage.items.map(([x, y, label, icon], itemIndex) => ({
      x,
      y,
      label,
      icon,
      itemIndex,
      w: 36,
      h: 36,
      taken: false,
      phase: itemIndex * 1.7
    }));
    player = makePlayer();
    cameraX = 0;
    stageCollected = 0;
    portalPromptCooldown = 0;
    updateHud();
  }

  function updateMusicControl() {
    if (!musicToggle || !musicIcon || !musicStatus) return;
    musicToggle.classList.toggle('is-muted', !musicEnabled);
    musicToggle.setAttribute('aria-pressed', String(musicEnabled));
    musicToggle.setAttribute('aria-label', musicEnabled ? 'Desativar música' : 'Ativar música');
    musicIcon.textContent = musicEnabled ? '♪' : '×';
    musicStatus.textContent = musicEnabled ? 'MÚSICA LIGADA' : 'MÚSICA DESLIGADA';
  }

  function playMusic(track) {
    currentTrack = track;
    if (musicTrackName) musicTrackName.textContent = MUSIC_TRACK_NAMES[track] || 'TRILHA SONORA';
    if (!audioUnlocked || !musicEnabled || !track) return;
    if (soundtrack.dataset.track !== track) {
      soundtrack.dataset.track = track;
      soundtrack.src = track;
      soundtrack.load();
    }
    const playback = soundtrack.play();
    if (playback) playback.catch(() => {});
  }

  function playStageMusic() {
    playMusic(MUSIC_TRACKS[stageIndex]);
  }

  function toggleMusic() {
    audioUnlocked = true;
    musicEnabled = !musicEnabled;
    if (musicEnabled) playMusic(currentTrack || (running ? MUSIC_TRACKS[stageIndex] : MENU_TRACK));
    else soundtrack.pause();
    updateMusicControl();
  }

  function resetGame() {
    stageIndex = 0;
    totalCollected = 0;
    lives = DIFFICULTIES[selectedDifficulty].lives;
    transitioning = false;
    transitionTimer = 0;
    runStartedAt = 0;
    runElapsed = 0;
    updateTimerDisplay();
    loadStage(0);
  }

  function startGame() {
    resetGame();
    startScreen.classList.add('is-hidden');
    running = true;
    lastTime = performance.now();
    runStartedAt = lastTime;
    canvas.focus({ preventScroll: true });
    playStageMusic();
    showStage();
    requestAnimationFrame(loop);
  }

  function renderTitleScreen() {
    running = false;
    if (audioUnlocked) playMusic(MENU_TRACK);
    startScreen.classList.remove('is-hidden');
    overlayCard.className = 'overlay-card overlay-card--title';
    overlayCard.innerHTML = `
      <span class="overlay-icon" aria-hidden="true">⚙</span>
      <p class="overlay-kicker">UMA AVENTURA ATRAVÉS DO TEMPO</p>
      <h2>Jornada da Evolução</h2>
      <p>Viaje com Richard Spanhol pelas eras da tecnologia e recupere as invenções perdidas.</p>
      <button class="primary-button title-play-button" id="open-menu" type="button">JOGAR <span aria-hidden="true">→</span></button>`;
    overlayCard.querySelector('#open-menu').addEventListener('click', () => {
      audioUnlocked = true;
      renderMenu();
    }, { once: true });
  }

  function renderMenu() {
    playMusic(MENU_TRACK);
    const difficulty = DIFFICULTIES[selectedDifficulty];
    overlayCard.className = 'overlay-card overlay-card--menu';
    overlayCard.innerHTML = `
      <span class="overlay-icon" aria-hidden="true">⚙</span>
      <p class="overlay-kicker">A HISTÓRIA PRECISA DE VOCÊ</p>
      <h2>Jornada da Evolução</h2>
      <p class="menu-summary">Atravesse quatro eras, recupere as doze invenções e alcance o confronto final.</p>
      <div class="menu-instructions" aria-label="Instruções básicas">
        <span><kbd>A</kbd><kbd>D</kbd> ou <kbd>←</kbd><kbd>→</kbd> para mover</span>
        <span><kbd>W</kbd> ou <kbd>ESPAÇO</kbd> para pular</span>
        <span>Pule sobre os inimigos e colete todas as invenções</span>
      </div>
      <div class="mode-selector" aria-label="Escolha a dificuldade">
        <button class="mode-option${selectedDifficulty === 'normal' ? ' is-selected' : ''}" type="button" data-difficulty="normal" aria-pressed="${selectedDifficulty === 'normal'}">
          <span class="mode-option__title">NORMAL</span>
          <span>3 vidas • desafio original</span>
        </button>
        <button class="mode-option mode-option--hardcore${selectedDifficulty === 'hardcore' ? ' is-selected' : ''}" type="button" data-difficulty="hardcore" aria-pressed="${selectedDifficulty === 'hardcore'}">
          <span class="mode-option__title">HARDCORE</span>
          <span>1 vida • perigos mais rápidos</span>
        </button>
      </div>
      <p class="mode-description" id="mode-description">${difficulty.description}</p>
      <div class="menu-actions">
        <button class="primary-button" id="start-button" type="button">INICIAR JORNADA <span aria-hidden="true">→</span></button>
        <button class="secondary-button" id="back-to-title" type="button">VOLTAR</button>
      </div>`;

    const description = overlayCard.querySelector('#mode-description');
    const modeButtons = overlayCard.querySelectorAll('[data-difficulty]');
    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedDifficulty = button.dataset.difficulty;
        lives = DIFFICULTIES[selectedDifficulty].lives;
        updateHud();
        modeButtons.forEach(option => {
          const selected = option.dataset.difficulty === selectedDifficulty;
          option.classList.toggle('is-selected', selected);
          option.setAttribute('aria-pressed', String(selected));
        });
        description.textContent = DIFFICULTIES[selectedDifficulty].description;
      });
    });
    overlayCard.querySelector('#start-button').addEventListener('click', startGame, { once: true });
    overlayCard.querySelector('#back-to-title').addEventListener('click', renderTitleScreen, { once: true });
  }

  function showToast(kicker, title, subtitle, duration = 2200) {
    eraNumber.textContent = kicker;
    eraTitle.textContent = title;
    eraYears.textContent = subtitle;
    eraToast.classList.add('is-visible');
    window.clearTimeout(eraToastTimer);
    eraToastTimer = window.setTimeout(() => eraToast.classList.remove('is-visible'), duration);
  }

  function showStage() {
    const stage = stages[stageIndex];
    eraLabel.textContent = stage.boss ? `FINAL • ${stage.name}` : `${stageIndex + 1}/${MAIN_STAGE_COUNT} • ${stage.name}`;
    const subtitle = selectedDifficulty === 'hardcore' ? `HARDCORE • ${stage.years}` : stage.years;
    showToast(stage.boss ? 'DESFECHO FINAL' : `FASE ${stageIndex + 1}`, stage.name, subtitle);
  }

  function updateHud() {
    inventionCount.textContent = String(totalCollected);
    const maximumLives = DIFFICULTIES[selectedDifficulty].lives;
    livesLabel.innerHTML = Array.from({ length: maximumLives }, (_, heartIndex) =>
      `<span class="heart${heartIndex < lives ? '' : ' heart--empty'}" aria-hidden="true">♥</span>`
    ).join('');
    livesLabel.setAttribute('aria-label', `${lives} de ${maximumLives} ${maximumLives === 1 ? 'coração' : 'corações'}`);
    modeLabel.textContent = DIFFICULTIES[selectedDifficulty].label;
    modeLabel.classList.toggle('is-hardcore', selectedDifficulty === 'hardcore');
    const stage = stages[stageIndex];
    if (stage) eraLabel.textContent = stage.boss ? `FINAL • ${stage.name}` : `${stageIndex + 1}/${MAIN_STAGE_COUNT} • ${stage.name}`;
  }

  function formatRunTime(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    if (runTimeLabel) runTimeLabel.textContent = formatRunTime(runElapsed);
  }

  function getRunRating(seconds) {
    if (seconds <= 120) return 3;
    if (seconds <= 240) return 2;
    return 1;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function isOverPit(x, width = 1) {
    return pits.some(pit => x + width > pit.x && x < pit.x + pit.w);
  }

  function hurtPlayer() {
    if (player.invulnerable > 0 || transitioning) return;
    cancelEmote();
    lives -= 1;
    updateHud();

    if (lives <= 0) {
      endGame(false);
      return;
    }

    player.x = player.checkpoint;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = -420;
    player.invulnerable = 1.5;
    player.hurtPose = 0.55;
  }

  function enterPortal() {
    if (transitioning) return;
    const stage = stages[stageIndex];
    if (stage.boss) return;
    const requiredItems = stage.items.length;
    if (stageCollected < requiredItems) {
      if (portalPromptCooldown <= 0) {
        const remaining = requiredItems - stageCollected;
        showToast('PORTAL BLOQUEADO', 'AINDA FALTAM INVENÇÕES', `COLETE MAIS ${remaining}`, 1800);
        portalPromptCooldown = 2;
      }
      return;
    }

    transitioning = true;
    transitionTimer = 0;
    cancelEmote();
    player.vx = 0;
    showToast('PORTAL ATIVADO', stageIndex === MAIN_STAGE_COUNT - 1 ? 'DESTINO: ARENA FINAL' : 'VIAJANDO NO TEMPO', 'PREPARE-SE');
  }

  function finishPortalTransition() {
    if (stageIndex >= MAIN_STAGE_COUNT) return;

    stageIndex += 1;
    loadStage(stageIndex);
    transitioning = false;
    transitionTimer = 0;
    playStageMusic();
    showStage();
  }

  function devTeleportToStage(index) {
    if (!running || index < 0 || index >= stages.length) return;
    transitioning = false;
    transitionTimer = 0;
    stageIndex = index;
    totalCollected = stages
      .slice(0, Math.min(index, MAIN_STAGE_COUNT))
      .reduce((total, stage) => total + stage.items.length, 0);
    Object.keys(keys).forEach(key => { keys[key] = false; });
    loadStage(stageIndex);
    playStageMusic();
    showToast('ATALHO DE DESENVOLVIMENTO', stages[stageIndex].name, index < MAIN_STAGE_COUNT ? `FASE ${index + 1}` : 'CONFRONTO FINAL');
  }

  function endGame(won) {
    running = false;
    playMusic(MENU_TRACK);
    overlayCard.className = 'overlay-card overlay-card--result';
    const finalTime = formatRunTime(runElapsed);
    const rating = getRunRating(runElapsed);
    const stars = Array.from({ length: 3 }, (_, index) =>
      `<span class="run-star${index < rating ? ' is-earned' : ''}" aria-hidden="true">★</span>`
    ).join('');
    overlayCard.innerHTML = won
      ? `<span class="overlay-icon" aria-hidden="true">★</span>
         <p class="overlay-kicker">LINHA DO TEMPO RESTAURADA</p>
         <h2>Você levou Richard até o futuro!</h2>
         <p>As ${totalCollected} invenções foram recuperadas e os quatro portais foram atravessados. A curiosidade continua movendo a história.</p>
         <div class="run-result" aria-label="Classificação: ${rating} de 3 estrelas. Tempo final: ${finalTime}">
           <div class="run-stars">${stars}</div>
           <p class="run-time-result">TEMPO FINAL <strong>${finalTime}</strong></p>
           <small class="run-rating-note">3 estrelas até 02:00 • 2 até 04:00 • 1 acima de 04:00</small>
         </div>
         <div class="end-actions"><button class="primary-button" id="play-again" type="button">JOGAR NOVAMENTE <span aria-hidden="true">↻</span></button><button class="secondary-button" id="back-to-menu" type="button">VOLTAR AO MENU</button></div>`
      : `<span class="overlay-icon" aria-hidden="true">!</span>
         <p class="overlay-kicker">A JORNADA FOI INTERROMPIDA</p>
         <h2>Tente novamente</h2>
         <p>Observe o movimento dos inimigos e ajude Richard a recuperar as invenções para avançar pelas fases.</p>
         <div class="end-actions"><button class="primary-button" id="play-again" type="button">RECOMEÇAR <span aria-hidden="true">↻</span></button><button class="secondary-button" id="back-to-menu" type="button">VOLTAR AO MENU</button></div>`;
    startScreen.classList.remove('is-hidden');
    overlayCard.querySelector('#play-again').addEventListener('click', startGame, { once: true });
    overlayCard.querySelector('#back-to-menu').addEventListener('click', () => {
      resetGame();
      renderMenu();
      draw();
    }, { once: true });
  }

  function cancelEmote() {
    if (!player) return;
    player.emoteFrame = null;
    player.emoteTimer = 0;
  }

  function startEmote(frame) {
    if (!running || transitioning || !player?.grounded || player.hurtPose > 0) return;
    player.emoteFrame = frame;
    player.emoteTimer = 3;
    player.vx = 0;
  }

  function update(dt) {
    if (transitioning) {
      transitionTimer += dt;
      if (transitionTimer >= 0.85) finishPortalTransition();
      return;
    }

    const acceleration = player.grounded ? 1350 : 850;
    const maxSpeed = 320;

    if (keys.left || keys.right || keys.jump) cancelEmote();
    if (player.emoteTimer > 0) {
      player.emoteTimer -= dt;
      if (player.emoteTimer <= 0) cancelEmote();
    }

    if (keys.left) {
      player.vx = Math.max(player.vx - acceleration * dt, -maxSpeed);
      player.facing = -1;
    } else if (keys.right) {
      player.vx = Math.min(player.vx + acceleration * dt, maxSpeed);
      player.facing = 1;
    } else {
      player.vx *= Math.exp(-(player.grounded ? 12 : 2.2) * dt);
      if (Math.abs(player.vx) < 2) player.vx = 0;
    }

    if (keys.jump && player.grounded) {
      player.vy = -690;
      player.grounded = false;
    }
    keys.jump = false;

    const previousBottom = player.y + player.h;
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = Math.max(0, Math.min(STAGE_WIDTH - player.w, player.x));
    player.grounded = false;

    const feetWidth = Math.max(12, player.w - 20);
    const feetX = player.x + (player.w - feetWidth) / 2;
    if (player.y + player.h >= GROUND_Y && !isOverPit(feetX, feetWidth)) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    for (const platform of platforms) {
      const isFallingOnto = player.vy >= 0 && previousBottom <= platform.y + 5;
      if (isFallingOnto && rectsOverlap(player, platform)) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }

    if (player.y > HEIGHT + 80) {
      hurtPlayer();
      return;
    }

    if (!player.checkpointReached && player.x > 2600) {
      player.checkpoint = 2630;
      player.checkpointReached = true;
      showToast('CHECKPOINT', 'PROGRESSO SALVO', `FASE ${stageIndex + 1}`);
    }

    if (player.invulnerable > 0) player.invulnerable -= dt;
    if (player.hurtPose > 0) player.hurtPose -= dt;
    if (portalPromptCooldown > 0) portalPromptCooldown -= dt;
    if (player.grounded && (keys.left || keys.right) && Math.abs(player.vx) > 18) {
      player.step += Math.abs(player.vx) * dt;
    } else if (player.grounded) {
      player.step = 0;
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.phase += dt * 4;
      enemy.x += enemy.speed * enemy.direction * dt;
      if (enemy.x <= enemy.min || enemy.x >= enemy.max) enemy.direction *= -1;
      enemy.y = enemy.kind === 'drone' ? enemy.baseY + Math.sin(enemy.phase) * 7 : enemy.baseY;

      if (rectsOverlap(player, enemy)) {
        const playerWasAbove = previousBottom <= enemy.y + 16 && player.vy > 0;
        if (playerWasAbove) {
          enemy.alive = false;
          player.vy = -430;
        } else {
          hurtPlayer();
        }
      }
    }

    for (const obstacle of obstacles) {
      obstacle.phase += dt * 4;
      if (obstacle.speed > 0) {
        obstacle.x += obstacle.speed * obstacle.direction * dt;
        if (obstacle.x <= obstacle.min || obstacle.x >= obstacle.max) {
          obstacle.x = Math.max(obstacle.min, Math.min(obstacle.max, obstacle.x));
          obstacle.direction *= -1;
        }
      }
      const pulseY = obstacle.type === 'electric' ? Math.sin(obstacle.phase) * 5 : 0;
      const hitBox = { x: obstacle.x + 5, y: obstacle.y + pulseY + 5, w: obstacle.w - 10, h: obstacle.h - 5 };
      if (rectsOverlap(player, hitBox)) hurtPlayer();
    }

    for (const item of collectibles) {
      item.phase += dt * 3;
      const hitBox = { x: item.x, y: item.y + Math.sin(item.phase) * 7, w: item.w, h: item.h };
      if (!item.taken && rectsOverlap(player, hitBox)) {
        item.taken = true;
        stageCollected += 1;
        totalCollected += 1;
        updateHud();
        if (stageCollected === stages[stageIndex].items.length) showToast('PORTAL LIBERADO', 'TODAS AS INVENÇÕES RECUPERADAS', 'SIGA ATÉ O FIM DA FASE');
      }
    }

    if (!stages[stageIndex].boss && rectsOverlap(player, PORTAL)) enterPortal();
    if (stages[stageIndex].boss && player.x > 4780) endGame(true);

    const cameraTarget = player.x - WIDTH * 0.36;
    cameraX += (Math.max(0, Math.min(STAGE_WIDTH - WIDTH, cameraTarget)) - cameraX) * Math.min(1, dt * 5);
  }

  function drawRoundedRect(x, y, w, h, radius, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function findLargestOpaqueComponent(pixels, sheetWidth, startX, endX, height) {
    const width = endX - startX;
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let largest = null;

    const isOpaque = index => {
      const x = startX + (index % width);
      const y = Math.floor(index / width);
      return pixels[(y * sheetWidth + x) * 4 + 3] > 16;
    };

    for (let index = 0; index < visited.length; index += 1) {
      if (visited[index] || !isOpaque(index)) continue;
      let head = 0;
      let tail = 0;
      let count = 0;
      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      queue[tail++] = index;
      visited[index] = 1;

      while (head < tail) {
        const current = queue[head++];
        const x = current % width;
        const y = Math.floor(current / width);
        count += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        const neighbors = [current - 1, current + 1, current - width, current + width];
        for (const next of neighbors) {
          if (next < 0 || next >= visited.length || visited[next]) continue;
          const nextX = next % width;
          if ((next === current - 1 || next === current + 1) && Math.abs(nextX - x) !== 1) continue;
          if (!isOpaque(next)) continue;
          visited[next] = 1;
          queue[tail++] = next;
        }
      }

      if (!largest || count > largest.count) largest = { count, minX, minY, maxX, maxY };
    }

    if (!largest) return null;
    return {
      sx: startX + largest.minX,
      sy: largest.minY,
      sw: largest.maxX - largest.minX + 1,
      sh: largest.maxY - largest.minY + 1
    };
  }

  function analyzeSpriteSheet(image, frameCount, keepLargestComponent = false) {
    const sheet = document.createElement('canvas');
    sheet.width = image.naturalWidth;
    sheet.height = image.naturalHeight;
    const sheetContext = sheet.getContext('2d', { willReadFrequently: true });
    sheetContext.drawImage(image, 0, 0);
    const pixels = sheetContext.getImageData(0, 0, sheet.width, sheet.height).data;
    const cellWidth = sheet.width / frameCount;

    return Array.from({ length: frameCount }, (_, frameIndex) => {
      const startX = Math.floor(frameIndex * cellWidth);
      const endX = Math.floor((frameIndex + 1) * cellWidth);
      if (keepLargestComponent) {
        const component = findLargestOpaqueComponent(pixels, sheet.width, startX, endX, sheet.height);
        if (component) return component;
      }
      let minX = endX;
      let minY = sheet.height;
      let maxX = startX;
      let maxY = 0;

      for (let y = 0; y < sheet.height; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          if (pixels[(y * sheet.width + x) * 4 + 3] > 16) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxY <= minY) return { sx: startX, sy: 0, sw: endX - startX, sh: sheet.height };
      return { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
    });
  }

  function analyzeAlignedSpriteSheet(image, frameCount) {
    const sheet = document.createElement('canvas');
    sheet.width = image.naturalWidth;
    sheet.height = image.naturalHeight;
    const sheetContext = sheet.getContext('2d', { willReadFrequently: true });
    sheetContext.drawImage(image, 0, 0);
    const pixels = sheetContext.getImageData(0, 0, sheet.width, sheet.height).data;
    const cellWidth = sheet.width / frameCount;
    let commonTop = sheet.height;
    let commonBaseline = 0;

    const frames = Array.from({ length: frameCount }, (_, frameIndex) => {
      const startX = Math.floor(frameIndex * cellWidth);
      const endX = Math.floor((frameIndex + 1) * cellWidth);
      let minY = sheet.height;
      let maxY = 0;

      for (let y = 0; y < sheet.height; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          if (pixels[(y * sheet.width + x) * 4 + 3] > 16) {
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxY > minY) {
        commonTop = Math.min(commonTop, minY);
        commonBaseline = Math.max(commonBaseline, maxY);
      }
      return { sx: startX, sy: 0, sw: endX - startX, sh: sheet.height };
    });

    frames.aligned = true;
    frames.baseline = commonBaseline || sheet.height;
    frames.referenceHeight = Math.max(1, frames.baseline - commonTop + 1);
    return frames;
  }

  function analyzeAlignedGridSpriteSheet(image, columns, rows) {
    const sheet = document.createElement('canvas');
    sheet.width = image.naturalWidth;
    sheet.height = image.naturalHeight;
    const sheetContext = sheet.getContext('2d', { willReadFrequently: true });
    sheetContext.drawImage(image, 0, 0);
    const pixels = sheetContext.getImageData(0, 0, sheet.width, sheet.height).data;
    const cellWidth = sheet.width / columns;
    const cellHeight = sheet.height / rows;
    let commonTop = cellHeight;
    let commonBaseline = 0;

    const frames = Array.from({ length: columns * rows }, (_, frameIndex) => {
      const column = frameIndex % columns;
      const row = Math.floor(frameIndex / columns);
      const startX = Math.floor(column * cellWidth);
      const endX = Math.floor((column + 1) * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endY = Math.floor((row + 1) * cellHeight);
      let minY = endY;
      let maxY = startY;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          if (pixels[(y * sheet.width + x) * 4 + 3] > 16) {
            minY = Math.min(minY, y - startY);
            maxY = Math.max(maxY, y - startY);
          }
        }
      }

      if (maxY > minY) {
        commonTop = Math.min(commonTop, minY);
        commonBaseline = Math.max(commonBaseline, maxY);
      }
      return { sx: startX, sy: startY, sw: endX - startX, sh: endY - startY };
    });

    frames.aligned = true;
    frames.baseline = commonBaseline || cellHeight;
    frames.referenceHeight = Math.max(1, frames.baseline - commonTop + 1);
    return frames;
  }

  function analyzeNormalizedSpriteSheet(image, frameCount, padding = 5) {
    const sheet = document.createElement('canvas');
    sheet.width = image.naturalWidth;
    sheet.height = image.naturalHeight;
    const sheetContext = sheet.getContext('2d', { willReadFrequently: true });
    sheetContext.drawImage(image, 0, 0);
    const pixels = sheetContext.getImageData(0, 0, sheet.width, sheet.height).data;
    const cellWidth = sheet.width / frameCount;

    const frames = Array.from({ length: frameCount }, (_, frameIndex) => {
      const cellStartX = Math.floor(frameIndex * cellWidth);
      const cellEndX = Math.floor((frameIndex + 1) * cellWidth);
      let minX = cellEndX;
      let minY = sheet.height;
      let maxX = cellStartX;
      let maxY = 0;

      for (let y = 0; y < sheet.height; y += 1) {
        for (let x = cellStartX; x < cellEndX; x += 1) {
          if (pixels[(y * sheet.width + x) * 4 + 3] > 8) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxY <= minY) {
        return {
          sx: cellStartX,
          sy: 0,
          sw: cellEndX - cellStartX,
          sh: sheet.height,
          contentHeight: sheet.height,
          contentBottom: sheet.height,
          anchorOffsetX: -(cellEndX - cellStartX) / 2
        };
      }

      const cropStartX = Math.max(cellStartX, minX - padding);
      const cropEndX = Math.min(cellEndX, maxX + padding + 1);
      const cropStartY = Math.max(0, minY - padding);
      const cropEndY = Math.min(sheet.height, maxY + padding + 1);
      return {
        sx: cropStartX,
        sy: cropStartY,
        sw: cropEndX - cropStartX,
        sh: cropEndY - cropStartY,
        contentHeight: maxY - minY + 1,
        contentBottom: maxY - cropStartY + 1,
        anchorOffsetX: cropStartX - cellStartX - (cellEndX - cellStartX) / 2
      };
    });

    frames.normalized = true;
    return frames;
  }

  function drawBackground() {
    const stage = stages[stageIndex];
    ctx.fillStyle = stage.skyTop;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = stage.skyBottom;
    ctx.fillRect(0, 260, WIDTH, GROUND_Y - 260);
    ctx.globalAlpha = 0.12;
    for (let band = 0; band < 4; band += 1) {
      ctx.fillStyle = band % 2 ? '#ffffff' : '#000000';
      ctx.fillRect(0, 260 + band * 60, WIDTH, 60);
    }
    ctx.globalAlpha = 1;

    if (stageIndex === 0) drawAncientBackdrop();
    if (stageIndex === 1) drawIronBackdrop();
    if (stageIndex === 2) drawIndustrialBackdrop();
    if (stageIndex === 3) drawDigitalBackdrop();
    if (stages[stageIndex].boss) drawBossBackdrop();
  }

  function drawAncientBackdrop() {
    const sunX = Math.round(930 - renderCameraX * 0.05);
    ctx.fillStyle = '#efaa62';
    ctx.fillRect(sunX, 86, 74, 74);

    const mountains = [
      [-260, 560, 170, '#684047'], [360, 760, 230, '#74464a'],
      [1160, 430, 135, '#5f3a43'], [1660, 880, 255, '#79494b'],
      [2600, 570, 180, '#603b43']
    ];
    for (const [worldX, width, height, color] of mountains) {
      const x = Math.round(worldX - renderCameraX * 0.35);
      ctx.fillStyle = color;
      ctx.fillRect(x, GROUND_Y - height, width, height);
      ctx.fillRect(x + Math.round(width * 0.2), GROUND_Y - height - 55, Math.round(width * 0.58), 60);
      ctx.fillRect(x + Math.round(width * 0.38), GROUND_Y - height - 98, Math.round(width * 0.23), 46);
    }

    const landmarkX = position => Math.round(position - renderCameraX * 0.82);
    let x = landmarkX(260);
    ctx.fillStyle = '#422e36';
    ctx.fillRect(x, 350, 330, 150);
    ctx.fillRect(x + 70, 310, 190, 190);
    ctx.fillStyle = '#201c25';
    ctx.fillRect(x + 126, 388, 80, 112);

    x = landmarkX(1250);
    ctx.fillStyle = '#8d6654';
    ctx.fillRect(x, 315, 34, 185);
    ctx.fillRect(x + 86, 260, 40, 240);
    ctx.fillRect(x + 180, 345, 30, 155);

    x = landmarkX(2050);
    ctx.fillStyle = '#342f34';
    ctx.fillRect(x, 392, 240, 108);
    ctx.fillRect(x + 42, 360, 54, 140);
    ctx.fillRect(x + 146, 330, 46, 170);
    ctx.fillStyle = '#bf8755';
    ctx.fillRect(x + 64, 342, 12, 52);

    x = landmarkX(2920);
    ctx.fillStyle = '#382c32';
    ctx.fillRect(x + 26, 398, 142, 72);
    ctx.fillRect(x + 6, 420, 182, 48);
    ctx.fillRect(x + 42, 468, 24, 32);
    ctx.fillRect(x + 132, 468, 24, 32);
    ctx.fillRect(x + 168, 372, 20, 66);
    ctx.fillRect(x + 184, 366, 30, 18);

    x = landmarkX(3790);
    ctx.fillStyle = '#4a3039';
    ctx.fillRect(x, 382, 330, 118);
    ctx.fillRect(x + 64, 310, 210, 190);
    ctx.fillRect(x + 122, 250, 96, 250);
    ctx.fillStyle = '#d76d46';
    ctx.fillRect(x + 145, 236, 52, 18);
    ctx.fillRect(x + 158, 218, 26, 18);

    x = landmarkX(4640);
    ctx.fillStyle = '#60443e';
    ctx.fillRect(x, 402, 190, 98);
    ctx.fillRect(x + 240, 382, 150, 118);
    ctx.fillStyle = '#b47a4f';
    ctx.fillRect(x - 18, 382, 226, 22);
    ctx.fillRect(x + 222, 360, 186, 24);
    ctx.fillStyle = '#2a2229';
    ctx.fillRect(x + 72, 440, 50, 60);
    ctx.fillRect(x + 288, 432, 44, 68);
  }

  function drawIndustrialBackdrop() {
    const factories = [
      [-120, 250, 215, 46, 325], [520, 330, 175, 58, 285],
      [1180, 280, 240, 42, 340], [1880, 390, 185, 64, 300],
      [2700, 310, 230, 50, 360], [3520, 430, 170, 70, 270],
      [4380, 350, 220, 48, 330]
    ];
    for (const [worldX, width, height, chimneyWidth, chimneyHeight] of factories) {
      const x = Math.round(worldX - renderCameraX * 0.78);
      ctx.fillStyle = '#3d4a50';
      ctx.fillRect(x, GROUND_Y - height, width, height);
      ctx.fillRect(x + 38, GROUND_Y - chimneyHeight, chimneyWidth, chimneyHeight);
      ctx.fillStyle = '#d79b54';
      for (let wx = x + 24; wx < x + width - 18; wx += 58) {
        ctx.fillRect(wx, GROUND_Y - height + 50, 24, 26);
        ctx.fillRect(wx, GROUND_Y - height + 108, 24, 26);
      }
      ctx.fillStyle = '#3d4a50';
      ctx.fillRect(x + 28, GROUND_Y - chimneyHeight - 12, chimneyWidth + 20, 12);
      ctx.fillStyle = 'rgba(225, 229, 225, 0.22)';
      ctx.fillRect(x + 62, GROUND_Y - chimneyHeight - 54, 52, 22);
      ctx.fillRect(x + 94, GROUND_Y - chimneyHeight - 88, 74, 24);
    }
  }

  function drawIronBackdrop() {
    const strongholds = [
      [-180, 260, 205], [620, 340, 250], [1480, 220, 170],
      [2180, 390, 230], [3160, 270, 260], [4010, 360, 190], [4760, 240, 240]
    ];
    for (const [worldX, width, height] of strongholds) {
      const x = Math.round(worldX - renderCameraX * 0.76);
      ctx.fillStyle = '#51383a';
      ctx.fillRect(x, GROUND_Y - height, width, height);
      ctx.fillRect(x + 28, GROUND_Y - height - 48, 46, height + 48);
      ctx.fillRect(x + width - 74, GROUND_Y - height - 48, 46, height + 48);
      ctx.fillRect(x + 70, GROUND_Y - height - 22, width - 140, 24);
      ctx.fillStyle = '#201f28';
      ctx.fillRect(x + width / 2 - 24, 405, 48, 95);
      ctx.fillStyle = '#df7845';
      ctx.fillRect(x + 90, 448, 46, 42);
      ctx.fillStyle = '#ffc76a';
      ctx.fillRect(x + 102, 456, 22, 34);
    }
  }

  function drawDigitalBackdrop() {
    const buildings = [
      [-160, 190, 205], [260, 240, 310], [820, 170, 230], [1260, 280, 360],
      [1920, 210, 270], [2440, 320, 225], [3140, 180, 345], [3580, 260, 255],
      [4200, 220, 330], [4700, 310, 245], [5240, 190, 355]
    ];
    for (let buildingIndex = 0; buildingIndex < buildings.length; buildingIndex += 1) {
      const [worldX, width, height] = buildings[buildingIndex];
      const x = Math.round(worldX - renderCameraX * 0.82);
      ctx.fillStyle = '#20275d';
      ctx.fillRect(x, GROUND_Y - height, width, height);
      ctx.fillStyle = '#6df3da';
      for (let wx = x + 22; wx < x + width - 20; wx += 42) {
        for (let wy = GROUND_Y - height + 30; wy < GROUND_Y - 25; wy += 46) {
          if ((buildingIndex + Math.round((wy - GROUND_Y + height) / 46) + Math.round((wx - x) / 42)) % 3 !== 0) {
            ctx.fillRect(wx, wy, 16, 10);
          }
        }
      }
      ctx.fillStyle = '#20275d';
      if (buildingIndex % 2 === 1) ctx.fillRect(x + width / 2 - 9, GROUND_Y - height - 38, 18, 38);
    }
  }

  function drawBossBackdrop() {
    const towers = [[-100, 170, 260], [520, 220, 330], [1280, 150, 230], [1960, 260, 360], [2880, 190, 280], [3720, 240, 345], [4580, 210, 300]];
    for (const [worldX, width, height] of towers) {
      const x = Math.round(worldX - renderCameraX * 0.8);
      ctx.fillStyle = '#21183d';
      ctx.fillRect(x, GROUND_Y - height, width, height);
      ctx.fillStyle = '#ff5370';
      ctx.fillRect(x + 28, GROUND_Y - height + 42, width - 56, 8);
      ctx.fillRect(x + 28, GROUND_Y - height + 92, Math.max(44, width - 96), 8);
    }
  }

  function drawGround() {
    const stage = stages[stageIndex];
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
    ctx.fillStyle = stage.accent;
    ctx.fillRect(0, GROUND_Y, WIDTH, 8);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#fff';
    const firstRoadMark = Math.floor(renderCameraX / 72) - 1;
    const lastRoadMark = Math.ceil((renderCameraX + WIDTH) / 72) + 1;
    for (let markIndex = firstRoadMark; markIndex <= lastRoadMark; markIndex += 1) {
      const markX = Math.round(markIndex * 72 - renderCameraX);
      ctx.fillRect(markX, GROUND_Y + 34, 28, 5);
    }
    ctx.globalAlpha = 1;

    for (const pit of pits) {
      const x = Math.round(pit.x - renderCameraX);
      if (x > WIDTH || x + pit.w < 0) continue;
      ctx.fillStyle = '#090b14';
      ctx.fillRect(x, GROUND_Y - 2, pit.w, HEIGHT - GROUND_Y + 2);
      ctx.fillStyle = stage.accent;
      for (let edge = 0; edge < pit.w; edge += 28) {
        ctx.fillRect(x + edge, GROUND_Y - (edge % 56 ? 4 : 8), 18, 4);
      }
    }
  }

  function drawPlatforms() {
    const stage = stages[stageIndex];
    for (const platform of platforms) {
      const x = Math.round(platform.x - renderCameraX);
      ctx.fillStyle = stage.accent;
      ctx.fillRect(x, platform.y, platform.w, platform.h);
      ctx.fillStyle = 'rgba(22, 24, 38, 0.42)';
      for (let block = 8; block < platform.w - 8; block += 34) {
        ctx.fillRect(x + block, platform.y + 8, 22, 7);
      }
    }
  }

  function drawObstacles() {
    const stage = stages[stageIndex];
    for (const obstacle of obstacles) {
      const x = Math.round(obstacle.x - renderCameraX);
      const y = Math.round(obstacle.y + (obstacle.type === 'electric' ? Math.sin(obstacle.phase) * 5 : 0));
      if (x > WIDTH + 100 || x + obstacle.w < -100) continue;
      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (obstacle.type === 'spikes') {
        ctx.fillStyle = '#d7d0bd';
        for (let spike = 0; spike < obstacle.w; spike += 18) {
          ctx.beginPath();
          ctx.moveTo(x + spike, y + obstacle.h);
          ctx.lineTo(x + spike + 9, y);
          ctx.lineTo(x + spike + 18, y + obstacle.h);
          ctx.fill();
        }
      } else if (obstacle.type === 'fire') {
        ctx.fillStyle = '#ffcf5a';
        ctx.fillRect(x + 12, y + 10, obstacle.w - 24, obstacle.h - 10);
        ctx.fillStyle = '#f06b3f';
        ctx.fillRect(x + 2, y + 22, obstacle.w - 4, obstacle.h - 22);
        ctx.fillRect(x + 20, y, 18, 28);
      } else if (obstacle.type === 'boulder') {
        ctx.fillStyle = '#5e514b';
        ctx.fillRect(x + 8, y, obstacle.w - 16, obstacle.h);
        ctx.fillRect(x, y + 12, obstacle.w, obstacle.h - 24);
        ctx.fillStyle = '#8b7563';
        ctx.fillRect(x + 12, y + 10, 16, 10);
      } else if (obstacle.type === 'hammer') {
        ctx.fillStyle = '#282b34';
        ctx.fillRect(x + 20, y, 12, obstacle.h);
        ctx.fillStyle = '#c17d45';
        ctx.fillRect(x, y, obstacle.w, 28);
        ctx.fillStyle = '#efaa5c';
        ctx.fillRect(x + 8, y + 7, obstacle.w - 16, 7);
      } else if (obstacle.type === 'gear') {
        ctx.translate(x + obstacle.w / 2, y + obstacle.h / 2);
        ctx.rotate(obstacle.phase * 0.55);
        ctx.fillStyle = '#d89d56';
        for (let tooth = 0; tooth < 8; tooth += 1) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-6, -obstacle.h / 2, 12, 15);
        }
        ctx.fillRect(-19, -19, 38, 38);
        ctx.fillStyle = '#30383a';
        ctx.fillRect(-7, -7, 14, 14);
      } else if (obstacle.type === 'steam') {
        ctx.fillStyle = '#69757a';
        ctx.fillRect(x + 8, GROUND_Y - 18, obstacle.w - 16, 18);
        ctx.globalAlpha = 0.65 + Math.sin(obstacle.phase) * 0.2;
        ctx.fillStyle = '#e6ece8';
        ctx.fillRect(x + 15, y + 16, obstacle.w - 30, obstacle.h - 30);
        ctx.fillRect(x + 4, y, obstacle.w - 18, 24);
      } else if (obstacle.type === 'laser') {
        ctx.fillStyle = '#222a56';
        ctx.fillRect(x - 8, y - 12, obstacle.w + 16, 16);
        ctx.fillRect(x - 8, GROUND_Y - 8, obstacle.w + 16, 8);
        ctx.fillStyle = '#ff5370';
        ctx.shadowColor = '#ff5370';
        ctx.shadowBlur = 12;
        ctx.fillRect(x + 8, y, 8, obstacle.h);
      } else if (obstacle.type === 'electric') {
        ctx.fillStyle = '#6df3da';
        ctx.fillRect(x, y + 16, obstacle.w, obstacle.h - 16);
        ctx.fillStyle = '#202548';
        ctx.fillRect(x + 10, y + 23, obstacle.w - 20, obstacle.h - 30);
        ctx.fillStyle = stage.accent;
        ctx.fillRect(x + 20, y, 8, 22);
        ctx.fillRect(x + 34, y + 7, 8, 22);
      }
      ctx.restore();
    }
  }

  function drawPlayerFallback(x, y) {
    ctx.fillStyle = '#1b1e2e';
    ctx.fillRect(x + 9, y, 30, 12);
    ctx.fillStyle = '#d7976b';
    ctx.fillRect(x + 10, y + 10, 28, 20);
    ctx.fillStyle = '#172b4c';
    ctx.fillRect(x + 6, y + 30, 36, 24);
    ctx.fillStyle = '#b8a17c';
    ctx.fillRect(x + 8, y + 54, 13, 18);
    ctx.fillRect(x + 27, y + 54, 13, 18);
  }

  function drawPlayer() {
    const x = Math.round(player.x - renderCameraX);
    const y = Math.round(player.y);
    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) return;

    let image = richardSprite;
    let frames = spriteFrames;
    let frame = IDLE_SEQUENCE[Math.floor(performance.now() / 220) % IDLE_SEQUENCE.length];
    let targetHeight = 92;
    let allowFlip = true;

    if (player.emoteFrame !== null) {
      const isTPose = player.emoteFrame === 3;
      image = isTPose ? richardTPoseSprite : richardEmoteSprite;
      frames = isTPose ? tPoseFrames : emoteFrames;
      frame = isTPose ? 0 : player.emoteFrame;
      targetHeight = isTPose ? 97 : 90;
      allowFlip = false;
    } else if (player.hurtPose > 0) {
      frame = 5;
    } else if (!player.grounded) {
      frame = 4;
    } else if ((keys.left || keys.right) && Math.abs(player.vx) > 18) {
      image = richardRunSprite;
      frames = runFrames;
      frame = RUN_SEQUENCE[Math.floor(player.step / 20) % RUN_SEQUENCE.length];
      targetHeight = 92;
    }

    if (!image.complete || !image.naturalWidth) {
      drawPlayerFallback(x, y);
      return;
    }

    const spriteFrame = frames[frame];
    if (!spriteFrame) {
      drawPlayerFallback(x, y);
      return;
    }

    const referenceHeight = frames.normalized
      ? spriteFrame.contentHeight
      : frames.referenceHeight || frames[0].sh;
    const scale = targetHeight / referenceHeight;
    const renderWidth = spriteFrame.sw * scale;
    const renderHeight = spriteFrame.sh * scale;
    const renderLeft = frames.normalized ? spriteFrame.anchorOffsetX * scale : -renderWidth / 2;
    const renderTop = frames.normalized
      ? -spriteFrame.contentBottom * scale
      : frames.aligned ? -frames.baseline * scale : -renderHeight;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x + player.w / 2, y + player.h);
    ctx.scale(allowFlip ? player.facing : 1, 1);
    ctx.drawImage(
      image,
      spriteFrame.sx,
      spriteFrame.sy,
      spriteFrame.sw,
      spriteFrame.sh,
      renderLeft,
      renderTop,
      renderWidth,
      renderHeight
    );
    ctx.restore();
  }

  function drawEnemy(enemy) {
    const x = Math.round(enemy.x - renderCameraX);
    const y = Math.round(enemy.y);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x + (enemy.direction < 0 ? enemy.w : 0), y);
    ctx.scale(enemy.direction < 0 ? -1 : 1, 1);

    if (enemy.kind === 'boar') {
      ctx.fillStyle = '#4a3732';
      ctx.fillRect(8, 10, 38, 23);
      ctx.fillRect(2, 16, 52, 14);
      ctx.fillStyle = '#745247';
      ctx.fillRect(38, 14, 18, 16);
      ctx.fillRect(12, 5, 24, 8);
      ctx.fillStyle = '#1d1b20';
      ctx.fillRect(49, 17, 5, 5);
      ctx.fillRect(12, 29, 8, 9);
      ctx.fillRect(38, 29, 8, 9);
      ctx.fillStyle = '#ead8aa';
      ctx.fillRect(53, 26, 5, 8);
      ctx.fillRect(55, 31, 3, 5);
      ctx.fillStyle = '#a97b61';
      ctx.fillRect(5, 7, 8, 9);
    } else if (enemy.kind === 'iron-guard') {
      ctx.fillStyle = '#292d35';
      ctx.fillRect(14, 17, 24, 31);
      ctx.fillRect(10, 48, 10, 10);
      ctx.fillRect(32, 48, 10, 10);
      ctx.fillStyle = '#89909a';
      ctx.fillRect(12, 4, 30, 18);
      ctx.fillRect(8, 10, 38, 8);
      ctx.fillStyle = '#151820';
      ctx.fillRect(29, 11, 8, 4);
      ctx.fillStyle = '#a94f3d';
      ctx.fillRect(17, 0, 18, 6);
      ctx.fillRect(22, -5, 8, 7);
      ctx.fillStyle = '#bd874e';
      ctx.fillRect(3, 22, 8, 28);
      ctx.fillStyle = '#d9b56e';
      ctx.fillRect(0, 18, 13, 8);
      ctx.fillStyle = '#6f7782';
      ctx.fillRect(35, 22, 12, 24);
      ctx.fillStyle = '#c2c7ce';
      ctx.fillRect(39, 28, 4, 10);
    } else if (enemy.kind === 'steam-bot') {
      ctx.fillStyle = '#343b3d';
      ctx.fillRect(8, 14, 40, 32);
      ctx.fillRect(13, 46, 10, 8);
      ctx.fillRect(35, 46, 10, 8);
      ctx.fillStyle = '#b56f3f';
      ctx.fillRect(3, 20, 8, 20);
      ctx.fillRect(47, 20, 7, 20);
      ctx.fillRect(18, 5, 22, 12);
      ctx.fillStyle = '#e1a254';
      ctx.fillRect(16, 23, 26, 15);
      ctx.fillStyle = '#202528';
      ctx.fillRect(21, 27, 6, 6);
      ctx.fillRect(33, 27, 6, 6);
      ctx.fillStyle = '#707b7e';
      ctx.fillRect(35, 0, 10, 12);
      ctx.fillStyle = 'rgba(235, 240, 232, 0.68)';
      ctx.fillRect(41, -8, 12, 8);
      ctx.fillRect(47, -15, 14, 7);
    } else {
      ctx.fillStyle = '#ff5370';
      ctx.fillRect(13, 8, 38, 20);
      ctx.fillRect(19, 4, 26, 28);
      ctx.fillStyle = '#202548';
      ctx.fillRect(27, 12, 12, 8);
      ctx.fillStyle = '#6df3da';
      ctx.fillRect(30, 14, 6, 4);
      ctx.fillStyle = '#abb4c8';
      ctx.fillRect(0, 2, 20, 4);
      ctx.fillRect(44, 2, 18, 4);
      ctx.fillStyle = '#59637a';
      ctx.fillRect(7, 0, 5, 11);
      ctx.fillRect(52, 0, 5, 11);
      ctx.fillStyle = '#ffcf68';
      ctx.fillRect(17, 28, 5, 4);
      ctx.fillRect(42, 28, 5, 4);
    }
    ctx.restore();
  }

  function drawPixelCollectibleIcon(icon) {
    const accent = stages[stageIndex].accent;
    if (icon === 'stone') {
      ctx.fillStyle = '#716763';
      ctx.fillRect(5, 12, 26, 17);
      ctx.fillRect(10, 7, 16, 25);
      ctx.fillStyle = '#aaa09a';
      ctx.fillRect(11, 11, 8, 5);
      ctx.fillStyle = '#403b3d';
      ctx.fillRect(20, 17, 4, 10);
      ctx.fillRect(16, 23, 8, 4);
    } else if (icon === 'fire') {
      ctx.fillStyle = '#ef663f';
      ctx.fillRect(7, 15, 24, 17);
      ctx.fillRect(12, 8, 17, 23);
      ctx.fillRect(18, 3, 8, 15);
      ctx.fillStyle = '#ffd25f';
      ctx.fillRect(14, 19, 12, 13);
      ctx.fillRect(19, 13, 7, 11);
    } else if (icon === 'wheel') {
      ctx.fillStyle = '#6f4934';
      ctx.fillRect(7, 4, 22, 5);
      ctx.fillRect(7, 27, 22, 5);
      ctx.fillRect(4, 8, 5, 20);
      ctx.fillRect(27, 8, 5, 20);
      ctx.fillRect(14, 14, 8, 8);
      ctx.fillRect(17, 7, 3, 22);
      ctx.fillRect(7, 17, 22, 3);
    } else if (icon === 'iron') {
      ctx.fillStyle = '#c0c4c8';
      ctx.fillRect(5, 14, 26, 14);
      ctx.fillRect(9, 10, 18, 20);
      ctx.fillStyle = '#737a80';
      ctx.fillRect(10, 15, 16, 5);
    } else if (icon === 'forge') {
      ctx.fillStyle = '#4a4d52';
      ctx.fillRect(4, 10, 28, 8);
      ctx.fillRect(10, 18, 18, 6);
      ctx.fillRect(14, 24, 10, 8);
      ctx.fillStyle = '#ef8245';
      ctx.fillRect(3, 5, 9, 5);
    } else if (icon === 'sword') {
      ctx.fillStyle = '#d9dde1';
      ctx.fillRect(17, 3, 5, 23);
      ctx.fillRect(14, 6, 3, 17);
      ctx.fillStyle = '#9b713f';
      ctx.fillRect(8, 24, 22, 5);
      ctx.fillRect(16, 28, 7, 6);
    } else if (icon === 'steam') {
      ctx.fillStyle = '#596164';
      ctx.fillRect(6, 16, 25, 16);
      ctx.fillRect(11, 11, 15, 5);
      ctx.fillStyle = '#dadfdd';
      ctx.fillRect(9, 3, 8, 7);
      ctx.fillRect(15, 0, 10, 6);
      ctx.fillStyle = '#e0a057';
      ctx.fillRect(11, 21, 15, 6);
    } else if (icon === 'bulb') {
      ctx.fillStyle = '#ffe28a';
      ctx.fillRect(10, 6, 17, 18);
      ctx.fillRect(7, 11, 23, 9);
      ctx.fillStyle = '#7b7f86';
      ctx.fillRect(13, 24, 12, 5);
      ctx.fillRect(15, 30, 8, 3);
    } else if (icon === 'telegraph') {
      ctx.fillStyle = '#77513b';
      ctx.fillRect(4, 20, 28, 12);
      ctx.fillStyle = '#d5b16b';
      ctx.fillRect(9, 15, 18, 6);
      ctx.fillRect(16, 6, 4, 12);
      ctx.fillRect(12, 5, 12, 4);
      ctx.fillStyle = '#363a40';
      ctx.fillRect(24, 10, 5, 10);
    } else if (icon === 'computer') {
      ctx.fillStyle = '#c9d5db';
      ctx.fillRect(3, 5, 30, 21);
      ctx.fillStyle = '#202548';
      ctx.fillRect(7, 9, 22, 13);
      ctx.fillStyle = accent;
      ctx.fillRect(10, 12, 10, 4);
      ctx.fillStyle = '#8e9aa0';
      ctx.fillRect(15, 26, 7, 5);
      ctx.fillRect(9, 31, 19, 3);
    } else if (icon === 'internet') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 9); ctx.lineTo(18, 18); ctx.lineTo(29, 7);
      ctx.moveTo(18, 18); ctx.lineTo(27, 29);
      ctx.moveTo(18, 18); ctx.lineTo(7, 29);
      ctx.stroke();
      ctx.fillStyle = '#effffb';
      ctx.fillRect(4, 5, 8, 8);
      ctx.fillRect(25, 3, 8, 8);
      ctx.fillRect(23, 25, 8, 8);
      ctx.fillRect(3, 25, 8, 8);
      ctx.fillRect(14, 14, 8, 8);
    } else {
      ctx.fillStyle = accent;
      ctx.fillRect(6, 6, 24, 24);
      ctx.fillStyle = '#202548';
      ctx.fillRect(11, 11, 14, 14);
      ctx.fillStyle = '#effffb';
      ctx.fillRect(13, 14, 3, 3);
      ctx.fillRect(20, 14, 3, 3);
      ctx.fillRect(15, 20, 7, 3);
      ctx.fillStyle = accent;
      for (let pin = 8; pin <= 28; pin += 7) {
        ctx.fillRect(pin, 2, 3, 5);
        ctx.fillRect(pin, 29, 3, 5);
      }
    }
  }

  function drawCollectible(item) {
    const x = Math.round(item.x - renderCameraX);
    const y = Math.round(item.y + Math.sin(item.phase) * 7);
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = stages[stageIndex].accent;
    ctx.shadowBlur = 14;
    drawPixelCollectibleIcon(item.icon);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Funnel Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + 18, y - 10);
  }

  function drawPortal() {
    if (stages[stageIndex].boss) return;
    const x = Math.round(PORTAL.x - renderCameraX);
    const requiredItems = stages[stageIndex].items.length;
    const active = stageCollected === requiredItems;
    const pulse = Math.sin(performance.now() / 180) * 4;
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = active ? stages[stageIndex].accent : '#777b86';
    ctx.shadowColor = active ? stages[stageIndex].accent : 'transparent';
    ctx.shadowBlur = active ? 28 : 0;
    ctx.beginPath();
    ctx.ellipse(x + PORTAL.w / 2, PORTAL.y + PORTAL.h / 2, 43 + pulse, 78 + pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.globalAlpha = active ? 0.72 : 0.24;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(x + PORTAL.w / 2, PORTAL.y + PORTAL.h / 2, 29 - ring * 7, 61 - ring * 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Funnel Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(active ? 'PORTAL ABERTO' : `${stageCollected}/${requiredItems} INVENÇÕES`, x + PORTAL.w / 2, PORTAL.y - 18);
  }

  function drawBossPreview() {
    if (!stages[stageIndex].boss) return;
    const x = Math.round(4850 - renderCameraX);
    if (x < -220 || x > WIDTH + 220) return;

    ctx.save();
    ctx.shadowColor = '#ff5370';
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(8, 9, 23, 0.92)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 105, 82, 112, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 64, GROUND_Y - 178);
    ctx.lineTo(x - 118, GROUND_Y - 238);
    ctx.lineTo(x - 84, GROUND_Y - 144);
    ctx.moveTo(x + 64, GROUND_Y - 178);
    ctx.lineTo(x + 118, GROUND_Y - 238);
    ctx.lineTo(x + 84, GROUND_Y - 144);
    ctx.fill();
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff5370';
    ctx.fillRect(x - 37, GROUND_Y - 135, 18, 9);
    ctx.fillRect(x + 19, GROUND_Y - 135, 18, 9);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Funnel Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONFRONTO FINAL', x, GROUND_Y - 270);
    ctx.fillStyle = stages[stageIndex].accent;
    ctx.font = 'bold 13px Funnel Sans, sans-serif';
    ctx.fillText('EM BREVE', x, GROUND_Y - 246);
  }

  function drawStageProgress() {
    const stage = stages[stageIndex];
    const progressText = stage.boss
      ? 'FINAL  •  ARENA DO CHEFE'
      : `FASE ${stageIndex + 1}/${MAIN_STAGE_COUNT}  •  ${stageCollected}/${stage.items.length} ITENS`;
    drawRoundedRect(24, 22, stage.boss ? 270 : 215, 38, 6, 'rgba(20, 23, 42, 0.72)');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Funnel Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(progressText, 42, 47);
  }

  function drawTransition() {
    if (!transitioning) return;
    const alpha = Math.min(1, transitionTimer / 0.75);
    ctx.fillStyle = `rgba(15, 17, 30, ${alpha})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function draw() {
    renderCameraX = Math.round(cameraX);
    drawBackground();
    drawGround();
    drawPlatforms();
    drawObstacles();
    for (const item of collectibles) if (!item.taken) drawCollectible(item);
    for (const enemy of enemies) if (enemy.alive) drawEnemy(enemy);
    drawPortal();
    drawBossPreview();
    drawPlayer();
    drawStageProgress();
    drawTransition();
  }

  function loop(time) {
    if (!running) return;
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;
    runElapsed = (time - runStartedAt) / 1000;
    updateTimerDisplay();
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function handleKey(event, pressed) {
    if (pressed && !event.repeat && (event.ctrlKey || event.metaKey) && Object.hasOwn(DEV_STAGE_SHORTCUTS, event.code)) {
      event.preventDefault();
      devTeleportToStage(DEV_STAGE_SHORTCUTS[event.code]);
      return;
    }
    const controlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'];
    if (controlKeys.includes(event.code)) event.preventDefault();
    if (pressed && Object.hasOwn(EMOTE_FRAME_BY_KEY, event.code)) startEmote(EMOTE_FRAME_BY_KEY[event.code]);
    if (pressed && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(event.code)) cancelEmote();
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = pressed;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = pressed;
    if ((event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') && pressed) keys.jump = true;
  }

  window.addEventListener('keydown', event => handleKey(event, true));
  window.addEventListener('keyup', event => handleKey(event, false));
  musicToggle?.addEventListener('click', toggleMusic);
  musicVolume?.addEventListener('input', () => {
    soundtrack.volume = Number(musicVolume.value) / 100;
  });

  document.querySelectorAll('[data-control]').forEach(button => {
    const control = button.dataset.control;
    const press = event => {
      event.preventDefault();
      cancelEmote();
      if (control === 'jump') keys.jump = true;
      else keys[control] = true;
    };
    const release = event => {
      event.preventDefault();
      if (control !== 'jump') keys[control] = false;
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });

  richardSprite.addEventListener('load', () => {
    spriteFrames = analyzeNormalizedSpriteSheet(richardSprite, SPRITE_FRAME_COUNT);
    if (!running) draw();
  });
  richardRunSprite.addEventListener('load', () => {
    runFrames = analyzeNormalizedSpriteSheet(richardRunSprite, 8);
    if (!running) draw();
  });
  richardEmoteSprite.addEventListener('load', () => {
    emoteFrames = analyzeSpriteSheet(richardEmoteSprite, 3, true);
    if (!running) draw();
  });
  richardTPoseSprite.addEventListener('load', () => {
    tPoseFrames = analyzeSpriteSheet(richardTPoseSprite, 1, true);
    if (!running) draw();
  });
  resetGame();
  updateMusicControl();
  renderTitleScreen();
  draw();
})();
