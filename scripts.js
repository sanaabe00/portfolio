// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero intro
gsap.to(".site-header", { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2 });
gsap.to(".hero-text", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.4 });
gsap.to(".hero-visual", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.8 });

// Scroll reveals
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  });
});

// Footer fade
gsap.to(".site-footer", {
  scrollTrigger: {
    trigger: ".site-footer",
    start: "top 90%",
  },
  opacity: 1,
  y: 0,
  duration: 1,
  ease: "power2.out"
});
