(() => {
  const canvas = document.querySelector('#game-canvas');
  const startScreen = document.querySelector('#start-screen');
  const startButton = document.querySelector('#start-button');

  if (!canvas || !startScreen || !startButton) return;

  const ctx = canvas.getContext('2d');
  const eraLabel = document.querySelector('#era-label');
  const inventionCount = document.querySelector('#invention-count');
  const livesLabel = document.querySelector('#lives');
  const eraToast = document.querySelector('#era-toast');
  const eraNumber = document.querySelector('#era-number');
  const eraTitle = document.querySelector('#era-title');
  const eraYears = document.querySelector('#era-years');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const WORLD_WIDTH = 3600;
  const GROUND_Y = 500;
  const GRAVITY = 1900;
  const keys = { left: false, right: false, jump: false };

  const eras = [
    {
      name: 'PRIMEIRAS INVENÇÕES',
      years: '3.500 a.C.',
      skyTop: '#3b2742',
      skyBottom: '#d17454',
      ground: '#4b302b',
      accent: '#f5bb65'
    },
    {
      name: 'REVOLUÇÃO INDUSTRIAL',
      years: 'SÉCULOS XVIII–XIX',
      skyTop: '#263849',
      skyBottom: '#71807f',
      ground: '#30383a',
      accent: '#e2a85a'
    },
    {
      name: 'ERA DIGITAL',
      years: 'SÉCULOS XX–XXI',
      skyTop: '#15183b',
      skyBottom: '#39448c',
      ground: '#202548',
      accent: '#6df3da'
    }
  ];

  const platformsSeed = [
    [330, 420, 150, 22], [590, 355, 150, 22], [850, 420, 170, 22],
    [1290, 405, 160, 22], [1540, 335, 150, 22], [1800, 410, 185, 22],
    [2450, 410, 160, 22], [2720, 335, 150, 22], [2990, 405, 170, 22],
    [3270, 340, 130, 22]
  ];

  const enemySeed = [
    { x: 520, kind: 0, min: 500, max: 720, speed: 70 },
    { x: 920, kind: 0, min: 850, max: 1080, speed: 80 },
    { x: 1390, kind: 1, min: 1260, max: 1510, speed: 85 },
    { x: 1940, kind: 1, min: 1770, max: 2150, speed: 95 },
    { x: 2550, kind: 2, min: 2440, max: 2700, speed: 100 },
    { x: 3100, kind: 2, min: 2960, max: 3260, speed: 115 }
  ];

  const collectibleSeed = [
    { x: 390, y: 360, label: 'RODA', icon: 'wheel' },
    { x: 900, y: 360, label: 'FOGO', icon: 'fire' },
    { x: 1365, y: 345, label: 'VAPOR', icon: 'steam' },
    { x: 1875, y: 350, label: 'LÂMPADA', icon: 'bulb' },
    { x: 2525, y: 350, label: 'CHIP', icon: 'chip' },
    { x: 3075, y: 345, label: 'IA', icon: 'ai' }
  ];

  let platforms = [];
  let enemies = [];
  let collectibles = [];
  let player;
  let cameraX = 0;
  let currentEra = 0;
  let collected = 0;
  let lives = 3;
  let running = false;
  let lastTime = 0;
  let eraToastTimer = 0;
  let finishActive = false;

  function resetGame() {
    platforms = platformsSeed.map(([x, y, w, h]) => ({ x, y, w, h }));
    enemies = enemySeed.map(enemy => ({ ...enemy, w: 46, h: 42, alive: true, direction: 1 }));
    collectibles = collectibleSeed.map(item => ({ ...item, w: 34, h: 34, taken: false, phase: Math.random() * Math.PI * 2 }));
    player = {
      x: 90,
      y: GROUND_Y - 56,
      w: 38,
      h: 56,
      vx: 0,
      vy: 0,
      grounded: true,
      facing: 1,
      invulnerable: 0,
      checkpoint: 90,
      step: 0
    };
    cameraX = 0;
    currentEra = 0;
    collected = 0;
    lives = 3;
    finishActive = false;
    updateHud();
  }

  function startGame() {
    resetGame();
    startScreen.classList.add('is-hidden');
    startButton.textContent = 'INICIAR JORNADA →';
    running = true;
    lastTime = performance.now();
    canvas.focus({ preventScroll: true });
    showEra(0);
    requestAnimationFrame(loop);
  }

  function showEra(index) {
    currentEra = index;
    eraLabel.textContent = eras[index].name;
    eraNumber.textContent = `ERA ${index + 1}`;
    eraTitle.textContent = eras[index].name;
    eraYears.textContent = eras[index].years;
    eraToast.classList.add('is-visible');
    window.clearTimeout(eraToastTimer);
    eraToastTimer = window.setTimeout(() => eraToast.classList.remove('is-visible'), 2100);
  }

  function updateHud() {
    inventionCount.textContent = String(collected);
    livesLabel.textContent = Array.from({ length: Math.max(0, lives) }, () => '♥').join(' ');
    livesLabel.setAttribute('aria-label', `${lives} ${lives === 1 ? 'ponto' : 'pontos'} de energia`);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function hurtPlayer() {
    if (player.invulnerable > 0) return;
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
  }

  function endGame(won) {
    running = false;
    finishActive = won;
    const card = startScreen.querySelector('.overlay-card');
    card.innerHTML = won
      ? `<span class="overlay-icon" aria-hidden="true">★</span>
         <p class="overlay-kicker">LINHA DO TEMPO RESTAURADA</p>
         <h2>Você chegou ao futuro!</h2>
         <p>Foram recuperadas ${collected} de 6 invenções. A tecnologia mudou, mas a curiosidade continua movendo a história.</p>
         <button class="primary-button" id="play-again" type="button">JOGAR NOVAMENTE <span aria-hidden="true">↻</span></button>`
      : `<span class="overlay-icon" aria-hidden="true">!</span>
         <p class="overlay-kicker">A JORNADA FOI INTERROMPIDA</p>
         <h2>Tente mais uma vez</h2>
         <p>Observe o movimento dos inimigos e pule sobre eles para continuar avançando.</p>
         <button class="primary-button" id="play-again" type="button">RECOMEÇAR <span aria-hidden="true">↻</span></button>`;
    startScreen.classList.remove('is-hidden');
    card.querySelector('#play-again').addEventListener('click', startGame, { once: true });
  }

  function update(dt) {
    const acceleration = player.grounded ? 1800 : 1050;
    const maxSpeed = 320;

    if (keys.left) {
      player.vx = Math.max(player.vx - acceleration * dt, -maxSpeed);
      player.facing = -1;
    } else if (keys.right) {
      player.vx = Math.min(player.vx + acceleration * dt, maxSpeed);
      player.facing = 1;
    } else {
      player.vx *= Math.pow(0.0015, dt);
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
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.w, player.x));
    player.grounded = false;

    if (player.y + player.h >= GROUND_Y) {
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

    if (player.y > HEIGHT + 100) hurtPlayer();
    if (player.invulnerable > 0) player.invulnerable -= dt;
    player.step += Math.abs(player.vx) * dt * 0.045;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.speed * enemy.direction * dt;
      if (enemy.x <= enemy.min || enemy.x >= enemy.max) enemy.direction *= -1;

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

    for (const item of collectibles) {
      item.phase += dt * 3;
      const hitBox = { x: item.x, y: item.y + Math.sin(item.phase) * 7, w: item.w, h: item.h };
      if (!item.taken && rectsOverlap(player, hitBox)) {
        item.taken = true;
        collected += 1;
        updateHud();
      }
    }

    const nextEra = Math.min(2, Math.floor(player.x / 1200));
    if (nextEra !== currentEra) {
      player.checkpoint = nextEra * 1200 + 60;
      showEra(nextEra);
    }

    if (player.x > WORLD_WIDTH - 120 && !finishActive) endGame(true);

    const cameraTarget = player.x - WIDTH * 0.36;
    cameraX += (Math.max(0, Math.min(WORLD_WIDTH - WIDTH, cameraTarget)) - cameraX) * Math.min(1, dt * 5);
  }

  function drawRoundedRect(x, y, w, h, radius, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawBackground() {
    const eraIndex = Math.min(2, Math.floor((cameraX + WIDTH / 2) / 1200));
    const era = eras[eraIndex];
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, era.skyTop);
    gradient.addColorStop(1, era.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 18; i += 1) {
      const starX = ((i * 223 - cameraX * 0.12) % 1400 + 1400) % 1400 - 100;
      const starY = 55 + (i * 83) % 260;
      ctx.fillRect(starX, starY, 3 + (i % 2) * 2, 3 + (i % 2) * 2);
    }
    ctx.globalAlpha = 1;

    if (eraIndex === 0) drawAncientBackdrop();
    if (eraIndex === 1) drawIndustrialBackdrop();
    if (eraIndex === 2) drawDigitalBackdrop();
  }

  function drawAncientBackdrop() {
    ctx.fillStyle = 'rgba(42, 25, 33, 0.42)';
    ctx.beginPath();
    ctx.moveTo(0, 390);
    for (let x = 0; x <= WIDTH; x += 150) ctx.lineTo(x, 260 + (x % 300 ? 40 : 0));
    ctx.lineTo(WIDTH, 500);
    ctx.lineTo(0, 500);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 207, 111, 0.22)';
    ctx.beginPath();
    ctx.arc(930 - cameraX * 0.04, 125, 62, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawIndustrialBackdrop() {
    ctx.fillStyle = 'rgba(25, 31, 35, 0.48)';
    for (let x = -100; x < WIDTH + 180; x += 240) {
      const shift = -((cameraX * 0.18) % 240);
      ctx.fillRect(x + shift, 280, 150, 220);
      ctx.fillRect(x + shift + 24, 190, 34, 310);
      ctx.fillStyle = 'rgba(225, 172, 93, 0.25)';
      ctx.fillRect(x + shift + 82, 318, 26, 36);
      ctx.fillStyle = 'rgba(25, 31, 35, 0.48)';
    }
  }

  function drawDigitalBackdrop() {
    ctx.strokeStyle = 'rgba(109, 243, 218, 0.16)';
    ctx.lineWidth = 2;
    const offset = -((cameraX * 0.2) % 90);
    for (let x = offset; x < WIDTH; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    for (let y = 50; y < GROUND_Y; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
  }

  function drawGround() {
    for (let i = 0; i < 3; i += 1) {
      const era = eras[i];
      const x = i * 1200 - cameraX;
      ctx.fillStyle = era.ground;
      ctx.fillRect(x, GROUND_Y, 1200, HEIGHT - GROUND_Y);
      ctx.fillStyle = era.accent;
      ctx.fillRect(x, GROUND_Y, 1200, 8);

      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff';
      for (let mark = 25; mark < 1200; mark += 72) ctx.fillRect(x + mark, GROUND_Y + 28 + (mark % 3) * 10, 28, 5);
      ctx.globalAlpha = 1;
    }
  }

  function drawPlatforms() {
    for (const platform of platforms) {
      const era = eras[Math.min(2, Math.floor(platform.x / 1200))];
      const x = platform.x - cameraX;
      drawRoundedRect(x, platform.y, platform.w, platform.h, 6, era.accent);
      ctx.fillStyle = 'rgba(22, 24, 38, 0.35)';
      ctx.fillRect(x + 10, platform.y + 8, platform.w - 20, 5);
    }
  }

  function drawPlayer() {
    const x = Math.round(player.x - cameraX);
    const y = Math.round(player.y);
    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) return;

    ctx.save();
    ctx.translate(x + player.w / 2, y);
    ctx.scale(player.facing, 1);
    const legSwing = player.grounded && Math.abs(player.vx) > 20 ? Math.sin(player.step) * 5 : 0;

    ctx.fillStyle = '#1b1e2e';
    ctx.fillRect(-13, 2, 26, 8);
    ctx.fillRect(-16, 8, 32, 10);
    ctx.fillStyle = '#d7976b';
    ctx.fillRect(-13, 13, 26, 16);
    ctx.fillStyle = '#241b20';
    ctx.fillRect(-12, 9, 24, 5);
    ctx.fillRect(4, 21, 5, 3);
    ctx.fillStyle = '#172b4c';
    ctx.fillRect(-15, 29, 30, 18);
    ctx.fillStyle = '#3c5e8a';
    ctx.fillRect(-12, 31, 24, 5);
    ctx.fillStyle = '#d9dce5';
    ctx.fillRect(-3, 32, 6, 10);
    ctx.fillStyle = '#b8a17c';
    ctx.fillRect(-13, 47, 11, 8 + legSwing);
    ctx.fillRect(3, 47, 11, 8 - legSwing);
    ctx.fillStyle = '#3a2a26';
    ctx.fillRect(-15, 53 + legSwing, 13, 4);
    ctx.fillRect(3, 53 - legSwing, 14, 4);
    ctx.restore();
  }

  function drawEnemy(enemy) {
    const x = enemy.x - cameraX;
    const y = GROUND_Y - enemy.h;
    enemy.y = y;
    if (enemy.kind === 0) {
      ctx.fillStyle = '#665145';
      ctx.beginPath();
      ctx.arc(x + 23, y + 22, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b9a584';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x + 23, y + 22, 10, 0, Math.PI * 1.6);
      ctx.stroke();
    } else if (enemy.kind === 1) {
      ctx.fillStyle = '#2b3038';
      ctx.fillRect(x + 5, y + 7, 36, 30);
      ctx.fillStyle = '#d9914b';
      ctx.beginPath();
      ctx.arc(x + 23, y + 22, 11, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.fillRect(x + 20 + Math.cos(angle) * 18, y + 19 + Math.sin(angle) * 18, 7, 7);
      }
    } else {
      ctx.fillStyle = '#ff5370';
      drawRoundedRect(x + 4, y + 8, 38, 30, 8, '#ff5370');
      ctx.fillStyle = '#14172d';
      ctx.fillRect(x + 13, y + 17, 6, 6);
      ctx.fillRect(x + 28, y + 17, 6, 6);
      ctx.fillRect(x + 17, y + 30, 14, 4);
      ctx.strokeStyle = '#ff5370';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8); ctx.lineTo(x, y);
      ctx.moveTo(x + 38, y + 8); ctx.lineTo(x + 46, y);
      ctx.stroke();
    }
  }

  function drawCollectible(item) {
    const x = item.x - cameraX;
    const y = item.y + Math.sin(item.phase) * 7;
    ctx.save();
    ctx.shadowColor = '#ffd06f';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffd06f';
    ctx.beginPath();
    ctx.arc(x + 17, y + 17, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#232742';
    ctx.font = 'bold 14px Funnel Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.icon === 'ai' ? 'IA' : '◆', x + 17, y + 22);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Funnel Sans, sans-serif';
    ctx.fillText(item.label, x + 17, y - 10);
  }

  function drawEraMarkers() {
    for (let i = 1; i < 3; i += 1) {
      const x = i * 1200 - cameraX;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawExit() {
    const x = WORLD_WIDTH - 90 - cameraX;
    ctx.fillStyle = '#d7dbea';
    ctx.fillRect(x, 310, 7, 190);
    ctx.fillStyle = '#6df3da';
    ctx.beginPath();
    ctx.moveTo(x + 7, 320);
    ctx.lineTo(x + 78, 345);
    ctx.lineTo(x + 7, 370);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Funnel Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FUTURO', x + 38, 300);
  }

  function draw() {
    drawBackground();
    drawEraMarkers();
    drawGround();
    drawPlatforms();
    for (const item of collectibles) if (!item.taken) drawCollectible(item);
    for (const enemy of enemies) if (enemy.alive) drawEnemy(enemy);
    drawExit();
    drawPlayer();
  }

  function loop(time) {
    if (!running) return;
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function handleKey(event, pressed) {
    const controlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'];
    if (controlKeys.includes(event.code)) event.preventDefault();
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = pressed;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = pressed;
    if ((event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') && pressed) keys.jump = true;
  }

  window.addEventListener('keydown', event => handleKey(event, true));
  window.addEventListener('keyup', event => handleKey(event, false));

  document.querySelectorAll('[data-control]').forEach(button => {
    const control = button.dataset.control;
    const press = event => {
      event.preventDefault();
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

  startButton.addEventListener('click', startGame, { once: true });
  resetGame();
  draw();
})();
