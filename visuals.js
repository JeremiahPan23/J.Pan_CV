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

    // Dedicated hero artwork; the two research-card renderers stay unchanged.
    function heroArtwork(ctx, w, h, time) {
        const smooth = (a, b, value) => {
            const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
            return t * t * (3 - 2 * t);
        };
        const cx = w * .5 + pointer.x * 14;
        const cy = h * .46 + pointer.y * 10;
        const scale = Math.min(w / 7.3, h / 6.5);
        const yaw = -.2 + .045 * Math.sin(time * .18) + pointer.x * .07;
        const pitch = 1.02 + .035 * Math.sin(time * .16) + pointer.y * .04;
        const camera = point => {
            const rotated = rotate(point, yaw, pitch);
            const p = project(rotated, cx, cy, scale);
            return { x: p[0], y: p[1], size: p[2], depth: rotated[2] };
        };
        // A moving vortex and traveling phase modulation are illustrative only,
        // not a physical trajectory, equilibrated sample or research result.
        const coreX = .25 * Math.sin(time * .32);
        const coreZ = .18 * Math.cos(time * .27);
        const core = camera([coreX, 0, coreZ]);
        const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, Math.min(w, h) * .61);
        glow.addColorStop(0, 'rgba(72,188,207,.18)');
        glow.addColorStop(.55, 'rgba(144,194,219,.09)');
        glow.addColorStop(1, 'rgba(144,194,219,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

        const grid = [];
        for (let row = 0; row < 23; row++) {
            const cells = [];
            for (let col = 0; col < 23; col++) {
                const x = (col - 11) * .3, z = (row - 11) * .3;
                const p = camera([x, 0, z]);
                const fade = (1 - smooth(2.5, 3.35, Math.abs(x))) * (1 - smooth(2.5, 3.35, Math.abs(z)));
                const edge = smooth(0, 28, p.x) * smooth(0, 28, w - p.x) * smooth(0, 24, p.y) * smooth(0, 30, h - p.y);
                cells.push({ x, z, p, fade: fade * edge });
            }
            grid.push(cells);
        }
        grid.forEach((row, r) => row.forEach((cell, c) => {
            const stroke = other => line(ctx, [[cell.p.x, cell.p.y], [other.p.x, other.p.y]],
                `rgba(67,117,158,${.21 * Math.min(cell.fade, other.fade)})`, .75 * cell.p.size);
            if (c < 22) stroke(row[c + 1]);
            if (r < 22) stroke(grid[r + 1][c]);
        }));

        // Subtle concentric highlights move along the same XY plane as the spins.
        for (let ring = 0; ring < 3; ring++) {
            const phase = (time * .22 + ring / 3) % 1;
            const radius = .5 + phase * 2.3;
            const points = [];
            for (let i = 0; i <= 64; i++) {
                const theta = i / 64 * Math.PI * 2;
                const p = camera([coreX + Math.cos(theta) * radius, -.015, coreZ + Math.sin(theta) * radius]);
                points.push([p.x, p.y]);
            }
            line(ctx, points, `rgba(35,159,186,${.06 * Math.sin(phase * Math.PI)})`, 1.1);
        }

        grid.flat().sort((a, b) => b.p.depth - a.p.depth).forEach(({ x, z, p, fade }) => {
            if (fade < .01) return;
            const dx = x - coreX, dz = z - coreZ;
            const radius = Math.hypot(dx, dz);
            const wave = Math.sin(radius * 2.2 - time * 1.4);
            const angle = Math.atan2(dz, dx) + Math.PI / 2 + time * .52
                + .34 * wave + .14 * Math.sin(x * .8 + z * .6 + time * .8);
            const half = .12 + .009 * Math.sin(radius * 1.5 - time * 1.2);
            const a = camera([x - Math.cos(angle) * half, -.025, z - Math.sin(angle) * half]);
            const b = camera([x + Math.cos(angle) * half, -.025, z + Math.sin(angle) * half]);
            const vx = b.x - a.x, vy = b.y - a.y;
            const length = Math.hypot(vx, vy) || 1;
            const ux = vx / length, uy = vy / length;
            const head = Math.min(length * .4, 6.2 * p.size);
            const focus = .76 + .24 * smooth(-1, 1, p.size - 1);
            const alpha = fade * focus * (.82 + .12 * wave);
            const color = `rgba(26,${Math.round(128 + wave * 14)},${Math.round(173 + wave * 11)},${alpha})`;

            ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(64,128,163,${fade * .32})`; ctx.fill();
            ctx.shadowColor = `rgba(53,182,210,${fade * .28})`; ctx.shadowBlur = 3 * p.size;
            line(ctx, [[a.x, a.y], [b.x - ux * head * .5, b.y - uy * head * .5]], color, 2.05 * p.size);
            ctx.beginPath(); ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x - ux * head - uy * head * .5, b.y - uy * head + ux * head * .5);
            ctx.lineTo(b.x - ux * head + uy * head * .5, b.y - uy * head - ux * head * .5);
            ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
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
