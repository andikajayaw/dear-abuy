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
          .to('.image-wrapper', {
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

    /* ── Interactions (tilt card) ── */
    _initInteractions() {
        const card = document.querySelector('.tilt-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -12;
            const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 12;

            gsap.to(card, {
                duration: 0.5,
                rotationX: rx,
                rotationY: ry,
                transformPerspective: 1200,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 1,
                rotationX: 0,
                rotationY: 0,
                ease: 'elastic.out(1, 0.4)',
                overwrite: 'auto'
            });
        });

        card.addEventListener('click', (e) => {
            this._particle(e.clientX, e.clientY, 'sparkle-particle', ['❤️', '💖', '✨']);
        });
    }
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ValentineApp();
});
