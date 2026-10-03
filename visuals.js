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
    for (const x of [.6, 1.8, 3]) for (const z of [-1.6, 0, 1.6]) heroCells.push([x, -.55, z]);
    const octahedron = [[.55, 0, 0], [-.55, 0, 0], [0, .55, 0], [0, -.55, 0], [0, 0, .55], [0, 0, -.55]];
    const octahedronFaces = [[0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]];

    function heroArtwork(ctx, w, h, time) {
        // One camera, one connected lattice, one depth order. Both motifs occupy
        // the same conceptual space; this is artwork, not an XY-to-crystal model.
        const scale = Math.min(w / 8.8, h / 5.4);
        const cx = w * .49 + pointer.x * 9;
        const cy = h * .53 + pointer.y * 6;
        const yaw = -.34 + .025 * Math.sin(time * .045) + pointer.x * .055;
        const pitch = .82 + pointer.y * .035;
        const camera = point => {
            const p = rotate(point, yaw, pitch);
            const q = project(p, cx, cy, scale);
            return { x: q[0], y: q[1], size: q[2], depth: p[2] };
        };
        const smooth = (lo, hi, value) => {
            const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
            return t * t * (3 - 2 * t);
        };
        const primitives = [];
        const addLine = (a, b, color, alpha, width = .8) => {
            primitives.push({ kind: 'line', a, b, color, alpha, width, depth: (a.depth + b.depth) / 2 });
        };
        const addNode = (p, alpha, radius = 1.8, crystalNode = false) => {
            primitives.push({ kind: 'node', p, alpha, radius, crystalNode, depth: p.depth });
        };
        const glow = ctx.createRadialGradient(w * .54, h * .48, 0, w * .54, h * .48, w * .52);
        glow.addColorStop(0, 'rgba(125,192,211,.17)');
        glow.addColorStop(.55, 'rgba(181,215,226,.075)');
        glow.addColorStop(1, 'rgba(181,215,226,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

        const grid = [];
        for (let row = 0; row < 15; row++) {
            const cells = [];
            for (let col = 0; col < 20; col++) {
                const x = (col - 9.5) * .4;
                const z = (row - 7) * .4;
                // Feather the outside of a continuous lattice rather than drawing a panel.
                const alpha = (1 - smooth(2.5, 3.9, Math.abs(x))) * (1 - smooth(1.7, 2.9, Math.abs(z)));
                cells.push({ x, z, p: camera([x, 0, z]), alpha });
            }
            grid.push(cells);
        }
        grid.forEach((row, r) => row.forEach((cell, c) => {
            if (c + 1 < row.length) addLine(cell.p, row[c + 1].p, '72,123,159', .24 * Math.min(cell.alpha, row[c + 1].alpha));
            if (r + 1 < grid.length) addLine(cell.p, grid[r + 1][c].p, '72,123,159', .24 * Math.min(cell.alpha, grid[r + 1][c].alpha));
            addNode(cell.p, cell.alpha * .39, 1.8);
            const spinWeight = (1 - smooth(-.2, 1.7, cell.x)) * cell.alpha;
            if (spinWeight < .015) return;
            // A slowly turning vortex; the diminishing arrows share crystal anchor sites.
            const angle = Math.atan2(cell.z - .15, cell.x + 1.25) + Math.PI / 2 + time * .16 + .15 * Math.sin(time * .4 + cell.x - cell.z);
            const half = .145;
            const a = camera([cell.x - Math.cos(angle) * half, -.025, cell.z - Math.sin(angle) * half]);
            const b = camera([cell.x + Math.cos(angle) * half, -.025, cell.z + Math.sin(angle) * half]);
            primitives.push({ kind: 'arrow', a, b, alpha: .86 * spinWeight, depth: cell.p.depth });
        }));

        const centers = heroCells.map(cell => camera(cell));
        heroCells.forEach((cell, i) => {
            // The lower vertex sits on the exact same ground lattice as the spins.
            const localYaw = .18 * Math.sin(time * .12 + cell[2] * .25);
            const rotated = octahedron.map(vertex => rotate(vertex, localYaw, 0).map((v, axis) => v + cell[axis]));
            const points = rotated.map(camera);
            const fade = .86 - .09 * cell[2];
            octahedronFaces.forEach((face, j) => primitives.push({
                kind: 'face', points: face.map(k => points[k]), alpha: (.10 + (j % 3) * .026) * fade,
                depth: face.reduce((sum, k) => sum + points[k].depth, 0) / 3
            }));
            for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) {
                if (Math.floor(a / 2) !== Math.floor(b / 2)) addLine(points[a], points[b], '46,111,172', .64 * fade, 1.05);
            }
            points.forEach(p => addNode(p, fade, 2.3, true));
            addNode(centers[i], .73, 2.5, true);
            heroCells.forEach((other, j) => {
                if (j <= i) return;
                const d = cell.reduce((sum, v, axis) => sum + Math.abs(v - other[axis]), 0);
                if (d < 1.65) addLine(centers[i], centers[j], '60,120,165', .34, .85);
            });
        });

        // Shared painter's order keeps crystal edges, lattice and arrows interleaved in depth.
        primitives.sort((a, b) => b.depth - a.depth);
        primitives.forEach(item => {
            const focus = 1 - .25 * smooth(1, 3, item.depth);
            if (item.kind === 'line') {
                line(ctx, [[item.a.x, item.a.y], [item.b.x, item.b.y]], `rgba(${item.color},${item.alpha * focus})`, item.width * item.a.size);
            } else if (item.kind === 'face') {
                ctx.beginPath(); item.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
                ctx.closePath(); ctx.fillStyle = `rgba(79,151,206,${item.alpha * focus})`; ctx.fill();
            } else if (item.kind === 'arrow') {
                const { a, b } = item;
                const dx = b.x - a.x, dy = b.y - a.y;
                const length = Math.hypot(dx, dy) || 1;
                const ux = dx / length, uy = dy / length;
                const head = Math.min(length * .43, 5.4 * a.size);
                const color = `rgba(20,126,160,${item.alpha * focus})`;
                ctx.shadowColor = `rgba(70,185,213,${item.alpha * .25})`; ctx.shadowBlur = 3;
                line(ctx, [[a.x, a.y], [b.x - ux * head * .55, b.y - uy * head * .55]], color, 1.8 * a.size);
                ctx.beginPath(); ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - ux * head - uy * head * .5, b.y - uy * head + ux * head * .5);
                ctx.lineTo(b.x - ux * head + uy * head * .5, b.y - uy * head - ux * head * .5);
                ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
            } else {
                const { p } = item;
                const radius = item.radius * p.size;
                if (item.crystalNode) {
                    const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4);
                    halo.addColorStop(0, `rgba(77,164,210,${item.alpha * .34})`);
                    halo.addColorStop(1, 'rgba(77,164,210,0)');
                    ctx.fillStyle = halo; ctx.fillRect(p.x - radius * 4, p.y - radius * 4, radius * 8, radius * 8);
                }
                ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = item.crystalNode ? `rgba(216,239,249,${item.alpha})` : `rgba(83,143,172,${item.alpha * focus})`; ctx.fill();
                if (item.crystalNode) { ctx.strokeStyle = `rgba(40,109,159,${item.alpha * .85})`; ctx.lineWidth = .8; ctx.stroke(); }
            }
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
