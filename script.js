// script.js - fully self-contained, no syntax errors
document.addEventListener("DOMContentLoaded", function () {
  /* -------------------------
       Helper: safe query
       ------------------------- */
  function q(sel, parent) {
    return (parent || document).querySelector(sel);
  }
  function qa(sel, parent) {
    return Array.from((parent || document).querySelectorAll(sel));
  }

  /* -------------------------
       Navbar scroll effect
       ------------------------- */
  const header = q(".header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollHeader);
  onScrollHeader();

  /* -------------------------
       Smooth scroll for anchors (account header height)
       ------------------------- */
  qa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 80;
      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        8;
      window.scrollTo({ top, behavior: "smooth" });

      // update active nav link
      qa(".navbar-nav .nav-link").forEach((n) => n.classList.remove("active"));
      if (this.classList) this.classList.add("active");
    });
  });

  /* -------------------------
       Hero slider
       ------------------------- */
  const slides = qa(".slide");
  let currentSlide = 0;
  if (slides.length) {
    function showSlide(index) {
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
    }
    showSlide(0);
    setInterval(function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  /* -------------------------
       Service items: hover gradient & click show only selected detail
       ------------------------- */
  const featureItems = qa(".feature-item");
  const featureDetails = qa(".feature-detail");
  featureDetails.forEach((fd) => fd.classList.remove("active"));
  featureItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.classList.add("hovered");
    });
    item.addEventListener("mouseleave", function () {
      this.classList.remove("hovered");
    });
    item.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        this.click();
      }
    });
    item.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      if (!targetId) return;
      featureItems.forEach((fi) => fi.classList.remove("selected"));
      featureDetails.forEach((fd) => fd.classList.remove("active"));
      this.classList.add("selected");
      const detail = document.getElementById(targetId);
      if (detail) detail.classList.add("active");
      setTimeout(function () {
        const headerHeight = header ? header.offsetHeight : 80;
        const top =
          detail.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          12;
        window.scrollTo({ top, behavior: "smooth" });
      }, 150);
    });
  });

  /* -------------------------
       Menu category filtering with smooth show/hide
       ------------------------- */
  const categoryButtons = qa(".category-btn");
  const menuItems = qa(".menu-item");
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = this.getAttribute("data-category") || "all";
      categoryButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      menuItems.forEach((item) => {
        const itemCat = item.getAttribute("data-category") || "";
        if (cat === "all" || itemCat === cat) {
          item.style.display = "block";
          item.style.opacity = "0";
          item.style.transform = "translateY(6px)";
          setTimeout(() => {
            item.style.transition = "opacity 300ms ease, transform 300ms ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, 40);
        } else {
          item.style.transition = "opacity 300ms ease, transform 300ms ease";
          item.style.opacity = "0";
          item.style.transform = "translateY(12px)";
          setTimeout(() => {
            item.style.display = "none";
          }, 320);
        }
      });
    });
  });

  /* -------------------------
       Menu card hover: visual upgrade
       ------------------------- */
  qa(".menu-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-6px)";
      this.style.boxShadow = "0 18px 40px rgba(12,30,18,0.12)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
      this.style.boxShadow = "";
    });
  });


    /* -------------------------
   Testimonials slider
------------------------- */
  const testimonialViewport = q(".testimonial-viewport");
  const testimonialTrack = q(".testimonial-track");
  const testimonialItems = qa(".testimonial-item");
  const prevBtn = q(".prev-btn");
  const nextBtn = q(".next-btn");

  let currentTestimonial = 0;

  function updateTestimonialPosition() {
    if (
      !testimonialTrack ||
      testimonialItems.length === 0 ||
      !testimonialViewport
    )
      return;
    const viewportWidth = testimonialViewport.clientWidth;
    const itemWidth =
      testimonialItems[0].offsetWidth +
      parseFloat(getComputedStyle(testimonialItems[0]).marginRight || 16);
    const maxIndex = Math.max(
      0,
      testimonialItems.length - Math.floor(viewportWidth / itemWidth)
    );
    if (currentTestimonial > maxIndex) currentTestimonial = maxIndex;
    testimonialTrack.style.transform = `translateX(-${
      currentTestimonial * itemWidth
    }px)`;
    testimonialTrack.style.transition = "transform 0.3s ease";
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      currentTestimonial = Math.max(0, currentTestimonial - 1);
      updateTestimonialPosition();
    });

  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      const maxIndex = Math.max(0, testimonialItems.length - 1);
      currentTestimonial = Math.min(maxIndex, currentTestimonial + 1);
      updateTestimonialPosition();
    });

  window.addEventListener("resize", updateTestimonialPosition);
  updateTestimonialPosition();
});

document.addEventListener("DOMContentLoaded", function () {
 

  // Menu category filter (if your original script has this, this will complement it)
  qa(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = this.dataset.category || "all";
      qa(".category-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      qa(".menu-item").forEach((item) => {
        const icat = item.dataset.category || "";
        if (cat === "all" || icat === cat) {
          item.style.display = "block";
          item.style.opacity = "1";
        } else {
          item.style.display = "none";
          item.style.opacity = "0";
        }
      });
    });
  });

  // Accessibility: close sidebar on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
      if (addModal) addModal.hide();
    }
  });

  // If you have active nav script in script.js it will keep working
});

console.log("Testimonial page loaded");