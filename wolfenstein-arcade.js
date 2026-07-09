/*
 * DEBUG RUN: Server Corridors
 * ---------------------------
 * A hidden, original raycasting corridor-shooter easter egg for the
 * Claude Code Academy site. Triggered by the Konami code. Homage to the
 * classic pseudo-3D raycasting genre's MECHANICS only -- everything here
 * (theme, maze, sprites, palette) is original: you're a debugger sweeping
 * glowing "server corridors," dodging a swarm of Johns -- big, muscley
 * guys who wander the halls each hauling a fistful of crystals in one hand
 * and a tray of coffee cups in the other, somehow never spilling either.
 * (Inside joke. Don't overthink it.)
 *
 * Zero globals: everything lives inside this IIFE.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Konami code detection (always listening, cheap, ignores text inputs)
  // ---------------------------------------------------------------------
  var KONAMI_CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var konamiBuffer = [];

  // ---------------------------------------------------------------------
  // Maze data: 21x21 grid, 1 = wall, 0 = open corridor.
  // Generated with a recursive-backtracker (guarantees a fully-connected
  // spanning tree of corridors) plus 14 extra wall-knockdowns to add loops
  // for interesting sightlines -- loops only ever ADD connectivity, they
  // never remove it, so the "no unreachable pockets" guarantee still holds.
  // Verified offline with a BFS flood fill: all 213 open cells are
  // reachable from the spawn cell (1,1). See report for the verification
  // method.
  // ---------------------------------------------------------------------
  var MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  var MAZE_W = MAZE[0].length;
  var MAZE_H = MAZE.length;

  // Enemy spawn cells, spread across the maze via farthest-point sampling
  // so Johns aren't clumped in one corner. All confirmed open (0) cells,
  // generated and BFS-verified against this exact maze (see report).
  var ENEMY_SPAWNS = [
    [19, 19], [5, 1], [1, 19], [19, 4],
    [10, 13], [1, 9], [17, 11], [11, 5]
  ];

  // ---------------------------------------------------------------------
  // Tunables
  // ---------------------------------------------------------------------
  var VIEW_W = 640;
  var VIEW_H = 480;
  var HUD_H = 90;
  var CANVAS_W = VIEW_W;
  var CANVAS_H = VIEW_H + HUD_H;

  var FOV = 66 * Math.PI / 180;
  var PROJ_DIST = (VIEW_W / 2) / Math.tan(FOV / 2);
  var MAX_DDA_STEPS = 64;

  var PLAYER_RADIUS = 0.20;
  var ENEMY_RADIUS = 0.25;
  var MOVE_SPEED = 2.4;       // tiles / second
  var ROT_SPEED = 2.6;        // radians / second
  var ENEMY_SPEED = 1.05;     // tiles / second
  var ENEMY_DETECT_RADIUS = 6.5;
  var ENEMY_CONTACT_RADIUS = 0.55;
  var ENEMY_DPS = 26;         // damage per second while a John is in contact
  var FIRE_COOLDOWN = 0.35;   // seconds
  var HITSCAN_HALF_ANGLE = 3.5 * Math.PI / 180;
  var HITSCAN_RANGE = 14;
  var HEALTH_MAX = 100;

  // ---------------------------------------------------------------------
  // Mutable game state (all reset on open / restart)
  // ---------------------------------------------------------------------
  var modalActive = false;
  var overlayEl = null;
  var canvasEl = null;
  var ctx = null;
  var closeBtnEl = null;
  var restartBtnEl = null;
  var styleInjected = false;

  var keysDown = {};
  var rafId = null;
  var lastTs = null;
  var lastWallDist = new Array(VIEW_W).fill(999);

  var player = { x: 1.5, y: 1.5, angle: 0, health: HEALTH_MAX };
  var enemies = [];
  var defeatedCount = 0;
  var gameState = 'playing'; // 'playing' | 'won' | 'lost'
  var fireCooldown = 0;
  var muzzleFlashTimer = 0;
  var hitMarkerTimer = 0;
  var missFlashTimer = 0;

  // ---------------------------------------------------------------------
  // Small math helpers
  // ---------------------------------------------------------------------
  function wrapAngle(a) {
    a = a % (2 * Math.PI);
    if (a > Math.PI) a -= 2 * Math.PI;
    if (a < -Math.PI) a += 2 * Math.PI;
    return a;
  }

  function isOpen(x, y) {
    var mx = Math.floor(x);
    var my = Math.floor(y);
    if (mx < 0 || mx >= MAZE_W || my < 0 || my >= MAZE_H) return false;
    return MAZE[my][mx] === 0;
  }

  function canMoveTo(x, y, radius) {
    return isOpen(x - radius, y - radius) &&
      isOpen(x + radius, y - radius) &&
      isOpen(x - radius, y + radius) &&
      isOpen(x + radius, y + radius);
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // ---------------------------------------------------------------------
  // Raycasting core: classic grid DDA. Returns the RAW Euclidean distance
  // along the ray (rayDirX/rayDirY are a normalized unit vector, so the
  // ray parameter t solved below IS true Euclidean distance to the wall
  // hit point -- fisheye correction is applied by the caller, which
  // multiplies by cos(offset-from-facing), per the classic raycasting
  // derivation).
  //
  // Div-by-zero safety: when a ray is exactly axis-aligned (rayDirX or
  // rayDirY === 0, i.e. facing exactly N/S or E/W), deltaDist for that
  // axis is set to a large-but-finite sentinel (1e30) instead of dividing
  // by zero, so sideDist on that axis simply never wins the DDA step
  // comparison and mapX/mapY never divides by the ~0 component below.
  // ---------------------------------------------------------------------
  function castRay(rayAngle) {
    var rayDirX = Math.cos(rayAngle);
    var rayDirY = Math.sin(rayAngle);

    var mapX = Math.floor(player.x);
    var mapY = Math.floor(player.y);

    var deltaDistX = rayDirX === 0 ? 1e30 : Math.abs(1 / rayDirX);
    var deltaDistY = rayDirY === 0 ? 1e30 : Math.abs(1 / rayDirY);

    var stepX, stepY, sideDistX, sideDistY;
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - player.y) * deltaDistY;
    }

    var side = 0;
    var hit = false;
    var steps = 0;
    while (!hit && steps < MAX_DDA_STEPS) {
      steps++;
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      if (mapX < 0 || mapX >= MAZE_W || mapY < 0 || mapY >= MAZE_H) {
        hit = true;
        break;
      }
      if (MAZE[mapY][mapX] === 1) hit = true;
    }

    var rawDist;
    if (side === 0) {
      rawDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
    } else {
      rawDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
    }
    if (!isFinite(rawDist) || rawDist < 0) rawDist = 999;

    return { dist: rawDist, side: side };
  }

  // ---------------------------------------------------------------------
  // Player / enemy movement
  // ---------------------------------------------------------------------
  function tryMovePlayer(dx, dy) {
    var nx = player.x + dx;
    var ny = player.y + dy;
    if (canMoveTo(nx, player.y, PLAYER_RADIUS)) player.x = nx;
    if (canMoveTo(player.x, ny, PLAYER_RADIUS)) player.y = ny;
  }

  function updateEnemy(e, dt) {
    if (!e.alive) return;
    var dx = player.x - e.x;
    var dy = player.y - e.y;
    var dist = Math.hypot(dx, dy);

    var moveAngle;
    if (dist < ENEMY_DETECT_RADIUS && dist > 0.001) {
      moveAngle = Math.atan2(dy, dx);
    } else {
      e.wanderTimer -= dt;
      if (e.wanderTimer <= 0) {
        e.wanderAngle = Math.random() * Math.PI * 2;
        e.wanderTimer = 1 + Math.random() * 2;
      }
      moveAngle = e.wanderAngle;
    }

    var speed = ENEMY_SPEED * dt;
    var nx = e.x + Math.cos(moveAngle) * speed;
    var ny = e.y + Math.sin(moveAngle) * speed;
    var moved = false;
    if (canMoveTo(nx, e.y, ENEMY_RADIUS)) { e.x = nx; moved = true; }
    if (canMoveTo(e.x, ny, ENEMY_RADIUS)) { e.y = ny; moved = true; }
    if (!moved) e.wanderTimer = 0; // pick a fresh direction next tick if stuck

    if (dist < ENEMY_CONTACT_RADIUS) {
      player.health = Math.max(0, player.health - ENEMY_DPS * dt);
    }
  }

  // ---------------------------------------------------------------------
  // Firing
  // ---------------------------------------------------------------------
  function fireIfReady() {
    if (gameState !== 'playing') return;
    if (fireCooldown > 0) return;
    fireCooldown = FIRE_COOLDOWN;
    muzzleFlashTimer = 0.09;

    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive) continue;
      var dx = e.x - player.x;
      var dy = e.y - player.y;
      var dist = Math.hypot(dx, dy);
      if (dist > HITSCAN_RANGE) continue;
      var angleTo = Math.atan2(dy, dx);
      var rel = wrapAngle(angleTo - player.angle);
      if (Math.abs(rel) > HITSCAN_HALF_ANGLE) continue;
      var corrected = dist * Math.cos(rel);
      var col = clamp(Math.round((0.5 + rel / FOV) * VIEW_W), 0, VIEW_W - 1);
      if (corrected > lastWallDist[col] + 0.05) continue; // wall occludes the shot
      if (dist < bestDist) { bestDist = dist; best = e; }
    }

    if (best) {
      best.alive = false;
      defeatedCount++;
      hitMarkerTimer = 0.18;
      if (defeatedCount >= enemies.length) gameState = 'won';
    } else {
      missFlashTimer = 0.12;
    }
  }

  // ---------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------
  function update(dt) {
    if (fireCooldown > 0) fireCooldown = Math.max(0, fireCooldown - dt);
    if (muzzleFlashTimer > 0) muzzleFlashTimer = Math.max(0, muzzleFlashTimer - dt);
    if (hitMarkerTimer > 0) hitMarkerTimer = Math.max(0, hitMarkerTimer - dt);
    if (missFlashTimer > 0) missFlashTimer = Math.max(0, missFlashTimer - dt);

    if (gameState !== 'playing') return;

    if (keysDown['arrowleft'] || keysDown['a']) player.angle -= ROT_SPEED * dt;
    if (keysDown['arrowright'] || keysDown['d']) player.angle += ROT_SPEED * dt;
    player.angle = wrapAngle(player.angle);

    var moveDir = 0;
    if (keysDown['arrowup'] || keysDown['w']) moveDir += 1;
    if (keysDown['arrowdown'] || keysDown['s']) moveDir -= 1;
    if (moveDir !== 0) {
      var speed = MOVE_SPEED * dt * moveDir;
      tryMovePlayer(Math.cos(player.angle) * speed, Math.sin(player.angle) * speed);
    }

    for (var i = 0; i < enemies.length; i++) updateEnemy(enemies[i], dt);

    if (player.health <= 0) {
      player.health = 0;
      gameState = 'lost';
    }
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------
  var COLORS = {
    ceiling: [7, 13, 20],
    floor: [10, 22, 18],
    wallA: [0, 76, 84],    // brand midnight green -- vertical (x-side) hits
    wallB: [0, 168, 107],  // pop kelly green -- horizontal (y-side) hits
    johnSkin: [224, 172, 128],
    johnShirt: [60, 70, 130],
    johnShirtShade: [42, 50, 96],
    crystal: [178, 102, 255],
    crystalShade: [122, 58, 196],
    tray: [200, 200, 208],
    cup: [245, 245, 240],
    coffee: [90, 55, 30]
  };

  function shadeStyle(rgb, shade) {
    var r = clamp(Math.round(rgb[0] * shade), 0, 255);
    var g = clamp(Math.round(rgb[1] * shade), 0, 255);
    var b = clamp(Math.round(rgb[2] * shade), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function renderScene() {
    ctx.fillStyle = 'rgb(' + COLORS.ceiling.join(',') + ')';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H / 2);
    ctx.fillStyle = 'rgb(' + COLORS.floor.join(',') + ')';
    ctx.fillRect(0, VIEW_H / 2, VIEW_W, VIEW_H / 2);

    for (var col = 0; col < VIEW_W; col++) {
      var cameraOffset = ((col / VIEW_W) - 0.5) * FOV;
      var rayAngle = player.angle + cameraOffset;
      var hit = castRay(rayAngle);
      // Fisheye correction: project the raw ray distance onto the
      // player's facing direction rather than using it directly.
      var corrected = hit.dist * Math.cos(cameraOffset);
      lastWallDist[col] = corrected;

      var lineH = PROJ_DIST / Math.max(corrected, 0.0001);
      lineH = Math.min(lineH, VIEW_H * 3);
      var drawStart = Math.max(0, VIEW_H / 2 - lineH / 2);
      var drawEnd = Math.min(VIEW_H, VIEW_H / 2 + lineH / 2);
      var shade = clamp(1 - corrected / 13, 0.28, 1);
      var base = hit.side === 0 ? COLORS.wallA : COLORS.wallB;
      ctx.fillStyle = shadeStyle(base, shade);
      ctx.fillRect(col, drawStart, 1, Math.max(1, drawEnd - drawStart));
    }

    // Sprites: painter's algorithm, far-to-near
    var visible = [];
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive) continue;
      var dx = e.x - player.x;
      var dy = e.y - player.y;
      var dist = Math.hypot(dx, dy);
      var angleTo = Math.atan2(dy, dx);
      var rel = wrapAngle(angleTo - player.angle);
      if (Math.abs(rel) > FOV / 2 + 0.15) continue; // outside field of view
      var corrected2 = dist * Math.cos(rel);
      if (corrected2 <= 0.05) continue;
      var screenX = (0.5 + rel / FOV) * VIEW_W;
      var colIdx = clamp(Math.round(screenX), 0, VIEW_W - 1);
      if (corrected2 > lastWallDist[colIdx] + 0.05) continue; // occluded by a nearer wall
      visible.push({ screenX: screenX, dist: corrected2 });
    }
    visible.sort(function (a, b) { return b.dist - a.dist; });
    for (var v = 0; v < visible.length; v++) drawJohn(visible[v].screenX, visible[v].dist);

    drawWeapon();
    drawCrosshair();
    drawMinimap();
  }

  // A big, muscley guy named John, forever wandering the corridors with a
  // fistful of crystals in one hand and a tray of coffee cups in the other.
  function drawJohn(screenX, dist) {
    var size = clamp(PROJ_DIST / dist * 0.85, 4, VIEW_H * 1.6);
    var groundY = VIEW_H / 2 + (PROJ_DIST / dist) * 0.10;
    var w = size * 0.62;
    var h = size * 0.95;

    ctx.save();
    ctx.translate(screenX, groundY - h * 0.5);

    // legs
    ctx.fillStyle = shadeStyle(COLORS.johnShirtShade, 1);
    ctx.fillRect(-w * 0.28, h * 0.18, w * 0.22, h * 0.32);
    ctx.fillRect(w * 0.06, h * 0.18, w * 0.22, h * 0.32);

    // torso -- broad shoulders tapering to the waist
    ctx.fillStyle = shadeStyle(COLORS.johnShirt, 1);
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, -h * 0.05);
    ctx.lineTo(w * 0.5, -h * 0.05);
    ctx.lineTo(w * 0.3, h * 0.2);
    ctx.lineTo(-w * 0.3, h * 0.2);
    ctx.closePath();
    ctx.fill();

    // biceps
    ctx.fillStyle = shadeStyle(COLORS.johnSkin, 0.95);
    ctx.beginPath();
    ctx.ellipse(-w * 0.56, -h * 0.02, w * 0.16, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.56, -h * 0.02, w * 0.16, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = shadeStyle(COLORS.johnSkin, 1);
    ctx.beginPath();
    ctx.arc(0, -h * 0.32, w * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    var eyeR = Math.max(1, size * 0.035);
    ctx.beginPath();
    ctx.arc(-w * 0.09, -h * 0.33, eyeR, 0, Math.PI * 2);
    ctx.arc(w * 0.09, -h * 0.33, eyeR, 0, Math.PI * 2);
    ctx.fill();

    drawCrystalCluster(-w * 0.62, h * 0.05, w * 0.34);
    drawCoffeeTray(w * 0.5, h * 0.08, w * 0.55);

    ctx.restore();
  }

  function drawCrystalCluster(cx, cy, scale) {
    var shards = [
      { dx: -0.3, dy: 0.1, s: 0.55, rot: -0.3, shade: COLORS.crystal },
      { dx: 0.1, dy: 0.15, s: 0.7, rot: 0.15, shade: COLORS.crystalShade },
      { dx: -0.05, dy: -0.15, s: 0.5, rot: 0.4, shade: COLORS.crystal }
    ];
    for (var i = 0; i < shards.length; i++) {
      var sh = shards[i];
      var r = scale * sh.s * 0.5;
      ctx.save();
      ctx.translate(cx + sh.dx * scale, cy + sh.dy * scale);
      ctx.rotate(sh.rot);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.55, -r * 0.1);
      ctx.lineTo(r * 0.35, r);
      ctx.lineTo(-r * 0.35, r);
      ctx.lineTo(-r * 0.55, -r * 0.1);
      ctx.closePath();
      ctx.fillStyle = shadeStyle(sh.shade, 1);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCoffeeTray(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = shadeStyle(COLORS.tray, 1);
    ctx.fillRect(-scale * 0.5, -scale * 0.06, scale, scale * 0.14);

    var cupW = scale * 0.26;
    var cupH = scale * 0.32;
    var xs = [-scale * 0.32, 0, scale * 0.32];
    for (var i = 0; i < xs.length; i++) {
      ctx.fillStyle = shadeStyle(COLORS.cup, 1);
      ctx.beginPath();
      ctx.moveTo(xs[i] - cupW * 0.4, -scale * 0.06);
      ctx.lineTo(xs[i] + cupW * 0.4, -scale * 0.06);
      ctx.lineTo(xs[i] + cupW * 0.28, -scale * 0.06 - cupH);
      ctx.lineTo(xs[i] - cupW * 0.28, -scale * 0.06 - cupH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shadeStyle(COLORS.coffee, 1);
      ctx.beginPath();
      ctx.ellipse(xs[i], -scale * 0.06 - cupH, cupW * 0.26, cupH * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWeapon() {
    // Minimal view-model: a stylized terminal-prompt "debug zapper"
    // docked at bottom-center, flashing on fire.
    var w = 90, h = 60;
    var cx = VIEW_W / 2;
    var by = VIEW_H;
    ctx.save();
    ctx.fillStyle = 'rgba(10,20,17,0.92)';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, by);
    ctx.lineTo(cx - w * 0.35, by - h);
    ctx.lineTo(cx + w * 0.35, by - h);
    ctx.lineTo(cx + w * 0.5, by);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = muzzleFlashTimer > 0 ? '#ffe27a' : '#00a86b';
    ctx.fillRect(cx - 6, by - h - 6, 12, 10);
    ctx.restore();

    if (muzzleFlashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(muzzleFlashTimer / 0.09, 0, 1) * 0.5;
      ctx.fillStyle = '#ffe27a';
      ctx.beginPath();
      ctx.arc(cx, by - h - 10, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCrosshair() {
    var cx = VIEW_W / 2, cy = VIEW_H / 2;
    ctx.save();
    var color = hitMarkerTimer > 0 ? '#ff5a3c' : (missFlashTimer > 0 ? '#eef4f2' : 'rgba(238,244,242,0.85)');
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    var r = hitMarkerTimer > 0 ? 12 : 8;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx - 3, cy);
    ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy - 3);
    ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + r);
    ctx.stroke();
    ctx.restore();
  }

  function drawMinimap() {
    var mmSize = 148;
    var margin = 10;
    var scale = mmSize / MAZE_W;
    var ox = VIEW_W - mmSize - margin;
    var oy = margin;

    ctx.save();
    ctx.fillStyle = 'rgba(4,16,13,0.72)';
    ctx.fillRect(ox - 4, oy - 4, mmSize + 8, mmSize + 8);

    for (var y = 0; y < MAZE_H; y++) {
      for (var x = 0; x < MAZE_W; x++) {
        if (MAZE[y][x] === 1) {
          ctx.fillStyle = 'rgba(165,172,175,0.35)';
          ctx.fillRect(ox + x * scale, oy + y * scale, scale + 0.5, scale + 0.5);
        }
      }
    }

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive) continue;
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath();
      ctx.arc(ox + e.x * scale, oy + e.y * scale, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(ox + player.x * scale, oy + player.y * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe27a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox + player.x * scale, oy + player.y * scale);
    ctx.lineTo(ox + player.x * scale + Math.cos(player.angle) * 8, oy + player.y * scale + Math.sin(player.angle) * 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawHUD() {
    var y0 = VIEW_H;
    ctx.fillStyle = '#04100d';
    ctx.fillRect(0, y0, VIEW_W, HUD_H);
    ctx.strokeStyle = 'rgba(165,172,175,0.4)';
    ctx.beginPath();
    ctx.moveTo(0, y0 + 0.5); ctx.lineTo(VIEW_W, y0 + 0.5);
    ctx.stroke();

    // Health bar
    var barX = 18, barY = y0 + 18, barW = 200, barH = 18;
    ctx.fillStyle = '#eef4f2';
    ctx.font = '12px monospace';
    ctx.fillText('HEALTH', barX, barY - 5);
    ctx.strokeStyle = '#A5ACAF';
    ctx.strokeRect(barX, barY, barW, barH);
    var hpFrac = player.health / HEALTH_MAX;
    ctx.fillStyle = hpFrac > 0.5 ? '#00a86b' : (hpFrac > 0.25 ? '#d4af37' : '#c1272d');
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpFrac, barH - 4);

    // Ammo / cooldown bar
    var barX2 = 18, barY2 = y0 + 56;
    ctx.fillStyle = '#eef4f2';
    ctx.fillText('ZAPPER', barX2, barY2 - 5);
    ctx.strokeStyle = '#A5ACAF';
    ctx.strokeRect(barX2, barY2, barW, barH);
    var readyFrac = 1 - (fireCooldown / FIRE_COOLDOWN);
    ctx.fillStyle = '#00a86b';
    ctx.fillRect(barX2 + 2, barY2 + 2, (barW - 4) * clamp(readyFrac, 0, 1), barH - 4);

    // Score
    ctx.fillStyle = '#eef4f2';
    ctx.font = '14px monospace';
    ctx.fillText('JOHNS STOPPED: ' + defeatedCount + ' / ' + enemies.length, 260, y0 + 32);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#b6c6c1';
    ctx.fillText('Arrows/WASD move + turn - Space zaps - Esc exits', 260, y0 + 54);

    if (gameState === 'won') {
      overlayBanner('BUILD CLEAN -- ALL JOHNS CLEARED', '#00a86b');
    } else if (gameState === 'lost') {
      overlayBanner('SYSTEM CRASHED', '#c1272d');
    }
  }

  function overlayBanner(text, color) {
    ctx.save();
    ctx.fillStyle = 'rgba(4,16,13,0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = color;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, VIEW_W / 2, VIEW_H / 2 - 10);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#eef4f2';
    ctx.fillText('Use the Restart button below to play again', VIEW_W / 2, VIEW_H / 2 + 20);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    renderScene();
    drawHUD();
  }

  // ---------------------------------------------------------------------
  // Game loop
  // ---------------------------------------------------------------------
  function loop(ts) {
    if (!modalActive) return;
    if (lastTs === null) lastTs = ts;
    var dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;
    update(dt);
    render();
    rafId = requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------------
  // Game reset / lifecycle
  // ---------------------------------------------------------------------
  function resetGame() {
    player.x = 1.5;
    player.y = 1.5;
    player.angle = Math.PI / 2; // faces south, down the long open corridor at column x=1
    player.health = HEALTH_MAX;

    enemies = ENEMY_SPAWNS.map(function (c) {
      return {
        x: c[0] + 0.5,
        y: c[1] + 0.5,
        alive: true,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderTimer: Math.random() * 2
      };
    });
    defeatedCount = 0;
    gameState = 'playing';
    fireCooldown = 0;
    muzzleFlashTimer = 0;
    hitMarkerTimer = 0;
    missFlashTimer = 0;
    keysDown = {};
    lastTs = null;
    lastWallDist = new Array(VIEW_W).fill(999);
  }

  function readThemeColor(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return (v && v.trim()) || fallback;
    } catch (err) {
      return fallback;
    }
  }

  function injectStyle() {
    // Re-read theme CSS vars every time the overlay opens (not just once) --
    // the site's Mike/Natasha persona toggle can flip the palette between
    // plays, and the HUD chrome should follow whichever theme is active now.
    var brand = readThemeColor('--brand', '#004C54');
    var pop = readThemeColor('--pop', '#00a86b');
    var ink = readThemeColor('--ink', '#eef4f2');
    var gold = readThemeColor('--gold', '#d4af37');
    var style = styleInjected;
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('data-wca-style', 'true');
      document.head.appendChild(style);
      styleInjected = style;
    }
    style.textContent =
      '.wca-overlay{position:fixed;inset:0;z-index:99999;background:rgba(2,8,6,0.92);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'font-family:' + '\'JetBrains Mono\', monospace' + ';color:' + ink + ';}' +
      '.wca-panel{display:flex;flex-direction:column;align-items:center;gap:10px;}' +
      '.wca-title{font-size:15px;letter-spacing:0.08em;text-transform:uppercase;color:' + gold + ';}' +
      '.wca-canvas{border:2px solid ' + brand + ';box-shadow:0 0 40px rgba(0,168,107,0.35);image-rendering:pixelated;background:#000;}' +
      '.wca-controls{display:flex;gap:14px;align-items:center;}' +
      '.wca-btn{cursor:pointer;border:1px solid ' + pop + ';background:rgba(0,168,107,0.12);color:' + ink + ';' +
      'font-family:inherit;font-size:13px;padding:8px 16px;border-radius:6px;letter-spacing:0.04em;}' +
      '.wca-btn:hover{background:rgba(0,168,107,0.28);}';
  }

  function openGame() {
    if (modalActive) return;
    injectStyle();
    modalActive = true;

    overlayEl = document.createElement('div');
    overlayEl.className = 'wca-overlay';

    var panel = document.createElement('div');
    panel.className = 'wca-panel';

    var title = document.createElement('div');
    title.className = 'wca-title';
    title.textContent = 'DEBUG RUN: SERVER CORRIDORS';
    panel.appendChild(title);

    canvasEl = document.createElement('canvas');
    canvasEl.width = CANVAS_W;
    canvasEl.height = CANVAS_H;
    canvasEl.className = 'wca-canvas';
    panel.appendChild(canvasEl);
    ctx = canvasEl.getContext('2d');

    var controls = document.createElement('div');
    controls.className = 'wca-controls';

    restartBtnEl = document.createElement('button');
    restartBtnEl.type = 'button';
    restartBtnEl.className = 'wca-btn';
    restartBtnEl.textContent = 'Restart';
    restartBtnEl.addEventListener('click', function () { resetGame(); });
    controls.appendChild(restartBtnEl);

    closeBtnEl = document.createElement('button');
    closeBtnEl.type = 'button';
    closeBtnEl.className = 'wca-btn';
    closeBtnEl.textContent = 'Close (Esc)';
    closeBtnEl.addEventListener('click', function () { closeGame(); });
    controls.appendChild(closeBtnEl);

    panel.appendChild(controls);
    overlayEl.appendChild(panel);
    document.body.appendChild(overlayEl);

    resetGame();
    rafId = requestAnimationFrame(loop);
  }

  function closeGame() {
    if (!modalActive) return;
    modalActive = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    keysDown = {};
    lastTs = null;
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
    }
    overlayEl = null;
    canvasEl = null;
    ctx = null;
  }

  // ---------------------------------------------------------------------
  // Single keydown listener: Konami detection when idle, game controls
  // when the overlay is open.
  // ---------------------------------------------------------------------
  var GAME_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '];

  document.addEventListener('keydown', function (e) {
    var key = e.key.toLowerCase();

    if (modalActive) {
      if (GAME_KEYS.indexOf(key) !== -1) e.preventDefault();
      if (key === 'escape') { closeGame(); return; }
      if (key === ' ') { fireIfReady(); return; }
      keysDown[key] = true;
      return;
    }

    var active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

    konamiBuffer.push(key);
    if (konamiBuffer.length > 10) konamiBuffer.shift();
    if (konamiBuffer.length === 10) {
      var match = true;
      for (var i = 0; i < 10; i++) {
        if (konamiBuffer[i] !== KONAMI_CODE[i]) { match = false; break; }
      }
      if (match) {
        konamiBuffer = [];
        openGame();
      }
    }
  });

  document.addEventListener('keyup', function (e) {
    if (!modalActive) return;
    keysDown[e.key.toLowerCase()] = false;
  });
})();
