gsap.registerPlugin(ScrollTrigger);

// Hero + header load
gsap.to(".site-header", { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
gsap.to(".hero-text", { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: "power3.out" });
gsap.to(".hero-visual", { opacity: 1, y: 0, duration: 1.2, delay: 0.6, ease: "power3.out" });

// Fade-in cards & sections
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: "top 85%" },
    opacity: 1, y: 0, duration: 1, ease: "power3.out"
  });
});

// Footer fade
gsap.to(".site-footer", {
  scrollTrigger: { trigger: ".site-footer", start: "top 95%" },
  opacity: 1, y: 0, duration: 1
});

// --- PARALLAX EFFECTS ---
// Background images
gsap.utils.toArray(".parallax-bg").forEach((bg) => {
  gsap.to(bg, {
    y: "-20%", // move upward while scrolling
    ease: "none",
    scrollTrigger: {
      trigger: bg.parentNode,
      scrub: true // smooth
    }
  });
});

// Hero text subtle parallax
gsap.to(".hero-text h1", {
  yPercent: 15,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

// Hero 3D canvas parallax
gsap.to("#c", {
  yPercent: -10,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});
