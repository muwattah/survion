/* ============================================
   PORODO ONEGEAR — Cinematic Demo Scripts
   GSAP + ScrollTrigger + Canvas effects
   ============================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.innerWidth < 768 || "ontouchstart" in window;

  // ---------- LOADER ----------
  function initLoader() {
    const loader = document.getElementById("loader");
    document.body.classList.add("loading");

    const minTime = prefersReduced ? 400 : 2600;
    const start = performance.now();

    function finish() {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minTime - elapsed);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.classList.remove("loading");
        initHeroEntrance();
      }, wait);
    }

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
  }

  // ---------- NAV ----------
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.querySelector(".nav-links");

    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true }
    );

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        links.classList.toggle("open");
      });
      links.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => links.classList.remove("open"));
      });
    }
  }

  // ---------- HERO PARALLAX + ENTRANCE ----------
  function initHeroEntrance() {
    if (prefersReduced || typeof gsap === "undefined") return;

    gsap.from(".hero-title .line", {
      y: 60,
      opacity: 0,
      duration: 1.1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.15,
    });
    gsap.from(".hero-sub", { y: 30, opacity: 0, duration: 0.9, delay: 0.45, ease: "power2.out" });
    gsap.from(".hero-ctas", { y: 24, opacity: 0, duration: 0.8, delay: 0.65, ease: "power2.out" });
    gsap.from(".product-hero", { y: 40, opacity: 0, scale: 0.92, duration: 1.2, delay: 0.2, ease: "power3.out" });
    gsap.from(".scroll-hint", { opacity: 0, duration: 1, delay: 1.2 });
  }

  function initHeroParallax() {
    if (prefersReduced) return;

    const layers = document.querySelectorAll(".hero-bg .layer, .product-hero");
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    if (!isMobile()) {
      window.addEventListener(
        "mousemove",
        (e) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );
    } else {
      // subtle automatic drift on mobile
      let t = 0;
      function drift() {
        t += 0.004;
        mouseX = Math.sin(t) * 0.35;
        mouseY = Math.cos(t * 0.7) * 0.2;
        requestAnimationFrame(drift);
      }
      requestAnimationFrame(drift);
    }

    function animate() {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;

      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || 0.05);
        const x = currentX * speed * 40;
        const y = currentY * speed * 30;
        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // ---------- EMBERS CANVAS (hero) ----------
  function initEmbers() {
    const canvas = document.getElementById("embers");
    if (!canvas || prefersReduced) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function spawn() {
      const count = isMobile() ? 18 : 36;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: w * 0.28 + Math.random() * w * 0.12,
          y: h * 0.72 + Math.random() * 30,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.6 - Math.random() * 1.2,
          life: Math.random(),
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.5 ? "255,140,40" : "255,200,80",
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.004;
        if (p.life <= 0 || p.y < h * 0.3) {
          p.x = w * 0.28 + Math.random() * w * 0.12;
          p.y = h * 0.72 + Math.random() * 20;
          p.life = 0.6 + Math.random() * 0.4;
          p.vy = -0.6 - Math.random() * 1.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.life * 0.85})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    spawn();
    tick();
    window.addEventListener("resize", () => {
      resize();
      spawn();
    });
  }

  // ---------- FLASHLIGHT SECTION ----------
  function initFlashlight() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById("flashlight");
    const beam = document.getElementById("beam");
    const overlay = section.querySelector(".dark-overlay");
    const copy = section.querySelector(".flashlight-copy");
    const lens = section.querySelector(".pm-lens");

    if (!section || !beam) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "center center",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (overlay) overlay.style.opacity = String(1 - p * 0.85);
        beam.style.opacity = String(Math.min(1, p * 1.4));
        if (copy) {
          copy.style.opacity = String(Math.max(0, (p - 0.35) * 2));
          copy.style.transform = `translateY(${(1 - Math.max(0, (p - 0.35) * 2)) * 24}px)`;
        }
        if (lens) {
          if (p > 0.25) lens.classList.add("active");
          else lens.classList.remove("active");
        }
      },
    });

    // beam follows cursor lightly
    if (!isMobile() && !prefersReduced) {
      section.addEventListener(
        "mousemove",
        (e) => {
          const rect = section.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
          const cone = beam.querySelector(".beam-cone");
          if (cone) cone.style.transform = `translate(calc(-50% + ${x}px), -20%)`;
        },
        { passive: true }
      );
    }

    initDust();
  }

  function initDust() {
    const canvas = document.getElementById("dust");
    if (!canvas || prefersReduced) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function spawn() {
      const n = isMobile() ? 20 : 45;
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: w * 0.3 + Math.random() * w * 0.4,
          y: h * 0.25 + Math.random() * h * 0.55,
          r: 0.6 + Math.random() * 1.4,
          a: Math.random() * 0.35,
          vy: -0.15 - Math.random() * 0.25,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy;
        p.a *= 0.998;
        if (p.y < h * 0.15 || p.a < 0.02) {
          p.y = h * 0.7 + Math.random() * 40;
          p.a = 0.15 + Math.random() * 0.25;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,230,180,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    spawn();
    tick();
    window.addEventListener("resize", () => {
      resize();
      spawn();
    });
  }

  // ---------- POWER SECTION ----------
  function initPower() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const counter = document.getElementById("mahCounter");
    const fill = document.getElementById("batteryFill");
    if (!counter) return;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: "#power",
      start: "top 65%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: 5000,
          duration: prefersReduced ? 0.5 : 2.2,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = Math.round(obj.val).toLocaleString();
          },
        });
        if (fill) {
          gsap.to(fill, {
            width: "100%",
            duration: prefersReduced ? 0.5 : 2.4,
            ease: "power2.inOut",
          });
        }
      },
    });
  }

  // ---------- FIRE SECTION ----------
  function initFire() {
    const canvas = document.getElementById("fireCanvas");
    const section = document.getElementById("fire");
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let active = false;
    let w, h;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function spawnFlame() {
      const n = isMobile() ? 40 : 80;
      particles = [];
      const cx = w * 0.5;
      const cy = h * 0.72;
      for (let i = 0; i < n; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 50,
          y: cy,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.5 - Math.random() * 3,
          life: 0.4 + Math.random() * 0.6,
          size: 3 + Math.random() * 8,
          type: Math.random() > 0.7 ? "ember" : "flame",
        });
      }
    }

    function tick() {
      if (!active && particles.length === 0) {
        requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, w, h);

      // glow base
      if (active) {
        const g = ctx.createRadialGradient(w * 0.5, h * 0.72, 0, w * 0.5, h * 0.72, 120);
        g.addColorStop(0, "rgba(255,120,20,0.35)");
        g.addColorStop(0.4, "rgba(232,93,4,0.12)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
        p.size *= 0.985;

        if (p.life <= 0) {
          if (active) {
            p.x = w * 0.5 + (Math.random() - 0.5) * 50;
            p.y = h * 0.72;
            p.vy = -1.5 - Math.random() * 3;
            p.life = 0.5 + Math.random() * 0.5;
            p.size = 3 + Math.random() * 8;
          } else {
            particles.splice(i, 1);
            return;
          }
        }

        const alpha = Math.max(0, p.life);
        if (p.type === "ember") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,180,60,${alpha})`;
          ctx.fill();
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255,220,100,${alpha})`);
          grad.addColorStop(0.4, `rgba(255,100,20,${alpha * 0.7})`);
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 40%",
        onEnter: () => {
          active = true;
          spawnFlame();
        },
        onLeave: () => {
          active = false;
        },
        onEnterBack: () => {
          active = true;
          spawnFlame();
        },
        onLeaveBack: () => {
          active = false;
        },
      });

      gsap.from("#fire .fire-copy", {
        scrollTrigger: {
          trigger: section,
          start: "top 50%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    }
  }

  // ---------- FEATURES STICKY ----------
  function initFeatures() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const labels = document.querySelectorAll(".flabel");
    const product = document.getElementById("productCenter");

    labels.forEach((label, i) => {
      gsap.to(label, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#features",
          start: `top+=${15 + i * 12}% center`,
          end: "+=10%",
          toggleActions: "play none none reverse",
        },
      });
    });

    if (product && !prefersReduced) {
      gsap.to(product.querySelector(".product-3d"), {
        rotateY: 12,
        rotateX: -6,
        scrollTrigger: {
          trigger: "#features",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }
  }

  // ---------- WILD PARALLAX ----------
  function initWild() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || prefersReduced) return;

    gsap.to(".wild-forest", {
      y: -40,
      scrollTrigger: {
        trigger: "#wild",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(".wild-text h2", {
      y: -30,
      scrollTrigger: {
        trigger: "#wild",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // ---------- CAMP HOTSPOTS ----------
  function initCamp() {
    const hotspots = document.querySelectorAll(".hotspot");
    hotspots.forEach((hs) => {
      hs.addEventListener("click", (e) => {
        e.stopPropagation();
        hotspots.forEach((h) => h.classList.remove("active"));
        hs.classList.add("active");
      });
    });
    document.addEventListener("click", () => {
      hotspots.forEach((h) => h.classList.remove("active"));
    });
  }

  // ---------- STATS COUNTERS ----------
  function initStats() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    document.querySelectorAll(".stat-num").forEach((el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: prefersReduced ? 0.4 : 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        },
      });
    });
  }

  // ---------- CTA ENTRANCE ----------
  function initCta() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.from(".cta-title", {
      scrollTrigger: { trigger: "#cta", start: "top 70%", toggleActions: "play none none reverse" },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".cta-sub", {
      scrollTrigger: { trigger: "#cta", start: "top 65%", toggleActions: "play none none reverse" },
      y: 30,
      opacity: 0,
      duration: 0.9,
      delay: 0.15,
      ease: "power2.out",
    });
    gsap.from(".cta-buttons", {
      scrollTrigger: { trigger: "#cta", start: "top 60%", toggleActions: "play none none reverse" },
      y: 24,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power2.out",
    });
  }

  // ---------- SMOOTH ANCHOR ----------
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#") return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
        }
      });
    });
  }

  // ---------- BOOT ----------
  function boot() {
    initLoader();
    initNav();
    initAnchors();

    // Wait for GSAP
    function whenReady() {
      if (typeof gsap === "undefined") {
        setTimeout(whenReady, 50);
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      initHeroParallax();
      initEmbers();
      initFlashlight();
      initPower();
      initFire();
      initFeatures();
      initWild();
      initCamp();
      initStats();
      initCta();
    }
    whenReady();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
