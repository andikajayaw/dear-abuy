/**
 * Valentine - Flower Gathering Game
 * 3D bouquet with Three.js — bouquet is always visible and grows as you gather
 */

/* ═══════════════════════════════════════
   3D BOUQUET (Three.js)
   ═══════════════════════════════════════ */
class Bouquet3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) { console.warn('No 3D container'); return; }

        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded');
            return;
        }

        try {
            const w = this.container.clientWidth  || 300;
            const h = this.container.clientHeight || 380;

            // Scene
            this.scene = new THREE.Scene();

            // Camera — front-on view centered on the bouquet
            this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
            this.camera.position.set(0, 0.5, 5);
            this.camera.lookAt(0, 0.3, 0);

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(w, h);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            // Lights
            this.scene.add(new THREE.AmbientLight(0xfff0f5, 1.0));

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
            keyLight.position.set(3, 6, 4);
            this.scene.add(keyLight);

            const fillLight = new THREE.PointLight(0xffb6c1, 0.8);
            fillLight.position.set(-3, 2, 3);
            this.scene.add(fillLight);

            // ── Build the vase ──
            this._buildVase();

            // ── Flowers group ──
            this.flowersGroup = new THREE.Group();
            this.scene.add(this.flowersGroup);

            // ── Stem lines group ──
            this.stemsGroup = new THREE.Group();
            this.scene.add(this.stemsGroup);

            // Resize
            window.addEventListener('resize', () => this._resize());

            // Animation loop
            this._animate();
            this.ready = true;
        } catch (err) {
            console.error('Bouquet3D error:', err);
        }
    }

    _buildVase() {
        // Main vase body (cylinder, wider at top)
        const vaseGeo = new THREE.CylinderGeometry(0.55, 0.35, 1.6, 20);
        const vaseMat = new THREE.MeshPhongMaterial({
            color: 0xe8a0b5,
            shininess: 120,
            specular: 0xffffff,
            transparent: true,
            opacity: 0.92
        });
        this.vase = new THREE.Mesh(vaseGeo, vaseMat);
        this.vase.position.y = -1.3;
        this.scene.add(this.vase);

        // Vase lip/rim (torus)
        const rimGeo = new THREE.TorusGeometry(0.56, 0.06, 12, 32);
        const rimMat = new THREE.MeshPhongMaterial({
            color: 0xd4758b,
            shininess: 80
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.8;
        this.vase.add(rim);

        // Vase base (small disc)
        const baseGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 20);
        const base = new THREE.Mesh(baseGeo, rimMat);
        base.position.y = -0.8;
        this.vase.add(base);

        // Decorative ribbon/bow on vase
        const ribbonGeo = new THREE.TorusGeometry(0.58, 0.04, 8, 32);
        const ribbonMat = new THREE.MeshPhongMaterial({ color: 0xff69b4, shininess: 60 });
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.rotation.x = Math.PI / 2;
        ribbon.position.y = 0.2;
        this.vase.add(ribbon);
    }

    addFlower(emoji) {
        if (!this.ready) return;

        // Create emoji → canvas → texture
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = 128;
        const ctx = cvs.getContext('2d');
        ctx.font = '92px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 64, 64);

        const tex = new THREE.CanvasTexture(cvs);
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: tex })
        );

        // Position flowers in a dome arrangement above the vase
        const angle  = Math.random() * Math.PI * 2;
        const radius = 0.15 + Math.random() * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.2 + Math.random() * 1.0;

        sprite.position.set(x, y, z);
        sprite.scale.set(0.01, 0.01, 0.01);
        this.flowersGroup.add(sprite);

        // "Stem" line from vase mouth (y≈0) to flower
        const stemMat = new THREE.LineBasicMaterial({ color: 0x4a8c3f, linewidth: 2 });
        const stemGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x * 0.3, -0.5, z * 0.3),
            new THREE.Vector3(x, y - 0.15, z)
        ]);
        const stem = new THREE.Line(stemGeo, stemMat);
        this.stemsGroup.add(stem);

        // Pop-in animation
        gsap.to(sprite.scale, {
            x: 1.0, y: 1.0, z: 1.0,
            duration: 0.6,
            ease: 'elastic.out(1,0.5)'
        });

        // Gentle swaying
        gsap.to(sprite.position, {
            y: y + 0.1,
            duration: 1.5 + Math.random() * 1.5,
            repeat: -1, yoyo: true,
            ease: 'sine.inOut'
        });
    }

    _resize() {
        if (!this.renderer) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        // Slow rotation so user can see the bouquet from all angles
        if (this.flowersGroup) this.flowersGroup.rotation.y += 0.004;
        if (this.stemsGroup)   this.stemsGroup.rotation.y   += 0.004;
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }
}


/* ═══════════════════════════════════════
   FLOWER GAME
   ═══════════════════════════════════════ */
class FlowerGame {
    constructor() {
        this.TOTAL    = 10;
        this.TYPES    = ['🌷','🌹','🌻','🌸','🌺','🌼'];
        this.gathered = 0;
        this.flowers  = [];

        this.field     = document.getElementById('flower-field');
        this.counter   = document.getElementById('counter');
        this.winBanner = document.getElementById('win-banner');
        this.bouquetEl = document.getElementById('bouquet-area');

        // Initialize 3D bouquet
        this.bouquet = new Bouquet3D('bouquet-3d-container');

        this._createFlowers();
        this._entrance();
    }

    /* ---------- Create clickable flowers ---------- */
    _createFlowers() {
        if (!this.field) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        const placed = [];

        // Safe zone: header ~130px top, bouquet ~400px from bottom
        const minY = 140;
        const maxY = Math.max(minY + 80, H - 400);

        for (let i = 0; i < this.TOTAL; i++) {
            const emoji = this.TYPES[Math.floor(Math.random() * this.TYPES.length)];
            const el = document.createElement('div');
            el.className = 'flower-item';
            el.textContent = emoji;

            let x, y, ok, tries = 0;
            do {
                ok = true;
                x = 20 + Math.random() * (W - 70);
                y = minY + Math.random() * (maxY - minY);
                for (const p of placed) {
                    if (Math.hypot(x - p.x, y - p.y) < 70) { ok = false; break; }
                }
                // Avoid center-bottom (bouquet area)
                if (Math.abs(x - W/2) < 160 && y > H - 420) ok = false;
                tries++;
            } while (!ok && tries < 120);

            placed.push({ x, y });
            el.style.left = x + 'px';
            el.style.top  = y + 'px';

            gsap.set(el, { scale: 0, opacity: 0 });

            el.addEventListener('click',     () => this._gather(el, emoji));
            el.addEventListener('touchstart', (e) => { e.preventDefault(); this._gather(el, emoji); }, { passive: false });

            this.field.appendChild(el);
            this.flowers.push(el);
        }
    }

    /* ---------- Entrance ---------- */
    _entrance() {
        gsap.fromTo('.main-title',
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        );
        gsap.fromTo('.sub-title',
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out' }
        );
        gsap.fromTo('#counter',
            { opacity: 0 },
            { opacity: 1, duration: 0.5, delay: 0.3 }
        );
        gsap.fromTo('.bouquet-area',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power2.out' }
        );

        this.flowers.forEach((f, i) => {
            gsap.to(f, {
                scale: 1, opacity: 1,
                duration: 0.45,
                delay: 0.5 + i * 0.06,
                ease: 'back.out(2)'
            });
        });
    }

    /* ---------- Gather ---------- */
    _gather(el, emoji) {
        if (el.dataset.gathered) return;
        el.dataset.gathered = '1';
        gsap.killTweensOf(el);

        const rect   = el.getBoundingClientRect();
        const target = this.bouquetEl.getBoundingClientRect();
        const dx = (target.left + target.width / 2)  - (rect.left + rect.width / 2);
        const dy = (target.top  + target.height * 0.3) - (rect.top  + rect.height / 2);

        gsap.to(el, {
            x: dx, y: dy,
            scale: 0.15, opacity: 0,
            rotation: 360,
            duration: 0.6,
            ease: 'power2.in',
            onComplete: () => {
                el.remove();
                this.gathered++;
                this._updateCounter();
                if (this.bouquet) this.bouquet.addFlower(emoji);
                if (this.gathered >= this.TOTAL) {
                    setTimeout(() => this._win(), 400);
                }
            }
        });
    }

    _updateCounter() {
        if (this.counter) {
            this.counter.textContent = `${this.gathered} / ${this.TOTAL} flowers`;
        }
    }

    /* ---------- Win ---------- */
    _win() {
        // 1. Expand the 3D bouquet to center of screen
        this.bouquetEl.classList.add('showcase');

        // 2. Resize Three.js renderer after CSS transition
        setTimeout(() => {
            if (this.bouquet && this.bouquet._resize) this.bouquet._resize();
        }, 900);

        // 3. Hide header and counter
        gsap.to('#header-text', { opacity: 0, y: -30, duration: 0.5 });
        gsap.to('#counter',     { opacity: 0, duration: 0.4 });

        // 4. Show win banner at top
        const banner = this.winBanner;
        if (banner) {
            banner.classList.add('show');
            gsap.to(banner, { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' });
        }

        // 5. Confetti celebration
        this._confetti();
    }

    _confetti() {
        const emojis = ['❤️','💖','💝','🌸','✨','💗','💕','🌷','🌹'];
        for (let i = 0; i < 60; i++) {
            const s = document.createElement('div');
            s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            s.style.cssText = `position:fixed;top:-50px;left:${Math.random()*100}vw;font-size:${1+Math.random()*1.8}rem;z-index:3000;pointer-events:none;`;
            document.body.appendChild(s);
            gsap.to(s, {
                y: window.innerHeight + 80,
                x: `+=${(Math.random()-0.5)*300}`,
                rotation: Math.random() * 720,
                duration: 2.5 + Math.random() * 3,
                delay: Math.random() * 2.5,
                ease: 'none',
                onComplete: () => s.remove()
            });
        }
    }
}

/* ── Start ── */
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FlowerGame();
});
