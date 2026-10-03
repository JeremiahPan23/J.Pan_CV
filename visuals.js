/** Conceptual scientific artwork, not experimental data or a physical simulation.
 * Canvas2D keeps the scene self-contained; no downloaded model or graphics library.
 */
(function () {
    'use strict';
    const canvases = Array.from(document.querySelectorAll('.science-canvas'));
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const button = document.querySelector('.motion-toggle');
    let userPaused = false;
    let animationId = 0;
    let lastTick = 0;
    let sceneTime = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const scenes = canvases.map(canvas => ({ canvas, ctx: canvas.getContext('2d'), visible: false, width: 0, height: 0, frame: 0 }));
    const isPaused = () => userPaused || reduceMotion.matches;

    function rotate(point, yaw, pitch) {
        const x = point[0] * Math.cos(yaw) + point[2] * Math.sin(yaw);
        const z = -point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
        return [x, point[1] * Math.cos(pitch) - z * Math.sin(pitch), point[1] * Math.sin(pitch) + z * Math.cos(pitch)];
    }
    function project(point, cx, cy, scale) {
        const depth = 1 / (1 + point[2] * .1);
        return [cx + point[0] * scale * depth, cy + point[1] * scale * depth, depth];
    }
    function line(ctx, points, color, width = .6) {
        ctx.beginPath();
        points.forEach((point, index) => index ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1]));
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    function ribbon(ctx, w, h, time) {
        const shiftX = pointer.x * 7;
        const shiftY = pointer.y * 5;
        for (let strand = 0; strand < 30; strand++) {
            const v = strand / 29 - .5;
            const points = [];
            for (let index = 0; index <= 65; index++) {
                const u = index / 65;
                const wave = Math.sin(u * Math.PI * 2.2 + time * .075);
                const twist = Math.cos(u * Math.PI * 2.2 + time * .075);
                const x = w * (.01 + u * .98) + v * 32 * twist;
                const y = h * (.48 + wave * .17) + v * h * (.1 + .23 * Math.sin(u * Math.PI));
                points.push([x + shiftX, y + shiftY]);
            }
            line(ctx, points, `rgba(84,100,88,${.07 + .13 * (1 - Math.abs(v) * 2)})`, .6);
        }
    }

    function spinField(ctx, w, h, time, hero) {
        const cx = w * (hero ? .34 : .5) + pointer.x * (hero ? 6 : 3);
        const cy = h * (hero ? .77 : .49) + pointer.y * 4;
        const scale = Math.min(w, h) * (hero ? .135 : .245);
        const n = hero ? 10 : 14;
        const yaw = -.14;
        const pitch = hero ? .9 : .65;
        const grid = [];
        for (let row = 0; row < n; row++) {
            const cells = [];
            for (let col = 0; col < n; col++) {
                const x = (col / (n - 1) - .5) * 3.6;
                const z = (row / (n - 1) - .5) * 3.6;
                const base = Math.atan2(z, x);
                // Each spin turns in its lattice plane, with a gentle local phase variation.
                const angle = base + time * .38 + .35 * Math.sin(time * .65 + x * .8 - z * .5);
                const p = project(rotate([x, 0, z], yaw, pitch), cx, cy, scale);
                const len = hero ? .13 : .10;
                const end = project(rotate([x + Math.cos(angle) * len, 0, z + Math.sin(angle) * len], yaw, pitch), cx, cy, scale);
                const dx = end[0] - p[0], dy = end[1] - p[1];
                const norm = Math.hypot(dx, dy) || 1;
                const ux = dx / norm, uy = dy / norm;
                const start = [p[0] - dx, p[1] - dy];
                line(ctx, [start, end], hero ? 'rgba(67,111,103,.70)' : 'rgba(46,86,79,.74)', hero ? .8 : 1);
                const head = hero ? 2.8 : 3;
                line(ctx, [[end[0] - ux * head - uy * head * .5, end[1] - uy * head + ux * head * .5], end, [end[0] - ux * head + uy * head * .5, end[1] - uy * head - ux * head * .5]], 'rgba(50,89,79,.6)', .7);
                cells.push(p);
            }
            grid.push(cells);
        }
        grid.forEach(row => line(ctx, row, 'rgba(64,92,81,.06)', .5));
        for (let col = 0; col < n; col++) line(ctx, grid.map(row => row[col]), 'rgba(64,92,81,.06)', .5);
    }

    function crystal(ctx, w, h, time, hero) {
        const cx = w * (hero ? .75 : .5) + pointer.x * (hero ? 10 : 4);
        const cy = h * (hero ? .27 : .46) + pointer.y * 7;
        const scale = Math.min(w, h) * (hero ? .11 : .20);
        const nodes = [];
        for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) nodes.push([x, y, z]);
        const rotated = nodes.map(node => rotate(node, .65 + time * .075 + pointer.x * .055, -.4 + .1 * Math.sin(time * .05) + pointer.y * .04));
        const points = rotated.map(node => project(node, cx, cy, scale));
        nodes.forEach((node, a) => {
            for (let b = a + 1; b < nodes.length; b++) {
                const distance = node.reduce((sum, value, axis) => sum + Math.abs(value - nodes[b][axis]), 0);
                if (distance === 1) line(ctx, [points[a], points[b]], 'rgba(70,93,82,.24)', .8);
            }
        });
        [0, 2, 6, 8, 18, 20, 24, 26].forEach(index => line(ctx, [points[13], points[index]], 'rgba(72,107,99,.09)', .55));
        const drawOrder = rotated.map((node, index) => ({ index, depth: node[2] })).sort((a, b) => b.depth - a.depth);
        drawOrder.forEach(({ index }) => {
            const p = points[index];
            const size = (index === 13 ? 5 : 2.6) * p[2];
            const gradient = ctx.createRadialGradient(p[0] - size * .3, p[1] - size * .4, 0, p[0], p[1], size);
            gradient.addColorStop(0, '#fbfcfa');
            gradient.addColorStop(.3, index === 13 ? '#a5c3b8' : '#aab5a9');
            gradient.addColorStop(1, index === 13 ? '#486d64' : '#697b6a');
            ctx.beginPath(); ctx.arc(p[0], p[1], size, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
        });
        ctx.beginPath(); ctx.ellipse(cx, cy + scale * 2.05, scale * 1.25, scale * .13, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56,79,64,.025)'; ctx.fill();
    }

    // The hero has its own artwork; the two research-card renderers stay unchanged.
    const heroCells = [];
    for (const x of [-.65, .65]) for (const y of [-1.25, 0, 1.25]) for (const z of [-.65, .65]) heroCells.push([x, y, z]);
    const octahedron = [[.43, 0, 0], [-.43, 0, 0], [0, .43, 0], [0, -.43, 0], [0, 0, .43], [0, 0, -.43]];
    const octahedronFaces = [[0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]];

    function heroArtwork(ctx, w, h, time) {
        const glow = ctx.createRadialGradient(w * .66, h * .39, 0, w * .58, h * .45, w * .57);
        glow.addColorStop(0, 'rgba(96,186,214,.14)');
        glow.addColorStop(.58, 'rgba(158,211,220,.06)');
        glow.addColorStop(1, 'rgba(158,211,220,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

        // Deterministic ambient points give depth without distracting flashes.
        for (let i = 0; i < 48; i++) {
            const x = w * (.08 + ((i * 37) % 89) / 100) + Math.sin(time * .12 + i) * 4 + pointer.x * 5;
            const y = h * (.09 + ((i * 23) % 77) / 100) + Math.cos(time * .1 + i) * 4 + pointer.y * 4;
            const alpha = .09 + .1 * (.5 + .5 * Math.sin(time * .45 + i));
            ctx.beginPath(); ctx.arc(x, y, i % 5 ? 1.1 : 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(48,129,159,${alpha})`; ctx.fill();
        }

        const spinCx = w * .40 + pointer.x * 13;
        const spinCy = h * .60 + pointer.y * 9;
        const spinScale = Math.min(w * .155, h * .19);
        const grid = [];
        const spinYaw = -.2 + pointer.x * .025;
        const spinPitch = .88 + pointer.y * .02;
        for (let row = 0; row < 13; row++) {
            const cells = [];
            for (let col = 0; col < 13; col++) {
                const x = (col / 12 - .5) * 4;
                const z = (row / 12 - .5) * 4;
                cells.push({ x, z, p: project(rotate([x, 0, z], spinYaw, spinPitch), spinCx, spinCy, spinScale) });
            }
            grid.push(cells);
        }
        grid.forEach(row => line(ctx, row.map(cell => cell.p), 'rgba(56,115,144,.16)', .8));
        for (let col = 0; col < 13; col++) line(ctx, grid.map(row => row[col].p), 'rgba(56,115,144,.16)', .8);
        grid.flat().forEach(({ x, z, p }) => {
            ctx.beginPath(); ctx.arc(p[0], p[1], 1.9 * p[2], 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(74,130,151,.36)'; ctx.fill();
            const angle = Math.atan2(z, x) + time * .32 + .28 * Math.sin(time * .55 + x * .7 - z * .5);
            const end = project(rotate([x + Math.cos(angle) * .145, 0, z + Math.sin(angle) * .145], spinYaw, spinPitch), spinCx, spinCy, spinScale);
            const dx = end[0] - p[0], dy = end[1] - p[1];
            const length = Math.hypot(dx, dy) || 1;
            const ux = dx / length, uy = dy / length;
            const head = 5.5 * p[2];
            const opacity = Math.min(.94, .62 + p[2] * .18);
            const color = `rgba(25,119,153,${opacity})`;
            line(ctx, [[p[0] - dx * .72, p[1] - dy * .72], end], color, 1.8 * p[2]);
            ctx.beginPath(); ctx.moveTo(end[0], end[1]);
            ctx.lineTo(end[0] - ux * head - uy * head * .55, end[1] - uy * head + ux * head * .55);
            ctx.lineTo(end[0] - ux * head + uy * head * .55, end[1] - uy * head - ux * head * .55);
            ctx.closePath(); ctx.fillStyle = color; ctx.fill();
        });

        const crystalCx = w * .70 + pointer.x * 14;
        const crystalCy = h * .40 + pointer.y * 12;
        const crystalScale = Math.min(w * .165, h * .19);
        const yaw = .6 + time * .09 + pointer.x * .07;
        const pitch = -.3 + .07 * Math.sin(time * .09) + pointer.y * .045;
        const centers = heroCells.map(cell => project(rotate(cell, yaw, pitch), crystalCx, crystalCy, crystalScale));
        heroCells.forEach((cell, a) => {
            for (let b = a + 1; b < heroCells.length; b++) {
                const distance = cell.reduce((sum, value, axis) => sum + Math.abs(value - heroCells[b][axis]), 0);
                if (distance <= 1.31) line(ctx, [centers[a], centers[b]], 'rgba(42,109,156,.32)', .85);
            }
        });
        const orderedCells = heroCells.map((cell, index) => ({ cell, index, depth: rotate(cell, yaw, pitch)[2] })).sort((a, b) => b.depth - a.depth);
        orderedCells.forEach(({ cell, index }) => {
            const rotated = octahedron.map(vertex => rotate(vertex.map((value, axis) => value + cell[axis]), yaw, pitch));
            const points = rotated.map(vertex => project(vertex, crystalCx, crystalCy, crystalScale));
            const faces = octahedronFaces.slice().sort((a, b) => b.reduce((sum, i) => sum + rotated[i][2], 0) - a.reduce((sum, i) => sum + rotated[i][2], 0));
            faces.forEach((face, faceIndex) => {
                ctx.beginPath(); face.forEach((i, j) => j ? ctx.lineTo(points[i][0], points[i][1]) : ctx.moveTo(points[i][0], points[i][1]));
                ctx.closePath(); ctx.fillStyle = `rgba(60,143,191,${.045 + (faceIndex % 3) * .023})`; ctx.fill();
            });
            for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) {
                if (Math.floor(a / 2) !== Math.floor(b / 2)) line(ctx, [points[a], points[b]], 'rgba(39,107,158,.48)', 1);
            }
            points.forEach(p => {
                const radius = 2.5 * p[2];
                const halo = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], radius * 3.6);
                halo.addColorStop(0, 'rgba(65,170,207,.35)'); halo.addColorStop(1, 'rgba(65,170,207,0)');
                ctx.fillStyle = halo; ctx.fillRect(p[0] - radius * 3.6, p[1] - radius * 3.6, radius * 7.2, radius * 7.2);
                ctx.beginPath(); ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
                ctx.fillStyle = '#d6eef2'; ctx.fill(); ctx.strokeStyle = 'rgba(41,116,156,.75)'; ctx.lineWidth = .9; ctx.stroke();
            });
            const center = centers[index];
            ctx.beginPath(); ctx.arc(center[0], center[1], 2 * center[2], 0, Math.PI * 2);
            ctx.fillStyle = '#378fa8'; ctx.fill();
        });
    }

    function render(scene) {
        const { ctx, width: w, height: h, canvas } = scene;
        if (!ctx || !w || !h) return;
        const dpr = canvas.width / w;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const hero = canvas.dataset.scene === 'hero';
        if (hero) heroArtwork(ctx, w, h, sceneTime);
        else if (canvas.dataset.scene === 'spin') spinField(ctx, w, h, sceneTime, false);
        else crystal(ctx, w, h, sceneTime, false);
        canvas.dataset.renderFrame = String(++scene.frame);
        canvas.dataset.motionState = isPaused() ? 'paused' : 'running';
        canvas.dataset.parallax = `${pointer.x.toFixed(3)},${pointer.y.toFixed(3)}`;
    }
    function resize(scene) {
        const box = scene.canvas.getBoundingClientRect();
        if (!box.width || !box.height) return;
        scene.width = box.width; scene.height = box.height;
        const dpr = Math.min(devicePixelRatio || 1, innerWidth < 600 ? 1.5 : 2);
        scene.canvas.width = Math.round(box.width * dpr);
        scene.canvas.height = Math.round(box.height * dpr);
        render(scene);
    }
    function tick(now) {
        animationId = 0;
        if (isPaused() || document.hidden || !scenes.some(scene => scene.visible)) { lastTick = 0; return; }
        if (!lastTick) lastTick = now;
        if (now - lastTick >= 1000 / 30) {
            sceneTime += Math.min((now - lastTick) / 1000, .1);
            lastTick = now;
            pointer.x += (pointer.targetX - pointer.x) * .08;
            pointer.y += (pointer.targetY - pointer.y) * .08;
            scenes.filter(scene => scene.visible).forEach(render);
        }
        animationId = requestAnimationFrame(tick);
    }
    function schedule() {
        if (animationId || isPaused() || document.hidden || !scenes.some(scene => scene.visible)) return;
        lastTick = 0;
        animationId = requestAnimationFrame(tick);
    }
    function refreshControls() {
        const paused = isPaused();
        const chinese = document.documentElement.lang === 'zh-Hans';
        button.textContent = paused ? (chinese ? '继续动画' : 'Resume motion') : (chinese ? '暂停动画' : 'Pause motion');
        button.setAttribute('aria-pressed', String(paused));
        button.disabled = reduceMotion.matches;
        button.title = reduceMotion.matches ? (chinese ? '已遵循系统的减少动态效果设置' : 'Your reduced-motion preference is active') : '';
        scenes.forEach(render);
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const scene = scenes.find(item => item.canvas === entry.target);
            scene.visible = entry.isIntersecting;
            if (scene.visible) resize(scene);
        });
        schedule();
    });
    const resizer = new ResizeObserver(entries => {
        entries.forEach(entry => resize(scenes.find(scene => scene.canvas === entry.target)));
        schedule();
    });
    scenes.forEach(scene => { observer.observe(scene.canvas); resizer.observe(scene.canvas); resize(scene); });
    document.querySelector('.hero-visual').addEventListener('pointermove', event => {
        if (!finePointer.matches || isPaused()) return;
        const box = event.currentTarget.getBoundingClientRect();
        pointer.targetX = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
        pointer.targetY = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    });
    document.querySelector('.hero-visual').addEventListener('pointerleave', () => { pointer.targetX = 0; pointer.targetY = 0; });
    button.addEventListener('click', () => { userPaused = !userPaused; refreshControls(); schedule(); });
    reduceMotion.addEventListener('change', () => { pointer.x = pointer.y = pointer.targetX = pointer.targetY = 0; refreshControls(); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('portfolio:language', refreshControls);
    document.addEventListener('portfolio:panel-change', () => { scenes.forEach(resize); schedule(); });
    refreshControls();
})();
