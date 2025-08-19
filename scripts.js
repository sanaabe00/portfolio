gsap.registerPlugin(ScrollTrigger);

// Header + Hero load
gsap.to(".site-header", { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
gsap.to(".hero-text", { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: "power3.out" });
gsap.to(".hero-visual", { opacity: 1, y: 0, duration: 1.2, delay: 0.6, ease: "power3.out" });

// Scroll reveals
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
