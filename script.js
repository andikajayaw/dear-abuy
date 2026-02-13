/**
 * Valentine Website — Main Script
 * Three.js 3D floating hearts + premium GSAP animations
 */

/* ═══════════════════════════════════════
   3D BACKGROUND — Floating Hearts
   ═══════════════════════════════════════ */
class Hearts3DBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.mouse = { x: 0, y: 0 };
        this.hearts = [];
        this.clock = new THREE.Clock();

        this._setup();
        this._createHearts();
        this._animate();

        window.addEventListener('resize', () => this._resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    _setup() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        this.camera.position.set(0, 0, 8);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        this.scene.add(new THREE.AmbientLight(0xfff0f5, 0.8));
        const light1 = new THREE.PointLight(0xff69b4, 1.5, 50);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);
        const light2 = new THREE.PointLight(0xffb6c1, 1.0, 50);
        light2.position.set(-5, -3, 3);
        this.scene.add(light2);
    }

    _createHeartShape() {
        const shape = new THREE.Shape();
        const x = 0, y = 0;
        shape.moveTo(x, y + 0.35);
        shape.bezierCurveTo(x, y + 0.35, x - 0.05, y + 0.25, x - 0.25, y + 0.25);
        shape.bezierCurveTo(x - 0.55, y + 0.25, x - 0.55, y + 0.525, x - 0.55, y + 0.525);
        shape.bezierCurveTo(x - 0.55, y + 0.65, x - 0.475, y + 0.775, x - 0.25, y + 0.85);
        shape.bezierCurveTo(x - 0.1, y + 0.9, x, y + 1.0, x, y + 1.0);
        shape.bezierCurveTo(x, y + 1.0, x + 0.1, y + 0.9, x + 0.25, y + 0.85);
        shape.bezierCurveTo(x + 0.475, y + 0.775, x + 0.55, y + 0.65, x + 0.55, y + 0.525);
        shape.bezierCurveTo(x + 0.55, y + 0.525, x + 0.55, y + 0.25, x + 0.25, y + 0.25);
        shape.bezierCurveTo(x + 0.05, y + 0.25, x, y + 0.35, x, y + 0.35);
        return shape;
    }

    _createHearts() {
        const shape = this._createHeartShape();
        const extrudeSettings = {
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.04,
            bevelSegments: 3
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        const colors = [0xff69b4, 0xffb6c1, 0xff1493, 0xffc0cb, 0xe8507a, 0xf5a0c0];

        for (let i = 0; i < 25; i++) {
            const mat = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                shininess: 80,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.5,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, mat);

            // Random placement
            const scale = 0.2 + Math.random() * 0.6;
            mesh.scale.set(scale, scale, scale);
            mesh.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 8
            );
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.scene.add(mesh);
            this.hearts.push({
                mesh,
                speed: 0.2 + Math.random() * 0.5,
                rotSpeed: (Math.random() - 0.5) * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: mesh.position.y
            });
        }
    }

    _resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    _animate() {
        requestAnimationFrame(() => this._animate());

        const t = this.clock.getElapsedTime();

        // Animate each heart
        for (const h of this.hearts) {
            h.mesh.rotation.y += h.rotSpeed;
            h.mesh.rotation.z += h.rotSpeed * 0.5;
            h.mesh.position.y = h.baseY + Math.sin(t * h.speed + h.floatOffset) * 0.5;
        }

        // Mouse-reactive camera
        this.camera.position.x += (this.mouse.x * 1.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 1.0 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}


/* ═══════════════════════════════════════
   3D PHOTO CUBE
   ═══════════════════════════════════════ */
class PhotoCube3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.isDragging = false;
        this.prevMouse = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.autoRotateSpeed = 0.003;
        this.damping = 0.95;
        this.clock = new THREE.Clock();

        this._setup();
        this._buildCube();
        this._addListeners();
        this._animate();
    }

    _setup() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height) || 320;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        this.camera.position.set(0, 0.3, 3.8);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // Lighting
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const key = new THREE.DirectionalLight(0xffffff, 1.0);
        key.position.set(3, 4, 5);
        key.castShadow = true;
        this.scene.add(key);

        const pink = new THREE.PointLight(0xff69b4, 0.8, 20);
        pink.position.set(-3, 2, 3);
        this.scene.add(pink);

        const warm = new THREE.PointLight(0xffb6c1, 0.5, 15);
        warm.position.set(2, -2, 2);
        this.scene.add(warm);
    }

    _makeCanvasTexture(drawFn, bgColor) {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 512, 512);

        drawFn(ctx);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
    }

    _buildCube() {
        // Face 1: "I ❤️ Abuy"
        const face1 = this._makeCanvasTexture((ctx) => {
            const grd = ctx.createLinearGradient(0, 0, 512, 512);
            grd.addColorStop(0, '#ff69b4');
            grd.addColorStop(1, '#ff1493');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 72px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('I', 256, 160);
            ctx.font = '120px serif';
            ctx.fillText('❤️', 256, 290);
            ctx.font = 'bold 72px Fredoka, sans-serif';
            ctx.fillText('Abuy', 256, 410);
        }, '#ff69b4');

        // Face 2: Hearts pattern
        const face2 = this._makeCanvasTexture((ctx) => {
            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            const hearts = ['💖', '💕', '❤️', '💗', '💝', '💘'];
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 6; col++) {
                    ctx.fillText(hearts[(row + col) % hearts.length], 50 + col * 85, 65 + row * 85);
                }
            }
        }, '#fff0f5');

        // Face 3: "Happy Valentine's Day"
        const face3 = this._makeCanvasTexture((ctx) => {
            const grd = ctx.createLinearGradient(0, 0, 0, 512);
            grd.addColorStop(0, '#ffd6e0');
            grd.addColorStop(1, '#ffb6c1');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#d63384';
            ctx.font = 'bold 48px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Happy', 256, 170);
            ctx.fillText("Valentine's", 256, 240);
            ctx.fillText('Day', 256, 310);
            ctx.font = '80px serif';
            ctx.fillText('🌹', 256, 420);
        }, '#ffd6e0');

        // Face 4: Flower pattern
        const face4 = this._makeCanvasTexture((ctx) => {
            ctx.font = '55px serif';
            ctx.textAlign = 'center';
            const flowers = ['🌸', '🌺', '🌷', '🌼', '🌻', '💐'];
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 6; col++) {
                    ctx.fillText(flowers[(row * 3 + col) % flowers.length], 50 + col * 85, 65 + row * 85);
                }
            }
        }, '#fff5f8');

        // Face 5: Stars & sparkles
        const face5 = this._makeCanvasTexture((ctx) => {
            const grd = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
            grd.addColorStop(0, '#ffe6f0');
            grd.addColorStop(1, '#ffcce0');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 512, 512);
            ctx.font = '50px serif';
            ctx.textAlign = 'center';
            const items = ['✨', '⭐', '💫', '🌟', '✨', '💖'];
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 6; col++) {
                    ctx.fillText(items[(row + col * 2) % items.length], 50 + col * 85, 65 + row * 85);
                }
            }
        }, '#ffe6f0');

        // Face 6: "For My Beautiful Wife"
        const face6 = this._makeCanvasTexture((ctx) => {
            const grd = ctx.createLinearGradient(0, 0, 512, 512);
            grd.addColorStop(0, '#e8507a');
            grd.addColorStop(1, '#f5a0c0');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 50px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('For My', 256, 180);
            ctx.fillText('Beautiful', 256, 250);
            ctx.fillText('Wife', 256, 320);
            ctx.font = '60px serif';
            ctx.fillText('💐🌷💐', 256, 420);
        }, '#e8507a');

        // Build cube
        const cubeSize = 1.4;
        const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, 4, 4, 4);

        // Materials: [right, left, top, bottom, front, back]
        const materials = [
            new THREE.MeshPhongMaterial({ map: face2, shininess: 40 }),  // right: hearts
            new THREE.MeshPhongMaterial({ map: face4, shininess: 40 }),  // left: flowers
            new THREE.MeshPhongMaterial({ map: face5, shininess: 40 }),  // top: stars
            new THREE.MeshPhongMaterial({ map: face3, shininess: 40 }),  // bottom: valentine
            new THREE.MeshPhongMaterial({ map: face6, shininess: 50 }),  // front: for my wife
            new THREE.MeshPhongMaterial({ map: face1, shininess: 50 }),  // back: I ❤️ Abuy
        ];

        this.cube = new THREE.Mesh(geo, materials);
        this.cube.castShadow = true;
        this.scene.add(this.cube);

        // Rounded edge wireframe glow
        const edges = new THREE.EdgesGeometry(geo, 15);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.3 })
        );
        this.cube.add(line);

        // Floating particles around cube
        this.particles = [];
        const particleGeo = new THREE.SphereGeometry(0.02, 6, 6);
        for (let i = 0; i < 15; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: [0xff69b4, 0xffb6c1, 0xffffff][Math.floor(Math.random() * 3)],
                transparent: true,
                opacity: 0.5
            });
            const p = new THREE.Mesh(particleGeo, mat);
            const angle = Math.random() * Math.PI * 2;
            const r = 1.0 + Math.random() * 0.5;
            p.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 2, Math.sin(angle) * r);
            this.scene.add(p);
            this.particles.push({ mesh: p, angle, radius: r, speed: 0.2 + Math.random() * 0.4, yBase: p.position.y });
        }
    }

    _addListeners() {
        const el = this.canvas;

        // Mouse
        el.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.prevMouse = { x: e.clientX, y: e.clientY };
            this.autoRotateSpeed = 0;
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.prevMouse.x;
            const dy = e.clientY - this.prevMouse.y;
            this.velocity.x = dy * 0.008;
            this.velocity.y = dx * 0.008;
            this.prevMouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            // Resume auto-rotate after a bit
            setTimeout(() => { this.autoRotateSpeed = 0.003; }, 2000);
        });

        // Touch
        el.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            const t = e.touches[0];
            this.prevMouse = { x: t.clientX, y: t.clientY };
            this.autoRotateSpeed = 0;
        });
        el.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const t = e.touches[0];
            const dx = t.clientX - this.prevMouse.x;
            const dy = t.clientY - this.prevMouse.y;
            this.velocity.x = dy * 0.008;
            this.velocity.y = dx * 0.008;
            this.prevMouse = { x: t.clientX, y: t.clientY };
        }, { passive: false });
        el.addEventListener('touchend', () => {
            this.isDragging = false;
            setTimeout(() => { this.autoRotateSpeed = 0.003; }, 2000);
        });

        // Resize
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height) || 320;
        this.renderer.setSize(size, size);
    }

    _animate() {
        requestAnimationFrame(() => this._animate());

        if (!this.cube) return;
        const t = this.clock.getElapsedTime();

        // Auto-rotate
        this.cube.rotation.y += this.autoRotateSpeed;

        // Apply velocity
        if (!this.isDragging) {
            this.velocity.x *= this.damping;
            this.velocity.y *= this.damping;
        }
        this.cube.rotation.x += this.velocity.x;
        this.cube.rotation.y += this.velocity.y;

        // Gentle float
        this.cube.position.y = Math.sin(t * 0.8) * 0.05;

        // Particles
        for (const p of this.particles) {
            p.angle += p.speed * 0.008;
            p.mesh.position.x = Math.cos(p.angle) * p.radius;
            p.mesh.position.z = Math.sin(p.angle) * p.radius;
            p.mesh.position.y = p.yBase + Math.sin(t * p.speed + p.angle) * 0.2;
            p.mesh.material.opacity = 0.3 + 0.3 * Math.sin(t * 2 + p.angle);
        }

        this.renderer.render(this.scene, this.camera);
    }
}


/* ═══════════════════════════════════════
   3D LOADING HEART
   ═══════════════════════════════════════ */
class LoadingHeart3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.clock = new THREE.Clock();
        this.particles = [];

        const size = 260;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.set(0, 0.3, 3.2);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        this.scene.add(new THREE.AmbientLight(0xfff0f5, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.5);
        key.position.set(2, 3, 3);
        this.scene.add(key);
        const rim = new THREE.PointLight(0xff69b4, 1.2, 10);
        rim.position.set(-2, 1, 2);
        this.scene.add(rim);

        // Build 3D heart
        this._buildHeart();

        // Mini sparkle particles
        this._buildParticles();

        this.running = true;
        this._animate();
    }

    _buildHeart() {
        const shape = new THREE.Shape();
        const s = 1.2; // scale
        shape.moveTo(0, 0.35 * s);
        shape.bezierCurveTo(0, 0.35*s, -0.05*s, 0.25*s, -0.25*s, 0.25*s);
        shape.bezierCurveTo(-0.55*s, 0.25*s, -0.55*s, 0.525*s, -0.55*s, 0.525*s);
        shape.bezierCurveTo(-0.55*s, 0.65*s, -0.475*s, 0.775*s, -0.25*s, 0.85*s);
        shape.bezierCurveTo(-0.1*s, 0.9*s, 0, 1.0*s, 0, 1.0*s);
        shape.bezierCurveTo(0, 1.0*s, 0.1*s, 0.9*s, 0.25*s, 0.85*s);
        shape.bezierCurveTo(0.475*s, 0.775*s, 0.55*s, 0.65*s, 0.55*s, 0.525*s);
        shape.bezierCurveTo(0.55*s, 0.525*s, 0.55*s, 0.25*s, 0.25*s, 0.25*s);
        shape.bezierCurveTo(0.05*s, 0.25*s, 0, 0.35*s, 0, 0.35*s);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.08,
            bevelSegments: 6
        });
        geo.center();

        const mat = new THREE.MeshPhongMaterial({
            color: 0xff4081,
            shininess: 100,
            specular: 0xffcdd2,
            side: THREE.DoubleSide
        });

        this.heart = new THREE.Mesh(geo, mat);
        this.scene.add(this.heart);
    }

    _buildParticles() {
        const geo = new THREE.SphereGeometry(0.03, 6, 6);
        for (let i = 0; i < 20; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: [0xff69b4, 0xffb6c1, 0xffffff, 0xff1493][Math.floor(Math.random()*4)],
                transparent: true,
                opacity: 0.6
            });
            const p = new THREE.Mesh(geo, mat);
            const angle = Math.random() * Math.PI * 2;
            const r = 0.6 + Math.random() * 0.8;
            p.position.set(Math.cos(angle)*r, (Math.random()-0.5)*1.2, Math.sin(angle)*r);
            this.scene.add(p);
            this.particles.push({
                mesh: p,
                speed: 0.3 + Math.random() * 0.5,
                angle,
                radius: r,
                yBase: p.position.y
            });
        }
    }

    _animate() {
        if (!this.running) return;
        requestAnimationFrame(() => this._animate());

        const t = this.clock.getElapsedTime();

        // Heart: spin slowly + heartbeat pulse
        if (this.heart) {
            this.heart.rotation.y = t * 0.8;
            // Heartbeat: quick expand-contract cycle
            const beat = 1 + 0.12 * Math.pow(Math.sin(t * 3.5), 12);
            this.heart.scale.setScalar(beat);
        }

        // Particles orbit
        for (const p of this.particles) {
            p.angle += p.speed * 0.01;
            p.mesh.position.x = Math.cos(p.angle) * p.radius;
            p.mesh.position.z = Math.sin(p.angle) * p.radius;
            p.mesh.position.y = p.yBase + Math.sin(t * p.speed + p.angle) * 0.3;
            p.mesh.material.opacity = 0.3 + 0.4 * Math.sin(t * 2 + p.angle);
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.running = false;
        if (this.renderer) this.renderer.dispose();
    }
}


/* ═══════════════════════════════════════
   VALENTINE APP
   ═══════════════════════════════════════ */
class ValentineApp {
    constructor() {
        this.isLoaded = false;
        this.config = {
            emojis: {
                sparkles: ['✨', '💖', '⭐', '🌸'],
                petals: ['🌸', '🍃', '🤍', '💖']
            }
        };

        // Cute loading messages
        this.loadingMessages = [
            'Menyiapkan cinta... 💕',
            'Mengumpulkan bunga untukmu... 🌸',
            'Merangkai kata-kata manis... 🍬',
            'Menaburkan bintang cinta... ✨',
            'Membungkus hati ini untukmu... 🎁',
            'Mencuri senyummu... 😊',
            'Melipat origami hati... 💌',
            'Menghitung alasan mencintaimu... 💝',
            'Menyalakan lilin romantis... 🕯️',
            'Menulis surat cinta... ✉️',
            'Hampir siap sayang... 🥰',
        ];

        this._initLoader();
        this._initAtmosphere();
        this._initInteractions();
    }

    /* ── Loading Screen ── */
    _initLoader() {
        const loader  = document.getElementById('loading-screen');
        const bar     = document.getElementById('loading-bar');
        const msgEl   = document.getElementById('loading-msg');
        const pctEl   = document.getElementById('loading-percent');

        const totalMessages = this.loadingMessages.length; // 11
        const msgInterval   = 1500; // ms per message
        const minDuration   = totalMessages * msgInterval + 1000; // ~17.5s

        // Start 3D loading heart immediately
        this.loadingHeart = new LoadingHeart3D('loading-canvas');

        // Photo slideshow — cycle through photos
        const photos = document.querySelectorAll('.loading-photo');
        let currentPhoto = 0;

        const photoTick = setInterval(() => {
            photos[currentPhoto].classList.remove('active');
            currentPhoto = (currentPhoto + 1) % photos.length;
            photos[currentPhoto].classList.add('active');
        }, 3000);

        // Cycle cute messages — show every single one
        let msgIndex = 0;
        const msgTick = setInterval(() => {
            if (msgEl) {
                gsap.to(msgEl, {
                    opacity: 0, duration: 0.2,
                    onComplete: () => {
                        msgIndex++;
                        if (msgIndex < totalMessages) {
                            msgEl.textContent = this.loadingMessages[msgIndex];
                        }
                        gsap.to(msgEl, { opacity: 1, duration: 0.3 });
                    }
                });
            }
        }, msgInterval);

        // Animate progress bar — slow & steady to fill over minDuration
        let progress = 0;
        const maxBeforeDone = 95;
        const progressStep = maxBeforeDone / (minDuration / 300);
        const barTick = setInterval(() => {
            progress += progressStep * (0.8 + Math.random() * 0.4);
            if (progress > maxBeforeDone) progress = maxBeforeDone;
            if (bar) bar.style.width = progress + '%';
            if (pctEl) pctEl.textContent = Math.round(progress) + '%';
        }, 300);

        // Start 3D main bg early
        setTimeout(() => {
            this.bg3d = new Hearts3DBackground('bg-canvas');
        }, 100);

        // Wait for BOTH: window.load AND minimum duration
        let pageLoaded = false;
        let minTimeReached = false;

        const tryDismiss = () => {
            if (!pageLoaded || !minTimeReached) return;

            clearInterval(barTick);
            clearInterval(msgTick);
            clearInterval(photoTick);
            if (bar) bar.style.width = '100%';
            if (pctEl) pctEl.textContent = '100%';
            if (msgEl) msgEl.textContent = 'Siap! Untukmu, sayang 🥰';

            // Fade out loader
            gsap.to(loader, {
                opacity: 0,
                duration: 0.8,
                delay: 0.8,
                ease: 'power2.inOut',
                onComplete: () => {
                    loader.style.display = 'none';
                    if (this.loadingHeart) this.loadingHeart.destroy();
                    this.isLoaded = true;
                    // Init photo cube
                    this.photoCube = new PhotoCube3D('cube-canvas');
                    this._startEntrance();
                }
            });
        };

        window.addEventListener('load', () => {
            pageLoaded = true;
            tryDismiss();
        });

        setTimeout(() => {
            minTimeReached = true;
            tryDismiss();
        }, minDuration);
    }

    /* ── Entrance Animation ── */
    _startEntrance() {
        // Elements already hidden via CSS (opacity:0, translateY:40px)
        // Just animate them in directly
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

        tl.to('.title', { y: 0, opacity: 1 })
          .to('.cube-wrapper', {
              y: 0, opacity: 1, scale: 1,
              duration: 1.4,
              ease: 'elastic.out(1, 0.6)'
          }, '-=0.6')
          .to('.btn-container', {
              y: 0, opacity: 1,
              ease: 'back.out(1.7)'
          }, '-=0.9')
          .to('.love-note', {
              y: 0, opacity: 1
          }, '-=0.7');

        // Button pulse
        gsap.to('.flower-btn', {
            scale: 1.05,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    /* ── Atmosphere (sparkle trail, petal rain) ── */
    _initAtmosphere() {
        const emojis = this.config.emojis;

        // Sparkle trail on mouse/touch
        const trail = (e) => {
            if (!this.isLoaded) return;
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            if (x && y && Math.random() > 0.75) {
                this._particle(x, y, 'sparkle-particle', emojis.sparkles);
            }
        };
        window.addEventListener('mousemove', trail);
        window.addEventListener('touchmove', trail);

        // Petal rain (less frequent, handled by 3D now)
        setInterval(() => {
            if (!this.isLoaded) return;
            this._petal();
        }, 3000);
    }

    _particle(x, y, cls, set) {
        const p = document.createElement('div');
        p.className = cls;
        p.textContent = set[Math.floor(Math.random() * set.length)];
        p.style.left = x + 'px';
        p.style.top  = y + 'px';
        document.body.appendChild(p);

        gsap.to(p, {
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 120,
            opacity: 0,
            scale: 0.2,
            rotation: Math.random() * 360,
            duration: 0.8 + Math.random() * 0.5,
            ease: 'power2.out',
            onComplete: () => p.remove()
        });
    }

    _petal() {
        const p = document.createElement('div');
        p.className = 'petal-particle';
        p.textContent = this.config.emojis.petals[Math.floor(Math.random() * this.config.emojis.petals.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = '-30px';
        document.body.appendChild(p);

        gsap.to(p, {
            y: window.innerHeight + 60,
            x: '+=' + (Math.random() * 200 - 100),
            rotation: Math.random() * 720,
            duration: 6 + Math.random() * 5,
            ease: 'none',
            onComplete: () => p.remove()
        });
    }

    /* ── Interactions ── */
    _initInteractions() {
        // Photo cube handles its own drag interaction
        // Just add click sparkle on the page
        document.addEventListener('click', (e) => {
            if (!this.isLoaded) return;
            this._particle(e.clientX, e.clientY, 'sparkle-particle', ['❤️', '💖', '✨']);
        });
    }
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ValentineApp();
});
