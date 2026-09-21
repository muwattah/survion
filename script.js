/* SURVION ONEGEAR */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.innerWidth < 768 || "ontouchstart" in window;

  function initLoader() {
    const loader = document.getElementById("loader");
    document.body.classList.add("loading");
    const minTime = prefersReduced ? 400 : 2400;
    const start = performance.now();
    function finish() {
      const wait = Math.max(0, minTime - (performance.now() - start));
      setTimeout(() => {
        loader.classList.add("done");
        document.body.classList.remove("loading");
        initHeroEntrance();
      }, wait);
    }
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
  }

  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.querySelector(".nav-links");
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 40), { passive: true });
    if (toggle && links) {
      toggle.addEventListener("click", () => links.classList.toggle("open"));
      links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
    }
  }

  function initHeroEntrance() {
    if (prefersReduced || typeof gsap === "undefined") return;
    gsap.from(".hero-title .line", { y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.1 });
    gsap.from(".hero-kicker, .hero-sub", { y: 24, opacity: 0, duration: 0.8, delay: 0.35, ease: "power2.out" });
    gsap.from(".hero-product-stage", { y: 40, opacity: 0, scale: 0.94, duration: 1.1, delay: 0.2, ease: "power3.out" });
    gsap.from(".hero-ctas", { y: 20, opacity: 0, duration: 0.7, delay: 0.55, ease: "power2.out" });
  }

  function initHeroParallax() {
    if (prefersReduced) return;
    const layers = document.querySelectorAll(".hero-bg .layer, .hero-product");
    let mx = 0, my = 0, cx = 0, cy = 0;
    if (!isMobile()) {
      window.addEventListener("mousemove", (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    } else {
      let t = 0;
      (function drift() { t += 0.004; mx = Math.sin(t) * 0.3; my = Math.cos(t * 0.7) * 0.15; requestAnimationFrame(drift); })();
    }
    (function animate() {
      cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || 0.05);
        layer.style.transform = `translate3d(${cx * speed * 36}px, ${cy * speed * 28}px, 0)`;
      });
      requestAnimationFrame(animate);
    })();
  }

  function initEmbers() {
    const canvas = document.getElementById("embers");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let particles = [], w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    function spawn() {
      particles = [];
      for (let i = 0; i < (isMobile() ? 16 : 32); i++) {
        particles.push({ x: w * 0.28 + Math.random() * w * 0.12, y: h * 0.72 + Math.random() * 30, vx: (Math.random() - 0.5) * 0.4, vy: -0.6 - Math.random() * 1.2, life: Math.random(), size: 1 + Math.random() * 2, color: Math.random() > 0.5 ? "255,140,40" : "255,200,80" });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.004;
        if (p.life <= 0 || p.y < h * 0.3) { p.x = w * 0.28 + Math.random() * w * 0.12; p.y = h * 0.72 + Math.random() * 20; p.life = 0.6 + Math.random() * 0.4; p.vy = -0.6 - Math.random() * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(${p.color},${p.life * 0.85})`; ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize(); spawn(); tick();
    window.addEventListener("resize", () => { resize(); spawn(); });
  }

  function initReveal() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    const section = document.getElementById("reveal");
    if (!section) return;
    const dark = section.querySelector(".reveal-dark");
    const beam = document.getElementById("revealBeam");
    const product = section.querySelector(".reveal-product-wrap");
    const copy = section.querySelector(".reveal-copy");
    ScrollTrigger.create({
      trigger: section, start: "top top", end: "bottom bottom", scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        if (dark) dark.style.opacity = String(Math.max(0, 1 - p * 1.35));
        if (beam) {
          const beamP = Math.min(1, Math.max(0, (p - 0.08) / 0.45));
          beam.style.transform = `translateX(${-100 + beamP * 200}%)`;
          beam.style.opacity = String(p < 0.6 ? Math.min(1, beamP * 1.5) : Math.max(0, 1 - (p - 0.6) * 3));
        }
        if (product) {
          const vis = Math.min(1, Math.max(0, (p - 0.12) / 0.4));
          product.style.opacity = String(vis);
          product.style.transform = `scale(${0.92 + vis * 0.08})`;
        }
        if (copy) {
          const c = Math.min(1, Math.max(0, (p - 0.62) / 0.25));
          copy.style.opacity = String(c);
          copy.style.transform = `translateY(${(1 - c) * 30}px)`;
        }
      },
    });
  }

  function initProductSection() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    document.querySelectorAll(".pf").forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: "#product", start: `top+=${20 + i * 10}% center`, toggleActions: "play none none reverse" } });
    });
    const img = document.getElementById("productLarge");
    if (img && !prefersReduced) {
      gsap.to(img, { y: -20, rotateY: 8, rotateX: -4, scrollTrigger: { trigger: "#product", start: "top bottom", end: "bottom top", scrub: 1 } });
    }
  }

  function initFlashlight() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    const section = document.getElementById("flashlight");
    const beam = document.getElementById("beam");
    const overlay = section && section.querySelector(".dark-overlay");
    const copy = section && section.querySelector(".flashlight-copy");
    if (!section || !beam) return;
    ScrollTrigger.create({
      trigger: section, start: "top 60%", end: "center center", scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (overlay) overlay.style.opacity = String(1 - p * 0.85);
        beam.style.opacity = String(Math.min(1, p * 1.4));
        if (copy) {
          copy.style.opacity = String(Math.max(0, (p - 0.35) * 2));
          copy.style.transform = `translateY(${(1 - Math.max(0, (p - 0.35) * 2)) * 24}px)`;
        }
      },
    });
    initDust();
  }

  function initDust() {
    const canvas = document.getElementById("dust");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let particles = [], w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    function spawn() {
      particles = [];
      for (let i = 0; i < (isMobile() ? 18 : 40); i++) {
        particles.push({ x: w * 0.3 + Math.random() * w * 0.4, y: h * 0.25 + Math.random() * h * 0.55, r: 0.6 + Math.random() * 1.4, a: Math.random() * 0.35, vy: -0.15 - Math.random() * 0.25 });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy; p.a *= 0.998;
        if (p.y < h * 0.15 || p.a < 0.02) { p.y = h * 0.7 + Math.random() * 40; p.a = 0.15 + Math.random() * 0.25; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,230,180,${p.a})`; ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize(); spawn(); tick();
    window.addEventListener("resize", () => { resize(); spawn(); });
  }

  function initPower() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    const counter = document.getElementById("mahCounter");
    if (!counter) return;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: "#power", start: "top 65%", once: true,
      onEnter: () => {
        gsap.to(obj, { val: 5000, duration: prefersReduced ? 0.5 : 2, ease: "power2.out", onUpdate: () => { counter.textContent = Math.round(obj.val).toLocaleString(); } });
      },
    });
  }

  function initFire() {
    const canvas = document.getElementById("fireCanvas");
    const section = document.getElementById("fire");
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    let particles = [], active = false, w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    function spawnFlame() {
      particles = [];
      for (let i = 0; i < (isMobile() ? 35 : 70); i++) {
        particles.push({ x: w * 0.5 + (Math.random() - 0.5) * 50, y: h * 0.72, vx: (Math.random() - 0.5) * 1.2, vy: -1.5 - Math.random() * 3, life: 0.4 + Math.random() * 0.6, size: 3 + Math.random() * 8, type: Math.random() > 0.7 ? "ember" : "flame" });
      }
    }
    function tick() {
      if (!active && !particles.length) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, w, h);
      if (active) {
        const g = ctx.createRadialGradient(w * 0.5, h * 0.72, 0, w * 0.5, h * 0.72, 120);
        g.addColorStop(0, "rgba(255,120,20,0.35)"); g.addColorStop(0.4, "rgba(232,93,4,0.12)"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.012; p.size *= 0.985;
        if (p.life <= 0) {
          if (active) { p.x = w * 0.5 + (Math.random() - 0.5) * 50; p.y = h * 0.72; p.vy = -1.5 - Math.random() * 3; p.life = 0.5 + Math.random() * 0.5; p.size = 3 + Math.random() * 8; }
          else { particles.splice(i, 1); return; }
        }
        const alpha = Math.max(0, p.life);
        if (p.type === "ember") { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size * 0.3), 0, Math.PI * 2); ctx.fillStyle = `rgba(255,180,60,${alpha})`; ctx.fill(); }
        else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255,220,100,${alpha})`); grad.addColorStop(0.4, `rgba(255,100,20,${alpha * 0.7})`); grad.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        }
      });
      requestAnimationFrame(tick);
    }
    resize(); tick(); window.addEventListener("resize", resize);
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: section, start: "top 55%", end: "bottom 40%",
        onEnter: () => { active = true; spawnFlame(); },
        onLeave: () => { active = false; },
        onEnterBack: () => { active = true; spawnFlame(); },
        onLeaveBack: () => { active = false; },
      });
      gsap.from("#fire .fire-copy", { scrollTrigger: { trigger: section, start: "top 50%", toggleActions: "play none none reverse" }, y: 40, opacity: 0, duration: 1, ease: "power2.out" });
    }
  }

  function initFeatures() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    document.querySelectorAll(".flabel").forEach((label, i) => {
      gsap.to(label, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: "#experience", start: `top+=${12 + i * 12}% center`, toggleActions: "play none none reverse" } });
    });
    const wrap = document.getElementById("featProduct");
    if (wrap && !prefersReduced) {
      gsap.to(wrap, { rotateY: 10, rotateX: -5, scrollTrigger: { trigger: "#experience", start: "top top", end: "bottom bottom", scrub: 1 } });
    }
  }

  function initWild() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || prefersReduced) return;
    gsap.to(".wild-forest", { y: -40, scrollTrigger: { trigger: "#wild", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".wild-text h2", { y: -24, scrollTrigger: { trigger: "#wild", start: "top bottom", end: "bottom top", scrub: true } });
  }

  function initStats() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    document.querySelectorAll(".stat-num").forEach((el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 85%", once: true,
        onEnter: () => gsap.to(obj, { val: target, duration: prefersReduced ? 0.4 : 1.5, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(obj.val); } }),
      });
    });
  }

  function initFinalEmbers() {
    const canvas = document.getElementById("finalEmbers");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let particles = [], w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    function spawn() {
      particles = [];
      for (let i = 0; i < (isMobile() ? 12 : 24); i++) {
        particles.push({ x: w * 0.35 + Math.random() * w * 0.3, y: h * 0.75 + Math.random() * 40, vx: (Math.random() - 0.5) * 0.3, vy: -0.4 - Math.random() * 0.8, life: Math.random(), size: 1 + Math.random() * 1.8 });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.003;
        if (p.life <= 0) { p.y = h * 0.78; p.life = 0.5 + Math.random() * 0.5; p.vy = -0.4 - Math.random() * 0.8; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,160,50,${p.life * 0.7})`; ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize(); spawn(); tick();
    window.addEventListener("resize", () => { resize(); spawn(); });
  }

  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#") return;
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" }); }
      });
    });
  }

  function boot() {
    initLoader();
    initNav();
    initAnchors();
    function whenReady() {
      if (typeof gsap === "undefined") { setTimeout(whenReady, 50); return; }
      gsap.registerPlugin(ScrollTrigger);
      initHeroParallax();
      initEmbers();
      initReveal();
      initProductSection();
      initFlashlight();
      initPower();
      initFire();
      initFeatures();
      initWild();
      initStats();
      initFinalEmbers();
    }
    whenReady();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
